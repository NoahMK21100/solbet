import React from 'react'
import styled from 'styled-components'
import { Modal } from './Modal'

const Container = styled.div`
  display: grid;
  gap: 10px;
  padding: 20px;
  padding-bottom: 0;
  width: 100%;
  max-width: 500px;
`

const Inner = styled.div`
  overflow: hidden;
`

const Content = styled.div`
  border-radius: 10px;
  padding: 20px;
  background: linear-gradient(156deg, #52527822, #12121700);
`

const GameInfo = styled.div`
  background: #121217CC;
  color: #ffffffcc;
  font-style: italic;
  display: flex;
  align-content: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
`

const HashInfo = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  font-family: monospace;
  font-size: 0.875rem;
  color: #ccc;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`

interface GameViewModalProps {
  gameId: number
  gameData: {
    player1: { name: string; avatar: string; level: number }
    player2?: { name: string; avatar: string; level: number }
    amount: number
    currency: string
    status: 'waiting' | 'in-play' | 'completed'
    result?: 'win' | 'lose'
    side?: 'heads' | 'tails'
    coinResult?: 'heads' | 'tails' // Add the actual coin result
    timestamp?: number
    transactionSignature?: string
    rngSeed?: string
  }
  onClose: () => void
}

export function GameViewModal({ gameId, gameData, onClose }: GameViewModalProps) {
  const isCompleted = gameData.status === 'completed'
  const isActive = gameData.status === 'waiting' || gameData.status === 'in-play'
  
  // Use the actual RNG seed from the game data
  const hashseed = gameData.rngSeed || `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6${gameId}`
  
  // Calculate profit/loss for completed games
  const profit = isCompleted && gameData.result === 'win' 
    ? Number(gameData.amount) * 2 - Number(gameData.amount) 
    : isCompleted && gameData.result === 'lose' 
    ? -Number(gameData.amount) 
    : 0

  return (
    <Modal onClose={onClose}>
      <Container>
        <Inner>
          <Content>
            <div style={{ 
              display: 'grid', 
              gap: '5px', 
              gridTemplateColumns: 'auto 1fr auto', 
              alignItems: 'center', 
              padding: '10px' 
            }}>
              {/* Player 1 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: gameData.player1.avatar.startsWith('/') ? 'transparent' : '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 auto 5px',
                  overflow: 'hidden'
                }}>
                  {gameData.player1.avatar.startsWith('/') ? (
                    <img 
                      src={gameData.player1.avatar} 
                      alt="Player Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    gameData.player1.avatar
                  )}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{gameData.player1.name}</div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>Level {gameData.player1.level}</div>
              </div>

              {/* Game Info */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                  COINFLIP #{gameId}
                </div>
                {gameData.side && (
                  <div style={{ fontSize: '14px', color: '#ccc' }}>
                    Chose: {gameData.side.toUpperCase()}
                  </div>
                )}
                {gameData.coinResult && (
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#42ff78',
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '2px solid #42ff78'
                  }}>
                    Result: {gameData.coinResult.toUpperCase()}
                  </div>
                )}
                <div style={{ fontSize: '16px', color: '#42ff78', marginTop: '5px' }}>
                  {Number(gameData.amount)} {gameData.currency}
                </div>
              </div>

              {/* Player 2 or Waiting */}
              <div style={{ textAlign: 'center' }}>
                {gameData.player2 ? (
                  <>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: gameData.player2.avatar.startsWith('/') ? 'transparent' : '#9C27B0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white',
                      margin: '0 auto 5px',
                      overflow: 'hidden'
                    }}>
                      {gameData.player2.avatar.startsWith('/') ? (
                        <img 
                          src={gameData.player2.avatar} 
                          alt="Player Avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        gameData.player2.avatar
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{gameData.player2.name}</div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>Level {gameData.player2.level}</div>
                  </>
                ) : (
                  <>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white',
                      margin: '0 auto 5px'
                    }}>
                      ?
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Waiting...</div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>Join to play</div>
                  </>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div style={{ 
              textAlign: 'center', 
              margin: '15px 0',
              padding: '10px',
              backgroundColor: isActive ? '#2a2a2a' : '#1a1a1a',
              borderRadius: '8px',
              border: isActive ? '1px solid #3a3a3a' : '1px solid #333'
            }}>
              {isActive ? (
                <div style={{ color: '#42ff78', fontWeight: 'bold' }}>
                  {gameData.status === 'waiting' ? 'WAITING FOR PLAYER' : 'GAME IN PROGRESS'}
                </div>
              ) : isCompleted ? (
                <div style={{ 
                  color: gameData.result === 'win' ? '#42ff78' : '#ff4f4f', 
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {gameData.result === 'win' ? `+${profit.toFixed(4)} WON` : `-${Math.abs(profit).toFixed(4)} LOST`}
                </div>
              ) : null}
            </div>

            {/* Hashseed Information */}
            <HashInfo>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>HASHED SEED:</div>
              <div style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                {hashseed}
              </div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>SECRET:</div>
              <div style={{ color: '#888' }}>
                {isCompleted ? 'Revealed after game completion' : 'Waiting...'}
              </div>
            </HashInfo>

            <GameInfo>
              <img src="/gamba.svg" height="25px" />
              <div>play on <b>solbet.com</b></div>
            </GameInfo>
          </Content>
        </Inner>
        
        <ButtonContainer>
          {isCompleted && (
            <button 
              onClick={() => {
                // Only verify completed games with valid transaction signatures
                if (gameData.transactionSignature) {
                  window.open(`https://explorer.solana.com/tx/${gameData.transactionSignature}`, '_blank')
                } else {
                  alert('Transaction signature not available for this game')
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6741ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Verify
            </button>
          )}
          {isActive && (
            <button 
              onClick={() => {
                // Handle join game logic
                console.log('Join game', gameId)
                onClose()
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#42ff78',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {gameData.status === 'waiting' ? 'Join Game' : 'Watch Live'}
            </button>
          )}
        </ButtonContainer>
      </Container>
    </Modal>
  )
}
