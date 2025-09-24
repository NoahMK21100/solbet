// api/coinflip-games.ts
export const config = { runtime: 'edge' }

import { kv } from '@vercel/kv'

type CoinflipGame = {
  id: string
  player1: { name: string; level: number; avatar: string; side: string }
  player2: { name: string; level: number; avatar: string; side: string } | null
  amount: number
  currency: string
  status: 'waiting' | 'completed' | 'in-play'
  result?: 'win' | 'lose'
  timestamp: number
  transactionHash?: string
  userAddress?: string
}

const COINFLIP_GAMES_KEY = 'coinflip_games'

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'GET') {
      // Get recent coinflip games
      const games = await kv.lrange<CoinflipGame>(COINFLIP_GAMES_KEY, 0, 49) || []
      return new Response(JSON.stringify(games.reverse()), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    if (req.method === 'POST') {
      // Save a new coinflip game
      const game = await req.json() as CoinflipGame
      
      if (!game.id || !game.player1) {
        return new Response('Invalid game data', { status: 400 })
      }
      
      // Add to the list (most recent first)
      await kv.lpush(COINFLIP_GAMES_KEY, game)
      
      // Keep only the last 100 games
      await kv.ltrim(COINFLIP_GAMES_KEY, 0, 99)
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    if (req.method === 'PUT') {
      // Update an existing game
      const { gameId, updates } = await req.json()
      
      if (!gameId) {
        return new Response('Game ID required', { status: 400 })
      }
      
      // Get all games
      const games = await kv.lrange<CoinflipGame>(COINFLIP_GAMES_KEY, 0, -1) || []
      
      // Find and update the game
      const updatedGames = games.map(game => 
        game.id === gameId ? { ...game, ...updates } : game
      )
      
      // Replace the entire list
      await kv.del(COINFLIP_GAMES_KEY)
      if (updatedGames.length > 0) {
        await kv.lpush(COINFLIP_GAMES_KEY, ...updatedGames.reverse())
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response('Method Not Allowed', { status: 405 })
  } catch (err: any) {
    console.error('[coinflip-games API error]', err)
    return new Response('Internal Error', { status: 500 })
  }
}
