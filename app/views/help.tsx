import React, { useEffect, useState } from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const Help = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    axios.get('/assets/helpEN.md').then(response => {
      setMarkdown(response.data);
    });
  }, []);


  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Help</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown 
      children={markdown} />
    </Container>
  );
};

export default Help;