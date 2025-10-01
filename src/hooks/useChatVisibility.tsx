import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  isMinimized: boolean
  setIsMinimized: (minimized: boolean) => void
  toggleChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false)

  const toggleChat = () => {
    setIsMinimized(prev => !prev)
  }

  return (
    <ChatContext.Provider value={{ isMinimized, setIsMinimized, toggleChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatVisibility() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatVisibility must be used within a ChatProvider')
  }
  return context
}
