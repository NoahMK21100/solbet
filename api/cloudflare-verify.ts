import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get client IP from request
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1'
    
    // Cloudflare Turnstile verification
    const turnstileResponse = await verifyCloudflareTurnstile(req, clientIP)
    
    if (turnstileResponse.success) {
      // Generate a verification token
      const verificationToken = generateVerificationToken(clientIP)
      
      res.status(200).json({
        success: true,
        token: verificationToken,
        message: 'Cloudflare verification successful'
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Cloudflare verification failed',
        details: turnstileResponse['error-codes']
      })
    }
    
  } catch (error) {
    console.error('Cloudflare verification error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// Verify Cloudflare Turnstile
async function verifyCloudflareTurnstile(req: NextApiRequest, clientIP: string) {
  try {
    // Get Turnstile token from request body
    const { 'cf-turnstile-response': turnstileToken } = req.body
    
    if (!turnstileToken) {
      return { success: false, 'error-codes': ['missing-input-response'] }
    }
    
    // Verify with Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET || '',
        response: turnstileToken,
        remoteip: clientIP as string,
      }),
    })
    
    const result = await response.json()
    return result
    
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return { success: false, 'error-codes': ['internal-error'] }
  }
}

// Generate verification token
function generateVerificationToken(clientIP: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const ipHash = Buffer.from(clientIP).toString('base64').substring(0, 8)
  
  return `cf_${timestamp}_${randomString}_${ipHash}`
}
