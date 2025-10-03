-- ========================================
-- FIXED DATABASE FUNCTIONS
-- ========================================

-- 1. Function to update user stats when a game result is inserted (already created in corrected_schema.sql)
-- This function is included in the trigger above

-- 2. Function to get comprehensive game statistics for a wallet
CREATE OR REPLACE FUNCTION get_wallet_game_stats(wallet_addr TEXT)
RETURNS TABLE (
  total_games BIGINT,
  total_wagered NUMERIC,
  total_won NUMERIC,
  net_profit NUMERIC,
  win_rate NUMERIC,
  avg_multiplier NUMERIC,
  best_multiplier NUMERIC,
  favorite_game_type TEXT,
  last_game_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_games,
    COALESCE(SUM(gr.wager_amount), 0) as total_wagered,
    COALESCE(SUM(gr.payout_amount), 0) as total_won,
    COALESCE(SUM(gr.payout_amount) - SUM(gr.wager_amount), 0) as net_profit,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE gr.result = 'win')::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as win_rate,
    COALESCE(AVG(gr.multiplier), 0) as avg_multiplier,
    COALESCE(MAX(gr.multiplier), 0) as best_multiplier,
    (SELECT gr2.game_type 
     FROM game_results gr2 
     WHERE gr2.wallet_address = wallet_addr 
     GROUP BY gr2.game_type 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as favorite_game_type,
    MAX(gr.created_at) as last_game_date
  FROM game_results gr
  WHERE gr.wallet_address = wallet_addr;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_game_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  wallet_address TEXT,
  username TEXT,
  total_games BIGINT,
  total_wagered NUMERIC,
  total_won NUMERIC,
  net_profit NUMERIC,
  win_rate NUMERIC,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.wallet_address,
    COALESCE(p.username, 'Unknown') as username,
    COUNT(*) as total_games,
    COALESCE(SUM(gr.wager_amount), 0) as total_wagered,
    COALESCE(SUM(gr.payout_amount), 0) as total_won,
    COALESCE(SUM(gr.payout_amount) - SUM(gr.wager_amount), 0) as net_profit,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE gr.result = 'win')::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as win_rate,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(gr.payout_amount) - SUM(gr.wager_amount), 0) DESC) as rank
  FROM game_results gr
  LEFT JOIN profiles p ON p.wallet_address = gr.wallet_address
  GROUP BY gr.wallet_address, p.username
  ORDER BY net_profit DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get game type statistics
CREATE OR REPLACE FUNCTION get_game_type_stats()
RETURNS TABLE (
  game_type TEXT,
  total_games BIGINT,
  total_wagered NUMERIC,
  total_won NUMERIC,
  avg_multiplier NUMERIC,
  house_edge NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.game_type,
    COUNT(*) as total_games,
    COALESCE(SUM(gr.wager_amount), 0) as total_wagered,
    COALESCE(SUM(gr.payout_amount), 0) as total_won,
    COALESCE(AVG(gr.multiplier), 0) as avg_multiplier,
    CASE 
      WHEN SUM(gr.wager_amount) > 0 THEN 
        ((SUM(gr.wager_amount) - SUM(gr.payout_amount)) / SUM(gr.wager_amount)) * 100
      ELSE 0
    END as house_edge
  FROM game_results gr
  GROUP BY gr.game_type
  ORDER BY total_games DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get recent games for a wallet
CREATE OR REPLACE FUNCTION get_recent_games_for_wallet(wallet_addr TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  game_type TEXT,
  wager_amount NUMERIC,
  payout_amount NUMERIC,
  multiplier NUMERIC,
  result TEXT,
  rng_seed TEXT,
  client_seed TEXT,
  nonce INTEGER,
  game_id TEXT,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.id,
    gr.game_type,
    gr.wager_amount,
    gr.payout_amount,
    gr.multiplier,
    gr.result,
    gr.rng_seed,
    gr.client_seed,
    gr.nonce,
    gr.game_id,
    gr.transaction_signature,
    gr.created_at
  FROM game_results gr
  WHERE gr.wallet_address = wallet_addr
  ORDER BY gr.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get game verification data (for provably fair verification)
CREATE OR REPLACE FUNCTION get_game_verification_data(game_uuid UUID)
RETURNS TABLE (
  wallet_address TEXT,
  game_type TEXT,
  wager_amount NUMERIC,
  payout_amount NUMERIC,
  result TEXT,
  rng_seed TEXT,
  client_seed TEXT,
  nonce INTEGER,
  game_id TEXT,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.wallet_address,
    gr.game_type,
    gr.wager_amount,
    gr.payout_amount,
    gr.result,
    gr.rng_seed,
    gr.client_seed,
    gr.nonce,
    gr.game_id,
    gr.transaction_signature,
    gr.created_at
  FROM game_results gr
  WHERE gr.id = game_uuid;
END;
$$ LANGUAGE plpgsql;
