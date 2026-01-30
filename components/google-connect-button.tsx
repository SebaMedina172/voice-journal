'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n/context'

export function GoogleConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAfterConnect, setIsCheckingAfterConnect] = useState(false)
  const { toast } = useToast()
  const { t, locale } = useI18n()

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
            title: locale === "es" ? 'Cuenta conectada' : 'Account connected',
            description: locale === "es" 
              ? 'Google Calendar y Tasks vinculados correctamente.'
              : 'Google Calendar and Tasks linked successfully.',
          })
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [isCheckingAfterConnect, toast, locale])

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
          title: locale === "es" ? 'Cuenta desconectada' : 'Account disconnected',
          description: locale === "es"
            ? 'Google Calendar y Tasks desvinculados.'
            : 'Google Calendar and Tasks unlinked.',
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('[v0] Error disconnecting:', error)
      toast({
        title: t("common.error"),
        description: locale === "es" 
          ? 'No se pudo desvincular la cuenta.'
          : 'Could not unlink account.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        {t("common.loading")}
      </Button>
    )
  }

  if (isConnected) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDisconnect}
      >
        {t("settings.sections.integrations.disconnect")} Google
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleConnect}
    >
      {t("settings.sections.integrations.connectGoogle")}
    </Button>
  )
}
