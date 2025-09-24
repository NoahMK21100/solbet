// src/sections/RecentPlays/CoinflipRecentPlays.tsx
import React from 'react'
import styled from 'styled-components'

// Mock data for recent coinflip games
const MOCK_COINFLIP_GAMES = [
  {
    id: 1,
    player1: { name: 'Austinly...', level: 43, avatar: '/avatars/avatar1.png', side: 'rocket' },
    player2: { name: 'CryptoKing', level: 22, avatar: '/avatars/avatar2.png', side: 'hamburger' },
    amount: 0.03,
    status: 'completed',
    result: 'win',
    time: Date.now() - 300000, // 5 minutes ago
  },
  {
    id: 2,
    player1: { name: 'Roronoa...', level: 15, avatar: '/avatars/avatar3.png', side: 'hamburger' },
    player2: { name: 'SolSurfer', level: 18, avatar: '/avatars/avatar4.png', side: 'rocket' },
    amount: 0.014,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 600000, // 10 minutes ago
  },
  {
    id: 3,
    player1: { name: 'NFT_Guru', level: 30, avatar: '/avatars/avatar5.png', side: 'hamburger' },
    player2: { name: 'DeFi_Dude', level: 12, avatar: '/avatars/avatar6.png', side: 'rocket' },
    amount: 0.07,
    status: 'completed',
    result: 'win',
    time: Date.now() - 900000, // 15 minutes ago
  },
  {
    id: 4,
    player1: { name: 'BlockchainBabe', level: 28, avatar: '/avatars/avatar7.png', side: 'rocket' },
    player2: { name: 'TokenTitan', level: 35, avatar: '/avatars/avatar8.png', side: 'hamburger' },
    amount: 0.1,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 1200000, // 20 minutes ago
  },
  {
    id: 5,
    player1: { name: 'MoonBoy', level: 19, avatar: '/avatars/avatar9.png', side: 'hamburger' },
    player2: { name: 'DiamondHands', level: 25, avatar: '/avatars/avatar10.png', side: 'rocket' },
    amount: 0.025,
    status: 'completed',
    result: 'win',
    time: Date.now() - 1500000, // 25 minutes ago
  },
  {
    id: 6,
    player1: { name: 'CryptoWhale', level: 42, avatar: '/avatars/avatar11.png', side: 'rocket' },
    player2: { name: 'HODLer', level: 31, avatar: '/avatars/avatar12.png', side: 'hamburger' },
    amount: 0.15,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 1800000, // 30 minutes ago
  },
  {
    id: 7,
    player1: { name: 'SolanaBull', level: 27, avatar: '/avatars/avatar13.png', side: 'hamburger' },
    player2: { name: 'PumpKing', level: 33, avatar: '/avatars/avatar14.png', side: 'rocket' },
    amount: 0.08,
    status: 'completed',
    result: 'win',
    time: Date.now() - 2100000, // 35 minutes ago
  },
  {
    id: 8,
    player1: { name: 'LamboDreams', level: 16, avatar: '/avatars/avatar15.png', side: 'rocket' },
    player2: { name: 'ToTheMoon', level: 24, avatar: '/avatars/avatar16.png', side: 'hamburger' },
    amount: 0.04,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 2400000, // 40 minutes ago
  },
  {
    id: 9,
    player1: { name: 'CryptoNinja', level: 38, avatar: '/avatars/avatar17.png', side: 'hamburger' },
    player2: { name: 'SolanaSamurai', level: 29, avatar: '/avatars/avatar18.png', side: 'rocket' },
    amount: 0.12,
    status: 'completed',
    result: 'win',
    time: Date.now() - 2700000, // 45 minutes ago
  },
  {
    id: 10,
    player1: { name: 'DegenTrader', level: 21, avatar: '/avatars/avatar19.png', side: 'rocket' },
    player2: { name: 'ApeStrong', level: 26, avatar: '/avatars/avatar20.png', side: 'hamburger' },
    amount: 0.06,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 3000000, // 50 minutes ago
  },
  {
    id: 11,
    player1: { name: 'SolanaSniper', level: 34, avatar: '/avatars/avatar21.png', side: 'hamburger' },
    player2: { name: 'CryptoHunter', level: 37, avatar: '/avatars/avatar22.png', side: 'rocket' },
    amount: 0.09,
    status: 'completed',
    result: 'win',
    time: Date.now() - 3300000, // 55 minutes ago
  },
  {
    id: 12,
    player1: { name: 'MoonRocket', level: 23, avatar: '/avatars/avatar23.png', side: 'rocket' },
    player2: { name: 'DiamondDust', level: 20, avatar: '/avatars/avatar24.png', side: 'hamburger' },
    amount: 0.035,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: 13,
    player1: { name: 'SolanaStorm', level: 32, avatar: '/avatars/avatar25.png', side: 'hamburger' },
    player2: { name: 'CryptoWave', level: 28, avatar: '/avatars/avatar26.png', side: 'rocket' },
    amount: 0.11,
    status: 'completed',
    result: 'win',
    time: Date.now() - 3900000, // 1h 5m ago
  },
  {
    id: 14,
    player1: { name: 'PumpMaster', level: 40, avatar: '/avatars/avatar27.png', side: 'rocket' },
    player2: { name: 'SolanaKing', level: 36, avatar: '/avatars/avatar28.png', side: 'hamburger' },
    amount: 0.18,
    status: 'completed',
    result: 'lose',
    time: Date.now() - 4200000, // 1h 10m ago
  },
  {
    id: 15,
    player1: { name: 'CryptoLegend', level: 45, avatar: '/avatars/avatar29.png', side: 'hamburger' },
    player2: { name: 'SolanaHero', level: 41, avatar: '/avatars/avatar30.png', side: 'rocket' },
    amount: 0.22,
    status: 'completed',
    result: 'win',
    time: Date.now() - 4500000, // 1h 15m ago
  },
]

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Recent = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-wrap: nowrap;
  padding: 12px;
  color: unset;
  text-decoration: none;
  justify-content: space-between;
  border-radius: 10px;
  background: #0f121b;
  border: 1px solid #1a1a1a;
  transition: all 0.2s ease;
  
  &:hover {
    background: #131724;
    border-color: #333;
  }
`

const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PlayerAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: white;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
`

const PlayerName = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
`

const PlayerLevel = styled.span`
  background: #6741ff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  font-family: 'Flama', sans-serif;
`

const VsText = styled.span`
  font-weight: 700;
  color: #6741ff;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
`

const BetAmount = styled.span`
  color: #42ff78;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
`

const Result = styled.div<{ result: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.result === 'win' ? '#42ff78' : '#ff4444'};
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
`

const TimeDiff = styled.span`
  color: #888;
  font-size: 0.75rem;
  font-family: 'Flama', sans-serif;
`

function TimeDiffComponent({ time }: { time: number }) {
  const diff = Date.now() - time
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hrs = Math.floor(min / 60)
  
  if (hrs >= 1) return <TimeDiff>{hrs}h ago</TimeDiff>
  if (min >= 1) return <TimeDiff>{min}m ago</TimeDiff>
  return <TimeDiff>Just now</TimeDiff>
}

export default function CoinflipRecentPlays() {
  return (
    <Container>
      {MOCK_COINFLIP_GAMES.map((game) => (
        <Recent key={game.id}>
          <GameInfo>
            <PlayerInfo>
              <PlayerAvatar>
                {game.player1.name.charAt(0)}
              </PlayerAvatar>
              <PlayerName>{game.player1.name}</PlayerName>
              <PlayerLevel>{game.player1.level}</PlayerLevel>
            </PlayerInfo>
            
            <VsText>VS</VsText>
            
            <PlayerInfo>
              <PlayerAvatar>
                {game.player2.name.charAt(0)}
              </PlayerAvatar>
              <PlayerName>{game.player2.name}</PlayerName>
              <PlayerLevel>{game.player2.level}</PlayerLevel>
            </PlayerInfo>
            
            <BetAmount>{game.amount} SOL</BetAmount>
            
            <Result result={game.result}>
              {game.result === 'win' ? '🎉' : '💥'}
              {game.result === 'win' ? 'WON' : 'LOST'}
            </Result>
          </GameInfo>
          
          <TimeDiffComponent time={game.time} />
        </Recent>
      ))}
    </Container>
  )
}
