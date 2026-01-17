import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JournalInput } from "@/components/journal-input"
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
    <div className="min-h-svh bg-background">
      <AppHeader userEmail={data.user.email || ""} selectedDate={selectedDate} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          {isToday && <JournalInput userId={data.user.id} dayId={dayId} todayDate={todayStr} />}
          <CardsGrid cards={cards} dayId={dayId} isReadOnly={!isToday} selectedDate={selectedDateStr} />
        </div>
      </main>
    </div>
  )
}
