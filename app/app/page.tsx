import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VoiceInput } from "@/components/voice-input"
import { CardsGrid } from "@/components/cards-grid"
import { AppHeader } from "@/components/app-header"
import { getTodayLocal, formatLocalDate, parseLocalDate } from "@/lib/date-utils"

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function AppPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get today in LOCAL timezone (not UTC)
  const today = getTodayLocal()
  const todayStr = formatLocalDate(today)

  // Parse selected date in LOCAL timezone
  const selectedDateStr = params.date || todayStr
  const selectedDate = parseLocalDate(selectedDateStr)

  // No permitir fechas futuras
  if (selectedDate > today) {
    redirect("/app")
  }

  const isToday = selectedDateStr === todayStr

  // Obtener el día seleccionado
  const { data: day } = await supabase
    .from("days")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("date", selectedDateStr)
    .single()

  const dayId = day?.id || null

  // Obtener las cards del día si existe
  let cards: Array<{
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
  }> = []

  if (dayId) {
    const { data: cardsData } = await supabase
      .from("cards")
      .select("*")
      .eq("day_id", dayId)
      .order("created_at", { ascending: false })

    cards = cardsData || []
  }

  return (
    <div className="min-h-svh cork-texture flex flex-col">
      <AppHeader userEmail={data.user.email || ""} selectedDate={selectedDate} />

      {/* Main content area - scrollable cards */}
      <main className="flex-1 overflow-y-auto pb-32 md:pb-6">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 max-w-6xl w-full">
          {/* Desktop: Two column layout */}
          <div className="hidden md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] md:gap-6 lg:gap-8">
            {/* Left column: Voice input (desktop) */}
            {isToday && (
              <div className="sticky top-20 h-fit">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-border">
                  <h2 className="text-xs sm:text-sm font-medium text-foreground/70 mb-4 text-center uppercase tracking-wide">
                    Nueva entrada
                  </h2>
                  <VoiceInput userId={data.user.id} dayId={dayId} todayDate={todayStr} />
                </div>
              </div>
            )}

            {/* Right column: Cards grid */}
            <div className={!isToday ? "md:col-span-2" : ""}>
              <CardsGrid cards={cards} dayId={dayId} isReadOnly={!isToday} selectedDate={selectedDateStr} />
            </div>
          </div>

          {/* Mobile: Single column with cards only */}
          <div className="md:hidden">
            <CardsGrid cards={cards} dayId={dayId} isReadOnly={!isToday} selectedDate={selectedDateStr} />
          </div>
        </div>
      </main>

      {/* Mobile */}
      {isToday && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
          <div className="container mx-auto px-2 sm:px-3 py-3 max-w-6xl">
            <VoiceInput userId={data.user.id} dayId={dayId} todayDate={todayStr} />
          </div>
        </div>
      )}
    </div>
  )
}
