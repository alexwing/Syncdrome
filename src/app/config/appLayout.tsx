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

const AppLayout = () => {
  return (
    <AppContainer>
      {/* Forced light for now; switch this to a stateful value when the
          light/dark toggle is implemented. */}
      <AppTheme
        scheme={"light"}
        color={"#16ab9c"}
        colorDarkMode={"#1ee6d1"}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sync" element={<Sync />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/folderSync" element={<FolderSync />} />
        <Route path="/fileCleaner" element={<FileCleaner />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AppContainer>
  );
};

export default AppLayout;
