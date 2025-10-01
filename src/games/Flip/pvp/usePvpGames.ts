import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useSpecificGames, useGambaProvider } from 'gamba-react-v2'
import { fetchPlayerMetadata } from '@gamba-labs/multiplayer-sdk'
import { DESIRED_MAX_PLAYERS, DESIRED_WINNERS_TARGET } from './PvpGameUtils'

export interface PvpGameData {
  publicKey: PublicKey
  account: any
  playerSides: Record<string, 'heads' | 'tails' | undefined>
}

export function usePvpGames() {
  const { games, loading, refresh } = useSpecificGames(
    { maxPlayers: DESIRED_MAX_PLAYERS, winnersTarget: DESIRED_WINNERS_TARGET },
    0,
  )
  const { anchorProvider } = useGambaProvider()
  const [pvpGames, setPvpGames] = useState<PvpGameData[]>([])
  const [loadingSides, setLoadingSides] = useState(false)

  useEffect(() => {
    if (!games.length) {
      setPvpGames([])
      return
    }

    const loadPlayerSides = async () => {
      setLoadingSides(true)
      try {
        const gamesWithSides = await Promise.all(
          games.map(async (game) => {
            const { gameMaker, players } = game.account as any
            const playerSides: Record<string, 'heads' | 'tails' | undefined> = {}
            
            // Get maker's side
            try {
              const md = await fetchPlayerMetadata(anchorProvider as any, game.account.gameSeed)
              const makerMeta = (md[gameMaker.toBase58()] ?? '').toLowerCase().trim()
              if (makerMeta === 'heads' || makerMeta === 'head') {
                playerSides[gameMaker.toBase58()] = 'heads'
              } else if (makerMeta === 'tails' || makerMeta === 'tail') {
                playerSides[gameMaker.toBase58()] = 'tails'
              }
            } catch (e) {
              console.error('Failed to fetch maker metadata:', e)
            }

            return {
              publicKey: game.publicKey,
              account: game.account,
              playerSides,
            }
          })
        )
        setPvpGames(gamesWithSides)
      } catch (error) {
        console.error('Failed to load player sides:', error)
        setPvpGames(games.map(game => ({
          publicKey: game.publicKey,
          account: game.account,
          playerSides: {},
        })))
      } finally {
        setLoadingSides(false)
      }
    }

    loadPlayerSides()
  }, [games, anchorProvider])

  return {
    pvpGames,
    loading: loading || loadingSides,
    refresh,
  }
}

