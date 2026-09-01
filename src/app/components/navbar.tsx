import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../context/languageContext";
import { NavBar, NavBarLink } from "../vendor/winui";
import { isMobile } from "../helpers/platform";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const mobile = isMobile();

  const navigateTo = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <NavBar
      title={t("nav.title")}
      shadowOnScroll={true}
      titleBarMobile={
        <div>
          <span className="app-navbar-name">{t("nav.title")}</span>
        </div>
      }
    >
      <NavBarLink
        text={t("nav.home")}
        icon={<i className="icons10-home"></i>}
        onClick={() => {
          navigateTo("/");
        }}
      />
      <NavBarLink
        text={t("nav.explorer")}
        icon={<i className="icons10-folder"></i>}
        onClick={() => {
          navigateTo("/explorer");
        }}
      />
      {!mobile && (
        <NavBarLink
          text={t("nav.sync")}
          icon={<i className="icons10-sync"></i>}
          onClick={() => {
            navigateTo("/sync");
          }}
        />
      )}
      <NavBarLink
        text={t("nav.bookmarks")}
        icon={<i className="icons10-bookmark"></i>}
        onClick={() => {
          navigateTo("/bookmarks");
        }}
      />
      {!mobile && (
        <NavBarLink
          text={t("nav.folderSync")}
          icon={<i className="icons10-columns"></i>}
          onClick={() => {
            navigateTo("/folderSync");
          }}
        />
      )}
      {!mobile && (
        <NavBarLink
          text={t("nav.fileCleaner")}
          icon={<i className="icons10-file"></i>}
          onClick={() => {
            navigateTo("/fileCleaner");
          }}
        />
      )}
      <NavBarLink
        text={t("nav.settings")}
        icon={<i className="icons10-settings"></i>}
        onClick={() => {
          navigateTo("/settings");
        }}
      />
      <NavBarLink
        text={t("nav.help")}
        icon={<i className="icons10-question-mark"></i>}
        onClick={() => {
          navigateTo("/help");
        }}
      />
      <NavBarLink
        text={t("nav.about")}
        icon={<i className="icons10-info"></i>}
        onClick={() => {
          navigateTo("/about");
        }}
      />
    </NavBar>
  );
};

export default Navbar;
