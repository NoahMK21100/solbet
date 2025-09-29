import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSupabaseUser } from '../hooks/useSupabaseUser'

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  box-sizing: border-box;
`

const ModalWrapper = styled.div`
  width: 600px;
  max-width: 90vw;
  min-height: 500px;
  background: #0f0f0f;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 65, 255, 0.3);
  position: relative;
  display: flex;
  overflow: hidden;
`

const LeftSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6741ff, #42ff78);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/background_shadows.webp') center/cover no-repeat;
    opacity: 0.3;
  }
`

const RightSection = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
`

const Title = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 2rem 0;
  color: white;
  text-align: center;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgb(20, 20, 20);
  border: 1px solid rgb(29, 29, 29);
  border-radius: 8px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #6741ff;
  }
  
  &::placeholder {
    color: #666;
  }
`

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 2rem;
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  background: rgb(20, 20, 20);
  border: 1px solid rgb(29, 29, 29);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  
  &:checked {
    background: #6741ff;
    border-color: #6741ff;
  }
`

const CheckboxLabel = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: white;
  line-height: 1.4;
  cursor: pointer;
  
  strong {
    color: #42ff78;
  }
`

const CreateButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 1rem;
  background: ${props => props.disabled ? '#444' : '#6741ff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:hover:not(:disabled) {
    background: #5a3ae6;
  }
`


interface RegistrationModalProps {
  onRegistrationComplete: () => void
}

// No verification needed - skip entirely

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegistrationComplete }) => {
  const { publicKey, connected } = useWallet()
  const { createUserProfile, isLoading, error } = useSupabaseUser()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    referralCode: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if form is valid
  const isFormValid = formData.username.trim() && formData.email.trim() && agreedToTerms

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting || !publicKey) return

    setIsSubmitting(true)

    try {
      // Create user profile directly - no verification needed
      const profile = await createUserProfile({
        username: formData.username.trim(),
        email: formData.email.trim(),
        avatar_url: '🎮' // Default avatar
      })

      if (profile) {
        // Store additional data locally
        const userData = {
          walletAddress: publicKey.toString(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          referralCode: formData.referralCode.trim() || null,
          createdAt: new Date().toISOString()
        }

        localStorage.setItem('userData', JSON.stringify(userData))
        localStorage.setItem('isRegistered', 'true')
        
        // Complete registration
        onRegistrationComplete()
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show if wallet is connected
  if (!connected || !publicKey) {
    return null
  }

  return (
    <>
      <ModalOverlay>
        <ModalWrapper>
        
        <LeftSection>
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '2rem',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              fontFamily: "'Airstrike', sans-serif", 
              fontSize: '3rem', 
              margin: '0 0 1rem 0',
              color: 'white'
            }}>
              SOLBET
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'white',
              opacity: 0.9 
            }}>
              Join the ultimate gaming experience
            </p>
          </div>
        </LeftSection>
        
        <RightSection>
          <Title>SIGN UP</Title>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Enter Name</Label>
              <Input
                type="text"
                placeholder="Enter your display name"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Referral Code (Optional)</Label>
              <Input
                type="text"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value)}
              />
            </FormGroup>
            
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <CheckboxLabel htmlFor="terms">
                I agree that I am at least <strong>18 Years Old</strong> and agree to the terms and conditions.
              </CheckboxLabel>
            </CheckboxContainer>
            
            <CreateButton
              type="submit"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </CreateButton>
          </form>
        </RightSection>
        </ModalWrapper>
      </ModalOverlay>
      
    </>
  )
}

export default RegistrationModal