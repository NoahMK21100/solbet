# Database Setup Instructions

## Step 1: Fix Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the working_schema.sql file
```

This will:
- ✅ Create the missing trigger functions
- ✅ Fix all trigger syntax errors
- ✅ Set up proper RLS policies
- ✅ Enable automatic stats updates

## Step 2: Test Database Connection

Add the test component to your app temporarily:

```typescript
// In your main app component
import { DatabaseTest } from './components/DatabaseTest'

// Add this somewhere in your JSX
<DatabaseTest />
```

Run these tests:
1. **Test Database Connection** - Verifies Supabase connection
2. **Test Game Results** - Checks if game_results table works
3. **Test Game Recording** - Tests the recordCoinflipResult function
4. **Test Trigger Function** - Verifies automatic stats updates

## Step 3: Play Games and Check Stats

1. Play some coinflip games on your accounts
2. Check the console for "🎮 Recording game result:" messages
3. Check your database for:
   - New rows in `game_results` table
   - Updated stats in `profiles` table (total_bets, total_won, etc.)

## Expected Results

After playing games, you should see:

### In `game_results` table:
- New row for each game played
- `wallet_address`, `game_type`, `wager_amount`, `payout_amount`
- `rng_seed`, `client_seed`, `nonce` for provably fair verification

### In `profiles` table:
- `total_bets` increased by 1 for each game
- `total_won` increased by payout amount
- `total_wagered` increased by wager amount
- `net_profit` updated with win/loss
- `games_played` incremented
- `last_played_at` updated

## Troubleshooting

### If stats aren't updating:
1. Check console for error messages
2. Verify trigger function exists: `update_user_stats_from_game()`
3. Check if RLS policies allow inserts
4. Make sure `game_results` table has the trigger

### If game recording fails:
1. Check Supabase connection
2. Verify table schema matches
3. Check RLS policies for INSERT permissions

## Clean Up

Remove the `<DatabaseTest />` component once everything is working.

## Database Functions Available

After setup, you can use these SQL functions:

```sql
-- Get wallet stats
SELECT * FROM get_wallet_game_stats('your_wallet_address');

-- Get leaderboard
SELECT * FROM get_game_leaderboard(10);

-- Get game type stats
SELECT * FROM get_game_type_stats();
```
