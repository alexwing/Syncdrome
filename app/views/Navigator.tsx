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
  Breadcrumb,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { AlertModel, FileTypes } from "../models/Interfaces";
import Api from "../helpers/api";
import { getFileIcon } from "../helpers/utils";

const Navigator = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [directoryContents, setDirectoryContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileIconMappings, setFileIconMappings] = useState({} as FileTypes);
  const [alert, setAlert] = useState<AlertModel>({
    title: "",
    message: "",
    type: "danger" as "danger" | "success" | "warning",
  });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    getConfig();
    navigate("cd", currentPath);
  }, []);

  // get config from server
  const getConfig = async () => {
    try {
      const response = await Api.getSettings();
      setFileIconMappings(response.data.extensions);
    } catch (error) {
      setAlert({
        title: "Error",
        message: "Config file not found or corrupted",
        type: "danger",
      });
      setShowAlert(true);
      return;
    }
  };

  // set Icon component from url extension
  const getIcon = (extension) => {
    return <span>{getFileIcon(extension, fileIconMappings).icon}</span>;
  };

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
    <Container
      style={{ overflowY: "scroll", height: "100vh" }}
      className="sync"
    >
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Volumen Explorer</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Volumen Explorer</h2>
      <Container fluid className="mt-3 mb-3">
        {showAlertMessage}
        <Breadcrumb>
          <Breadcrumb.Item onClick={() => navigate("cd ..", "")}>
            <Icon.HouseDoorFill />
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {currentPath.replace(/\\/g, "/").substring(1)}
          </Breadcrumb.Item>
        </Breadcrumb>
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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: "3%" }}>
                  <Icon.ThreeDots
                    onClick={() => navigate("cd ..", currentPath)}
                  />
                </th>
                <th style={{ width: "97%" }}>Name</th>
              </tr>
            </thead>
            <tbody>
              {directoryContents.map((item: any) => (
                <tr key={item.name} onClick={() => handleItemClick(item)}>
                  <td>
                    {item.type === "file" ? (
                      getIcon(item.name.split(".").pop())
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
    </Container>
  );
};

export default Navigator;
