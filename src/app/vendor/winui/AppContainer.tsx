import React, { useEffect } from "react";
import { Appearance } from "./appearance";

interface AppContainerProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Applies the stored color scheme on mount; when set to "system" it follows
// the OS preference live.
const AppContainer = ({ style, children }: AppContainerProps) => {
  useEffect(() => {
    const scheme = Appearance.getColorScheme();
    if (scheme === "dark") {
      Appearance.setDarkScheme(false);
      return;
    }
    if (scheme === "light") {
      Appearance.setLightScheme(false);
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) =>
      e.matches
        ? Appearance.setDarkScheme(false)
        : Appearance.setLightScheme(false);
    onChange({ matches: mql.matches } as MediaQueryListEvent);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="ui-container-flex-row" style={style}>
      {children}
    </div>
  );
};

export default AppContainer;
