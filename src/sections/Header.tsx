import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React, { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { PLATFORM_JACKPOT_FEE, PLATFORM_CREATOR_ADDRESS } from '../constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { ENABLE_LEADERBOARD } from '../constants'

// Declare tsParticles function for TypeScript
declare global {
  interface Window {
    tsParticles: {
      load: (id: string, config: any) => Promise<void>;
    };
  }
}


const MainHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 90px;
  background: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  font-size: 2rem !important;
  display: flex;
  gap: 2px;

  span {
    display: inline-block;
    animation: floating-letter 4s cubic-bezier(0.37, 0, 0.63, 1) infinite;
    font-family: 'Airstrike', sans-serif !important;
    font-weight: 400 !important;
  }

  span:nth-child(1) { animation-delay: 0s; }
  span:nth-child(2) { animation-delay: 0.3s; }
  span:nth-child(3) { animation-delay: 0.6s; }
  span:nth-child(4) { animation-delay: 0.9s; }
  span:nth-child(5) { animation-delay: 1.2s; }
  span:nth-child(6) { animation-delay: 1.5s; }

  @keyframes floating-letter {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(0, -1px) rotate(0.3deg);
    }
    50% {
      transform: translate(0, 0) rotate(0deg);
    }
    75% {
      transform: translate(0, 1px) rotate(-0.3deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }

  @media (min-width: 640px) {
    font-size: 2.25rem !important;
  }

  @media (min-width: 1024px) {
    font-size: 2.5rem !important;
  }

  @media (min-width: 1920px) {
    font-size: 3rem !important;
  }
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
  padding: 0 0.5rem;
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
  font-weight: 900 !important;
  font-size: 0.9rem;
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
      width: 90%;
      height: 1px;
      background: #6741FF;
      transition: transform 0.5s cubic-bezier(0.25, 1.4, 0.61, 0.98), opacity 0.5s cubic-bezier(0.25, 1.4, 0.61, 0.98);
    }
  }

  &:hover {
    color: white;
  }
`

const ParticlesContainer = styled.div`
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 80px;
  pointer-events: none;
  z-index: 10;
  
  canvas {
    filter: drop-shadow(0 0 6px #6741FF) drop-shadow(0 0 12px #8B5CF6);
  }
`

const ParticleEffect: React.FC = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particlesRef.current && window.tsParticles) {
      const config = {
        fpsLimit: 60,
        particles: {
          number: {
            value: 0,
            density: {
              enable: true,
              value_area: 1000
            }
          },
          color: {
            value: "#8B5CF6",
            animation: {
              enable: false,
              speed: -70,
              sync: true
            }
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 1,
            random: false,
            animation: {
              enable: true,
              speed: -0.5,
              minimumValue: 0,
              sync: true
            }
          },
          size: {
            value: 2.5,
            random: { enable: true, minimumValue: 1 },
            animation: {
              enable: true,
              speed: 4,
              minimumValue: 0,
              sync: true
            }
          },
          life: {
            duration: {
              value: 1
            },
            count: 1
          },
          move: {
            angle: {
              value: 45,
              offset: 0
            },
            enable: true,
            gravity: {
              enable: true,
              acceleration: -0.5
            },
            speed: 3,
            direction: "top",
            random: { enable: true, minimumValue: 2 },
            straight: false,
            size: false,
            outModes: {
              default: "destroy",
              bottom: "none"
            },
            attract: {
              enable: false,
              distance: 300,
              rotate: {
                x: 600,
                y: 1200
              }
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            resize: true
          }
        },
        detectRetina: false,
        
        emitters: [{
          direction: "top",
          rate: {
            quantity: 50,
            delay: 0.01
          },
          size: {
            width: 27,
            height: 1
          },
          position: {
            x: 26.5,
            y: 42.5
          }
        },
        {
          direction: "top",
          rate: {
            quantity: 10,
            delay: 0.01
          },
          size: {
            width: 1.5,
            height: 1
          },
          position: {
            x: 11.25,
            y: 53.5
          }
        },
        {
          direction: "top",
          rate: {
            quantity: 10,
            delay: 0.01
          },
          size: {
            width: 1.5,
            height: 1
          },
          position: {
            x: 12.75,
            y: 48
          }
        }]
      };

      window.tsParticles.load(particlesRef.current.id, config);
    }
  }, []);

  return <div id="tsparticles" ref={particlesRef} style={{ width: '100%', height: '100%' }} />;
};

const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-right: 2rem;

  @media (min-width: 768px) {
    gap: 1rem;
    padding-right: 2.5rem;
  }

  @media (min-width: 1024px) {
    gap: 1rem;
    padding-right: 3rem;
  }

  @media (min-width: 1920px) {
    gap: 1.25rem;
    padding-right: 4rem;
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
              <span>S</span>
              <span>O</span>
              <span>L</span>
              <span>B</span>
              <span>E</span>
              <span>T</span>
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
                  {(currentPath === '/flip' || currentPath === '/') && (
                    <ParticlesContainer>
                      <ParticleEffect />
                    </ParticlesContainer>
                  )}
                </NavLinkStyled>
                <NavLinkStyled
                  to="/affiliates"
                  className={currentPath === '/affiliates' ? 'active' : ''}
                >
                  <img src="/003-user.png" alt="Affiliates" style={{ width: '16px', height: '16px' }} />
                  Affiliates
                  {currentPath === '/affiliates' && (
                    <ParticlesContainer>
                      <ParticleEffect />
                    </ParticlesContainer>
                  )}
                </NavLinkStyled>
              </Navigation>

          {/* Right Section */}
          <RightSection>

            {balance.bonusBalance > 0 && (
              <Bonus onClick={() => setBonusHelp(true)}>
                ✨ <TokenValue amount={balance.bonusBalance} />
              </Bonus>
            )}



            <TokenSelect />
            <UserButton />
          </RightSection>
        </NavigationSection>
      </MainHeader>
    </>
  )
}