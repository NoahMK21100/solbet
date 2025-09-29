-- Updated user_profiles table with proper fields for gambling platform
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT, -- For profile pictures (stored in Supabase Storage)
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  total_bets INTEGER DEFAULT 0 CHECK (total_bets >= 0),
  total_won NUMERIC(20, 9) DEFAULT 0 CHECK (total_won >= 0), -- SOL amounts with 9 decimal places
  total_lost NUMERIC(20, 9) DEFAULT 0 CHECK (total_lost >= 0), -- SOL amounts with 9 decimal places
  is_verified BOOLEAN DEFAULT false, -- Email verification status
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public read access for user profiles" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid()::text = wallet_address)
WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can delete their own profile" 
ON user_profiles FOR DELETE 
USING (auth.uid()::text = wallet_address);

-- Create game_history table for tracking individual games
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'flip', 'crash', 'dice', etc.
  wager NUMERIC(20, 9) NOT NULL, -- Amount bet in SOL
  payout NUMERIC(20, 9) NOT NULL, -- Amount won/lost in SOL
  multiplier NUMERIC(10, 4), -- Game multiplier (e.g., 2.0 for 2x)
  result TEXT NOT NULL, -- 'win', 'lose', 'tie'
  transaction_hash TEXT UNIQUE NOT NULL, -- Solana transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for game_history
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_wallet_address ON game_history(wallet_address);
CREATE INDEX idx_game_history_game_type ON game_history(game_type);
CREATE INDEX idx_game_history_created_at ON game_history(created_at);
CREATE INDEX idx_game_history_transaction_hash ON game_history(transaction_hash);

-- Enable RLS for game_history
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_history
CREATE POLICY "Public read access for game history" 
ON game_history FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own game history" 
ON game_history FOR INSERT 
WITH CHECK (auth.uid()::text = wallet_address);

-- Create user_sessions table for tracking online users
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  is_online BOOLEAN DEFAULT true,
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_wallet_address ON user_sessions(wallet_address);
CREATE INDEX idx_user_sessions_is_online ON user_sessions(is_online);
CREATE INDEX idx_user_sessions_last_ping ON user_sessions(last_ping);

-- Enable RLS for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Public read access for user sessions" 
ON user_sessions FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own sessions" 
ON user_sessions FOR ALL 
USING (auth.uid()::text = wallet_address)
WITH CHECK (auth.uid()::text = wallet_address);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user statistics after game
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile statistics
    UPDATE user_profiles 
    SET 
        total_bets = total_bets + 1,
        total_won = total_won + CASE WHEN NEW.payout > NEW.wager THEN NEW.payout - NEW.wager ELSE 0 END,
        total_lost = total_lost + CASE WHEN NEW.payout < NEW.wager THEN NEW.wager - NEW.payout ELSE 0 END,
        last_active = NOW()
    WHERE wallet_address = NEW.wallet_address;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update user stats after game
CREATE TRIGGER update_user_stats_after_game
    AFTER INSERT ON game_history
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Create function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    -- Mark sessions as offline if they haven't pinged in 5 minutes
    UPDATE user_sessions 
    SET is_online = false 
    WHERE last_ping < NOW() - INTERVAL '5 minutes';
    
    -- Delete sessions older than 1 hour
    DELETE FROM user_sessions 
    WHERE last_ping < NOW() - INTERVAL '1 hour';
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up old sessions (run every minute)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- You can also call this function manually or via a cron job
