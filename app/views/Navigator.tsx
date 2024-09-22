import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  ListGroup,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { AlertModel } from "../models/Interfaces";

const Navigator = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [directoryContents, setDirectoryContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertModel>({
    title: "",
    message: "",
    type: "danger" as "danger" | "success" | "warning",
  });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    navigate("");
  }, []);

  const navigate = async (command) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/navigate", {
        currentPath,
        command,
      });
      setDirectoryContents(response.data.currentDir);
      setCurrentPath(response.data.currentPath);
      setAlert({ title: "", message: "", type: "success" });
      setShowAlert(false);
    } catch (err) {
      setAlert({
        title: "Error",
        message: err.response.data,
        type: "danger",
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (directoryContents[item] === null) {
      setAlert({
        title: "Selected file",
        message: item,
        type: "warning", 
      });
      setShowAlert(true);
    } else {
      navigate(`cd ${item}`);
    }
  };

  const showAlertMessage = (
    <AlertMessage
          show={showAlert}
          alertMessage={alert}
          onHide={() => setShowAlert(false)}
          autoClose={2000} ok={undefined}    />
  );

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      {showAlertMessage}
      <div className="centered pt-3">
        <img src="./assets/icon.png" alt="logo" className="logo" />
        <h1>File Navigator</h1>
      </div>
      <div className="path">Current Path: {currentPath}</div>
      {isLoading && (
        <div className="loading-icon">
          <Spinner
            className="loading-icon"
            variant="primary"
            animation="grow"
            role="status"
            aria-hidden="true"
          />
        </div>
      )}
      {!isLoading && (
        <div className="directory">
          {Object.keys(directoryContents).map((item) => (
            <div
              key={item}
              className={directoryContents[item] === null ? "file" : "folder"}
              onClick={() => handleItemClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
      <Button onClick={() => navigate("cd ..")}>Go Up</Button>
    </Container>
  );
};

export default Navigator;