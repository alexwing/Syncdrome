import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  ListGroup,
  Spinner,
  Container,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import Api from "../helpers/api";
import ProgressBar from "react-bootstrap/ProgressBar";
import Config from "../components/config";
import * as Icon from "react-bootstrap-icons";

interface DrivesProps {
  letter: string;
  name: string;
  freeSpace: string;
  size: string;
  sync: boolean;
  syncDate: string;
}

const Settings = () => {
  const [drives, setDrives] = useState([]);


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
