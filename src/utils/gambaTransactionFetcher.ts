import { 
  fetchGambaTransactions, 
  parseGambaTransaction, 
  parseTransactionEvents,
  GambaTransaction,
  GameResult 
} from 'gamba-core-v2'
import { supabase } from '../lib/supabase'
import { Connection, PublicKey } from '@solana/web3.js'

interface GameTransactionData {
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
  transaction_signature: string
  created_at: Date
}

export class GambaTransactionFetcher {
  private connection: Connection

  constructor(rpcEndpoint: string) {
    this.connection = new Connection(rpcEndpoint)
  }

  /**
   * Fetch all Gamba transactions for a specific wallet address
   */
  async fetchWalletTransactions(walletAddress: string, limit = 100): Promise<GameTransactionData[]> {
    try {
      const publicKey = new PublicKey(walletAddress)
      
      // Fetch transactions using Gamba's utility
      const transactions = await fetchGambaTransactions({
        connection: this.connection,
        player: publicKey,
        limit
      })

      const gameData: GameTransactionData[] = []

      for (const tx of transactions) {
        try {
          const parsed = parseGambaTransaction(tx)
          
          if (parsed?.events) {
            for (const event of parsed.events) {
              if (event.type === 'GameSettled') {
                const gameData = this.parseGameSettledEvent(event, tx.signature)
                if (gameData) {
                  gameData.push(gameData)
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing transaction ${tx.signature}:`, error)
        }
      }

      return gameData
    } catch (error) {
      console.error('Error fetching wallet transactions:', error)
      throw error
    }
  }

  /**
   * Fetch all recent Gamba transactions across all users
   * This requires scanning recent blocks or using a different approach
   */
  async fetchAllRecentTransactions(limit = 1000): Promise<GameTransactionData[]> {
    try {
      // Note: This is a simplified approach. For production, you might want to:
      // 1. Use a webhook system
      // 2. Scan blocks continuously
      // 3. Use Gamba's indexer if available
      
      const transactions = await fetchGambaTransactions({
        connection: this.connection,
        limit
      })

      const gameData: GameTransactionData[] = []

      for (const tx of transactions) {
        try {
          const parsed = parseGambaTransaction(tx)
          
          if (parsed?.events) {
            for (const event of parsed.events) {
              if (event.type === 'GameSettled') {
                const gameData = this.parseGameSettledEvent(event, tx.signature)
                if (gameData) {
                  gameData.push(gameData)
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing transaction ${tx.signature}:`, error)
        }
      }

      return gameData
    } catch (error) {
      console.error('Error fetching all transactions:', error)
      throw error
    }
  }

  /**
   * Parse GameSettled event into our database format
   */
  private parseGameSettledEvent(event: any, signature: string): GameTransactionData | null {
    try {
      const {
        player,
        game,
        wager,
        payout,
        result,
        rngSeed,
        clientSeed,
        nonce,
        bet
      } = event

      // Determine game type based on bet array
      const gameType = this.determineGameType(bet)
      
      // Calculate multiplier
      const multiplier = payout > 0 ? payout / wager : 0
      
      // Determine result
      const gameResult: 'win' | 'lose' = payout > wager ? 'win' : 'lose'

      return {
        wallet_address: player.toString(),
        game_type: gameType,
        wager_amount: Number(wager) / 1e9, // Convert lamports to SOL
        payout_amount: Number(payout) / 1e9, // Convert lamports to SOL
        multiplier: Number(multiplier.toFixed(2)),
        result: gameResult,
        rng_seed: rngSeed?.toString() || '',
        client_seed: clientSeed?.toString() || '',
        nonce: Number(nonce) || 0,
        game_id: game?.toString() || signature,
        transaction_signature: signature,
        created_at: new Date()
      }
    } catch (error) {
      console.error('Error parsing GameSettled event:', error)
      return null
    }
  }

  /**
   * Determine game type based on bet array
   */
  private determineGameType(bet: number[]): string {
    // Simple heuristic based on bet array patterns
    if (bet.length === 2 && bet.includes(2) && bet.includes(0)) {
      return 'coinflip'
    } else if (bet.length > 2 && bet.includes(0)) {
      return 'slots'
    } else if (bet.length === 37) {
      return 'roulette'
    } else if (bet.length > 10) {
      return 'plinko'
    } else {
      return 'custom'
    }
  }

  /**
   * Store game results in database
   */
  async storeGameResults(gameResults: GameTransactionData[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_results')
        .insert(gameResults)

      if (error) {
        console.error('Error storing game results:', error)
        throw error
      }

      console.log(`Successfully stored ${gameResults.length} game results`)
    } catch (error) {
      console.error('Error storing game results:', error)
      throw error
    }
  }

  /**
   * Sync all game transactions for a specific wallet
   */
  async syncWalletGames(walletAddress: string): Promise<void> {
    try {
      console.log(`Syncing games for wallet: ${walletAddress}`)
      
      const gameResults = await this.fetchWalletTransactions(walletAddress)
      
      if (gameResults.length > 0) {
        await this.storeGameResults(gameResults)
        console.log(`Synced ${gameResults.length} games for ${walletAddress}`)
      } else {
        console.log(`No games found for ${walletAddress}`)
      }
    } catch (error) {
      console.error(`Error syncing wallet ${walletAddress}:`, error)
      throw error
    }
  }

  /**
   * Sync all recent game transactions
   */
  async syncAllRecentGames(): Promise<void> {
    try {
      console.log('Syncing all recent games...')
      
      const gameResults = await this.fetchAllRecentTransactions()
      
      if (gameResults.length > 0) {
        await this.storeGameResults(gameResults)
        console.log(`Synced ${gameResults.length} recent games`)
      } else {
        console.log('No recent games found')
      }
    } catch (error) {
      console.error('Error syncing recent games:', error)
      throw error
    }
  }
}

// Export singleton instance
export const gambaTransactionFetcher = new GambaTransactionFetcher(
  import.meta.env.VITE_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
)
