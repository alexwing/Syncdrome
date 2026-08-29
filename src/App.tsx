import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app/styles/winui-icons.min.css";
import "./app/styles/main.css";
import AppLayout from "./app/config/appLayout";
import ThemeProvider from "./app/components/themeProvider";
import LanguageProvider from "./app/components/languageProvider";
import { HashRouter } from "react-router-dom";
import { AppContainer } from "./app/vendor/winui";

function App() {
  // Desktop app: suppress the webview's native context menu everywhere except
  // editable fields; views provide their own context menus where needed.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

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
