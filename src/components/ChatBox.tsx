import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import styled from 'styled-components'
import { useChatVisibility } from '../hooks/useChatVisibility'
import { useOnlineUsers } from '../hooks/useOnlineUsers'
import { getUsername, getUserLevel, getUserAvatarOrDefault, hasCustomAvatar } from '../utils'

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
  height: auto;
  min-height: calc(100vh - 90px);
  background: rgba(15, 23, 24, 1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-family: 'Flama', sans-serif;
  position: fixed;
  top: 90px; /* Start exactly at bottom of header */
  bottom: 0; /* Extend to bottom of viewport */
  left: 0;
  width: 350px;
  z-index: 999;
  transform: translateX(${props => props.isVisible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0; /* Remove any margin */
  border-top: none; /* Remove border-top to connect seamlessly */
`

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ChatTitleContainer = styled.div`
  background: rgba(15, 23, 24, 1);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  font-family: 'Inter', 'Inter Fallback', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CollapseButton = styled.button`
  background: rgb(48, 48, 48);
  border: none;
  color: white;
  cursor: pointer;
  width: 42px;
  height: 40px;
  border-radius: 0.5rem;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`

const LiveChatPotSection = styled.div`
  padding: 0.75rem 1.25rem;
  background: rgba(146, 52, 189, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 1.5rem;
  box-shadow: 
    0 0 0 4px #000000,
    0 0 0 6px #22222d;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`

const LiveChatPotTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #42ff78;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const LiveChatPotAmount = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`

const LiveChatPotAvatars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`

const Avatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #42ff78;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: black;
`

const LiveChatPotTime = styled.div`
  color: #888;
  font-size: 0.75rem;
  margin-left: 0.5rem;
`

const ChatToggleButton = styled.button<{ isVisible: boolean }>`
  position: fixed;
  left: ${props => props.isVisible ? '-60px' : '10px'};
  top: 50%;
  transform: translateY(-50%);
  background: rgb(48, 48, 48);
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  width: 40px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    transform: translateY(-50%) translateY(-1px);
  }
  
  &:active {
    transform: translateY(-50%) translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
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
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(39, 47, 51, 0.32);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(38, 46, 49, 0.8);
  height: 65px;
  box-shadow: 
    0 0 0 2px rgba(55, 55, 60, 0.8),
    0 0 0 4px rgba(0, 0, 0, 0.8),
    0 0 0 6px rgba(34, 34, 45, 0.8);
`

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4c1d95, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  box-shadow:
    0 0 0 3px #37373c,
    0 0 0 6px #22222d;
`

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(103, 65, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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



// Start with empty chat - only real user messages
const mockMessages: ChatMessage[] = []

export const ChatBox: React.FC<ChatBoxProps> = ({ className }) => {
  const { connected, publicKey } = useWallet()
  const walletModal = useWalletModal()
  const { isChatVisible, toggleChat } = useChatVisibility()
  const { formattedCount } = useOnlineUsers()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChatRules, setShowChatRules] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Fetch messages from API on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/chat')
        if (response.ok) {
          const apiMessages = await response.json()
          // Convert API format to our ChatMessage format
          const formattedMessages: ChatMessage[] = apiMessages.map((msg: any) => ({
            id: msg.ts?.toString() || Date.now().toString(),
            username: msg.username || msg.user || 'Anonymous',
            message: msg.text || '',
            timestamp: new Date(msg.ts || Date.now()),
            walletAddress: msg.walletAddress || 'unknown',
            level: msg.level || 1
          }))
          setMessages(formattedMessages)
          setIsInitialLoad(false)
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        // Fallback to mock messages if API fails
        setMessages(mockMessages)
        setIsInitialLoad(false)
      }
    }

    fetchMessages()
  }, [])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const response = await fetch('/api/chat')
        if (response.ok) {
          const apiMessages = await response.json()
          const formattedMessages: ChatMessage[] = apiMessages.map((msg: any) => ({
            id: msg.ts?.toString() || Date.now().toString(),
            username: msg.user || 'Anonymous',
            message: msg.text || '',
            timestamp: new Date(msg.ts || Date.now()),
            walletAddress: 'unknown',
            level: 1
          }))
          
          // Only update if messages have changed (avoid unnecessary re-renders)
          setMessages(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(formattedMessages)) {
              return formattedMessages
            }
            return prev
          })
        }
      } catch (error) {
        console.error('Failed to poll messages:', error)
      }
    }

    // Start polling after initial load
    if (!isInitialLoad) {
      const interval = setInterval(pollMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [isInitialLoad])

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


  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !connected || !publicKey || isLoading) return

    setIsLoading(true)
    
    try {
      const username = getUsername(publicKey.toString())
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: username,
          text: newMessage.trim(),
          walletAddress: publicKey.toString(),
          username: username,
          level: getUserLevel(publicKey.toString())
        })
      })

      if (response.ok) {
        // Create local message object for immediate UI update
        const message: ChatMessage = {
          id: Date.now().toString(),
          username: username,
          message: newMessage.trim(),
          timestamp: new Date(),
          walletAddress: publicKey.toString(),
          level: getUserLevel(publicKey.toString())
        }

        // Add to local state for immediate display
        setMessages(prev => [...prev, message])
        setNewMessage('')
        
        console.log('✅ Message sent successfully')
      } else {
        console.error('Failed to send message to API')
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
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
      {/* Chat Toggle Button - Shows when chat is hidden */}
      <ChatToggleButton isVisible={isChatVisible} onClick={toggleChat}>
        <img src="/002-right.png" alt="Open Chat" style={{ width: '16px', height: '16px' }} />
      </ChatToggleButton>

      <ChatContainer className={className} isVisible={isChatVisible}>
        {/* Chat Header with Title and Collapse Button */}
        <ChatHeader>
          <ChatTitleContainer>
            <ChatTitle>SOLBET Chat</ChatTitle>
          </ChatTitleContainer>
          <CollapseButton onClick={toggleChat}>
            <img src="/002-right.png" alt="Collapse" style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
          </CollapseButton>
        </ChatHeader>

        {/* Live Chat Pot Section */}
        <LiveChatPotSection>
          <LiveChatPotTitle>
            <span>🔴</span>
            <span>LIVE CHATPOT</span>
          </LiveChatPotTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LiveChatPotAmount>0.000</LiveChatPotAmount>
            <LiveChatPotAvatars>
              <Avatar>👤</Avatar>
              <Avatar>🐱</Avatar>
            </LiveChatPotAvatars>
            <LiveChatPotTime>19:14</LiveChatPotTime>
          </div>
        </LiveChatPotSection>

        <MessagesContainer>
          {messages.map((message) => (
            <MessageItem key={message.id}>
              <MessageAvatar>
                {hasCustomAvatar(message.walletAddress) ? (
                  <img 
                    src={getUserAvatarOrDefault(message.walletAddress)} 
                    alt="Profile Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <img 
                    src="/solly.png" 
                    alt="Default Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Username>{message.username}</Username>
                    <UserLevel>{message.level}</UserLevel>
                  </div>
                  <Timestamp>{formatTimestamp(message.timestamp)}</Timestamp>
                </MessageHeader>
                <MessageText>{message.message}</MessageText>
              </MessageContent>
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
