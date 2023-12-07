import React from "react";
import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import Home from "../views/home";
import About from "../views/about";
import "../styles/main.css";
import Navbar from "../components/navbar";
import { AppContainer } from "react-windows-ui";
import "react-windows-ui/config/app-config.css";
import "react-windows-ui/dist/react-windows-ui.min.css";
import "react-windows-ui/icons/winui-icons.min.css";
import { AppTheme } from "react-windows-ui";

const history = createBrowserHistory();

const Routes = (


  <Router history={history}>
    <AppContainer>
      <AppTheme
        scheme={"light"}
        color={"#16ab9c"}        
        colorDarkMode={"#1ee6d1"}
        onColorChange={() => {}}
        onSchemeChange={() => {}}
      />
      <Navbar />
      <Route path="/" exact component={Home} />
      <Route path="about" component={About} />
    </AppContainer>
  </Router>
);

export default Routes;
