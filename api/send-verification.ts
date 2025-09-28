import { NextApiRequest, NextApiResponse } from 'next'

// Mock email service - in production, use SendGrid, AWS SES, or similar
const sendEmail = async (to: string, subject: string, html: string) => {
  // For development, just log the email
  console.log('📧 Email would be sent:')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('Body:', html)
  
  // In production, replace this with actual email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send({ to, from: 'noreply@solbet.com', subject, html })
  
  return { success: true }
}

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; username: string }>()

// Clean up expired codes every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires < now) {
      verificationCodes.delete(email)
    }
  }
}, 10 * 60 * 1000)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, walletAddress, username } = req.body

    if (!email || !walletAddress || !username) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store verification code
    verificationCodes.set(email, { code, expires, username })

    // Create email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SOLBET Email Verification</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
              margin: 0;
              padding: 20px;
              color: white;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #0f0f0f;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
              border: 1px solid #6741ff;
            }
            .header {
              background: linear-gradient(135deg, #6741ff, #8a6cff);
              padding: 30px;
              text-align: center;
            }
            .logo {
              font-size: 2rem;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
            }
            .verification-code {
              background: #1a1a1a;
              border: 2px solid #6741ff;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 2rem;
              font-weight: bold;
              color: #6741ff;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background: #1a1a1a;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 0.875rem;
            }
            .button {
              display: inline-block;
              background: #6741ff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎮 SOLBET</div>
              <p>Welcome to the ultimate gaming experience!</p>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Hi <strong>${username}</strong>,</p>
              <p>Thank you for registering with SOLBET! To complete your account setup, please verify your email address using the code below:</p>
              
              <div class="verification-code">
                <p style="margin: 0 0 10px 0; color: #ccc;">Your verification code:</p>
                <div class="code">${code}</div>
              </div>
              
              <p>This code will expire in 10 minutes for security reasons.</p>
              <p>If you didn't create an account with SOLBET, please ignore this email.</p>
              
              <p>Best regards,<br>The SOLBET Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2024 SOLBET. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email
    await sendEmail(email, 'SOLBET Email Verification', html)

    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent successfully',
      // In development, return the code for testing
      ...(process.env.NODE_ENV === 'development' && { debugCode: code })
    })

  } catch (error) {
    console.error('Send verification error:', error)
    res.status(500).json({ error: 'Failed to send verification email' })
  }
}
