"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "@/lib/i18n/context"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const errorMessage = searchParams.get("error")

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{t("auth.error.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:gap-4">
            {errorMessage ? (
              <p className="text-xs sm:text-sm text-muted-foreground break-words">Error: {errorMessage}</p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">{t("auth.error.defaultMessage")}</p>
            )}
            <Button asChild variant="outline" className="w-full bg-transparent text-xs sm:text-sm">
              <Link href="/auth/login">{t("auth.error.tryAgain")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh w-full items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
