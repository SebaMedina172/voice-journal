"use client"

import * as React from "react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatLocalDate, getClientTodayString, isSameDay, parseLocalDate } from "@/lib/date-utils"
import { useI18n } from "@/lib/i18n/context"

interface DatePickerProps {
  selectedDate: Date
  className?: string
}

export function DatePicker({ selectedDate, className }: DatePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [navigatingDirection, setNavigatingDirection] = React.useState<"prev" | "next" | "calendar" | null>(null)

  const todayStr = getClientTodayString()
  const today = parseLocalDate(todayStr)
  const isToday = isSameDay(selectedDate, today)
  const dateLocale = locale === "es" ? es : enUS

  const navigateToDate = React.useCallback(
    (date: Date, direction: "prev" | "next" | "calendar") => {
      setIsNavigating(true)
      setNavigatingDirection(direction)
      const dateStr = formatLocalDate(date)
      router.push(`/app?date=${dateStr}&today=${todayStr}`)
    },
    [router, todayStr],
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
    const prevDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1)
    navigateToDate(prevDay, "prev")
  }

  const goToNextDay = () => {
    if (isNavigating) return
    const nextDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
    if (nextDay <= today) {
      navigateToDate(nextDay, "next")
    }
  }

  const goToToday = () => {
    if (isNavigating) return
    setIsNavigating(true)
    setNavigatingDirection("calendar")
    router.push(`/app?date=${todayStr}&today=${todayStr}`)
  }

  const canGoNext = !isToday

  const prevDayLabel = locale === "es" ? "Dia anterior" : "Previous day"
  const nextDayLabel = locale === "es" ? "Dia siguiente" : "Next day"

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 flex-shrink-0" 
        onClick={goToPreviousDay} 
        disabled={isNavigating}
        title={prevDayLabel}
      >
        {isNavigating && navigatingDirection === "prev" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">{prevDayLabel}</span>
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            disabled={isNavigating}
            className={cn(
              "justify-center text-center font-normal h-8 px-2 sm:px-3 gap-1.5",
              !selectedDate && "text-muted-foreground",
            )}
          >
            {isNavigating && navigatingDirection === "calendar" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
            ) : (
              <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span className="capitalize whitespace-nowrap text-xs sm:text-sm">
              {format(selectedDate, "EEE d MMM", { locale: dateLocale })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date: Date) => date > today}
            initialFocus
            locale={dateLocale}
          />
          {!isToday && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs sm:text-sm" onClick={goToToday}>
                {t("datePicker.goToToday")}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={goToNextDay}
        disabled={!canGoNext || isNavigating}
        title={nextDayLabel}
      >
        {isNavigating && navigatingDirection === "next" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="sr-only">{nextDayLabel}</span>
      </Button>
    </div>
  )
}
