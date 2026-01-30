import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { DateRedirector } from "@/components/date-redirector"
import { AppPageClient } from "@/components/app-page-client"
import { getTodayLocal, formatLocalDate, parseLocalDate } from "@/lib/date-utils"

interface PageProps {
  searchParams: Promise<{ date?: string; today?: string }>
}

export default async function AppPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get date from URL - client always sends this via DateRedirector
  const selectedDateStr = params.date
  const clientTodayStr = params.today
  
  // Use client's "today" if provided, otherwise fallback to server calculation
  const actualTodayStr = clientTodayStr || formatLocalDate(getTodayLocal())
  const actualDateStr = selectedDateStr || actualTodayStr
  
  const selectedDate = parseLocalDate(actualDateStr)
  const actualToday = parseLocalDate(actualTodayStr)

  // No permitir fechas futuras
  if (selectedDate > actualToday) {
    redirect("/app")
  }

  const isToday = actualDateStr === actualTodayStr

  // Obtener el día seleccionado
  const { data: day } = await supabase
    .from("days")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("date", actualDateStr)
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
    is_synced_calendar: boolean
    is_synced_tasks: boolean
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
      {/* Ensure date param is always in URL based on client timezone */}
      <DateRedirector />
      
      <AppHeader userEmail={data.user.email || ""} selectedDateStr={actualDateStr} />

      {/* Main content area - scrollable cards */}
      <main className="flex-1 overflow-y-auto pb-32 md:pb-6">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 max-w-6xl w-full">
          <AppPageClient
            userId={data.user.id}
            dayId={dayId}
            todayDate={actualDateStr}
            isToday={isToday}
            cards={cards}
            selectedDate={actualDateStr}
          />
        </div>
      </main>
    </div>
  )
}
