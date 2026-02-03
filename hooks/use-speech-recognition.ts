"use client"
import { useState, useEffect, useCallback, useRef } from "react"

const RESTART_DELAY_MS = 400
const MAX_CONSECUTIVE_FAILURES = 3
const USE_WAKE_LOCK = true

interface UseSpeechRecognitionOptions {
  lang?: string
}

interface UseSpeechRecognitionReturn {
  text: string
  interimText: string
  isListening: boolean
  isSupported: boolean
  start: () => void
  stop: () => void
  reset: () => void
  setText: (text: string) => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const { lang = "es-ES" } = options

  const [text, setTextState] = useState("")
  const [interimText, setInterimText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldKeepListeningRef = useRef(false)
  const accumulatedTextRef = useRef("")
  const consecutiveFailuresRef = useRef(0)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wakeLockRef = useRef<any>(null)
  const isRecreatingRef = useRef(false)

  const handleSetText = useCallback((newText: string) => {
    setTextState(newText)
    accumulatedTextRef.current = newText
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (!USE_WAKE_LOCK || typeof window === "undefined") return
    if (!("wakeLock" in navigator)) return

    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
    } catch (err) {
      console.warn("Wake Lock request failed:", err)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return
    try {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    } catch (err) {
      console.warn("Wake Lock release failed:", err)
    }
  }, [])

  const createRecognition = useCallback(() => {
    if (typeof window === "undefined") return null

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return null

    const recognition = new SpeechRecognitionAPI() as SpeechRecognition
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      consecutiveFailuresRef.current = 0

      let newFinalText = ""
      let currentInterim = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          newFinalText += transcript
        } else {
          currentInterim += transcript
        }
      }

      if (newFinalText) {
        const prev = accumulatedTextRef.current
        const separator = prev && !prev.endsWith(" ") ? " " : ""
        const combined = prev + separator + newFinalText

        accumulatedTextRef.current = combined
        setTextState(combined)
        setInterimText("")
      } else {
        setInterimText(currentInterim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldKeepListeningRef.current = false
        setIsListening(false)
        setInterimText("")
        releaseWakeLock()
        return
      }

      consecutiveFailuresRef.current += 1
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        shouldKeepListeningRef.current = false
        setIsListening(false)
        setInterimText("")
        releaseWakeLock()
      }
    }

    recognition.onend = () => {
      setInterimText("")

      if (!shouldKeepListeningRef.current) {
        setIsListening(false)
        releaseWakeLock()
        return
      }

      if (isRecreatingRef.current) return

      restartTimerRef.current = setTimeout(() => {
        if (!shouldKeepListeningRef.current) {
          setIsListening(false)
          releaseWakeLock()
          return
        }

        try {
          recognition.start()
        } catch {
          consecutiveFailuresRef.current += 1
          if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
            shouldKeepListeningRef.current = false
            setIsListening(false)
            releaseWakeLock()
          }
        }
      }, RESTART_DELAY_MS)
    }

    return recognition
  }, [lang, releaseWakeLock])

  useEffect(() => {
    const rec = createRecognition()
    if (!rec) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    recognitionRef.current = rec

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (shouldKeepListeningRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.abort()
          } catch {}
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current)
            restartTimerRef.current = null
          }
        }
      } else {
        if (shouldKeepListeningRef.current) {
          isRecreatingRef.current = true

          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort()
            } catch {}
          }

          const newRec = createRecognition()
          if (newRec) {
            recognitionRef.current = newRec
            consecutiveFailuresRef.current = 0

            setTimeout(() => {
              isRecreatingRef.current = false
              try {
                newRec.start()
                setIsListening(true)
              } catch {
                shouldKeepListeningRef.current = false
                setIsListening(false)
                releaseWakeLock()
              }
            }, 300)
          } else {
            shouldKeepListeningRef.current = false
            setIsListening(false)
            releaseWakeLock()
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
      releaseWakeLock()
    }
  }, [createRecognition, releaseWakeLock])

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    accumulatedTextRef.current = text
    consecutiveFailuresRef.current = 0
    shouldKeepListeningRef.current = true

    requestWakeLock()

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      shouldKeepListeningRef.current = false
      setIsListening(false)
      releaseWakeLock()
    }
  }, [isListening, text, requestWakeLock, releaseWakeLock])

  const stop = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    shouldKeepListeningRef.current = false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    setIsListening(false)
    setInterimText("")
    releaseWakeLock()
  }, [releaseWakeLock])

  const reset = useCallback(() => {
    accumulatedTextRef.current = ""
    setTextState("")
    setInterimText("")
  }, [])

  return {
    text,
    interimText,
    isListening,
    isSupported,
    start,
    stop,
    reset,
    setText: handleSetText,
  }
}