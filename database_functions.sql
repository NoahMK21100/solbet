-- Function to update user stats when a game result is inserted
CREATE OR REPLACE FUNCTION update_user_stats_from_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table with aggregated stats
  UPDATE profiles 
  SET 
    total_bets = total_bets + 1,
    total_won = total_won + NEW.payout_amount,
    updated_at = NOW()
  WHERE wallet_address = NEW.wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when game results are inserted
DROP TRIGGER IF EXISTS update_user_stats_trigger ON game_results;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_from_game();

-- Function to get comprehensive game statistics for a wallet
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
    SUM(gr.wager_amount) as total_wagered,
    SUM(gr.payout_amount) as total_won,
    SUM(gr.payout_amount) - SUM(gr.wager_amount) as net_profit,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE gr.result = 'win')::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as win_rate,
    AVG(gr.multiplier) as avg_multiplier,
    MAX(gr.multiplier) as best_multiplier,
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

-- Function to get leaderboard data
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
    p.username,
    COUNT(*) as total_games,
    SUM(gr.wager_amount) as total_wagered,
    SUM(gr.payout_amount) as total_won,
    SUM(gr.payout_amount) - SUM(gr.wager_amount) as net_profit,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE gr.result = 'win')::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as win_rate,
    ROW_NUMBER() OVER (ORDER BY SUM(gr.payout_amount) - SUM(gr.wager_amount) DESC) as rank
  FROM game_results gr
  LEFT JOIN profiles p ON p.wallet_address = gr.wallet_address
  GROUP BY gr.wallet_address, p.username
  ORDER BY net_profit DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get game type statistics
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
    SUM(gr.wager_amount) as total_wagered,
    SUM(gr.payout_amount) as total_won,
    AVG(gr.multiplier) as avg_multiplier,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);
CREATE INDEX IF NOT EXISTS idx_game_results_result ON game_results(result);
CREATE INDEX IF NOT EXISTS idx_game_results_multiplier ON game_results(multiplier);
CREATE INDEX IF NOT EXISTS idx_game_results_rng_seed ON game_results(rng_seed);
CREATE INDEX IF NOT EXISTS idx_game_results_client_seed ON game_results(client_seed);
