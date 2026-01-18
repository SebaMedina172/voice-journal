"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Mic, MicOff, Keyboard, X } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"

interface VoiceInputProps {
  userId: string
  dayId: string | null
  todayDate: string
}

export function VoiceInput({ userId, dayId, todayDate }: VoiceInputProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingText, setIsEditingText] = useState(false)
  const router = useRouter()

  const {
    text: voiceText,
    interimText,
    isListening,
    isSupported,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ lang: "es-ES" })

  useEffect(() => {
    if (voiceText) {
      setText((prev) => (prev ? prev + " " + voiceText : voiceText))
      reset()
    }
  }, [voiceText, reset])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || isLoading) return

    if (isListening) {
      stop()
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          userId,
          dayId,
          todayDate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al procesar")
      }

      setText("")
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

  // Mostrar el texto actual + lo que se está dictando en tiempo real
  const displayText = text + (interimText ? (text ? " " : "") + interimText : "")
  const hasContent = displayText.trim().length > 0

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {(hasContent || isEditingText) && (
        <div className="w-full max-w-md">
          <div className="relative">
            <Textarea
              placeholder="Escribe o dicta lo que quieras registrar..."
              value={isListening ? displayText : text}
              onChange={(e) => !isListening && setText(e.target.value)}
              onFocus={() => setIsEditingText(true)}
              onBlur={() => !text && !isListening && setIsEditingText(false)}
              readOnly={isListening}
              className={cn(
                "resize-none bg-card border-border text-foreground placeholder:text-foreground/40 pr-8",
                "min-h-16 max-h-32 md:min-h-20 md:max-h-40 text-sm",
                isListening && "cursor-default"
              )}
              disabled={isLoading}
            />
            {text && !isLoading && !isListening && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-foreground/40 hover:text-foreground"
                onClick={() => {
                  setText("")
                  setIsEditingText(false)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {/* Keyboard toggle - only show when no content */}
        {!hasContent && !isEditingText && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditingText(true)}
            className="h-10 w-10 text-foreground/60 hover:text-foreground"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        )}

        {/* Main microphone button with waves inside when recording */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center transition-all overflow-hidden",
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
                    className="w-1 bg-white/80 rounded-full voice-wave-bar"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {!isListening && <Mic className="h-6 w-6" />}
          </button>
        )}

        {/* Send button - only show when there's content */}
        {hasContent && (
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || !text.trim()}
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Error message only */}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
