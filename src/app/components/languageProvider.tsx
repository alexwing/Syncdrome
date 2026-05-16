import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "../context/languageContext";
import { resolveLanguage, translate } from "../i18n";
import Api from "../helpers/api";
import { Language, LanguageSetting, Settings } from "../models/Interfaces";

const VALID: LanguageSetting[] = ["system", "en", "es", "fr", "de"];

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageSetting>("system");
  const [resolved, setResolved] = useState<Language>(
    resolveLanguage("system")
  );

  // Bootstrap from config.json: config -> system -> English.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let chosen: LanguageSetting = "system";
      try {
        const config = (await Api.getSettings()) as Settings;
        if (config?.language && VALID.includes(config.language)) {
          chosen = config.language;
        }
      } catch {
        chosen = "system";
      }
      if (cancelled) return;
      setLanguageState(chosen);
      setResolved(resolveLanguage(chosen));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((lang: LanguageSetting) => {
    setLanguageState(lang);
    setResolved(resolveLanguage(lang));
    (async () => {
      try {
        const config = (await Api.getSettings()) as Settings;
        await Api.saveSettings({ ...config, language: lang });
      } catch (e) {
        console.error("Could not persist language to config.json", e);
      }
    })();
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(resolved, key, vars),
    [resolved]
  );

  const value = useMemo(
    () => ({ language, resolved, setLanguage, t }),
    [language, resolved, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
