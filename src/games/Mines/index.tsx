import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import { GRID_SIZE, MINE_SELECT, PITCH_INCREASE_FACTOR, SOUND_EXPLODE, SOUND_FINISH, SOUND_STEP, SOUND_TICK, SOUND_WIN } from './constants'
import { 
  GameListHeader, AllGamesTitle, SortControls, SortByLabel, SortValue, SortDropdownContainer, ArrowContainer, SortDropdown, DropdownOption, GameContainer,
  GameCreationSection, GameHeader, GameSubtitle, GameTitle, GameControls, LeftSection, RightSection, BetAndButtonsGroup, BetInputAndButtons, CoinsAndCreateGroup, RightControls, BetAmountSection, BetLabel, SolanaIcon, BetInputWrapper, BetInput, CurrencyDropdown, USDTooltip, QuickBetButtons, QuickBetButtonContainer, QuickBetButton, ChooseSideSection, SideButtons, SideButton, CreateGameButton,
  GameListSection, GameEntries, GameEntry, PlayerInfo, PlayerAvatar, PlayerName, PlayerLevel, WinnerCoinIcon, VsIcon, BetAmountDisplay, JoinButton, StatusButton, EyeIcon, WinningAmount, ViewGameButton,
  CellButton, Container, Container2, Grid, Level, Levels, StatusBar
} from './styles'
import { Dropdown } from '../../components/Dropdown'
import { generateGrid, revealAllMines, revealGold } from './utils'
import SOLANA_ICON from '/solana.png'

function Mines() {
  const game = GambaUi.useGame()
  const { publicKey } = useWallet()
  const sounds = useSound({
    tick: SOUND_TICK,
    win: SOUND_WIN,
    finish: SOUND_FINISH,
    step: SOUND_STEP,
    explode: SOUND_EXPLODE,
  })
  const pool = useCurrentPool()

  // Game state
  const [grid, setGrid] = React.useState(generateGrid(GRID_SIZE))
  const [currentLevel, setLevel] = React.useState(0)
  const [selected, setSelected] = React.useState(-1)
  const [totalGain, setTotalGain] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [started, setStarted] = React.useState(false)

  // UI state
  const [betAmount, setBetAmount] = useState(0)
  const [currency, setCurrency] = useState<'SOL' | 'FAKE'>('SOL')
  const [games, setGames] = useState<any[]>([])
  const [userGames, setUserGames] = useState<any[]>([])
  const [platformGames, setPlatformGames] = useState<any[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed' | 'joining'>('waiting')
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameId, setGameId] = useState(() => Math.floor(Math.random() * 1000000))
  const [showGameViewModal, setShowGameViewModal] = useState(false)
  const [selectedGameForView, setSelectedGameForView] = useState<any>(null)
  const [showGameResultModal, setShowGameResultModal] = useState(false)
  const [selectedGameResult, setSelectedGameResult] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const [initialWager, setInitialWager] = useWagerInput()
  const [mines, setMines] = React.useState(MINE_SELECT[2])

  // Get RNG seed from Gamba for proper hash generation
  const gamba = useGamba()
  const hashedSeed = gamba.nextRngSeedHashed || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'

  // Mock SOL price for USD conversion

  const getMultiplierForLevel = (level: number) => {
    const remainingCells = GRID_SIZE - level
    return Number(BigInt(remainingCells * BPS_PER_WHOLE) / BigInt(remainingCells - mines)) / BPS_PER_WHOLE
  }

  const levels = React.useMemo(
    () => {
      const totalLevels = GRID_SIZE - mines
      let cumProfit = 0
      let previousBalance = initialWager

      return Array.from({ length: totalLevels }).map((_, level) => {
        // For the first level, the wager is the initial wager. For subsequent levels, it's the previous balance.
        const wager = level === 0 ? initialWager : previousBalance
        const multiplier = getMultiplierForLevel(level)
        const remainingCells = GRID_SIZE - level
        const bet = Array.from({ length: remainingCells }, (_, i) => i < mines ? 0 : multiplier)

        const profit = wager * (multiplier - 1)
        cumProfit += profit
        const balance = wager + profit

        previousBalance = balance
        return { bet, wager, profit, cumProfit, balance }
      }).filter(x => Math.max(...x.bet) * x.wager < pool.maxPayout)
    },
    [initialWager, mines, pool.maxPayout],
  )

  const remainingCells = GRID_SIZE - currentLevel
  const gameFinished = remainingCells <= mines
  const canPlay = started && !loading && !gameFinished

  const { wager, bet } = levels[currentLevel] ?? {}

  const start = () => {
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(true)
  }

  const endGame = async () => {
    sounds.play('finish')
    reset()
  }

  const reset = () => {
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(false)
  }

  const cashout = async () => {
    if (totalGain <= 0) {
      alert('No winnings to cash out!')
      return
    }

    try {
      setLoading(true)
      
      // Calculate the bet array for the total winnings
      const remainingCells = GRID_SIZE - currentLevel
      const multiplier = getMultiplierForLevel(currentLevel)
      const betArray = Array.from({ length: remainingCells }, (_, i) => i < mines ? 0 : multiplier)
      const wagerInLamports = Math.floor(initialWager * 1_000_000_000)
      
      // Now make the actual blockchain transaction for the total winnings
      await game.play({
        bet: betArray,
        wager: wagerInLamports,
        metadata: [currentLevel, totalGain],
      })

      const result = await game.result()
      
      if (result.payout > 0) {
        console.log('Cashout successful!', { totalGain, payout: result.payout })
        alert(`Successfully cashed out ${(result.payout / 1_000_000_000).toFixed(4)} SOL!`)
        reset()
      } else {
        alert('Cashout failed - no payout received')
      }
      
    } catch (error) {
      console.error('Cashout failed:', error)
      alert('Cashout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const play = async (cellIndex: number) => {
    // Only allow playing if game has started and cell is hidden
    if (!started || grid[cellIndex].status !== 'hidden') {
      return
    }

    setLoading(true)
    setSelected(cellIndex)
    
    try {
      sounds.sounds.step.player.loop = true
      sounds.play('step', {  })
      sounds.sounds.tick.player.loop = true
      sounds.play('tick', {  })

      // Simulate the click without blockchain transaction
      const isMine = Math.random() < (mines / (GRID_SIZE - currentLevel))
      
      sounds.sounds.tick.player.stop()

      if (isMine) {
        // Hit a mine - game over
        setStarted(false)
        setGrid(revealAllMines(grid, cellIndex, mines))
        sounds.play('explode')
        setTotalGain(0) // Reset winnings
        return
      }

      // Safe square - calculate winnings
      const nextLevel = currentLevel + 1
      const multiplier = getMultiplierForLevel(currentLevel)
      const profit = initialWager * multiplier
      
      setLevel(nextLevel)
      setGrid(revealGold(grid, cellIndex, profit))
      setTotalGain(prev => prev + profit)

      if (nextLevel < GRID_SIZE - mines) {
        sounds.play('win', { playbackRate: Math.pow(PITCH_INCREASE_FACTOR, currentLevel) })
      } else {
        // No more squares - game complete
        sounds.play('win', { playbackRate: .9 })
        sounds.play('finish')
        setStarted(false) // Game complete, ready for cashout
      }
    } finally {
      setLoading(false)
      setSelected(-1)
      sounds.sounds.tick.player.stop()
      sounds.sounds.step.player.stop()
    }
  }

  return (
    <GambaUi.Portal target="screen">
      <GameContainer>
        <GameCreationSection>
          <GameControls>
            <LeftSection>
              <GameTitle>Mines</GameTitle>
            </LeftSection>

            <RightSection>
              <BetAndButtonsGroup>
                <BetLabel>
                  Bet Amount
                </BetLabel>
                
                <BetInputAndButtons>
                  <BetAmountSection>
                    <BetInputWrapper>
                      <GambaUi.WagerInput value={betAmount} onChange={setBetAmount} />
                    </BetInputWrapper>
                  </BetAmountSection>

                  <QuickBetButtons>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => setBetAmount(w => (w || 0) + 0.01)}>
                        +0.01
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                    <QuickBetButtonContainer>
                      <QuickBetButton onClick={() => setBetAmount(w => (w || 0) + 1)}>
                        +1
                      </QuickBetButton>
                    </QuickBetButtonContainer>
                  </QuickBetButtons>
                </BetInputAndButtons>
              </BetAndButtonsGroup>

              <CoinsAndCreateGroup>
                <ChooseSideSection>
                  <SideButtons>
                    {MINE_SELECT.map((mineCount) => (
                      <SideButton 
                        key={mineCount} 
                        selected={mines === mineCount} 
                        onClick={() => setMines(mineCount)}
                      >
                        {mineCount}
                      </SideButton>
                    ))}
                  </SideButtons>
                </ChooseSideSection>

                <CreateGameButton 
                  onClick={() => {
                    if (!started) {
                      start()
                    }
                  }} 
                  disabled={started}
                >
                  {started ? 'Playing...' : 'Start Game'}
                </CreateGameButton>

                {!started && totalGain > 0 && (
                  <CreateGameButton 
                    onClick={cashout}
                    disabled={loading}
                    style={{ 
                      background: '#42ff78', 
                      color: 'black',
                      marginLeft: '0.5rem'
                    }}
                  >
                    {loading ? 'Cashing Out...' : `Cashout ${(totalGain / 1_000_000_000).toFixed(4)} SOL`}
                  </CreateGameButton>
                )}
              </CoinsAndCreateGroup>
            </RightSection>
          </GameControls>
          
          <GameSubtitle>Pick mines and play</GameSubtitle>
        </GameCreationSection>

        {/* BIGGER MINE GRID */}
        <Container2 style={{ padding: '2rem', minHeight: '400px' }}>
          <Levels>
            {levels
              .map(({ cumProfit }, i) => {
                return (
                  <Level key={i} $active={currentLevel === i}>
                    <div>
                      LEVEL {i + 1}
                    </div>
                    <div>
                      <TokenValue amount={cumProfit} />
                    </div>
                  </Level>
                )
              })}
          </Levels>
          <StatusBar>
            <div>
              <span>
                Mines: {mines}
              </span>
              {totalGain > 0 && (
                <span>
                  +<TokenValue amount={totalGain} /> +{Math.round(totalGain / initialWager * 100 - 100)}%
                </span>
              )}
            </div>
          </StatusBar>
          <GambaUi.Responsive>
            <Container>
              <Grid>
                {grid.map((cell, index) => (
                  <CellButton
                    key={index}
                    status={cell.status}
                    selected={selected === index}
                    onClick={() => play(index)}
                    disabled={!canPlay || cell.status !== 'hidden'}
                  >
                    {(cell.status === 'gold') && (
                      <div>
                        +<TokenValue amount={cell.profit} />
                      </div>
                    )}
                  </CellButton>
                ))}
              </Grid>
            </Container>
          </GambaUi.Responsive>
        </Container2>
      </GameContainer>
    </GambaUi.Portal>
  )
}

export default Mines

