import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'

import { Modal } from './components/Modal'
import { ChatBox } from './components/ChatBox'
import { TOS_HTML, ENABLE_TROLLBOX } from './constants'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import { ChatVisibilityProvider } from './hooks/useChatVisibility'

import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import CoinflipRecentPlays from './sections/RecentPlays/CoinflipRecentPlays'
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
  }
  
  @media (min-width: 1024px) {
    margin-left: ${props => props.$isChatVisible ? '350px' : '0'};
  }

  @media (min-width: 1920px) {
    margin-left: ${props => props.$isChatVisible ? '350px' : '0'};
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

      <Header />
      <Toasts />
      
      {/* Chat Box - Fixed position on left side */}
      <ChatBox className="chat-box" />

      <ResponsiveMainWrapper $isChatVisible={isChatVisible}>
        <Routes>
          {/* Normal landing page always shows Dashboard (with optional inline game) */}
          <Route path="/"          element={<Dashboard />} />
          {/* Dedicated game pages */}
          <Route path="/:gameId"   element={<Game />} />
        </Routes>

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
