import React, { useEffect, useState } from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';
import Api from "../helpers/api";
import { useTranslation } from "../context/languageContext";

const Help = () => {
  const { t, resolved } = useTranslation();
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    const lang = resolved === 'es' ? 'ES' : 'EN';
    Api.getResource(`/assets/help${lang}.md`).then(response => {
      setMarkdown(response.data);
    });
  }, [resolved]);


  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.help")}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="prose-readable">
        <ReactMarkdown children={markdown} />
      </div>
    </Container>
  );
};

export default Help;