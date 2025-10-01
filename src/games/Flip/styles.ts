import styled from 'styled-components'

export const GameListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
`

export const AllGamesTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #aaa;
  margin: 0;
  font-family: 'Flama', sans-serif;
  text-transform: uppercase;
`

export const SortControls = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`

export const SortByLabel = styled.span`
  color: #aaa;
  text-transform: uppercase;
  font-size: 0.875rem;
  font-weight: 600;
`

export const SortValue = styled.span`
  color: white;
  font-weight: 600;
`

export const SortDropdownContainer = styled.div`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  cursor: pointer;
  width: fit-content;
`

export const ArrowContainer = styled.div`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
`

export const SortDropdown = styled.div<{ $sortOrder: 'asc' | 'desc' }>`
  width: 12px;
  height: 12px;
  background-image: ${props => 
    props.$sortOrder === 'desc' 
      ? "url('/arrowdown.svg')" 
      : "url('/arrow up.svg')"
  };
  background-repeat: no-repeat;
  background-position: center;
  background-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`

export const DropdownOption = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  background: transparent;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &:hover {
    background: #2a2a2a;
  }
  
  &:active {
    background: transparent;
  }
`

export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: transparent;
  color: white;
  font-family: 'Flama', sans-serif;
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
  min-height: calc(100vh - 110px);
`

// Game Creation Section
export const GameCreationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`

export const GameHeader = styled.div`
  text-align: left;
  margin-right: 3rem;
`

export const GameSubtitle = styled.p`
  font-size: 1rem;
  color: #aaa;
  margin: -1.5rem 0 0 0;
  font-family: 'Flama', sans-serif;
  font-weight: 500;
  padding-left: 0.5rem;
`

export const GameTitle = styled.h1`
  font-family: 'Airstrike', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: white;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`

export const GameControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
`

export const RightSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
`

export const BetAndButtonsGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`

export const BetInputAndButtons = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
`

export const CoinsAndCreateGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
`

export const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const BetAmountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-end;
`

export const BetLabel = styled.label`
  font-size: 0.75rem;
  color: #ccc;
  font-weight: 600;
  font-family: 'Flama', sans-serif;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.125rem;
  margin-top: -0.25rem;
  margin-left: 0.5rem;
`

export const SolPriceDisplay = styled.div`
  font-size: 0.75rem;
  color: #ccc;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  position: absolute;
  top: -1.25rem;
  right: 0.5rem;
`

export const SolanaIcon = styled.img`
  width: 16px;
  height: 16px;
`

export const BetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #3a3a3a;
  position: relative;
  gap: 0.5rem;
  height: 44px;
  min-width: 200px;
`

export const BetInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  outline: none;
  width: 120px;
  
  /* Remove number input arrows */
  -moz-appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &::placeholder {
    color: #666;
  }
`

export const CustomBetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(30, 20, 50, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 0.25px solid rgba(147, 51, 234, 0.6);
  height: 44px;
  min-width: 200px;
  position: relative;
`

export const CustomBetInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  font-weight: 600;
  outline: none;
  
  /* Remove number input arrows */
  -moz-appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &::placeholder {
    color: white;
    font-weight: 700;
    font-size: 1rem;
  }
  
  &:focus {
    outline: none;
  }
`

export const SolanaIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-right: 1px solid #3a3a3a;
`

export const MultiplierButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
`

export const MultiplierButton = styled.button`
  background: rgb(48, 48, 48);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  font-family: 'Flama', sans-serif;
  font-weight: 600;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

export const CurrencyDropdown = styled.select`
  padding: 0.5rem 0.75rem;
  background: #3a3a3a;
  border: none;
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  outline: none;
  cursor: pointer;
`

export const USDTooltip = styled.div`
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

export const QuickBetButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-left: 0.25rem;
  margin-top: -5px;
  width: 132px;
  height: 44px;
`

export const QuickBetButtonContainer = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #1D1D1D;
  border-radius: 8px;
  padding: 0.125rem;
`

export const QuickBetButton = styled.button`
  height: 38px;
  width: 50px;
  padding: 0 0.5rem;
  background: rgb(48, 48, 48);
  color: white;
  border: none;
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
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transition: all 0.25s ease;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

export const ChooseSideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  padding: 0;
  margin: 0 0.5rem;
  align-self: flex-end;
`

export const SideButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: flex-end;
  padding: 0;
  margin: 0;
`

export const SideButton = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 44px;
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

export const CreateGameButton = styled.button`
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
  height: 44px;
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
export const GameListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  margin-left: -1rem;
  margin-right: -1rem;
  position: relative;
  z-index: 1;
  background: transparent;
  flex: 1;
`

export const GameEntries = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const GameEntry = styled.div<{ $isActive?: boolean; $isCompleted?: boolean }>`
  display: flex;
  align-items: center;
  background: ${props => 
    props.$isActive ? 'radial-gradient(circle at center, rgba(103, 65, 255, 0.3) 0%, #2a2a2a 70%)' :
    props.$isCompleted ? 'rgba(42, 42, 42, 0.7)' : 
    '#2a2a2a'
  };
  border: 1px solid ${props => 
    props.$isActive ? '#3a3a3a' :
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
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 0 3px #37373c,
    0 0 0 6px #22222d;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(1.01);
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

export const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const PlayerAvatar = styled.div<{ $isWinner?: boolean; $isLoser?: boolean; $isBot?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.$isLoser ? '#333' : (props.$isBot ? 'linear-gradient(135deg, #6741ff, #8b5cf6)' : '#555')};
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
  overflow: hidden;
`

export const PlayerName = styled.span`
  font-weight: 600;
  font-family: 'Flama', sans-serif;
`

export const PlayerLevel = styled.span`
  background: #6741ff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  font-family: 'Flama', sans-serif;
`

export const WinnerCoinIcon = styled.div`
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

export const VsIcon = styled.img`
  width: 24px;
  height: 24px;
  filter: brightness(0.8);
`

export const BetAmountDisplay = styled.span`
  font-weight: 700;
  color: #42ff78;
  font-family: 'Flama', sans-serif;
  text-align: center;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
`

export const JoinButton = styled.button`
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

export const StatusButton = styled.button<{ status: string }>`
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

export const EyeIcon = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-left: 0.5rem;
`

export const WinningAmount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #42ff78;
  font-family: 'Flama', sans-serif;
  text-align: center;
  min-width: 120px;
  margin-left: auto;
  
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

export const ViewGameButton = styled.button`
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
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 20, 20, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  box-sizing: border-box;
  opacity: 1;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`

// Parent div with gradient border
export const ModalParent = styled.div`
  position: relative;
  padding: 4px;
  border-radius: 1rem;
  background: linear-gradient(180deg, #221E3A 0%, #232325 100%);
  width: 100% !important;
  height: 552px !important;
  overflow: hidden;
  box-sizing: border-box;
  opacity: 1;
  transform: scale(1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Only responsive on very small screens */
  @media (max-width: 768px) {
    width: 95vw !important;
    height: 85vh !important;
    min-width: 300px;
    min-height: 300px;
  }
`

// Inner div with exact 4px difference
export const TransactionModal = styled.div`
  background: radial-gradient(57% 52% at 0% 0%, #5b3e8229, #0000), #1c1c1f;
  border-radius: 14px;
  padding: 1.5rem;
  width: 100% !important;
  height: 544px !important;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-weight: 700;
  
  /* Only responsive on very small screens */
  @media (max-width: 768px) {
    width: calc(95vw - 4px) !important;
    height: calc(85vh - 4px) !important;
    min-width: 296px;
    min-height: 296px;
    padding: 1.5rem;
  }
`

export const ModalTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  font-family: 'Airstrike', sans-serif;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`

export const GameInterface = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: visible;
  box-sizing: border-box;
  justify-content: space-between;
`

export const ModalHeader = styled.header`
  padding: 0.5rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 20px;
`

export const ModalMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
  min-height: 0;
  justify-content: center;
  align-items: center;
  overflow: visible;
  position: relative;
  background-image: url('/coinflip-grid-sW9YO0BH.webp');
  background-size: cover;
  background-position: bottom 20px;
  background-repeat: no-repeat;
`

export const ModalFooter = styled.footer`
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 20px;
`

export const CallBotButtonContainer = styled.div`
  background: linear-gradient(to bottom, #221e3a, #232325);
  padding: 2px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  min-width: 110px;
  width: fit-content;
  height: 52px;
`

export const CallBotButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: -4.5rem;
`

export const CallBotButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.75rem;
  min-height: 2.75rem;
  width: 100%;
  min-width: 2.5rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background-color: #6741FF;
  border: 1px solid #1D1D1D;
  border-radius: 10px;
  color: white;
  font-family: Flama, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: visible;
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
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PlayersRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`

// 3-column layout for the middle section
export const ThreeColumnLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  padding: 1rem 0;
  min-height: 180px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0.5rem 0;
    min-height: 140px;
  }
`

export const PlayerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  padding: 2rem 1.5rem;
`

export const CoinColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex: 1;
  min-width: 0;
  justify-content: center;
  padding-top: 1rem;
`

export const PlayerSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
`

export const PlayerSlot = styled.div<{ $isWaiting?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  opacity: ${props => props.$isWaiting ? 0.6 : 1};
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`

export const PlayerAvatarContainer = styled.div`
  background: #222222;
  padding: 3px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.3), 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 6px #37373c,
    0 0 0 12px #22222d;
`

export const PlayerAvatarModal = styled.div<{ $isBot?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: ${props => props.$isBot ? '#6741ff' : '#42ff78'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  position: relative;
  border: 2px solid ${props => props.$isBot ? '#8a6cff' : '#5ae66a'};
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
`

export const PlayerNumber = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  border: 2px solid #555;
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
`

export const PlayerInfoModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

export const NameLevelContainer = styled.div`
  width: 165px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
`

export const PlayerNameModal = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`

export const BetAmountModal = styled.span`
  color: #888;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`

export const BetAmountContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 91px;
  height: 40px;
  justify-content: center;
`

export const BetAmountText = styled.span`
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  font-weight: 600;
`

export const SolanaIconModal = styled.img`
  width: 16px;
  height: 16px;
`

export const CoinSideIndicator = styled.div`
  position: absolute;
  top: -16px;
  right: -16px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: none;
  box-shadow: none;
  overflow: hidden;
  flex-shrink: 0;
  flex-grow: 0;
`

export const CoinSideIcon = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  display: block;
  border: none;
  outline: none;
  box-shadow: none;
  background: transparent;
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  z-index: 1;
`

export const CoinContainer = styled.div`
  width: 160px;
  height: 160px;
  position: relative;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`

export const GameActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`

export const GameInfo = styled.div`
  padding: 0.25rem 1rem;
  width: 100%;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.75rem;
  }
`

export const InfoTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
`

export const InfoText = styled.p`
  color: #888;
  font-size: 0.625rem;
  margin: 0;
  font-family: 'Flama', sans-serif;
  word-break: break-all;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
  }
`

export const ShareButton = styled.button`
  height: 38px;
  padding: 0 0.75rem;
  background:rgb(48, 48, 48);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Flama', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: -0.5rem;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

// Game Result Modal Components
export const GameResultModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 20, 20, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  padding: 20px;
  box-sizing: border-box;
`

export const GameResultModalParent = styled.div`
  position: relative;
  padding: 4px;
  border-radius: 1rem;
  background: linear-gradient(180deg, #221E3A 0%, #232325 100%);
  width: 100%;
  height: 552px;
  overflow: hidden;
  box-sizing: border-box;
`

export const GameResultModal = styled.div`
  background: radial-gradient(57% 52% at 0% 0%, #5b3e8229, #0000), #1c1c1f;
  border-radius: 14px;
  padding: 1.5rem;
  width: 100%;
  height: 544px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-weight: 700;
`

export const GameResultHeader = styled.header`
  padding: 0.5rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 20px;
`

export const GameResultTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  font-family: 'Airstrike', sans-serif;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
`

export const GameResultMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
  min-height: 0;
  justify-content: center;
  align-items: center;
  overflow: visible;
  position: relative;
  background-image: url('/coinflip-grid-sW9YO0BH.webp');
  background-size: cover;
  background-position: bottom 20px;
  background-repeat: no-repeat;
`

export const GameResultThreeColumnLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  padding: 1rem 0;
  min-height: 180px;
  position: relative;
  z-index: 2;
`

export const GameResultPlayerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  padding: 2rem 1.5rem;
`

export const GameResultPlayerSlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
`

export const GameResultPlayerAvatarContainer = styled.div`
  background: #222222;
  padding: 3px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.3), 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 6px #37373c,
    0 0 0 12px #22222d;
`

export const GameResultPlayerAvatar = styled.div<{ $isWinner?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: ${props => props.$isWinner ? '#42ff78' : '#6741ff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  position: relative;
  border: 2px solid ${props => props.$isWinner ? '#5ae66a' : '#8a6cff'};
`

export const GameResultPlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

export const GameResultPlayerName = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

export const GameResultPlayerLevel = styled.span`
  color: #888;
  font-size: 0.75rem;
  font-family: 'Flama', sans-serif;
`

export const GameResultBetAmount = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 91px;
  height: 40px;
  justify-content: center;
`

export const GameResultBetAmountText = styled.span`
  color: white;
  font-size: 0.875rem;
  font-family: 'Flama', sans-serif;
  font-weight: 600;
`

export const GameResultWinningAmount = styled.div<{ $isWinner?: boolean }>`
  background: ${props => props.$isWinner ? '#42ff78' : 'transparent'};
  color: ${props => props.$isWinner ? 'black' : 'white'};
  border: 1px solid ${props => props.$isWinner ? '#5ae66a' : '#333'};
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 91px;
  height: 40px;
  justify-content: center;
  font-weight: 700;
`

export const GameResultCoinColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex: 1;
  min-width: 0;
  justify-content: center;
  padding-top: 1rem;
`

export const GameResultCoinContainer = styled.div`
  width: 160px;
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

export const GameResultCoinDisplay = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 4px solid #ffed4e;
`

export const GameResultWinnerText = styled.div`
  color: #42ff78;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Flama', sans-serif;
  text-align: center;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const GameResultFooter = styled.footer`
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 20px;
`

export const GameResultFairnessButton = styled.button`
  height: 38px;
  padding: 0 0.75rem;
  background: rgb(48, 48, 48);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Flama', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-shadow: rgba(0, 0, 0, 0.5) 0px 2px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: -0.5rem;
  box-shadow: 0 8px 5px #0000001f, inset 0 2px #ffffff12, inset 0 -2px #0000003d;
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

export const GameResultHashInfo = styled.div`
  padding: 0.25rem 1rem;
  width: 100%;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const GameResultHashText = styled.p`
  color: #888;
  font-size: 0.625rem;
  margin: 0;
  font-family: 'Flama', sans-serif;
  word-break: break-all;
  text-align: center;
`
