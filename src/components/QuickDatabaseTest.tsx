import React, { useState } from 'react'
import styled from 'styled-components'
import { useWallet } from '@solana/wallet-adapter-react'
import { recordCoinflipResult } from '../utils/recordGameResult'

const Container = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #42ff78;
  z-index: 9999;
  color: white;
  font-size: 12px;
`

const Button = styled.button`
  background: #42ff78;
  color: black;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin: 0.25rem;
  
  &:hover {
    background: #3ce066;
  }
`

export const QuickDatabaseTest: React.FC = () => {
  const { publicKey } = useWallet()
  const [status, setStatus] = useState('')

  const testRecording = async () => {
    if (!publicKey) {
      setStatus('❌ No wallet connected')
      return
    }

    setStatus('Testing...')
    
    try {
      await recordCoinflipResult(
        publicKey.toString(),
        0.01, // 0.01 SOL wager
        0.02, // 0.02 SOL payout (win)
        true, // isWin
        'test_rng_seed',
        'test_client_seed',
        123,
        'test_game_id',
        'test_transaction_signature'
      )
      
      setStatus('✅ Test recorded!')
      setTimeout(() => setStatus(''), 2000)
    } catch (error) {
      setStatus(`❌ ${error}`)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  if (!publicKey) return null

  return (
    <Container>
      <div>Quick DB Test</div>
      <Button onClick={testRecording}>Test Recording</Button>
      {status && <div>{status}</div>}
    </Container>
  )
}
