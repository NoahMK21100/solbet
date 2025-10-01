import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { fetchPlayerMetadata } from '@gamba-labs/multiplayer-sdk'

// PvP game configuration
export const DESIRED_MAX_PLAYERS = 2
export const DESIRED_WINNERS_TARGET = 1

export const sol = (lamports: number) => lamports / LAMPORTS_PER_SOL

export const shorten = (pk: PublicKey) => pk.toBase58().slice(0, 4) + '...'

export const formatDuration = (ms: number) => {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const getBetLabel = (wagerType: any, wager: any, minBet: any, maxBet: any) => {
  if ('sameWager' in wagerType) {
    return `${sol(wager.toNumber()).toFixed(2)} SOL`
  } else if ('customWager' in wagerType) {
    return 'Unlimited'
  } else {
    return `${sol(minBet.toNumber()).toFixed(2)} – ${sol(maxBet.toNumber()).toFixed(2)} SOL`
  }
}

export const getPlayerSide = async (anchorProvider: any, gameSeed: any, playerPubkey: PublicKey): Promise<'heads' | 'tails' | undefined> => {
  try {
    const md = await fetchPlayerMetadata(anchorProvider, gameSeed)
    const playerMeta = (md[playerPubkey.toBase58()] ?? '').toLowerCase().trim()
    if (playerMeta === 'heads' || playerMeta === 'head') return 'heads'
    if (playerMeta === 'tails' || playerMeta === 'tail') return 'tails'
    return undefined
  } catch {
    return undefined
  }
}
