# Gamba Game Results Integration

This guide shows how to integrate the game results tracking system with your existing Gamba games.

## Database Setup

1. **Run the updated schema**:
   ```sql
   -- Execute the updated_schema.sql file in your Supabase SQL editor
   ```

2. **Run the database functions**:
   ```sql
   -- Execute the database_functions.sql file
   ```

## Integration Steps

### 1. Import the GameRecorder in your Flip game

```typescript
// In src/games/Flip/index.tsx
import { GameRecorder, extractGameDataFromResult } from '../../utils/gameRecorder'
```

### 2. Record game results after each play

```typescript
// After a successful game.play() call
const result = await game.result()

// Record the game result
try {
  await GameRecorder.recordCoinflipResult(
    publicKey.toString(),
    wager / 1e9, // Convert lamports to SOL
    result.payout / 1e9, // Convert lamports to SOL
    result.payout > wager,
    result.rngSeed?.toString() || '',
    result.clientSeed?.toString() || '',
    result.nonce || 0,
    result.game?.toString() || Date.now().toString(),
    result.transactionSignature || ''
  )
} catch (error) {
  console.error('Failed to record game result:', error)
  // Don't throw - game result recording shouldn't break the game
}
```

### 3. Add the GameResultsManager component

```typescript
// In your main app or game page
import { GameResultsManager } from '../components/GameResultsManager'

// Add this component to display and manage game results
<GameResultsManager />
```

### 4. Use the sync hook for automatic syncing

```typescript
// In any component where you want to sync games
import { useGambaGameSync } from '../hooks/useGambaGameSync'

const { syncCurrentWalletGames, syncState } = useGambaGameSync()

// Call syncCurrentWalletGames() to fetch all games for current wallet
```

## Features

### Automatic Game Recording
- Records every game result with RNG seeds, client seeds, and nonces
- Tracks wager amounts, payouts, and multipliers
- Stores transaction signatures for verification

### Game Sync
- Fetch all games for a specific wallet
- Sync recent games across all users
- Automatic stats updates via database triggers

### Statistics
- Total games played
- Win/loss rates
- Total wagered vs won
- Net profit/loss
- Game type breakdowns

### Provably Fair Verification
- All RNG seeds are stored for verification
- Client seeds and nonces preserved
- Transaction signatures for blockchain verification

## Database Functions

### get_wallet_game_stats(wallet_address)
Returns comprehensive statistics for a wallet:
- Total games, wagered, won
- Net profit, win rate
- Average and best multipliers
- Favorite game type

### get_game_leaderboard(limit)
Returns top players by net profit with rankings.

### get_game_type_stats()
Returns statistics broken down by game type.

## RLS Policies

The system includes Row Level Security policies:
- Users can only view their own game results
- Service role can access all data for backend operations
- Automatic stats updates via database triggers

## Usage Examples

### Fetch all games for current wallet:
```typescript
const { getWalletGameResults } = useGambaGameSync()
const games = await getWalletGameResults()
```

### Get comprehensive wallet statistics:
```sql
SELECT * FROM get_wallet_game_stats('your_wallet_address');
```

### View leaderboard:
```sql
SELECT * FROM get_game_leaderboard(10);
```

This system provides complete transparency and verifiability for all games played on your platform, while automatically maintaining user statistics and enabling comprehensive analytics.
