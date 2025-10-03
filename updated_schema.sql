-- Updated schema with RNG seeds and game IDs
CREATE TABLE IF NOT EXISTS public.game_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  game_type text NOT NULL,
  wager_amount numeric(20, 9) NOT NULL,
  payout_amount numeric(20, 9) NOT NULL,
  multiplier numeric(10, 2) NOT NULL,
  result text NOT NULL,
  rng_seed text NOT NULL DEFAULT '',
  client_seed text NOT NULL DEFAULT '',
  nonce integer NOT NULL DEFAULT 0,
  game_id text NOT NULL DEFAULT '',
  transaction_signature text NOT NULL DEFAULT '',
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT game_results_pkey PRIMARY KEY (id),
  CONSTRAINT game_results_wallet_address_fkey FOREIGN KEY (wallet_address) REFERENCES profiles (wallet_address) ON DELETE CASCADE,
  CONSTRAINT game_results_result_check CHECK ((result = ANY (ARRAY['win'::text, 'lose'::text])))
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_wallet_address ON public.game_results USING btree (wallet_address) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON public.game_results USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON public.game_results USING btree (game_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_result ON public.game_results USING btree (result) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_multiplier ON public.game_results USING btree (multiplier) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_rng_seed ON public.game_results USING btree (rng_seed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_client_seed ON public.game_results USING btree (client_seed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON public.game_results USING btree (game_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_transaction_signature ON public.game_results USING btree (transaction_signature) TABLESPACE pg_default;

-- Trigger for automatic stats updates
CREATE TRIGGER IF NOT EXISTS update_user_stats_trigger
  AFTER INSERT ON game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_game();

-- Enable Row Level Security
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own game results" ON public.game_results
  FOR SELECT USING (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Users can insert their own game results" ON public.game_results
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);

-- Allow service role to do everything (for backend operations)
CREATE POLICY "Service role can do everything" ON public.game_results
  FOR ALL USING (auth.role() = 'service_role');
