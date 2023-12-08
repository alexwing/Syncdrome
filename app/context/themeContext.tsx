import { createContext } from 'react';

export const ThemeContext = createContext({
  theme: 'Light',
  setLightTheme: () => {},
  setDarkTheme: () => {},
});
