import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Build absolute base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  if (error) {
    return NextResponse.redirect(new URL('/app?google_error=' + error, baseUrl))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/app?google_error=missing_params', baseUrl))
  }

  try {
    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ Google token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/app?google_error=token_exchange_failed', baseUrl))
    }

    const tokens = await tokenResponse.json()

    // Store tokens in database
    const supabase = await createClient()
    
    // Calculate expires_at as Unix timestamp in seconds (bigint)
    const expiresAtTimestamp = Math.floor(Date.now() / 1000) + tokens.expires_in

    const { error: dbError } = await supabase.from('google_tokens').upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAtTimestamp,
        scopes: tokens.scope,
      },
      {
        onConflict: 'user_id',
      }
    )

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.redirect(new URL('/app?google_error=db_error', baseUrl))
    }

    return NextResponse.redirect(new URL('/app', baseUrl))
  } catch (err) {
    console.error('❌ OAuth callback error:', err)
    return NextResponse.redirect(new URL('/app?google_error=unknown', baseUrl))
  }
}