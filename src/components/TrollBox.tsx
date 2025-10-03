import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { supabase } from '../lib/supabase'
import { useSupabaseWalletSync } from '../hooks/useSupabaseWalletSync'
import ProfilePopup from './ProfilePopup'
import { LevelBadge } from './LevelBadge'

// TypeScript interfaces
interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  walletAddress: string
  level: number
  avatar_url?: string
}

interface TrollBoxProps {
  isMinimized?: boolean
}

// Styled components
const ChatContainer = styled.div<{ $isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: calc(100vh - 90px);
  background: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-family: 'Flama', sans-serif;
  position: fixed;
  top: 90px; /* Start exactly at bottom of header */
  bottom: 0; /* Extend to bottom of viewport */
  left: 0;
  width: 350px;
  z-index: 999;
  transform: translateX(${props => props.$isVisible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0; /* Remove any margin */
  border-top: none; /* Remove border-top to connect seamlessly */

  @media (max-width: 1023px) {
    display: none;
  }
`

const ChatHeader = styled.div`
  padding: 1rem 1.5rem 1rem 1.5rem;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
`

const ChatTitleContainer = styled.div`
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(30, 20, 50, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(151, 151, 151, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex: 1;
  margin-right: 0.5rem;
`

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
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
  height: 48px;
  border-radius: 0.5rem;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transform: translateY(0);
  align-self: center;
  
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
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(103, 65, 255, 0.3));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 1.5rem 1rem 1.5rem;
  min-height: 3rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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

const ChatToggleButton = styled.button<{ $isVisible: boolean }>`
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
  position: fixed;
  top: 106px; /* Aligned with the CollapseButton position (90px + 16px padding) */
  left: 0;
  z-index: 998; /* Below chat container but above other content */
  transform: translateX(${props => props.$isVisible ? '0' : '-100%'}) translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  
  &:hover {
    transform: translateX(${props => props.$isVisible ? '0' : '-100%'}) translateY(-2px);
  }
  
  &:active {
    transform: translateX(${props => props.$isVisible ? '0' : '-100%'}) translateY(0);
    box-shadow: 0 1px 2px #0000001f, inset 0 2px #0000003d, inset 0 -2px #ffffff12;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: calc(100vh - 200px); /* Ensure it doesn't exceed viewport */
  
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

const Username = styled.span<{ $userColor: string }>`
  font-weight: 600;
  color: ${({ $userColor }) => $userColor};
  font-size: 0.875rem;
  cursor: pointer;
`

const UserLevelWrapper = styled.div`
  margin-left: 0.25rem;
`

const Timestamp = styled.span`
  font-size: 0.625rem;
  color: #888;
  align-self: flex-start;
  margin-top: 0.125rem;
`

const MessageText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: white;
  word-wrap: break-word;
`

const ChatInputContainer = styled.div`
  padding: 0.5rem 1.5rem 1rem 1.5rem;
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

const ChatInput = styled.input<{ disabled?: boolean; $isConnect?: boolean }>`
  width: 100%;
  padding: 0.75rem ${props => props.$isConnect ? '4rem' : '2.5rem'} 0.75rem 0.75rem;
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

const InlineButton = styled.button<{ $isConnect?: boolean }>`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: ${props => props.$isConnect ? '3.5rem' : '2rem'};
  height: ${props => props.$isConnect ? '2rem' : '2rem'};
  padding: 0;
  background-color: #6741ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Flama', sans-serif;
  font-size: ${props => props.$isConnect ? '0.75rem' : '0.625rem'};
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
  gap: 0.25rem;
  color: #888;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  background: transparent;
  font-size: 0.75rem;
  
  img {
    filter: brightness(1.2);
  }
`

const ChatRules = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #888;
  font-weight: 500;
  font-family: 'Flama', sans-serif;
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover {
    color: #6741ff;
  }
`


const LoadingText = styled.div`
  text-align: center;
  color: #a0a0a0;
  padding: 1.5rem 0;
  font-style: italic;
  font-size: 0.8rem;
`

// Helper function for user colors
const stringToHslColor = (str: string, s: number, l: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, ${s}%, ${l}%)`
}

export default function TrollBox({ isMinimized: propIsMinimized = false }: TrollBoxProps) {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()
  const { profile } = useSupabaseWalletSync()
  const [internalMinimized, setInternalMinimized] = useState(false)
  
  // Use prop if provided, otherwise use internal state
  const isMinimized = internalMinimized
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ walletAddress: string; username: string; position: { x: number; y: number } } | null>(null)

  const userName = profile?.username || (connected && publicKey ? publicKey.toBase58().slice(0, 6) : 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'))

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    if (isMinimized || (typeof document !== 'undefined' && document.hidden)) return
    
    try {
      setIsLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_wallet_address_fkey (
            avatar_url,
            level
          )
        `)
        .eq('channel', 'global')
        .order('created_at', { ascending: true })
        .limit(50)

      if (fetchError) {
        // If table doesn't exist or RLS policy blocks, just show empty chat
        if (fetchError.code === 'PGRST116' || fetchError.code === '42501') {
          setMessages([])
          return
        }
        throw fetchError
      }
      
      // Convert Supabase format to ChatMessage format
      const formattedMessages: ChatMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        username: msg.username || 'Anonymous',
        message: msg.message || '',
        timestamp: new Date(msg.created_at),
        walletAddress: msg.wallet_address || 'unknown',
        level: msg.profiles?.level || 1,
        avatar_url: msg.profiles?.avatar_url
      }))
      
      setMessages(formattedMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      // Don't show error, just show empty chat
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  // Send message to Supabase
  const sendMessage = async (messageText: string) => {
    if (!connected || !publicKey || !profile) return

    try {
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          wallet_address: publicKey.toString(),
          username: profile.username || publicKey.toBase58().slice(0, 6),
          message: messageText,
          channel: 'global'
        })

      if (insertError) {
        // If table doesn't exist or RLS policy blocks, just show a local message
        if (insertError.code === 'PGRST116' || insertError.code === '42501') {
          console.log('Chat table not found or RLS policy blocks, adding local message')
          const localMessage: ChatMessage = {
            id: Date.now().toString(),
            username: profile.username || publicKey.toBase58().slice(0, 6),
            message: messageText,
            timestamp: new Date(),
            walletAddress: publicKey.toString(),
            level: 1
          }
          setMessages(prev => [...prev, localMessage])
          return
        }
        throw insertError
      }
      
      // Refresh messages after sending
      await fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
      // Don't show error, just add local message
      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        username: profile.username || publicKey.toBase58().slice(0, 6),
        message: messageText,
        timestamp: new Date(),
        walletAddress: publicKey.toString(),
        level: 1
      }
      setMessages(prev => [...prev, localMessage])
    }
  }

  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => {
      if (!map[m.username]) map[m.username] = stringToHslColor(m.username, 70, 75)
    })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
    return map
  }, [messages, userName])

  const toggleMinimize = () => {
    setInternalMinimized(v => !v)
  }

  const handleUsernameClick = (e: React.MouseEvent, walletAddress: string, username: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    setSelectedUser({
      walletAddress,
      username,
      position: {
        x: rect.left,
        y: rect.top - 10
      }
    })
    setShowProfilePopup(true)
  }

  const closeProfilePopup = () => {
    setShowProfilePopup(false)
    setSelectedUser(null)
  }

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !connected || !publicKey || isLoading) return

    setIsLoading(true)
    
    try {
      await sendMessage(inputValue.trim())
      setInputValue('')
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
    const hours = timestamp.getHours().toString().padStart(2, '0')
    const minutes = timestamp.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages on mount and when not minimized
  useEffect(() => {
    fetchMessages()
  }, [isMinimized])

  // Set up polling for new messages
  useEffect(() => {
    if (isMinimized || (typeof document !== 'undefined' && document.hidden)) return

    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [isMinimized])

  // Prevent scroll events from bubbling up to main page
  useEffect(() => {
    const handleScroll = (e: Event) => {
      e.stopPropagation()
    }

    const chatContainer = document.querySelector('[data-chat-container]')
    if (chatContainer) {
      chatContainer.addEventListener('wheel', handleScroll, { passive: false })
      chatContainer.addEventListener('scroll', handleScroll, { passive: false })
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('wheel', handleScroll)
        chatContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <>
      {/* Chat Toggle Button - Shows when chat is hidden */}
      <ChatToggleButton $isVisible={isMinimized} onClick={toggleMinimize}>
        <img src="/002-right.png" alt="Open Chat" style={{ width: '12px', height: '12px' }} />
      </ChatToggleButton>

      <ChatContainer $isVisible={!isMinimized} data-chat-container>
        {/* Chat Header with Title and Collapse Button */}
        <ChatHeader>
          <ChatTitleContainer>
            <ChatTitle>SOLBET Chat</ChatTitle>
            <PlayerCount>
              <img src="/9d7e91c7-872f-4d7a-bd5e-53d7181e6bbf.svg" alt="Online" style={{ width: '12px', height: '12px' }} />
              <span>{messages.length}</span>
            </PlayerCount>
          </ChatTitleContainer>
          <CollapseButton onClick={toggleMinimize}>
            <img src="/002-right.png" alt="Collapse" style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
          </CollapseButton>
        </ChatHeader>


        <MessagesContainer 
          onWheel={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          {isLoading && <LoadingText>Loading messages…</LoadingText>}
          {!isLoading && messages.length === 0 && <LoadingText>No messages yet. Be the first to chat!</LoadingText>}
          {messages.map((message) => (
            <MessageItem key={message.id}>
              <MessageAvatar>
                {message.avatar_url ? (
                  <img 
                    src={message.avatar_url} 
                    alt="Avatar" 
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
                    <Username 
                      $userColor={userColors[message.username]}
                      onClick={(e) => handleUsernameClick(e, message.walletAddress, message.username)}
                    >
                      {message.username}
              </Username>
                    <UserLevelWrapper>
                      <LevelBadge level={message.level} />
                    </UserLevelWrapper>
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
          <ChatInputRow>
            {!connected ? (
              <ChatInputWrapper>
                <ChatInput
                  type="text"
                  placeholder="Connect wallet to chat..."
                  value=""
                  disabled={true}
                  $isConnect={true}
                  maxLength={500}
                />
                <InlineButton
                  onClick={() => walletModal.setVisible(true)}
                  disabled={false}
                  $isConnect={true}
                >
                  Connect
                </InlineButton>
              </ChatInputWrapper>
            ) : (
              <ChatInputWrapper>
                <ChatInput
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  maxLength={500}
                />
                <InlineButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  $isConnect={false}
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
          
          <ChatRules>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>Chat Rules</span>
          </ChatRules>
        </ChatInputContainer>

      </ChatContainer>

      {showProfilePopup && selectedUser && (
        <ProfilePopup
          walletAddress={selectedUser.walletAddress}
          username={selectedUser.username}
          onClose={closeProfilePopup}
          position={selectedUser.position}
        />
      )}
    </>
  )
}