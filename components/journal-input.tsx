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
import { useI18n } from "@/lib/i18n/context"

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
  const { t, locale } = useI18n()

  const {
    text: voiceText,
    interimText,
    isListening,
    isSupported,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ lang: locale === "es" ? "es-ES" : "en-US" })

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
        throw new Error(data.error || t("common.error"))
      }

      setText("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
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
      <CardContent className="pt-4 sm:pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Textarea
              placeholder={
                isListening ? t("voice.listening") : t("journal.input.placeholder")
              }
              value={text + (interimText ? (text ? " " : "") + interimText : "")}
              onChange={(e) => setText(e.target.value)}
              className={cn("min-h-24 sm:min-h-32 resize-none pr-4 text-sm sm:text-base", isListening && "bg-red-50/50 dark:bg-red-950/20")}
              disabled={isLoading}
            />
            {interimText && (
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground animate-pulse">
                {t("voice.processing")}
              </span>
            )}
          </div>

          {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}

          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span className="leading-tight">
                {isListening
                  ? t("voice.listening")
                  : locale === "es" 
                    ? "La IA organizara tu texto en cards"
                    : "AI will organize your text into cards"}
              </span>
            </p>

            <div className="flex items-center gap-2 justify-between sm:justify-start">
              {isSupported && (
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className={cn("transition-all h-8 w-8 sm:h-10 sm:w-10", isListening && "animate-pulse")}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}

              <Button 
                type="submit" 
                disabled={!text.trim() || isLoading} 
                className="gap-2 flex-1 sm:flex-none h-8 sm:h-10 text-xs sm:text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                    <span className="hidden sm:inline">{t("journal.input.submitting")}</span>
                    <span className="sm:hidden">{t("common.loading")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{t("journal.input.submitButton")}</span>
                    <span className="sm:hidden">Ok</span>
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
