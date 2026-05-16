import React from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import Config from "../components/config";
import { useTranslation } from "../context/languageContext";

const Settings = () => {
  const { t } = useTranslation();
  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.settings")}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>{t("settings.title")}</h2>
      <small>{t("settings.intro")}</small>
      <Config />
    </Container>
  );
};

export default Settings;
