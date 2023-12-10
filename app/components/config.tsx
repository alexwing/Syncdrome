// En Settings.tsx
import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import { Button, Col, Container, Row } from "react-bootstrap";

const Comfig = () => {
  const [folder, setFolder] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newConfig = { folder };
    await Api.saveSettings(newConfig);
  };

  const getConfig = async () => {
    const response = await Api.getSettings();
    setFolder(response.data.folder);
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Folder:
        <input
          type="text"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        />
      </label>
      <Container
        fluid
        className="d-flex align-items-center justify-content-center py-2"
      >
        <Row>
          <Col className="text-center">
            <Button variant="primary" type="submit" className="full-width">
              Save
            </Button>
          </Col>
        </Row>
      </Container>
    </form>
  );
};

export default Comfig;
