import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'


import { Modal } from './components/Modal'
import { RegistrationModal } from './components/RegistrationModal'
import { ProfilePage } from './components/ProfilePage'
import { BonusPage } from './components/BonusPage'
import { StatisticsPage } from './components/StatisticsPage'
import { TOS_HTML, ENABLE_TROLLBOX } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import { useSupabaseWalletSync } from './hooks/useSupabaseWalletSync'
import { useChatVisibility } from './hooks/useChatVisibility'

import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import Toasts from './sections/Toasts'
import TrollBox from './components/TrollBox'

import { MainWrapper, TosInner, TosWrapper } from './styles'
import styled from 'styled-components'

const ResponsiveMainWrapper = styled(MainWrapper)<{ $isChatMinimized: boolean }>`
  @media (max-width: 1023px) {
    margin-left: 0 !important;
    margin-top: 90px !important;
    width: 100vw !important;
  }
  
  @media (min-width: 1024px) {
    margin-left: ${props => props.$isChatMinimized ? '0' : '350px'};
    width: ${props => props.$isChatMinimized ? '100vw' : 'calc(100vw - 350px)'};
    margin-top: 90px;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast = useToast()

  useTransactionError((err) => {
    if (err.message === 'NOT_CONNECTED') {
      walletModal.setVisible(true)
    } else {
      toast({
        title: '❌ Transaction error',
        description: err.error?.errorMessage ?? err.message,
      })
    }
  })

  return null
}

function AppContent() {
  const newcomer = useUserStore((s) => s.newcomer)
  const set = useUserStore((s) => s.set)
  
  const { profile, loading: userLoading, isNewUser, error: userError, refreshProfile } = useSupabaseWalletSync()
  const { isMinimized } = useChatVisibility()
  
  const { connected, publicKey, connecting } = useWallet()

  const handleRegistrationComplete = () => {
    // Registration completed - trigger a re-sync to update isNewUser
    refreshProfile()
  }

  return (
    <>
      {newcomer && (
        <Modal>
          <h1>Welcome</h1>
          <TosWrapper>
            <TosInner dangerouslySetInnerHTML={{ __html: TOS_HTML }} />
          </TosWrapper>
          <p>By playing on our platform, you confirm your compliance.</p>
          <GambaUi.Button main onClick={() => set({ newcomer: false })}>
            Acknowledge
          </GambaUi.Button>
        </Modal>
      )}

      <ScrollToTop />
      <ErrorHandler />

      {connected && !connecting && isNewUser && !userLoading && publicKey && (
        <RegistrationModal onRegistrationComplete={handleRegistrationComplete} />
      )}

      {userError && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'red', 
          color: 'white', 
          padding: '10px',
          borderRadius: '5px',
          zIndex: 10000
        }}>
          User Error: {userError}
        </div>
      )}

      <Header />
      <Toasts />

      <ResponsiveMainWrapper $isChatMinimized={isMinimized}>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/profile" element={<ProfilePage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/bonus" element={<BonusPage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/statistics" element={<StatisticsPage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/transactions" element={<div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Transactions content coming soon...</div>} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
      </ResponsiveMainWrapper>

      {ENABLE_TROLLBOX && <TrollBox />}
    </>
  )
}

export default function App() {
  return <AppContent />
}