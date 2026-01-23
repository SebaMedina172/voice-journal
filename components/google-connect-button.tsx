'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function GoogleConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAfterConnect, setIsCheckingAfterConnect] = useState(false)
  const { toast } = useToast()

  // Check connection status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/auth/google/status')
      const data = await res.json()
      return data.connected
    } catch (error) {
      console.error('[v0] Error checking Google status:', error)
      return false
    }
  }

  // Initial check
  useEffect(() => {
    checkStatus().then(connected => {
      setIsConnected(connected)
      setIsLoading(false)
    })
  }, [])

  // Poll after window regains focus (when user comes back from Google)
  useEffect(() => {
    const handleFocus = async () => {
      if (isCheckingAfterConnect) {
        const connected = await checkStatus()
        if (connected) {
          setIsConnected(true)
          setIsCheckingAfterConnect(false)
          toast({
            title: 'Cuenta conectada',
            description: 'Google Calendar y Tasks vinculados correctamente.',
          })
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [isCheckingAfterConnect, toast])

  const handleConnect = () => {
    setIsCheckingAfterConnect(true)
    window.location.href = '/api/auth/google'
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
      })

      if (res.ok) {
        setIsConnected(false)
        toast({
          title: 'Cuenta desconectada',
          description: 'Google Calendar y Tasks desvinculados.',
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('[v0] Error disconnecting:', error)
      toast({
        title: 'Error',
        description: 'No se pudo desvincular la cuenta.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="w-full justify-start">
        Cargando...
      </Button>
    )
  }

  if (isConnected) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDisconnect}
        className="w-full justify-start text-destructive hover:text-destructive"
      >
        Desvincular Google
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleConnect}
      className="w-full justify-start"
    >
      Conectar Google
    </Button>
  )
}