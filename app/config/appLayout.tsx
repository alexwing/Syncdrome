import React, { useContext } from "react";
import { AppContainer, AppTheme } from "react-windows-ui";
import Navbar from "../components/navbar";
import { Route } from "react-router-dom";
import Home from "../views/home";
import Help from "../views/help";
import About from "../views/about";
import Settings from "../views/settings";
import Sync from "../views/sync";

const AppLayout = () => {

  return (
    <AppContainer>
      <AppTheme
        color={"#16ab9c"}
        colorDarkMode={"#1ee6d1"}
      /> 
      <Navbar />
      <Route path="/" exact component={Home} />
      <Route path="/sync" component={Sync} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/about" component={About} />
    </AppContainer>
  );
};

export default AppLayout;
