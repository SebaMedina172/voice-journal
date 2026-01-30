import es from "./locales/es.json";
import en from "./locales/en.json";

export type Locale = "es" | "en";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export const translations = {
  es,
  en,
} as const;

export type Translations = typeof es;

// Helper to get nested translation value
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the path if translation not found
    }
  }
  
  return typeof result === "string" ? result : path;
}

export function getTranslation(locale: Locale, key: string): string {
  return getNestedValue(translations[locale] as unknown as Record<string, unknown>, key);
}
