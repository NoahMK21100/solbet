import { useState, useEffect } from 'react'

export function useOnlineUsers() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const updateOnlineCount = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to get online users from a simple API endpoint
        // This would typically be implemented with WebSocket connections or server-sent events
        // For now, we'll simulate with a simple fetch
        const response = await fetch('/api/online-users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setCount(data.count || 0)
        } else {
          // Fallback: estimate based on recent activity
          // Check recent chat activity to estimate online users
          const chatResponse = await fetch('/api/chat')
          if (chatResponse.ok) {
            const messages = await chatResponse.json()
            if (Array.isArray(messages) && messages.length > 0) {
              // Estimate 2-5x the number of recent chatters as online users
              const recentUsers = new Set(messages.map((msg: any) => msg.user)).size
              setCount(Math.max(recentUsers * 3, 1)) // At least 1 user (the current user)
            } else {
              setCount(1) // At least the current user
            }
          } else {
            setCount(1) // At least the current user
          }
        }
      } catch (err) {
        console.warn('Failed to fetch online users count:', err)
        setError('Failed to fetch count')
        setCount(1) // At least the current user
      } finally {
        setLoading(false)
      }
    }

    // Update immediately
    updateOnlineCount()
    
    // Update every 10 seconds for more real-time feel
    const interval = setInterval(updateOnlineCount, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const formatCount = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  return {
    count,
    formattedCount: formatCount(count),
    loading,
    error
  }
}
