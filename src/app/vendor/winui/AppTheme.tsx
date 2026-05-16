import { useEffect } from "react";
import { Appearance, ColorScheme } from "./appearance";

interface AppThemeProps {
  scheme?: ColorScheme;
  color?: string;
  colorDarkMode?: string;
  onColorChange?: () => void;
  onSchemeChange?: () => void;
}

// Sets the primary color CSS variables and (optionally) forces a color scheme.
// Renders nothing.
const AppTheme = ({
  scheme,
  color,
  colorDarkMode,
  onColorChange = () => {},
  onSchemeChange = () => {},
}: AppThemeProps) => {
  useEffect(() => {
    if (!scheme) return;
    if (scheme === "dark") Appearance.setDarkScheme();
    else if (scheme === "light") Appearance.setLightScheme();
    else if (scheme === "system") Appearance.setSystemScheme();
    onSchemeChange();
  }, [scheme]);

  useEffect(() => {
    if (!color) return;
    document.documentElement.style.setProperty("--PrimaryColor", color);
    document.documentElement.style.setProperty(
      "--PrimaryColorLight",
      colorDarkMode || color
    );
    onColorChange();
  }, [color, colorDarkMode]);

  return null;
};

export default AppTheme;
