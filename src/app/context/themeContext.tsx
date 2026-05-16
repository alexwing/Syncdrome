import { createContext } from "react";
import { ThemeMode } from "../models/Interfaces";

export interface ThemeContextValue {
  // The user's choice (may be "system").
  mode: ThemeMode;
  // Whether the resolved appearance is currently dark.
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  isDark: false,
  setMode: () => {},
});
