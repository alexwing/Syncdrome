import React from "react";
import "react-windows-ui/config/app-config.css";
//import "react-windows-ui/dist/react-windows-ui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-windows-ui/icons/winui-icons.min.css";
import "./app/styles/main.css";
import AppLayout from "./app/config/appLayout";
import ThemeProvider from "./app/components/themeProvider";
import { HashRouter } from "react-router-dom";
import { AppContainer } from "react-windows-ui";

function App() {
  return (
    <AppContainer>
      <ThemeProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </ThemeProvider>
    </AppContainer>
  );
}

export default App;
