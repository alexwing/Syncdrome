import React, { useEffect, useRef, useState } from "react";
import { ScrollView } from "./scrollView";

interface NavBarProps {
  title?: string;
  shadowOnScroll?: boolean;
  titleBarMobile?: React.ReactNode;
  collapsed?: boolean;
  children?: React.ReactNode;
}

const MOBILE_BREAKPOINT = 760;

const NavBar = ({
  title,
  shadowOnScroll,
  titleBarMobile,
  collapsed: collapsedProp,
  children,
}: NavBarProps) => {
  const navRef = useRef<HTMLElement>(null);
  const lastWidth = useRef(window.innerWidth);
  const [shadow, setShadow] = useState(false);
  const [collapsed, setCollapsed] = useState(!!collapsedProp);
  const [floatClass, setFloatClass] = useState("");

  const animateCollapse = (fn: () => void) => {
    const nav = navRef.current;
    if (nav) nav.style.transition = "transform 0.2s ease, width 0.2s ease";
    fn();
    setTimeout(() => {
      if (navRef.current) navRef.current.style.transition = "";
    }, 1000);
  };

  const toggle = () => {
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    if (width < MOBILE_BREAKPOINT) {
      setFloatClass((c) => (c === "" ? " collapsed-float" : ""));
    } else {
      animateCollapse(() => setCollapsed((c) => !c));
    }
  };

  const onListClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target?.matches("a")) {
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      if (width < MOBILE_BREAKPOINT) setFloatClass("");
    }
  };

  useEffect(() => {
    if (floatClass === " collapsed-float") ScrollView.disableScroll();
    else ScrollView.enableScroll();
  }, [floatClass]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      const width = window.innerWidth;
      if (lastWidth.current === width) return;
      const nav = navRef.current;
      if (nav) nav.style.transition = "unset";
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (navRef.current) navRef.current.style.transition = "";
        setFloatClass("");
      }, 100);
      lastWidth.current = width;
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <aside
      role="navigation"
      id="ui-navbar-wrap"
      className={
        collapsed
          ? `ui-navbar-wrap collapsed${floatClass}`
          : `ui-navbar-wrap${floatClass}`
      }
    >
      <div className="ui-navbar-header-mobile">
        <span
          className="ui-navbar-toggler"
          onClick={toggle}
          aria-label="Toggle navigation"
        />
        {titleBarMobile}
      </div>
      <nav className="ui-navbar" ref={navRef}>
        <div
          className="ui-navbar-header"
          style={
            shadowOnScroll && shadow
              ? { boxShadow: "0 4px 8px -8px #77777777" }
              : { boxShadow: "" }
          }
        >
          <span
            className="ui-navbar-toggler"
            onClick={toggle}
            aria-label="Toggle navigation"
          />
          <span className="ui-navbar-name">{title}</span>
        </div>
        <ul
          id="ui-navbar-list"
          className="ui-navbar-list"
          onScroll={(e) => setShadow((e.target as HTMLElement).scrollTop >= 50)}
          onClick={onListClick}
        >
          {children}
        </ul>
      </nav>
      <div
        onClick={toggle}
        className={
          floatClass === " collapsed-float"
            ? "ui-navbar-overlay show"
            : "ui-navbar-overlay"
        }
      />
    </aside>
  );
};

export default NavBar;
