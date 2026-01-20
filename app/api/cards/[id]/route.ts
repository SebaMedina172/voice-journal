import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { formatLocalDate, getTodayLocal } from "@/lib/date-utils"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { title, content } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar autenticación
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la card pertenece al usuario y es del día actual
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, day_id, days!inner(user_id, date)")
      .eq("id", id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: "Card no encontrada" }, { status: 404 })
    }

    const dayData = card.days as unknown as { user_id: string; date: string }

    if (dayData.user_id !== userData.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const today = formatLocalDate(getTodayLocal())
    if (dayData.date !== today) {
      return NextResponse.json({ error: "Solo puedes editar cards del día actual" }, { status: 403 })
    }

    // Actualizar la card
    const { error: updateError } = await supabase
      .from("cards")
      .update({ title: title.trim(), content: content.trim() })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating card:", updateError)
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/cards/[id]:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

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