// api/online-users.ts
export const config = { runtime: 'edge' }

import { kv } from '@vercel/kv'

const ONLINE_USERS_KEY = 'online_users'
const HEARTBEAT_TIMEOUT = 30000 // 30 seconds

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'GET') {
      // Get current online users count
      const onlineUsers = await kv.get(ONLINE_USERS_KEY) as Record<string, number> || {}
      const now = Date.now()
      
      // Clean up expired users (haven't sent heartbeat in 30 seconds)
      const activeUsers = Object.entries(onlineUsers)
        .filter(([_, timestamp]) => now - timestamp < HEARTBEAT_TIMEOUT)
        .reduce((acc, [userId, timestamp]) => {
          acc[userId] = timestamp
          return acc
        }, {} as Record<string, number>)
      
      // Update the store with cleaned data
      if (Object.keys(activeUsers).length !== Object.keys(onlineUsers).length) {
        await kv.set(ONLINE_USERS_KEY, activeUsers)
      }
      
      return new Response(JSON.stringify({ count: Object.keys(activeUsers).length }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    if (req.method === 'POST') {
      // Heartbeat - user is still online
      const { userId } = await req.json()
      const onlineUsers = await kv.get(ONLINE_USERS_KEY) as Record<string, number> || {}
      onlineUsers[userId] = Date.now()
      
      await kv.set(ONLINE_USERS_KEY, onlineUsers)
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response('Method Not Allowed', { status: 405 })
  } catch (err: any) {
    console.error('[online-users API error]', err)
    return new Response('Internal Error', { status: 500 })
  }
}
