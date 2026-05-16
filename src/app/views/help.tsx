import React, { useEffect, useState } from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';
import Api from "../helpers/api";
import { useTranslation } from "../context/languageContext";

const Help = () => {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    Api.getResource('/assets/helpEN.md').then(response => {
      setMarkdown(response.data);
    });
  }, []);


  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.help")}</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown 
      children={markdown} />
    </Container>
  );
};

export default Help;