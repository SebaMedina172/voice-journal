"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  selectedDate: Date
  className?: string
}

export function DatePicker({ selectedDate, className }: DatePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [navigatingDirection, setNavigatingDirection] = React.useState<"prev" | "next" | "calendar" | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = selectedDate.toDateString() === today.toDateString()

  const navigateToDate = React.useCallback(
    (date: Date, direction: "prev" | "next" | "calendar") => {
      setIsNavigating(true)
      setNavigatingDirection(direction)
      const dateStr = format(date, "yyyy-MM-dd")
      router.push(`/app?date=${dateStr}`)
    },
    [router],
  )

  React.useEffect(() => {
    setIsNavigating(false)
    setNavigatingDirection(null)
  }, [pathname, selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      navigateToDate(date, "calendar")
      setOpen(false)
    }
  }

  const goToPreviousDay = () => {
    if (isNavigating) return
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    navigateToDate(prevDay, "prev")
  }

  const goToNextDay = () => {
    if (isNavigating) return
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    if (nextDay <= today) {
      navigateToDate(nextDay, "next")
    }
  }

  const goToToday = () => {
    if (isNavigating) return
    setIsNavigating(true)
    setNavigatingDirection("calendar")
    router.push("/app")
  }

  const canGoNext = !isToday

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousDay} disabled={isNavigating}>
        {isNavigating && navigatingDirection === "prev" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">Día anterior</span>
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            disabled={isNavigating}
            className={cn(
              "justify-start text-left font-normal h-8 px-2 gap-1.5",
              !selectedDate && "text-muted-foreground",
            )}
          >
            {isNavigating && navigatingDirection === "calendar" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CalendarIcon className="h-3.5 w-3.5" />
            )}
            <span className="capitalize">{format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date: Date) => date > today}
            initialFocus
            locale={es}
          />
          {!isToday && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full" onClick={goToToday}>
                Ir a hoy
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={goToNextDay}
        disabled={!canGoNext || isNavigating}
      >
        {isNavigating && navigatingDirection === "next" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="sr-only">Día siguiente</span>
      </Button>
    </div>
  )
}
