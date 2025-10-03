import React, { useState } from 'react'
import styled from 'styled-components'
import { supabase } from '../lib/supabase'
import { recordCoinflipResult } from '../utils/recordGameResult'

const Container = styled.div`
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 8px;
  margin: 1rem 0;
  color: white;
`

const Button = styled.button`
  background: #42ff78;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin: 0.5rem;
  
  &:hover {
    background: #3ce066;
  }
  
  &:disabled {
    background: #666;
    color: #999;
    cursor: not-allowed;
  }
`

const TestResult = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 4px;
  font-family: monospace;
`

export const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testRecordGame = async () => {
    setIsLoading(true)
    setTestResult('Testing game recording...')
    
    try {
      // Test recording a fake game result
      await recordCoinflipResult(
        'TEST_WALLET_ADDRESS',
        0.01, // 0.01 SOL wager
        0.02, // 0.02 SOL payout (win)
        true, // isWin
        'test_rng_seed',
        'test_client_seed',
        123,
        'test_game_id',
        'test_transaction_signature'
      )
      
      setTestResult('✅ Game recording test successful!')
    } catch (error) {
      setTestResult(`❌ Game recording test failed: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    setTestResult('Testing database connection...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address, username, total_bets, total_won, total_wagered')
        .limit(5)
      
      if (error) throw error
      
      setTestResult(`✅ Database connection successful! Found ${data?.length || 0} profiles:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Database connection failed: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testGameResults = async () => {
    setIsLoading(true)
    setTestResult('Testing game results...')
    
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTestResult(`✅ Game results query successful! Found ${data?.length || 0} games:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Game results query failed: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testTriggerFunction = async () => {
    setIsLoading(true)
    setTestResult('Testing trigger function...')
    
    try {
      // First, get a real wallet address from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('wallet_address')
        .limit(1)
      
      if (!profiles || profiles.length === 0) {
        setTestResult('❌ No profiles found to test with')
        setIsLoading(false)
        return
      }
      
      const testWallet = profiles[0].wallet_address
      
      // Record a test game result
      await recordCoinflipResult(
        testWallet,
        0.005, // 0.005 SOL wager
        0.01, // 0.01 SOL payout (win)
        true, // isWin
        'trigger_test_rng_seed',
        'trigger_test_client_seed',
        456,
        'trigger_test_game_id',
        'trigger_test_transaction_signature'
      )
      
      // Check if profile stats were updated
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('wallet_address, total_bets, total_won, total_wagered, net_profit')
        .eq('wallet_address', testWallet)
        .single()
      
      setTestResult(`✅ Trigger test successful! Profile stats updated:\n${JSON.stringify(updatedProfile, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Trigger test failed: ${error}`)
    }
    
    setIsLoading(false)
  }

  return (
    <Container>
      <h3>Database Test Panel</h3>
      <p>Test the database connection and game recording functionality:</p>
      
      <div>
        <Button onClick={testDatabaseConnection} disabled={isLoading}>
          Test Database Connection
        </Button>
        <Button onClick={testGameResults} disabled={isLoading}>
          Test Game Results
        </Button>
        <Button onClick={testRecordGame} disabled={isLoading}>
          Test Game Recording
        </Button>
        <Button onClick={testTriggerFunction} disabled={isLoading}>
          Test Trigger Function
        </Button>
      </div>
      
      {testResult && (
        <TestResult>
          <pre>{testResult}</pre>
        </TestResult>
      )}
    </Container>
  )
}
