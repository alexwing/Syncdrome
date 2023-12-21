import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { NavBar, NavBarThemeSwitch, NavBarLink } from "react-windows-ui";
import { ThemeContext } from "../context/themeContext";

const Navbar = () => {
  const history = useHistory();
  const { theme, setLightTheme, setDarkTheme } = useContext(ThemeContext);

  const setTheme = () => {
    //current navigator version
    console.log("Navigator: " + navigator.appVersion);
    if (theme === "light") {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  };

  return (
    <NavBar
      title="Syncdrome"
      shadowOnScroll={true}
      titleBarMobile={
        <div>
          <span className="app-navbar-name">Syncdrome</span>
        </div>
      }
    >
      {
        //<NavBarThemeSwitch onChange={(e) => setTheme()} />
      }
      <NavBarLink
        text="Home"
        icon={<i className="icons10-home"></i>}
        onClick={() => {
          history.push("/");
        }}
      />
      <NavBarLink
        text="Sync"
        icon={<i className="icons10-sync"></i>}
        onClick={() => {
          history.push("/sync");
        }}
      />
      <NavBarLink
        text="Settings"
        icon={<i className="icons10-settings"></i>}
        onClick={() => {
          history.push("/settings");
        }}
      />
      <NavBarLink
        text="Help"
        icon={<i className="icons10-question-mark"></i>}
        onClick={() => {
          history.push("/help");
        }}
      />
      <NavBarLink
        text="About"
        icon={<i className="icons10-info"></i>}
        onClick={() => {
          history.push("/about");
        }}
      />
    </NavBar>
  );
};

export default Navbar;
