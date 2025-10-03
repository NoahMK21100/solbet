// Centralized SOL price fetching service using CoinGecko API
// Uses API key for higher rate limits (10,000 calls/month)
// Refreshes every 5 minutes to spread usage over the month

interface PriceCache {
  price: number
  timestamp: number
}

let priceCache: PriceCache | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=false'
const API_KEY = 'CG-RD1YLTvdfSCx48x9scqkdwqD'

// Fetch SOL price from CoinGecko API with key
const fetchSolPriceFromCoinGecko = async (): Promise<number> => {
  try {
    const response = await fetch(COINGECKO_API_URL, {
      headers: {
        'Accept': 'application/json',
        'x-cg-demo-api-key': API_KEY,
      }
    })
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.solana && data.solana.usd) {
      return parseFloat(data.solana.usd)
    } else {
      throw new Error('Invalid CoinGecko API response format')
    }
  } catch (error) {
    console.error('Failed to fetch SOL price from CoinGecko:', error)
    throw error
  }
}

// Get SOL price with caching
export const getSolPrice = async (): Promise<number> => {
  const now = Date.now()
  
  // Check if we have a valid cached price
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
    return priceCache.price
  }
  
  try {
    // Fetch new price from CoinGecko
    const price = await fetchSolPriceFromCoinGecko()
    
    // Update cache
    priceCache = {
      price,
      timestamp: now
    }
    
    // Price updated successfully
    return price
    
  } catch (error) {
    console.error('Failed to fetch SOL price:', error)
    
    // Return cached price if available, otherwise fallback
    if (priceCache) {
      console.log('⚠️ Using cached SOL price due to API error')
      return priceCache.price
    }
    
    // Ultimate fallback
    console.log('⚠️ Using fallback SOL price: $100')
    return 100
  }
}

// Force refresh price (bypasses cache)
export const refreshSolPrice = async (): Promise<number> => {
  priceCache = null
  return getSolPrice()
}

// Get cached price without API call
export const getCachedSolPrice = (): number | null => {
  const now = Date.now()
  
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
    return priceCache.price
  }
  
  return null
}

// Initialize price fetching with automatic refresh
export const initializePriceService = () => {
  // Fetch initial price
  getSolPrice()
  
  // Set up automatic refresh every 5 minutes
  const interval = setInterval(() => {
    getSolPrice()
  }, CACHE_DURATION)
  
  // Price service initialized
  
  return () => clearInterval(interval)
}
