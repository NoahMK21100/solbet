import React, { useState } from 'react'
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
  width: 500px;
  max-width: 90vw;
  background: #0f0f0f;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(103, 65, 255, 0.3);
  border: 1px solid #6741ff;
  position: relative;
  overflow: hidden;
`

const ModalContent = styled.div`
  padding: 2rem;
  color: white;
`

const Title = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1.5rem 0;
  color: white;
  text-align: center;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
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

const SubmitButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: ${props => props.disabled ? '#444' : '#6741ff'};
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:hover:not(:disabled) {
    background: #5a3ae6;
    transform: translateY(-1px);
  }
  
  &:disabled {
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

interface RegistrationModalProps {
  onRegistrationComplete: () => void
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onRegistrationComplete }) => {
  const { publicKey } = useWallet()
  const { createUserProfile, isLoading, error } = useSupabaseUser()
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })
  const [success, setSuccess] = useState('')

  const isFormValid = formData.username.trim() && formData.email.trim()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isLoading || !publicKey) return

    try {
      const profile = await createUserProfile({
        username: formData.username.trim(),
        email: formData.email.trim()
      })

      if (profile) {
        setSuccess('Registration successful! Welcome to SOLBET!')
        setTimeout(() => {
          onRegistrationComplete()
        }, 2000)
      }
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  if (!publicKey) {
    return null
  }

  return (
    <ModalOverlay>
      <ModalWrapper>
        <ModalContent>
          <Title>Create Profile</Title>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Username *</Label>
              <Input
                type="text"
                placeholder="Choose your username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                maxLength={20}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <SubmitButton
              type="submit"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                'Create Profile'
              )}
            </SubmitButton>
          </form>
        </ModalContent>
      </ModalWrapper>
    </ModalOverlay>
  )
}

export default RegistrationModal