import { NextApiRequest, NextApiResponse } from 'next'

interface UserData {
  walletAddress: string
  username: string
  email: string
  referralCode: string | null
  createdAt: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { walletAddress, username, email, referralCode }: UserData = req.body

    // Validate required fields
    if (!walletAddress || !username || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Check if user already exists
    const existingUser = await checkExistingUser(walletAddress, email)
    if (existingUser.exists) {
      return res.status(409).json({ 
        error: existingUser.field === 'wallet' 
          ? 'Wallet already registered' 
          : 'Email already registered' 
      })
    }

    // Create user account
    const userData: UserData = {
      walletAddress,
      username: username.trim(),
      email: email.trim(),
      referralCode: referralCode?.trim() || null,
      createdAt: new Date().toISOString()
    }

    // Save user to database (in production, use a proper database)
    const savedUser = await saveUser(userData)

    // Send welcome email (optional)
    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      await sendWelcomeEmail(email, username)
    }

    // Handle referral code if provided
    if (referralCode) {
      await handleReferralCode(referralCode, walletAddress)
    }

    res.status(201).json({
      success: true,
      user: {
        walletAddress: savedUser.walletAddress,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper function to check if user already exists
async function checkExistingUser(walletAddress: string, email: string) {
  try {
    // In production, query your database
    // For now, we'll simulate by always returning false (no existing users)
    // You would replace this with actual database queries
    
    // Example database query:
    /*
    const existingUser = await db.collection('users').findOne({
      $or: [
        { walletAddress: walletAddress.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    })
    
    return {
      exists: !!existingUser,
      field: existingUser?.walletAddress === walletAddress.toLowerCase() ? 'wallet' : 'email'
    }
    */
    
    return { exists: false, field: null }
  } catch (error) {
    console.error('Error checking existing user:', error)
    return { exists: false, field: null }
  }
}

// Helper function to save user
async function saveUser(userData: UserData) {
  try {
    // In production, save to your database
    // For now, we'll simulate successful save
    
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      verified: false,
      lastLogin: new Date().toISOString()
    }
    
    // Example database save:
    /*
    const result = await db.collection('users').insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
    */
    
    console.log('User registered:', newUser)
    return newUser
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, username: string) {
  try {
    // In production, use your email service (SendGrid, AWS SES, etc.)
    console.log(`Welcome email sent to ${email} for user ${username}`)
    
    // Example with a service like SendGrid:
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to: email,
      from: 'noreply@solbet.com',
      subject: 'Welcome to SOLBET!',
      html: `
        <h1>Welcome to SOLBET, ${username}!</h1>
        <p>Your account has been successfully created.</p>
        <p>Start playing now and enjoy our games!</p>
      `
    }
    
    await sgMail.send(msg)
    */
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

// Helper function to handle referral code
async function handleReferralCode(referralCode: string, walletAddress: string) {
  try {
    // In production, implement your referral system
    console.log(`Processing referral code ${referralCode} for wallet ${walletAddress}`)
    
    // Example referral logic:
    // 1. Find the referrer by code
    // 2. Add referral bonus to referrer
    // 3. Add referral bonus to new user
    // 4. Update referral statistics
    
  } catch (error) {
    console.error('Error handling referral code:', error)
  }
}
