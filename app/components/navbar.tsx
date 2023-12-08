import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  NavBar,
  NavBarThemeSwitch,
  NavBarLink,
} from "react-windows-ui";
import { ThemeContext } from '../context/themeContext';

const Navbar = () => {
  const history = useHistory();
  const { theme, setLightTheme, setDarkTheme } = useContext(ThemeContext);

  const setTheme = () => {
    if (theme === 'light') {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  }


  return (
    <NavBar
      title="Hard Drive Content Finder"
      shadowOnScroll={true}
      titleBarMobile={
        <div>
          <span className="app-navbar-name">Hard Drive Content Finder</span>
        </div>
      }
    >

      <NavBarThemeSwitch onChange={(e) => setTheme()} />
      <NavBarLink
        text="Home"
        icon={<i className="icons10-home"></i>}
        onClick={() => {
          history.push("/");
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
