import React, { createContext, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

/**
 * Selective keep-alive for routed views.
 *
 * Views passed in `routes` are mounted the first time the user visits them
 * and stay mounted afterwards: switching tabs only toggles their visibility,
 * so search results, logs, scroll position and in-flight operations survive.
 * Hidden views keep their layout (visibility, not display:none) so scroll
 * positions are preserved and polling intervals keep running.
 *
 * Views that must load fresh on every visit (settings, help, about,
 * bookmarks) go in `children` as a regular <Routes> block.
 */

interface KeepAliveRoute {
  path: string;
  element: React.ReactNode;
}

interface KeepAliveRoutesProps {
  routes: KeepAliveRoute[];
  children?: React.ReactNode;
}

const ViewActiveContext = createContext(true);

/** True while the enclosing keep-alive view is the visible tab. */
export const useViewActive = () => useContext(ViewActiveContext);

const KeepAliveRoutes = ({ routes, children }: KeepAliveRoutesProps) => {
  const { pathname } = useLocation();
  const visitedRef = useRef(new Set<string>());
  const isPersistentPath = routes.some((route) => route.path === pathname);
  if (isPersistentPath) {
    visitedRef.current.add(pathname);
  }

  return (
    <div className="keep-alive-views">
      {routes
        .filter((route) => visitedRef.current.has(route.path))
        .map((route) => {
          const active = pathname === route.path;
          return (
            <ViewActiveContext.Provider value={active} key={route.path}>
              <div
                className={classNames("keep-alive-view", {
                  "keep-alive-view-hidden": !active,
                })}
              >
                {route.element}
              </div>
            </ViewActiveContext.Provider>
          );
        })}
      {!isPersistentPath && children}
    </div>
  );
};

export default KeepAliveRoutes;
