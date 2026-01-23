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
import { GoogleCalendarModal, type CalendarEventData } from "@/components/google-calendar-modal"
import { GoogleTasksModal, type TaskData } from "@/components/google-tasks-modal"

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
  isSyncedCalendar: boolean
  isSyncedTasks: boolean
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
  isSyncedCalendar,
  isSyncedTasks,
  isReadOnly = false,
}: JournalCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  // Modal states
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [localSyncedCalendar, setLocalSyncedCalendar] = useState(isSyncedCalendar)
  const [localSyncedTasks, setLocalSyncedTasks] = useState(isSyncedTasks)

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
    ? new Date(detectedDate + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null

  // Handler for syncing to Google Calendar
  const handleCalendarSync = async (data: CalendarEventData) => {
    try {
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: id,
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          endTime: data.endTime,
          reminder: data.reminder,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync to calendar')
      }

      const result = await response.json()
      console.log('Calendar sync successful:', result)
      
      // Update local state to show synced status
      setLocalSyncedCalendar(true)
      
      // Refresh to update from database
      router.refresh()
    } catch (error) {
      console.error('Calendar sync error:', error)
      throw error
    }
  }

  // Handler for syncing to Google Tasks
  const handleTasksSync = async (data: TaskData) => {
    try {
      const response = await fetch('/api/google/tasks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: id,
          title: data.title,
          notes: data.notes,
          dueDate: data.dueDate,
          status: 'needsAction',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync to tasks')
      }

      const result = await response.json()
      console.log('Tasks sync successful:', result)
      
      // Update local state to show synced status
      setLocalSyncedTasks(true)
      
      // Refresh to update from database
      router.refresh()
    } catch (error) {
      console.error('Tasks sync error:', error)
      throw error
    }
  }

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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-2 border-t border-foreground/10">
          {detectedDate && (
            <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
          {!isReadOnly && (hasCalendarAction || hasTaskAction) && (
            <div className="flex items-center gap-1 ml-auto">
              {hasCalendarAction && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    localSyncedCalendar 
                      ? "text-green-600 hover:text-green-700 hover:bg-green-100/50" 
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/10"
                  )}
                  title={localSyncedCalendar ? "Ya sincronizado - Click para crear otro evento" : "Agendar en calendario"}
                  onClick={() => setIsCalendarModalOpen(true)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="sr-only">Agendar</span>
                </Button>
              )}
              {hasTaskAction && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    localSyncedTasks 
                      ? "text-green-600 hover:text-green-700 hover:bg-green-100/50" 
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/10"
                  )}
                  title={localSyncedTasks ? "Ya sincronizado - Click para crear otra tarea" : "Crear tarea"}
                  onClick={() => setIsTasksModalOpen(true)}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span className="sr-only">Crear tarea</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Google Calendar Modal */}
      <GoogleCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSync={handleCalendarSync}
        initialData={{
          title,
          description: content,
          date: detectedDate,
        }}
      />

      {/* Google Tasks Modal */}
      <GoogleTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        onSync={handleTasksSync}
        initialData={{
          title,
          description: content,
          date: detectedDate,
        }}
      />
    </div>
  )
}
