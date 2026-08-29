import React from "react";
import { AppContainer, AppTheme } from "../vendor/winui";
import Navbar from "../components/navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../views/home";
import About from "../views/about";
import Bookmarks from "../views/bookmarks";
import FileCleaner from "../views/fileCleaner";
import FolderSync from "../views/folderSync";
import Help from "../views/help";
import Settings from "../views/settings";
import Sync from "../views/sync";
import Explorer from "../views/Navigator";
import KeepAliveRoutes from "../components/keepAliveRoutes";

// Working views keep their state (results, logs, running jobs) across tab
// switches. Utility views (bookmarks, settings, help, about) remount on each
// visit so they always show fresh data.
const PERSISTENT_VIEWS = [
  { path: "/", element: <Home /> },
  { path: "/explorer", element: <Explorer /> },
  { path: "/sync", element: <Sync /> },
  { path: "/folderSync", element: <FolderSync /> },
  { path: "/fileCleaner", element: <FileCleaner /> },
];

const AppLayout = () => {
  return (
    <AppContainer>
      {/* Primary color only; light/dark is owned by ThemeProvider. */}
      <AppTheme color={"#16ab9c"} colorDarkMode={"#1ee6d1"} />
      <Navbar />
      <KeepAliveRoutes routes={PERSISTENT_VIEWS}>
        <Routes>
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </KeepAliveRoutes>
    </AppContainer>
  );
};

export default AppLayout;
