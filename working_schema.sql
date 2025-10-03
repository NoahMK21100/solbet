-- ========================================
-- CLEAN WORKING SCHEMA
-- ========================================

-- 1. Create missing functions first
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update user stats when a game result is inserted
CREATE OR REPLACE FUNCTION update_user_stats_from_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table with aggregated stats
  UPDATE profiles 
  SET 
    total_bets = COALESCE(total_bets, 0) + 1,
    total_won = COALESCE(total_won, 0) + NEW.payout_amount,
    total_wagered = COALESCE(total_wagered, 0) + NEW.wager_amount,
    biggest_win = GREATEST(COALESCE(biggest_win, 0), NEW.payout_amount),
    luckiest_win_multiplier = GREATEST(COALESCE(luckiest_win_multiplier, 0), NEW.multiplier),
    games_played = COALESCE(games_played, 0) + 1,
    net_profit = COALESCE(net_profit, 0) + (NEW.payout_amount - NEW.wager_amount),
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE wallet_address = NEW.wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to update profile stats from user_stats (if you keep user_stats)
CREATE OR REPLACE FUNCTION trigger_update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  wallet_addr TEXT;
BEGIN
  -- Determine wallet address based on operation
  IF TG_OP = 'DELETE' THEN
    wallet_addr := OLD.wallet_address;
  ELSE
    wallet_addr := NEW.wallet_address;
  END IF;
  
  -- Update profile with aggregated stats from user_stats
  UPDATE profiles 
  SET 
    total_wagered = COALESCE((
      SELECT SUM(total_wagered) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), 0),
    total_winnings = COALESCE((
      SELECT SUM(total_winnings) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), 0),
    games_played = COALESCE((
      SELECT SUM(games_played) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), 0),
    biggest_win = COALESCE((
      SELECT MAX(biggest_win) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), 0),
    last_played_at = COALESCE((
      SELECT MAX(last_played_at) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), last_played_at),
    net_profit = COALESCE((
      SELECT SUM(total_winnings) - SUM(total_wagered) 
      FROM user_stats 
      WHERE wallet_address = wallet_addr
    ), 0),
    updated_at = NOW()
  WHERE wallet_address = wallet_addr;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Clean up redundant columns in profiles (remove total_winnings since it's same as total_won)
-- Note: Run this only if you want to remove the redundant column
-- ALTER TABLE profiles DROP COLUMN IF EXISTS total_winnings;

-- 5. Recreate triggers with correct syntax
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.game_results;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON public.game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_game();

DROP TRIGGER IF EXISTS user_stats_updated_at ON public.user_stats;
CREATE TRIGGER user_stats_updated_at 
  BEFORE UPDATE ON public.user_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS update_profile_stats_trigger ON public.user_stats;
CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_stats();

DROP TRIGGER IF EXISTS chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER chat_messages_updated_at 
  BEFORE UPDATE ON public.chat_messages 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- 6. Enable RLS and create policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own game results" ON public.game_results;
DROP POLICY IF EXISTS "Users can insert their own game results" ON public.game_results;
DROP POLICY IF EXISTS "Service role can do everything on game_results" ON public.game_results;
DROP POLICY IF EXISTS "Users can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Service role can do everything on chat_messages" ON public.chat_messages;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Service role can do everything on profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own game results" ON public.game_results
  FOR SELECT USING (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Users can insert their own game results" ON public.game_results
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Service role can do everything on game_results" ON public.game_results
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view chat messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);

CREATE POLICY "Service role can do everything on chat_messages" ON public.chat_messages
  FOR ALL USING (auth.role() = 'service_role');
