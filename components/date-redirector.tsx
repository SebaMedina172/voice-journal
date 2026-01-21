"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getClientTodayString } from "@/lib/date-utils"

/**
 * This component ensures that /app always has ?date= and ?today= parameters
 * Sends both the selected date and today's date from client to server
 * This prevents any timezone mismatches
 */
export function DateRedirector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return

    const currentDate = searchParams.get("date")
    const todayDate = searchParams.get("today")
    
    // If no date params in URL, redirect with client's local dates
    if (!currentDate || !todayDate) {
      hasRedirected.current = true
      const clientTodayStr = getClientTodayString()
      router.replace(`/app?date=${clientTodayStr}&today=${clientTodayStr}`)
    }
  }, [router, searchParams])

  return null
}
