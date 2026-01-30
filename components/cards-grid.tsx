"use client"

import { JournalCard } from "@/components/journal-card"
import type { CardType, CardColor, Mood } from "@/lib/types"
import { History, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"

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
  is_synced_calendar: boolean
  is_synced_tasks: boolean
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
  const { t, locale } = useI18n()

  if (cards.length === 0) {
    if (isReadOnly) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <History className="h-8 w-8 text-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            {locale === "es" ? "Sin entradas este dia" : "No entries this day"}
          </h3>
          <p className="text-sm text-foreground/60 mt-1 max-w-xs">
            {locale === "es" ? "No registraste ninguna entrada el" : "You didn't log any entries on"}{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/app")}>
            {t("datePicker.goToToday")}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-secondary p-4 mb-4">
          <BookOpen className="h-8 w-8 text-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-foreground">{t("journal.empty.title")}</h3>
        <p className="text-sm text-foreground/60 mt-1 max-w-xs">
          {t("journal.empty.subtitle")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {isReadOnly && (
        <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-secondary text-xs sm:text-sm text-foreground/70 flex-wrap">
          <History className="h-4 w-4 flex-shrink-0" />
          <span>
            {locale === "es" 
              ? "Estas viendo un dia pasado. Las entradas son de solo lectura."
              : "You are viewing a past day. Entries are read-only."}
          </span>
        </div>
      )}
      <div className="columns-1 sm:columns-2 xl:columns-3 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5">
        {cards.map((card, index) => (
          <div key={card.id} className="postit-enter break-inside-avoid" style={{ animationDelay: `${index * 0.05}s` }}>
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
              isSyncedCalendar={card.is_synced_calendar}
              isSyncedTasks={card.is_synced_tasks}
              createdAt={card.created_at}
              isReadOnly={isReadOnly}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
