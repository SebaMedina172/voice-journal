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
import { useI18n } from "@/lib/i18n/context"

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

export function GoogleCalendarModal({
  isOpen,
  onClose,
  onSync,
  initialData,
  previouslySynced = false,
}: GoogleCalendarModalProps) {
  const { t, locale } = useI18n()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("10:00")
  const [reminder, setReminder] = useState("15")
  const [isSyncing, setIsSyncing] = useState(false)

  const REMINDER_OPTIONS = [
    { value: "none", label: locale === "es" ? "Sin recordatorio" : "No reminder" },
    { value: "0", label: locale === "es" ? "Al momento del evento" : "At time of event" },
    { value: "5", label: locale === "es" ? "5 minutos antes" : "5 minutes before" },
    { value: "15", label: locale === "es" ? "15 minutos antes" : "15 minutes before" },
    { value: "30", label: locale === "es" ? "30 minutos antes" : "30 minutes before" },
    { value: "60", label: locale === "es" ? "1 hora antes" : "1 hour before" },
    { value: "1440", label: locale === "es" ? "1 dia antes" : "1 day before" },
  ]

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
          <DialogTitle className="flex items-center gap-2 text-foreground pr-8">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="text-sm sm:text-base">
              {locale === "es" ? "Crear Evento en Calendar" : "Create Calendar Event"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {locale === "es" 
              ? "Revisa y modifica los datos antes de sincronizar con Google Calendar."
              : "Review and modify the data before syncing with Google Calendar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning if previously synced */}
          {previouslySynced && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {locale === "es"
                  ? "Esta card ya fue sincronizada anteriormente. Se creara un nuevo evento en tu calendario."
                  : "This card was previously synced. A new event will be created in your calendar."}
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">
              {locale === "es" ? "Titulo" : "Title"}
            </Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={locale === "es" ? "Titulo del evento" : "Event title"}
              className="bg-input"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">
              {locale === "es" ? "Descripcion" : "Description"}
            </Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === "es" ? "Descripcion del evento (opcional)" : "Event description (optional)"}
              className="bg-input min-h-[80px] resize-none"
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {locale === "es" ? "Fecha inicio" : "Start date"}
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
                {locale === "es" ? "Hora inicio" : "Start time"}
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
                {locale === "es" ? "Fecha fin" : "End date"}
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
                {locale === "es" ? "Hora fin" : "End time"}
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
              {locale === "es" ? "Recordatorio" : "Reminder"}
            </Label>
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger className="w-full bg-input">
                <SelectValue placeholder={locale === "es" ? "Seleccionar recordatorio" : "Select reminder"} />
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSyncing || !title.trim() || !startDate || !endDate}
              className="gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {locale === "es" ? "Sincronizando..." : "Syncing..."}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  {locale === "es" ? "Crear Evento" : "Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
