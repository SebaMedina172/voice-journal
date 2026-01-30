"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/context"

export default function SignUpSuccessPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">{t("auth.signupSuccess.title")}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("auth.signupSuccess.checkSpam")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              {t("auth.signupSuccess.message")}
            </p>
            <Button asChild variant="outline" className="w-full bg-transparent text-xs sm:text-sm">
              <Link href="/auth/login">{t("auth.signupSuccess.backToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
