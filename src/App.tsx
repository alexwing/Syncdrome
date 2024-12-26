import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import AppContainer from "react-windows-ui/dist/components/AppContainer";
import "react-windows-ui/config/app-config.css";
//import "react-windows-ui/dist/react-windows-ui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-windows-ui/icons/winui-icons.min.css";
import "./app/styles/main.css";
import { ThemeProvider } from "react-bootstrap";
import { HashRouter as Router } from "react-router-dom";
import AppLayout from "./app/config/appLayout";
import { createHashHistory } from "history";

function App() {

  const history = createHashHistory();
  return (
    <AppContainer>
      <ThemeProvider>
        <Router history={history}>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </AppContainer>
  );
}

export default App;
