import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useGambaGameSync } from '../hooks/useGambaGameSync'

const Container = styled.div`
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 8px;
  margin: 1rem 0;
`

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`

const Title = styled.h3`
  color: white;
  margin: 0;
`

const SyncButton = styled.button<{ $isSyncing: boolean }>`
  background: ${props => props.$isSyncing ? '#666' : '#42ff78'};
  color: ${props => props.$isSyncing ? '#999' : 'black'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: ${props => props.$isSyncing ? 'not-allowed' : 'pointer'};
  font-weight: bold;
  
  &:hover {
    background: ${props => props.$isSyncing ? '#666' : '#3ce066'};
  }
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`

const StatCard = styled.div`
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #42ff78;
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  color: #ccc;
  font-size: 0.9rem;
`

const GameResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
`

const TableHeader = styled.th`
  background: #333;
  color: white;
  padding: 0.75rem;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #444;
`

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #333;
  color: #ccc;
`

const TableRow = styled.tr`
  &:hover {
    background: #222;
  }
`

const GameTypeBadge = styled.span<{ $gameType: string }>`
  background: ${props => {
    switch (props.$gameType) {
      case 'coinflip': return '#42ff78'
      case 'slots': return '#ff6b6b'
      case 'roulette': return '#4ecdc4'
      case 'plinko': return '#ffe66d'
      default: return '#666'
    }
  }};
  color: ${props => props.$gameType === 'plinko' ? 'black' : 'white'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
`

const ResultBadge = styled.span<{ $result: 'win' | 'lose' }>`
  background: ${props => props.$result === 'win' ? '#42ff78' : '#ff6b6b'};
  color: ${props => props.$result === 'win' ? 'black' : 'white'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
`

const ErrorMessage = styled.div`
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`

interface GameResult {
  id: string
  wallet_address: string
  game_type: string
  wager_amount: number
  payout_amount: number
  multiplier: number
  result: 'win' | 'lose'
  rng_seed: string
  client_seed: string
  nonce: number
  game_id: string
  created_at: string
}

export const GameResultsManager: React.FC = () => {
  const {
    syncState,
    syncCurrentWalletGames,
    syncAllRecentGames,
    getWalletGameResults,
    getAllGameResults
  } = useGambaGameSync()

  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [showAllGames, setShowAllGames] = useState(false)

  const loadGameResults = async () => {
    try {
      const results = showAllGames 
        ? await getAllGameResults()
        : await getWalletGameResults()
      setGameResults(results)
    } catch (error) {
      console.error('Error loading game results:', error)
    }
  }

  useEffect(() => {
    loadGameResults()
  }, [showAllGames, getWalletGameResults, getAllGameResults])

  const handleSyncCurrent = async () => {
    await syncCurrentWalletGames()
    await loadGameResults()
  }

  const handleSyncAll = async () => {
    await syncAllRecentGames()
    await loadGameResults()
  }

  const totalWagered = gameResults.reduce((sum, game) => sum + game.wager_amount, 0)
  const totalWon = gameResults.reduce((sum, game) => sum + game.payout_amount, 0)
  const totalGames = gameResults.length
  const winRate = totalGames > 0 ? (gameResults.filter(g => g.result === 'win').length / totalGames) * 100 : 0

  return (
    <Container>
      <Header>
        <Title>Game Results Manager</Title>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <SyncButton 
            $isSyncing={syncState.isSyncing}
            onClick={handleSyncCurrent}
            disabled={syncState.isSyncing}
          >
            {syncState.isSyncing ? 'Syncing...' : 'Sync Current Wallet'}
          </SyncButton>
          <SyncButton 
            $isSyncing={syncState.isSyncing}
            onClick={handleSyncAll}
            disabled={syncState.isSyncing}
          >
            {syncState.isSyncing ? 'Syncing...' : 'Sync All Games'}
          </SyncButton>
        </div>
      </Header>

      {syncState.error && (
        <ErrorMessage>
          Error: {syncState.error}
        </ErrorMessage>
      )}

      <StatsContainer>
        <StatCard>
          <StatValue>{totalGames}</StatValue>
          <StatLabel>Total Games</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalWagered.toFixed(4)}</StatValue>
          <StatLabel>Total Wagered (SOL)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalWon.toFixed(4)}</StatValue>
          <StatLabel>Total Won (SOL)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{winRate.toFixed(1)}%</StatValue>
          <StatLabel>Win Rate</StatLabel>
        </StatCard>
      </StatsContainer>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: 'white', marginRight: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showAllGames}
            onChange={(e) => setShowAllGames(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Show All Games (not just current wallet)
        </label>
      </div>

      {gameResults.length > 0 ? (
        <GameResultsTable>
          <thead>
            <tr>
              <TableHeader>Game Type</TableHeader>
              <TableHeader>Result</TableHeader>
              <TableHeader>Wager</TableHeader>
              <TableHeader>Payout</TableHeader>
              <TableHeader>Multiplier</TableHeader>
              <TableHeader>RNG Seed</TableHeader>
              <TableHeader>Client Seed</TableHeader>
              <TableHeader>Nonce</TableHeader>
              <TableHeader>Game ID</TableHeader>
              <TableHeader>Date</TableHeader>
            </tr>
          </thead>
          <tbody>
            {gameResults.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <GameTypeBadge $gameType={game.game_type}>
                    {game.game_type.toUpperCase()}
                  </GameTypeBadge>
                </TableCell>
                <TableCell>
                  <ResultBadge $result={game.result}>
                    {game.result.toUpperCase()}
                  </ResultBadge>
                </TableCell>
                <TableCell>{game.wager_amount.toFixed(4)} SOL</TableCell>
                <TableCell>{game.payout_amount.toFixed(4)} SOL</TableCell>
                <TableCell>{game.multiplier.toFixed(2)}x</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {game.rng_seed.slice(0, 8)}...
                </TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {game.client_seed.slice(0, 8)}...
                </TableCell>
                <TableCell>{game.nonce}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {game.game_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {new Date(game.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </GameResultsTable>
      ) : (
        <div style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
          No game results found. Click "Sync" to fetch game data from the blockchain.
        </div>
      )}
    </Container>
  )
}
