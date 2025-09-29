import { supabase, UserProfile, ChatMessage, GameResult } from './supabase'

// User Profile Functions
export const createUserProfile = async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProfile = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

export const updateUserProfile = async (walletAddress: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single()

  if (error) throw error
  return data
}

export const checkUserExists = async (walletAddress: string, email: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('wallet_address, email')
    .or(`wallet_address.eq.${walletAddress},email.eq.${email}`)

  if (error) throw error

  const walletExists = data.some(user => user.wallet_address === walletAddress)
  const emailExists = data.some(user => user.email === email)

  return {
    exists: walletExists || emailExists,
    field: walletExists ? 'wallet' : emailExists ? 'email' : null
  }
}

// Chat Functions
export const getChatMessages = async (limit: number = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      ...message,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Game Results Functions
export const saveGameResult = async (gameResult: Omit<GameResult, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('game_results')
    .insert([{
      ...gameResult,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getRecentGames = async (limit: number = 20) => {
  const { data, error } = await supabase
    .from('game_results')
    .select(`
      *,
      user_profiles!inner(username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
