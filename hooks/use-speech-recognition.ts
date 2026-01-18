"use client"
import { useState, useEffect, useCallback, useRef } from "react"

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

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { lang = "es-ES" } = options
  
  const [text, setTextState] = useState("")
  const [interimText, setInterimText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(isListening)
  const accumulatedTextRef = useRef("") 

  const handleSetText = useCallback((newText: string) => {
    setTextState(newText)
    accumulatedTextRef.current = newText
  }, [])

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
        recognition.continuous = false 
        recognition.interimResults = true

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let newFinalText = ""
          let currentInterim = ""

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript
            
            if (result.isFinal) {
              newFinalText += transcript
            } else {
              currentInterim += transcript
            }
          }

          if (newFinalText) {
            const prevText = accumulatedTextRef.current

            const separator = prevText && !prevText.endsWith(" ") ? " " : ""
            const finalTextCombined = prevText + separator + newFinalText
            
            accumulatedTextRef.current = finalTextCombined
            setTextState(finalTextCombined)
            setInterimText("")
          } else {
            setInterimText(currentInterim)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
            setInterimText("")
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
  }, [lang])

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        accumulatedTextRef.current = text 
        
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error(e)
      }
    }
  }, [isListening, text])

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimText("")
    }
  }, [isListening])

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