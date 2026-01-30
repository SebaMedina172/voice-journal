"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "@/lib/i18n/context"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError(t("auth.signup.errorPasswordMismatch"))
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError(t("auth.signup.errorPasswordLength"))
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/app`,
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.signup.errorGeneric"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">{t("auth.signup.title")}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("auth.signup.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">{t("auth.signup.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.signup.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm">{t("auth.signup.passwordLabel")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="repeat-password" className="text-xs sm:text-sm">{t("auth.signup.confirmPasswordLabel")}</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="text-sm"
                  />
                </div>
                {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                  {isLoading ? t("auth.signup.loadingButton") : t("auth.signup.submitButton")}
                </Button>
              </div>
              <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm">
                {t("auth.signup.hasAccount")}{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  {t("auth.signup.loginLink")}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
