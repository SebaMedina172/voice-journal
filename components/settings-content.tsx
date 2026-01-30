"use client"

import { ArrowLeft, Globe, Link as LinkIcon, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoogleConnectButton } from "@/components/google-connect-button"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n/context"

interface SettingsContentProps {
  userEmail: string
  onLogout: () => Promise<void>
}

export function SettingsContent({ userEmail, onLogout }: SettingsContentProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-svh cork-texture flex flex-col">
      {/* Header */}
      <header className="bg-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">{t("common.back")}</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {t("settings.title")}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {/* Account Section */}
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("settings.sections.account.title")}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("settings.sections.account.email")}
                  </p>
                  <p className="text-sm font-medium text-foreground">{userEmail}</p>
                </div>
                <div className="pt-2">
                  <form action={onLogout}>
                    <Button type="submit" variant="destructive" size="sm">
                      {t("header.logout")}
                    </Button>
                  </form>
                </div>
              </div>
            </section>

            {/* Integrations Section */}
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("settings.sections.integrations.title")}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t("settings.sections.integrations.googleAccount")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("settings.sections.integrations.googleAccountDesc")}
                  </p>
                  <GoogleConnectButton />
                </div>
              </div>
            </section>

            {/* Language Section */}
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("settings.sections.language.title")}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t("settings.sections.language.appLanguage")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("settings.sections.language.appLanguageDesc")}
                  </p>
                  <LanguageSelector />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
