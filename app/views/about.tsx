import React from "react";
import { Breadcrumb, Container } from "react-bootstrap";

const About = () => {
  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>About</Breadcrumb.Item>
      </Breadcrumb>
      <h2>About</h2>
      <p>This application is developed with React and NodeJS.</p>
      <p>
        The application allows you to search for files in a directory and
        subdirectories.
      </p>
      <p>This information has been previously saved in a text file.</p>
    </Container>
  );
};

export default About;
