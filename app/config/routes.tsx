import React from "react";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import "../styles/main.css";
import "react-windows-ui/config/app-config.css";
import "react-windows-ui/dist/react-windows-ui.min.css";
import "react-windows-ui/icons/winui-icons.min.css";
import AppLayout from "./appLayout";
import ThemeProvider from "../components/ThemeProvider";

const history = createBrowserHistory();

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
