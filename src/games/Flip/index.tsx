import { Canvas } from '@react-three/fiber'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Coin, TEXTURE_HEADS, TEXTURE_TAILS } from './Coin'
import { Effect } from './Effect'
import { GameViewModal } from '../../components/GameViewModal'

import SOUND_COIN from './coin.mp3'
import SOUND_LOSE from './lose.mp3'
import SOUND_WIN from './win.mp3'
import HEADS_IMAGE from './purple.png'
import TAILS_IMAGE from './black.png'

const SIDES = {
  heads: [2, 0],
  tails: [0, 2],
}

type Side = keyof typeof SIDES

// Main Container
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: transparent;
  color: white;
  font-family: 'Flama', sans-serif;
  position: relative;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 110px); /* Full height minus header */
`

// Game Creation Section
const GameCreationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`

const GameHeader = styled.div`
  text-align: left;
  margin-right: 2rem;
`

const GameSubtitle = styled.p`
  font-size: 1rem;
  color: #aaa;
  margin: 0.5rem 0 0 0;
  font-family: 'Flama', sans-serif;
  font-weight: 500;
  padding-left: 0.5rem;
`

const GameTitle = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: white;
  margin: 0;
  text-transform: uppercase;
`

const GameControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
`

const BetAmountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`

const BetLabel = styled.label`
  font-size: 0.75rem;
  color: #ccc;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  white-space: nowrap;
`

const BetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #3a3a3a;
  position: relative;
  gap: 0.5rem;
`

const BetInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  outline: none;
  width: 80px;
  
  &::placeholder {
    color: #666;
  }
`

const CurrencyDropdown = styled.select`
  padding: 0.5rem 0.75rem;
  background: #3a3a3a;
  border: none;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  outline: none;
  cursor: pointer;
`

const USDTooltip = styled.div`
  position: absolute;
  top: -20px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: 'Flama', sans-serif;
  white-space: nowrap;
`

const QuickBetButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: 0.5rem;
  width: 132px;
  height: 44px;
  /* Transparent top container */
`

const QuickBetButtonContainer = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #1D1D1D;
  border-radius: 8px;
  padding: 0.125rem;
  /* Darker middle container around each button */
`

const QuickBetButton = styled.button`
  height: 38px;
  padding: 0 0.75rem;
  background-color: #3a3a3a;
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 6px;
  font-family: 'Flama', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #666 0%, #3a3a3a 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure text is above overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
`

const ChooseSideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  padding: 0;
  margin: 0 0.5rem;
`

const SideButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
`

const SideButton = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0;
  margin: 0;
  
  img {
    width: 80px;
    height: 80px;
    margin: -10px;
    border-radius: 50%;
    transition: all 0.3s ease;
    transform-origin: center;
    filter: ${props => props.selected ? 'brightness(1) saturate(1)' : 'brightness(0.4) saturate(0.3)'};
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05) rotateY(180deg);
    }
  }
`

const CreateGameButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: #6741ff;
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #d787ff 0%, #6741ff 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure text is above overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`

// Game List Section
const GameListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  position: relative;
  z-index: 1;
  background: transparent; /* Keep transparent - no dark background behind entire section */
  flex: 1; /* Take up remaining space */
`

const GameListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #3a3a3a;
`

const AllGamesTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: 'Flama', sans-serif;
`

const SortDropdown = styled.select`
  padding: 0.5rem 0.75rem;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: white;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
`

const GameEntries = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const GameEntry = styled.div<{ $isActive?: boolean; $isCompleted?: boolean }>`
  display: flex;
  align-items: center;
  background: ${props => 
    props.$isActive ? 'radial-gradient(circle at center, rgba(103, 65, 255, 0.3) 0%, #2a2a2a 70%)' : /* Radial purple glow for active games */
    props.$isCompleted ? 'rgba(42, 42, 42, 0.7)' : 
    '#2a2a2a'
  };
  border: 1px solid ${props => 
    props.$isActive ? '#3a3a3a' : /* Grey border for active games */
    props.$isCompleted ? '#3a3a3a' : 
    '#3a3a3a'
  };
  border-radius: 10px;
  padding: 0.75rem 1rem;
  gap: 1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Flama', sans-serif;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #d787ff 0%, #6741ff 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
  
  /* Grey out completed games and their contents */
  ${props => props.$isCompleted && `
    opacity: 0.6;
    filter: grayscale(0.3);
    
    * {
      opacity: 0.8;
    }
  `}
`

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PlayerAvatar = styled.div<{ $isWinner?: boolean; $isLoser?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$isLoser ? '#333' : '#555'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.$isLoser ? '#666' : 'white'};
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  border: ${props => props.$isWinner ? '2px solid #8a6cff' : 'none'};
  position: relative;
  opacity: ${props => props.$isLoser ? 0.5 : 1};
`

const PlayerName = styled.span`
  font-weight: 600;
  font-family: 'Flama', sans-serif;
`

const PlayerLevel = styled.span`
  background: #6741ff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  font-family: 'Flama', sans-serif;
`

const WinnerCoinIcon = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8a6cff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fff;
  
  img {
    width: 8px;
    height: 8px;
  }
`

const VsIcon = styled.img`
  width: 24px;
  height: 24px;
  filter: brightness(0.8);
`

const BetAmountDisplay = styled.span`
  font-weight: 700;
  color: #42ff78;
  font-family: 'Flama', sans-serif;
  text-align: center;
`

const JoinButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: #6741ff;
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #d787ff 0%, #6741ff 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure text is above overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`

const StatusButton = styled.button<{ status: string }>`
  background: ${props => 
    props.status === 'in-play' ? '#42ff78' : 
    props.status === 'waiting' ? '#6741ff' : 
    props.status === 'completed-win' ? '#42ff78' :
    props.status === 'completed-lose' ? '#ff4242' : '#666'
  };
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: ${props => props.status === 'waiting' ? 'white' : '#000'};
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`

const EyeIcon = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-left: 0.5rem;
`

const WinningAmount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #42ff78;
  font-family: 'Flama', sans-serif;
  text-align: center;
  min-width: 120px;
  
  .amount {
    font-size: 1.5rem;
    font-weight: 900;
  }
  
  .label {
    font-size: 0.75rem;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`

const ViewGameButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0.75rem 1.25rem;
  background-color: #6741ff;
  color: white;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  font-family: 'Flama', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Radial gradient overlay for hover effect */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    background-image: radial-gradient(68.53% 169.15% at 50% -27.56%, #d787ff 0%, #6741ff 100%);
    opacity: 0;
    mix-blend-mode: screen;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.5s;
    border-radius: 10px;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure content is above overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
  
  /* Shiny highlight on top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  }
  
  img {
    width: 20px;
    height: 20px;
  }
`

// Transaction Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  box-sizing: border-box;
`

const TransactionModal = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  position: relative;
  border: 1px solid #333;
  
  @media (max-width: 768px) {
    max-width: 90vw;
    padding: 1.5rem;
  }
`

const ModalTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  font-family: 'Flama', sans-serif;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`

const GameInterface = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`

const PlayersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`

const PlayerSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
`

const PlayerSlot = styled.div<{ isWaiting?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  opacity: ${props => props.isWaiting ? 0.6 : 1};
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`

const PlayerAvatarModal = styled.div<{ isBot?: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: ${props => props.isBot ? '#6741ff' : '#42ff78'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;
  border: 2px solid ${props => props.isBot ? '#8a6cff' : '#5ae66a'};
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`

const PlayerNumber = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.625rem;
  }
`

const PlayerInfoModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const PlayerNameModal = styled.span`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`

const BetAmountModal = styled.span`
  color: #888;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`

const CoinContainer = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`

const GameActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`


const GameInfo = styled.div`
  background: #0f0f0f;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`

const InfoText = styled.p`
  color: #888;
  font-size: 0.75rem;
  margin: 0.25rem 0;
  font-family: 'Flama', sans-serif;
  word-break: break-all;
  
  @media (max-width: 768px) {
    font-size: 0.625rem;
  }
`

const ShareButton = styled.button`
  background: #333;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #444;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
`

// Real platform games will be fetched from API
const PLATFORM_GAMES: any[] = []

function Flip() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const { publicKey } = useWallet()
  const [side, setSide] = useState<Side>('heads')
  const [wager, setWager] = useState(0) // Start with blank/zero
  const [currency, setCurrency] = useState<'SOL' | 'FAKE'>('SOL')
  const [games, setGames] = useState<any[]>([])
  const [userGames, setUserGames] = useState<any[]>([])
  const [platformGames, setPlatformGames] = useState<any[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed' | 'joining'>('waiting')
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameId, setGameId] = useState(() => Math.floor(Math.random() * 1000000))
  const [hashedSeed] = useState('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6')
  const [showGameViewModal, setShowGameViewModal] = useState(false)
  const [selectedGameForView, setSelectedGameForView] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Mock SOL price for USD conversion (0.001 SOL ≈ $0.21)
  const solPrice = 210 // $210 per SOL
  const usdAmount = wager * solPrice

  const sounds = useSound({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  // Custom wager validation - allows typing any value but validates on play

  // Fetch real platform games
  const fetchPlatformGames = async () => {
    try {
      // This would normally fetch from your API
      // For now, we'll start with an empty array - no placeholder games
      setPlatformGames([])
    } catch (error) {
      console.error('Failed to fetch platform games:', error)
    }
  }

  // Fetch games on component mount
  React.useEffect(() => {
    fetchPlatformGames()
    fetchSavedGames()
  }, [])

  const fetchSavedGames = async () => {
    try {
      // For local development, use localStorage
      const savedGames = localStorage.getItem('coinflip-games')
      if (savedGames) {
        const games = JSON.parse(savedGames)
        setUserGames(games)
      }
    } catch (error) {
      console.error('Failed to fetch saved games:', error)
    }
  }

  const clearAllGames = () => {
    // Clear localStorage
    localStorage.removeItem('coinflip-games')
    
    // Clear state
    setUserGames([])
    setPlatformGames([])
    
    console.log('All games cleared - starting fresh!')
  }


  const saveGame = async (game: any) => {
    try {
      // For local development, use localStorage
      const existingGames = localStorage.getItem('coinflip-games')
      const games = existingGames ? JSON.parse(existingGames) : []
      
      // Update existing game or add new one
      const existingIndex = games.findIndex(g => g.id === game.id)
      if (existingIndex >= 0) {
        // Update existing game
        games[existingIndex] = game
      } else {
        // Add new game
        games.unshift(game)
      }
      
      // Keep only last 50 games
      const updatedGames = games.slice(0, 50)
      localStorage.setItem('coinflip-games', JSON.stringify(updatedGames))
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }

  const createGame = async () => {
    try {
      // Validate wager before proceeding
      if (wager < 0.001) {
        alert('Minimum wager is 0.001 SOL')
        return
      }

      // Generate new game ID for each new game
      const newGameId = Math.floor(Math.random() * 1000000)
      setGameId(newGameId)

      if (currency === 'SOL') {
        // For SOL games, trigger payment FIRST, then show modal after payment
        const wagerInLamports = Math.floor(wager * 1_000_000_000)
        
        console.log('Starting SOL transaction for new game:', { wager, side, currency, wagerInLamports })
        
        // Trigger the actual Gamba transaction FIRST
      await game.play({
        bet: SIDES[side],
          wager: wagerInLamports,
          metadata: [side, currency],
        })

        console.log('SOL transaction completed, creating game...')

        // AFTER payment, create the game and show modal
        const newGame = {
          id: newGameId,
          player1: { name: 'You', level: 1, avatar: 'Y', side: side },
          player2: null,
          amount: wager,
          currency: currency,
          status: 'waiting',
          timestamp: Date.now(),
          userAddress: publicKey?.toString()
        }
        
        setUserGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to local state
        saveGame(newGame) // Save to database
        setPlatformGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to platform games
        
        // NOW show the modal after payment
        setShowTransactionModal(true)
        setGameState('waiting')
        
        console.log('Game created and paid for, ready for Call Bot:', { side, wager, newGameId, currency })
        
      } else {
        // For FAKE games, no payment needed, just create and show modal
        const newGame = {
          id: newGameId,
          player1: { name: 'You', level: 1, avatar: 'Y', side: side },
          player2: null,
          amount: wager,
          currency: currency,
          status: 'waiting',
          timestamp: Date.now(),
          userAddress: publicKey?.toString()
        }
        
        setUserGames(prev => [newGame, ...prev.slice(0, 9)]) // Add to local state
        saveGame(newGame) // Save to database
        
        // Show modal for FAKE games
        setShowTransactionModal(true)
        setGameState('waiting')
        
        console.log('FAKE game created, ready for Call Bot:', { side, wager, newGameId, currency })
      }
      
    } catch (error) {
      console.error('Game creation failed:', error)
      setShowTransactionModal(false)
      setGameState('waiting')
      setIsSpinning(false)
    }
  }

  const callBot = async () => {
    try {
        console.log('Call Bot clicked:', { currency, wager, side, sideType: typeof side, sideValue: side })
      
      setGameState('playing')
      setIsSpinning(true)
      
      sounds.play('coin', { playbackRate: .5 })

      // No timeout needed - let the game flow naturally

      if (currency === 'SOL') {
        // For SOL games, use a simple random result since the payment already happened
        console.log('Processing SOL game with random result:', { wager, side, currency })
        
        try {
          // Use a deterministic random result based on game ID for fairness
          const randomSeed = gameId + Date.now()
          const coinResult = (randomSeed % 2) === 0 ? 'heads' : 'tails'
          const win = coinResult === side // You win if the coin matches your selection
          
          console.log('SOL game result:', { 
            coinResult, 
            yourSelection: side, 
            win, 
        wager,
            randomSeed,
            comparison: `${coinResult} === ${side} = ${coinResult === side}`
      })

          // Add spinning delay for animation
          setTimeout(() => {
      sounds.play('coin')

            setGameState('completed')
            setIsSpinning(false)

            // Update the game in the list
            const updatedGame = {
              id: gameId,
              player1: { name: 'You', level: 1, avatar: 'Y', side: side },
              player2: { name: 'Bot', level: 999, avatar: 'B', side: side === 'heads' ? 'tails' : 'heads' },
              amount: wager,
              currency: currency,
              status: 'completed',
              result: win ? 'win' : 'lose',
              coinResult: coinResult, // Add the actual coin result
              timestamp: Date.now(),
              userAddress: publicKey?.toString()
            }
            
            setUserGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            setPlatformGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            saveGame(updatedGame) // Save to database
            
            // Force UI update
            setForceUpdate(prev => prev + 1)
            
            // Reset Gamba state to fix stuck "Creating..." button
            setTimeout(() => {
              // Force a re-render to reset gamba.isPlaying state
              window.dispatchEvent(new Event('gamba-reset'))
            }, 100)

      if (win) {
        sounds.play('win')
      } else {
        sounds.play('lose')
      }
          }, 2000) // 2 second spin animation
          
        } catch (error) {
          console.error('SOL transaction failed:', error)
          
          // Handle transaction timeout/expiration
          setTimeout(() => {
            sounds.play('coin')
            
            setGameState('completed')
            setIsSpinning(false)
            
            // Mark as failed/lost due to transaction error
            const updatedGame = {
              id: gameId,
              player1: { name: 'You', level: 1, avatar: 'Y', side: side },
              player2: { name: 'Bot', level: 999, avatar: 'B', side: side === 'heads' ? 'tails' : 'heads' },
              amount: wager,
              currency: currency,
              status: 'completed',
              result: 'lose', // Mark as lose due to transaction failure
              timestamp: Date.now(),
              userAddress: publicKey?.toString()
            }
            
            setUserGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            setPlatformGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            saveGame(updatedGame)
            
            // Force UI update
            setForceUpdate(prev => prev + 1)
            
            sounds.play('lose')
          }, 2000)
        }
        
      } else {
        // For FAKE tokens, use a simple random result (no real transaction)
        setTimeout(() => {
          // Use a deterministic random result based on game ID for fairness
          const randomSeed = gameId + Date.now()
          const coinResult = (randomSeed % 2) === 0 ? 'heads' : 'tails'
          const win = coinResult === side // You win if the coin matches your selection
          
                console.log('FAKE game result:', { 
                  coinResult, 
                  yourSelection: side, 
                  win, 
                  wager, 
                  randomSeed,
                  comparison: `${coinResult} === ${side} = ${coinResult === side}`
                })
          
          sounds.play('coin')

          setGameState('completed')
          setIsSpinning(false)

          // Update the game in the list
          const updatedGame = {
            id: gameId,
            player1: { name: 'You', level: 1, avatar: 'Y', side: side },
            player2: { name: 'Bot', level: 999, avatar: 'B', side: side === 'heads' ? 'tails' : 'heads' },
            amount: wager,
            currency: currency,
            status: 'completed',
            result: win ? 'win' : 'lose',
            coinResult: coinResult, // Add the actual coin result
            timestamp: Date.now(),
            userAddress: publicKey?.toString()
          }
          
          setUserGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          setPlatformGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          saveGame(updatedGame) // Save to database
          
                // Force UI update
                setForceUpdate(prev => prev + 1)
                
                // Reset Gamba state to fix stuck "Creating..." button
                setTimeout(() => {
                  // Force a re-render to reset gamba.isPlaying state
                  window.dispatchEvent(new Event('gamba-reset'))
                }, 100)

                if (win) {
                  sounds.play('win')
                } else {
                  sounds.play('lose')
                }
        }, 2000) // 2 second spin animation
      }
      
    } catch (error) {
      console.error('Bot game failed:', error)
      setGameState('waiting')
      setIsSpinning(false)
    }
  }


  const joinGame = async (gameId: number) => {
    try {
      // Find the game to join
      const gameToJoin = userGames.find(game => game.id === gameId) || 
                        platformGames.find(game => game.id === gameId)
      
      if (!gameToJoin) {
        console.error('Game not found')
        return
      }

      // Prevent joining your own game
      if (gameToJoin.player1.name === 'You') {
        alert('You cannot join your own game. Click "Resume" to reopen your game.')
        return
      }

      // Set up the game for joining
      setWager(gameToJoin.amount)
      setSide(gameToJoin.player1.side === 'heads' ? 'tails' : 'heads') // Opposite side
      setCurrency(gameToJoin.currency) // Use the same currency as the game
      setGameId(gameId)
      
      // Show modal for joining
      setShowTransactionModal(true)
      setGameState('joining')
      
      console.log('Joining game:', { gameId, amount: gameToJoin.amount, side: gameToJoin.player1.side === 'heads' ? 'tails' : 'heads' })
      
    } catch (error) {
      console.error('Failed to join game:', error)
    }
  }

  const confirmJoin = async () => {
    try {
      setGameState('playing')
      setIsSpinning(true)
      
      sounds.play('coin', { playbackRate: .5 })

      if (currency === 'FAKE') {
        // For FAKE tokens, use a simple random result (no real transaction)
        // Add spinning delay for animation
        setTimeout(() => {
          // Use a deterministic random result based on game ID for fairness
          const randomSeed = gameId + Date.now()
          const coinResult = (randomSeed % 2) === 0 ? 'heads' : 'tails'
          const win = coinResult === side // You win if the coin matches your selection
          
          console.log('Join game result (FAKE):', { 
            coinResult, 
            yourSelection: side, 
            win, 
            wager, 
            randomSeed,
            comparison: `${coinResult} === ${side} = ${coinResult === side}`
          })
          
          sounds.play('coin')

          setGameState('completed')
          setIsSpinning(false)

          // Update the game in user's games list
          const updatedGame = {
            id: gameId,
            player1: { name: 'You', level: 1, avatar: 'Y', side: side },
            player2: { name: 'You', level: 1, avatar: 'Y', side: side },
            amount: wager,
            currency: currency,
            status: 'completed' as const,
            result: win ? 'win' as const : 'lose' as const,
            timestamp: Date.now(),
            userAddress: publicKey?.toString()
          }
          
          setUserGames(prev => prev.map(game => 
            game.id === gameId ? updatedGame : game
          ))
          
          // Save the updated game to database
          saveGame(updatedGame)
          
          // Reset Gamba state to fix stuck "Creating..." button
          setTimeout(() => {
            // Force a re-render to reset gamba.isPlaying state
            window.dispatchEvent(new Event('gamba-reset'))
          }, 100)

          if (win) {
            sounds.play('win')
          } else {
            sounds.play('lose')
          }
        }, 2000) // 2 second spin animation
      } else {
        // For SOL tokens, use real Gamba transaction
        const wagerInLamports = Math.floor(wager * 1_000_000_000)
        
        // Trigger the actual Gamba transaction
        await game.play({
          bet: SIDES[side],
          wager: wagerInLamports,
          metadata: [side, currency],
        })

        // Add spinning delay for animation
        setTimeout(() => {
          // Get the result after spinning
          game.result().then((result: any) => {
            const win = result.payout > wagerInLamports
            
            console.log('Join game result (SOL):', { result, win, payout: result.payout, wager: wagerInLamports })
            
            sounds.play('coin')

            setGameState('completed')
            setIsSpinning(false)

            // Update the game in user's games list
            const updatedGame = {
              id: gameId,
              player1: { name: 'You', level: 1, avatar: 'Y', side: side },
              player2: { name: 'You', level: 1, avatar: 'Y', side: side },
              amount: wager,
              currency: currency,
              status: 'completed' as const,
              result: win ? 'win' as const : 'lose' as const,
              timestamp: Date.now(),
              transactionHash: result?.transactionSignature,
              userAddress: publicKey?.toString()
            }
            
            setUserGames(prev => prev.map(game => 
              game.id === gameId ? updatedGame : game
            ))
            
            // Save the updated game to database
            saveGame(updatedGame)

            if (win) {
              sounds.play('win')
            } else {
              sounds.play('lose')
            }
          })
        }, 2000) // 2 second spin animation
      }
      
    } catch (error) {
      console.error('Game failed:', error)
      setGameState('joining')
      setIsSpinning(false)
    }
  }

  const closeModal = () => {
    setShowTransactionModal(false)
    setGameState('waiting')
    setIsSpinning(false)
  }

  const viewGame = (gameEntry: any) => {
    setSelectedGameForView(gameEntry)
    setShowGameViewModal(true)
  }

  const closeGameViewModal = () => {
    setShowGameViewModal(false)
    setSelectedGameForView(null)
  }


  return (
      <GambaUi.Portal target="screen">
      <GameContainer>
        <GameCreationSection>
          <GameControls>
            <GameHeader>
              <GameSubtitle>Pick a side and flip</GameSubtitle>
              <GameTitle>Coinflip</GameTitle>
            </GameHeader>

            <BetAmountSection>
              <BetLabel>
                Bet Amount {currency === 'SOL' ? `(~$${usdAmount.toFixed(2)})` : `(${currency})`}
              </BetLabel>
              <BetInputWrapper>
                <BetInput
                  type="number"
                  defaultValue=""
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setWager(isNaN(value) ? 0 : value);
                  }}
                  placeholder="0.01"
                  step="0.001"
                  min="0"
                />
                <CurrencyDropdown value={currency} onChange={(e) => setCurrency(e.target.value as 'SOL' | 'FAKE')}>
                  <option value="SOL">SOL</option>
                  <option value="FAKE">FAKE</option>
                </CurrencyDropdown>
                {currency === 'SOL' && <USDTooltip>≈ ${usdAmount.toFixed(2)}</USDTooltip>}
              </BetInputWrapper>
            </BetAmountSection>

            <QuickBetButtons>
              <QuickBetButtonContainer>
                <QuickBetButton onClick={() => setWager(w => w + 0.1)}>
                  +0.1
                </QuickBetButton>
              </QuickBetButtonContainer>
              <QuickBetButtonContainer>
                <QuickBetButton onClick={() => setWager(w => w + 1)}>
                  +1
                </QuickBetButton>
              </QuickBetButtonContainer>
            </QuickBetButtons>

            <ChooseSideSection>
              <BetLabel>Choose Side</BetLabel>
              <SideButtons>
                <SideButton selected={side === 'heads'} onClick={() => setSide('heads')}>
                  <img src={HEADS_IMAGE} alt="Heads" />
                </SideButton>
                <SideButton selected={side === 'tails'} onClick={() => setSide('tails')}>
                  <img src={TAILS_IMAGE} alt="Tails" />
                </SideButton>
              </SideButtons>
            </ChooseSideSection>

            <CreateGameButton onClick={createGame} disabled={gamba.isPlaying}>
              {gamba.isPlaying ? 'Creating...' : 'Create Game'}
            </CreateGameButton>
          </GameControls>
        </GameCreationSection>

        <GameListSection>
          <GameListHeader>
            <AllGamesTitle>ALL GAMES {userGames.length + platformGames.length}</AllGamesTitle>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <SortDropdown>
                <option>Sort By: Highest Price</option>
                <option>Sort By: Lowest Price</option>
              </SortDropdown>
            </div>
          </GameListHeader>
          <GameEntries>
            {/* Combine and sort all games - active games first, then last 20 finished games */}
            {(() => {
              // Combine games but remove duplicates by ID
              const allGames = [...userGames, ...platformGames]
              const uniqueGames = allGames.reduce((acc, game) => {
                const existing = acc.find(g => g.id === game.id)
                if (!existing) {
                  acc.push(game)
                } else {
                  // Update existing game with newer data
                  const index = acc.findIndex(g => g.id === game.id)
                  acc[index] = game
                }
                return acc
              }, [])
              
              // Force re-render when forceUpdate changes
              const _ = forceUpdate
              
              const activeGames = uniqueGames.filter(game => 
                (game.status === 'waiting' || game.status === 'in-play') && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              
              const finishedGames = uniqueGames.filter(game => 
                game.status === 'completed' && 
                game.currency === 'SOL' // Only show SOL games on main page
              ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 20) // Last 20 finished games
              
              return [...activeGames, ...finishedGames]
            })()
              .map((gameEntry) => {
                // Determine winner/loser for completed games
                const isCompleted = gameEntry.status === 'completed'
                const player1Won = isCompleted && gameEntry.result === 'win'
                const player2Won = isCompleted && gameEntry.result === 'lose'
                
                return (
                  <GameEntry 
                    key={`${gameEntry.id}-${gameEntry.timestamp}`}
                    $isActive={gameEntry.status === 'waiting' || gameEntry.status === 'in-play'}
                    $isCompleted={gameEntry.status === 'completed'}
                  >
                    <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', width: '100%' }}>
                      {/* Left side - Players with VS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 auto', minWidth: '300px' }}>
                        <PlayerInfo>
                          <PlayerAvatar 
                            $isWinner={isCompleted && player1Won} 
                            $isLoser={isCompleted && !player1Won}
                          >
                            {gameEntry.player1.avatar}
                            {isCompleted && player1Won && (
                              <WinnerCoinIcon>
                              <img 
                                src={gameEntry.player1.side === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                alt={gameEntry.player1.side} 
                              />
                              </WinnerCoinIcon>
                            )}
                          </PlayerAvatar>
                          <PlayerName>{gameEntry.player1.name}</PlayerName>
                          <PlayerLevel>{gameEntry.player1.level}</PlayerLevel>
                        </PlayerInfo>
                        
                        <VsIcon src="/002-weapon.png" alt="VS" />
                        
                        {gameEntry.player2 ? (
                          <PlayerInfo>
                            <PlayerAvatar 
                              $isWinner={isCompleted && player2Won} 
                              $isLoser={isCompleted && !player2Won}
                            >
                              {gameEntry.player2.avatar}
                              {isCompleted && player2Won && (
                                <WinnerCoinIcon>
                                <img 
                                  src={gameEntry.player2.side === 'heads' ? HEADS_IMAGE : TAILS_IMAGE} 
                                  alt={gameEntry.player2.side} 
                                />
                                </WinnerCoinIcon>
                              )}
                            </PlayerAvatar>
                            <PlayerName>{gameEntry.player2.name}</PlayerName>
                            <PlayerLevel>{gameEntry.player2.level}</PlayerLevel>
                          </PlayerInfo>
                        ) : (
                          <PlayerInfo>
                            <PlayerAvatar>?</PlayerAvatar>
                            <PlayerName>Waiting...</PlayerName>
                          </PlayerInfo>
                        )}
                      </div>
                      
                      {/* Center - Bet Amount */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <BetAmountDisplay>{gameEntry.amount} {gameEntry.currency || 'SOL'}</BetAmountDisplay>
                      </div>
                      
                      {/* Right side - Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                        {gameEntry.status === 'waiting' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {gameEntry.player1.name === 'You' ? (
                              // If you own the game, show "Resume" button to reopen your game
                              <JoinButton 
                                onClick={() => {
                                  // Reopen your own game modal - NO PAYMENT NEEDED
                                  setWager(gameEntry.amount)
                                  setSide(gameEntry.player1.side)
                                  setCurrency(gameEntry.currency)
                                  setGameId(gameEntry.id)
                                  setShowTransactionModal(true)
                                  setGameState('waiting') // Already paid, just waiting for bot/player
                                  
                                  // Clear any old transaction state
                                  console.log('Resuming game - ready for Call Bot')
                                }}
                                style={{ background: '#42ff78', color: 'black' }}
                              >
                                Resume
                              </JoinButton>
                            ) : (
                              // If you don't own the game, show "Join" button
                              <JoinButton onClick={() => joinGame(gameEntry.id)}>Join</JoinButton>
                            )}
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="Watch Live" />
                            </ViewGameButton>
                          </div>
                        ) : gameEntry.status === 'completed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <WinningAmount>
                              <div className="amount">
                                {gameEntry.result === 'win' ? `+${(gameEntry.amount * 2).toFixed(4)}` : `-${gameEntry.amount.toFixed(4)}`}
                              </div>
                              <div className="label">
                                {gameEntry.result === 'win' ? 'WON' : 'LOST'}
                              </div>
                            </WinningAmount>
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="View Game" />
                            </ViewGameButton>
                          </div>
                        ) : gameEntry.status === 'in-play' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ViewGameButton onClick={() => viewGame(gameEntry)}>
                              <img src="/001-view.png" alt="Watch Live" />
                            </ViewGameButton>
                          </div>
                        ) : (
                          <ViewGameButton onClick={() => viewGame(gameEntry)}>
                            <img src="/001-view.png" alt="View Game" />
                          </ViewGameButton>
                        )}
                      </div>
                    </div>
                  </GameEntry>
                )
              })}
          </GameEntries>
        </GameListSection>
      </GameContainer>

      {/* Game View Modal */}
      {showGameViewModal && selectedGameForView && (
        <GameViewModal
          gameId={selectedGameForView.id}
          gameData={selectedGameForView}
          onClose={closeGameViewModal}
        />
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <ModalOverlay onClick={closeModal}>
          <TransactionModal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>COINFLIP #{gameId}</ModalTitle>
            
            <GameInterface>
              <PlayersRow>
                <PlayerSlot>
                  <PlayerAvatarModal>
                    <PlayerNumber>1</PlayerNumber>
                    👤
                  </PlayerAvatarModal>
                  <PlayerInfoModal>
                    <PlayerNameModal>You</PlayerNameModal>
                    <BetAmountModal>{currency === 'SOL' ? 'Ξ' : 'FAKE'} {wager}</BetAmountModal>
                  </PlayerInfoModal>
                </PlayerSlot>

                <CoinContainer>
        <Canvas
          linear
          flat
          orthographic
          camera={{
            zoom: 80,
            position: [0, 0, 100],
          }}
        >
          <React.Suspense fallback={null}>
                      <Coin result={0} flipping={isSpinning} />
          </React.Suspense>
          <Effect color="white" />
                    {isSpinning && <Effect color="white" />}
          <ambientLight intensity={3} />
          <directionalLight
            position-z={1}
            position-y={1}
            castShadow
            color="#CCCCCC"
          />
          <hemisphereLight
            intensity={.5}
            position={[0, 1, 0]}
            scale={[1, 1, 1]}
            color="#ffadad"
            groundColor="#6666fe"
          />
        </Canvas>
                </CoinContainer>

                <PlayerSlot isWaiting={gameState === 'waiting'}>
                  <PlayerAvatarModal isBot={true}>
                    <PlayerNumber>2</PlayerNumber>
                    🤖
                  </PlayerAvatarModal>
                  <PlayerInfoModal>
                    <PlayerNameModal>
                      {gameState === 'waiting' ? 'Waiting...' : 'Bot'}
                    </PlayerNameModal>
                    <BetAmountModal>{currency === 'SOL' ? 'Ξ' : 'FAKE'} {gameState === 'waiting' ? '0' : wager}</BetAmountModal>
                  </PlayerInfoModal>
                </PlayerSlot>
              </PlayersRow>

               <GameActions>
                 {gameState === 'waiting' && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                     <div style={{ textAlign: 'center', padding: '10px', background: '#1a1a1a', borderRadius: '8px', marginBottom: '10px' }}>
                       <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#42ff78' }}>
                         Game Ready
          </div>
                       <div style={{ fontSize: '14px', color: '#888' }}>
                         You've already paid {wager} {currency}. Ready to play!
                       </div>
                     </div>
                     <button
                       onClick={() => {
                         console.log('Call Bot button clicked:', { gambaIsPlaying: gamba.isPlaying, gameState, currency })
                         callBot()
                       }}
                       disabled={false}
                       style={{
                         background: '#6741ff',
                         border: 'none',
                         borderRadius: '12px',
                         padding: '1rem 2rem',
                         color: 'white',
                         fontSize: '1.125rem',
                         fontWeight: '700',
                         fontFamily: 'Flama, sans-serif',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease',
                         width: '100%'
                       }}
                     >
                       {gamba.isPlaying ? 'Calling Bot...' : 'Call Bot'}
                     </button>
                     <div style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
                       Or wait for another player to join
                     </div>
                   </div>
                 )}
                
                {gameState === 'joining' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '10px', background: '#1a1a1a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                        Join Game
                      </div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        Pay {wager} {currency} to join this coinflip
                      </div>
                    </div>
                    <button
                      onClick={confirmJoin}
                      disabled={gamba.isPlaying}
                      style={{
                        background: '#42ff78',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        color: 'black',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        fontFamily: 'Flama, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      {gamba.isPlaying ? 'Joining...' : 'Join & Pay'}
                    </button>
                  </div>
                )}
                
                {gameState === 'playing' && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {isSpinning ? 'Spinning...' : 'Processing...'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#888' }}>
                      Please wait while the game processes
                    </div>
                  </div>
                )}
                
                {gameState === 'completed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                        Game Complete!
                      </div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        Check your recent games to see the result
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      style={{
                        background: '#42ff78',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        color: 'black',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        fontFamily: 'Flama, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </GameActions>

              <GameInfo>
                <InfoText>HASHED SEED: {hashedSeed}</InfoText>
                <InfoText>SECRET: {gameState === 'waiting' ? 'Waiting...' : 'Revealed'}</InfoText>
                <ShareButton>Share</ShareButton>
              </GameInfo>
            </GameInterface>
          </TransactionModal>
        </ModalOverlay>
      )}
      </GambaUi.Portal>
  )
}

export default Flip
