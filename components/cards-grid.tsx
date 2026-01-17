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
      // Vista de días pasados sin entradas
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Sin entradas este día</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            No registraste ninguna entrada el{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/app")}>
            Ir a hoy
          </Button>
        </div>
      )
    }

    // Vista de hoy sin entradas
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Sin entradas hoy</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Escribe sobre tu día y la IA organizará tus pensamientos en cards
        </p>
      </div>
    )
  }

  return (
  <div className="flex flex-col gap-4">
    {isReadOnly && (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <History className="h-4 w-4" />
        <span>Estás viendo un día pasado. Las entradas son de solo lectura.</span>
      </div>
    )}
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
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
    </div>
  )
}
