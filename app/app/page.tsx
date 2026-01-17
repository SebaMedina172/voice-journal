import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JournalInput } from "@/components/journal-input"
import { CardsGrid } from "@/components/cards-grid"
import { AppHeader } from "@/components/app-header"

export default async function AppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const today = new Date().toISOString().split("T")[0]

  // Obtener o crear el día actual
  const { data: day } = await supabase.from("days").select("*").eq("user_id", data.user.id).eq("date", today).single()

  // Si no existe el día, lo dejamos como null - se creará al hacer la primera entrada
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
      <AppHeader userEmail={data.user.email || ""} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <JournalInput userId={data.user.id} dayId={dayId} todayDate={today} />
          <CardsGrid cards={cards} dayId={dayId} />
        </div>
      </main>
    </div>
  )
}
