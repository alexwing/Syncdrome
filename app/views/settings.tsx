import React from "react";
import { Breadcrumb, Container } from "react-bootstrap";
import Config from "../components/config";

const Settings = () => {
  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Settings</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Settings</h2>
      <small>Here you can configure the application.</small>
      <p className="mt-3">
        Select the folder where you want to save the files.
      </p>
      <Config />
    </Container>
  );
};

export default Settings;
