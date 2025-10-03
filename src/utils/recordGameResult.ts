import { supabase } from '../lib/supabase'

interface GameResultData {
  wallet_address: string
  game_type: string
  wager_amount: number
  payout_amount: number
  multiplier: number
  result: 'win' | 'lose'
  rng_seed?: string
  client_seed?: string
  nonce?: number
  game_id?: string
  transaction_signature?: string
}

/**
 * Record a game result in the database
 */
export async function recordGameResult(gameData: GameResultData): Promise<void> {
  try {
    console.log('🎮 Recording game result:', gameData)
    
    const { error } = await supabase
      .from('game_results')
      .insert([{
        wallet_address: gameData.wallet_address,
        game_type: gameData.game_type,
        wager_amount: gameData.wager_amount,
        payout_amount: gameData.payout_amount,
        multiplier: gameData.multiplier,
        result: gameData.result,
        rng_seed: gameData.rng_seed || '',
        client_seed: gameData.client_seed || '',
        nonce: gameData.nonce || 0,
        game_id: gameData.game_id || '',
        transaction_signature: gameData.transaction_signature || ''
      }])

    if (error) {
      console.error('❌ Error recording game result:', error)
      throw error
    }

    console.log('✅ Game result recorded successfully')
  } catch (error) {
    console.error('❌ Failed to record game result:', error)
    // Don't throw - we don't want game recording to break the game
  }
}

/**
 * Record a coinflip game result
 */
export async function recordCoinflipResult(
  walletAddress: string,
  wagerAmount: number,
  payoutAmount: number,
  isWin: boolean,
  rngSeed?: string,
  clientSeed?: string,
  nonce?: number,
  gameId?: string,
  transactionSignature?: string
): Promise<void> {
  console.log('🎮 recordCoinflipResult called:', {
    walletAddress,
    wagerAmount,
    payoutAmount,
    isWin,
    rngSeed,
    clientSeed,
    nonce,
    gameId,
    transactionSignature
  })

  const multiplier = payoutAmount > 0 ? payoutAmount / wagerAmount : 0

  await recordGameResult({
    wallet_address: walletAddress,
    game_type: 'coinflip',
    wager_amount: wagerAmount,
    payout_amount: payoutAmount,
    multiplier,
    result: isWin ? 'win' : 'lose',
    rng_seed: rngSeed,
    client_seed: clientSeed,
    nonce: nonce,
    game_id: gameId,
    transaction_signature: transactionSignature
  })
}
