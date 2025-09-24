import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import styled from 'styled-components'
import { useChatVisibility } from '../hooks/useChatVisibility'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

// TypeScript interfaces
interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  walletAddress: string
  level: number
}

interface ChatBoxProps {
  className?: string
}

// Styled components
const ChatContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(20, 20, 20);
  border-right: 1px solid rgb(29, 29, 29);
  color: white;
  font-family: 'Flama', sans-serif;
  position: relative;
  transform: translateX(${props => props.isVisible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`

const ChatHeader = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  background: linear-gradient(180deg, #404040 0%, rgba(26, 26, 26, 0) 100%);
  border-bottom: 1px solid rgb(29, 29, 29);
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 550;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  width: calc(100% - 40px);
  
  /* Additional styling from your specifications */
  tab-size: 4;
  -webkit-tap-highlight-color: transparent;
  color-scheme: light dark;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  font-synthesis: none;
  --lightningcss-light: ;
  --lightningcss-dark: initial;
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: #3b82f680;
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
  box-sizing: border-box;
  border-style: solid;
  border-image: initial;
  user-select: none;
  -webkit-user-drag: none;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  letter-spacing: inherit;
  padding: 0px;
  background-image: none;
  font-family: inherit;
  text-transform: none;
  appearance: button;
  position: relative;
  height: 2.5rem;
  min-width: 2.5rem;
  cursor: pointer;
  overflow: hidden;
  border-radius: 0.5rem;
  border-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(59 59 59/var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(48 48 48/var(--tw-bg-opacity));
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity));
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
`

const ChatStatus = styled.div<{ connected: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.connected ? '#42ff78' : '#ff6b6b'};
  margin-top: 0.25rem;
`

const AirdropSection = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #6741ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AirdropText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`

const AirdropValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }
`

const MessageItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: rgb(26, 26, 26);
  border-radius: 8px;
  margin-bottom: 0.5rem;
`

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

const Username = styled.span`
  font-weight: 600;
  color: #6741ff;
  font-size: 0.875rem;
`

const UserLevel = styled.span`
  background-color: #333;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.25rem;
`

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: #888;
`

const MessageText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: white;
  word-wrap: break-word;
`

const ChatInputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgb(29, 29, 29);
  background-color: rgb(26, 26, 26);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ChatInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const ChatInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const ChatInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`

const ChatInput = styled.input<{ disabled?: boolean; isConnect?: boolean }>`
  width: 100%;
  padding: 0.75rem ${props => props.isConnect ? '4rem' : '2.5rem'} 0.75rem 0.75rem;
  border: 1px solid rgb(29, 29, 29);
  border-radius: 8px;
  background-color: ${props => props.disabled ? 'rgb(15, 15, 15)' : 'rgb(20, 20, 20)'};
  color: ${props => props.disabled ? 'rgb(80, 80, 80)' : 'white'};
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:focus {
    outline: none;
    border-color: ${props => props.disabled ? 'rgb(29, 29, 29)' : '#6741ff'};
  }
  
  &::placeholder {
    color: ${props => props.disabled ? 'rgb(60, 60, 60)' : '#666'};
  }
`

const InlineButton = styled.button<{ isConnect?: boolean }>`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: ${props => props.isConnect ? '3.5rem' : '2rem'};
  height: ${props => props.isConnect ? '2rem' : '2rem'};
  padding: 0;
  background-color: #6741ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Flama', sans-serif;
  font-size: ${props => props.isConnect ? '0.75rem' : '0.625rem'};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: #5a3ae6;
  }
  
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
    opacity: 0.6;
  }
`



const PlayerCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  background-color: #6741ff20;
  border: 1px solid rgb(29, 29, 29);
  border-radius: 6px;
  padding: 0.75rem 1rem 0.75rem 0.5rem; /* Reduced left padding */
  font-size: 0.875rem;
  min-height: 2.5rem;
  
  img {
    filter: brightness(1.2);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      filter: brightness(1.2) drop-shadow(0 0 4px #42ff78);
    }
    50% {
      opacity: 0.5;
      filter: brightness(1.2) drop-shadow(0 0 8px #42ff78);
    }
  }
`

const ChatRules = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6741ff;
  }
`

const ChatFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-top: 1px solid rgb(29, 29, 29);
  background-color: rgb(26, 26, 26);
  font-size: 0.75rem;
  color: #888;
`

// Chat Rules Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`

const ModalWrapper = styled.div`
  width: 385px;
  max-width: 90vw;
  max-height: 70vh;
  min-height: 400px;
  background: #0f0f0f url('/background_shadows.webp') center/cover no-repeat;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 65, 255, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  margin: auto;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
  }
`

const ModalContainer = styled.div`
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  color: white;
  background: transparent;
`

const ModalTitle = styled.h2`
  font-family: 'Airstrike', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-align: left;
  margin: 0 0 1.5rem 0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`

const RuleItem = styled.div`
  background-color: rgb(26, 26, 26);
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid rgb(29, 29, 29);
`

const RuleText = styled.p`
  margin: 0;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  font-family: 'Flama', sans-serif;
`

const CloseButton = styled.button`
  width: 100%;
  padding: 0.75rem 1.25rem;
  background-color: #6741ff;
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1.5rem;
  
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
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
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
`


const TraderCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #42ff78;
  font-weight: 500;
`



// Mock chat data for demonstration
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    username: 'Skywawaa',
    message: 'nice',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    level: 9
  },
  {
    id: '2',
    username: 'TerpGoat',
    message: 'WWWW SKYWAWAA',
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    level: 7
  },
  {
    id: '3',
    username: 'PLATYPUS',
    message: 'jpin freak',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    walletAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    level: 15
  },
  {
    id: '4',
    username: 'Freakcrypto',
    message: 'hahahaha cheater',
    timestamp: new Date(Date.now() - 45000), // 45 seconds ago
    walletAddress: '3QJmV3qfvL9SuYo34YihAf3sRCW3qSiny9qar4GSKb2H',
    level: 17
  },
  {
    id: '5',
    username: 'DownDownSpikers',
    message: 'To the moon! 🚀',
    timestamp: new Date(Date.now() - 30000), // 30 seconds ago
    walletAddress: '8K7F9H2J4L6M1N3P5Q7R9S2T4U6V8W1X3Y5Z7A9B2C4D',
    level: 12
  },
  {
    id: '6',
    username: 'TheFirstWyatt',
    message: 'HODL strong everyone 💎',
    timestamp: new Date(Date.now() - 15000), // 15 seconds ago
    walletAddress: '2A4C6E8G0I2K4M6O8Q0S2U4W6Y8Z1B3D5F7H9J2L4N6P',
    level: 8
  }
]

export const ChatBox: React.FC<ChatBoxProps> = ({ className }) => {
  const { connected, publicKey } = useWallet()
  const walletModal = useWalletModal()
  const { isChatVisible, toggleChat } = useChatVisibility()
  const { formattedCount } = useOnlineUsers()
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChatRules, setShowChatRules] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Send heartbeat to track online users
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const userId = publicKey?.toString() || 'anonymous'
        await fetch('/api/online-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      } catch (err) {
        console.warn('Failed to send heartbeat:', err)
      }
    }

    // Send heartbeat immediately
    sendHeartbeat()
    
    // Send heartbeat every 15 seconds
    const interval = setInterval(sendHeartbeat, 15000)
    
    return () => clearInterval(interval)
  }, [publicKey])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle modal close with animation
  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowChatRules(false)
      setIsClosing(false)
    }, 200) // Match animation duration
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Generate username from wallet address
  const getUsername = (address: string): string => {
    if (!address) return 'Anonymous'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !connected || !publicKey || isLoading) return

    setIsLoading(true)
    
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: getUsername(publicKey.toString()),
        message: newMessage.trim(),
        timestamp: new Date(),
        walletAddress: publicKey.toString(),
        level: Math.floor(Math.random() * 20) + 1 // Random level between 1-20
      }

      // In a real app, you would send this to your backend
      // For now, we'll just add it to the local state
      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return timestamp.toLocaleDateString()
  }

  return (
    <>
      <ChatContainer className={className} isVisible={isChatVisible}>
        {/* Airdrop section hidden for now */}
        <div style={{ display: 'none' }}>
          <AirdropSection>
            <AirdropText>
              <span>🔴</span>
              <span>LIVE</span>
              <span>AIRDROP</span>
            </AirdropText>
            <AirdropValue>
              <span>0.250</span>
              <span>🪙</span>
            </AirdropValue>
          </AirdropSection>
        </div>

        <MessagesContainer>
          {messages.map((message) => (
            <MessageItem key={message.id}>
              <MessageHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Username>{message.username}</Username>
                  <UserLevel>{message.level}</UserLevel>
                </div>
                <Timestamp>{formatTimestamp(message.timestamp)}</Timestamp>
              </MessageHeader>
              <MessageText>{message.message}</MessageText>
            </MessageItem>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <ChatInputContainer>
          <ChatInputHeader>
            <ChatRules onClick={() => setShowChatRules(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>Chat Rules</span>
            </ChatRules>
            <PlayerCount>
              <img src="/9d7e91c7-872f-4d7a-bd5e-53d7181e6bbf.svg" alt="Online" style={{ width: '16px', height: '16px' }} />
              <span>{formattedCount}</span>
            </PlayerCount>
          </ChatInputHeader>
          
          <ChatInputRow>
            {!connected ? (
              <ChatInputWrapper>
                <ChatInput
                  type="text"
                  placeholder="Connect wallet to chat..."
                  disabled={true}
                  isConnect={true}
                  maxLength={500}
                />
                <InlineButton
                  onClick={() => walletModal.setVisible(true)}
                  disabled={false}
                  isConnect={true}
                >
                  Connect
                </InlineButton>
              </ChatInputWrapper>
            ) : (
              <ChatInputWrapper>
                <ChatInput
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  maxLength={500}
                />
                <InlineButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  isConnect={false}
                >
                  {isLoading ? (
                    '...'
                  ) : (
                    <img src="/72a1b1a6-59d7-4a3f-8d88-9056e111c1de.svg" alt="Send" style={{ width: '16px', height: '16px' }} />
                  )}
                </InlineButton>
              </ChatInputWrapper>
            )}
          </ChatInputRow>
        </ChatInputContainer>

        <ChatFooter>
          <div style={{ color: '#888' }}>
            <span>3,384,892 Total Bets</span>
          </div>
        </ChatFooter>
      </ChatContainer>

      {/* Chat Rules Modal - Outside ChatContainer */}
      {showChatRules && (
        <ModalOverlay 
          onClick={handleCloseModal}
          style={{ 
            animation: isClosing ? 'fadeOut 0.2s ease-in' : 'fadeIn 0.2s ease-out' 
          }}
        >
          <ModalWrapper 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              animation: isClosing ? 'slideOut 0.2s ease-in' : 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <ModalContainer>
              <ModalTitle>
                CHAT RULES
                <img src="/001-policy.png" alt="Policy" style={{ width: '24px', height: '24px', filter: 'grayscale(1) brightness(0.6) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
              </ModalTitle>
              <RulesList>
                <RuleItem>
                  <RuleText>Be respectful to all users</RuleText>
                </RuleItem>
                <RuleItem>
                  <RuleText>Don't beg people for money</RuleText>
                </RuleItem>
                <RuleItem>
                  <RuleText>No advertising or mentioning other websites</RuleText>
                </RuleItem>
                <RuleItem>
                  <RuleText>Don't tag staff</RuleText>
                </RuleItem>
                <RuleItem>
                  <RuleText>Don't promote your creator code in the chat, you will get muted</RuleText>
                </RuleItem>
              </RulesList>
              <CloseButton onClick={handleCloseModal}>
                I Understand
              </CloseButton>
            </ModalContainer>
          </ModalWrapper>
        </ModalOverlay>
      )}
    </>
  )
}

export default ChatBox
