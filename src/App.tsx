import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'

import { Modal } from './components/Modal'
import { ChatBox } from './components/ChatBox'
import { RegistrationModal } from './components/RegistrationModal'
import { ProfilePage } from './components/ProfilePage'
import { BonusPage } from './components/BonusPage'
import { StatisticsPage } from './components/StatisticsPage'
import { TransactionsPage } from './components/TransactionsPage'
import { TOS_HTML, ENABLE_TROLLBOX } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import { useSupabaseUser } from './hooks/useSupabaseUser'
import { ChatVisibilityProvider } from './hooks/useChatVisibility'

import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import Footer from './sections/Footer'
import Toasts from './sections/Toasts'
import TrollBox from './components/TrollBox'

import { MainWrapper, TosInner, TosWrapper } from './styles'
import { useChatVisibility } from './hooks/useChatVisibility'
import styled from 'styled-components'

/* -------------------------------------------------------------------------- */
/* Styled Components                                                          */
/* -------------------------------------------------------------------------- */

const ResponsiveMainWrapper = styled(MainWrapper)<{ $isChatVisible: boolean }>`
  /* Mobile: Always no left margin since chat is hidden */
  @media (max-width: 1023px) {
    margin-left: 0 !important;
    margin-top: 90px !important;
  }
  
  @media (min-width: 1024px) {
    margin-left: ${props => props.$isChatVisible ? '350px' : '0'};
    margin-top: 90px;
  }
`

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast       = useToast()

  // React‑state not needed; let Toasts surface details
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

/* -------------------------------------------------------------------------- */
/* App Content                                                                */
/* -------------------------------------------------------------------------- */

function AppContent() {
  const newcomer = useUserStore((s) => s.newcomer)
  const set      = useUserStore((s) => s.set)
  const { isChatVisible } = useChatVisibility()
  const { needsRegistration, isLoading: userLoading } = useSupabaseUser()
  
  const { connected, publicKey, connecting } = useWallet()

  const handleRegistrationComplete = () => {
    // Registration completed - user will be automatically detected by useSupabaseUser
    // No need to manage local state
  }

  return (
    <>
      {/* onboarding / ToS */}
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

      {/* Registration Modal - Shows only if user needs registration */}
      {connected && !connecting && needsRegistration && !userLoading && (
        <RegistrationModal onRegistrationComplete={handleRegistrationComplete} />
      )}

      <Header />
      <Toasts />
      
      {/* Chat Box - Fixed position on left side */}
      <ChatBox className="chat-box" />

      <ResponsiveMainWrapper $isChatVisible={isChatVisible}>
        <Routes>
          {/* Main page shows Coinflip */}
          <Route path="/"          element={<Game />} />
          {/* Game pages */}
          <Route path="/:gameId"   element={<Game />} />
          {/* Profile pages */}
          <Route path="/profile"   element={<ProfilePage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/bonus"     element={<BonusPage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/statistics" element={<StatisticsPage onDisconnect={() => window.location.href = '/'} />} />
          <Route path="/transactions" element={<TransactionsPage onDisconnect={() => window.location.href = '/'} />} />
        </Routes>
        
        <Footer />
      </ResponsiveMainWrapper>

      {ENABLE_TROLLBOX && <TrollBox />}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* App                                                                        */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <ChatVisibilityProvider>
      <AppContent />
    </ChatVisibilityProvider>
  )
}
