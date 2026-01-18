"use client"

import { JournalCard } from "@/components/journal-card"
import type { CardType, CardColor, Mood } from "@/lib/types"
import { History, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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
  isReadOnly?: boolean
  selectedDate: string
}

export function CardsGrid({ cards, dayId, isReadOnly = false, selectedDate }: CardsGridProps) {
  const router = useRouter()

  if (cards.length === 0) {
    if (isReadOnly) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <History className="h-8 w-8 text-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Sin entradas este dia</h3>
          <p className="text-sm text-foreground/60 mt-1 max-w-xs">
            No registraste ninguna entrada el{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/app")}>
            Ir a hoy
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-secondary p-4 mb-4">
          <BookOpen className="h-8 w-8 text-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Sin entradas hoy</h3>
        <p className="text-sm text-foreground/60 mt-1 max-w-xs">
          Habla o escribe sobre tu dia y la IA organizara tus pensamientos
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {isReadOnly && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm text-foreground/70">
          <History className="h-4 w-4" />
          <span>Estas viendo un dia pasado. Las entradas son de solo lectura.</span>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <div key={card.id} className="postit-enter" style={{ animationDelay: `${index * 0.05}s` }}>
            <JournalCard
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
              isReadOnly={isReadOnly}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
