import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import LeaderboardsModal from '../sections/LeaderBoard/LeaderboardsModal'
import { PLATFORM_JACKPOT_FEE, PLATFORM_CREATOR_ADDRESS } from '../constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { ENABLE_LEADERBOARD } from '../constants'

const TopStrip = styled.div`
  position: fixed;
  top: 0;
  left: 350px;
  width: calc(100vw - 350px);
  height: 40px;
  background: #0D0D0D;
  display: none;
  align-items: center;
  justify-content: flex-start;
  padding: 0 0.625rem;
  z-index: 1002;

  @media (min-width: 1024px) {
    display: flex;
    padding: 0 0.625rem;
  }

  @media (min-width: 1920px) {
    left: 350px;
    width: calc(100vw - 350px);
    padding: 0 0.625rem;
  }
`

const TopStripLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 12px;
  color: #BFBFCD;
`

const TopStripTextLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 0.3rem;
`

const TopStripTextLink = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #BFBFCD;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`

const TopStripRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #2D2D2D;
  border-radius: 6px;
  color: #707070;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: white;
  }

  & svg {
    width: 14px;
    height: 14px;
    filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.5));
  }
`

const MainHeader = styled.header`
  position: fixed;
  top: 40px;
  left: 350px;
  width: calc(100vw - 350px);
  height: 70px;
  background: #141414;
  border-bottom: 1px solid #1D1D1D;
  display: flex;
  align-items: center;
  z-index: 1000;

  @media (min-width: 1024px) {
    height: 70px;
  }
`

const LogoSection = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 110px;
  padding: 0 24px;
  background: #141414;
  width: auto;
  flex-shrink: 0;
  z-index: 1003;
  border-right: 1px solid #000000;
  border-bottom: 1px solid #1D1D1D;

  @media (min-width: 1024px) {
    width: 350px;
    height: 110px;
    padding: 0 32px;
  }

  @media (min-width: 1920px) {
    width: 350px;
    height: 110px;
    padding: 0 32px;
  }
`

const Logo = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 18px;

  @media (min-width: 640px) {
    font-size: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }

  @media (min-width: 1920px) {
    font-size: 30px;
  }
`

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
  background: #141414;
  position: relative;
  margin-left: 0;

  @media (min-width: 1024px) {
    margin-left: 0;
  }

  @media (min-width: 1920px) {
    margin-left: 0;
  }
`

const Navigation = styled.nav`
  display: none;
  gap: 6px;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: auto;
  padding: 0 1rem;

  @media (min-width: 768px) {
    display: flex;
    gap: 6px;
    justify-content: flex-start;
    padding: 0 1rem;
  }

  @media (min-width: 1024px) {
    padding: 0 1rem;
  }

  @media (min-width: 1920px) {
    padding: 0 1.25rem;
  }
`

const NavLinkStyled = styled(NavLink)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 45px;
  color: #A2A2A2;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5rem;
  border-radius: 6px;
  transition: color 0.3s ease;
  position: relative;
  white-space: nowrap;
  gap: 6px;

  @media (min-width: 1024px) {
    width: 123px;
    height: 45px;
  }

  &.active {
    color: #6741FF;
    font-weight: 600;
    background: transparent;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: #6741FF;
      transition: transform 0.5s cubic-bezier(0.25, 1.4, 0.61, 0.98), opacity 0.5s cubic-bezier(0.25, 1.4, 0.61, 0.98);
    }
  }

  &:hover {
    color: white;
  }
`

const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;

  @media (min-width: 768px) {
    gap: 1rem;
    padding: 0 2rem;
  }

  @media (min-width: 1024px) {
    gap: 1rem;
    padding: 0 2rem;
  }

  @media (min-width: 1920px) {
    gap: 1.25rem;
    padding: 0 2.5rem;
  }
`

const Bonus = styled.button`
  all: unset;
  cursor: pointer;
  color: #ffe42d;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  transition: background-color 0.2s;

  @media (min-width: 1024px) {
    font-size: 12px;
    padding: 4px 12px;
  }

  &:hover {
    background: rgba(255, 228, 45, 0.1);
  }
`

export default function Header() {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const location = useLocation()
  const isDesktop = useMediaQuery('lg') 
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)
  const [bonusHelp, setBonusHelp] = React.useState(false)
  const [jackpotHelp, setJackpotHelp] = React.useState(false)

  // Get current route for active navigation
  const currentPath = location.pathname

  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have <b>
              <TokenValue amount={balance.bonusBalance} />
            </b>{' '}
            worth of free plays. This bonus will be applied automatically when you
            play.
          </p>
          <p>Note that a fee is still needed from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p style={{ fontWeight: 'bold' }}>
            There&apos;s <TokenValue amount={pool.jackpotBalance} /> in the
            Jackpot.
          </p>
          <p>
            The Jackpot is a prize pool that grows with every bet made. As it
            grows, so does your chance of winning. Once a winner is selected,
            the pool resets and grows again from there.
          </p>
          <p>
            You pay a maximum of{' '}
            {(PLATFORM_JACKPOT_FEE * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}
            % of each wager for a chance to win.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) =>
                context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)
              }
            />
          </label>
        </Modal>
      )}

      {ENABLE_LEADERBOARD && showLeaderboard && (
        <LeaderboardsModal
          creator={PLATFORM_CREATOR_ADDRESS.toBase58()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Top Strip */}
      <TopStrip>
        <TopStripLeft>
          <SocialButton href="#" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </SocialButton>
          
          <SocialButton href="#" target="_blank" rel="noopener noreferrer" title="Discord">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </SocialButton>
          
          <TopStripTextLinks>
            <TopStripTextLink>Provably Fair</TopStripTextLink>
            <TopStripTextLink>Terms of Service</TopStripTextLink>
            <TopStripTextLink>Support</TopStripTextLink>
          </TopStripTextLinks>
        </TopStripLeft>
      </TopStrip>

      {/* Main Header */}
      <MainHeader>
        {/* Logo Section */}
        <LogoSection>
          <Logo to="/">
            SOLBET
          </Logo>
        </LogoSection>

        {/* Navigation Section */}
        <NavigationSection>
          {/* Left Navigation */}
              <Navigation>
                <NavLinkStyled
                  to="/jackpot"
                  className={currentPath === '/jackpot' ? 'active' : ''}
                >
                  <img src="/001-bullseye.png" alt="Jackpot" style={{ width: '24px', height: '24px' }} />
                  Jackpot
                </NavLinkStyled>
                <NavLinkStyled
                  to="/coinflip"
                  className={currentPath === '/coinflip' ? 'active' : ''}
                >
                  <img src="/001-coin.png" alt="Coinflip" style={{ width: '24px', height: '24px' }} />
                  Coinflip
                </NavLinkStyled>
                <NavLinkStyled
                  to="/affiliates"
                  className={currentPath === '/affiliates' ? 'active' : ''}
                >
                  <img src="/003-user.png" alt="Affiliates" style={{ width: '24px', height: '24px' }} />
                  Affiliates
                </NavLinkStyled>
              </Navigation>

          {/* Right Section */}
          <RightSection>
            {pool.jackpotBalance > 0 && (
              <Bonus onClick={() => setJackpotHelp(true)}>
                💰 <TokenValue amount={pool.jackpotBalance} />
              </Bonus>
            )}

            {balance.bonusBalance > 0 && (
              <Bonus onClick={() => setBonusHelp(true)}>
                ✨ <TokenValue amount={balance.bonusBalance} />
              </Bonus>
            )}

            {isDesktop && (
              <GambaUi.Button onClick={() => setShowLeaderboard(true)}>
                Leaderboard
              </GambaUi.Button>
            )}

            <TokenSelect />
            <UserButton />
          </RightSection>
        </NavigationSection>
      </MainHeader>
    </>
  )
}