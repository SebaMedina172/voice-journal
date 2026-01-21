"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getClientTodayString } from "@/lib/date-utils"

/**
 * This component ensures that /app always has ?date= parameter
 * It redirects to /app?date=YYYY-MM-DD based on client's local timezone
 * This prevents server/client timezone mismatches
 */
export function DateRedirector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return

    const currentDate = searchParams.get("date")
    
    // If no date in URL, redirect with client's local date
    if (!currentDate) {
      hasRedirected.current = true
      const clientTodayStr = getClientTodayString()
      router.replace(`/app?date=${clientTodayStr}`)
    }
  }, [router, searchParams])

  return null
}
