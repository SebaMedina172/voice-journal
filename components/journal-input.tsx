"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, Sparkles, Mic, MicOff } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"

interface JournalInputProps {
  userId: string
  dayId: string | null
  todayDate: string
}

export function JournalInput({ userId, dayId, todayDate }: JournalInputProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    // Stop listening if active
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
    <Card className={cn("bg-card/50 backdrop-blur-sm transition-all", isListening && "ring-2 ring-red-500/50")}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Textarea
              placeholder={
                isListening ? "Escuchando... habla ahora" : "¿Qué tienes en mente hoy? Escribe o usa el micrófono..."
              }
              value={text + (interimText ? (text ? " " : "") + interimText : "")}
              onChange={(e) => setText(e.target.value)}
              className={cn("min-h-32 resize-none pr-4 text-base", isListening && "bg-red-50/50 dark:bg-red-950/20")}
              disabled={isLoading}
            />
            {interimText && (
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground animate-pulse">
                transcribiendo...
              </span>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {isListening
                ? "Grabando voz... pulsa el micrófono para detener"
                : "La IA analizará tu texto y creará cards organizadas"}
            </p>

            <div className="flex items-center gap-2">
              {isSupported && (
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className={cn("transition-all", isListening && "animate-pulse")}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}

              <Button type="submit" disabled={!text.trim() || isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
