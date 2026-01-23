import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

interface CalendarEventRequest {
  cardId: string
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  reminder: string
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  return await response.json()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body: CalendarEventRequest = await request.json()
    const { cardId, title, description, startDate, startTime, endDate, endTime, reminder } = body

    // Get Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 })
    }

    let accessToken = tokenData.access_token
    const currentTime = Math.floor(Date.now() / 1000)

    // Refresh token if expired
    if (tokenData.expires_at <= currentTime) {
      const newTokens = await refreshAccessToken(tokenData.refresh_token)
      accessToken = newTokens.access_token

      // Update tokens in database
      const newExpiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in
      await supabase
        .from('google_tokens')
        .update({
          access_token: newTokens.access_token,
          expires_at: newExpiresAt,
        })
        .eq('user_id', user.id)
    }

    // Build event start and end datetime
    const startDateTime = `${startDate}T${startTime}:00`
    const endDateTime = `${endDate}T${endTime}:00`

    // Build Google Calendar event
    const event = {
      summary: title,
      description: description || undefined,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Argentina/Buenos_Aires', // You can make this dynamic if needed
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      reminders: {
        useDefault: false,
        overrides:
          reminder !== 'none'
            ? [
                {
                  method: 'popup',
                  minutes: parseInt(reminder),
                },
              ]
            : [],
      },
    }

    // Create event in Google Calendar
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.text()
      console.error('Google Calendar API error:', errorData)
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
    }

    const calendarEvent = await calendarResponse.json()
    //console.log('Calendar event created:', calendarEvent.id)

    // Update card to mark as synced
    const { error: updateError } = await supabase
      .from('cards')
      .update({ is_synced_calendar: true })
      .eq('id', cardId)

    if (updateError) {
      console.error('Failed to update card sync status:', updateError)
    }

    return NextResponse.json({
      success: true,
      eventId: calendarEvent.id,
      eventLink: calendarEvent.htmlLink,
    })
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
