import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import styled from 'styled-components'
// TODO: Replace with Supabase user data hooks
// import { getUsername, getUserAvatarOrDefault, hasCustomAvatar } from '../utils'

// Styled components
const ProfilePageContainer = styled.div`
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
`

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`

const ProfileAvatar = styled.div<{ hasCustomAvatar?: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: ${props => props.hasCustomAvatar ? 'transparent' : 'linear-gradient(135deg, #4c1d95, #a855f7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 0 0 3px #37373c, 0 0 0 6px #22222d;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
`

const EditAvatarButton = styled.label`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  z-index: 1000;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  input[type="file"] {
    display: none;
  }
`

const UploadIcon = styled.div`
  width: 12px;
  height: 12px;
  background-image: url("/001-pencil.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

const AvatarModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
`

const AvatarModal = styled.div`
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const AvatarPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4c1d95, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
`

const ModalTitle = styled.h3`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
`

const ModalButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ModalButton = styled.button`
  background: transparent;
  border: 1px solid #2d2d2d;
  color: white;
  padding: 0.75rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #6741ff;
  }
  
  &.remove {
    color: #ff4444;
    border-color: #ff4444;
    
    &:hover {
      background: rgba(255, 68, 68, 0.1);
    }
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.5rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const ProfileInfo = styled.div`
  flex: 1;
`

const UsernameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`

const Username = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: uppercase;
`

const Level = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #4c1d95, #a855f7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const JoinDate = styled.p`
  color: #888;
  font-size: 0.875rem;
  margin: 0;
`

const XPBar = styled.div`
  background: #2d2d2d;
  border-radius: 8px;
  height: 8px;
  margin-top: 0.5rem;
  overflow: hidden;
`

const XPProgress = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #6741ff, #42ff78);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`

const XPText = styled.p`
  color: #888;
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0;
  text-align: right;
`

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`

const FormSection = styled.div`
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 12px;
  padding: 1.5rem;
`

const SectionTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
`

const InputGroup = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  color: #888;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #2d2d2d;
  border-radius: 8px;
  background: #141414;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: #6741ff;
  }
`

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: white;
  font-size: 0.875rem;
  padding: 0;
  cursor: text;
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: text;
  }
`

const ButtonContainer = styled.div`
  background: linear-gradient(to bottom, #221e3a, #232325);
  padding: 2px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
`

const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 1.75rem;
  min-height: 1.75rem;
  width: auto;
  min-width: 1.75rem;
  max-width: fit-content;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 1.75rem;
  min-height: 1.75rem;
  width: auto;
  min-width: 1.75rem;
  max-width: fit-content;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  img {
    width: 12px;
    height: 12px;
  }
`

const BalanceSection = styled.div`
  background: #1a1a1a;
  border: 1px solid #2d2d2d;
  border-radius: 12px;
  padding: 1.5rem;
`

const BalanceTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
`

const BalanceAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const SolanaIcon = styled.img`
  width: 24px;
  height: 24px;
`

const BalanceText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`

const ClaimButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.5rem;
  min-height: 2.5rem;
  width: 100%;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background-color: #42ff78;
  border: 1px solid #1D1D1D;
  border-radius: 0.625rem;
  color: #000;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #38e066;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const BalanceDisplay = styled.div`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #2d2d2d;
  border-radius: 8px;
  background: #141414;
  color: white;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: not-allowed;
  
  &:focus {
    outline: none;
    border-color: #6741ff;
  }
`

const AccountInfo = styled.div`
  background: #141414;
  border: 1px solid #2d2d2d;
  border-radius: 8px;
  padding: 1rem;
`

const AccountTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
`

const WalletAddress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #888;
  font-size: 0.75rem;
  font-family: monospace;
  width: 100%;
`

const ExternalLinkButton = styled.button`
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 0.5rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  margin-left: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  img {
    width: 10px;
    height: 10px;
  }
`

interface ProfilePageProps {
  onDisconnect: () => void
}

interface UserData {
  username: string
  email: string
  walletAddress: string
  createdAt: string
  hasCustomAvatar?: boolean
  customAvatar?: string
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onDisconnect }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{[key: string]: string}>({})
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/profile') return 'profile'
    if (path === '/bonus') return 'bonus'
    if (path === '/statistics') return 'statistics'
    if (path === '/transactions') return 'transactions'
    return 'profile' // default
  }

  const activeTab = getActiveTab()

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      const parsed = JSON.parse(storedUserData)
      setUserData(parsed)
      setEditValues({
        username: parsed.username || '',
        email: parsed.email || '',
        clientSeed: parsed.clientSeed || '',
        referredBy: parsed.referredBy || ''
      })
    }
  }, [])

  const handleEdit = (field: string) => {
    setIsEditing(field)
  }

  const handleSave = (field: string) => {
    if (userData) {
      const updatedData = { ...userData, [field]: editValues[field] }
      setUserData(updatedData)
      localStorage.setItem('userData', JSON.stringify(updatedData))
      setIsEditing(null)
    }
  }

  const handleCancel = (field: string) => {
    const value = userData?.[field as keyof UserData]
    setEditValues({ ...editValues, [field]: typeof value === 'string' ? value : '' })
    setIsEditing(null)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type - only PNG and JPEG allowed
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PNG or JPEG image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      
      // Update user data with new avatar
      if (userData) {
        const updatedData = { ...userData, hasCustomAvatar: true, avatarUrl: url }
        setUserData(updatedData)
        localStorage.setItem('userData', JSON.stringify(updatedData))
      }
      
      // Close menu
      setShowAvatarMenu(false)
    }
  }

  const handleRemoveAvatar = () => {
    // Remove avatar and revert to default
    setAvatarUrl(null)
    
    if (userData) {
      const updatedData = { ...userData, hasCustomAvatar: false, avatarUrl: null }
      setUserData(updatedData)
      localStorage.setItem('userData', JSON.stringify(updatedData))
    }
    
    // Close menu
    setShowAvatarMenu(false)
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '/003-user.png' },
    { id: 'bonus', label: 'Bonus', icon: '/bonus.svg' },
    { id: 'statistics', label: 'Statistics', icon: '/statistics.svg' },
    { id: 'transactions', label: 'Transactions', icon: '/transaction.svg' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ContentSection>
              <FormSection>
                <SectionTitle>Profile Details</SectionTitle>
                
                <InputGroup>
                  <Label>Enter name</Label>
                  <InputContainer>
                    <Input
                      value={editValues.username}
                      onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                      disabled={isEditing !== 'username'}
                    />
                    {isEditing === 'username' ? (
                      <>
                        <ButtonContainer>
                          <EditButton onClick={() => handleSave('username')}>Save</EditButton>
                        </ButtonContainer>
                        <ButtonContainer>
                          <EditButton onClick={() => handleCancel('username')}>Cancel</EditButton>
                        </ButtonContainer>
                      </>
                    ) : (
                      <ButtonContainer>
                        <EditButton onClick={() => handleEdit('username')}>Edit</EditButton>
                      </ButtonContainer>
                    )}
                  </InputContainer>
                </InputGroup>

                <InputGroup>
                  <Label>Enter email</Label>
                  <InputContainer>
                    <Input
                      type="email"
                      value={editValues.email}
                      onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                      disabled={isEditing !== 'email'}
                    />
                    {isEditing === 'email' ? (
                      <>
                        <ButtonContainer>
                          <EditButton onClick={() => handleSave('email')}>Save</EditButton>
                        </ButtonContainer>
                        <ButtonContainer>
                          <EditButton onClick={() => handleCancel('email')}>Cancel</EditButton>
                        </ButtonContainer>
                      </>
                    ) : (
                      <ButtonContainer>
                        <EditButton onClick={() => handleEdit('email')}>Edit</EditButton>
                      </ButtonContainer>
                    )}
                  </InputContainer>
                </InputGroup>

                <InputGroup>
                  <Label>Client Seed</Label>
                  <InputContainer>
                    <Input
                      value={editValues.clientSeed}
                      onChange={(e) => setEditValues({ ...editValues, clientSeed: e.target.value })}
                      disabled={isEditing !== 'clientSeed'}
                      type={isEditing === 'clientSeed' ? 'text' : 'password'}
                    />
                    <ViewButton>
                      <img src="/001-view.png" alt="View" />
                    </ViewButton>
                    {isEditing === 'clientSeed' ? (
                      <>
                        <ButtonContainer>
                          <EditButton onClick={() => handleSave('clientSeed')}>Save</EditButton>
                        </ButtonContainer>
                        <ButtonContainer>
                          <EditButton onClick={() => handleCancel('clientSeed')}>Cancel</EditButton>
                        </ButtonContainer>
                      </>
                    ) : (
                      <ButtonContainer>
                        <EditButton onClick={() => handleEdit('clientSeed')}>Edit</EditButton>
                      </ButtonContainer>
                    )}
                  </InputContainer>
                </InputGroup>

                <InputGroup>
                  <Label>Referred by</Label>
                  <InputContainer>
                    <Input
                      value={editValues.referredBy}
                      onChange={(e) => setEditValues({ ...editValues, referredBy: e.target.value })}
                      disabled={isEditing !== 'referredBy'}
                      placeholder="Enter referral code"
                    />
                    {isEditing === 'referredBy' ? (
                      <>
                        <ButtonContainer>
                          <EditButton onClick={() => handleSave('referredBy')}>Save</EditButton>
                        </ButtonContainer>
                        <ButtonContainer>
                          <EditButton onClick={() => handleCancel('referredBy')}>Cancel</EditButton>
                        </ButtonContainer>
                      </>
                    ) : (
                      <ButtonContainer>
                        <EditButton onClick={() => handleEdit('referredBy')}>Edit</EditButton>
                      </ButtonContainer>
                    )}
                  </InputContainer>
                </InputGroup>
              </FormSection>

              <BalanceSection>
                <BalanceTitle>Available Balance</BalanceTitle>
                <BalanceDisplay>
                  <SolanaIcon src="/solana.png" alt="Solana" />
                  <BalanceText>0.0000</BalanceText>
                </BalanceDisplay>
                <ClaimButton>Claim</ClaimButton>
                
                <AccountInfo>
                  <AccountTitle>Account</AccountTitle>
                  <WalletAddress>
                    <span>{formatWalletAddress(publicKey?.toString() || userData.walletAddress)}</span>
                    <ExternalLinkButton 
                      onClick={() => window.open(`https://solscan.io/account/${publicKey?.toString() || userData.walletAddress}`, '_blank')}
                      title="View on Solscan"
                    >
                      <img src="/001-diagonal-arrow.png" alt="View on Solscan" />
                    </ExternalLinkButton>
                  </WalletAddress>
                </AccountInfo>
              </BalanceSection>
            </ContentSection>
          </>
        )
      case 'bonus':
        return <div>Bonus content coming soon...</div>
      case 'statistics':
        return <div>Statistics content coming soon...</div>
      case 'transactions':
        return <div>Transactions content coming soon...</div>
      default:
        return null
    }
  }

  return (
    <ProfilePageContainer>
      <Sidebar>
        {tabs.map(tab => (
          <SidebarItem
            key={tab.id}
            active={activeTab === tab.id}
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
        <ProfileHeader>
          <ProfileAvatar hasCustomAvatar={false}>
            <img 
              src="/solly.png" 
              alt="Default Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
            <EditAvatarButton onClick={(e) => {
              e.preventDefault()
              setShowAvatarMenu(true)
            }}>
              <UploadIcon />
            </EditAvatarButton>
          </ProfileAvatar>
          
          <ProfileInfo>
            <UsernameContainer>
              <Username>{userData.username}</Username>
              <Level>Level 1</Level>
            </UsernameContainer>
            <JoinDate>{formatJoinDate(userData.createdAt)}</JoinDate>
            <XPBar>
              <XPProgress progress={28} />
            </XPBar>
            <XPText>42 / 150 XP (+108 XP for the next level)</XPText>
          </ProfileInfo>
        </ProfileHeader>
        
        {renderTabContent()}
          </MainContent>
          
          {/* Avatar Upload/Remove Modal */}
          <AvatarModalOverlay isOpen={showAvatarMenu} onClick={() => setShowAvatarMenu(false)}>
            <AvatarModal onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setShowAvatarMenu(false)}>×</CloseButton>
              
              <AvatarPreview>
                {false ? (
                  <img 
                    src={'/solly.png'} 
                    alt="Current Avatar" 
                  />
                ) : (
                  <img 
                    src="/solly.png" 
                    alt="Default Avatar" 
                  />
                )}
              </AvatarPreview>
              
              <ModalTitle>Change Profile Picture</ModalTitle>
              
              <ModalButtons>
                <ModalButton onClick={() => {
                  const fileInput = document.createElement('input')
                  fileInput.type = 'file'
                  fileInput.accept = 'image/png,image/jpeg,image/jpg'
                  fileInput.onchange = (e) => handleAvatarUpload(e as any)
                  fileInput.click()
                }}>
                  Upload Image
                </ModalButton>
                
                {false && (
                  <ModalButton className="remove" onClick={handleRemoveAvatar}>
                    Remove Image
                  </ModalButton>
                )}
              </ModalButtons>
            </AvatarModal>
          </AvatarModalOverlay>
        </ProfilePageContainer>
      )
    }

    export default ProfilePage
