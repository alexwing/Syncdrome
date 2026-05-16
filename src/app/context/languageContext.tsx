import { createContext, useContext } from "react";
import type { Language, LanguageSetting } from "../models/Interfaces";

export interface LanguageContextValue {
  // User's choice (may be "system").
  language: LanguageSetting;
  // Concrete resolved language actually in use.
  resolved: Language;
  setLanguage: (lang: LanguageSetting) => void;
  // Translation function: t("settings.title", { name: "x" }).
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: "system",
  resolved: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const useTranslation = () => useContext(LanguageContext);
