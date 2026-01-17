export type CardType = "emotion" | "activity" | "task" | "event" | "note"
export type CardColor = "amber" | "blue" | "green" | "purple" | "gray" | "rose" | "indigo"
export type Mood = "happy" | "sad" | "stressed" | "calm" | "excited" | "anxious" | "grateful" | "frustrated" | "neutral"

export interface Card {
  id: string
  entry_id: string
  day_id: string
  type: CardType
  title: string
  content: string
  color: CardColor
  mood?: Mood | null
  detected_date?: string | null
  has_calendar_action: boolean
  has_task_action: boolean
  is_synced_calendar: boolean
  is_synced_tasks: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  day_id: string
  raw_text: string
  created_at: string
}

export interface Day {
  id: string
  user_id: string
  date: string
  created_at: string
  updated_at: string
}

export interface AnalysisCard {
  type: CardType
  title: string
  content: string
  color: CardColor
  mood?: Mood
  detectedDate?: string
  hasCalendarAction: boolean
  hasTaskAction: boolean
}

export interface AnalysisResponse {
  cards: AnalysisCard[]
  summary: string
  dominantMood: Mood
  suggestedActions: string[]
}
