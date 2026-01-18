import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VoiceInput } from "@/components/voice-input"
import { CardsGrid } from "@/components/cards-grid"
import { AppHeader } from "@/components/app-header"

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const selectedDateStr = params.date || todayStr
  const selectedDate = new Date(selectedDateStr + "T00:00:00")

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
      <main className="flex-1 overflow-auto pb-32 md:pb-6">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Desktop: Two column layout */}
          <div className="hidden md:grid md:grid-cols-[320px_1fr] md:gap-8">
            {/* Left column: Voice input (desktop) */}
            {isToday && (
              <div className="sticky top-24 h-fit">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="text-sm font-medium text-foreground/70 mb-4 text-center uppercase tracking-wide">
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

      {/* Mobile: Fixed bottom voice input */}
      {isToday && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
          <div className="container mx-auto px-4 py-3">
            <VoiceInput userId={data.user.id} dayId={dayId} todayDate={todayStr} />
          </div>
        </div>
      )}
    </div>
  )
}
