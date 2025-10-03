import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { gambaTransactionFetcher } from '../utils/gambaTransactionFetcher'
import { supabase } from '../lib/supabase'

interface GameSyncState {
  isSyncing: boolean
  lastSyncTime: Date | null
  totalGames: number
  error: string | null
}

interface GameResult {
  id: string
  wallet_address: string
  game_type: string
  wager_amount: number
  payout_amount: number
  multiplier: number
  result: 'win' | 'lose'
  rng_seed: string
  client_seed: string
  nonce: number
  game_id: string
  created_at: string
}

export const useGambaGameSync = () => {
  const { publicKey } = useWallet()
  const [syncState, setSyncState] = useState<GameSyncState>({
    isSyncing: false,
    lastSyncTime: null,
    totalGames: 0,
    error: null
  })

  // Sync games for current wallet
  const syncCurrentWalletGames = useCallback(async () => {
    if (!publicKey) {
      setSyncState(prev => ({ ...prev, error: 'No wallet connected' }))
      return
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      await gambaTransactionFetcher.syncWalletGames(publicKey.toString())
      
      // Fetch updated game count
      const { data: gameResults, error } = await supabase
        .from('game_results')
        .select('*', { count: 'exact' })
        .eq('wallet_address', publicKey.toString())

      if (error) throw error

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        totalGames: gameResults?.length || 0,
        error: null
      }))
    } catch (error) {
      console.error('Error syncing wallet games:', error)
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [publicKey])

  // Sync all recent games
  const syncAllRecentGames = useCallback(async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      await gambaTransactionFetcher.syncAllRecentGames()
      
      // Fetch updated game count
      const { data: gameResults, error } = await supabase
        .from('game_results')
        .select('*', { count: 'exact' })

      if (error) throw error

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        totalGames: gameResults?.length || 0,
        error: null
      }))
    } catch (error) {
      console.error('Error syncing all games:', error)
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [])

  // Get game results for current wallet
  const getWalletGameResults = useCallback(async (): Promise<GameResult[]> => {
    if (!publicKey) return []

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching wallet game results:', error)
      return []
    }
  }, [publicKey])

  // Get all game results
  const getAllGameResults = useCallback(async (): Promise<GameResult[]> => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all game results:', error)
      return []
    }
  }, [])

  // Auto-sync when wallet changes
  useEffect(() => {
    if (publicKey) {
      syncCurrentWalletGames()
    }
  }, [publicKey, syncCurrentWalletGames])

  return {
    syncState,
    syncCurrentWalletGames,
    syncAllRecentGames,
    getWalletGameResults,
    getAllGameResults
  }
}
