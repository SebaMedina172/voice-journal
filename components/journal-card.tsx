"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckSquare, Heart, Activity, FileText, CalendarDays, Trash2, Pencil, X, Check } from "lucide-react"
import type { CardType, CardColor, Mood } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"

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
  isReadOnly?: boolean
}

const typeConfig: Record<CardType, { icon: typeof Heart; label: string }> = {
  emotion: { icon: Heart, label: "Emocion" },
  activity: { icon: Activity, label: "Actividad" },
  task: { icon: CheckSquare, label: "Tarea" },
  event: { icon: Calendar, label: "Evento" },
  note: { icon: FileText, label: "Nota" },
}

const postitColors: Record<CardColor, { bg: string; pin: string }> = {
  amber: { bg: "bg-postit-cream", pin: "bg-pin-yellow" },
  blue: { bg: "bg-postit-blue", pin: "bg-pin-blue" },
  green: { bg: "bg-postit-green", pin: "bg-pin-green" },
  purple: { bg: "bg-postit-lavender", pin: "bg-pin-blue" },
  gray: { bg: "bg-postit-cream", pin: "bg-pin-red" },
  rose: { bg: "bg-postit-pink", pin: "bg-pin-red" },
  indigo: { bg: "bg-postit-blue", pin: "bg-pin-blue" },
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
  isReadOnly = false,
}: JournalCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const { icon: Icon, label } = typeConfig[type]
  const postitStyle = postitColors[color]

  const rotation = useMemo(() => {
    const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
    return ((seed % 5) - 2) * 0.8
  }, [id])

  const handleDelete = async () => {
    if (isDeleting || isReadOnly) return
    setIsExiting(true)

    // Wait for animation then delete
    setTimeout(async () => {
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
        setIsExiting(false)
      } finally {
        setIsDeleting(false)
      }
    }, 300)
  }

  const handleEdit = () => {
    setEditTitle(title)
    setEditContent(content)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(title)
    setEditContent(content)
  }

  const handleSaveEdit = async () => {
    if (isSaving || isReadOnly) return
    if (!editTitle.trim() || !editContent.trim()) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      })

      if (response.ok) {
        setIsEditing(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating card:", error)
    } finally {
      setIsSaving(false)
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
    <div
      className={cn("postit relative rounded-sm p-4 pt-6", postitStyle.bg, isExiting && "postit-exit")}
      style={
        {
          "--rotation": `${rotation}deg`,
          transform: `rotate(${rotation}deg)`,
        } as React.CSSProperties
      }
    >
      {/* Pin decoration */}
      <div className={cn("pin", postitStyle.pin)} />

      {/* Header with type icon and actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground/60" />
          <span className="text-xs font-medium text-foreground/70 uppercase tracking-wide">{label}</span>
          {mood && (
            <span className="text-xs text-foreground/50 border-l border-foreground/20 pl-2 ml-1">
              {moodLabels[mood]}
            </span>
          )}
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-0.5">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground/50 hover:text-foreground hover:bg-foreground/10"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Cancelar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground/50 hover:text-green-700 hover:bg-green-100/50"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editTitle.trim() || !editContent.trim()}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="sr-only">Guardar</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground/50 hover:text-foreground hover:bg-foreground/10"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground/50 hover:text-red-600 hover:bg-red-100/50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="text-base font-semibold bg-white/50 border-foreground/20 mb-2"
          placeholder="Titulo"
        />
      ) : (
        <h3 className="text-base font-semibold text-foreground leading-tight mb-2">{title}</h3>
      )}

      {/* Content */}
      {isEditing ? (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="text-sm bg-white/50 border-foreground/20 min-h-[60px] resize-none"
          placeholder="Contenido"
        />
      ) : (
        <p className="text-sm text-foreground/70 leading-relaxed">{content}</p>
      )}

      {/* Footer with date and actions */}
      {!isEditing && (detectedDate || hasCalendarAction || hasTaskAction) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-foreground/10">
          {detectedDate && (
            <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
          {!isReadOnly && hasCalendarAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 text-foreground/60 hover:text-foreground hover:bg-foreground/10 px-2"
            >
              <Calendar className="h-3 w-3" />
              Agendar
            </Button>
          )}
          {!isReadOnly && hasTaskAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 text-foreground/60 hover:text-foreground hover:bg-foreground/10 px-2"
            >
              <CheckSquare className="h-3 w-3" />
              Crear tarea
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
