import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import { CARD_VALUES, RANKS, RANK_SYMBOLS, SUIT_COLORS, SUIT_SYMBOLS, SUITS, SOUND_CARD, SOUND_LOSE, SOUND_PLAY, SOUND_WIN, SOUND_JACKPOT } from './constants'
import { Card, CardContainer, CardsContainer, Container, Profit, CardArea } from './styles'
import { 
  GameListHeader, AllGamesTitle, SortControls, SortByLabel, SortValue, SortDropdownContainer, ArrowContainer, SortDropdown, DropdownOption, GameContainer,
  GameCreationSection, GameHeader, GameSubtitle, GameTitle, GameControls, LeftSection, RightSection, BetAndButtonsGroup, BetInputAndButtons, CoinsAndCreateGroup, RightControls, BetAmountSection, BetLabel, SolanaIcon, BetInputWrapper, BetInput, CurrencyDropdown, USDTooltip, QuickBetButtons, QuickBetButtonContainer, QuickBetButton, ChooseSideSection, SideButtons, SideButton, CreateGameButton,
  GameListSection, GameEntries, GameEntry, PlayerInfo, PlayerAvatar, PlayerName, PlayerLevel, WinnerCoinIcon, VsIcon, BetAmountDisplay, JoinButton, StatusButton, EyeIcon, WinningAmount, ViewGameButton
} from '../Flip/styles'
import { Dropdown } from '../../components/Dropdown'
import SOLANA_ICON from '/solana.png'

const randomRank = () => Math.floor(Math.random() * RANKS)
const randomSuit = () => Math.floor(Math.random() * SUITS)

const createCard = (rank = randomRank(), suit = randomSuit()): Card => ({
  key: Math.random(),
  rank,
  suit,
})

interface Card {
  key: number
  rank: number
  suit: number
}

export interface BlackjackConfig {
  logo: string
}

export default function Blackjack(props: BlackjackConfig) {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const pool = useCurrentPool()
  const { publicKey } = useWallet()
  const [playerCards, setPlayerCards] = React.useState<Card[]>([])
  const [dealerCards, setDealerCards] = React.useState<Card[]>([])
  const [initialWager, setInitialWager] = useState<number | ''>('')
  const [profit, setProfit] = React.useState<number | null>(null)
  const [claiming, setClaiming] = React.useState(false)
  
  // New state for coinflip-style layout
  const [games, setGames] = useState<any[]>([])
  const [userGames, setUserGames] = useState<any[]>([])
  const [platformGames, setPlatformGames] = useState<any[]>([])
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed'>('waiting')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  // Enhanced Blackjack game state
  const [gamePhase, setGamePhase] = useState<'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'result'>('betting')
  const [currentWager, setCurrentWager] = useState(0)
  const [hasDoubled, setHasDoubled] = useState(false)
  const [dealerHiddenCard, setDealerHiddenCard] = useState<Card | null>(null)

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

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    card: SOUND_CARD,
    jackpot: SOUND_JACKPOT,
  })

  const resetGame = () => {
    setProfit(null)
    setPlayerCards([])
    setDealerCards([])
    setGamePhase('betting')
    setCurrentWager(0)
    setHasDoubled(false)
    setDealerHiddenCard(null)
  }

  // Calculate hand value with ace handling
  const calculateHandValue = (hand: Card[]): number => {
    let value = 0
    let aces = 0
    
    for (const card of hand) {
      const cardValue = CARD_VALUES[card.rank]
      if (cardValue === 11) {
        aces++
        value += 11
      } else {
        value += cardValue
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }
    
    return value
  }

  // Check if hand is bust
  const isBust = (hand: Card[]): boolean => {
    return calculateHandValue(hand) > 21
  }

  // Check if hand is blackjack
  const isBlackjack = (hand: Card[]): boolean => {
    return hand.length === 2 && calculateHandValue(hand) === 21
  }

  // Start new game
  const startGame = async () => {
    const wagerValue = typeof initialWager === 'number' ? initialWager : 0
    if (wagerValue < 0.01) return
    
    resetGame()
    setGameState('playing')
    setCurrentWager(wagerValue)
    setGamePhase('dealing')
    sounds.play('play')

    // Trigger Gamba transaction BEFORE dealing cards
    // Use the original working bet array from starter files
    const betArray = [2.5, 2.5, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    
    try {
      console.log('Starting transaction with wager:', wagerValue, 'betArray:', betArray)
      await game.play({
        bet: betArray,
        wager: wagerValue,
      })
      console.log('Transaction completed successfully')
    } catch (error) {
      console.error('Transaction failed:', error)
      // Reset game state on transaction failure
      setGameState('waiting')
      setGamePhase('betting')
      return
    }

    // Deal initial cards
    const newPlayerCards = [createCard(), createCard()]
    const newDealerCards = [createCard(), createCard()]
    
    // Hide dealer's second card
    setDealerHiddenCard(newDealerCards[1])
    setDealerCards([newDealerCards[0]])
    setPlayerCards(newPlayerCards)
    
    // Check for immediate blackjack
    if (isBlackjack(newPlayerCards)) {
      console.log('Player has blackjack, setting phase to result')
      setGamePhase('result')
      await resolveGame(newPlayerCards, newDealerCards, true)
    } else {
      console.log('Setting game phase to playerTurn')
      setGamePhase('playerTurn')
    }
  }

  // Player hits
  const hit = () => {
    console.log('Hit button clicked - gamePhase:', gamePhase, 'gameState:', gameState, 'playerCards:', playerCards.length)
    if (gamePhase !== 'playerTurn') {
      console.log('Hit blocked - not player turn. Current phase:', gamePhase)
      return
    }
    
    const newCard = createCard()
    const newPlayerCards = [...playerCards, newCard]
    setPlayerCards(newPlayerCards)
    sounds.play('card')
    
    // Check for bust or blackjack
    if (isBust(newPlayerCards)) {
      setGamePhase('result')
      resolveGame(newPlayerCards, [...dealerCards, dealerHiddenCard!], false)
    } else if (isBlackjack(newPlayerCards)) {
      setGamePhase('result')
      resolveGame(newPlayerCards, [...dealerCards, dealerHiddenCard!], true)
    }
  }

  // Player stands
  const stand = () => {
    console.log('Stand button clicked - gamePhase:', gamePhase, 'gameState:', gameState, 'playerCards:', playerCards.length)
    if (gamePhase !== 'playerTurn') {
      console.log('Stand blocked - not player turn. Current phase:', gamePhase)
      return
    }
    
    setGamePhase('dealerTurn')
    dealerPlay()
  }

  // Player doubles down
  const doubleDown = () => {
    console.log('Double down button clicked - gamePhase:', gamePhase, 'gameState:', gameState, 'playerCards:', playerCards.length, 'hasDoubled:', hasDoubled)
    if (gamePhase !== 'playerTurn' || playerCards.length !== 2 || hasDoubled) {
      console.log('Double down blocked - gamePhase:', gamePhase, 'playerCards:', playerCards.length, 'hasDoubled:', hasDoubled)
      return
    }
    
    setCurrentWager(currentWager * 2)
    setHasDoubled(true)
    
    const newCard = createCard()
    const newPlayerCards = [...playerCards, newCard]
    setPlayerCards(newPlayerCards)
    sounds.play('card')
    
    // After doubling, player must stand
    setGamePhase('dealerTurn')
    dealerPlay()
  }

  // Dealer plays
  const dealerPlay = async () => {
    // Reveal hidden card
    const fullDealerCards = [...dealerCards, dealerHiddenCard!]
    setDealerCards(fullDealerCards)
    
    // Dealer hits until 17 or bust
    let currentDealerCards = [...fullDealerCards]
    while (calculateHandValue(currentDealerCards) < 17) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newCard = createCard()
      currentDealerCards.push(newCard)
      setDealerCards([...currentDealerCards])
      sounds.play('card')
    }
    
    setGamePhase('result')
    resolveGame(playerCards, currentDealerCards, false)
  }

  // Resolve game and determine payout
  const resolveGame = async (finalPlayerCards: Card[], finalDealerCards: Card[], playerBlackjack: boolean) => {
    const playerValue = calculateHandValue(finalPlayerCards)
    const dealerValue = calculateHandValue(finalDealerCards)
    const dealerBlackjack = isBlackjack(finalDealerCards)
    const playerBust = isBust(finalPlayerCards)
    const dealerBust = isBust(finalDealerCards)
    
    let multiplier = 0
    
    // Determine outcome
    if (playerBust) {
      // Player busts - always loses
      multiplier = 0
    } else if (dealerBust) {
      // Dealer busts - player wins
      multiplier = 2
    } else if (playerBlackjack && !dealerBlackjack) {
      // Player blackjack beats dealer
      multiplier = 2.5
    } else if (dealerBlackjack && !playerBlackjack) {
      // Dealer blackjack beats player
      multiplier = 0
    } else if (playerBlackjack && dealerBlackjack) {
      // Both blackjack - push
      multiplier = 1
    } else if (playerValue > dealerValue) {
      // Player wins
      multiplier = 2
    } else if (dealerValue > playerValue) {
      // Dealer wins
      multiplier = 0
    } else {
      // Push
      multiplier = 1
    }
    
    // Determine outcome index for Gamba
    let outcomeIndex = 0 // Default to lose
    
    if (playerBust) {
      outcomeIndex = 4 // Bust
    } else if (dealerBust) {
      outcomeIndex = 2 // Win
    } else if (playerBlackjack && !dealerBlackjack) {
      outcomeIndex = 1 // Blackjack win
    } else if (dealerBlackjack && !playerBlackjack) {
      outcomeIndex = 5 // Dealer blackjack
    } else if (playerBlackjack && dealerBlackjack) {
      outcomeIndex = 3 // Push
    } else if (playerValue > dealerValue) {
      outcomeIndex = 2 // Win
    } else if (dealerValue > playerValue) {
      outcomeIndex = 0 // Lose
    } else {
      outcomeIndex = 3 // Push
    }
    
    // Use the actual game outcome for payout (not Gamba's random result)
    const actualPayout = currentWager * multiplier
    console.log('Actual game payout:', actualPayout, 'Multiplier:', multiplier)
    
    setProfit(actualPayout)
    setGameState('completed')
    
    // Still call game.result() to complete the transaction, but ignore its payout
    try {
      await game.result()
    } catch (error) {
      console.error('Error getting game result:', error)
    }
    
    // Play appropriate sound
    if (multiplier === 2.5) {
      sounds.play('jackpot')
    } else if (multiplier > 1) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  // Helper functions remain the same
  const getHandValue = (hand: Card[]): number => {
    return hand.reduce((sum, c) => sum + CARD_VALUES[c.rank], 0)
  }

  const generateBlackjackHand = (): Card[] => {
    const aceRank = 12
    const tenRanks = [8, 9, 10, 11] // Ranks corresponding to 10-value cards
    const tenCardRank = tenRanks[Math.floor(Math.random() * tenRanks.length)]
    return [createCard(aceRank, randomSuit()), createCard(tenCardRank, randomSuit())]
  }

  const generateRandomHandBelow = (maxTotal: number): Card[] => {
    let handValue = maxTotal
    while (handValue >= maxTotal) {
      const card1 = createCard()
      const card2 = createCard()
      handValue = CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank]
      if (handValue < maxTotal) {
        return [card1, card2]
      }
    }
    return []
  }

  const generateWinningHand = (): Card[] => {
    const totals = [17, 18, 19, 20]
    const targetTotal = totals[Math.floor(Math.random() * totals.length)]
    return generateHandWithTotal(targetTotal)
  }

  const generateLosingHand = (opponentHand?: Card[]): Card[] => {
    const opponentTotal = opponentHand ? getHandValue(opponentHand) : 20
    let total = opponentTotal
    while (total >= opponentTotal) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total < opponentTotal) {
        return hand
      }
    }
    return []
  }

  const generateWinningHandOver = (opponentHand: Card[]): Card[] => {
    const opponentTotal = getHandValue(opponentHand)
    let total = opponentTotal
    while (total <= opponentTotal || total > 21) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total > opponentTotal && total <= 21) {
        return hand
      }
    }
    return []
  }

  const generateHandWithTotal = (targetTotal: number): Card[] => {
    for (let i = 0; i < 100; i++) {
      const card1 = createCard()
      const card2 = createCard()
      if (CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank] === targetTotal) {
        return [card1, card2]
      }
    }
    return generateRandomHandBelow(targetTotal)
  }

  return (
    <GambaUi.Portal target="screen">
      <GameContainer>
        <GameCreationSection>
          <GameControls>
            <LeftSection>
              <GameTitle>Blackjack</GameTitle>
            </LeftSection>

            <RightSection>
              <BetAndButtonsGroup>
                <BetLabel>
                  Bet Amount
                </BetLabel>
                
                <BetInputAndButtons>
                  <BetAmountSection>
                    <BetInputWrapper>
                      <GambaUi.WagerInput 
                        value={typeof initialWager === 'number' ? initialWager : 0} 
                        onChange={(value) => setInitialWager(value)} 
                      />
                    </BetInputWrapper>
                  </BetAmountSection>

                  <QuickBetButtons>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => {
                        const current = typeof initialWager === 'number' ? initialWager : 0.01
                        setInitialWager(current + 0.01)
                      }}>
                        +0.01
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => {
                        const current = typeof initialWager === 'number' ? initialWager : 0.01
                        setInitialWager(current + 1)
                      }}>
                        +1
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                  </QuickBetButtons>
                </BetInputAndButtons>
              </BetAndButtonsGroup>

              <CoinsAndCreateGroup>
                <CreateGameButton 
                  onClick={() => {
                    if (gamePhase === 'betting') {
                      startGame()
                    }
                  }} 
                  disabled={gamePhase !== 'betting' || (typeof initialWager === 'number' ? initialWager < 0.01 : true)}
                  style={{ 
                    pointerEvents: gamePhase !== 'betting' || (typeof initialWager === 'number' ? initialWager < 0.01 : true) ? 'none' : 'auto',
                    zIndex: 10,
                    background: gamePhase === 'result' ? '#666' : undefined
                  }}
                >
                  {gamePhase === 'betting' ? 'Deal Cards' : 
                   gamePhase === 'dealing' ? 'Dealing...' :
                   gamePhase === 'playerTurn' ? 'Your Turn' :
                   gamePhase === 'dealerTurn' ? 'Dealer Playing...' :
                   gamePhase === 'result' ? 'Game Over' : 'Deal Cards'}
                </CreateGameButton>
              </CoinsAndCreateGroup>
            </RightSection>
          </GameControls>
          
          <GameSubtitle>Get as close to 21 as possible</GameSubtitle>
        </GameCreationSection>

        {/* Blackjack Game Display */}
        <Container $disabled={claiming || gamba.isPlaying}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            <h2>Dealer's Hand {dealerCards.length > 0 && `(${calculateHandValue(dealerCards)})`}</h2>
            <CardArea>
              <CardsContainer>
                {dealerCards.map((card) => (
                  <CardContainer key={card.key}>
                    <Card color={SUIT_COLORS[card.suit]}>
                      <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                      <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                    </Card>
                  </CardContainer>
                ))}
                {dealerHiddenCard && gamePhase !== 'dealerTurn' && gamePhase !== 'result' && (
                  <CardContainer>
                    <Card color="#333" style={{ border: '2px dashed #666' }}>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>Hidden</div>
                    </Card>
                  </CardContainer>
                )}
              </CardsContainer>
            </CardArea>
            
            <h2>Player's Hand {playerCards.length > 0 && `(${calculateHandValue(playerCards)})`}</h2>
            <CardArea>
              <CardsContainer>
                {playerCards.map((card) => (
                  <CardContainer key={card.key}>
                    <Card color={SUIT_COLORS[card.suit]}>
                      <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                      <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                    </Card>
                  </CardContainer>
                ))}
              </CardsContainer>
            </CardArea>

            {/* Game Action Buttons */}
            {gamePhase === 'playerTurn' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <CreateGameButton 
                  onClick={hit}
                  style={{ background: '#42ff78', color: 'black' }}
                >
                  Hit
                </CreateGameButton>
                <CreateGameButton 
                  onClick={stand}
                  style={{ background: '#ff6b6b', color: 'white' }}
                >
                  Stand
                </CreateGameButton>
                {playerCards.length === 2 && !hasDoubled && (
                  <CreateGameButton 
                    onClick={doubleDown}
                    style={{ background: '#ffa500', color: 'black' }}
                  >
                    Double Down
                  </CreateGameButton>
                )}
              </div>
            )}

            {/* New Game Button */}
            {gamePhase === 'result' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <CreateGameButton 
                  onClick={() => {
                    console.log('New Game button clicked')
                    resetGame()
                    setGameState('waiting')
                    setInitialWager('') // Reset wager to blank
                  }}
                  style={{ background: '#6741ff', color: 'white' }}
                >
                  New Game
                </CreateGameButton>
              </div>
            )}

            {profit !== null && (
              <Profit key={profit}>
                {profit > 0 ? (
                  <>
                    <TokenValue amount={profit} /> +{Math.round((profit / currentWager) * 100 - 100)}%
                  </>
                ) : profit === currentWager ? (
                  <>Push - Bet Returned</>
                ) : (
                  <>You Lost</>
                )}
              </Profit>
            )}
          </div>
        </Container>

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
            {/* Game entries will be populated here */}
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No games yet. Play a game to see it here!
            </div>
          </GameEntries>
        </GameListSection>
      </GameContainer>
    </GambaUi.Portal>
  )
}