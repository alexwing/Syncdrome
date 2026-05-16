import { useRef } from "react";
import { Appearance } from "./appearance";

interface NavBarThemeSwitchProps {
  onChange?: (scheme: "dark" | "light") => void;
}

const NavBarThemeSwitch = ({ onChange = () => {} }: NavBarThemeSwitchProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className="ui-navbar-theme-switch">
      <input
        ref={ref}
        type="checkbox"
        id="ui-navbar-theme-switch"
        onClick={() => {
          const scheme = ref.current?.checked ? "dark" : "light";
          if (scheme === "dark") Appearance.setDarkScheme();
          else Appearance.setLightScheme();
          onChange(scheme);
        }}
      />
      <div className="ui-navbar-theme-switch-icon" />
    </label>
  );
};

export default NavBarThemeSwitch;
