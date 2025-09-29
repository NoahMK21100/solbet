import { GambaTransaction } from 'gamba-core-v2'
import { GAMES } from './games'

/**
 * Truncates a string to show only the beginning and end with ellipsis in between
 * @param s - The string to truncate
 * @param startLen - Number of characters to show at the start (default: 4)
 * @param endLen - Number of characters to show at the end (default: same as startLen)
 * @returns Truncated string in format "abcd...wxyz"
 * @example truncateString("1234567890", 3, 3) // "123...890"
 */
export const truncateString = (s: string, startLen = 4, endLen = startLen) => s.slice(0, startLen) + '...' + s.slice(-endLen)

/**
 * Extracts game metadata from a Gamba transaction event
 * Parses the metadata string to identify which game was played
 * @param event - Gamba transaction event of type 'GameSettled'
 * @returns Object containing the game information or empty object if parsing fails
 * @example 
 * // For metadata "0:flip:heads" returns { game: { id: "flip", name: "Coin Flip", ... } }
 * // For invalid metadata returns {}
 */
export const extractMetadata = (event: GambaTransaction<'GameSettled'>) => {
  try {
    // Split metadata by colon: "0:flip:heads" -> ["0", "flip", "heads"]
    const [version, ...parts] = event.data.metadata.split(':')
    const [gameId] = parts // Get the game ID (e.g., "flip")
    
    // Find the game configuration from GAMES array
    const game = GAMES.find((x) => x.id === gameId)
    return { game }
  } catch {
    // Return empty object if metadata parsing fails
    return {}
  }
}
