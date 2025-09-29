import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { ProfileDropdown } from '../components/ProfileDropdown'
import { PLATFORM_ALLOW_REFERRER_REMOVAL, PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

const ConnectButtonContainer = styled.div`
  background: linear-gradient(to bottom, #221e3a, #232325);
  padding: 2px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
`

const CustomConnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.5rem;
  min-width: 2.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #6741FF;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  color: white;
  font-family: Flama, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #d787ff 0%, #6741ff 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure text is above overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
  
  .wallet-icon {
    width: 14px;
    height: 14px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
    
    @media (min-width: 768px) {
      width: 16px;
      height: 16px;
    }
  }
`

interface UserModalProps {
  onClose: () => void
}

function UserModal({ onClose }: UserModalProps) {
  const user = useUserStore()
  const wallet = useWallet()
  const toast = useToast()
  const walletModal = useWalletModal()
  const referral = useReferral()
  const [removing, setRemoving] = useState(false)

  const copyInvite = () => {
    try {
      referral.copyLinkToClipboard()
      toast({
        title: '📋 Copied to clipboard',
        description: 'Your referral code has been copied!',
      })
    } catch {
      walletModal.setVisible(true)
    }
  }

  const removeInvite = async () => {
    try {
      setRemoving(true)
      await referral.removeInvite()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h1>
        {truncateString(wallet.publicKey?.toString() ?? '', 6, 3)}
      </h1>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '100%', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
          <GambaUi.Button main onClick={copyInvite}>
            💸 Copy invite link
          </GambaUi.Button>
          <div style={{ opacity: '.8', fontSize: '80%' }}>
            Share your link with new users to earn {(PLATFORM_REFERRAL_FEE * 100)}% every time they play on this platform.
          </div>
        </div>
        {PLATFORM_ALLOW_REFERRER_REMOVAL && referral.referrerAddress && (
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
            <GambaUi.Button disabled={removing} onClick={removeInvite}>
              Remove invite
            </GambaUi.Button>
            <div style={{ opacity: '.8', fontSize: '80%' }}>
              {!removing ? (
                <>
                  You were invited by <a target="_blank" href={`https://solscan.io/account/${referral.referrerAddress.toString()}`} rel="noreferrer">
                    {truncateString(referral.referrerAddress.toString(), 6, 6)}
                  </a>.
                </>
              ) : (
                <>Removing invite...</>
              )}
            </div>
          </div>
        )}
        <GambaUi.Button onClick={() => wallet.disconnect()}>
          Disconnect
        </GambaUi.Button>
      </div>
    </Modal>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()
  const navigate = useNavigate()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleBonusClick = () => {
    navigate('/bonus')
  }

  const handleStatisticsClick = () => {
    navigate('/statistics')
  }

  const handleTransactionsClick = () => {
    navigate('/transactions')
  }

  const handleDisconnectClick = () => {
    wallet.disconnect()
    navigate('/')
  }

  const handleReferralClick = () => {
    // Show referral modal using user store
    user.set({ userModal: true })
  }

  return (
    <>
      {/* User Modal */}
      {user.userModal && (
        <UserModal onClose={() => user.set({ userModal: false })} />
      )}
      
      {/* Profile Dropdown */}
      {wallet.connected ? (
        <ProfileDropdown
          onProfileClick={handleProfileClick}
          onBonusClick={handleBonusClick}
          onStatisticsClick={handleStatisticsClick}
          onTransactionsClick={handleTransactionsClick}
          onReferralClick={handleReferralClick}
          onDisconnectClick={handleDisconnectClick}
        />
      ) : (
        <ConnectButtonContainer>
          <CustomConnectButton onClick={connect}>
            <i className="fi fi-rr-wallet wallet-icon"></i>
            {wallet.connecting ? 'Connecting' : 'Connect'}
          </CustomConnectButton>
        </ConnectButtonContainer>
      )}
    </>
  )
}
