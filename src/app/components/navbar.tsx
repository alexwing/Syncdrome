import React, { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { NavBar, NavBarThemeSwitch, NavBarLink } from "react-windows-ui";
import { ThemeContext } from "../context/themeContext";
import Api from "../helpers/api";
import { Settings } from "../models/Interfaces";

const Navbar = () => {
  const history = useHistory();
  const location = useLocation();
  const { theme, setLightTheme, setDarkTheme } = useContext(ThemeContext);
  const [config, setConfig] = useState({
    folder: "",
    NODE_ENV: "",
    extensions: {},
  } as Settings);

  const setTheme = () => {
    if (theme === "light") {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  };

  useEffect(() => {
    Api.getSettings().then((response:any) => {
      setConfig(response);
    });
  }, []);

  const navigateTo = (path: string) => {
    if (location.pathname !== path) {
      history.push(path);
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
      <NavBarLink
        text="Home"
        icon={<i className="icons10-home"></i>}
        onClick={() => {
          navigateTo("/");
        }}
      />
      <NavBarLink
        text="Explorer"
        icon={<i className="icons10-folder"></i>}
        onClick={() => {
          navigateTo("/explorer");
        }}
      />
      <NavBarLink
        text="Sync"
        icon={<i className="icons10-sync"></i>}
        onClick={() => {
          navigateTo("/sync");
        }}
      />
      <NavBarLink
        text="Bookmarks"
        icon={<i className="icons10-bookmark"></i>}
        onClick={() => {
          navigateTo("/bookmarks");
        }}
      />
      {config.NODE_ENV === "development" && (
        <NavBarLink
          text="Chat"
          icon={<i className="icons10-chat"></i>}
          onClick={() => {
            navigateTo("/chat");
          }}
        />
      )}
      <NavBarLink
        text="Folder Sync"
        icon={<i className="icons10-columns"></i>}
        onClick={() => {
          navigateTo("/folderSync");
        }}
      />
      <NavBarLink
        text="File Cleaner"
        icon={<i className="icons10-file"></i>}
        onClick={() => {
          navigateTo("/fileCleaner");
        }}
      />
      <NavBarLink
        text="Settings"
        icon={<i className="icons10-settings"></i>}
        onClick={() => {
          navigateTo("/settings");
        }}
      />
      <NavBarLink
        text="Help"
        icon={<i className="icons10-question-mark"></i>}
        onClick={() => {
          navigateTo("/help");
        }}
      />
      <NavBarLink
        text="About"
        icon={<i className="icons10-info"></i>}
        onClick={() => {
          navigateTo("/about");
        }}
      />
    </NavBar>
  );
};

export default Navbar;
