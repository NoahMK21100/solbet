-- ========================================
-- CORRECTED & OPTIMIZED SCHEMA
-- ========================================

-- 1. First, add missing columns to game_results table
ALTER TABLE public.game_results 
ADD COLUMN IF NOT EXISTS rng_seed text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_seed text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS nonce integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS game_id text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS transaction_signature text NOT NULL DEFAULT '';

-- 2. Create additional indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON public.game_results USING btree (game_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_result ON public.game_results USING btree (result) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_multiplier ON public.game_results USING btree (multiplier) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_rng_seed ON public.game_results USING btree (rng_seed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_client_seed ON public.game_results USING btree (client_seed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON public.game_results USING btree (game_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_game_results_transaction_signature ON public.game_results USING btree (transaction_signature) TABLESPACE pg_default;

-- 3. Create the stats update function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_user_stats_from_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table with aggregated stats
  UPDATE profiles 
  SET 
    total_bets = COALESCE(total_bets, 0) + 1,
    total_won = COALESCE(total_won, 0) + NEW.payout_amount,
    total_wagered = COALESCE(total_wagered, 0) + NEW.wager_amount,
    total_winnings = COALESCE(total_winnings, 0) + NEW.payout_amount,
    games_played = COALESCE(games_played, 0) + 1,
    net_profit = COALESCE(net_profit, 0) + (NEW.payout_amount - NEW.wager_amount),
    biggest_win = GREATEST(COALESCE(biggest_win, 0), NEW.payout_amount),
    luckiest_win_multiplier = GREATEST(COALESCE(luckiest_win_multiplier, 0), NEW.multiplier),
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE wallet_address = NEW.wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop the existing trigger if it exists, then recreate it (PostgreSQL doesn't support IF NOT EXISTS for triggers)
DROP TRIGGER IF EXISTS update_user_stats_trigger ON game_results;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_game();

-- 5. Enable Row Level Security (if not already enabled)
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own game results" ON public.game_results;
DROP POLICY IF EXISTS "Users can insert their own game results" ON public.game_results;
DROP POLICY IF EXISTS "Service role can do everything" ON public.game_results;

CREATE POLICY "Users can view their own game results" ON public.game_results
  FOR SELECT USING (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Users can insert their own game results" ON public.game_results
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);

-- Allow service role to do everything (for backend operations)
CREATE POLICY "Service role can do everything" ON public.game_results
  FOR ALL USING (auth.role() = 'service_role');
