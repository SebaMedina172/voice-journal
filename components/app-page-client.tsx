"use client"

import { VoiceInput } from "@/components/voice-input"
import { CardsGrid } from "@/components/cards-grid"
import { useI18n } from "@/lib/i18n/context"

interface AppPageClientProps {
  userId: string
  dayId: string | null
  todayDate: string
  isToday: boolean
  cards: Array<{
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
  }>
  selectedDate: string
}

export function AppPageClient({
  userId,
  dayId,
  todayDate,
  isToday,
  cards,
  selectedDate,
}: AppPageClientProps) {
  const { t } = useI18n()

  return (
    <>
      {/* Desktop: Two column layout */}
      <div className="hidden md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] md:gap-6 lg:gap-8">
        {/* Left column: Voice input (desktop) */}
        {isToday && (
          <div className="sticky top-20 h-fit">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-border">
              <h2 className="text-xs sm:text-sm font-medium text-foreground/70 mb-4 text-center uppercase tracking-wide">
                {t("journal.newEntry")}
              </h2>
              <VoiceInput userId={userId} dayId={dayId} todayDate={todayDate} />
            </div>
          </div>
        )}

        {/* Right column: Cards grid */}
        <div className={!isToday ? "md:col-span-2" : ""}>
          <CardsGrid
            cards={cards}
            dayId={dayId}
            isReadOnly={!isToday}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Mobile: Single column with cards only */}
      <div className="md:hidden">
        <CardsGrid
          cards={cards}
          dayId={dayId}
          isReadOnly={!isToday}
          selectedDate={selectedDate}
        />
      </div>

      {/* Mobile floating voice input */}
      {isToday && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
          <div className="container mx-auto px-2 sm:px-3 py-3 max-w-6xl">
            <VoiceInput userId={userId} dayId={dayId} todayDate={todayDate} />
          </div>
        </div>
      )}
    </>
  )
}
