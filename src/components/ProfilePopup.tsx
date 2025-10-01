import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { supabase } from '../lib/supabase'

interface ProfilePopupProps {
  walletAddress: string
  username: string
  onClose: () => void
  position: { x: number; y: number }
}

interface ProfileData {
  id: string
  wallet_address: string
  username: string
  avatar_url?: string
  level: number
  total_wagered: number
  total_winnings: number
  biggest_win: number
  luckiest_win_multiplier: number
  games_played: number
  net_profit: number
  created_at: string
  last_played_at?: string
}

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
`

const PopupContainer = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  left: ${props => Math.min(props.$x, window.innerWidth - 350)}px;
  top: ${props => Math.min(props.$y, window.innerHeight - 400)}px;
  width: 320px;
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  overflow: hidden;
`

const PopupHeader = styled.div`
  background: #2d2d2d;
  padding: 1rem;
  border-bottom: 1px solid #3d3d3d;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4c1d95, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  overflow: hidden;
`

const UserInfo = styled.div`
  flex: 1;
`

const Username = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
`

const Level = styled.div`
  font-size: 0.875rem;
  color: #a0a0a0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const PopupContent = styled.div`
  padding: 1rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #a0a0a0;
  margin-bottom: 0.25rem;
`

const StatValue = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    if (props.$positive) return '#42ff78'
    if (props.$negative) return '#ff6b6b'
    return 'white'
  }};
`

const JoinDate = styled.div`
  font-size: 0.875rem;
  color: #a0a0a0;
  text-align: center;
  padding: 0.75rem;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
`

const LoadingText = styled.div`
  text-align: center;
  color: #a0a0a0;
  padding: 2rem;
  font-style: italic;
`

const ErrorText = styled.div`
  text-align: center;
  color: #ff6b6b;
  padding: 2rem;
`

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  walletAddress,
  username,
  onClose,
  position
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (fetchError) throw fetchError

        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [walletAddress])

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer $x={position.x} $y={position.y} onClick={(e) => e.stopPropagation()}>
        <PopupHeader>
          <Avatar>
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              getInitials(username)
            )}
          </Avatar>
          <UserInfo>
            <Username>{username}</Username>
            <Level>Level {profile?.level || 1}</Level>
          </UserInfo>
          <CloseButton onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </PopupHeader>

        <PopupContent>
          {loading && <LoadingText>Loading profile...</LoadingText>}
          {error && <ErrorText>Error: {error}</ErrorText>}
          {profile && (
            <>
              <StatsGrid>
                <StatItem>
                  <StatLabel>Total Wagered</StatLabel>
                  <StatValue>{profile.total_wagered.toFixed(4)} SOL</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Total Winnings</StatLabel>
                  <StatValue>{profile.total_winnings.toFixed(4)} SOL</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Net Profit</StatLabel>
                  <StatValue 
                    $positive={profile.net_profit >= 0} 
                    $negative={profile.net_profit < 0}
                  >
                    {profile.net_profit.toFixed(4)} SOL
                  </StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Games Played</StatLabel>
                  <StatValue>{profile.games_played}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Biggest Win</StatLabel>
                  <StatValue>{profile.biggest_win.toFixed(4)} SOL</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Luckiest Win</StatLabel>
                  <StatValue>{profile.luckiest_win_multiplier.toFixed(2)}x</StatValue>
                </StatItem>
              </StatsGrid>

              <JoinDate>
                {formatJoinDate(profile.created_at)}
              </JoinDate>
            </>
          )}
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  )
}

export default ProfilePopup
