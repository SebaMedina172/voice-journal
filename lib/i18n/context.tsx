"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type Locale, defaultLocale, translations, type Translations, getNestedValue } from "./index";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  translations: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  
  // Try to get from cookie
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === LOCALE_COOKIE_NAME && (value === "es" || value === "en")) {
      return value;
    }
  }
  
  // Try to get from browser language
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "es" || browserLang === "en") {
    return browserLang;
  }
  
  return defaultLocale;
}

function setLocaleCookie(locale: Locale) {
  // Set cookie for 1 year
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};expires=${expires.toUTCString()};path=/`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    setIsInitialized(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[locale] as unknown as Record<string, unknown>, key);
    },
    [locale]
  );

  const currentTranslations = translations[locale];

  // Prevent hydration mismatch by showing nothing until initialized
  if (!isInitialized) {
    return (
      <I18nContext.Provider
        value={{
          locale: defaultLocale,
          setLocale,
          t: (key: string) => getNestedValue(translations[defaultLocale] as unknown as Record<string, unknown>, key),
          translations: translations[defaultLocale],
        }}
      >
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        translations: currentTranslations,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
