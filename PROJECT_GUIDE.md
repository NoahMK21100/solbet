# Solbet Project Guide

## Overview
Solbet is a Solana-based gambling platform built with React, TypeScript, and the Gamba framework. It features multiple casino games, wallet integration, and a modern UI. The platform is designed to be hosted on Vercel with Supabase as the backend database for user data management.

## Architecture

### Frontend (Vercel)
- **Framework**: React + TypeScript + Vite
- **Styling**: Styled-components + CSS
- **Wallet Integration**: Solana Wallet Adapter
- **Gaming**: Gamba Core V2
- **State Management**: React hooks + localStorage (temporary)

### Backend (Supabase)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for profile pictures)
- **API**: Supabase Edge Functions

### Current Issues & Migration Plan
The project currently uses localStorage for user data (username, level, avatar) which needs to be migrated to Supabase for proper multi-device support and data persistence.

## Project Structure

### Core Files

#### `src/index.tsx`
- **Purpose**: Application entry point and provider bootstrap
- **What it does**: 
  - Sets up Solana wallet providers (Phantom, Solflare) with autoConnect
  - Configures Gamba platform providers with creator fees and pools
  - Renders the main App component inside provider tree
- **Key providers**: ConnectionProvider, WalletProvider, WalletModalProvider, TokenMetaProvider, SendTransactionProvider, GambaProvider, GambaPlatformProvider

#### `src/App.tsx`
- **Purpose**: Main application component and routing
- **What it does**:
  - Defines all routes for different games and pages
  - Handles navigation between games and profile pages
  - Contains error boundaries and scroll-to-top functionality
  - Manages registration modal and ToS acceptance
  - Renders Header, Footer, ChatBox, and main content wrapper

#### `src/constants.ts`
- **Purpose**: Application configuration and constants
- **What it contains**:
  - RPC endpoints
  - Platform creator address and fees
  - SOL token configuration (SOL-only platform)
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
- **ChatBox.tsx**: Main chat sidebar component with live chat functionality
- **RegistrationModal.tsx**: User registration modal with Supabase database integration
- **ProfilePage.tsx**: Full-screen user profile page with tabbed navigation
- **ProfileDropdown.tsx**: Hamburger menu dropdown for profile navigation
- **BonusPage.tsx**: Bonus page component (coming soon)
- **StatisticsPage.tsx**: Statistics page component (coming soon)
- **TransactionsPage.tsx**: Transactions page component (coming soon)
- **index.tsx**: Component exports

### Sections (Main UI Components)

#### `src/sections/Header.tsx`
- **Purpose**: Main navigation header
- **What it contains**:
  - Top strip with social links (X, Discord)
  - Logo section with SOLBET branding
  - Navigation menu (Jackpot, Coinflip, Affiliates)
  - User button
  - **Key styled components**: TopStrip, MainHeader, LogoSection, Navigation, SocialButton

#### `src/sections/UserButton.tsx`
- **Purpose**: Wallet connection and user modal management
- **What it does**:
  - Renders "Connect" button when wallet not connected
  - Shows ProfileDropdown when connected (with user avatar and hamburger menu)
  - Handles wallet modal opening and profile navigation
  - Manages UserModal for referral management and disconnect
  - **Key styled components**: ConnectButtonContainer, CustomConnectButton
  - **Custom styling**: Purple gradient button matching Solbet design
  - **Integration**: Uses ProfileDropdown component for connected users, UserModal for referral management

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
- **Purpose**: Token display component (SOL-only platform)
- **What it does**: Shows SOL token information (no selection needed)

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
- **useSupabaseUser.ts**: Supabase user data management and database operations
- **useLeaderboardData.ts**: Leaderboard data fetching

### Utils

#### `src/utils.ts`
- **Purpose**: Essential utility functions
- **What it contains**: 
  - `truncateString`: String truncation helper
  - `extractMetadata`: Game metadata extraction from Gamba transactions
- **Note**: Removed localStorage-based user data functions (migrated to Supabase)

### API Endpoints

#### `api/`
- **register-user.ts**: Backend API for user registration with email verification
- **cloudflare-verify.ts**: Backend API for Cloudflare Turnstile verification
- **chat.ts**: Real-time chat functionality
- **coinflip-games.ts**: Coinflip game data and management
- **online-users.ts**: Online user tracking

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
| `src/sections/UserButton.tsx` | Wallet connection | Connect button styling, profile dropdown integration |
| `src/components/ProfilePage.tsx` | User profile page | Full-screen profile with tabs, edit functionality |
| `src/components/ProfileDropdown.tsx` | Profile navigation | Hamburger menu with profile links |
| `src/components/RegistrationModal.tsx` | User registration | Supabase-integrated signup form with database checks |
| `src/components/ChatBox.tsx` | Chat sidebar | Live chat, user messages, chat pot display |
| `src/styles.ts` | Layout components | Main wrapper, responsive margins |
| `src/index.tsx` | App setup | Wallet providers, app configuration |
| `src/App.tsx` | Routing | Page navigation, route definitions, registration flow, layout |
| `src/constants.ts` | Configuration | RPC endpoints, fees, SOL token config |
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

### To modify profile system:
Edit `src/components/ProfilePage.tsx` for main profile functionality
Edit `src/components/ProfileDropdown.tsx` for dropdown navigation

### To modify registration flow:
Edit `src/components/RegistrationModal.tsx` for signup form
Edit `src/App.tsx` for registration state management

### To modify chat functionality:
Edit `src/components/ChatBox.tsx` for chat sidebar
Edit `api/chat.ts` for backend chat logic

### To modify global styling:
Edit `src/styles.css` for CSS or `src/styles.ts` for styled-components

### To change app configuration:
Edit `src/constants.ts` for SOL token settings and fees, `src/index.tsx` for providers

## Troubleshooting Common Issues

### Coinflip "Trade Assertion Failed" Error:
**Problem**: Game shows "Transaction failed: Assertion failed" when trying to create a game
**Root Cause**: Incorrect wager conversion from SOL to lamports
**Solution**: 
- `GambaUi.WagerInput` already returns values in lamports (e.g., 10,000,000 = 0.01 SOL)
- Use `const wagerInLamports = wager` (NOT `Math.floor(wager * 1_000_000_000)`)
- Multiplying by 1 billion again creates invalid amounts (10,000,000 SOL instead of 0.01 SOL)

### Bet Array Configuration:
**Correct**: `heads: [2, 0], tails: [0, 2]` (original Gamba format)
**Gamba Requirement**: Bet arrays don't need to sum to 1, the [2, 0] format is correct for coinflip

### Wager Display Issues:
**Problem**: Showing lamports instead of SOL in UI
**Solution**: Convert lamports to SOL by dividing by 1,000,000,000
**Example**: `(wager / 1_000_000_000).toFixed(4)` to show SOL with 4 decimals

### Profile System Navigation:
**Problem**: Profile SVG icons showing wrong icons or incorrect colors
**Solution**: 
- Use `/003-user.png` for profile icons (not `/profile.svg`)
- Apply dynamic CSS filters based on current route using `location.pathname.startsWith('/profile')`
- SVG icons should be grey for inactive tabs, original color for active tabs

### Registration Flow Issues:
**Problem**: "Registration failed" or Cloudflare verification issues
**Solution**: 
- Check `localStorage` for user data persistence
- Verify Cloudflare API endpoints in `api/cloudflare-verify.ts`
- Ensure wallet connection before showing registration modal

### Button Styling Consistency:
**Problem**: Inconsistent button styling across components
**Solution**: 
- Edit buttons should use `rgb(48, 48, 48)` background with multi-layer box-shadow
- Claim buttons should be green (`#42ff78`) with same styling structure
- All buttons should use `transform: translateY(-1px)` on hover

## Gamba Game Mechanics and Fairness

Games are initiated by the player, typically via a frontend app. The Gamba on-chain Program will validate each game, ensuring fair play. A random number will then be generated to determine the winner, whether it's the player or the liquidity pool being played against.

### Structure
The key components that make up a game are the following:

*   **pool** - The pool (and its underlying token) used for the game.
*   **wager** - The amount of tokens that the player will pay to start the game.
*   **rng_seed** - A cryptographic hash (SHA-256) supplied by Gamba's RNG Provider.
*   **client_seed** - An adjustable, random user seed generated by your browser.
*   **nonce** - A unique, sequential number incremented per bet to ensure a one-time cryptographic hash.
*   **bet_array** - A set of predefined multipliers per game. The RNG selects a resultIndex to multiply the wager and calculate the player's resulting token payout.

Each result on Gamba is fairly, transparently and securely determined using the variables.

Prior to initiating a game, the player receive an encrypted hash of the rng_seed. Since they know the hash in advance, they know that Gamba cannot change it. Meanwhile, the player can change their client_seed via the frontend they're playing on, which will alter the games result. When a game is finished, the player will once again receive the hashed rng_seed for their next game.

### Outcomes
The bet is made up of potential multipliers.

After the game begins, the RNG selects a random number from the bet_array, and that number multiplies the player's wager to determine the final payout.

**Example of Simple Bets:**

*   `[2, 0]`: This simulates a coin toss, where a player either doubles their wager (2x) or loses it all (0x).

**Examples of Different Bets:**

*   `[0, 2]` - Fair bet with equal odds = allowed ✅
*   `[1.5, 0.5]` - Fair bet with equal odds = allowed ✅
*   `[0, 0, 0, 0, 5]` - Fair bet with varied odds = allowed ✅
*   `[0, 0, 0, 6]` - Player advantage = not allowed ❌
*   `[0, 3]` - Player advantage = not allowed ❌

With simple rules and effective UI design, various arcade-style games like Roulette, Plinko, Crash, and others can be built using the available components.

### Game Flow

1.  **User Places Bet**
    The user places a bet using any Gamba platform.

2.  **Gamba Runs RNG and Returns Result**
    Gamba programs process the bet using on-chain RNG, which selects a resultIndex that corresponds to one of the predefined multipliers in the bet_array.

3.  **End Game & Payout Multiplier**
    Gamba returns the result to the frontend and credits the player if a payout is due.

### Example Transaction Structure
Based on the Gamba Explorer screenshot provided, here's what a typical transaction looks like:

**Transaction Details:**
- **Platform:** Fronk Casino
- **Pool:** Fronk (PUBLIC)
- **Player:** mollusk.sol
- **Metadata:** `0:flip:tails` (game type, side selected)
- **Wager:** 100.00M Fronk
- **Payout:** 0 Fronk -100% (player lost)
- **Fees:** 5.40M Fronk
- **Outcomes:** `0x` (lose) or `2x` (win) - standard coinflip bet array `[2, 0]`

**Key Takeaways:**
- The bet array `[2, 0]` means player either wins 2x their wager or loses everything (0x)
- Metadata contains game type and player's choice
- Fees are deducted from the total pool
- Results are provably fair using cryptographic hashes

## TODO List - Database Migration & Improvements

### 🚨 HIGH PRIORITY - Database Migration

#### 1. Supabase Setup & Configuration
- [ ] **Set up Supabase project** with proper database schema
- [ ] **Create user profiles table** with fields: wallet_address, username, level, avatar_url, created_at, updated_at
- [ ] **Set up Supabase Auth** for wallet-based authentication
- [ ] **Configure Supabase Storage** for profile picture uploads
- [ ] **Set up Row Level Security (RLS)** policies for user data protection
- [ ] **Create Supabase Edge Functions** for user data management

#### 2. Remove localStorage Dependencies
- [ ] **Remove localStorage user data functions** from utils.ts ✅ (COMPLETED)
- [ ] **Update ProfilePage.tsx** to use Supabase instead of localStorage
- [ ] **Update ProfileDropdown.tsx** to fetch user data from Supabase
- [ ] **Update RegistrationModal.tsx** to save user data to Supabase
- [ ] **Update UserButton.tsx** to display user data from Supabase
- [ ] **Remove all localStorage.getItem('userData') calls** throughout the codebase

#### 3. Create Supabase Hooks & Services
- [ ] **Create useUserProfile.ts hook** for user data management
- [ ] **Create useSupabaseAuth.ts hook** for authentication
- [ ] **Create supabase/user-service.ts** for user CRUD operations
- [ ] **Create supabase/storage-service.ts** for file uploads
- [ ] **Update useUserStore.ts** to work with Supabase

### 🔧 MEDIUM PRIORITY - Code Cleanup

#### 4. Component Updates
- [ ] **Update ChatBox.tsx** to use Supabase for user data
- [ ] **Update RecentPlays.tsx** to fetch user data from Supabase
- [ ] **Update LeaderBoard components** to use Supabase data
- [ ] **Remove hardcoded user data** from all components

#### 5. API Endpoints Migration
- [ ] **Migrate api/register-user.ts** to use Supabase instead of custom logic
- [ ] **Update api/chat.ts** to work with Supabase user data
- [ ] **Update api/online-users.ts** to use Supabase
- [ ] **Remove api/cloudflare-verify.ts** (if not needed)
- [ ] **Remove api/send-verification.ts** (if not needed)

### 🎨 LOW PRIORITY - UI/UX Improvements

#### 6. Profile System Enhancements
- [ ] **Add profile picture upload** functionality
- [ ] **Add user level progression** system
- [ ] **Add user statistics** tracking
- [ ] **Add user preferences** (theme, notifications, etc.)
- [ ] **Add user activity history**

#### 7. Performance & Optimization
- [ ] **Implement data caching** for user profiles
- [ ] **Add loading states** for all Supabase operations
- [ ] **Optimize database queries** with proper indexing
- [ ] **Add error handling** for network failures
- [ ] **Implement offline support** for critical data

### 🧪 TESTING & DEPLOYMENT

#### 8. Testing
- [ ] **Test user registration flow** with Supabase
- [ ] **Test profile data persistence** across devices
- [ ] **Test file upload** functionality
- [ ] **Test real-time updates** for user data
- [ ] **Test error handling** for various scenarios

#### 9. Deployment
- [ ] **Set up environment variables** for Supabase
- [ ] **Deploy to Vercel** with Supabase integration
- [ ] **Test production deployment**
- [ ] **Set up monitoring** and error tracking
- [ ] **Create backup strategy** for user data

### 📋 MIGRATION CHECKLIST

#### Before Migration:
- [ ] Backup current localStorage data structure
- [ ] Document all localStorage usage patterns
- [ ] Plan data migration strategy for existing users

#### During Migration:
- [ ] Set up Supabase database schema
- [ ] Create migration scripts for existing data
- [ ] Update components one by one
- [ ] Test each component thoroughly

#### After Migration:
- [ ] Remove all localStorage dependencies
- [ ] Clean up unused code
- [ ] Update documentation
- [ ] Monitor for any issues

### 🚀 IMMEDIATE NEXT STEPS

1. **Set up Supabase project** and configure database schema
2. **Create user profiles table** with proper fields
3. **Update ProfilePage.tsx** to use Supabase instead of localStorage
4. **Test the migration** with a simple user registration flow
5. **Gradually migrate other components** to use Supabase

### 📝 NOTES

- **Current Issue**: All user data (username, level, avatar) is stored in localStorage
- **Target State**: All user data stored in Supabase database with proper authentication
- **Benefits**: Multi-device support, data persistence, better security, scalability
- **Timeline**: This migration should be completed before production deployment