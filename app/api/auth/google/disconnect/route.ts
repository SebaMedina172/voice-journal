import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const createServerClient = createClient;

export async function POST() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete tokens from database
  const { error } = await supabase
    .from('google_tokens')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Error disconnecting Google:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
