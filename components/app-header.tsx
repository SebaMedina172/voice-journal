"use client"

import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { parseLocalDate } from "@/lib/date-utils"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/context"

interface AppHeaderProps {
  userEmail: string
  selectedDateStr: string
}

export function AppHeader({ userEmail, selectedDateStr }: AppHeaderProps) {
  const selectedDate = parseLocalDate(selectedDateStr)
  const { t } = useTranslation()

  return (
    <header className="bg-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 max-w-6xl">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-10">
          {/* Title - hidden on mobile */}
          <h1 className="hidden sm:block text-sm sm:text-base font-semibold tracking-tight text-foreground whitespace-nowrap flex-shrink-0">
            Daily Voice Journal
          </h1>
          
          {/* Date picker - takes center space on mobile */}
          <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
            <DatePicker selectedDate={selectedDate} />
          </div>
          
          {/* User settings button */}
          <div className="flex-shrink-0">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-card hover:bg-card/80 text-foreground border border-border h-8 w-8 flex-shrink-0"
              >
                <User className="h-4 w-4" />
                <span className="sr-only">{t("header.settings")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
