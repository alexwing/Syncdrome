import React, { useContext } from "react";
import { AppContainer, AppTheme } from "react-windows-ui";
import Navbar from "../components/navbar";
import { Route } from "react-router-dom";
import Home from "../views/home";
import About from "../views/about";
import { ThemeContext } from "../context/themeContext";

// Definir el nuevo componente
const AppLayout = () => {
  const { theme } = useContext(ThemeContext);

  // Usar setLightTheme y setDarkTheme donde sea necesario para cambiar el tema

  return (
    <AppContainer>
      <AppTheme
        scheme={theme} // light, dark
        color={"#16ab9c"}
        colorDarkMode={"#1ee6d1"}
        onColorChange={() => {}}
        onSchemeChange={() => {}}
      />
      <Navbar />
      <Route path="/" exact component={Home} />
      <Route path="/about" component={About} />
    </AppContainer>
  );
};

export default AppLayout;
