"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckSquare, Calendar, Loader2 } from "lucide-react"

interface GoogleTasksModalProps {
  isOpen: boolean
  onClose: () => void
  onSync: (data: TaskData) => Promise<void>
  initialData: {
    title: string
    description: string
    date: string | null
  }
  previouslySynced?: boolean
}

export interface TaskData {
  title: string
  notes: string
  dueDate: string | null
}

export function GoogleTasksModal({
  isOpen,
  onClose,
  onSync,
  initialData,
  previouslySynced = false,
}: GoogleTasksModalProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  // Pre-populate fields when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title || "")
      setNotes(initialData.description || "")
      setDueDate(initialData.date || "")
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    setIsSyncing(true)
    try {
      await onSync({
        title: title.trim(),
        notes: notes.trim(),
        dueDate: dueDate || null,
      })
      onClose()
    } catch (error) {
      console.error("Error syncing to tasks:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleClose = () => {
    if (!isSyncing) {
      onClose()
    }
  }

  const handleClearDate = () => {
    setDueDate("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground pr-8">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="text-sm sm:text-base">Crear Tarea en Google Tasks</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Revisa y modifica los datos antes de sincronizar con Google Tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning if previously synced */}
          {previouslySynced && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Esta card ya fue sincronizada anteriormente. Se creara una nueva tarea en Google Tasks.
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Titulo</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo de la tarea"
              className="bg-input"
              required
            />
          </div>

          {/* Notes/Description */}
          <div className="space-y-2">
            <Label htmlFor="task-notes">Notas</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              className="bg-input min-h-[100px] resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date" className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Fecha de vencimiento
            </Label>
            <div className="flex gap-2">
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-input flex-1"
              />
              {dueDate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearDate}
                  className="text-xs bg-transparent"
                >
                  Quitar fecha
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes dejar la fecha vacia si la tarea no tiene vencimiento.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSyncing}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSyncing || !title.trim()}
              className="gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Crear Tarea
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
