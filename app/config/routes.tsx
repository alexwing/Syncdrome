import React from "react";
import { Router } from "react-router-dom";
import { createHashHistory } from "history";
import "react-windows-ui/config/app-config.css";
//import "react-windows-ui/dist/react-windows-ui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-windows-ui/icons/winui-icons.min.css";
import "../styles/main.css";
import AppLayout from "./appLayout";
import ThemeProvider from "../components/ThemeProvider";

const history = createHashHistory();

const App = () => {
  return (
    <React.Fragment>
      <ThemeProvider>
        <Router history={history}>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
