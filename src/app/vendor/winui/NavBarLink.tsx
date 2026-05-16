import React from "react";

interface NavBarLinkProps {
  icon?: React.ReactNode;
  text?: string;
  href?: string;
  active?: boolean;
  imgSrc?: string;
  imgAlt?: string;
  onClick?: () => void;
  showBadge?: number | string;
  imgBorderRadius?: number | string;
  badgeBackgroundColor?: string;
  allowJavaScriptUrls?: boolean;
}

const isJavaScriptProtocol = (url: string): boolean => {
  // Remove all whitespace (which could obfuscate the scheme) before checking.
  const normalized = url.replace(/\s/g, "").toLowerCase();
  return normalized.startsWith("javascript:");
};

const NavBarLink = ({
  icon,
  text = "Nav Link",
  href,
  active,
  imgSrc,
  imgAlt,
  onClick = () => {},
  showBadge,
  imgBorderRadius,
  badgeBackgroundColor,
  allowJavaScriptUrls = true,
}: NavBarLinkProps) => {
  if (href && !allowJavaScriptUrls && isJavaScriptProtocol(href)) {
    console.warn(
      "NavBarLink has blocked a javascript: URL as a security precaution"
    );
    return null;
  }

  return (
    <li className="ui-navbar-list-item">
      <a
        {...(active
          ? {
              "aria-current": "page" as const,
              className: "active",
              "aria-selected": "true" as const,
            }
          : {})}
        onClick={onClick}
        href={href}
      >
        {icon}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={imgAlt}
            style={{ borderRadius: imgBorderRadius }}
          />
        ) : (
          ""
        )}
        <span>{text}</span>
        {showBadge && (Number(showBadge) > 0 || showBadge !== "") ? (
          <div
            className="ui-badge"
            style={{ backgroundColor: badgeBackgroundColor }}
          >
            {showBadge}
          </div>
        ) : (
          ""
        )}
      </a>
    </li>
  );
};

export default NavBarLink;
