import React from "react";

interface AppContainerProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Layout wrapper only. Theme bootstrapping is owned by ThemeProvider
// (single source of truth: config.json -> system -> light).
const AppContainer = ({ style, children }: AppContainerProps) => (
  <div className="ui-container-flex-row" style={style}>
    {children}
  </div>
);

export default AppContainer;
