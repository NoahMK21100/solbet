import React from 'react'
import styled from 'styled-components'
import { useChatVisibility } from '../hooks/useChatVisibility'

const FooterContainer = styled.footer<{ $isChatMinimized: boolean }>`
  position: relative;
  width: 100vw;
  min-height: 120px;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  margin-top: auto;
  margin-left: calc(-50vw + 50%);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 1024px) {
    padding: 2rem 4rem;
    margin-left: ${props => props.$isChatMinimized 
      ? 'calc(-50vw + 50%)' 
      : 'calc(-50vw + 50% + 175px)'}; /* Offset for chat sidebar */
  }
`

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 1200px;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const LegalLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;

  @media (min-width: 768px) {
    align-items: flex-start;
  }
`

const ContactText = styled.div`
  font-size: 0.875rem;
  color: #BFBFCD;
  
  a {
    color: #42ff78;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const Copyright = styled.div`
  font-size: 0.75rem;
  color: #8B8B8B;
  text-align: center;
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    text-align: left;
    margin-top: 0;
  }
`

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 8px 16px;
  height: 36px;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(30, 20, 50, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 0.25px solid rgba(147, 51, 234, 0.6);
  box-shadow: 0 0 8px rgba(147, 51, 234, 0.3), inset 0 0 8px rgba(147, 51, 234, 0.1);
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.4), inset 0 0 12px rgba(147, 51, 234, 0.15);
  }

  & svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`

const LegalLink = styled.a`
  font-weight: 500;
  font-size: 0.875rem;
  color: #BFBFCD;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`

export default function Footer() {
  const { isMinimized } = useChatVisibility()
  
  return (
    <FooterContainer $isChatMinimized={isMinimized}>
      <FooterContent>
        <div>
          <Copyright>2025 SOLBET. All rights reserved.</Copyright>
        </div>

        <SocialLinks>
          <SocialButton href="https://x.com/solbetinc" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Follow our X / Twitter
          </SocialButton>
          
          <SocialButton href="#" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join our Discord
          </SocialButton>
        </SocialLinks>

        <div>
          <LegalLinks>
            <LegalLink href="#" onClick={(e) => e.preventDefault()}>Terms of Service</LegalLink>
            <LegalLink href="#" onClick={(e) => e.preventDefault()}>Play Responsibly</LegalLink>
          </LegalLinks>
          
          <ContactSection>
            <ContactText>Contact Support: <a href="mailto:support@solbet.com">support@solbet.com</a></ContactText>
            <ContactText>Marketing Inquiries: <a href="mailto:partners@solbet.com">partners@solbet.com</a></ContactText>
          </ContactSection>
          
          <SocialButton href="#" target="_blank" rel="noopener noreferrer" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '4px 8px', height: '28px' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px' }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Provably Fair
          </SocialButton>
        </div>
      </FooterContent>
    </FooterContainer>
  )
}
