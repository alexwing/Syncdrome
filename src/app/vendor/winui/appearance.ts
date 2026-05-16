// Vendored from react-windows-ui (discontinued). Theme manager: toggles the
// `dark-theme` body class and `data-theme` attribute, keeps the navbar theme
// switch in sync, and persists the choice in localStorage.

const STORAGE_KEY = "lc_storage_theme_key";

export type ColorScheme = "dark" | "light" | "system";

const syncSwitch = (checked: boolean) => {
  const el = document.getElementById(
    "ui-navbar-theme-switch"
  ) as HTMLInputElement | null;
  if (el) el.checked = checked;
};

export const getColorScheme = (): ColorScheme => {
  return (localStorage.getItem(STORAGE_KEY) as ColorScheme) || "system";
};

export const setDarkScheme = (persist = true): void => {
  document.body.classList.add("dark-theme");
  document.documentElement.setAttribute("data-theme", "dark");
  syncSwitch(true);
  if (persist) localStorage.setItem(STORAGE_KEY, "dark");
};

export const setLightScheme = (persist = true): void => {
  document.body.classList.remove("dark-theme");
  document.documentElement.setAttribute("data-theme", "light");
  syncSwitch(false);
  if (persist) localStorage.setItem(STORAGE_KEY, "light");
};

export const setSystemScheme = (): void => {
  localStorage.setItem(STORAGE_KEY, "system");
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    setDarkScheme(false);
  } else {
    setLightScheme(false);
  }
};

export const Appearance = {
  getColorScheme,
  setDarkScheme,
  setLightScheme,
  setSystemScheme,
};
