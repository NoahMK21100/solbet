import { GambaTransaction } from 'gamba-core-v2'
import { GAMES } from './games'

export const truncateString = (s: string, startLen = 4, endLen = startLen) => s.slice(0, startLen) + '...' + s.slice(-endLen)

// Get username from user data or generate from wallet address
export const getUsername = (address: string): string => {
  if (!address) return 'Anonymous'
  
  // Try to get username from localStorage
  try {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      if (parsed.username && parsed.walletAddress === address) {
        return parsed.username
      }
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  
  // Fallback to wallet address format
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Get user level from user data or default
export const getUserLevel = (address: string): number => {
  if (!address) return 1
  
  // Try to get level from localStorage
  try {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      if (parsed.walletAddress === address && parsed.level) {
        return parsed.level
      }
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  
  // Default level
  return 1
}

// Get user avatar URL from user data or default
export const getUserAvatar = (address: string): string | null => {
  if (!address) return null
  
  // Try to get avatar from localStorage
  try {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      if (parsed.walletAddress === address && parsed.avatarUrl) {
        return parsed.avatarUrl
      }
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }
  
  // No custom avatar
  return null
}

// Get user avatar URL or default image
export const getUserAvatarOrDefault = (address: string): string => {
  const customAvatar = getUserAvatar(address)
  return customAvatar || '/solly.png'
}

// Check if user has custom avatar
export const hasCustomAvatar = (address: string): boolean => {
  return getUserAvatar(address) !== null
}

export const extractMetadata = (event: GambaTransaction<'GameSettled'>) => {
  try {
    const [version, ...parts] = event.data.metadata.split(':')
    const [gameId] = parts
    const game = GAMES.find((x) => x.id === gameId)
    return { game }
  } catch {
    return {}
  }
}
