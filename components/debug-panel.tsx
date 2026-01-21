"use client"

import { useEffect, useState } from "react"
import { getClientTodayString, parseLocalDate, formatLocalDate, getTodayLocal } from "@/lib/date-utils"

interface DebugPanelProps {
  selectedDate: Date
  selectedDateStr: string
}

export function DebugPanel({ selectedDate, selectedDateStr }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    const clientToday = getClientTodayString()
    const now = new Date()
    const serverToday = getTodayLocal()
    const serverTodayFormatted = formatLocalDate(serverToday)
    
    const info = {
      clientLocalTime: now.toLocaleString("es-ES"),
      clientUTCTime: now.toUTCString(),
      getClientTodayString: clientToday,
      getTodayLocal: serverToday.toLocaleString("es-ES"),
      formatLocalDate_getTodayLocal: serverTodayFormatted,
      URLparam_selectedDateStr: selectedDateStr,
      parseLocalDate_selectedDateStr: parseLocalDate(selectedDateStr).toLocaleString("es-ES"),
      selectedDate_prop: selectedDate.toLocaleString("es-ES"),
      formatLocalDate_selectedDate: formatLocalDate(selectedDate),
      clientToday_matches_URLparam: clientToday === selectedDateStr,
      serverToday_matches_URLparam: serverTodayFormatted === selectedDateStr,
      browser_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    
    setDebugInfo(info)
  }, [selectedDate, selectedDateStr])

  return (
    <div 
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "#00ff00",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "11px",
        fontFamily: "monospace",
        maxWidth: "500px",
        maxHeight: "600px",
        overflowY: "auto",
        zIndex: 99999,
        border: "2px solid #00ff00",
        boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)"
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "12px" }}>
        🐛 DEBUG PANEL (Producción)
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: "10px" }}>
        {Object.entries(debugInfo).map(([key, value]) => 
          `${key}: ${typeof value === 'boolean' ? (value ? '✓' : '✗') : value}`
        ).join('\n')}
      </pre>
    </div>
  )
}
