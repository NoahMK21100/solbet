import { supabase } from "../lib/supabase"

// Define Profile type to match your Supabase table
export interface Profile {
  id?: string
  wallet_address: string
  username?: string
  email?: string
  balance?: number
  avatar_url?: string
  bio?: string
  level?: number
  total_bets?: number
  total_won?: number
  referral_code?: string
  referred_by?: string
  total_wagered?: number
  total_winnings?: number
  biggest_win?: number
  luckiest_win_multiplier?: number
  games_played?: number
  net_profit?: number
  last_played_at?: string
  created_at: string
  updated_at: string
}

export async function findOrCreateProfile(walletAddress: string) {
  if (!supabase) {
    return { error: new Error('Supabase not configured - please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables') }
  }

  const { data: existing, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle()

  if (error) {
    return { error }
  }

  if (existing) {
    return { profile: existing }
  }

  // Insert new row
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert([{ wallet_address: walletAddress }])
    .select()
    .single()

  if (insertError) {
    return { error: insertError }
  }

  return { profile: created, isNew: true }
}
