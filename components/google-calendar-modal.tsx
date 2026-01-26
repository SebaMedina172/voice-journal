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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Bell, Loader2 } from "lucide-react"

interface GoogleCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onSync: (data: CalendarEventData) => Promise<void>
  initialData: {
    title: string
    description: string
    date: string | null
  }
  previouslySynced?: boolean
}

export interface CalendarEventData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  reminder: string
}

const REMINDER_OPTIONS = [
  { value: "none", label: "Sin recordatorio" },
  { value: "0", label: "Al momento del evento" },
  { value: "5", label: "5 minutos antes" },
  { value: "15", label: "15 minutos antes" },
  { value: "30", label: "30 minutos antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 dia antes" },
]

export function GoogleCalendarModal({
  isOpen,
  onClose,
  onSync,
  initialData,
  previouslySynced = false,
}: GoogleCalendarModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("10:00")
  const [reminder, setReminder] = useState("15")
  const [isSyncing, setIsSyncing] = useState(false)

  // Pre-populate fields when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      
      // Use detected date or default to today
      const dateToUse = initialData.date || new Date().toISOString().split("T")[0]
      setStartDate(dateToUse)
      setEndDate(dateToUse)
      
      // Reset times to defaults
      setStartTime("09:00")
      setEndTime("10:00")
      setReminder("15")
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !startDate || !endDate) return
    
    setIsSyncing(true)
    try {
      await onSync({
        title: title.trim(),
        description: description.trim(),
        startDate,
        startTime,
        endDate,
        endTime,
        reminder,
      })
      onClose()
    } catch (error) {
      console.error("Error syncing to calendar:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleClose = () => {
    if (!isSyncing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Crear Evento en Calendar
          </DialogTitle>
          <DialogDescription>
            Revisa y modifica los datos antes de sincronizar con Google Calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning if previously synced */}
          {previouslySynced && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Esta card ya fue sincronizada anteriormente. Se creara un nuevo evento en tu calendario.
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">Titulo</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo del evento"
              className="bg-input"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Descripcion</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion del evento (opcional)"
              className="bg-input min-h-[80px] resize-none"
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Fecha inicio
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  // If end date is before start date, update it
                  if (e.target.value > endDate) {
                    setEndDate(e.target.value)
                  }
                }}
                className="bg-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Hora inicio
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-input"
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Fecha fin
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="bg-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Hora fin
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-input"
                required
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminder" className="flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              Recordatorio
            </Label>
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger className="w-full bg-input">
                <SelectValue placeholder="Seleccionar recordatorio" />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={isSyncing || !title.trim() || !startDate || !endDate}
              className="gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Crear Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
