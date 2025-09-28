import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'
import { getUsername, getUserAvatarOrDefault, hasCustomAvatar } from '../utils'

// Styled components
const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`

const ProfileButton = styled.button`
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
  border-radius: 8px;
  background: linear-gradient(135deg, #4c1d95, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 0 0 1px rgb(238, 238, 238), 0 0 0 4px #22222d;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
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

const HamburgerButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const HamburgerIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  span {
    width: 100%;
    height: 2px;
    background: white;
    border-radius: 1px;
    transition: all 0.3s ease;
  }
`

const Dropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
`

const DropdownDivider = styled.div`
  height: 1px;
  background: #2d2d2d;
  margin: 0.25rem 0;
`

interface ProfileDropdownProps {
  onProfileClick: () => void
  onBonusClick: () => void
  onStatisticsClick: () => void
  onTransactionsClick: () => void
  onReferralClick: () => void
  onDisconnectClick: () => void
}

interface UserData {
  username: string
  walletAddress: string
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onProfileClick,
  onBonusClick,
  onStatisticsClick,
  onTransactionsClick,
  onReferralClick,
  onDisconnectClick
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const handleItemClick = (callback: () => void) => {
    setIsOpen(false)
    callback()
  }

  return (
    <ProfileContainer ref={dropdownRef}>
      <ProfileButton onClick={() => setIsOpen(!isOpen)}>
        <ProfileAvatar>
          {hasCustomAvatar(userData.walletAddress) ? (
            <img 
              src={getUserAvatarOrDefault(userData.walletAddress)} 
              alt="Profile Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <img 
              src="/solly.png" 
              alt="Default Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
        </ProfileAvatar>
        <ProfileInfo>
          <Username>{userData.username}</Username>
          <WalletAddress>{formatWalletAddress(userData.walletAddress)}</WalletAddress>
        </ProfileInfo>
      </ProfileButton>
      
      <HamburgerButton onClick={() => setIsOpen(!isOpen)}>
        <HamburgerIcon>
          <span style={{ transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: isOpen ? 0 : 1 }}></span>
          <span style={{ transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none' }}></span>
        </HamburgerIcon>
      </HamburgerButton>

      <Dropdown isOpen={isOpen}>
        <DropdownItem onClick={() => handleItemClick(onProfileClick)}>
          <img src="/003-user.png" alt="Profile" style={{ 
            width: '20px', 
            height: '20px', 
            filter: location.pathname.startsWith('/profile') ? 'none' : 'brightness(0) saturate(100%) invert(85%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(88%) contrast(86%)' 
          }} />
          Profile
        </DropdownItem>
        <DropdownItem onClick={() => handleItemClick(onReferralClick)}>
          💰 Copy Invite Link
        </DropdownItem>
        <DropdownItem onClick={() => handleItemClick(onBonusClick)}>
          <img src="/bonus.svg" alt="Bonus" style={{ 
            width: '20px', 
            height: '20px', 
            filter: location.pathname.startsWith('/bonus') ? 'none' : 'brightness(0) saturate(100%) invert(85%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(88%) contrast(86%)' 
          }} />
          Bonus
        </DropdownItem>
        <DropdownItem onClick={() => handleItemClick(onStatisticsClick)}>
          <img src="/statistics.svg" alt="Statistics" style={{ 
            width: '20px', 
            height: '20px', 
            filter: location.pathname.startsWith('/statistics') ? 'none' : 'brightness(0) saturate(100%) invert(85%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(88%) contrast(86%)' 
          }} />
          Statistics
        </DropdownItem>
        <DropdownItem onClick={() => handleItemClick(onTransactionsClick)}>
          <img src="/transaction.svg" alt="Transactions" style={{ 
            width: '20px', 
            height: '20px', 
            filter: location.pathname.startsWith('/transactions') ? 'none' : 'brightness(0) saturate(100%) invert(85%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(88%) contrast(86%)' 
          }} />
          Transactions
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => handleItemClick(onDisconnectClick)} style={{ color: '#ff4444' }}>
          <img src="/disconnect.svg" alt="Disconnect" style={{ width: '20px', height: '20px', filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
          Disconnect
        </DropdownItem>
      </Dropdown>
    </ProfileContainer>
  )
}

export default ProfileDropdown
