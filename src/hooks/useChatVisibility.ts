import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ChatVisibilityContextType {
  isChatVisible: boolean
  toggleChat: () => void
  setChatVisible: (visible: boolean) => void
}

const ChatVisibilityContext = createContext<ChatVisibilityContextType | undefined>(undefined)

export const ChatVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isChatVisible, setIsChatVisible] = useState(true)

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible)
  }

  const setChatVisible = (visible: boolean) => {
    setIsChatVisible(visible)
  }

  return React.createElement(
    ChatVisibilityContext.Provider,
    { value: { isChatVisible, toggleChat, setChatVisible } },
    children
  )
}

export const useChatVisibility = () => {
  const context = useContext(ChatVisibilityContext)
  if (context === undefined) {
    throw new Error('useChatVisibility must be used within a ChatVisibilityProvider')
  }
  return context
}
