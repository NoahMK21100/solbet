import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import styled from 'styled-components'
import { supabase } from '../lib/supabase'
// import { useSupabaseWalletSync } from '../hooks/useSupabaseWalletSync'

// Styled components
const ProfilePageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: transparent;
  position: relative;
  color: white;
`

const Sidebar = styled.div`
  width: 320px;
  background: transparent;
  border-right: none;
  padding: 3rem 0 2rem 1rem;
  box-shadow: none;
`

const SidebarItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  border: ${props => props.$active ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'};
  color: ${props => props.$active ? 'white' : '#a0a0a0'};
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.15rem 0;
  border-radius: 10px;
  position: relative;
  line-height: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  img {
    width: 22px;
    height: 22px;
    filter: ${props => props.$active ? 'none' : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(90%) contrast(86%)'};
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
  line-height: 1;
  
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
  padding: 3rem 2rem;
  overflow-y: auto;
  background: transparent;
  position: relative;
`

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`

const ProfileAvatar = styled.div<{ $hasCustomAvatar?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: ${props => props.$hasCustomAvatar ? 'transparent' : 'linear-gradient(135deg, #6741ff, #8b5cf6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 32px rgba(103, 65, 255, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(103, 65, 255, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
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

const AvatarModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
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
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 20px rgba(103, 65, 255, 0.5);
`

const Level = styled.div`
  display: inline-block;
  background: #42ff78;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

const XPProgress = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #6741ff, #42ff78);
  width: ${props => props.$progress}%;
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
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
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
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.25rem;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: #6741ff;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(103, 65, 255, 0.1);
  }
`

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: white;
  font-size: 1rem;
  padding: 0;
  cursor: text;
  font-weight: 500;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: text;
  }
`

const ButtonContainer = styled.div`
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
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem 1rem;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  height: fit-content;
`

// Statistics styled components removed - will be added later

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
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const SolanaIcon = styled.img`
  width: 20px;
  height: 20px;
`

const BalanceText = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: white;
`

const ClaimButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  width: auto;
  min-width: 120px;
  padding: 0 1rem;
  background: #42ff78;
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #38e066;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(0);
  }
`

const BalanceDisplay = styled.div`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: not-allowed;
  height: 2.5rem;
  flex: 1;
  min-width: 0;
  
  &:focus {
    outline: none;
    border-color: #6741ff;
  }
`

const AccountInfo = styled.div`
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 1.25rem 0;
  height: fit-content;
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
  clientSeed?: string
  referredBy?: string
  hasCustomAvatar?: boolean
  customAvatar?: string
  avatarUrl?: string | null
  level?: number
  totalBets?: number
  totalWon?: number
  totalWagered?: number
  totalWinnings?: number
  biggestWin?: number
  luckiestWinMultiplier?: number
  gamesPlayed?: number
  netProfit?: number
  lastPlayedAt?: string
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onDisconnect }) => {
  // ALL HOOKS MUST BE CALLED FIRST - NO EXCEPTIONS
  const location = useLocation()
  const { publicKey } = useWallet()
  
  // Simple state for testing
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{[key: string]: string}>({})
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const isLoadingRef = useRef(false)

  // Load profile data directly - MUST BE BEFORE ANY EARLY RETURNS
  useEffect(() => {
    const loadProfile = async () => {
      // Prevent multiple simultaneous calls
      if (isLoadingRef.current) return
      
      if (!publicKey) {
        // No wallet connected, show fallback data
        setProfile({
          id: 1,
          wallet_address: 'No wallet connected',
          username: 'Guest User',
          email: 'guest@example.com',
          balance: 0,
          level: 1,
          total_wagered: 0,
          total_winnings: 0,
          net_profit: 0,
          games_played: 0,
          biggest_win: 0,
          luckiest_win_multiplier: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setLoading(false)
        setIsInitialized(true)
        return
      }

      isLoadingRef.current = true
      setLoading(true)
      try {
        // Import the function directly
        const { findOrCreateProfile } = await import('../utils/upsertUserProfile')
        
        const result = await findOrCreateProfile(publicKey.toString())
        
        if (result.profile) {
          setProfile(result.profile)
        } else {
          // Fallback profile data for testing
          setProfile({
            id: 1,
            wallet_address: publicKey.toString(),
            username: 'TestUser',
            email: 'test@example.com',
            balance: 0,
            level: 1,
            total_wagered: 0,
            total_winnings: 0,
            net_profit: 0,
            games_played: 0,
            biggest_win: 0,
            luckiest_win_multiplier: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } catch (error) {
        // Fallback profile data for testing
        setProfile({
          id: 1,
          wallet_address: publicKey.toString(),
          username: 'TestUser',
          email: 'test@example.com',
          balance: 0,
          level: 1,
          total_wagered: 0,
          total_winnings: 0,
          net_profit: 0,
          games_played: 0,
          biggest_win: 0,
          luckiest_win_multiplier: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } finally {
        isLoadingRef.current = false
        setLoading(false)
        setIsInitialized(true)
      }
    }

    // Only load once when publicKey changes
    if (publicKey) {
      loadProfile()
    }
  }, [publicKey?.toString()]) // Use toString() to prevent object reference changes

  // Initialize edit values when profile loads
  useEffect(() => {
    if (profile) {
      setEditValues({
        username: profile.username || '',
        email: profile.email || '',
        clientSeed: '', // Not stored in Supabase yet
        referredBy: '' // Not stored in Supabase yet
      })
    }
  }, [profile])

  // Get navigate function from useNavigate hook
  const navigate = useNavigate()
  
  // Safety check for navigate function
  const safeNavigate = (path: string) => {
    try {
      if (navigate && typeof navigate === 'function') {
        navigate(path)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  // Convert Supabase profile to userData format
  const userData: UserData | null = profile ? {
    username: profile.username || 'Anonymous',
    email: profile.email || '',
    walletAddress: profile.wallet_address,
    clientSeed: '', // Not stored in Supabase yet
    referredBy: profile.referred_by || '',
    createdAt: profile.created_at,
    hasCustomAvatar: !!profile.avatar_url,
    avatarUrl: profile.avatar_url || null,
    level: profile.level || 1,
    // Statistics removed - will be added later
    totalBets: 0,
    totalWon: 0,
    totalWagered: 0,
    totalWinnings: 0,
    biggestWin: 0,
    luckiestWinMultiplier: 0,
    gamesPlayed: 0,
    netProfit: 0,
    lastPlayedAt: undefined
  } : null

  // Update active tab based on current route
  useEffect(() => {
    const path = location?.pathname || '/profile'
    if (path === '/profile') setActiveTab('profile')
    else if (path === '/bonus') setActiveTab('bonus')
    else if (path === '/statistics') setActiveTab('statistics')
    else if (path === '/transactions') setActiveTab('transactions')
    else setActiveTab('profile')
  }, [location?.pathname])

  // Early returns after all hooks
  if (!isInitialized || loading) {
    return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Loading profile...</div>
  }
  
  if (!userData) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p>Unable to load your profile. Please check the console for errors.</p>
        <p>Make sure your wallet is connected and environment variables are set.</p>
      </div>
    )
  }

  const handleEdit = (field: string) => {
    setIsEditing(field)
  }

  const handleSave = async (field: string) => {
    if (userData && profile) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ [field]: editValues[field], updated_at: new Date().toISOString() })
          .eq('wallet_address', profile.wallet_address)

        if (error) {
          console.error('Error updating profile:', error)
          alert(`Error updating profile: ${error.message}`)
          return
        }

        // Update local profile state directly
        setProfile((prevProfile: any) => ({
          ...prevProfile,
          [field]: editValues[field],
          updated_at: new Date().toISOString()
        }))
        setIsEditing(null)
        
        alert('Profile updated successfully!')
      } catch (err) {
        console.error('Error updating profile:', err)
        alert('An unexpected error occurred while saving.')
      }
    }
  }

  const handleCancel = (field: string) => {
    const value = userData?.[field as keyof UserData]
    setEditValues({ ...editValues, [field]: typeof value === 'string' ? value : '' })
    setIsEditing(null)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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

    if (!profile?.wallet_address) {
      alert('Unable to upload avatar - wallet address not found')
      return
    }

    try {
      // Create a unique file name based on wallet address and timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.wallet_address}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('wallet_address', profile.wallet_address)

      if (updateError) {
        console.error('Database update error:', updateError)
        alert(`Failed to update profile: ${updateError.message}`)
        return
      }

      // Update local state
      setProfile((prev: any) => ({
        ...prev,
        avatar_url: publicUrl
      }))
      setAvatarUrl(publicUrl)
      
      alert('Avatar updated successfully!')
      setShowAvatarMenu(false)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert('An unexpected error occurred while uploading.')
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile?.wallet_address) {
      alert('Unable to remove avatar - wallet address not found')
      return
    }

    try {
      // Update profile in database to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('wallet_address', profile.wallet_address)

      if (updateError) {
        console.error('Database update error:', updateError)
        alert(`Failed to remove avatar: ${updateError.message}`)
        return
      }

      // Update local state
      setProfile((prev: any) => ({
        ...prev,
        avatar_url: null
      }))
      setAvatarUrl(null)
      
      alert('Avatar removed successfully!')
      setShowAvatarMenu(false)
    } catch (err) {
      console.error('Error removing avatar:', err)
      alert('An unexpected error occurred while removing avatar.')
    }
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
                <BalanceAmount>
                  <BalanceDisplay>
                    <SolanaIcon src="/solana.png" alt="Solana" />
                    <BalanceText>0.0000</BalanceText>
                  </BalanceDisplay>
                  <ClaimButton>Claim</ClaimButton>
                </BalanceAmount>
                
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

              {/* Statistics section removed - will be added later */}
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
    <>
      <ProfilePageContainer>
        <Sidebar>
        {tabs?.map(tab => (
          <SidebarItem
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id)
            }}
          >
            {tab.icon?.startsWith('/') ? (
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
          <ProfileAvatar $hasCustomAvatar={!!profile?.avatar_url}>
            <img 
              src={profile?.avatar_url || avatarUrl || '/solly.png'} 
              alt="Profile Avatar" 
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
              <Level>Level {userData.level || 1}</Level>
            </UsernameContainer>
            <JoinDate>{formatJoinDate(userData.createdAt)}</JoinDate>
            <XPBar>
              <XPProgress $progress={28} />
            </XPBar>
            <XPText>42 / 150 XP (+108 XP for the next level)</XPText>
          </ProfileInfo>
        </ProfileHeader>
        
        {renderTabContent()}
      </MainContent>
      
      {/* Avatar Upload/Remove Modal */}
          <AvatarModalOverlay $isOpen={showAvatarMenu} onClick={() => setShowAvatarMenu(false)}>
            <AvatarModal onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setShowAvatarMenu(false)}>×</CloseButton>
              
              <AvatarPreview>
                <img 
                  src={profile?.avatar_url || avatarUrl || '/solly.png'} 
                  alt="Current Avatar" 
                />
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
                
                {profile?.avatar_url && (
                  <ModalButton className="remove" onClick={handleRemoveAvatar}>
                    Remove Image
                  </ModalButton>
                )}
              </ModalButtons>
            </AvatarModal>
          </AvatarModalOverlay>
      </ProfilePageContainer>
    </>
  )
}

export default ProfilePage
