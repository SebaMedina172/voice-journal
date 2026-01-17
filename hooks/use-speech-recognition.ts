"use client"
import { useState, useEffect, useCallback, useRef } from "react"

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseSpeechRecognitionReturn {
  text: string
  interimText: string
  isListening: boolean
  isSupported: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { lang = "es-ES", continuous = true, interimResults = true } = options
  
  const [text, setText] = useState("")
  const [interimText, setInterimText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(isListening)

  // Mantener la referencia actualizada
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognitionAPI) {
        setIsSupported(true)
        const recognition = new SpeechRecognitionAPI()
        
        recognition.lang = lang
        recognition.continuous = continuous
        recognition.interimResults = interimResults

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setText((prev) => prev + finalTranscript)
            setInterimText("")
          } else {
            setInterimText(interimTranscript)
          }
        }

        recognition.onerror = (event) => {
          if (event.error !== "no-speech" && event.error !== "aborted") {
            setIsListening(false)
          }
        }

        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              recognition.start()
            } catch (e) {
              setIsListening(false)
            }
          } else {
            setIsListening(false)
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [lang, continuous, interimResults])

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setText("")
        setInterimText("")
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
      }
    }
  }, [isListening])

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimText("")
    }
  }, [isListening])

  const reset = useCallback(() => {
    setText("")
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
  }
}