import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { createClient } from "@/lib/supabase/server"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

function getTodayInfo() {
  const today = new Date()
  const dayNames = {
    en: today.toLocaleDateString("en-US", { weekday: "long" }),
    es: today.toLocaleDateString("es-ES", { weekday: "long" }),
  }

  return {
    date: today.toISOString().split("T")[0],
    dayEn: dayNames.en,
    dayEs: dayNames.es,
    fullEn: today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    fullEs: today.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  }
}

function buildSystemPrompt() {
  const today = getTodayInfo()

  return `You are an assistant that analyzes personal journal entries.

CRITICAL: Always respond in the SAME LANGUAGE as the user's input. If they write in English, respond in English. If in Spanish, respond in Spanish. If in Portuguese, Portuguese. Match their language, tone, and colloquialisms.

Your task:
1. Split the text into coherent thematic segments
2. Classify each segment into: emotion, activity, task, event, note
3. Rewrite each segment clearly and concisely
4. If input is very short, expand slightly to be more descriptive
5. If input is very long, summarize while keeping key points
6. Detect mentioned dates (today, tomorrow, next week, etc.) and convert to YYYY-MM-DD format
7. Mark actionable items (pending tasks, events with specific dates)

CATEGORIES (READ CRITERIA CAREFULLY):
- emotion: ONLY direct emotional states (happy, sad, stressed). DO NOT mix with activities.
- activity: Actions already done. If emotion is mentioned WITHIN an activity, keep it in activity (e.g., "went to gym and felt great" → activity, NOT separate emotion card)
- task: Pending items WITHOUT specific date or with generic date (e.g., "tomorrow", "this week")
- event: Pending items WITH specific date/time (e.g., "Monday Jan 20", "Friday at 3pm")
- note: Thoughts, ideas, reminders that are NOT actions (e.g., "need to remember that...")

CONSISTENCY RULES:
- If emotion is mixed with activity → ALL goes in activity
- If reminder has specific date → it's event, NOT note
- Deadlines/expirations with date → ALWAYS event
- DO NOT create separate emotion cards if emotion is already described in another card
- Prefer FEWER complete cards over MANY mini cards

COLORS by type:
- emotion: amber (happy/grateful), rose (sad/nostalgic), purple (stressed/anxious)
- activity: blue
- task: green
- event: indigo
- note: gray

MOODS - CRITICAL RULES:
========================================
ONLY use mood for cards with type="emotion"
For ALL other types (activity, task, event, note), mood MUST be null
Valid mood values ONLY: happy, sad, stressed, calm, excited, anxious, grateful, frustrated, neutral
========================================

Respond ONLY with valid JSON in this exact format:
{
  "cards": [
    {
      "type": "emotion|activity|task|event|note",
      "title": "Short descriptive title (max 50 chars) in user's language",
      "content": "Rewritten content in user's language",
      "color": "amber|blue|green|purple|gray|rose|indigo",
      "mood": "happy|sad|stressed|calm|excited|anxious|grateful|frustrated|neutral (only if type=emotion, else null)",
      "detectedDate": "YYYY-MM-DD or null if no specific date",
      "hasCalendarAction": true/false,
      "hasTaskAction": true/false
    }
  ]
}

EXAMPLES:

Input (English): "Today I woke up really happy because it's Friday. I need to call the dentist tomorrow to schedule an appointment. In the afternoon I went to the gym and felt great."

Output:
{
  "cards": [
    {
      "type": "emotion",
      "title": "Woke up happy",
      "content": "I woke up really happy because it's Friday.",
      "color": "amber",
      "mood": "happy",
      "detectedDate": null,
      "hasCalendarAction": false,
      "hasTaskAction": false
    },
    {
      "type": "task",
      "title": "Call dentist",
      "content": "I need to call the dentist to schedule an appointment.",
      "color": "green",
      "mood": null,
      "detectedDate": "2026-01-17",
      "hasCalendarAction": false,
      "hasTaskAction": true
    },
    {
      "type": "activity",
      "title": "Went to the gym",
      "content": "In the afternoon I went to the gym and felt great.",
      "color": "blue",
      "mood": null,
      "detectedDate": null,
      "hasCalendarAction": false,
      "hasTaskAction": false
    }
  ]
}

Input (Spanish): "El lunes tengo que entregar el reporte. El miércoles voy al médico."

Output (assuming today is Friday, Jan 16, 2026):
{
  "cards": [
    {
      "type": "event",
      "title": "Entregar reporte",
      "content": "Tengo que entregar el reporte el lunes.",
      "color": "indigo",
      "mood": null,
      "detectedDate": "2026-01-19",
      "hasCalendarAction": true,
      "hasTaskAction": true
    },
    {
      "type": "event",
      "title": "Consulta médica",
      "content": "Tengo que ir al médico el miércoles.",
      "color": "indigo",
      "mood": null,
      "detectedDate": "2026-01-21",
      "hasCalendarAction": true,
      "hasTaskAction": true
    }
  ]
}

IMPORTANT - DO NOT MAKE DATE CALCULATION ERRORS:
- DO NOT use markdown in JSON
- DO NOT add comments
- Ensure valid JSON
- Use double quotes, not single
- ALWAYS respond in the user's input language
- BE VERY CAREFUL with date calculations - triple check your math!
- CRITICAL: mood MUST be null for all cards except type="emotion"
- CRITICAL: mood values MUST be exactly one of: happy, sad, stressed, calm, excited, anxious, grateful, frustrated, neutral

TODAY'S COMPLETE CONTEXT FOR DATE CALCULATIONS:
========================================
Current date: ${today.date}
Day of week (English): ${today.dayEn}
Day of week (Spanish): ${today.dayEs}
Full date: ${today.fullEn}
========================================

CRITICAL DATE CALCULATION RULES:
1. "tomorrow" = add 1 day to TODAY
2. "Monday" or "el lunes" or "segunda-feira" = find NEXT occurrence of Monday from TODAY
3. "next Monday" = find Monday of NEXT week (not this week's Monday if it hasn't passed)
4. Count carefully: If today is Friday (${today.dayEn}), then:
   - Monday is in 3 days (not 4!)
   - Tuesday is in 4 days (not 5!)
   - Wednesday is in 5 days (not 6!)
   - Thursday is in 6 days (not 7!)
   - Saturday is in 1 day (not 2!)
   - Sunday is in 2 days (not 3!)

Double-check your date math before responding!`
}

interface AnalysisCard {
  type: "emotion" | "activity" | "task" | "event" | "note"
  title: string
  content: string
  color: "amber" | "blue" | "green" | "purple" | "gray" | "rose" | "indigo"
  mood?: string | null
  detectedDate?: string | null
  hasCalendarAction: boolean
  hasTaskAction: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { text, userId, dayId, todayDate } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "El texto no puede estar vacío" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const supabase = await createClient()

    // Verificar que el usuario está autenticado
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user || userData.user.id !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Llamar a Groq para análisis
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0]?.message?.content || ""

    let parsedResponse: { cards: AnalysisCard[] }
    try {
      parsedResponse = JSON.parse(responseText)
    } catch {
      console.error("Error al parsear JSON de Groq:", responseText)
      return NextResponse.json(
        {
          error: "La IA no devolvió un JSON válido",
          rawResponse: responseText,
        },
        { status: 500 },
      )
    }

    // Crear o obtener el día
    let currentDayId = dayId

    if (!currentDayId) {
      // Crear el día si no existe
      const { data: newDay, error: dayError } = await supabase
        .from("days")
        .insert({
          user_id: userId,
          date: todayDate,
        })
        .select()
        .single()

      if (dayError) {
        // Puede que ya exista por race condition, intentar obtener
        const { data: existingDay } = await supabase
          .from("days")
          .select("id")
          .eq("user_id", userId)
          .eq("date", todayDate)
          .single()

        if (existingDay) {
          currentDayId = existingDay.id
        } else {
          console.error("Error creating day:", dayError)
          return NextResponse.json({ error: "Error al crear el día" }, { status: 500 })
        }
      } else {
        currentDayId = newDay.id
      }
    }

    // Crear la entry (texto raw)
    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        day_id: currentDayId,
        raw_text: text.trim(),
      })
      .select()
      .single()

    if (entryError) {
      console.error("Error creating entry:", entryError)
      return NextResponse.json({ error: "Error al guardar la entrada" }, { status: 500 })
    }

    // Crear las cards
    if (parsedResponse.cards && parsedResponse.cards.length > 0) {
      const cardsToInsert = parsedResponse.cards.map((card, index) => {
        // Validar que mood solo esté presente en cards de tipo emotion
        const validatedMood = card.type === 'emotion' ? card.mood : null
        
        // Validar que el mood sea uno de los valores permitidos
        const allowedMoods = ['happy', 'sad', 'stressed', 'calm', 'excited', 'anxious', 'grateful', 'frustrated', 'neutral']
        const finalMood = validatedMood && allowedMoods.includes(validatedMood) ? validatedMood : null
        
        return {
          entry_id: entry.id,
          day_id: currentDayId,
          type: card.type,
          title: card.title,
          content: card.content,
          color: card.color,
          mood: finalMood,
          detected_date: card.detectedDate || null,
          has_calendar_action: card.hasCalendarAction || false,
          has_task_action: card.hasTaskAction || false,
          position: index,
        }
      })

      // AGREGA ESTOS LOGS
      console.log("=== INTENTANDO INSERTAR CARDS ===")
      console.log("Respuesta de la IA:", JSON.stringify(parsedResponse, null, 2))
      console.log("Cards procesadas para insertar:", JSON.stringify(cardsToInsert, null, 2))

      const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert)

      if (cardsError) {
        console.error("Error creating cards:", cardsError)
        return NextResponse.json({ error: "Error al guardar las cards" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      dayId: currentDayId,
      entryId: entry.id,
      cardsCount: parsedResponse.cards?.length || 0,
    })
  } catch (error: unknown) {
    console.error("Error en /api/analyze:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar la solicitud" },
      { status: 500 },
    )
  }
}
