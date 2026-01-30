"use client"

import React from "react"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Mic, Keyboard, X } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface VoiceInputProps {
  userId: string
  dayId: string | null
  todayDate: string
}

export function VoiceInput({ userId, dayId, todayDate }: VoiceInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingText, setIsEditingText] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { locale } = useI18n()

  // Map locale to speech recognition language code
  const speechLang = locale === "es" ? "es-ES" : "en-US"

  const {
    text: voiceText,
    interimText,
    isListening,
    isSupported,
    start,
    stop,
    reset,
    setText,
  } = useSpeechRecognition({ lang: speechLang })

  const currentVoiceDisplay = isListening 
    ? (voiceText || "") + (interimText ? (voiceText ? " " : "") + interimText : "")
    : voiceText

    useEffect(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current
        textarea.scrollTop = textarea.scrollHeight
      }
    }, [currentVoiceDisplay])

  const hasContent = currentVoiceDisplay.trim().length > 0

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const submitText = voiceText.trim()
    if (!submitText || isLoading) return

    if (isListening) stop()

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: submitText,
          userId,
          dayId,
          todayDate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al procesar")
      }

      reset()
      setIsEditingText(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
      {(hasContent || isEditingText) && (
        <div className="w-full">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Escribe o dicta lo que quieras registrar..."
              value={currentVoiceDisplay}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsEditingText(true)}
              onBlur={() => !currentVoiceDisplay && !isListening && setIsEditingText(false)}
              readOnly={isListening}
              className={cn(
                "resize-none bg-card border-border text-foreground placeholder:text-foreground/40",
                "pl-3 pr-5 py-2",
                "min-h-16 max-h-32 sm:max-h-40 text-sm scroll-smooth",
                "custom-scrollbar",
                isListening && "cursor-default"
              )}
              disabled={isLoading}
            />
            {currentVoiceDisplay && !isLoading && !isListening && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 text-foreground/30 hover:text-foreground hover:bg-foreground/5 rounded-full"
                onClick={() => {
                  reset()
                  setIsEditingText(false)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Keyboard toggle - only show when no content */}
        {!hasContent && !isEditingText && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditingText(true)}
            className="h-9 w-9 sm:h-10 sm:w-10 text-foreground/60 hover:text-foreground flex-shrink-0"
          >
            <Keyboard className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        {/* Main microphone button with waves inside when recording */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            className={cn(
              "relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all overflow-hidden flex-shrink-0",
              "bg-accent text-accent-foreground shadow-lg hover:shadow-xl",
              "hover:scale-105 active:scale-95",
              isListening && "mic-recording bg-destructive",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          >
            {/* Voice wave visualization inside button when recording */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 sm:w-1 bg-white/80 rounded-full voice-wave-bar"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {!isListening && <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        )}

        {/* Send button - only show when there's content */}
        {hasContent && (
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || !voiceText.trim()}
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex-shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        )}
      </div>

      {/* Error message only */}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
