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
  Table,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { AlertModel } from "../models/Interfaces";
import Api from "../helpers/api";

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
    navigate("cd", currentPath);
  }, []);

  const navigate = async (command, path = "") => {
    setIsLoading(true);
    try {
      const response = await Api.navigate(path, command);

      //clean response.currentPath \\ at the end
      setCurrentPath(response.currentPath);
      setDirectoryContents(response.directoryContents);
      setAlert({ title: "", message: "", type: "success" });
      setShowAlert(false);
    } catch (err) {
      //catch 400 error with send mensaje no trouth error{"error":"Already at root"}
      console.log("Error", err);
      const errorMessage =
        err.response?.data?.error === "Already at root"
          ? "Already at root"
          : err.response?.data || "An error occurred";
      setAlert({
        title: "Error",
        message: errorMessage,
        type: "danger",
      });
      setShowAlert(true);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === "file") {
      setAlert({
        title: "Selected file",
        message: item.name,
        type: "warning",
      });
      setShowAlert(true);
    } else {
      // if currentPath is root, don't add \\ at the end
      if (currentPath.match(/\\$/)) {
        navigate("cd", `${currentPath}${item.name}`);
      } else {
        navigate("cd", `${currentPath}\\${item.name}`);
      }
    }
  };

  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000}
      ok={undefined}
    />
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
      <Button
        onClick={() => navigate("cd ..", currentPath.replace(/\\[^\\]*$/, ""))}
      >
        <Icon.ArrowLeftCircle /> Go Back
      </Button>
      {!isLoading && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {directoryContents.map((item: any) => (
              <tr key={item.name} onClick={() => handleItemClick(item)}>
                <td>
                  {item.type === "file" ? (
                    <Icon.FileEarmarkText />
                  ) : (
                    <Icon.Folder />
                  )}
                </td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Navigator;
