import en from "./en";
import es from "./es";
import fr from "./fr";
import de from "./de";
import type { Language } from "../models/Interfaces";

// Recursively widen the literal English shape to plain strings so other
// locales (with different text) still satisfy the type.
type Stringify<T> = {
  [K in keyof T]: T[K] extends string ? string : Stringify<T[K]>;
};
export type Dict = Stringify<typeof en>;

export const SUPPORTED_LANGUAGES: Language[] = ["en", "es", "fr", "de"];
export const DEFAULT_LANGUAGE: Language = "en";

export const dictionaries: Record<Language, Dict> = {
  en: en as Dict,
  es,
  fr,
  de,
};

// Resolve a stored setting ("system" or a language) to a concrete language.
export const resolveLanguage = (
  setting: string | undefined | null
): Language => {
  if (setting && SUPPORTED_LANGUAGES.includes(setting as Language)) {
    return setting as Language;
  }
  // "system" or unknown -> browser preference -> English fallback.
  const nav =
    typeof navigator !== "undefined"
      ? (navigator.language || "").slice(0, 2).toLowerCase()
      : "";
  if (SUPPORTED_LANGUAGES.includes(nav as Language)) return nav as Language;
  return DEFAULT_LANGUAGE;
};

const lookup = (dict: Dict, path: string): string | undefined => {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
};

export const translate = (
  language: Language,
  key: string,
  vars?: Record<string, string | number>
): string => {
  const raw =
    lookup(dictionaries[language], key) ??
    lookup(dictionaries[DEFAULT_LANGUAGE], key) ??
    key;
  if (!vars) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{{${name}}}`
  );
};
