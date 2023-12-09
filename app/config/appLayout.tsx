import React, { useContext } from "react";
import { AppContainer, AppTheme } from "react-windows-ui";
import Navbar from "../components/navbar";
import { Route } from "react-router-dom";
import Home from "../views/home";
import About from "../views/about";
import { ThemeContext } from "../context/themeContext";
import Settings from "../views/settings";

const AppLayout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <AppContainer>
      <AppTheme
        color={"#16ab9c"}
        colorDarkMode={"#1ee6d1"}
      /> 
      <Navbar />
      <Route path="/" exact component={Home} />
      <Route path="/about" component={About} />
      <Route path="/settings" component={Settings} />
    </AppContainer>
  );
};

export default AppLayout;