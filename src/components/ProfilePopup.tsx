import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'
import { LevelBadge } from './LevelBadge'

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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
`

const PopupContainer = styled.div<{ $isClosing?: boolean }>`
  background: #1a1a1a;
  border: 0px solid #2d2d2d;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  min-width: 450px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  animation: ${props => props.$isClosing ? 'popupFadeOut 0.4s ease-out' : 'popupFadeIn 0.4s ease-out'};
  
  @keyframes popupFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes popupFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.5rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const ProfilePicture = styled.div<{ $hasCustomAvatar?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: ${props => props.$hasCustomAvatar ? 'transparent' : 'linear-gradient(135deg, #6741ff, #8b5cf6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 0 0 4px rgba(48, 48, 48, 0.51);
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  margin-bottom: 1rem;
  margin-top: -80px;
  z-index: 10;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
  }
`

const LevelBadgeWrapper = styled.div`
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  .profile-popup-level {
    transform: scale(1.2);
  }
`

const ProfileSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`

const Username = styled.h2`
  font-family: 'Airstrike', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

const XPContainer = styled.div`
  margin: 0.5rem 0;
`

const XPText = styled.div`
  color: #888;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 0.5rem;
`

const XPBar = styled.div`
  background: #2d2d2d;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`

const XPProgress = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #6741ff, #42ff78);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
`

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(14, 14, 14, 0.68);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 60px;
`

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const StatText = styled.div`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const StatLabel = styled.div`
  color: #888;
  font-size: 1rem;
  font-weight: 500;
`

const StatValue = styled.span<{ $positive?: boolean; $negative?: boolean }>`
  color: ${props => {
    if (props.$positive) return '#42ff78'
    if (props.$negative) return '#ff6b6b'
    return 'white'
  }};
  font-weight: 600;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: center;
`

const TipButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 3.5rem;
  min-height: 3.5rem;
  width: auto;
  min-width: 180px;
  max-width: fit-content;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background:rgb(92, 187, 127);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 700;

  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #38e066;
  }
  
  &:disabled {
    background: #666;
    color: #999;
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
    
    &:hover {
      background: #666;
      transform: none;
    }
  }
`

const CloseModalButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 3.5rem;
  min-height: 3.5rem;
  width: auto;
  min-width: 180px;
  max-width: fit-content;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 700;

  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const TipModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`

const TipModal = styled.div`
  background: #1c1c1c;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  border: 1px solid #333;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`

const TipModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-align: center;
`

const TipInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgb(12, 12, 12);
  border-radius: 6px;
  border: 1px solid #333;
  height: 48px;
  min-width: 240px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
`

const TipInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  font-family: 'Flama', sans-serif;
  outline: none;
  
  &::placeholder {
    color: #666;
  }
`

const TipModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`

const TipModalButton = styled.button<{ $variant?: 'primary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Flama', sans-serif;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  background: ${({ $variant }) => $variant === 'primary' ? '#42ff78' : '#333'};
  color: ${({ $variant }) => $variant === 'primary' ? 'black' : 'white'};
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#3ae066' : '#444'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  const { publicKey, connected } = useWallet()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tipping, setTipping] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [isClosing, setIsClosing] = useState(false)

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

        if (fetchError) {
          // If profile not found, create a basic profile for display
          if (fetchError.code === 'PGRST116') {
            setProfile({
              id: 'temp',
              wallet_address: walletAddress,
              username: username,
              level: 1,
              total_wagered: 0,
              total_winnings: 0,
              biggest_win: 0,
              luckiest_win_multiplier: 0,
              games_played: 0,
              net_profit: 0,
              created_at: new Date().toISOString()
            })
            setLoading(false)
            return
          }
          throw fetchError
        }

        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [walletAddress, username])

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 400) // Match animation duration
  }

  const handleTipUser = () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet to send tips')
      return
    }
    setShowTipModal(true)
  }

  const handleSendTip = async () => {
    if (!tipAmount || isNaN(parseFloat(tipAmount)) || parseFloat(tipAmount) <= 0) {
      return
    }

    if (!publicKey) {
      alert('Please connect your wallet to send tips')
      return
    }

    setTipping(true)
    try {
      // Create a real Solana transaction to send SOL to the user's wallet
      const { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import('@solana/web3.js')
      
      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=31fbdeb8-64ef-46a3-b8c9-e5585be83acd')
      const lamports = Math.floor(parseFloat(tipAmount) * LAMPORTS_PER_SOL)
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(walletAddress),
          lamports,
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Use the wallet adapter's sign and send transaction method
      const wallet = (window as any).solana
      if (!wallet) {
        throw new Error('Wallet not found. Please install Phantom or another Solana wallet.')
      }

      // Sign and send transaction
      const signature = await wallet.signAndSendTransaction(transaction)
      
      if (signature) {
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed')
        
        alert(`Tip of ${tipAmount} SOL sent to ${profile?.username || username}! Transaction: ${signature}`)
        setShowTipModal(false)
        setTipAmount('')
        onClose()
      } else {
        throw new Error('Transaction was not signed')
      }
    } catch (error) {
      console.error('Error sending tip:', error)
      alert(`Failed to send tip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTipping(false)
    }
  }

  const calculateXPProgress = (level: number) => {
    // Simple XP calculation - can be made more sophisticated
    const currentLevelXP = (level - 1) * 1000
    const nextLevelXP = level * 1000
    const currentXP = currentLevelXP + (level * 150) // Mock current XP
    return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  }

  return (
    <>
      <PopupOverlay onClick={handleClose}>
      <PopupContainer $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        {profile && (
          <>
            <ProfileSection>
              <ProfilePicture $hasCustomAvatar={!!profile.avatar_url}>
                <img 
                  src={profile.avatar_url || '/solly.png'} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                />
              </ProfilePicture>
              <LevelBadgeWrapper>
                <LevelBadge level={profile.level} className="profile-popup-level" />
              </LevelBadgeWrapper>
            </ProfileSection>

            <Username>{profile.username || username}</Username>

            <XPContainer>
              <XPText>
                {((profile.level - 1) * 1000 + (profile.level * 150))} / {profile.level * 1000} XP
              </XPText>
              <XPBar>
                <XPProgress $progress={calculateXPProgress(profile.level)} />
              </XPBar>
            </XPContainer>

            <StatsContainer>
              <StatRow>
                <StatText>
                  <StatIcon>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </StatIcon>
                  <StatValue>{profile.games_played}</StatValue>
                </StatText>
                <StatLabel>Games Played</StatLabel>
              </StatRow>

              <StatRow>
                <StatText>
                  <StatIcon>
                    <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="SOL" style={{ width: '32px', height: '32px' }} />
                  </StatIcon>
                  <StatValue>{profile.total_wagered.toFixed(4)} SOL</StatValue>
                </StatText>
                <StatLabel>Total Wagered</StatLabel>
              </StatRow>

              <StatRow>
                <StatText>
                  <StatIcon>
                    <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="SOL" style={{ width: '32px', height: '32px' }} />
                  </StatIcon>
                  <StatValue 
                    $positive={profile.net_profit >= 0} 
                    $negative={profile.net_profit < 0}
                  >
                    {profile.net_profit.toFixed(4)} SOL
                  </StatValue>
                </StatText>
                <StatLabel>Net Profit</StatLabel>
              </StatRow>
            </StatsContainer>

            <ActionButtons>
              <TipButton 
                onClick={handleTipUser}
                disabled={tipping || !connected || publicKey?.toString() === walletAddress}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {tipping ? 'Sending...' : 'Tip User'}
              </TipButton>
              <CloseModalButton onClick={handleClose}>Close</CloseModalButton>
            </ActionButtons>
          </>
        )}
      </PopupContainer>
    </PopupOverlay>
    
    {showTipModal && (
      <TipModalOverlay>
        <TipModal>
          <TipModalTitle>Tipping {profile?.username || username}</TipModalTitle>
          <TipInputWrapper>
            <img src="/sol-coin-lg-DNgZ-FVD.webp" alt="SOL" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
            <TipInput
              type="number"
              step="0.001"
              placeholder="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
            />
          </TipInputWrapper>
          <TipModalButtons>
            <TipModalButton 
              $variant="primary" 
              onClick={handleSendTip}
              disabled={tipping || !tipAmount}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {tipping ? 'Sending...' : 'Tip User'}
            </TipModalButton>
            <TipModalButton onClick={() => setShowTipModal(false)}>
              Close
            </TipModalButton>
          </TipModalButtons>
        </TipModal>
      </TipModalOverlay>
    )}
    </>
  )
}

export default ProfilePopup