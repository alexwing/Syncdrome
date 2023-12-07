import React from "react";
import { useHistory } from "react-router-dom";
import { NavBar, NavBarThemeSwitch, NavBarLink } from "react-windows-ui";

const Navbar = () => {
  const history = useHistory();

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
      <NavBarThemeSwitch />
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