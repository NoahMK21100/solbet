import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id?: string
  wallet_address: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  level: number
  total_bets: number
  total_won: number
  referral_code?: string
  referred_by?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id?: string
  wallet_address: string
  username: string
  message: string
  created_at: string
}

export interface GameResult {
  id?: string
  wallet_address: string
  game_type: string
  wager_amount: number
  result: 'win' | 'lose'
  payout?: number
  created_at: string
}
