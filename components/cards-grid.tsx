"use client"

import { JournalCard } from "@/components/journal-card"
import type { CardType, CardColor, Mood } from "@/lib/types"

interface CardData {
  id: string
  type: string
  title: string
  content: string
  color: string
  mood: string | null
  detected_date: string | null
  has_calendar_action: boolean
  has_task_action: boolean
  position: number
  created_at: string
}

interface CardsGridProps {
  cards: CardData[]
  dayId: string | null
}

export function CardsGrid({ cards, dayId }: CardsGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Sin entradas hoy</h3>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <JournalCard
          key={card.id}
          id={card.id}
          type={card.type as CardType}
          title={card.title}
          content={card.content}
          color={card.color as CardColor}
          mood={card.mood as Mood | null}
          detectedDate={card.detected_date}
          hasCalendarAction={card.has_calendar_action}
          hasTaskAction={card.has_task_action}
          createdAt={card.created_at}
        />
      ))}
    </div>
  )
}
