import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, GambaPlatformContext, GambaUi, PoolToken, TokenValue, useCurrentToken, useTokenBalance, useTokenMeta } from 'gamba-react-ui-v2'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Dropdown } from '../components/Dropdown'
import { Modal } from '../components/Modal'
import { POOLS } from '../constants'
import { useUserStore } from '../hooks/useUserStore'
import { getSolPrice } from '../utils/priceService'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(30, 20, 50, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.25px solid rgba(147, 51, 234, 0.6);
  border-radius: 12px;
  padding: 8px 16px 8px 16px;
  width: 180px;
  height: 36px;
  box-sizing: border-box;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  position: relative;
  margin-right: 0px;
  box-shadow: 0 0 8px rgba(147, 51, 234, 0.3), inset 0 0 8px rgba(147, 51, 234, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(52, 52, 52, 0.9), rgba(40, 30, 60, 0.95));
    border-color: rgba(147, 51, 234, 0.8);
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.5), inset 0 0 12px rgba(147, 51, 234, 0.2);
  }
  
  img {
    height: 18px;
    width: 18px;
    flex-shrink: 0;
    margin-right: 8px;
  }
`

const StyledBalanceText = styled.div`
  position: absolute;
  left: 42px;
  width: 118px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  span {
    display: block;
    transition: transform 0.4s ease, opacity 0.3s ease;
  }
  
  @keyframes slideDown {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    100% {
      transform: translateY(0px);
      opacity: 1;
    }
  }
`

const StyledTokenImage = styled.img`
  height: 20px;
  aspect-ratio: 1/1;
  border-radius: 50%;
`

const StyledTokenButton = styled.button`
  box-sizing: border-box;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 5px;
  &:hover {
    background: #ffffff11;
  }
`

function TokenImage({ mint, ...props }: {mint: PublicKey}) {
  const meta = useTokenMeta(mint)
  return (
    <StyledTokenImage src={meta.image} {...props} />
  )
}

function TokenSelectItem({ mint }: {mint: PublicKey}) {
  const balance = useTokenBalance(mint)
  return (
    <>
      <TokenImage mint={mint} /> <TokenValue mint={mint} amount={balance.balance} />
    </>
  )
}

export default function TokenSelect() {
  const [warning, setWarning] = React.useState(false)
  const [showUSD, setShowUSD] = React.useState(false)
  const [solPrice, setSolPrice] = React.useState(0)
  // Allow real plays override via query param/localStorage for deployed testing
  const [allowRealPlays, setAllowRealPlays] = React.useState(false)
  const context = React.useContext(GambaPlatformContext)
  const selectedToken = useCurrentToken()
  const userStore = useUserStore()
  const balance = useTokenBalance()

  // Fetch SOL price using centralized service
  const fetchSolPrice = async () => {
    try {
      const price = await getSolPrice()
      setSolPrice(price)
    } catch (error) {
      console.error('Failed to fetch SOL price:', error)
    }
  }

  useEffect(() => {
    fetchSolPrice()
    // Update price every 5 minutes to match the centralized caching strategy
    const priceInterval = setInterval(fetchSolPrice, 5 * 60 * 1000)
    return () => clearInterval(priceInterval)
  }, [])

  // Update the platform context with the last selected token from localStorage
  useEffect(() => {
    if (userStore.lastSelectedPool) {
      context.setPool(userStore.lastSelectedPool.token, userStore.lastSelectedPool.authority)
    }
  }, [])

  // Read real-play override – enables SOL selection on deployed builds when needed
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('allowReal') || params.get('real') || params.get('realplays')
      if (q != null) {
        const v = q === '1' || q === 'true'
        localStorage.setItem('allowRealPlays', v ? '1' : '0')
      }
      const saved = localStorage.getItem('allowRealPlays')
      setAllowRealPlays(saved === '1')
    } catch {}
  }, [])

  const solBalance = balance.balance / 1_000_000_000 // Convert lamports to SOL
  const usdValue = (solBalance * solPrice).toFixed(2)

  return (
    <>
      {warning && (
        <Modal>
          <h1>Real plays disabled</h1>
          <p>
            This platform only allows you to play with fake tokens.
          </p>
          <GambaUi.Button
            main
            onClick={() => setWarning(false)}
          >
            Okay
          </GambaUi.Button>
        </Modal>
      )}
      {selectedToken && (
        <StyledToken 
          onMouseEnter={() => setShowUSD(true)}
          onMouseLeave={() => setShowUSD(false)}
        >
          <TokenImage mint={selectedToken.mint} />
          <StyledBalanceText>
            {showUSD ? (
              <span style={{ 
                transform: 'translateY(0px)', 
                opacity: 1,
                animation: 'slideDown 0.4s ease'
              }}>
                ${usdValue}
              </span>
            ) : (
              <span style={{ 
                transform: 'translateY(0px)', 
                opacity: 1,
                animation: 'slideDown 0.4s ease'
              }}>
                <TokenValue amount={balance.balance} />
              </span>
            )}
          </StyledBalanceText>
        </StyledToken>
      )}
    </>
  )
}
