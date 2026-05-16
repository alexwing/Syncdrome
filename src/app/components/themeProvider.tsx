import { useEffect, useRef, useState } from "react";
import { ThemeContext } from "../context/themeContext";
import { Appearance } from "../vendor/winui";
import Api from "../helpers/api";
import { Settings, ThemeMode } from "../models/Interfaces";

const VALID_MODES: ThemeMode[] = ["light", "dark", "system"];

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// Resolution order: explicit choice -> system preference -> light fallback.
const resolveDark = (mode: ThemeMode): boolean => {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return prefersDark();
};

const applyDark = (dark: boolean) => {
  // Vendored winui appearance (.dark-theme / data-theme); persist=false since
  // config.json is the source of truth, not localStorage.
  if (dark) Appearance.setDarkScheme(false);
  else Appearance.setLightScheme(false);
  // Bootstrap 5.3 dark mode for the react-bootstrap screens.
  document.documentElement.setAttribute(
    "data-bs-theme",
    dark ? "dark" : "light"
  );
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(false);
  const modeRef = useRef<ThemeMode>("system");

  const apply = (m: ThemeMode) => {
    const dark = resolveDark(m);
    applyDark(dark);
    setIsDark(dark);
  };

  // Bootstrap from config.json on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let chosen: ThemeMode = "system";
      try {
        const config = (await Api.getSettings()) as Settings;
        if (config?.theme && VALID_MODES.includes(config.theme)) {
          chosen = config.theme;
        }
      } catch {
        chosen = "system";
      }
      if (cancelled) return;
      modeRef.current = chosen;
      setModeState(chosen);
      apply(chosen);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Follow OS changes only while in "system" mode.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (modeRef.current === "system") apply("system");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setMode = (m: ThemeMode) => {
    modeRef.current = m;
    setModeState(m);
    apply(m);
    // Persist the choice into config.json (read-modify-write the full config).
    (async () => {
      try {
        const config = (await Api.getSettings()) as Settings;
        await Api.saveSettings({ ...config, theme: m });
      } catch (e) {
        console.error("Could not persist theme to config.json", e);
      }
    })();
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
