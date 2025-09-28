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


const MainHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 90px;
  background: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  align-items: stretch;
  padding: 10px 0;
  z-index: 1000;

  @media (min-width: 1024px) {
    height: 90px;
    padding: 10px 0;
  }
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 32px;
  width: 350px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-family: 'Airstrike', sans-serif;
  font-weight: 400;
  font-size: 2rem;
  gap: 0.5rem;

  @media (min-width: 640px) {
    font-size: 2.25rem;
  }

  @media (min-width: 1024px) {
    font-size: 2.5rem;
  }

  @media (min-width: 1920px) {
    font-size: 3rem;
  }
`

const LogoLink = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  font-family: 'Airstrike', sans-serif !important;
  font-weight: 400 !important;
`

const LogoImage = styled.img`
  height: 55px;
  width: auto;
  object-fit: contain;
  cursor: pointer;

  @media (min-width: 640px) {
    height: 65px;
  }

  @media (min-width: 1024px) {
    height: 75px;
  }

  @media (min-width: 1920px) {
    height: 85px;
  }
`

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
  background: transparent;
  position: relative;
  margin-left: 0;
  padding: 0 1.5rem;
`

const Navigation = styled.nav`
  display: none;
  gap: 6px;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: auto;

  @media (min-width: 768px) {
    display: flex;
    gap: 6px;
    justify-content: flex-start;
  }
`

const NavLinkStyled = styled(NavLink)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 40px;
  color: #A2A2A2;
  text-decoration: none;
  font-family: 'Inter', 'Inter Fallback', sans-serif !important;
  font-style: normal !important;
  font-weight: 700 !important;
  font-size: 0.8rem;
  line-height: 1.2rem;
  text-transform: uppercase;
  border-radius: 6px;
  transition: color 0.3s ease;
  position: relative;
  white-space: nowrap;
  gap: 4px;
  margin: 0 8px;

  @media (min-width: 1024px) {
    width: 120px;
    height: 40px;
    margin: 0 12px;
  }

  &.active {
    color: #6741FF;
    font-weight: 900 !important;
    background: transparent;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
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
  padding-right: 1rem;

  @media (min-width: 768px) {
    gap: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 1024px) {
    gap: 1rem;
    padding-right: 1.5rem;
  }

  @media (min-width: 1920px) {
    gap: 1.25rem;
    padding-right: 2rem;
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
    background: transparent;
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

      {/* Main Header */}
      <MainHeader>
        {/* Logo Section */}
        <LogoSection>
          <Logo>
            <LogoImage 
              src="/UpscaleLogo.png" 
              alt="Solbet Logo"
            />
            <LogoLink to="/">
              SOLBET
            </LogoLink>
          </Logo>
        </LogoSection>

        {/* Navigation Section */}
        <NavigationSection>
          {/* Left Navigation */}
              <Navigation>
                <NavLinkStyled
                  to="/flip"
                  className={currentPath === '/flip' || currentPath === '/' ? 'active' : ''}
                >
                  <img src="/001-coin.png" alt="Coinflip" style={{ width: '16px', height: '16px' }} />
                  Coinflip
                </NavLinkStyled>
                <NavLinkStyled
                  to="/affiliates"
                  className={currentPath === '/affiliates' ? 'active' : ''}
                >
                  <img src="/003-user.png" alt="Affiliates" style={{ width: '16px', height: '16px' }} />
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