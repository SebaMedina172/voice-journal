"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckSquare, Heart, Activity, FileText, CalendarDays, Trash2 } from "lucide-react"
import type { CardType, CardColor, Mood } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface JournalCardProps {
  id: string
  type: CardType
  title: string
  content: string
  color: CardColor
  mood: Mood | null
  detectedDate: string | null
  hasCalendarAction: boolean
  hasTaskAction: boolean
  createdAt: string
}

const typeConfig: Record<CardType, { icon: typeof Heart; label: string }> = {
  emotion: { icon: Heart, label: "Emoción" },
  activity: { icon: Activity, label: "Actividad" },
  task: { icon: CheckSquare, label: "Tarea" },
  event: { icon: Calendar, label: "Evento" },
  note: { icon: FileText, label: "Nota" },
}

const colorClasses: Record<CardColor, { bg: string; border: string; badge: string }> = {
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  },
}

const moodLabels: Record<Mood, string> = {
  happy: "Feliz",
  sad: "Triste",
  stressed: "Estresado",
  calm: "Calmado",
  excited: "Emocionado",
  anxious: "Ansioso",
  grateful: "Agradecido",
  frustrated: "Frustrado",
  neutral: "Neutral",
}

export function JournalCard({
  id,
  type,
  title,
  content,
  color,
  mood,
  detectedDate,
  hasCalendarAction,
  hasTaskAction,
}: JournalCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const { icon: Icon, label } = typeConfig[type]
  const colorClass = colorClasses[color]

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = detectedDate
    ? new Date(detectedDate).toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null

  return (
    <Card className={cn("transition-all hover:shadow-md", colorClass.bg, colorClass.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className={cn("text-xs font-normal", colorClass.badge)}>
              {label}
            </Badge>
            {mood && (
              <Badge variant="outline" className="text-xs font-normal">
                {moodLabels[mood]}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
        <CardTitle className="text-base leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>

        {(detectedDate || hasCalendarAction || hasTaskAction) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
            {detectedDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
            {hasCalendarAction && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 bg-transparent">
                <Calendar className="h-3 w-3" />
                Agendar
              </Button>
            )}
            {hasTaskAction && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 bg-transparent">
                <CheckSquare className="h-3 w-3" />
                Crear tarea
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
