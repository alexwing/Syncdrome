import "bootstrap/dist/css/bootstrap.min.css";
import "./app/styles/winui-icons.min.css";
import "./app/styles/main.css";
import AppLayout from "./app/config/appLayout";
import ThemeProvider from "./app/components/themeProvider";
import LanguageProvider from "./app/components/languageProvider";
import { HashRouter } from "react-router-dom";
import { AppContainer } from "./app/vendor/winui";

function App() {
  return (
    <AppContainer>
      <LanguageProvider>
        <ThemeProvider>
          <HashRouter>
            <AppLayout />
          </HashRouter>
        </ThemeProvider>
      </LanguageProvider>
    </AppContainer>
  );
}

export default App;
