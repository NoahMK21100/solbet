import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  box-sizing: border-box;
`

const ModalWrapper = styled.div`
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  background: #0f0f0f;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 65, 255, 0.3);
  position: relative;
  padding: 2rem;
  overflow-y: auto;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.5rem;
  width: 42px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  img {
    width: 12px;
    height: 12px;
  }
`

const Title = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 2rem 0;
  color: white;
  text-align: center;
`

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 0 0 3px #37373c, 0 0 0 6px #22222d;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`

const ProfileInfo = styled.div`
  text-align: center;
  color: white;
`

const Username = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
`

const Email = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #888;
  margin: 0 0 0.5rem 0;
`

const WalletAddress = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  word-break: break-all;
`

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: rgb(20, 20, 20);
  border: 1px solid rgb(29, 29, 29);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`

const StatValue = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #42ff78;
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const EditButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6741ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:hover {
    background: #5a3ae6;
  }
`

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onEditProfile: () => void
}

interface UserData {
  walletAddress: string
  username: string
  email: string
  referralCode?: string
  createdAt: string
  gamesPlayed?: number
  totalWinnings?: number
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onEditProfile }) => {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    if (isOpen) {
      const storedUserData = localStorage.getItem('userData')
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData))
      }
    }
  }, [isOpen])

  if (!isOpen || !userData) return null

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <img src="/001-close.png" alt="Close" />
        </CloseButton>
        
        <Title>Profile</Title>
        
        <ProfileSection>
          <ProfileAvatar>
            <img src="/solly.png" alt="Profile Avatar" />
          </ProfileAvatar>
          <ProfileInfo>
            <Username>{userData.username}</Username>
            <Email>{userData.email}</Email>
            <WalletAddress>{formatWalletAddress(userData.walletAddress)}</WalletAddress>
          </ProfileInfo>
        </ProfileSection>
        
        <StatsSection>
          <StatCard>
            <StatValue>{userData.gamesPlayed || 0}</StatValue>
            <StatLabel>Games Played</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{userData.totalWinnings || 0} SOL</StatValue>
            <StatLabel>Total Winnings</StatLabel>
          </StatCard>
        </StatsSection>
        
        <EditButton onClick={onEditProfile}>
          Edit Profile
        </EditButton>
      </ModalWrapper>
    </ModalOverlay>
  )
}

export default ProfileModal
