import React, { useState } from 'react';
import { ThemeContext } from '../context/themeContext';
import Appearance from './Appearance';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const setLightTheme = () => {
    Appearance.setLightScheme();
    setTheme('light');
  };

  const setDarkTheme = () => {
    Appearance.setDarkScheme();
    setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;