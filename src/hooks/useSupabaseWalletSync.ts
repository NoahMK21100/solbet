import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { findOrCreateProfile, Profile } from "../utils/upsertUserProfile"

// Global state to prevent multiple simultaneous syncs
let globalProfile: Profile | null = null
let globalLoading = false
let globalIsNewUser = false
let globalError: string | null = null
let globalIsInitialized = false
let currentWalletAddress: string | null = null

export function useSupabaseWalletSync() {
  const { publicKey, connected } = useWallet()
  const [profile, setProfile] = useState<Profile | null>(globalProfile)
  const [loading, setLoading] = useState(globalLoading)
  const [isNewUser, setIsNewUser] = useState(globalIsNewUser)
  const [error, setError] = useState<string | null>(globalError)
  const [isInitialized, setIsInitialized] = useState(globalIsInitialized)

  const refreshProfile = useCallback(async () => {
    if (!connected || !publicKey) return
    
    globalLoading = true
    setLoading(true)
    globalError = null
    setError(null)
    
    try {
      const result = await findOrCreateProfile(publicKey.toString())
      
      if (result.error) {
        globalError = result.error.message || 'Profile sync failed'
        setError(globalError)
        return
      }
      
      if (result.profile) {
        globalProfile = result.profile
        setProfile(result.profile)
        globalIsNewUser = !!result.isNew
        setIsNewUser(!!result.isNew)
      }
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Unknown error'
      setError(globalError)
    } finally {
      globalLoading = false
      setLoading(false)
    }
  }, [connected, publicKey])

  // Simple effect that only runs when wallet changes
  useEffect(() => {
    const walletAddress = publicKey?.toString() || null
    
    if (!connected || !publicKey) {
      globalProfile = null
      setProfile(null)
      globalIsNewUser = false
      setIsNewUser(false)
      globalError = null
      setError(null)
      globalIsInitialized = true
      setIsInitialized(true)
      currentWalletAddress = null
      return
    }

    // If same wallet, use cached data
    if (walletAddress === currentWalletAddress && globalProfile) {
      setProfile(globalProfile)
      setIsNewUser(globalIsNewUser)
      setError(globalError)
      setIsInitialized(globalIsInitialized)
      return
    }

    const syncProfile = async () => {
      globalLoading = true
      setLoading(true)
      globalError = null
      setError(null)
      
      try {
        const result = await findOrCreateProfile(publicKey.toString())
        
        if (result.error) {
          globalError = result.error.message || 'Profile sync failed'
          setError(globalError)
          return
        }
        
        if (result.profile) {
          globalProfile = result.profile
          setProfile(result.profile)
          globalIsNewUser = !!result.isNew
          setIsNewUser(!!result.isNew)
          currentWalletAddress = walletAddress
        }
      } catch (err) {
        globalError = err instanceof Error ? err.message : 'Unknown error'
        setError(globalError)
      } finally {
        globalLoading = false
        setLoading(false)
        globalIsInitialized = true
        setIsInitialized(true)
      }
    }

    syncProfile()
  }, [connected, publicKey])

  return { 
    profile, 
    loading, 
    isNewUser, 
    error,
    walletAddress: publicKey?.toString() || null,
    refreshProfile,
    isInitialized
  }
}
