import { Canvas } from '@react-three/fiber'
import { GambaUi, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import { 
  GameListHeader, AllGamesTitle, SortControls, SortByLabel, SortValue, SortDropdownContainer, ArrowContainer, SortDropdown, DropdownOption, GameContainer,
  GameCreationSection, GameHeader, GameSubtitle, GameTitle, GameControls, LeftSection, RightSection, BetAndButtonsGroup, BetInputAndButtons, CoinsAndCreateGroup, RightControls, BetAmountSection, BetLabel, SolanaIcon, BetInputWrapper, BetInput, CurrencyDropdown, USDTooltip, QuickBetButtons, QuickBetButtonContainer, QuickBetButton, ChooseSideSection, SideButtons, SideButton, CreateGameButton,
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
// TODO: Replace with Supabase user data hooks
// import { getUsername, getUserLevel, getUserAvatarOrDefault, hasCustomAvatar } from '../../utils'

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
  const [side, setSide] = useState<Side>('heads')
  const [creatorSide, setCreatorSide] = useState<Side>('heads') // Track the original creator's side
  
  const [wager, setWager] = useState(0) // Start with blank
  const [currency, setCurrency] = useState<'SOL' | 'FAKE'>('SOL')
  const [games, setGames] = useState<any[]>([])
  const [userGames, setUserGames] = useState<any[]>([])
  const [platformGames, setPlatformGames] = useState<any[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed' | 'joining' | 'ready-to-play'>('waiting')
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
  
  // Mock SOL price for USD conversion (0.001 SOL ≈ $0.21)

  const sounds = useSound({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  // Custom wager validation - allows typing any value but validates on play

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
  }, [])

  const fetchSavedGames = async () => {
    try {
      // For local development, use localStorage
      const savedGames = localStorage.getItem('coinflip-games')
      if (savedGames) {
        const games = JSON.parse(savedGames)
        setUserGames(games)
      }
    } catch (error) {
      console.error('Failed to fetch saved games:', error)
    }
  }


  const saveGame = async (game: any) => {
    try {
      // For local development, use localStorage
      const existingGames = localStorage.getItem('coinflip-games')
      const games = existingGames ? JSON.parse(existingGames) : []
      
      // Update existing game or add new one
      const existingIndex = games.findIndex(g => g.id === game.id)
      if (existingIndex >= 0) {
        // Update existing game
        games[existingIndex] = game
      } else {
        // Add new game
        games.unshift(game)
      }
      
      // Keep only last 50 games
      const updatedGames = games.slice(0, 50)
      localStorage.setItem('coinflip-games', JSON.stringify(updatedGames))
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }

  const createGame = async () => {
    try {
      
      // Validate wager before proceeding (wager is in lamports from GambaUi.WagerInput)
      if (wager < 1_000_000) { // 0.001 SOL = 1,000,000 lamports
        alert('Minimum wager is 0.001 SOL')
        return
      }
      
      // Check if wallet is connected
      if (!publicKey) {
        alert('Please connect your wallet first')
        return
      }
      
      // Check if game object is available
      if (!game) {
        alert('Game not initialized. Please refresh the page.')
        return
      }

      // Generate new game ID for each new game
      const newGameId = Math.floor(Math.random() * 1000000)
      setGameId(newGameId)

      if (currency === 'SOL') {
        // For SOL games, creator pays immediately when creating the game
        // wager is already in lamports from GambaUi.WagerInput
        const wagerInLamports = wager
        
        try {
          // Creator pays immediately
          const result = await game.play({
            bet: SIDES[side],
            wager: wagerInLamports,
            metadata: [side, currency, 'creator-payment'],
            creator: publicKey?.toString() || '',
          })

          console.log('✅ Creator payment successful:', {
            wager: wager,
            side: side,
            gameId: newGameId
          })
        } catch (playError) {
          console.error('Error during creator payment:', playError)
          alert(`Creator payment failed: ${playError.message || 'Unknown error'}`)
          return
        }
        
        // Create a waiting game that others can join (creator has already paid)
        const newGame = {
          id: newGameId,
          player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: (() => {
              const address = publicKey?.toString() || ''
              const hasCustom = false
              const avatarUrl = '/solly.png'
              const fallback = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase()
              const result = hasCustom ? avatarUrl : fallback
              return result
            })(), 
            side: side,
            wager: wager,
            paid: true // Creator has already paid
          },
          player2: null,
          amount: wager,
          currency: currency,
          status: 'waiting-for-players', // Waiting for second player to join and pay
          timestamp: Date.now(),
          userAddress: publicKey?.toString(),
          rngSeed: gamba.nextRngSeedHashed,
          totalPool: wager // Only creator has paid so far
        }
        
        setUserGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to local state
        saveGame(newGame) // Save to database
        setPlatformGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to platform games
        
        // NOW show the modal after payment
        setShowTransactionModal(true)
        setGameState('waiting')
        setIsSpinning(false)
        // Trigger transition after modal is mounted
        setTimeout(() => setIsModalVisible(true), 10)
        
        
      } else {
        // For FAKE games, no payment needed, just create and show modal
        const newGame = {
          id: newGameId,
          player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
          player2: null,
          amount: wager,
          currency: currency,
          status: 'waiting',
          timestamp: Date.now(),
          userAddress: publicKey?.toString(),
          rngSeed: gamba.nextRngSeedHashed
        }
        
        setUserGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to local state
        saveGame(newGame) // Save to database
        
        // Show modal for FAKE games
        setShowTransactionModal(true)
        setGameState('waiting')
        setIsSpinning(false)
        // Trigger transition after modal is mounted
        setTimeout(() => setIsModalVisible(true), 10)
        
      }
      
    } catch (error) {
      console.error('Game creation failed:', error)
      setShowTransactionModal(false)
      setGameState('waiting')
      setIsSpinning(false)
    }
  }


  const callBot = async () => {
    try {
      // Check if this is a multiplayer game waiting for players
      const currentGame = userGames.find(g => g.id === gameId) || platformGames.find(g => g.id === gameId)
      const isMultiplayer = currentGame?.status === 'waiting-for-players' || currentGame?.status === 'ready-to-play'
      
      if (isMultiplayer) {
        // For multiplayer games, both players need to pay and winner gets double
        await handleMultiplayerGame()
      } else {
        // For single-player games, use the old logic
        await handleSinglePlayerGame()
      }
    } catch (error: any) {
      console.error('Error in callBot:', error)
      alert(`Game error: ${error?.message || 'Unknown error'}`)
    }
  }

  const handleMultiplayerGame = async () => {
    try {
      setGameState('playing')
      setIsSpinning(true)
      sounds.play('coin', { playbackRate: .5 })

      const currentGame = userGames.find(g => g.id === gameId) || platformGames.find(g => g.id === gameId)
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
        setUserGames(prev => prev.map(game => game.id === gameId ? updatedGame : game))
        setPlatformGames(prev => prev.map(game => game.id === gameId ? updatedGame : game))
        saveGame(updatedGame)

        // Set visual result
        const visualResult = coinResult
        setCoinVisualResult(visualResult)
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
          // wager is already in lamports from GambaUi.WagerInput
          const wagerInLamports = wager
          const game = await gamba.play({
            wager: wagerInLamports,
            bet: SIDES[side],
            metadata: [side, currency],
            creator: publicKey?.toString() || '',
          })

          // Get the result after spinning
          setTimeout(() => {
            game.result().then((result: any) => {
              // For coinflip, determine win based on the actual coin result, not payout
              const coinResult = result?.result?.[0] || result?.[0] || 0 // Get the first result (coin flip result)
              const win = (coinResult === 0 && side === 'heads') || (coinResult === 1 && side === 'tails')

              // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
              const visualResult = coinResult

              
              // Check if payout was actually received
              if (result.payout > wagerInLamports) {
                console.log('✅ WIN: Payout received!', {
                  wagerSOL: wagerInLamports / 1e9,
                  payoutSOL: result.payout / 1e9,
                  profitSOL: (result.payout - wagerInLamports) / 1e9
                })
              } else {
                console.log('❌ LOSS: No payout received', {
                  wagerSOL: wagerInLamports / 1e9,
                  payoutSOL: result.payout / 1e9
                })
              }

              sounds.play('coin')

              setGameState('completed')
              setIsSpinning(false)
              setCoinVisualResult(visualResult)

              // Update the game in the list
              const updatedGame = {
                id: gameId,
                player1: { 
                  name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
                  level: 1, 
                  avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
                  side: side 
                },
                player2: { name: 'Bot', level: 999, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
                amount: wager,
                currency: currency,
                status: 'completed',
                result: win ? 'win' : 'lose',
                coinResult: coinResult === 0 ? 'heads' : 'tails', // Store the actual coin result
                timestamp: Date.now(),
                transactionHash: result?.transactionSignature,
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
            })
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
            setCoinVisualResult(visualResult)
            
            // Mark as failed/lost due to transaction error
            const updatedGame = {
              id: gameId,
              player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
              player2: { name: 'Bot', level: 999, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
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

          // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
          const visualResult = coinResult === 'heads' ? 0 : 1


          sounds.play('coin')

          setGameState('completed')
          setIsSpinning(false)
          setCoinVisualResult(visualResult)

          // Update the game in the list
          const updatedGame = {
            id: gameId,
            player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
            player2: { name: 'Bot', level: 999, avatar: '/solly.png', side: side === 'heads' ? 'tails' : 'heads' },
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


  const joinGame = async (gameId: number) => {
    try {
      // Find the game to join
      const gameToJoin = userGames.find(game => game.id === gameId) || 
                        platformGames.find(game => game.id === gameId)
      
      if (!gameToJoin) {
        console.error('Game not found')
        return
      }

      // Check if game is waiting for players
      if (gameToJoin.status !== 'waiting-for-players') {
        alert('This game is not available to join!')
        return
      }

      // Prevent joining your own game
      if (gameToJoin.player1.name === publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous') {
        alert('You cannot join your own game. Click "Resume" to reopen your game.')
        return
      }
      
      // Check if game already has 2 players
      if (gameToJoin.player2) {
        alert('This game is full!')
        return
      }

      // Joiner pays immediately when joining
      const joinerWager = gameToJoin.amount
      const joinerWagerInLamports = Math.floor(joinerWager * 1e9)
      const joinerSide = gameToJoin.player1.side === 'heads' ? 'tails' : 'heads'
      
      try {
        // Joiner pays immediately
        const result = await game.play({
          bet: SIDES[joinerSide],
          wager: joinerWagerInLamports,
          metadata: [joinerSide, gameToJoin.currency, 'joiner-payment', gameToJoin.id],
          creator: publicKey?.toString() || '',
        })

        console.log('✅ Joiner payment successful:', {
          wager: joinerWager,
          side: joinerSide,
          gameId: gameToJoin.id
        })
      } catch (playError) {
        console.error('Error during joiner payment:', playError)
        alert(`Joiner payment failed: ${playError.message || 'Unknown error'}`)
        return
      }

      // Join the game as player 2 (joiner has now paid)
      const updatedGame = {
        ...gameToJoin,
        player2: {
          name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous',
          level: 1,
          avatar: (() => {
            const address = publicKey?.toString() || ''
            const hasCustom = false
            const avatarUrl = '/solly.png'
            const fallback = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase()
            const result = hasCustom ? avatarUrl : fallback
            return result
          })(),
          side: joinerSide, // Opposite side of creator
          wager: joinerWager, // Same wager amount
          paid: true // Joiner has now paid
        },
        status: 'ready-to-play', // Both players joined and paid, ready to start
        totalPool: gameToJoin.amount * 2 // Total pool is both wagers
      }
      
      // Update the game in state
      setUserGames(prev => prev.map(game => game.id === gameId ? updatedGame : game))
      setPlatformGames(prev => prev.map(game => game.id === gameId ? updatedGame : game))
      saveGame(updatedGame)

      // Set up the game for joining
      setWager(gameToJoin.amount)
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
          setCoinVisualResult(visualResult)

          // Update the game in user's games list
          const updatedGame = {
            id: gameId,
            player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
            player2: { 
              name: 'Bot', 
              level: 999, 
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
        const wagerInLamports = Math.floor(wager * 1_000_000_000)
        
        // Trigger the actual Gamba transaction
        await game.play({
          bet: SIDES[side],
          wager: wagerInLamports,
          metadata: [side, currency],
        })

        // Add spinning delay for animation
        setTimeout(() => {
          // Get the result after spinning
          game.result().then((result: any) => {
            // For coinflip, determine win based on the actual coin result, not payout
            // The coin result should be 0 (heads) or 1 (tails)
            const coinResult = result.result[0] // Get the first result (coin flip result)
            const win = (coinResult === 0 && side === 'heads') || (coinResult === 1 && side === 'tails')

            // Set visual result: show what the coin actually landed on (0 = heads, 1 = tails)
            const visualResult = coinResult

            
            // Check if payout was actually received
            if (result.payout > wagerInLamports) {
              console.log('✅ WIN: Payout received!', {
                wagerSOL: wagerInLamports / 1e9,
                payoutSOL: result.payout / 1e9,
                profitSOL: (result.payout - wagerInLamports) / 1e9
              })
            } else {
              console.log('❌ LOSS: No payout received', {
                wagerSOL: wagerInLamports / 1e9,
                payoutSOL: result.payout / 1e9
              })
            }

            sounds.play('coin')

            setGameState('completed')
            setIsSpinning(false)
            setCoinVisualResult(visualResult)

            // Update the game in user's games list
            const updatedGame = {
              id: gameId,
              player1: { 
            name: publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous', 
            level: 1, 
            avatar: false ? '/solly.png' : publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous'.charAt(0).toUpperCase(), 
            side: side 
          },
              player2: { 
              name: 'Bot', 
              level: 999, 
              avatar: '/solly.png', 
              side: side === 'heads' ? 'tails' : 'heads' 
            },
              amount: wager,
              currency: currency,
              status: 'completed' as const,
              result: win ? 'win' as const : 'lose' as const,
              coinResult: coinResult === 0 ? 'heads' : 'tails', // Store the actual coin result
              timestamp: Date.now(),
              transactionHash: result?.transactionSignature,
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
          })
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
              <GameTitle>Coinflip</GameTitle>
            </LeftSection>

            <RightSection>
              <BetAndButtonsGroup>
                <BetLabel>
                  Bet Amount
                </BetLabel>
                
                <BetInputAndButtons>
                  <BetAmountSection>
                    <BetInputWrapper>
                      <GambaUi.WagerInput value={wager} onChange={setWager} />
                    </BetInputWrapper>
                  </BetAmountSection>

                  <QuickBetButtons>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => setWager(w => (w || 0) + 0.01)}>
                        +0.01
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => setWager(w => (w || 0) + 1)}>
                        +1
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                  </QuickBetButtons>
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
              const uniqueGames = allGames.reduce((acc, game) => {
                const existing = acc.find(g => g.id === game.id)
                if (!existing) {
                  acc.push(game)
                } else {
                  // Update existing game with newer data
                  const index = acc.findIndex(g => g.id === game.id)
                  acc[index] = game
                }
                return acc
              }, [])
              
              // Force re-render when forceUpdate changes
              const _ = forceUpdate
              
              const activeGames = uniqueGames.filter(game => 
                (game.status === 'waiting' || game.status === 'in-play' || 
                 game.status === 'waiting-for-players' || game.status === 'ready-to-play') && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              
              const finishedGames = uniqueGames.filter(game => 
                game.status === 'completed' && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
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
                               gameEntry.status === 'waiting-for-players' || gameEntry.status === 'ready-to-play'}
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
                            {gameEntry.player1.avatar.startsWith('/') ? (
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
                          <PlayerLevel>{gameEntry.player1.level}</PlayerLevel>
                        </PlayerInfo>
                        
                        <VsIcon src="/002-weapon.png" alt="VS" />
                        
                        {gameEntry.player2 ? (
                          <PlayerInfo>
                            <PlayerAvatar 
                              $isWinner={isCompleted && player2Won} 
                              $isLoser={isCompleted && !player2Won}
                            >
                              {gameEntry.player2.avatar.startsWith('/') ? (
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
                            <PlayerLevel>{gameEntry.player2.level}</PlayerLevel>
                          </PlayerInfo>
                        ) : (
                          <PlayerInfo>
                            <PlayerAvatar>?</PlayerAvatar>
                            <PlayerName>Waiting...</PlayerName>
                          </PlayerInfo>
                        )}
                      </div>
                      
                      {/* Center - Bet Amount */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <BetAmountDisplay>
                          <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="Solana" style={{ width: '48px', height: '48px' }} />
                          {gameEntry.currency === 'SOL' ? (gameEntry.amount / 1_000_000_000).toFixed(4) : gameEntry.amount}
                        </BetAmountDisplay>
                      </div>
                      
                      {/* Right side - Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: '0 0 auto' }}>
                        {(gameEntry.status === 'waiting' || gameEntry.status === 'waiting-for-players' || gameEntry.status === 'ready-to-play') ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {gameEntry.player1.name === publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Anonymous' ? (
                              // If you own the game, show "Resume" button to reopen your game
                              <JoinButton 
                                onClick={() => {
                                  // Reopen your own game modal - NO PAYMENT NEEDED
                                  setWager(gameEntry.amount)
                                  setSide(gameEntry.player1.side)
                                  setCreatorSide(gameEntry.player1.side) // Set creator's side
                                  setCurrency(gameEntry.currency)
                                  setGameId(gameEntry.id)
                                  setShowTransactionModal(true)
                                  setGameState(gameEntry.status === 'ready-to-play' ? 'ready-to-play' : 'waiting') // Set correct state
                                  // Trigger transition after modal is mounted
                                  setTimeout(() => setIsModalVisible(true), 10)
                                  
                                  // Clear any old transaction state
                                }}
                                style={{ background: '#42ff78', color: 'black' }}
                              >
                                Resume
                              </JoinButton>
                            ) : gameEntry.status === 'waiting-for-players' && !gameEntry.player2 ? (
                              // If game is waiting for players and no player2, show "Join" button
                              <JoinButton onClick={() => joinGame(gameEntry.id)}>Join</JoinButton>
                            ) : gameEntry.status === 'ready-to-play' && gameEntry.player2 ? (
                              // If both players are ready, show "Watch" button
                              <JoinButton 
                                onClick={() => {
                                  setWager(gameEntry.amount)
                                  setSide(gameEntry.player1.side)
                                  setCreatorSide(gameEntry.player1.side)
                                  setCurrency(gameEntry.currency)
                                  setGameId(gameEntry.id)
                                  setShowTransactionModal(true)
                                  setGameState('ready-to-play')
                                  setTimeout(() => setIsModalVisible(true), 10)
                                }}
                              >
                                Watch
                              </JoinButton>
                            ) : (
                              // Default case - game is full or unavailable
                              <JoinButton disabled>
                                Full
                              </JoinButton>
                            )}
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="Watch Live" />
                            </ViewGameButton>
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
                        <GameResultPlayerAvatar isWinner={selectedGameResult.result === 'win'}>
                          {selectedGameResult.player1.avatar.startsWith('/') ? (
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
                        <GameResultPlayerLevel>{selectedGameResult.player1.level}</GameResultPlayerLevel>
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
                        <GameResultPlayerAvatar isWinner={selectedGameResult.result === 'lose'}>
                          {selectedGameResult.player2?.avatar && selectedGameResult.player2.avatar.startsWith('/') ? (
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
                        <GameResultPlayerLevel>{selectedGameResult.player2?.level || '999'}</GameResultPlayerLevel>
                        <GameResultWinningAmount isWinner={selectedGameResult.result === 'lose'}>
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
                            {false ? (
                              <img 
                                src={'/solly.png'} 
                                alt="Player Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                              />
                            ) : (
                              <img 
                                src="/solly.png" 
                                alt="Default Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                              />
                            )}
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
                            <PlayerNameModal>You</PlayerNameModal>
                          </NameLevelContainer>
                          <BetAmountContainer>
                            {currency === 'SOL' && <SolanaIconModal src="/solana.png" alt="Solana" />}
                            <BetAmountText>{currency === 'SOL' ? 'Ξ' : 'FAKE'} {currency === 'SOL' ? (wager / 1_000_000_000).toFixed(4) : wager}</BetAmountText>
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
                      <PlayerSlot isWaiting={gameState === 'waiting'}>
                        <PlayerAvatarContainer>
                          <PlayerAvatarModal isBot={true}>
                            {(() => {
                              const currentGame = userGames.find(g => g.id === gameId) || platformGames.find(g => g.id === gameId)
                              const isMultiplayer = currentGame?.status === 'waiting-for-players' || currentGame?.status === 'ready-to-play'
                              
                              if (gameState === 'waiting' || (isMultiplayer && !currentGame?.player2)) {
                                return <img src={UNKNOWN_IMAGE} alt="Waiting..." style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                              } else if (isMultiplayer && currentGame?.player2) {
                                // Show the actual second player
                                return currentGame.player2.avatar.startsWith('/') ? (
                                  <img 
                                    src={currentGame.player2.avatar} 
                                    alt="Player Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                  />
                                ) : (
                                  <div style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #4c1d95, #a855f7)',
                                    borderRadius: '20px',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: 'white'
                                  }}>
                                    {currentGame.player2.avatar}
                                  </div>
                                )
                              } else {
                                // Show bot
                                return <img 
                                  src="/solly.png" 
                                  alt="Bot Avatar" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                />
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
                                const currentGame = userGames.find(g => g.id === gameId) || platformGames.find(g => g.id === gameId)
                                const isMultiplayer = currentGame?.status === 'waiting-for-players' || currentGame?.status === 'ready-to-play'
                                
                                if (gameState === 'waiting' || (isMultiplayer && !currentGame?.player2)) {
                                  return 'Waiting...'
                                } else if (isMultiplayer && currentGame?.player2) {
                                  return currentGame.player2.name
                                } else {
                                  return 'Bot'
                                }
                              })()}
                            </PlayerNameModal>
                          </NameLevelContainer>
                          <BetAmountContainer>
                            {currency === 'SOL' && <SolanaIconModal src="/solana.png" alt="Solana" />}
                            <BetAmountText>{currency === 'SOL' ? 'Ξ' : 'FAKE'} {gameState === 'waiting' ? '0' : (currency === 'SOL' ? (wager / 1_000_000_000).toFixed(4) : wager)}</BetAmountText>
                          </BetAmountContainer>
                        </PlayerInfoModal>
                      </PlayerSlot>
                    </PlayerColumn>
                  </ThreeColumnLayout>
                  
                  {/* CALL BOT BUTTON SECTION */}
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
                           const currentGame = userGames.find(g => g.id === gameId) || platformGames.find(g => g.id === gameId)
                           if (currentGame?.status === 'waiting-for-players') {
                             return 'Call Bot' // Allow player to start with bot instead of waiting
                           } else if (currentGame?.status === 'ready-to-play') {
                             // Check if both players have paid
                             const bothPlayersPaid = currentGame.player1?.paid && currentGame.player2?.paid
                             return bothPlayersPaid ? 'Start Game' : 'Waiting for Payment...'
                           } else {
                             return 'Call Bot'
                           }
                         })()}
                      </CallBotButton>
                    </CallBotButtonContainer>
                  </CallBotButtonWrapper>
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
                      <InfoText>HASHED SEED: {gameId ? (userGames.find(g => g.id === gameId)?.rngSeed || hashedSeed) : hashedSeed}</InfoText>
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
