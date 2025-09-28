import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0f0f0f;
`

const Sidebar = styled.div`
  width: 250px;
  background: #1a1a1a;
  border-right: 1px solid #2d2d2d;
  padding: 2rem 0;
`

const SidebarItem = styled.button<{ active: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  background: ${props => props.active ? '#6741ff' : 'transparent'};
  border: none;
  color: ${props => props.active ? 'white' : 'white'};
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? '#6741ff' : 'rgba(255, 255, 255, 0.1)'};
    color: white;
  }
  
  img {
    filter: ${props => props.active ? 'none' : 'brightness(0) saturate(100%) invert(85%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(88%) contrast(86%)'};
  }
`

const DisconnectButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: #ff4444;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  border-top: 1px solid #2d2d2d;
  
  &:hover {
    background: rgba(255, 68, 68, 0.1);
  }
  
  img {
    width: 16px;
    height: 16px;
    filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
  }
`

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ComingSoonCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
`

const ComingSoonTitle = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
`

const ComingSoonText = styled.p`
  color: #888;
  font-size: 1rem;
  margin: 0;
`

interface TransactionsPageProps {
  onDisconnect: () => void
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onDisconnect }) => {
  const navigate = useNavigate()
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '/003-user.png' },
    { id: 'bonus', label: 'Bonus', icon: '/bonus.svg' },
    { id: 'statistics', label: 'Statistics', icon: '/statistics.svg' },
    { id: 'transactions', label: 'Transactions', icon: '/transaction.svg' }
  ]

  return (
    <PageContainer>
      <Sidebar>
        {tabs.map(tab => (
          <SidebarItem
            key={tab.id}
            active={tab.id === 'transactions'}
            onClick={() => navigate(`/${tab.id}`)}
          >
            {tab.icon.startsWith('/') ? (
              <img src={tab.icon} alt={tab.label} style={{ width: '20px', height: '20px' }} />
            ) : (
              <span>{tab.icon}</span>
            )}
            {tab.label}
          </SidebarItem>
        ))}
        <DisconnectButton onClick={onDisconnect}>
          <img src="/disconnect.svg" alt="Disconnect" style={{ width: '20px', height: '20px' }} />
          Disconnect
        </DisconnectButton>
      </Sidebar>
      
      <MainContent>
        <ComingSoonCard>
          <ComingSoonTitle>Transactions</ComingSoonTitle>
          <ComingSoonText>Coming soon...</ComingSoonText>
        </ComingSoonCard>
      </MainContent>
    </PageContainer>
  )
}

export default TransactionsPage
