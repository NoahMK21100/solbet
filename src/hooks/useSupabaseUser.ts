import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClient } from '@supabase/supabase-js'

// Supabase client setup (optional)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export interface UserProfile {
  id: string
  wallet_address: string
  username: string
  email: string
  avatar_url?: string
  level: number
  total_bets: number
  total_won: number
  total_lost: number
  is_verified: boolean
  last_active: string
  created_at: string
  updated_at: string
}

export function useSupabaseUser() {
  const { publicKey, connected } = useWallet()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user exists in database
  const checkUserExists = async (walletAddress: string): Promise<boolean> => {
    if (!supabase) {
      // Fallback to localStorage if Supabase not configured
      const userData = localStorage.getItem('userData')
      return !!userData
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return !!data
    } catch (err) {
      console.error('Error checking user exists:', err)
      setError(err instanceof Error ? err.message : 'Failed to check user')
      return false
    }
  }

  // Fetch user profile from database
  const fetchUserProfile = async (walletAddress: string): Promise<UserProfile | null> => {
    if (!supabase) {
      // Fallback to localStorage if Supabase not configured
      const userData = localStorage.getItem('userData')
      if (userData) {
        const parsed = JSON.parse(userData)
        return {
          id: parsed.id || 'local',
          wallet_address: parsed.walletAddress,
          username: parsed.username,
          email: parsed.email,
          avatar_url: parsed.avatarUrl,
          level: parsed.level || 1,
          total_bets: parsed.totalBets || 0,
          total_won: parsed.totalWon || 0,
          total_lost: parsed.totalLost || 0,
          is_verified: parsed.isVerified || false,
          last_active: parsed.lastActive || new Date().toISOString(),
          created_at: parsed.createdAt || new Date().toISOString(),
          updated_at: parsed.updatedAt || new Date().toISOString()
        }
      }
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return null
        }
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create new user profile
  const createUserProfile = async (profileData: {
    username: string
    email: string
    avatar_url?: string
  }): Promise<UserProfile | null> => {
    if (!publicKey) return null

    if (!supabase) {
      // Fallback to localStorage if Supabase not configured
      const userData = {
        id: 'local-' + Date.now(),
        walletAddress: publicKey.toString(),
        username: profileData.username,
        email: profileData.email,
        avatarUrl: profileData.avatar_url,
        level: 1,
        totalBets: 0,
        totalWon: 0,
        totalLost: 0,
        isVerified: false,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('userData', JSON.stringify(userData))
      
      return {
        id: userData.id,
        wallet_address: userData.walletAddress,
        username: userData.username,
        email: userData.email,
        avatar_url: userData.avatarUrl,
        level: userData.level,
        total_bets: userData.totalBets,
        total_won: userData.totalWon,
        total_lost: userData.totalLost,
        is_verified: userData.isVerified,
        last_active: userData.lastActive,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt
      }
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          wallet_address: publicKey.toString(),
          username: profileData.username,
          email: profileData.email,
          avatar_url: profileData.avatar_url,
          level: 1,
          total_bets: 0,
          total_won: 0,
          total_lost: 0,
          is_verified: false,
          last_active: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      console.error('Error creating user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!publicKey) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', publicKey.toString())

      if (error) throw error

      // Refresh user profile
      await fetchUserProfile(publicKey.toString())
      return true
    } catch (err) {
      console.error('Error updating user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check user status when wallet connects
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!connected || !publicKey) {
        setUserProfile(null)
        setNeedsRegistration(false)
        return
      }

      const exists = await checkUserExists(publicKey.toString())
      
      if (exists) {
        const profile = await fetchUserProfile(publicKey.toString())
        setUserProfile(profile)
        setNeedsRegistration(false)
      } else {
        setUserProfile(null)
        setNeedsRegistration(true)
      }
    }

    checkUserStatus()
  }, [connected, publicKey])

  return {
    userProfile,
    isLoading,
    needsRegistration,
    error,
    createUserProfile,
    updateUserProfile,
    fetchUserProfile,
    checkUserExists
  }
}
