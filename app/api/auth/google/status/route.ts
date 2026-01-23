import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()


  if (!user) {
    return NextResponse.json({ connected: false })
  }

  const { data: token, error } = await supabase
    .from('google_tokens')
    .select('expires_at, scopes')
    .eq('user_id', user.id)
    .single()

  if (!token) {
    return NextResponse.json({ connected: false })
  }

  const expiresAtMs = token.expires_at * 1000
  const isExpired = new Date(expiresAtMs) <= new Date()

  return NextResponse.json({
    connected: !isExpired,
    scopes: token.scopes,
    expiresAt: token.expires_at,
  })
}