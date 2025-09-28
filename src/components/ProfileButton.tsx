import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

// Styled components
const ProfileButtonContainer = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const ProfileAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`

const Username = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  line-height: 1;
`

const WalletAddress = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #888;
  line-height: 1;
`

interface ProfileButtonProps {
  onProfileClick: () => void
}

interface UserData {
  username: string
  walletAddress: string
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ onProfileClick }) => {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      const parsed = JSON.parse(storedUserData)
      setUserData({
        username: parsed.username,
        walletAddress: parsed.walletAddress
      })
    }
  }, [])

  if (!userData) {
    return null
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <ProfileButtonContainer onClick={onProfileClick}>
      <ProfileAvatar>
        <img src="/solly.png" alt="Profile Avatar" />
      </ProfileAvatar>
      <ProfileInfo>
        <Username>{userData.username}</Username>
        <WalletAddress>{formatWalletAddress(userData.walletAddress)}</WalletAddress>
      </ProfileInfo>
    </ProfileButtonContainer>
  )
}

export default ProfileButton
