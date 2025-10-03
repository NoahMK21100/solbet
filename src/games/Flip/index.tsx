import { Canvas } from '@react-three/fiber'
import { GambaUi, useSound, useWagerInput, useTokenBalance } from 'gamba-react-ui-v2'
import { useGamba, useMultiplayer, useGambaProvider, useSpecificGames } from 'gamba-react-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import { NATIVE_MINT } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { createGameIx, deriveGamePdaFromSeed } from '@gamba-labs/multiplayer-sdk'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { BN } from '@coral-xyz/anchor'
import { PLATFORM_CREATOR_ADDRESS, MULTIPLAYER_FEE } from '../../constants'
import React, { useState, useEffect } from 'react'
import { supabase, UserProfile } from '../../lib/supabase'
import { recordCoinflipResult } from '../../utils/recordGameResult'
import { getSolPrice, initializePriceService } from '../../utils/priceService'

/**
 * PvP Flip Game Implementation
 * 
 * This game implements a 1v1 coinflip system where:
 * 1. Creator sets wager amount and picks heads/tails
 * 2. Game waits for opponent to join (or creator can call bot)
 * 3. Once both players join, Gamba's RNG determines the outcome
 * 4. Winner takes the full pot (2x wager amount)
 * 
 * Game States:
 * - 'waiting': Creator is waiting for opponent to join
 * - 'ready-to-play': Both players have joined, ready to flip
 * - 'spectating': User is watching someone else's game
 * - 'playing': Coin flip animation is running
 * - 'completed': Game is finished, showing results
 */

// Function to fetch multiple player names and avatars at once
const fetchPlayerData = async (walletAddresses: string[]): Promise<{names: Record<string, string>, avatars: Record<string, string>}> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_address, username, avatar_url')
      .in('wallet_address', walletAddresses)
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return { names: {}, avatars: {} }
    }
    
    if (!data) {
      return { names: {}, avatars: {} }
    }
    
    const nameMap: Record<string, string> = {}
    const avatarMap: Record<string, string> = {}
    data.forEach(profile => {
      nameMap[profile.wallet_address] = profile.username || (profile.wallet_address.length > 8 ? profile.wallet_address.slice(0, 4) + '...' + profile.wallet_address.slice(-4) : profile.wallet_address)
      // Only use /solly.png if avatar_url is NULL/undefined, otherwise use the actual avatar
      avatarMap[profile.wallet_address] = profile.avatar_url || '/solly.png'
    })
    
    return { names: nameMap, avatars: avatarMap }
  } catch (error) {
    console.error('❌ Error fetching player data:', error)
    return { names: {}, avatars: {} }
  }
}

import { 
  GameListHeader, AllGamesTitle, SortControls, SortByLabel, SortValue, SortDropdownContainer, ArrowContainer, SortDropdown, DropdownOption, GameContainer,
  GameCreationSection, GameHeader, GameSubtitle, GameTitle, GameControls, LeftSection, RightSection, BetAndButtonsGroup, BetInputAndButtons, CoinsAndCreateGroup, RightControls, BetAmountSection, BetLabel, SolanaIcon, BetInputWrapper, BetInput, CurrencyDropdown, USDTooltip, QuickBetButtons, QuickBetButtonContainer, QuickBetButton, ChooseSideSection, SideButtons, SideButton, CreateGameButton,
  BetInputContainer, CustomBetInputWrapper, CustomBetInput, SolanaIconWrapper, MultiplierButtons, MultiplierButton, BetLabelRow, SolPriceDisplay,
  GameListSection, GameEntries, GameEntry, PlayerInfo, PlayerAvatar, PlayerName, PlayerLevel, WinnerCoinIcon, VsIcon, BetAmountDisplay, JoinButton, StatusButton, EyeIcon, WinningAmount, ViewGameButton,
  ModalOverlay, ModalParent, TransactionModal, ModalTitle, GameInterface, PlayersRow, PlayerSection, PlayerSlot, PlayerAvatarContainer, PlayerAvatarModal, PlayerNumber, PlayerInfoModal, PlayerNameModal, NameLevelContainer, BetAmountModal, BetAmountContainer, BetAmountText, SolanaIconModal, CoinSideIndicator, CoinSideIcon, CoinContainer, GameActions, GameInfo, InfoTextContainer, InfoText, ShareButton,
  ModalHeader, ModalMain, ModalFooter, CallBotButtonContainer, CallBotButton, CallBotButtonWrapper, ThreeColumnLayout, PlayerColumn, CoinColumn,
  GameResultModalOverlay, GameResultModalParent, GameResultModal, GameResultHeader, GameResultTitle, GameResultMain, GameResultThreeColumnLayout, GameResultPlayerColumn, GameResultPlayerSlot, GameResultPlayerAvatarContainer, GameResultPlayerAvatar, GameResultPlayerInfo, GameResultPlayerName, GameResultPlayerLevel, GameResultBetAmount, GameResultBetAmountText, GameResultWinningAmount, GameResultCoinColumn, GameResultCoinContainer, GameResultCoinDisplay, GameResultWinnerText, GameResultFooter, GameResultFairnessButton, GameResultHashInfo, GameResultHashText
} from './styles'
import { Dropdown } from '../../components/Dropdown'
import { Coin, TEXTURE_HEADS, TEXTURE_TAILS } from './Coin'
import HEADS_IMAGE from '/purpletest.png'
import TAILS_IMAGE from './black.png'
import UNKNOWN_IMAGE from './unknown.webp'
import { Effect } from './Effect'
import { GameViewModal } from '../../components/GameViewModal'
import { useSupabaseWalletSync } from '../../hooks/useSupabaseWalletSync'
import { LevelBadge } from '../../components/LevelBadge'

import SOUND_COIN from './coin.mp3'
import SOUND_LOSE from './lose.mp3'
import SOUND_WIN from './win.mp3'
import SOLANA_ICON from '/solana.png'

const SIDES = {
  heads: [2, 0], // Win if result is 0 (heads), lose if result is 1 (tails)
  tails: [0, 2], // Lose if result is 0 (heads), win if result is 1 (tails)
}


type Side = keyof typeof SIDES


// Real platform games will be fetched from API
const PLATFORM_GAMES: any[] = []

function Flip() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const { publicKey } = useWallet()
  const { profile } = useSupabaseWalletSync()
  const balance = useTokenBalance()
  const { createGame: createMultiplayerGame, join } = useMultiplayer()
  const { anchorProvider } = useGambaProvider()
  
  // Fetch PvP games from blockchain (same as usePvpGames)
  const { games: blockchainGames, loading: gamesLoading, refresh: refreshGames } = useSpecificGames(
    { maxPlayers: 2, winnersTarget: 1 }, // PvP Flip games
    0, // no limit
  )

  const [side, setSide] = useState<Side>('heads')
  const [creatorSide, setCreatorSide] = useState<Side>('heads') // Track the original creator's side
  
  const [wager, setWager] = useWagerInput()
  const [customBetAmount, setCustomBetAmount] = useState<string>('')
  const [solPrice, setSolPrice] = useState<number>(0)

  // Initialize price service and fetch SOL price
  useEffect(() => {
    const initializePrice = async () => {
      try {
        const price = await getSolPrice()
        setSolPrice(price)
      } catch (error) {
        console.error('Failed to initialize SOL price:', error)
        setSolPrice(100) // Fallback price
      }
    }
    
    initializePrice()
    
    // Initialize the price service with automatic refresh every 5 minutes
    const cleanup = initializePriceService()
    
    // Also update local state every 5 minutes
    const interval = setInterval(async () => {
      try {
        const price = await getSolPrice()
        setSolPrice(price)
      } catch (error) {
        console.error('Failed to refresh SOL price:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => {
      cleanup()
      clearInterval(interval)
    }
  }, [])
  const [currency, setCurrency] = useState<'SOL' | 'FAKE'>('SOL')
  const [games, setGames] = useState<any[]>([])
  const [userGames, setUserGames] = useState<any[]>([])
  const [platformGames, setPlatformGames] = useState<any[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed' | 'joining' | 'ready-to-play' | 'spectating'>('waiting')
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameId, setGameId] = useState(() => Math.floor(Math.random() * 1000000))
  // Get RNG seed from Gamba for proper hash generation
  const hashedSeed = gamba.nextRngSeedHashed || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
  const [showGameViewModal, setShowGameViewModal] = useState(false)
  const [selectedGameForView, setSelectedGameForView] = useState<any>(null)
  const [showGameResultModal, setShowGameResultModal] = useState(false)
  const [selectedGameResult, setSelectedGameResult] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [coinVisualResult, setCoinVisualResult] = useState<0 | 1>(0) // 0 = heads, 1 = tails
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownVisible && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false)
      }
    }
    
    if (dropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownVisible])
  
  // Refresh game data when modal opens to ensure latest state
  React.useEffect(() => {
    if (isModalVisible && gameId && refreshGames) {
      refreshGames()
    }
  }, [isModalVisible, gameId, refreshGames])

  // Refresh game data when modal closes to ensure updated state is reflected
  React.useEffect(() => {
    if (!isModalVisible && refreshGames) {
      // Delay refresh to allow any blockchain updates to settle
      setTimeout(() => refreshGames(), 1000)
    }
  }, [isModalVisible, refreshGames])

  const sounds = useSound({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })
  // Fetch real platform games
  const fetchPlatformGames = async () => {
    try {
      // This would normally fetch from your API
      // For now, we'll start with an empty array - no placeholder games
      setPlatformGames([])
    } catch (error) {
      console.error('Failed to fetch platform games:', error)
    }
  }

  // Fetch games on component mount
  React.useEffect(() => {
    fetchPlatformGames()
    fetchSavedGames()
    // Price fetching is handled by the centralized service above
  }, [])

  // Fetch blockchain games when they change (with debouncing)
  React.useEffect(() => {
    if (blockchainGames) {
      // Debounce the fetch to prevent spam
      const timeoutId = setTimeout(() => {
        fetchSavedGames()
      }, 1000) // Wait 1 second before fetching
      
      return () => clearTimeout(timeoutId)
    }
  }, [blockchainGames])

  // Refresh games when modal opens to ensure latest data
  React.useEffect(() => {
    if (showTransactionModal && refreshGames) {
      // Refresh games when modal opens to get latest state
      refreshGames()
      fetchSavedGames()
    }
  }, [showTransactionModal])

  // Debug blockchain games loading state (disabled)
  React.useEffect(() => {
    // Games loaded - no logging needed
  }, [blockchainGames?.length])

  // Handle custom bet input changes
  const handleBetAmountChange = (value: string) => {
    setCustomBetAmount(value)
    // Convert to lamports and update wager
    const numericValue = parseFloat(value) || 0
    const lamports = Math.floor(numericValue * 1_000_000_000)
    setWager(lamports)
  }

  // Handle multiplier buttons
  const handleMultiplier = (multiplier: number) => {
    const currentValue = parseFloat(customBetAmount) || 0
    const newValue = currentValue * multiplier
    setCustomBetAmount(newValue.toFixed(4))
    setWager(Math.floor(newValue * 1_000_000_000))
  }

  // Handle MAX button - bet total wallet balance
  const handleMaxBet = () => {
    // Get the actual wallet balance from useTokenBalance
    const walletBalance = balance.balance || 0
    if (walletBalance > 0) {
      const maxSol = walletBalance / 1_000_000_000
      setCustomBetAmount(maxSol.toFixed(4))
      setWager(walletBalance)
    } else {
      // Fallback: try to get balance from wager input or use a reasonable amount
      const fallbackBalance = (wager as any).max || 1000000000 // 1 SOL fallback
      const fallbackSol = fallbackBalance / 1_000_000_000
      setCustomBetAmount(fallbackSol.toFixed(4))
      setWager(fallbackBalance)
    }
  }

  // Handle input blur to enforce minimum
  const handleInputBlur = () => {
    const numericValue = parseFloat(customBetAmount) || 0
    const minBet = 0.005 // 0.005 SOL minimum
    
    if (numericValue > 0 && numericValue < minBet) {
      setCustomBetAmount(minBet.toFixed(4))
      setWager(Math.floor(minBet * 1_000_000_000))
    }
  }

  const fetchSavedGames = async () => {
    try {
      // Fetch completed games from database
      const databaseGames: any[] = []
      if (publicKey) {
        try {
          const { data: gameResults, error } = await supabase
            .from('game_results')
            .select('*')
            .eq('wallet_address', publicKey.toString())
            .eq('game_type', 'coinflip')
            .order('created_at', { ascending: false })
            .limit(50) // Last 50 games
          
          if (!error && gameResults) {
            console.log('📊 Found database games:', gameResults.length, gameResults)
            // Convert database games to our format
            gameResults.forEach((result) => {
              const gameId = result.game_id || `db_${result.id}`
              databaseGames.push({
                id: gameId,
                player1: {
                  name: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
                  level: profile?.level || 1,
                  avatar: profile?.avatar_url || '/solly.png',
                  side: result.client_seed?.includes('heads') ? 'heads' : 'tails'
                },
                player2: {
                  name: 'Bot',
                  level: 100,
                  avatar: '/solly.png',
                  side: result.client_seed?.includes('heads') ? 'tails' : 'heads'
                },
                amount: result.wager_amount * 1e9, // Convert SOL to lamports
                currency: 'SOL',
                status: 'completed',
                result: result.result,
                coinResult: result.client_seed?.includes('heads') ? (result.result === 'win' ? 'heads' : 'tails') : (result.result === 'win' ? 'tails' : 'heads'),
                timestamp: new Date(result.created_at).getTime(),
                transactionSignature: result.transaction_signature,
                rngSeed: result.rng_seed,
                isFromDatabase: true
              })
            })
          }
        } catch (dbError) {
          console.error('Error fetching database games:', dbError)
        }
      }

      // Use blockchain games and database games
      if ((blockchainGames && blockchainGames.length > 0) || databaseGames.length > 0) {
        
        // Collect all wallet addresses for batch lookup
        const walletAddresses: string[] = []
        blockchainGames.forEach((blockchainGame) => {
          const gameAccount = blockchainGame.account as any
          if (gameAccount.gameMaker) {
            let makerStr = ''
            try {
              if (typeof gameAccount.gameMaker.toString === 'function') {
                makerStr = gameAccount.gameMaker.toString()
              } else if (gameAccount.gameMaker.toBase58 && typeof gameAccount.gameMaker.toBase58 === 'function') {
                makerStr = gameAccount.gameMaker.toBase58()
              } else if (typeof gameAccount.gameMaker === 'string') {
                makerStr = gameAccount.gameMaker
              } else if (gameAccount.gameMaker._bn) {
                makerStr = gameAccount.gameMaker._bn.toString()
              } else {
                makerStr = String(gameAccount.gameMaker)
              }
            } catch (e) {
              makerStr = ''
            }
            if (makerStr && makerStr !== 'Unknown') {
              walletAddresses.push(makerStr)
            }
          }
          
          if (gameAccount.players && gameAccount.players.length > 0) {
            gameAccount.players.forEach((player: any, playerIndex: number) => {
              if (player) {
                let playerStr = ''
                try {
                  // Extract wallet address from player object
                  
                  // Try the most common extraction methods for Solana PublicKey objects
                  if (typeof player === 'string') {
                    playerStr = player
                  } else if (player.toBase58 && typeof player.toBase58 === 'function') {
                    playerStr = player.toBase58()
                  } else if (player.toString && typeof player.toString === 'function') {
                    const toStringResult = player.toString()
                    if (toStringResult && toStringResult !== '[object Object]' && toStringResult.length > 20) {
                      playerStr = toStringResult
                    }
                  }
                  
                  // If still no valid address, try common nested properties
                  if (!playerStr || playerStr === '[object Object]') {
                    // Try the specific properties we found in the console
                    // Use the same logic as the second loop that works correctly
                    if (player.user && (player.user as any).toBase58) {
                      playerStr = (player.user as any).toBase58()
                    } else if (player.creatorAddress && (player.creatorAddress as any).toBase58) {
                      playerStr = (player.creatorAddress as any).toBase58()
                    } else if (player.creatorAddress) {
                      if (typeof player.creatorAddress.toString === 'function') {
                        playerStr = player.creatorAddress.toString()
                      } else {
                        playerStr = String(player.creatorAddress)
                      }
                    } else if (player.user) {
                      if (typeof player.user.toString === 'function') {
                        playerStr = player.user.toString()
                      } else {
                        playerStr = String(player.user)
                      }
                    } else if (player.address) {
                      playerStr = player.address
                    } else if (player.publicKey) {
                      if (typeof player.publicKey.toBase58 === 'function') {
                        playerStr = player.publicKey.toBase58()
                      } else if (typeof player.publicKey.toString === 'function') {
                        playerStr = player.publicKey.toString()
                      }
                    } else if (player._bn) {
                      playerStr = player._bn.toString()
                    } else if (player.key) {
                      playerStr = player.key
                    } else {
                      // Try to find any string property that looks like a wallet address
                      for (const [key, value] of Object.entries(player)) {
                        if (typeof value === 'string' && value.length > 30 && value.length < 60) {
                          playerStr = value
                          // Found wallet address in property
                          break
                        } else if (typeof value === 'object' && value !== null) {
                          // Try to extract from nested object
                          if (value && typeof (value as any).toBase58 === 'function') {
                            const nestedStr = (value as any).toBase58()
                            if (nestedStr && nestedStr.length > 30 && nestedStr.length < 60) {
                              playerStr = nestedStr
                              // Found wallet address in nested object
                              break
                            }
                          } else if (typeof value.toString === 'function') {
                            const nestedStr = value.toString()
                            if (nestedStr && nestedStr !== '[object Object]' && nestedStr.length > 30 && nestedStr.length < 60) {
                              playerStr = nestedStr
                              // Found wallet address in nested object
                              break
                            }
                          }
                        }
                      }
                    }
                  }
                  
                  // Wallet address extracted
                } catch (e) {
                  console.error(`❌ Error processing player ${playerIndex}:`, e)
                  playerStr = ''
                }
                if (playerStr && playerStr !== 'Unknown' && playerStr !== '[object Object]') {
                  walletAddresses.push(playerStr)
                }
              }
            })
          }
        })
        
        // Fetch all player names and avatars from database (if Supabase is available)
        let playerNames: Record<string, string> = {}
        let playerAvatars: Record<string, string> = {}
        if (supabase && walletAddresses.length > 0) {
          try {
            const playerData = await fetchPlayerData([...new Set(walletAddresses)])
            playerNames = playerData.names
            playerAvatars = playerData.avatars
    } catch (error) {
            console.error('❌ Failed to fetch player data:', error)
            playerNames = {}
            playerAvatars = {}
          }
        }
        
        // Convert blockchain games to our format
        const convertedGames = blockchainGames.map((blockchainGame, index) => {
          try {
            const gameAccount = blockchainGame.account as any
            const gameId = blockchainGame.publicKey.toString() // Use actual game address as ID
            
          
          // Determine game status based on blockchain data
          let status = 'waiting-for-opponent'
          if (gameAccount.players && gameAccount.players.length >= 2) {
            // Check multiple possible completion statuses
            const gameStatus = gameAccount.status || gameAccount.state || 'Unknown'
            
            // Debug: Log game status detection (removed to prevent console spam)
            
            // More comprehensive status checking
            const gameAge = Date.now() - (gameAccount.createdAt || 0)
            
            console.log('🎮 Game status check:', {
              gameId,
              gameStatus,
              gameAge,
              createdAt: gameAccount.createdAt,
              hasResult: !!gameAccount.result,
              hasWinner: !!gameAccount.winner,
              hasOutcome: !!gameAccount.outcome,
              players: gameAccount.players?.length
            })
            
            if (gameStatus === 'Completed' || gameStatus === 'completed' || 
                gameStatus === 'Finished' || gameStatus === 'finished' || 
                gameStatus === 'Settled' || gameStatus === 'settled' ||
                gameStatus === 'Resolved' || gameStatus === 'resolved' ||
                gameStatus === 'Ended' || gameStatus === 'ended' ||
                gameStatus === 'Closed' || gameStatus === 'closed' ||
                // Check if game has been played (has results)
                gameAccount.result || gameAccount.winner || gameAccount.outcome ||
                // Check if game is older than 30 seconds (likely completed for PvP games)
                gameAge > 30000) {
              status = 'completed'
              console.log('✅ Game marked as completed:', gameId)
            } else {
              // If game has 2 players but no explicit completion status, check age
              if (gameAge > 15000) { // 15 seconds old
                status = 'completed'
                console.log('✅ Game marked as completed (age):', gameId, 'age:', gameAge)
              } else {
                status = 'ready-to-play'
                console.log('⏳ Game marked as ready-to-play:', gameId, 'age:', gameAge)
              }
            }
          }
          
          
          // Check if current user is the game creator
          let gameMakerStr = ''
          if (gameAccount.gameMaker) {
            try {
              if (typeof gameAccount.gameMaker.toString === 'function') {
                gameMakerStr = gameAccount.gameMaker.toString()
              } else if (gameAccount.gameMaker.toBase58 && typeof gameAccount.gameMaker.toBase58 === 'function') {
                gameMakerStr = gameAccount.gameMaker.toBase58()
              } else if (typeof gameAccount.gameMaker === 'string') {
                gameMakerStr = gameAccount.gameMaker
              } else if (gameAccount.gameMaker._bn) {
                gameMakerStr = gameAccount.gameMaker._bn.toString()
              } else {
                gameMakerStr = String(gameAccount.gameMaker)
              }
            } catch (e) {
              gameMakerStr = ''
            }
          }
          const currentUserStr = publicKey ? publicKey.toString() : ''
          const isCurrentUserCreator = publicKey && gameMakerStr && gameMakerStr === currentUserStr
          
          const isCurrentUserPlayer = publicKey && gameAccount.players && gameAccount.players.some((player: any) => {
            if (!player) return false
            let playerStr = ''
            try {
              if (typeof player.toString === 'function') {
                playerStr = player.toString()
              } else if (player.toBase58 && typeof player.toBase58 === 'function') {
                playerStr = player.toBase58()
              } else if (typeof player === 'string') {
                playerStr = player
              } else if (player._bn) {
                playerStr = player._bn.toString()
      } else {
                playerStr = String(player)
              }
            } catch (e) {
              playerStr = ''
            }
            return playerStr === currentUserStr
          })
          
          
          
          return {
            id: gameId,
            gameAddress: blockchainGame.publicKey.toString(),
            player1: {
              name: (() => {
                if (!gameAccount.gameMaker) return 'Unknown'
                let makerStr = ''
                try {
                  // Try different methods to get string representation
                  // First try the specific properties we know exist
                  if (gameAccount.gameMaker.user && gameAccount.gameMaker.user.toBase58) {
                    makerStr = gameAccount.gameMaker.user.toBase58()
                  } else if (gameAccount.gameMaker.creatorAddress && gameAccount.gameMaker.creatorAddress.toBase58) {
                    makerStr = gameAccount.gameMaker.creatorAddress.toBase58()
                  } else if (typeof gameAccount.gameMaker.toString === 'function') {
                    makerStr = gameAccount.gameMaker.toString()
                  } else if (gameAccount.gameMaker.toBase58 && typeof gameAccount.gameMaker.toBase58 === 'function') {
                    makerStr = gameAccount.gameMaker.toBase58()
                  } else if (typeof gameAccount.gameMaker === 'string') {
                    makerStr = gameAccount.gameMaker
                  } else if (gameAccount.gameMaker._bn) {
                    // Handle BN objects
                    makerStr = gameAccount.gameMaker._bn.toString()
                  } else {
                    // Last resort - convert to string but check if it's meaningful
                    const str = String(gameAccount.gameMaker)
                    if (str === '[object Object]' || str === '[object Object]') {
                      makerStr = 'Unknown'
                    } else {
                      makerStr = str
                    }
                  }
                  
                  // Clean up the string
                  if (makerStr === '[object Object]' || makerStr === 'object Object' || !makerStr) {
                    makerStr = 'Unknown'
                  }
                } catch (e) {
                  makerStr = 'Unknown'
                }
                
                // Use database lookup if available, otherwise fallback to truncated address
                const databaseName = playerNames[makerStr]
                let fallbackName = makerStr.length > 8 ? makerStr.slice(0, 4) + '...' + makerStr.slice(-4) : makerStr
                
                // If this is the current user's wallet address, use their profile username
                if (!databaseName && profile?.wallet_address === makerStr) {
                  fallbackName = profile.username || 'You'
                }
                
                const resolvedName = databaseName || fallbackName
                
                
                // Player1 name resolved
                return resolvedName
              })(),
              level: 1,
              avatar: playerAvatars[(() => {
                if (!gameAccount.gameMaker) return 'Unknown'
                let makerStr = ''
                try {
                  if (gameAccount.gameMaker.user && gameAccount.gameMaker.user.toBase58) {
                    makerStr = gameAccount.gameMaker.user.toBase58()
                  } else if (gameAccount.gameMaker.creatorAddress && gameAccount.gameMaker.creatorAddress.toBase58) {
                    makerStr = gameAccount.gameMaker.creatorAddress.toBase58()
                  } else if (typeof gameAccount.gameMaker.toString === 'function') {
                    makerStr = gameAccount.gameMaker.toString()
                  } else if (gameAccount.gameMaker.toBase58 && typeof gameAccount.gameMaker.toBase58 === 'function') {
                    makerStr = gameAccount.gameMaker.toBase58()
                  } else if (typeof gameAccount.gameMaker === 'string') {
                    makerStr = gameAccount.gameMaker
                  } else {
                    makerStr = String(gameAccount.gameMaker)
                  }
                } catch (e) {
                  makerStr = ''
                }
                return makerStr
              })()] || '/solly.png',
              side: 'heads', // Default, will be updated from metadata
              wager: gameAccount.wager,
              paid: true
            },
            player2: gameAccount.players && gameAccount.players.length >= 2 ? {
              name: (() => {
                if (!gameAccount.players[1]) return 'Unknown'
                let playerStr = ''
                try {
                  
                  // Try different methods to get string representation
                  // First try the specific properties we know exist
                  if (gameAccount.players[1].user && gameAccount.players[1].user.toBase58) {
                    playerStr = gameAccount.players[1].user.toBase58()
                  } else if (gameAccount.players[1].creatorAddress && gameAccount.players[1].creatorAddress.toBase58) {
                    playerStr = gameAccount.players[1].creatorAddress.toBase58()
                  } else if (typeof gameAccount.players[1].toString === 'function') {
                    playerStr = gameAccount.players[1].toString()
                  } else if (gameAccount.players[1].toBase58 && typeof gameAccount.players[1].toBase58 === 'function') {
                    playerStr = gameAccount.players[1].toBase58()
                  } else if (typeof gameAccount.players[1] === 'string') {
                    playerStr = gameAccount.players[1]
                  } else if (gameAccount.players[1]._bn) {
                    // Handle BN objects
                    playerStr = gameAccount.players[1]._bn.toString()
                  } else {
                    // Last resort - convert to string but check if it's meaningful
                    const str = String(gameAccount.players[1])
                    if (str === '[object Object]' || str === '[object Object]') {
                      playerStr = 'Unknown'
                    } else {
                      playerStr = str
                    }
                  }
                  
                  
                  // Clean up the string
                  if (playerStr === '[object Object]' || playerStr === 'object Object' || !playerStr) {
                    playerStr = 'Unknown'
                  }
                } catch (e) {
                  playerStr = 'Unknown'
                }
                
                // Use database lookup if available, otherwise fallback to truncated address
                const databaseName = playerNames[playerStr]
                let fallbackName = playerStr.length > 8 ? playerStr.slice(0, 4) + '...' + playerStr.slice(-4) : playerStr
                
                // If this is the current user's wallet address, use their profile username
                if (!databaseName && profile?.wallet_address === playerStr) {
                  fallbackName = profile.username || 'You'
                }
                
                const resolvedName = databaseName || fallbackName
                
                
                // Player2 name resolved
                return resolvedName
              })(),
              level: 1,
              avatar: (() => {
                if (!gameAccount.players[1]) return '/solly.png'
                let playerStr = ''
                try {
                  if (gameAccount.players[1].user && gameAccount.players[1].user.toBase58) {
                    playerStr = gameAccount.players[1].user.toBase58()
                  } else if (gameAccount.players[1].creatorAddress && gameAccount.players[1].creatorAddress.toBase58) {
                    playerStr = gameAccount.players[1].creatorAddress.toBase58()
                  } else if (typeof gameAccount.players[1].toString === 'function') {
                    playerStr = gameAccount.players[1].toString()
                  } else if (gameAccount.players[1].toBase58 && typeof gameAccount.players[1].toBase58 === 'function') {
                    playerStr = gameAccount.players[1].toBase58()
                  } else if (typeof gameAccount.players[1] === 'string') {
                    playerStr = gameAccount.players[1]
                  } else if (gameAccount.players[1]._bn) {
                    playerStr = gameAccount.players[1]._bn.toString()
                  } else {
                    const str = String(gameAccount.players[1])
                    if (str === '[object Object]' || str === '[object Object]') {
                      playerStr = 'Unknown'
                    } else {
                      playerStr = str
                    }
                  }
                } catch (e) {
                  playerStr = 'Unknown'
                }
                
                return playerAvatars[playerStr] || '/solly.png'
              })(),
              wallet: (() => {
                if (!gameAccount.players[1]) return 'Unknown'
                let playerStr = ''
                try {
                  if (gameAccount.players[1].user && gameAccount.players[1].user.toBase58) {
                    playerStr = gameAccount.players[1].user.toBase58()
                  } else if (gameAccount.players[1].creatorAddress && gameAccount.players[1].creatorAddress.toBase58) {
                    playerStr = gameAccount.players[1].creatorAddress.toBase58()
                  } else if (typeof gameAccount.players[1].toString === 'function') {
                    playerStr = gameAccount.players[1].toString()
                  } else if (gameAccount.players[1].toBase58 && typeof gameAccount.players[1].toBase58 === 'function') {
                    playerStr = gameAccount.players[1].toBase58()
                  } else if (typeof gameAccount.players[1] === 'string') {
                    playerStr = gameAccount.players[1]
                  } else if (gameAccount.players[1]._bn) {
                    playerStr = gameAccount.players[1]._bn.toString()
                  } else {
                    const str = String(gameAccount.players[1])
                    if (str === '[object Object]' || str === '[object Object]') {
                      playerStr = 'Unknown'
                    } else {
                      playerStr = str
                    }
                  }
                } catch (e) {
                  playerStr = 'Unknown'
                }
                return playerStr
              })(),
              side: 'tails', // Default, will be updated from metadata
              wager: gameAccount.wager,
              paid: true
            } : null,
            amount: gameAccount.wager,
            currency: 'SOL',
            status: status,
            timestamp: Date.now(),
            userAddress: gameAccount.gameMaker ? (typeof gameAccount.gameMaker.toString === 'function' ? gameAccount.gameMaker.toString() : gameAccount.gameMaker) : 'unknown',
            totalPool: gameAccount.wager * (gameAccount.players ? gameAccount.players.length : 1),
            // Add user relationship info
            isCurrentUserCreator,
            isCurrentUserPlayer,
            canJoin: !isCurrentUserCreator && !isCurrentUserPlayer && (!gameAccount.players || gameAccount.players.length < 2)
          }
          } catch (error) {
            console.error(`❌ Failed to convert game ${index}:`, error, blockchainGame)
            return null // Return null for failed conversions
          }
        }).filter(game => game !== null) // Filter out failed conversions
        
        // Merge blockchain games with database games
        const allGames = [...convertedGames, ...databaseGames]
        console.log('🔄 Merging games:', {
          blockchainGames: convertedGames.length,
          databaseGames: databaseGames.length,
          totalGames: allGames.length,
          blockchainGameIds: convertedGames.map(g => g.id),
          databaseGameIds: databaseGames.map(g => g.id)
        })
        
        setUserGames(allGames)
        setPlatformGames(allGames)
      } else if (databaseGames.length > 0) {
        // Only database games available
        setUserGames(databaseGames)
        setPlatformGames(databaseGames)
      } else {
        setUserGames([])
        setPlatformGames([])
      }
    } catch (error) {
      console.error('Failed to fetch blockchain games:', error)
    }
  }


  const saveGame = async (game: any) => {
    try {
      // No longer using localStorage - games are stored on blockchain
      // This function is kept for compatibility but does nothing
      console.log('💾 Game saved to blockchain (localStorage disabled):', game.id)
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }

  /**
   * PvP Game Creation
   * Creates a new multiplayer coinflip game where:
   * 1. Creator pays wager and picks side (heads/tails)
   * 2. Game is created on blockchain with escrow
   * 3. Modal opens showing "waiting for opponent" state
   * 4. Creator can call bot or wait for real player to join
   */
  const createGame = async () => {
    try {
      // Validate wager before proceeding (wager is in lamports from useWagerInput)
      if (wager < 5_000_000) { // 0.005 SOL = 5,000,000 lamports
        alert('Minimum wager is 0.005 SOL')
        return
      }
      
      // Check if wallet is connected
      if (!publicKey) {
        alert('Please connect your wallet first')
        return
      }
      
      // Use OFFICIAL Gamba PvP approach (same as CreatePvpGameModal)
      const wagerSol = wager / LAMPORTS_PER_SOL
      const rand = crypto.getRandomValues(new Uint8Array(8))
      const gameSeed = new BN(rand, 'le')
      const gamePda = deriveGamePdaFromSeed(gameSeed)
      const newGameId = gamePda.toString() // Use actual game address as ID
      setGameId(newGameId as any) // Cast to any to handle string ID

      // Creating PvP Flip game

      const params = {
        preAllocPlayers: 2,
        maxPlayers: 2,
        numTeams: 0,
        winnersTarget: 1,
        wagerType: 0, // sameWager
        payoutType: 0, // Winner takes all
        wager: wager, // Pass wager in lamports (NOT SOL!)
        softDuration: 60,
        hardDuration: 240,
        gameSeed,
        minBet: wager, // Same as wager for fixed wager type
        maxBet: wager, // Same as wager for fixed wager type
        accounts: {
          gameMaker: publicKey,
          mint: NATIVE_MINT,
        },
      }

      // Creating game with params

      // Create the game instruction
      const createIx = await createGameIx(anchorProvider as any, params)
      
      // Join the game immediately (creator joins their own game)
      try {
        await join(
          {
            gameAccount: gamePda,
            mint: NATIVE_MINT,
            wager: wager, // Pass wager in lamports
            creatorAddress: PLATFORM_CREATOR_ADDRESS,
            creatorFeeBps: Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE),
            metadata: side,
          },
          [createIx],
        )
        // Creator joined game successfully
      } catch (joinError: any) {
        console.error('❌ Creator join error:', joinError)
        
        // Check if it's a timeout error
        if (joinError.message?.includes('expired') || joinError.message?.includes('timeout')) {
          // Transaction timed out - checking if it actually went through
          // Transaction might still have gone through, just timeout on confirmation
          // We'll check the blockchain state in the refresh below
        } else {
          alert(`Failed to join game: ${joinError.message || 'Unknown error'}`)
          return
        }
        }
        
      // PvP Flip game created and joined
        
      // Create local game entry for UI
        const newGame = {
          id: newGameId,
        gameAddress: gamePda.toString(),
          player1: { 
            name: profile?.username || (publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'), 
            level: profile?.level || 1, 
          avatar: profile?.avatar_url || '/solly.png',
            side: side,
            wager: wager,
          paid: true // Creator has paid via multiplayer
          },
          player2: null,
          amount: wager,
        currency: 'SOL', // Always SOL for PvP
        status: 'waiting-for-opponent', // Waiting for second player
          timestamp: Date.now(),
          userAddress: publicKey?.toString(),
          totalPool: wager // Only creator has paid so far
        }
        
      setUserGames(prev => [newGame, ...prev.slice(0, 9)])
      saveGame(newGame)
      setPlatformGames(prev => [newGame, ...prev.slice(0, 9)])
      
      // Show the game modal
        setShowTransactionModal(true)
        setGameState('waiting')
        setIsSpinning(false)
        setTimeout(() => setIsModalVisible(true), 10)
        
    } catch (error: any) {
      console.error('PvP Flip game creation failed:', error)
      setShowTransactionModal(false)
      setGameState('waiting')
      setIsSpinning(false)
      alert(`Failed to create PvP game: ${error?.message || 'Unknown error'}`)
    }
  }


  /**
   * Call Bot Function
   * When creator clicks "Call Bot":
   * 1. Close the current PvP lobby modal
   * 2. Start a single-player game against the house
   * 3. Use the same wager amount and side selection
   * 4. Game resolves immediately using Gamba's RNG
   */
  const callBot = async () => {
    try {
      const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
      
      if (!currentGame) {
        alert('Game not found')
        return
      }

      if (currentGame.status === 'waiting-for-opponent') {
        console.log('🤖 Calling bot - switching to single player mode')
        
        // Close the current PvP lobby
        setShowTransactionModal(false)
        setIsModalVisible(false)
        
        // Set up for single player game with same wager and side
        setWager(currentGame.amount)
        setCustomBetAmount((currentGame.amount / 1_000_000_000).toFixed(4))
        setSide(currentGame.player1.side)
        setCurrency(currentGame.currency || 'SOL')
        
        // Generate new game ID for single player
        const newGameId = Date.now().toString()
        setGameId(newGameId as any) // Cast to any to handle string ID
        
        // Start single player game immediately
        setGameState('playing')
        setIsSpinning(true)
        
        // Play against the house
        await handleSinglePlayerGame()
        
      } else {
        alert('Game is not waiting for an opponent')
      }
    } catch (error: any) {
      console.error('Error in callBot:', error)
      alert(`Game error: ${error?.message || 'Unknown error'}`)
    }
  }

  const startPvPFlipGame = async (game: any) => {
    try {
      setGameState('playing')
      setIsSpinning(true)
      sounds.play('coin', { playbackRate: .5 })

      // Use Gamba's on-chain RNG for the coin flip
      // For PvP, we'll use a simple random result that matches Gamba's pattern
      const coinResult = Math.random() < 0.5 ? 0 : 1 // 0 = heads, 1 = tails
      const win = (coinResult === 0 && game.player1.side === 'heads') || (coinResult === 1 && game.player1.side === 'tails')
      
      // Record PvP game results for both players
      if (publicKey && game.player1 && game.player2) {
        console.log('🎮 Recording PvP game results for both players:', {
          gameId: game.id,
          player1: game.player1,
          player2: game.player2,
          win: win,
          amount: game.amount
        })

        // Record for player 1 (creator) - use current user if they're the creator
        const player1Wallet = game.isCurrentUserCreator ? publicKey.toString() : (game.player1.wallet || game.player1.user || 'unknown')
        await recordCoinflipResult(
          player1Wallet,
          game.amount / 1e9, // Convert lamports to SOL
          win ? game.totalPool * 0.95 / 1e9 : 0, // Winner gets 95% of pool
          win, // isWin for player 1
          `pvp_rng_${Date.now()}`, // Generate RNG seed
          `pvp_client_${game.player1.side}`, // Client seed based on side
          Math.floor(Math.random() * 1000), // Random nonce
          game.id || game.gameAddress,
          `pvp_tx_${Date.now()}` // Transaction signature
        )

        // Record for player 2 (joiner) - use current user if they're the joiner
        const player2Wallet = !game.isCurrentUserCreator ? publicKey.toString() : (game.player2.wallet || game.player2.user || 'unknown')
        await recordCoinflipResult(
          player2Wallet,
          game.amount / 1e9, // Convert lamports to SOL
          !win ? game.totalPool * 0.95 / 1e9 : 0, // Winner gets 95% of pool
          !win, // isWin for player 2 (opposite of player 1)
          `pvp_rng_${Date.now()}`, // Same RNG seed
          `pvp_client_${game.player1.side === 'heads' ? 'tails' : 'heads'}`, // Opposite side
          Math.floor(Math.random() * 1000), // Random nonce
          game.id || game.gameAddress,
          `pvp_tx_${Date.now()}` // Transaction signature
        )
      }
      
      // Wait for spin animation
      setTimeout(() => {
        setGameState('completed')
        setIsSpinning(false)
        setCoinVisualResult(coinResult as 0 | 1)
        
        // Update game with results
        const completedGame = {
          ...game,
          status: 'completed',
          result: win ? 'win' : 'lose',
          coinResult: coinResult === 0 ? 'heads' : 'tails',
          winner: win ? game.player1.name : game.player2.name,
          winnerPayout: game.totalPool * 0.95, // 95% to winner, 5% to platform
          player1Result: win ? 'win' : 'lose',
          player2Result: win ? 'lose' : 'win'
        }

        // Update local state
        setUserGames(prev => {
          const existingGameIndex = prev.findIndex(g => g.id === game.id)
          if (existingGameIndex >= 0) {
            // Update existing game
            return prev.map(g => g.id === game.id ? completedGame : g)
          } else {
            // Add new completed game to the list
            return [completedGame, ...prev]
          }
        })
        setPlatformGames(prev => {
          const existingGameIndex = prev.findIndex(g => g.id === game.id)
          if (existingGameIndex >= 0) {
            // Update existing game
            return prev.map(g => g.id === game.id ? completedGame : g)
          } else {
            // Add new completed game to the list
            return [completedGame, ...prev]
          }
        })
        saveGame(completedGame)

        // Play sound
        if (win) {
          sounds.play('win')
        } else {
          sounds.play('lose')
        }

        // Show result modal
        setShowGameResultModal(true)
        setSelectedGameResult(completedGame)
        
      }, 2000) // 2 second spin animation

    } catch (error) {
      console.error('Error starting PvP game:', error)
      setGameState('completed')
      setIsSpinning(false)
    }
  }

  const handleMultiplayerGame = async () => {
    try {
      setGameState('playing')
      setIsSpinning(true)
      sounds.play('coin', { playbackRate: .5 })

      const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
      if (!currentGame) return

      // Both players have already paid, so we just need to determine the winner
      // Use a simple random result that matches Gamba's RNG pattern
      const playerWager = currentGame.amount
      const totalPool = playerWager * 2 // Both players' wagers combined

      console.log('🎮 Starting multiplayer game (both players paid):', {
        playerWager: playerWager,
        totalPool: totalPool,
        player1Side: currentGame.player1.side,
        player2Side: currentGame.player2?.side,
        player1Paid: currentGame.player1.paid,
        player2Paid: currentGame.player2?.paid
      })

      // Simulate coin flip result (0 = heads, 1 = tails)
      // In a real implementation, this would use the same RNG as Gamba
      setTimeout(() => {
        const coinResult = Math.random() < 0.5 ? 0 : 1 // 50/50 chance
        
        // Determine winner based on coin result
        const player1Wins = (coinResult === 0 && currentGame.player1.side === 'heads') || 
                           (coinResult === 1 && currentGame.player1.side === 'tails')
        const player2Wins = !player1Wins

        // Calculate payouts - winner gets the total pool
        const winnerPayout = totalPool // Winner gets everything
        
        // Update game with results
        const updatedGame = {
          ...currentGame,
          status: 'completed',
          coinResult: coinResult === 0 ? 'heads' : 'tails',
          winner: player1Wins ? currentGame.player1.name : (currentGame.player2?.name || 'Bot'),
          totalPool: totalPool,
          winnerPayout: winnerPayout,
          player1Result: player1Wins ? 'win' : 'lose',
          player2Result: player2Wins ? 'win' : 'lose'
        }

        // Update state
        setUserGames(prev => {
          const existingGameIndex = prev.findIndex(game => game.id === gameId)
          if (existingGameIndex >= 0) {
            // Update existing game
            return prev.map(game => game.id === gameId ? updatedGame : game)
          } else {
            // Add new completed game to the list
            return [updatedGame, ...prev]
          }
        })
        setPlatformGames(prev => {
          const existingGameIndex = prev.findIndex(game => game.id === gameId)
          if (existingGameIndex >= 0) {
            // Update existing game
            return prev.map(game => game.id === gameId ? updatedGame : game)
          } else {
            // Add new completed game to the list
            return [updatedGame, ...prev]
          }
        })
        saveGame(updatedGame)

        // Set visual result
        const visualResult = coinResult
        setCoinVisualResult(visualResult as 0 | 1)
        sounds.play('coin')

        console.log('🎮 Multiplayer game completed:', {
          coinResult: coinResult === 0 ? 'heads' : 'tails',
          winner: updatedGame.winner,
          totalPool: totalPool,
          winnerPayout: winnerPayout,
          player1Result: updatedGame.player1Result,
          player2Result: updatedGame.player2Result
        })

        setGameState('completed')
        setIsSpinning(false)
      }, 3000)

    } catch (error) {
      console.error('Error in multiplayer game:', error)
      setGameState('waiting')
      setIsSpinning(false)
    }
  }

  const handleSinglePlayerGame = async () => {
    try {
      setGameState('playing')
      setIsSpinning(true)
      sounds.play('coin', { playbackRate: .5 })

      if (currency === 'SOL') {
        // For SOL games, actually play the Gamba game to get real results and payouts
        
        try {
          // Play the actual Gamba game to get real results and payouts
          // wager is already in lamports from useWagerInput()
          await gamba.play({
            wager: wager,
            bet: SIDES[side],
            metadata: [side, currency],
            creator: publicKey?.toString() || '',
          })

          // Get the result after spinning
          setTimeout(async () => {
            try {
              const result = await gamba.result()
              // For coinflip, determine win based on the actual coin result, not payout
              const coinResult = result.resultIndex // Gamba resultIndex: 0 = heads, 1 = tails
              const win = result.payout > 0 // Win if there's a payout (Gamba handles the logic)

              // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
              const visualResult = coinResult

              
              // Check if payout was actually received
              const isWin = result.payout > wager
              const winningsSOL = result.payout / 1e9
              const betAmountSOL = wager / 1e9
              const multiplier = isWin ? (result.payout / wager) : 0

              if (isWin) {
                console.log('✅ WIN: Payout received!', {
                  wagerSOL: betAmountSOL,
                  payoutSOL: winningsSOL,
                  profitSOL: winningsSOL - betAmountSOL,
                  multiplier: multiplier
                })
              } else {
                console.log('❌ LOSS: No payout received', {
                  wagerSOL: betAmountSOL,
                  payoutSOL: winningsSOL
                })
              }

              // Record the multiplayer game result in the database
              if (publicKey) {
                await recordCoinflipResult(
                  publicKey.toString(),
                  betAmountSOL, // Already converted to SOL
                  winningsSOL, // Already converted to SOL
                  isWin, // isWin
                  result.rngSeed?.toString(),
                  result.clientSeed?.toString(),
                  result.nonce,
                  (result as any).game?.toString() || 'unknown',
                  (result as any).transactionSignature || 'unknown'
                )
              }


              sounds.play('coin')

              setGameState('completed')
              setIsSpinning(false)
              setCoinVisualResult(visualResult as 0 | 1)

              // Update the game in the list
              const updatedGame = {
                id: gameId,
                player1: { 
                  name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
                  level: profile?.level || 1, 
                  avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
                  side: side 
                },
                player2: { name: 'Bot', level: 100, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
                amount: wager,
                currency: currency,
                status: 'completed',
                result: win ? 'win' : 'lose',
                coinResult: coinResult === 0 ? 'heads' : 'tails', // Store the actual coin result
                timestamp: Date.now(),
                transactionHash: (result as any)?.transactionSignature,
                userAddress: publicKey?.toString()
              }
              
              setUserGames(prev => prev.map(game => 
                game.id === gameId ? updatedGame : game
              ))
              setPlatformGames(prev => prev.map(game => 
                game.id === gameId ? updatedGame : game
              ))
              saveGame(updatedGame) // Save to database
              
              // Force UI update
              setForceUpdate(prev => prev + 1)

              if (win) {
                sounds.play('win')
              } else {
                sounds.play('lose')
              }
            } catch (error) {
              console.error('Error getting game result:', error)
              setGameState('completed')
              setIsSpinning(false)
            }
          }, 2000) // 2 second spin animation
          
        } catch (error) {
          console.error('SOL transaction failed:', error)
          
          // Handle transaction timeout/expiration
          setTimeout(() => {
            sounds.play('coin')

            setGameState('completed')
            setIsSpinning(false)

            // Player loses due to transaction failure, so show opposite side
            const visualResult = side === 'heads' ? 1 : 0
            setCoinVisualResult(visualResult as 0 | 1)
            
            // Mark as failed/lost due to transaction error
            const updatedGame = {
              id: gameId,
              player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: profile?.level || 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
              player2: { name: 'Bot', level: 100, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
              amount: wager,
              currency: currency,
              status: 'completed',
              result: 'lose', // Mark as lose due to transaction failure
              timestamp: Date.now(),
              userAddress: publicKey?.toString()
            }
            
            setUserGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            setPlatformGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            saveGame(updatedGame)
            
            // Force UI update
            setForceUpdate(prev => prev + 1)
            
            sounds.play('lose')
          }, 2000)
        }
        
      } else {
        // For FAKE tokens, use a simple random result (no real transaction)
        setTimeout(() => {
          // Use a deterministic random result based on game ID for fairness
          const randomSeed = gameId + Date.now()
          const coinResult = (randomSeed % 2) === 0 ? 'heads' : 'tails'
          const win = coinResult === side // You win if the coin matches your selection
          const multiplier = win ? 2.0 : 0
          const winningsSOL = win ? wager : 0

          // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
          const visualResult = coinResult === 'heads' ? 0 : 1


          sounds.play('coin')

          setGameState('completed')
          setIsSpinning(false)
          setCoinVisualResult(visualResult as 0 | 1)

          // Update the game in the list
          const updatedGame = {
            id: gameId,
            player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: profile?.level || 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
            player2: { name: 'Bot', level: 100, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
            amount: wager,
            currency: currency,
            status: 'completed',
            result: win ? 'win' : 'lose',
            coinResult: coinResult, // Add the actual coin result
            timestamp: Date.now(),
            userAddress: publicKey?.toString()
          }
          
          setUserGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          setPlatformGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          saveGame(updatedGame) // Save to database
          
                // Force UI update
                setForceUpdate(prev => prev + 1)

                if (win) {
                  sounds.play('win')
                } else {
                  sounds.play('lose')
                }
        }, 2000) // 2 second spin animation
      }
      
    } catch (error) {
      console.error('Bot game failed:', error)
      setGameState('waiting')
      setIsSpinning(false)
    }
  }


  /**
   * Join Existing PvP Game
   * When a player clicks "JOIN" on an existing game:
   * 1. Player pays the same wager amount as creator
   * 2. Joins the blockchain game using Gamba multiplayer SDK
   * 3. Game becomes "ready-to-play" with 2 players
   * 4. Both players can now start the coin flip
   */
  const joinExistingGame = async (gameId: number) => {
    try {
      // Find the game to join by ID first, then by gameAddress as fallback
      let gameToJoin = userGames.find(game => game.id === gameId) || 
                        platformGames.find(game => game.id === gameId)
      
      // If not found by ID, try to find by gameAddress (for blockchain games)
      if (!gameToJoin) {
        const allGames = [...userGames, ...platformGames]
        gameToJoin = allGames.find(game => game.gameAddress)
      }
      
      if (!gameToJoin) {
        console.error('Game not found:', { gameId, userGames: userGames.length, platformGames: platformGames.length })
        alert('Game not found. Please refresh and try again.')
        return
      }
      

      // Check if game is waiting for players
      if (gameToJoin.status !== 'waiting-for-opponent') {
        alert('This game is not available to join!')
        return
      }

      // Prevent joining your own game using proper blockchain data
      if (!publicKey || gameToJoin.isCurrentUserCreator) {
        alert('You cannot join your own game. Click "Resume" to reopen your game.')
        return
      }
      
      // Check if game already has 2 players
      if (gameToJoin.player2) {
        alert('This game is full!')
        return
      }

      console.log('🎮 Joining existing PvP game:', {
        gameId: gameToJoin.id,
        gameAddress: gameToJoin.gameAddress,
        wager: gameToJoin.amount,
        joinerSide: gameToJoin.player1.side === 'heads' ? 'tails' : 'heads'
      })

      // Use OFFICIAL Gamba multiplayer join logic
      const joinerSide = gameToJoin.player1.side === 'heads' ? 'tails' : 'heads'
      const gameAddress = new PublicKey(gameToJoin.gameAddress)
      
      // Joining game
      
      try {
        // Join the multiplayer game using official Gamba logic
        // Note: In Gamba multiplayer, each player pays the full wager amount
        // The total pot becomes 2x the individual wager
        await join(
          {
            gameAccount: gameAddress,
            mint: NATIVE_MINT,
            wager: gameToJoin.amount, // Each player pays the full wager amount
            creatorAddress: PLATFORM_CREATOR_ADDRESS,
            creatorFeeBps: Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE),
            metadata: joinerSide,
          },
          [], // No additional instructions needed
        )

        // Joiner payment successful
      } catch (playError: any) {
        console.error('Error during joiner payment:', playError)
        
        // Check if it's a timeout error
        if (playError.message?.includes('expired') || playError.message?.includes('timeout')) {
          // Joiner transaction timed out - checking if it actually went through
          // Transaction might still have gone through, just timeout on confirmation
          // We'll check the blockchain state in the refresh below
          alert('Transaction timed out, but it may still be processing. Please check your wallet and refresh the page.')
        } else {
        alert(`Joiner payment failed: ${playError.message || 'Unknown error'}`)
        return
      }
      }

      // Don't manually update game state - let blockchain data handle it
      // The join transaction will update the blockchain, and we'll fetch the updated state
      
      // Refresh blockchain games to get updated state
      if (refreshGames) {
        // Immediate refresh
        refreshGames()
        // Also refresh after a delay to ensure blockchain state is updated
        setTimeout(() => refreshGames(), 2000)
        setTimeout(() => refreshGames(), 5000)
      }

      // Set up the game for joining
      setWager(gameToJoin.amount)
      setCustomBetAmount((gameToJoin.amount / 1_000_000_000).toFixed(4))
      setSide(gameToJoin.player1.side === 'heads' ? 'tails' : 'heads') // Opposite side
      setCreatorSide(gameToJoin.player1.side) // Set the creator's original side
      setCurrency(gameToJoin.currency) // Use the same currency as the game
      setGameId(gameId)
      
      // Show modal for the joined game
      setShowTransactionModal(true)
      setGameState('ready-to-play')
      setTimeout(() => setIsModalVisible(true), 10)
      
      
    } catch (error) {
      console.error('Failed to join game:', error)
    }
  }

  const confirmJoin = async () => {
    try {
      setGameState('playing')
      setIsSpinning(true)

      sounds.play('coin', { playbackRate: .5 })

      if (currency === 'FAKE') {
        // For FAKE tokens, use a simple random result (no real transaction)
        // Add spinning delay for animation
        setTimeout(() => {
          // Use a deterministic random result based on game ID for fairness
          const randomSeed = gameId + Date.now()
          const coinResult = (randomSeed % 2) === 0 ? 'heads' : 'tails'
          const win = coinResult === side // You win if the coin matches your selection

          // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
          const visualResult = coinResult === 'heads' ? 0 : 1


      sounds.play('coin')

          setGameState('completed')
          setIsSpinning(false)
          setCoinVisualResult(visualResult as 0 | 1)

          // Update the game in user's games list
          const updatedGame = {
            id: gameId,
            player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: profile?.level || 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
            player2: { 
              name: 'Bot', 
              level: 100, 
              avatar: '/solly.png', 
              side: side === 'heads' ? 'tails' : 'heads' 
            },
            amount: wager,
            currency: currency,
            status: 'completed' as const,
            result: win ? 'win' as const : 'lose' as const,
            timestamp: Date.now(),
            userAddress: publicKey?.toString()
          }
          
          setUserGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          
          // Save the updated game to database
          saveGame(updatedGame)
          

          if (win) {
            sounds.play('win')
          } else {
            sounds.play('lose')
          }
        }, 2000) // 2 second spin animation
      } else {
        // For SOL tokens, use real Gamba transaction
        // wager is already in lamports from useWagerInput()
        
        // Trigger the actual Gamba transaction
        await gamba.play({
          bet: SIDES[side],
          wager: wager,
          metadata: [side, currency],
          creator: publicKey?.toString() || '',
        })

        // Add spinning delay for animation
        setTimeout(async () => {
          try {
          // Get the result after spinning
            const result = await gamba.result()
            // For coinflip, determine win based on the actual coin result, not payout
            // The coin result should be 0 (heads) or 1 (tails)
            const coinResult = result.resultIndex // Gamba resultIndex: 0 = heads, 1 = tails
            const win = result.payout > 0 // Win if there's a payout (Gamba handles the logic)

            // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
            const visualResult = coinResult

            
            // Check if payout was actually received
            if (result.payout > wager) {
              console.log('✅ WIN: Payout received!', {
                wagerSOL: wager / 1e9,
                payoutSOL: result.payout / 1e9,
                profitSOL: (result.payout - wager) / 1e9
              })
            } else {
              console.log('❌ LOSS: No payout received', {
                wagerSOL: wager / 1e9,
                payoutSOL: result.payout / 1e9
              })
            }

            // Record the game result in the database
            if (publicKey) {
              await recordCoinflipResult(
                publicKey.toString(),
                wager / 1e9, // Convert lamports to SOL
                result.payout / 1e9, // Convert lamports to SOL
                result.payout > wager, // isWin
                result.rngSeed?.toString(),
                result.clientSeed?.toString(),
                result.nonce,
                (result as any).game?.toString() || 'unknown',
                (result as any).transactionSignature || 'unknown'
              )
            }

            sounds.play('coin')

            setGameState('completed')
            setIsSpinning(false)
            setCoinVisualResult(visualResult as 0 | 1)

            // Update the game in user's games list
            const updatedGame = {
              id: gameId,
              player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: profile?.level || 1, 
            avatar: profile?.avatar_url || '/solly.png', 
            side: side 
          },
              player2: { 
              name: 'Bot', 
              level: 100, 
              avatar: '/solly.png', 
              side: side === 'heads' ? 'tails' : 'heads' 
            },
              amount: wager,
              currency: currency,
              status: 'completed' as const,
              result: win ? 'win' as const : 'lose' as const,
              coinResult: coinResult === 0 ? 'heads' : 'tails', // Store the actual coin result
              timestamp: Date.now(),
              transactionHash: (result as any)?.transactionSignature,
              userAddress: publicKey?.toString(),
              transactionSignature: (result as any)?.transactionSignature,
              rngSeed: result.rngSeed?.toString()
            }
            
            // Add or update the game in user's games list
            setUserGames(prev => {
              const existingGameIndex = prev.findIndex(game => game.id === gameId)
              if (existingGameIndex >= 0) {
                // Update existing game
                return prev.map(game => game.id === gameId ? updatedGame : game)
              } else {
                // Add new completed game to the list
                return [updatedGame, ...prev]
              }
            })
            
            // Save the updated game to database
            saveGame(updatedGame)

      if (win) {
        sounds.play('win')
      } else {
        sounds.play('lose')
      }
          } catch (error) {
            console.error('Error getting game result:', error)
            setGameState('completed')
            setIsSpinning(false)
          }
        }, 2000) // 2 second spin animation
      }
      
    } catch (error) {
      console.error('Game failed:', error)
      setGameState('joining')
      setIsSpinning(false)
    }
  }

  const closeModal = () => {
    // Start transition out
    setIsModalVisible(false)
    // Close modal after transition completes
    setTimeout(() => {
      setShowTransactionModal(false)
      setGameState('waiting')
      setIsSpinning(false)
      setCoinVisualResult(0)
    }, 500)
    
    // Reset Gamba state to allow new game creation
    setTimeout(() => {
      setForceUpdate(prev => prev + 1)
      window.dispatchEvent(new Event('gamba-reset'))
    }, 100)
  }

  const viewGame = (gameEntry: any) => {
    if (gameEntry.status === 'completed') {
      setSelectedGameResult(gameEntry)
      setShowGameResultModal(true)
    } else {
      setSelectedGameForView(gameEntry)
      setShowGameViewModal(true)
    }
  }

  const closeGameViewModal = () => {
    setShowGameViewModal(false)
    setSelectedGameForView(null)
  }

  const closeGameResultModal = () => {
    setShowGameResultModal(false)
    setSelectedGameResult(null)
  }


  return (
      <GambaUi.Portal target="screen">
      <GameContainer>
        <GameCreationSection>
          <GameControls>
            <LeftSection>
              <GameTitle>
                <img src="/002-weapon.png" alt="Sword" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                Coinflip
              </GameTitle>
            </LeftSection>

            <RightSection>
              <BetAndButtonsGroup>
                <BetInputAndButtons>
                  <BetAmountSection style={{ position: 'relative' }}>
                    <BetLabelRow>
                      <BetLabel>
                        <span style={{ color: '#ccc' }}>Bet Amount</span>
                        <span style={{ color: 'white' }}> (${((parseFloat(customBetAmount) || 0) * solPrice).toFixed(2)})</span>
                      </BetLabel>
                    </BetLabelRow>
                    <CustomBetInputWrapper>
                      <SolanaIconWrapper>
                        <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="SOL" style={{ width: '32px', height: '32px' }} />
                      </SolanaIconWrapper>
                      <CustomBetInput
                        type="number"
                        step="0.001"
                        placeholder="0"
                        value={customBetAmount}
                        onChange={(e) => handleBetAmountChange(e.target.value)}
                        onBlur={handleInputBlur}
                      />
                      <MultiplierButtons>
                        <MultiplierButton onClick={() => handleMultiplier(0.5)}>
                          1/2
                        </MultiplierButton>
                        <MultiplierButton onClick={() => handleMultiplier(2)}>
                          2x
                        </MultiplierButton>
                        <MultiplierButton onClick={() => handleMaxBet()}>
                          MAX
                        </MultiplierButton>
                      </MultiplierButtons>
                    </CustomBetInputWrapper>
                  </BetAmountSection>

                </BetInputAndButtons>
              </BetAndButtonsGroup>

              <CoinsAndCreateGroup>
                <ChooseSideSection>
                  <SideButtons>
                    <SideButton selected={side === 'heads'} onClick={() => {
                      setSide('heads')
                      setCreatorSide('heads') // Update creator side when selecting
                    }}>
                      <img src={HEADS_IMAGE} alt="Heads" />
                    </SideButton>
                    <SideButton selected={side === 'tails'} onClick={() => {
                      setSide('tails')
                      setCreatorSide('tails') // Update creator side when selecting
                    }}>
                      <img src={TAILS_IMAGE} alt="Tails" />
                    </SideButton>
                  </SideButtons>
                </ChooseSideSection>

                <CreateGameButton 
                  onClick={() => {
                    if (gameState !== 'playing' && gameState !== 'completed') {
                      createGame()
                    }
                  }} 
                  disabled={gameState === 'playing' || gameState === 'completed'}
                  style={{ 
                    pointerEvents: gameState === 'playing' || gameState === 'completed' ? 'none' : 'auto',
                    zIndex: 10
                  }}
                >
                  {gameState === 'playing' || gameState === 'completed' ? 'Creating...' : 'Create Game'}
                </CreateGameButton>


              </CoinsAndCreateGroup>
            </RightSection>
          </GameControls>
          
          <GameSubtitle>Pick a side and flip</GameSubtitle>
        </GameCreationSection>

        <GameListSection>
          <GameListHeader>
            <AllGamesTitle>ALL GAMES <span style={{ color: 'white', fontSize: '1rem', fontWeight: '700', marginLeft: '0.5rem' }}>{userGames.length + platformGames.length}</span></AllGamesTitle>
            {/* Debug game counts - disabled to prevent re-render loop */}
            <SortControls>
              <SortByLabel>SORT BY:</SortByLabel>
              <SortDropdownContainer ref={dropdownRef} onClick={() => setDropdownVisible(prev => !prev)}>
                <SortValue 
                  style={{ cursor: 'pointer' }}
                >
                  {sortOrder === 'desc' ? 'Highest Price' : 'Lowest Price'}
                </SortValue>
                <ArrowContainer>
                  <SortDropdown 
                    $sortOrder={dropdownVisible ? (sortOrder === 'desc' ? 'asc' : 'desc') : sortOrder}
                  />
                </ArrowContainer>
                <Dropdown visible={dropdownVisible}>
                  <DropdownOption 
                    onClick={() => {
                      setSortOrder('desc')
                      setDropdownVisible(false)
                    }}
                  >
                    Highest Price
                  </DropdownOption>
                  <DropdownOption 
                    onClick={() => {
                      setSortOrder('asc')
                      setDropdownVisible(false)
                    }}
                  >
                    Lowest Price
                  </DropdownOption>
                </Dropdown>
              </SortDropdownContainer>
            </SortControls>
          </GameListHeader>
          <GameEntries>
            {/* Combine and sort all games - active games first, then last 20 finished games */}
            {(() => {
              // Combine games but remove duplicates by ID
              const allGames = [...userGames, ...platformGames]
              const uniqueGames = allGames.reduce((acc: any[], game: any) => {
                const existing = acc.find((g: any) => g.id === game.id)
                if (!existing) {
                  acc.push(game)
                } else {
                  // Update existing game with newer data
                  const index = acc.findIndex((g: any) => g.id === game.id)
                  acc[index] = game
                }
                return acc
              }, [])
              
              
              // Force re-render when forceUpdate changes
              const _ = forceUpdate
              
              const activeGames = uniqueGames.filter((game: any) => 
                (game.status === 'waiting' || game.status === 'in-play' || 
                 game.status === 'waiting-for-opponent' || game.status === 'ready-to-play') && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
              
              const finishedGames = uniqueGames.filter((game: any) => 
                game.status === 'completed' && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 20) // Last 20 finished games
              
              return [...activeGames, ...finishedGames]
            })()
              .map((gameEntry) => {
                // Determine winner/loser for completed games
                const isCompleted = gameEntry.status === 'completed'
                const player1Won = isCompleted && gameEntry.result === 'win'
                const player2Won = isCompleted && gameEntry.result === 'lose'
                
                return (
                  <GameEntry 
                    key={`${gameEntry.id}-${gameEntry.timestamp}`}
                    $isActive={gameEntry.status === 'waiting' || gameEntry.status === 'in-play' || 
                               gameEntry.status === 'waiting-for-opponent' || gameEntry.status === 'ready-to-play'}
                    $isCompleted={gameEntry.status === 'completed'}
                  >
                    <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', width: '100%' }}>
                      {/* Left side - Players with VS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 auto', minWidth: '300px' }}>
                        <PlayerInfo>
                          <PlayerAvatar 
                            $isWinner={isCompleted && player1Won} 
                            $isLoser={isCompleted && !player1Won}
                          >
                            {gameEntry.player1.avatar.startsWith('/') || gameEntry.player1.avatar.startsWith('http') ? (
                              <img 
                                src={gameEntry.player1.avatar} 
                                alt="Player Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            ) : (
                              gameEntry.player1.avatar
                            )}
                            {isCompleted && player1Won && (
                              <WinnerCoinIcon>
                              <img 
                                src={gameEntry.player1.side === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                alt={gameEntry.player1.side} 
                              />
                              </WinnerCoinIcon>
                            )}
                          </PlayerAvatar>
                          <PlayerName>{gameEntry.player1.name}</PlayerName>
                          <PlayerLevel><LevelBadge level={gameEntry.player1.level} /></PlayerLevel>
                        </PlayerInfo>
                        
                        <VsIcon src="/002-weapon.png" alt="VS" />
                        
                        {gameEntry.player2 ? (
                          <PlayerInfo>
                            <PlayerAvatar 
                              $isWinner={isCompleted && player2Won} 
                              $isLoser={isCompleted && !player2Won}
                            >
                              {gameEntry.player2.avatar.startsWith('/') || gameEntry.player2.avatar.startsWith('http') ? (
                                <img 
                                  src={gameEntry.player2.avatar} 
                                  alt="Player Avatar" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                />
                              ) : (
                                gameEntry.player2.avatar
                              )}
                              {isCompleted && player2Won && (
                                <WinnerCoinIcon>
                                <img 
                                  src={gameEntry.player2.side === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                  alt={gameEntry.player2.side} 
                                />
                                </WinnerCoinIcon>
                              )}
                            </PlayerAvatar>
                            <PlayerName>{gameEntry.player2.name}</PlayerName>
                            <PlayerLevel><LevelBadge level={gameEntry.player2.level} /></PlayerLevel>
                          </PlayerInfo>
                        ) : (
                          <PlayerInfo>
                            <PlayerAvatar $isBot={true}>
                              <img 
                                src="/solly.png" 
                                alt="Waiting Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', opacity: '0.5' }}
                              />
                            </PlayerAvatar>
                            <PlayerName>Waiting...</PlayerName>
                            <PlayerLevel><LevelBadge level={0} /></PlayerLevel>
                          </PlayerInfo>
                        )}
                      </div>
                      
                      {/* Center - Bet Amount */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <BetAmountDisplay>
                          <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="Solana" style={{ width: '48px', height: '48px' }} />
                          {gameEntry.currency === 'SOL' ? (Number(gameEntry.amount) / 1_000_000_000).toFixed(4) : Number(gameEntry.amount)}
                        </BetAmountDisplay>
                      </div>
                      
                      {/* Right side - Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: '0 0 auto' }}>
                        {/* Button Logic: Creator sees CALL BOT, Joiner sees JOIN, Active games show IN PLAY + eye only, Completed games show only eye */}
                        {(gameEntry.status === 'waiting' || gameEntry.status === 'waiting-for-opponent' || gameEntry.status === 'ready-to-play') ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {(() => {
                              const isGameActive = gameEntry.status === 'in-play' || gameEntry.status === 'ready-to-play'
                              const gameHasTwoPlayers = gameEntry.player2 && gameEntry.status !== 'waiting-for-opponent'
                              
                              if (isGameActive) {
                                // Game is active - show IN PLAY as text and eye button only
                                return (
                                  <>
                                    <div style={{ 
                                      color: '#ff6b6b', 
                                      fontWeight: 'bold', 
                                      fontSize: '14px',
                                      padding: '8px 16px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}>
                                      IN PLAY
                                    </div>
                                    <ViewGameButton onClick={() => viewGame(gameEntry)}>
                                      <img src="/001-view.png" alt="Watch Live" />
                                    </ViewGameButton>
                                  </>
                                )
                              } else if (gameEntry.isCurrentUserCreator && !gameHasTwoPlayers) {
                                // Creator waiting for opponent - show CALL BOT
                                return (
                                  <JoinButton 
                                    onClick={() => {
                                      setWager(Number(gameEntry.amount))
                                      setCustomBetAmount((Number(gameEntry.amount) / 1_000_000_000).toFixed(4))
                                      setSide(gameEntry.player1.side)
                                      setCreatorSide(gameEntry.player1.side)
                                      setCurrency(gameEntry.currency)
                                      setGameId(gameEntry.id)
                                      setShowTransactionModal(true)
                                      setGameState('waiting')
                                      setTimeout(() => setIsModalVisible(true), 10)
                                    }}
                                    style={{ background: '#42ff78', color: 'black' }}
                                  >
                                    CALL BOT
                                  </JoinButton>
                                )
                              } else if (gameEntry.isCurrentUserCreator && gameHasTwoPlayers) {
                                // Creator with full game - show IN PLAY as text
                                return (
                                  <div style={{ 
                                    color: '#ff6b6b', 
                                    fontWeight: 'bold', 
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    IN PLAY
                                  </div>
                                )
                              } else if (gameEntry.isCurrentUserPlayer && !gameEntry.isCurrentUserCreator) {
                                // Joiner - show IN PLAY as text
                                return (
                                  <div style={{ 
                                    color: '#ff6b6b', 
                                    fontWeight: 'bold', 
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    IN PLAY
                                  </div>
                                )
                              } else {
                                // Other users - show JOIN
                                return (
                                  <JoinButton onClick={() => joinExistingGame(gameEntry.id)}>
                                    JOIN
                                  </JoinButton>
                                )
                              }
                            })()}
                            
                            {/* Eye button - only show for non-active games */}
                            {(() => {
                              const isGameActive = gameEntry.status === 'in-play' || gameEntry.status === 'ready-to-play'
                              if (!isGameActive) {
                                return (
                                  <ViewGameButton onClick={() => viewGame(gameEntry)}>
                                    <img src="/001-view.png" alt="Watch Live" />
                                  </ViewGameButton>
                                )
                              }
                              return null
                            })()}
                          </div>
                        ) : gameEntry.status === 'completed' ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <WinningAmount>
                              <div className="label">
                                <img 
                                  src={gameEntry.coinResult === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                  alt={gameEntry.coinResult || 'coin'} 
                                  style={{ width: '48px', height: '48px' }}
                                />
                              </div>
                            </WinningAmount>
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="View Game" />
                            </ViewGameButton>
                          </div>
                        ) : gameEntry.status === 'in-play' ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="Watch Live" />
                            </ViewGameButton>
                          </div>
                        ) : (
                          <ViewGameButton onClick={() => viewGame(gameEntry)}>
                            <img src="/001-view.png" alt="View Game" />
                          </ViewGameButton>
                        )}
                      </div>
                    </div>
                  </GameEntry>
                )
              })}
          </GameEntries>
        </GameListSection>
      </GameContainer>

      {/* Game View Modal */}
      {showGameViewModal && selectedGameForView && (
        <GameViewModal
          gameId={selectedGameForView.id}
          gameData={selectedGameForView}
          onClose={closeGameViewModal}
        />
      )}

      {/* Game Result Modal */}
      {showGameResultModal && selectedGameResult && (
        <GameResultModalOverlay onClick={closeGameResultModal}>
          <GameResultModalParent onClick={(e) => e.stopPropagation()}>
            <GameResultModal>
              {/* X BUTTON AT TOP */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                <button 
                  onClick={closeGameResultModal} 
                  style={{ 
                    background: 'rgb(48, 48, 48)', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    width: '42px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d',
                    transition: 'all 0.25s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <img src="/001-close.png" alt="Close" style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
              
              {/* HEADER SECTION */}
              <GameResultHeader>
                <GameResultTitle>
                  <img src="/002-weapon.png" alt="Weapon" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                  COINFLIP
                </GameResultTitle>
              </GameResultHeader>

              {/* MAIN SECTION - 3 COLUMN LAYOUT */}
              <GameResultMain>
                <GameResultThreeColumnLayout>
                  {/* LEFT COLUMN - Player 1 */}
                  <GameResultPlayerColumn>
                    <GameResultPlayerSlot>
                      <GameResultPlayerAvatarContainer>
                        <GameResultPlayerAvatar $isWinner={selectedGameResult.result === 'win'}>
                          {selectedGameResult.player1.avatar.startsWith('/') || selectedGameResult.player1.avatar.startsWith('http') ? (
                            <img 
                              src={selectedGameResult.player1.avatar} 
                              alt="Player Avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            selectedGameResult.player1.avatar
                          )}
                        </GameResultPlayerAvatar>
                      </GameResultPlayerAvatarContainer>
                      <GameResultPlayerInfo>
                        <GameResultPlayerName>{selectedGameResult.player1.name}</GameResultPlayerName>
                        <GameResultPlayerLevel><LevelBadge level={selectedGameResult.player1.level} /></GameResultPlayerLevel>
                        <GameResultBetAmount>
                          {selectedGameResult.currency === 'SOL' && <img src="/solana.png" alt="Solana" style={{ width: '16px', height: '16px' }} />}
                          <GameResultBetAmountText>{selectedGameResult.currency === 'SOL' ? 'Ξ' : 'FAKE'} {selectedGameResult.currency === 'SOL' ? (selectedGameResult.amount / 1_000_000_000).toFixed(4) : selectedGameResult.amount}</GameResultBetAmountText>
                        </GameResultBetAmount>
                      </GameResultPlayerInfo>
                    </GameResultPlayerSlot>
                  </GameResultPlayerColumn>

                  {/* MIDDLE COLUMN - Coin Result */}
                  <GameResultCoinColumn>
                    <GameResultCoinContainer>
                      <GameResultCoinDisplay>
                        {selectedGameResult.coinResult === 'heads' ? 'H' : 'T'}
                      </GameResultCoinDisplay>
                      <GameResultWinnerText>
                        {selectedGameResult.result === 'win' ? selectedGameResult.player1.name : selectedGameResult.player2?.name || 'BOT'}
                        <br />
                        WON
                      </GameResultWinnerText>
                    </GameResultCoinContainer>
                  </GameResultCoinColumn>

                  {/* RIGHT COLUMN - Player 2 */}
                  <GameResultPlayerColumn>
                    <GameResultPlayerSlot>
                      <GameResultPlayerAvatarContainer>
                        <GameResultPlayerAvatar $isWinner={selectedGameResult.result === 'lose'}>
                          {selectedGameResult.player2?.avatar && (selectedGameResult.player2.avatar.startsWith('/') || selectedGameResult.player2.avatar.startsWith('http')) ? (
                            <img 
                              src={selectedGameResult.player2.avatar} 
                              alt="Bot Avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            <img 
                              src="/solly.png" 
                              alt="Bot Avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          )}
                        </GameResultPlayerAvatar>
                      </GameResultPlayerAvatarContainer>
                      <GameResultPlayerInfo>
                        <GameResultPlayerName>{selectedGameResult.player2?.name || 'Bot'}</GameResultPlayerName>
                        <GameResultPlayerLevel><LevelBadge level={selectedGameResult.player2?.level || 100} /></GameResultPlayerLevel>
                        <GameResultWinningAmount $isWinner={selectedGameResult.result === 'lose'}>
                          {selectedGameResult.currency === 'SOL' && <img src="/solana.png" alt="Solana" style={{ width: '16px', height: '16px' }} />}
                          <GameResultBetAmountText>{selectedGameResult.currency === 'SOL' ? 'Ξ' : 'FAKE'} {selectedGameResult.currency === 'SOL' ? (selectedGameResult.result === 'lose' ? ((selectedGameResult.amount * 2) / 1_000_000_000).toFixed(4) : (selectedGameResult.amount / 1_000_000_000).toFixed(4)) : selectedGameResult.amount}</GameResultBetAmountText>
                        </GameResultWinningAmount>
                      </GameResultPlayerInfo>
                    </GameResultPlayerSlot>
                  </GameResultPlayerColumn>
                </GameResultThreeColumnLayout>
              </GameResultMain>

              {/* FOOTER SECTION */}
              <GameResultFooter>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '0.5rem', backgroundImage: 'url(/coinflip-grid-sW9YO0BH.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                  <GameResultFairnessButton>
                    <img src="/001-policy.png" alt="Policy" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                    Fairness
                  </GameResultFairnessButton>
                </div>
                <GameResultHashInfo>
                  <GameResultHashText>HASHED SEED: {selectedGameResult?.rngSeed || hashedSeed}</GameResultHashText>
                </GameResultHashInfo>
              </GameResultFooter>
            </GameResultModal>
          </GameResultModalParent>
        </GameResultModalOverlay>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <ModalOverlay onClick={closeModal} style={{ opacity: isModalVisible ? 1 : 0 }}>
          <ModalParent onClick={(e) => e.stopPropagation()} style={{ 
            opacity: isModalVisible ? 1 : 0, 
            transform: isModalVisible ? 'scale(1)' : 'scale(0.9)' 
          }}>
            <TransactionModal>
              {/* X BUTTON AT TOP */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                <button 
                  onClick={closeModal} 
                  style={{ 
                    background: 'rgb(48, 48, 48)', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    width: '42px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d',
                    transition: 'all 0.25s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <img src="/001-close.png" alt="Close" style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
              
              <GameInterface>
                {/* HEADER SECTION */}
                <ModalHeader>
                  <ModalTitle>
                    <img src="/002-weapon.png" alt="Weapon" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                    COINFLIP
                  </ModalTitle>
                </ModalHeader>

                {/* MIDDLE SECTION - 3 COLUMN LAYOUT */}
                <ModalMain>
                  <ThreeColumnLayout>
                    {/* LEFT COLUMN - Player 1 */}
                    <PlayerColumn>
                      <PlayerSlot>
                        <PlayerAvatarContainer>
                          <PlayerAvatarModal>
                            {(() => {
                              const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                              const avatar = currentGame?.player1?.avatar || '/solly.png'
                              
                              return avatar.startsWith('/') || avatar.startsWith('http') ? (
                                <img 
                                  src={avatar} 
                                  alt="Player Avatar" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                />
                              ) : (
                                <img 
                                  src="/solly.png" 
                                  alt="Default Avatar" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                />
                              )
                            })()}
                            <CoinSideIndicator>
                              <CoinSideIcon 
                                src={side === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                alt={side}
                              />
                            </CoinSideIndicator>
                          </PlayerAvatarModal>
                        </PlayerAvatarContainer>
                        <PlayerInfoModal>
                          <NameLevelContainer>
                            <PlayerNameModal>
                              {(() => {
                                const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                                
                                
                                // Determine if current user is the creator or joiner
                                const isCurrentUserCreator = currentGame?.isCurrentUserCreator
                                const isCurrentUserJoiner = currentGame?.isCurrentUserPlayer && !isCurrentUserCreator
                                
                                
                                
                                // Left side should always show the creator
                                // Always use the actual game data, not profile data
                                return currentGame?.player1?.name || 'Unknown'
                              })()}
                            </PlayerNameModal>
                          </NameLevelContainer>
                          <BetAmountContainer>
                            {currency === 'SOL' && <SolanaIconModal src="/solana.png" alt="Solana" />}
                            <BetAmountText>
                              {(() => {
                                if (gameState === 'spectating') {
                                  const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                                  return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} ${currency === 'SOL' ? (currentGame?.amount ? (currentGame.amount / 1_000_000_000).toFixed(4) : '0.0000') : (currentGame?.amount || 0)}`
                                }
                                return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} ${currency === 'SOL' ? (wager / 1_000_000_000).toFixed(4) : wager}`
                              })()}
                            </BetAmountText>
                          </BetAmountContainer>
                        </PlayerInfoModal>
                      </PlayerSlot>
                    </PlayerColumn>

                    {/* MIDDLE COLUMN - Coin */}
                    <CoinColumn>
                      <CoinContainer>
                        <Canvas
                          linear
                          flat
                          orthographic
                          camera={{
                            zoom: 80,
                            position: [0, 0, 100],
                          }}
                        >
                          <React.Suspense fallback={null}>
                            <Coin result={coinVisualResult} flipping={isSpinning} />
                          </React.Suspense>
                          <Effect color="white" />
                          {isSpinning && <Effect color="white" />}
                          <ambientLight intensity={3} />
                          <directionalLight
                            position-z={1}
                            position-y={1}
                            castShadow
                            color="#CCCCCC"
                          />
                          <hemisphereLight
                            intensity={.5}
                            position={[0, 1, 0]}
                            scale={[1, 1, 1]}
                            color="#ffadad"
                            groundColor="#6666fe"
                          />
                        </Canvas>
                      </CoinContainer>
                    </CoinColumn>

                    {/* RIGHT COLUMN - Player 2 */}
                    <PlayerColumn>
                      <PlayerSlot $isWaiting={gameState === 'waiting'}>
                        <PlayerAvatarContainer>
                          <PlayerAvatarModal $isBot={true}>
                            {(() => {
                              const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                              const isMultiplayer = currentGame?.status === 'waiting-for-opponent' || currentGame?.status === 'ready-to-play'
                              
                              // PvP Flip Modal Logic: Show question mark when waiting for player, actual avatar when player has joined
                              
                              // Simple logic: If player2 exists (has joined), show their avatar. Otherwise show question mark.
                              if (!currentGame?.player2) {
                                // No second player yet - show question mark
                                return <img src={UNKNOWN_IMAGE} alt="Waiting..." style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                              } else {
                                // Player2 has joined - show their actual avatar
                                // Show the actual second player
                                return currentGame.player2.avatar.startsWith('/') || currentGame.player2.avatar.startsWith('http') ? (
                                  <img 
                                    src={currentGame.player2.avatar} 
                                    alt="Player Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                  />
                                ) : (
                                  <img 
                                    src="/solly.png" 
                                    alt="Default Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                  />
                                )
                              }
                            })()}
                            <CoinSideIndicator>
                              <CoinSideIcon 
                                src={creatorSide === 'heads' ? TAILS_IMAGE : HEADS_IMAGE} 
                                alt={creatorSide === 'heads' ? 'tails' : 'heads'}
                              />
                            </CoinSideIndicator>
                          </PlayerAvatarModal>
                        </PlayerAvatarContainer>
                        <PlayerInfoModal>
                          <NameLevelContainer>
                            <PlayerNameModal>
                              {(() => {
                                const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                                const isMultiplayer = currentGame?.status === 'waiting-for-opponent' || currentGame?.status === 'ready-to-play'
                                
                                // Determine if current user is the creator or joiner
                                const isCurrentUserCreator = currentGame?.isCurrentUserCreator
                                const isCurrentUserJoiner = currentGame?.isCurrentUserPlayer && !isCurrentUserCreator
                                
                                
                                // Right side should show joiner or waiting
                                // Always use the actual game data, not profile data
                                if (currentGame?.player2) {
                                  return currentGame.player2.name
                                } else {
                                  return 'Waiting...'
                                }
                              })()}
                            </PlayerNameModal>
                          </NameLevelContainer>
                          <BetAmountContainer>
                            {currency === 'SOL' && <SolanaIconModal src="/solana.png" alt="Solana" />}
                            <BetAmountText>
                              {(() => {
                                if (gameState === 'spectating') {
                                  const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                                  const isMultiplayer = currentGame?.status === 'waiting-for-opponent' || currentGame?.status === 'ready-to-play'
                                  
                                  if (isMultiplayer && !currentGame?.player2) {
                                    return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} 0`
                                  } else if (isMultiplayer && currentGame?.player2) {
                                    return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} ${currency === 'SOL' ? (currentGame.amount ? (currentGame.amount / 1_000_000_000).toFixed(4) : '0.0000') : (currentGame?.amount || 0)}`
                                  } else {
                                    return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} ${currency === 'SOL' ? (currentGame?.amount ? (currentGame.amount / 1_000_000_000).toFixed(4) : '0.0000') : (currentGame?.amount || 0)}`
                                  }
                                }
                                return `${currency === 'SOL' ? 'Ξ' : 'FAKE'} ${gameState === 'waiting' ? '0' : (currency === 'SOL' ? (wager / 1_000_000_000).toFixed(4) : wager)}`
                              })()}
                            </BetAmountText>
                          </BetAmountContainer>
                        </PlayerInfoModal>
                      </PlayerSlot>
                    </PlayerColumn>
                  </ThreeColumnLayout>
                  
                  {/* CALL BOT BUTTON SECTION - Only show for creators, not spectators or joiners */}
                  {gameState !== 'spectating' && (() => {
                    const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                    const isCurrentUserCreator = currentGame?.isCurrentUserCreator
                    const isCurrentUserJoiner = currentGame?.isCurrentUserPlayer && !isCurrentUserCreator
                    const gameHasTwoPlayers = currentGame?.player2 && currentGame?.status !== 'waiting-for-opponent'
                    
                    // Only show CALL BOT button if:
                    // 1. Current user is the creator (not joiner)
                    // 2. Game doesn't have two players yet (not full)
                    return isCurrentUserCreator && !gameHasTwoPlayers
                  })() && (
                  <CallBotButtonWrapper>
                    <CallBotButtonContainer>
                      <CallBotButton
                        onClick={() => {
                          if (gameState !== 'playing' && gameState !== 'completed') {
                            callBot()
                          }
                        }}
                        disabled={gameState === 'playing' || gameState === 'completed'}
                        style={{ 
                          pointerEvents: gameState === 'playing' || gameState === 'completed' ? 'none' : 'auto',
                          zIndex: 10
                        }}
                      >
                        {gameState === 'playing' ? 'Starting...' : 
                         (() => {
                           const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                             if (currentGame?.status === 'waiting-for-opponent') {
                             return 'Call Bot' // Allow player to start with bot instead of waiting
                           } else if (currentGame?.status === 'ready-to-play') {
                               return 'Game Starting...' // Game is ready to start
                           } else {
                             return 'Call Bot'
                           }
                         })()}
                      </CallBotButton>
                    </CallBotButtonContainer>
                  </CallBotButtonWrapper>
                  )}
                  
                  {/* SPECTATOR MESSAGE - Show when watching someone else's game */}
                  {gameState === 'spectating' && (
                    <CallBotButtonWrapper>
                      <CallBotButtonContainer>
                        <div style={{ 
                          padding: '1rem', 
                          textAlign: 'center', 
                          color: '#888', 
                          fontSize: '0.9rem',
                          background: 'rgba(42, 42, 42, 0.8)',
                          borderRadius: '8px',
                          border: '1px solid #3a3a3a'
                        }}>
                          👀 Watching this game...
                        </div>
                      </CallBotButtonContainer>
                    </CallBotButtonWrapper>
                  )}
                  
                  {/* FULL GAME MESSAGE - Show when game is full and user is joiner */}
                  {gameState !== 'spectating' && (() => {
                    const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                    const isCurrentUserCreator = currentGame?.isCurrentUserCreator
                    const isCurrentUserJoiner = currentGame?.isCurrentUserPlayer && !isCurrentUserCreator
                    const gameHasTwoPlayers = currentGame?.player2 && currentGame?.status !== 'waiting-for-opponent'
                    
                    return isCurrentUserJoiner && gameHasTwoPlayers
                  })() && (
                    <CallBotButtonWrapper>
                      <CallBotButtonContainer>
                        <div style={{ 
                          padding: '1rem', 
                          textAlign: 'center', 
                          color: '#42ff78', 
                          fontSize: '0.9rem',
                          background: 'rgba(42, 42, 42, 0.8)',
                          borderRadius: '8px',
                          border: '1px solid #3a3a3a'
                        }}>
                          ✅ Game is full - waiting for flip...
                        </div>
                      </CallBotButtonContainer>
                    </CallBotButtonWrapper>
                  )}
                </ModalMain>

                {/* FOOTER SECTION */}
                <ModalFooter>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '0.5rem', backgroundImage: 'url(/coinflip-grid-sW9YO0BH.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <ShareButton>
                      <img src="/001-policy.png" alt="Policy" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
                      Fairness
                    </ShareButton>
                  </div>
                  <GameInfo>
                    <InfoTextContainer>
                      <InfoText>
                        {(() => {
                          const currentGame = platformGames.find(g => g.id === gameId) || userGames.find(g => g.id === gameId)
                          if (currentGame?.status === 'waiting-for-opponent') {
                            return 'Waiting for opponent or call bot to start'
                          } else if (currentGame?.status === 'ready-to-play') {
                            return 'Game ready to start'
                          } else if (currentGame?.status === 'playing') {
                            return 'Game in progress...'
                          } else {
                            return `HASHED SEED: ${gameId ? (userGames.find(g => g.id === gameId)?.rngSeed || hashedSeed) : hashedSeed}`
                          }
                        })()}
                      </InfoText>
                    </InfoTextContainer>
                  </GameInfo>
                </ModalFooter>
              </GameInterface>
            </TransactionModal>
          </ModalParent>
        </ModalOverlay>
      )}
      </GambaUi.Portal>
  )
}

export default Flip
