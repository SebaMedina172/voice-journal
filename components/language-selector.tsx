"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n"

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n()

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder={t("settings.sections.language.selectLanguage")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="es">{t("settings.sections.language.spanish")}</SelectItem>
        <SelectItem value="en">{t("settings.sections.language.english")}</SelectItem>
      </SelectContent>
    </Select>
  )
}
