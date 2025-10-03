import { supabase } from '../lib/supabase'

interface GameResultData {
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
}

export class GameRecorder {
  /**
   * Record a game result in the database
   */
  static async recordGameResult(gameData: GameResultData): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_results')
        .insert([gameData])

      if (error) {
        console.error('Error recording game result:', error)
        throw error
      }

      console.log('Game result recorded successfully:', gameData.game_id)
    } catch (error) {
      console.error('Failed to record game result:', error)
      throw error
    }
  }

  /**
   * Record a coinflip game result
   */
  static async recordCoinflipResult(
    walletAddress: string,
    wagerAmount: number,
    payoutAmount: number,
    isWin: boolean,
    rngSeed: string,
    clientSeed: string,
    nonce: number,
    gameId: string,
    transactionSignature: string
  ): Promise<void> {
    const multiplier = payoutAmount > 0 ? payoutAmount / wagerAmount : 0

    await this.recordGameResult({
      wallet_address: walletAddress,
      game_type: 'coinflip',
      wager_amount: wagerAmount,
      payout_amount: payoutAmount,
      multiplier,
      result: isWin ? 'win' : 'lose',
      rng_seed: rngSeed,
      client_seed: clientSeed,
      nonce,
      game_id: gameId,
      transaction_signature: transactionSignature
    })
  }

  /**
   * Record any Gamba game result
   */
  static async recordGambaGameResult(
    walletAddress: string,
    gameType: string,
    wagerAmount: number,
    payoutAmount: number,
    betArray: number[],
    resultIndex: number,
    rngSeed: string,
    clientSeed: string,
    nonce: number,
    gameId: string,
    transactionSignature: string
  ): Promise<void> {
    const multiplier = payoutAmount > 0 ? payoutAmount / wagerAmount : 0
    const isWin = payoutAmount > wagerAmount

    await this.recordGameResult({
      wallet_address: walletAddress,
      game_type: gameType,
      wager_amount: wagerAmount,
      payout_amount: payoutAmount,
      multiplier,
      result: isWin ? 'win' : 'lose',
      rng_seed: rngSeed,
      client_seed: clientSeed,
      nonce,
      game_id: gameId,
      transaction_signature: transactionSignature
    })
  }
}

// Helper function to extract game data from Gamba result
export function extractGameDataFromResult(
  result: any,
  walletAddress: string,
  gameType: string = 'coinflip'
): Partial<GameResultData> {
  return {
    wallet_address: walletAddress,
    game_type: gameType,
    wager_amount: result.wager ? Number(result.wager) / 1e9 : 0,
    payout_amount: result.payout ? Number(result.payout) / 1e9 : 0,
    multiplier: result.payout && result.wager ? Number(result.payout) / Number(result.wager) : 0,
    result: result.payout > result.wager ? 'win' : 'lose',
    rng_seed: result.rngSeed?.toString() || '',
    client_seed: result.clientSeed?.toString() || '',
    nonce: result.nonce || 0,
    game_id: result.game?.toString() || '',
    transaction_signature: result.transactionSignature || ''
  }
}
