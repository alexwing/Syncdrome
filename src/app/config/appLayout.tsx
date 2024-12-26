import React, { useContext } from "react";
import { AppContainer, AppTheme } from "react-windows-ui";
import Navbar from "../components/navbar";
import { Route } from "react-router-dom";
import Home from "../views/home";
import ChatRtx from "../components/ChatRtx";
import About from "../views/about";
import bookmarks from "../views/bookmarks";
import FileCleaner from "../views/fileCleaner";
import FolderSync from "../views/folderSync";
import Help from "../views/help";
import Settings from "../views/settings";
import Sync from "../views/sync";


const AppLayout = () => {

  return (
    <AppContainer>
      <AppTheme
        color={"#16ab9c"}
        colorDarkMode={"#1ee6d1"}
      /> 
      <Navbar />
      <Route path="/" exact component={Home} />
      <Route path="/sync" component={Sync} />
      <Route path="/bookmarks" component={bookmarks} />
        <Route path="/chat" component={ChatRtx} />
      <Route path="/folderSync" component={FolderSync} />
      <Route path="/fileCleaner" component={FileCleaner} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/about" component={About} />
    </AppContainer>
  );
};

export default AppLayout;
