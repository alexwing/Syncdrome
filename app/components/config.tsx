// En Settings.tsx
import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import { Button, Col, Container, Row } from "react-bootstrap";

import { ipcRenderer } from "electron";
import * as Icon from "react-bootstrap-icons";

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

  // open folder on click
  const openFolderHandler = (event) => {
    //extract leter from folder
    const driveLetter = folder.slice(0, 2);
    //extract path from folder
    const folderPath = folder.slice(3);
    event.preventDefault();
    event.stopPropagation();
    if (driveLetter) {
      Api.openFolder(folderPath, driveLetter);
    } else {
      alert("Drive not connected");
    }
  };

  const onChangeFolder = async () => {
    const path = await ipcRenderer.invoke("open-directory-dialog", folder);
    setFolder(path);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Folder:
        <input
          type="text"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        />
        <Button
          variant="outline-secondary"
          type="button"
          onClick={onChangeFolder}
        >
          ...
        </Button>
        <Button
          variant="outline-none"
          type="button"
          onClick={openFolderHandler}
        >
          <Icon.Folder2Open color="green" size={22} className="m-0" />
        </Button>
      </label>
      <Container
        fluid
        className="d-flex align-items-center justify-content-center py-2"
      >
        <Row>
          <Col className="text-center">
            <Button variant="primary" type="submit" className="full-width">
              <Icon.Save color="white" size={18} className="me-3" />
              Save
            </Button>
          </Col>
        </Row>
      </Container>
    </form>
  );
};

export default Comfig;
