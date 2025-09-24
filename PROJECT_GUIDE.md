# Solbet Project Guide

## Overview
Solbet is a Solana-based gambling platform built with React, TypeScript, and the Gamba framework. It features multiple casino games, wallet integration, and a modern UI.

## Project Structure

### Core Files

#### `src/index.tsx`
- **Purpose**: Main entry point and app configuration
- **What it does**: 
  - Sets up Solana wallet providers (Phantom, Solflare)
  - Configures Gamba platform providers
  - Renders the main App component
- **Key providers**: WalletProvider, WalletModalProvider, GambaProvider

#### `src/App.tsx`
- **Purpose**: Main application component and routing
- **What it does**:
  - Defines all routes for different games and pages
  - Handles navigation between games (jackpot, flip, affiliates, etc.)
  - Contains error boundaries and scroll-to-top functionality

#### `src/constants.ts`
- **Purpose**: Application configuration and constants
- **What it contains**:
  - RPC endpoints
  - Platform creator addresses and fees
  - Token metadata
  - Game configurations

### Styling Files

#### `src/styles.css`
- **Purpose**: Global CSS styles and wallet modal overrides
- **What it does**:
  - Sets global font family (Flama)
  - Overrides Solana wallet adapter modal styling
  - Defines custom CSS variables for theming
  - **IMPORTANT**: Contains wallet modal styling (385x600px, gradient borders)

#### `src/styles.ts`
- **Purpose**: Styled-components for layout
- **What it contains**:
  - MainWrapper: Main content container with responsive margins
  - TosWrapper: Terms of service styling
  - Responsive breakpoints and spacing

### Components

#### `src/components/`
- **Modal.tsx**: Reusable modal component for dialogs
- **Dropdown.tsx**: Dropdown UI component
- **Icon.tsx**: Icon component with various icon types
- **Slider.tsx**: Slider input component
- **TrollBox.tsx**: Chat/messaging component
- **index.tsx**: Component exports

### Sections (Main UI Components)

#### `src/sections/Header.tsx`
- **Purpose**: Main navigation header
- **What it contains**:
  - Top strip with social links (X, Discord)
  - Logo section with SOLBET branding
  - Navigation menu (Jackpot, Coinflip, Affiliates)
  - User button and token selector
  - **Key styled components**: TopStrip, MainHeader, LogoSection, Navigation, SocialButton

#### `src/sections/UserButton.tsx`
- **Purpose**: Wallet connection and user management
- **What it does**:
  - Renders "Connect" button when wallet not connected
  - Shows wallet info when connected
  - Handles wallet modal opening
  - **Key styled components**: ConnectButtonContainer, CustomConnectButton
  - **Custom styling**: Purple gradient button matching Solpot design

#### `src/sections/Dashboard/`
- **Dashboard.tsx**: Main dashboard page
- **WelcomeBanner.tsx**: Welcome message component
- **GameCard.tsx**: Individual game card component
- **FeaturedInlineGame.tsx**: Featured game display

#### `src/sections/Game/`
- **Game.tsx**: Game wrapper component
- **Game.styles.ts**: Game-specific styling
- **LoadingBar.tsx**: Loading indicator
- **ProvablyFairModal.tsx**: Fairness verification modal
- **TransactionModal.tsx**: Transaction status modal

#### `src/sections/RecentPlays/`
- **RecentPlays.tsx**: Recent games history
- **RecentPlays.styles.ts**: Styling for recent plays
- **ShareModal.tsx**: Share game results modal
- **useRecentPlays.ts**: Hook for fetching recent plays data

#### `src/sections/LeaderBoard/`
- **LeaderboardsModal.tsx**: Leaderboard popup
- **LeaderboardsModal.styles.ts**: Leaderboard styling

#### `src/sections/TokenSelect.tsx`
- **Purpose**: Token selection dropdown
- **What it does**: Allows users to select different tokens for betting

### Games

#### `src/games/`
Each game is a self-contained module with its own:
- **index.tsx**: Main game component
- **styles.ts**: Game-specific styling
- **constants.ts**: Game configuration
- **Audio files**: Sound effects (play.mp3, win.mp3, lose.mp3, etc.)

#### Game Types:
1. **Jackpot**: Multi-player jackpot game with coinfall animation
2. **Flip**: Coin flip game with 3D coin animation
3. **CrashGame**: Crash betting game with rocket animation
4. **Dice**: Dice rolling game
5. **Mines**: Minesweeper-style game
6. **Roulette**: Roulette wheel game
7. **Slots**: Slot machine game
8. **BlackJack**: Blackjack card game
9. **HiLo**: High/Low card game
10. **Plinko**: Ball drop game
11. **PlinkoRace**: Multi-player Plinko racing game

### Hooks

#### `src/hooks/`
- **useMediaQuery.ts**: Responsive breakpoint detection
- **useOnClickOutside.ts**: Click outside detection
- **useToast.ts**: Toast notification system
- **useUserStore.ts**: User state management
- **useLeaderboardData.ts**: Leaderboard data fetching

### Utils

#### `src/utils.ts`
- **Purpose**: Utility functions
- **What it contains**: Helper functions like string truncation

## Key Styling Information

### Wallet Modal Styling
The wallet modal is styled in `src/styles.css` with these key classes:
- `.wallet-adapter-modal-wrapper`: 385x600px container with gradient border
- `.wallet-adapter-modal-container`: Inner content area with dark background
- `.wallet-adapter-modal-title`: Title styling (Airstrike font, 2.25rem)

### Responsive Design
- Mobile: Logo section hidden, navigation collapsed
- Desktop (1024px+): Full header with logo section (350px wide)
- Large screens (1920px+): Optimized spacing

### Color Scheme
- Primary purple: #6741FF
- Background: #141414
- Dark containers: #1D1D1D, #2D2D2D
- Text: #FFFFFF, #A2A2A2, #BFBFCD

## File Responsibilities Summary

| File | Purpose | What it edits |
|------|---------|---------------|
| `src/styles.css` | Global styles + wallet modal | All UI styling, wallet modal appearance |
| `src/sections/Header.tsx` | Navigation header | Top bar, logo, navigation menu, social buttons |
| `src/sections/UserButton.tsx` | Wallet connection | Connect button styling, user modal |
| `src/styles.ts` | Layout components | Main wrapper, responsive margins |
| `src/index.tsx` | App setup | Wallet providers, app configuration |
| `src/App.tsx` | Routing | Page navigation, route definitions |
| `src/constants.ts` | Configuration | RPC endpoints, fees, token metadata |
| `src/games/*/index.tsx` | Individual games | Game logic, UI, betting mechanics |

## Common Tasks

### To change wallet modal appearance:
Edit `src/styles.css` - target `.wallet-adapter-modal-*` classes

### To modify header/navigation:
Edit `src/sections/Header.tsx` - modify styled components

### To change connect button:
Edit `src/sections/UserButton.tsx` - modify `CustomConnectButton` styling

### To add new games:
Create new folder in `src/games/` with index.tsx, styles.ts, constants.ts

### To modify global styling:
Edit `src/styles.css` for CSS or `src/styles.ts` for styled-components

### To change app configuration:
Edit `src/constants.ts` for settings, `src/index.tsx` for providers
