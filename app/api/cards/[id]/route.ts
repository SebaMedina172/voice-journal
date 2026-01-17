import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createClient()

    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la card pertenece al usuario (via day_id)
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, day_id, days!inner(user_id)")
      .eq("id", id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: "Card no encontrada" }, { status: 404 })
    }

    // RLS debería manejar esto, pero verificamos por seguridad
    const dayData = card.days as unknown as { user_id: string }
    if (dayData.user_id !== userData.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar la card
    const { error: deleteError } = await supabase.from("cards").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting card:", deleteError)
      return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/cards/[id]:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
