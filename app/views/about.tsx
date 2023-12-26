import React, { useEffect, useState } from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { shell } from "electron";

const About = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    axios.get('/assets/aboutES.md').then(response => {
      setMarkdown(response.data);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleLinkClick, false);
    return () => {
      window.removeEventListener('click', handleLinkClick, false);
    }
  }, []);

  const handleLinkClick = (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
      e.preventDefault();
      shell.openExternal(e.target.href);
    }
  }

  //get all links at blank and add event listener
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    }
  }, []);

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>About</Breadcrumb.Item>
      </Breadcrumb>
      <ReactMarkdown 
      linkTarget="_blank"      
      children={markdown} />
    </Container>
  );
};

export default About;