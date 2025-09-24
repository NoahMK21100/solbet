import { useState, useEffect } from 'react'

interface ChattersResponse {
  count: number
  online: number
}

export function useChattersCount() {
  const [count, setCount] = useState(0) // Start with 0, show real count
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChattersCount = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch from the existing chat API first
        const response = await fetch('/api/chat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          // If the API returns a count, use it
          if (typeof data.count === 'number') {
            setCount(data.count)
          } else if (Array.isArray(data) && data.length > 0) {
            // If it's an array of messages, count unique users
            const uniqueUsers = new Set(data.map((msg: any) => msg.user)).size
            setCount(uniqueUsers) // Show actual unique users
          } else {
            setCount(0) // No messages = 0 users
          }
        }
      } catch (err) {
        console.warn('Failed to fetch chatters count:', err)
        setError('Failed to fetch count')
        setCount(0) // Show 0 on error
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchChattersCount()
    
    // Update every 30 seconds
    const interval = setInterval(fetchChattersCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatCount = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    } else if (num === 0) {
      return '0'
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
