import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

interface TaskSyncRequest {
  cardId: string
  title: string
  notes?: string
  dueDate?: string
  status: 'needsAction' | 'completed'
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
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body: TaskSyncRequest = await request.json()
    const { cardId, title, notes, dueDate, status } = body

    if (!cardId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Google tokens from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 401 }
      )
    }

    let accessToken = tokenData.access_token
    const currentTime = Math.floor(Date.now() / 1000)

    // Check if token is expired and refresh if needed
    if (tokenData.expires_at <= currentTime) {
      console.log('Access token expired, refreshing...')
      const newTokens = await refreshAccessToken(tokenData.refresh_token)
      
      accessToken = newTokens.access_token
      const newExpiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in

      // Update tokens in database
      await supabase
        .from('google_tokens')
        .update({
          access_token: newTokens.access_token,
          expires_at: newExpiresAt,
        })
        .eq('user_id', user.id)
    }

    // Create task in Google Tasks
    // First, get or create the default task list
    const taskListResponse = await fetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!taskListResponse.ok) {
      const errorText = await taskListResponse.text()
      console.error('Failed to get task lists:', errorText)
      return NextResponse.json(
        { error: 'Failed to access Google Tasks' },
        { status: 500 }
      )
    }

    const taskLists = await taskListResponse.json()
    const defaultTaskList = taskLists.items?.[0]?.id

    if (!defaultTaskList) {
      return NextResponse.json(
        { error: 'No task list found' },
        { status: 500 }
      )
    }

    // Create the task
    const taskData: any = {
      title,
      status,
    }

    if (notes) {
      taskData.notes = notes
    }

    if (dueDate) {
      // Google Tasks expects RFC 3339 format date
      taskData.due = new Date(dueDate).toISOString()
    }

    const createTaskResponse = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${defaultTaskList}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      }
    )

    if (!createTaskResponse.ok) {
      const errorText = await createTaskResponse.text()
      console.error('Failed to create task:', errorText)
      return NextResponse.json(
        { error: 'Failed to create task in Google Tasks' },
        { status: 500 }
      )
    }

    const createdTask = await createTaskResponse.json()

    // Update card in database to mark as synced and store task ID
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        is_synced_tasks: true,
        google_tasks_task_id: createdTask.id,
      })
      .eq('id', cardId)

    if (updateError) {
      console.error('Failed to update card sync status:', updateError)
      // Don't fail the request, task was created successfully
    }

    return NextResponse.json({
      success: true,
      taskId: createdTask.id,
      taskLink: createdTask.selfLink,
    })
  } catch (error) {
    console.error('Task sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
