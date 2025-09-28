import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUserStore } from '../hooks/useUserStore'
import { motion } from 'framer-motion'

const RegistrationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`

const RegistrationModal = styled(motion.div)`
  width: 450px;
  max-width: 90vw;
  background: #0f0f0f url('/background_shadows.webp') center/cover no-repeat;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  border: 1px solid #6741ff;
  box-shadow: 0 0 20px rgba(103, 65, 255, 0.3);
  overflow: hidden;
  position: relative;
`

const ModalContent = styled.div`
  padding: 2rem;
  color: white;
`

const Title = styled.h2`
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

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6741ff;
  }

  &::placeholder {
    color: #666;
  }
`

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6741ff;
  }

  &::placeholder {
    color: #666;
  }
`

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const AvatarOption = styled.div<{ selected: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.selected ? '#6741ff' : '#2a2a2a'};
  border: 2px solid ${props => props.selected ? '#8a6cff' : '#444'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.5rem;

  &:hover {
    border-color: #6741ff;
    transform: scale(1.05);
  }
`

const VerificationSection = styled.div`
  text-align: center;
  padding: 1rem 0;
`

const VerificationCode = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
`

const CodeInput = styled.input`
  width: 50px;
  height: 50px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-family: 'Flama', sans-serif;
  font-size: 1.5rem;
  text-align: center;
  font-weight: bold;

  &:focus {
    outline: none;
    border-color: #6741ff;
  }
`

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #6741ff;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #8a6cff;
  }

  &:disabled {
    color: #666;
    cursor: not-allowed;
    text-decoration: none;
  }
`

const SubmitButton = styled.button`
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
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: #5a3ae6;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #444;
    cursor: not-allowed;
    opacity: 0.6;
  }
`

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
`

const SuccessMessage = styled.div`
  color: #42ff78;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
`

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #444;
  border-top: 2px solid #6741ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

interface RegistrationPageProps {
  onClose: () => void
}

const AVATAR_OPTIONS = ['🎮', '🚀', '💎', '🎯', '🔥', '⭐', '🎪', '🎨', '🎭', '🎲', '🎰', '🏆']

export default function RegistrationPage({ onClose }: RegistrationPageProps) {
  const { publicKey } = useWallet()
  const userStore = useUserStore()
  const [step, setStep] = useState<'profile' | 'verification'>('profile')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '🎮'
  })
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleAvatarSelect = (avatar: string) => {
    setFormData(prev => ({ ...prev, avatar }))
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const sendVerificationEmail = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          walletAddress: publicKey?.toString(),
          username: formData.username
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send verification email')
      }

      setSuccess('Verification code sent to your email!')
      setStep('verification')
      setResendTimer(60) // 60 seconds cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError('Please enter the complete verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code,
          walletAddress: publicKey?.toString(),
          profile: formData
        })
      })

      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      // Create user profile
      const profile = {
        username: formData.username,
        avatar: formData.avatar,
        bio: formData.bio,
        level: 1,
        totalBets: 0,
        totalWon: 0,
        joinDate: new Date()
      }

      userStore.set({
        needsRegistration: false,
        profile,
        newcomer: false
      })

      setSuccess('Registration successful! Welcome to SOLBET!')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    if (resendTimer > 0) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          walletAddress: publicKey?.toString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to resend verification code')
      }

      setSuccess('Verification code resent!')
      setResendTimer(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'profile') {
      if (!formData.username || !formData.email) {
        setError('Please fill in all required fields')
        return
      }
      sendVerificationEmail()
    } else {
      verifyCode()
    }
  }

  return (
    <RegistrationContainer onClick={onClose}>
      <RegistrationModal
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent>
          <Title>
            CREATE PROFILE
            <CloseButton onClick={onClose}>×</CloseButton>
          </Title>

          <Form onSubmit={handleSubmit}>
            {step === 'profile' ? (
              <>
                <FormGroup>
                  <Label>Username *</Label>
                  <Input
                    type="text"
                    placeholder="Choose your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    maxLength={20}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Bio</Label>
                  <TextArea
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    maxLength={150}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Choose Avatar</Label>
                  <AvatarGrid>
                    {AVATAR_OPTIONS.map((avatar) => (
                      <AvatarOption
                        key={avatar}
                        selected={formData.avatar === avatar}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        {avatar}
                      </AvatarOption>
                    ))}
                  </AvatarGrid>
                </FormGroup>
              </>
            ) : (
              <VerificationSection>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                  Verify Your Email
                </h3>
                <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                  We've sent a 6-digit code to {formData.email}
                </p>
                
                <VerificationCode>
                  {verificationCode.map((digit, index) => (
                    <CodeInput
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                    />
                  ))}
                </VerificationCode>

                <ResendButton
                  onClick={resendCode}
                  disabled={resendTimer > 0 || isLoading}
                >
                  {resendTimer > 0 
                    ? `Resend Code ${resendTimer}s` 
                    : 'Resend Code'
                  }
                </ResendButton>
              </VerificationSection>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                step === 'profile' ? 'Send Verification Code' : 'Verify & Create Profile'
              )}
            </SubmitButton>
          </Form>
        </ModalContent>
      </RegistrationModal>
    </RegistrationContainer>
  )
}
