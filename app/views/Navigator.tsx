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
  Form,
  Dropdown,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { AlertModel, DrivesProps, FileTypes } from "../models/Interfaces";
import Api from "../helpers/api";
import { getFileIcon } from "../helpers/utils";

const Navigator = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [directoryContents, setDirectoryContents] = useState<
    { name: string; type: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileIconMappings, setFileIconMappings] = useState({} as FileTypes);
  const [alert, setAlert] = useState<AlertModel>({
    title: "",
    message: "",
    type: "danger" as "danger" | "success" | "warning",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [drives, setDrives] = useState<DrivesProps[]>([]);
  const [selectedDrive, setSelectedDrive] = useState("");

  useEffect(() => {
    getConfig();
    getDrives();
  }, []);

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

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        setDrives(
          res.data
            .filter((drive) => drive.sync)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: "Error",
          message: "Error getting drives list, verify if config file exists",
          type: "danger",
        });
        setShowAlert(true);
      });
  };

  const getIcon = (extension) => {
    return <span>{getFileIcon(extension, fileIconMappings).icon}</span>;
  };

  const navigate = async (command, path = "") => {
    setIsLoading(true);
    try {
      const response = await Api.navigate(path, command);
      setCurrentPath(response.currentPath);
      setDirectoryContents(response.directoryContents);
      setAlert({ title: "", message: "", type: "success" });
      setShowAlert(false);
    } catch (err) {
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
      if (currentPath.match(/\\$/)) {
        navigate("cd", `${currentPath}${item.name}`);
      } else {
        navigate("cd", `${currentPath}\\${item.name}`);
      }
    }
  };

  const handleDriveChange = async (driveName) => {
    try {
      await Api.changeFileSystem({ filename: driveName });
      setCurrentPath("");
      setDirectoryContents([]);
      navigate("cd", "");
    } catch (error) {
      setAlert({
        title: "Error",
        message: "Failed to change drive",
        type: "danger",
      });
      setShowAlert(true);
    }
  };

  const handleDriveSelect = async (e) => {
    const selectedDriveName = e.target.value;
    setSelectedDrive(selectedDriveName);
    await handleDriveChange(selectedDriveName);
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

  const cleanPath = (path) => {
    //if first character is a backslash remove it
    if (path.charAt(0) === "\\") {
      path = path.substr(1);
    }
    //replace all backslashes with forward slashes
    path = path.replace(/\\/g, "/");
    return path;
  };
  const pathParts = cleanPath(currentPath)
    .split("/")
    .filter((part) => part);

  return (
    <Container
      style={{ overflowY: "scroll", height: "100vh" }}
      className="sync"
    >
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Explorer</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Synchronized Explorer</h2>
      <small>This is a simple file explorer for synchronized volumes</small>
      <Container fluid className="mt-3 mb-3">
        {showAlertMessage}
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {selectedDrive ? selectedDrive : "Select a drive"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {drives.map((drive, index) => (
              <Dropdown.Item
                key={index}
                onClick={() =>
                  handleDriveSelect({ target: { value: drive.name } })
                }
                style={{
                  fontWeight: drive.conected ? "bold" : "normal",
                  color: drive.conected ? "green" : "black",
                }}
              >
                <Icon.Hdd className="me-2" />
                {drive.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        {selectedDrive && (
          <>
            <Breadcrumb className="w-100 bg-light p-0 m-0 mt-2">
              <Breadcrumb.Item
                onClick={() => navigate("cd ..", "")}
                className="p-0 m-0"
              >
                <Icon.HouseDoorFill className="me-2" />
              </Breadcrumb.Item>
              {pathParts.map((part, index) => (
                <Breadcrumb.Item
                  key={index}
                  onClick={() =>
                    navigate(
                      `cd ${pathParts.slice(0, index + 1).join("/")}`,
                      ""
                    )
                  }
                  className={index === pathParts.length - 1 ? "fw-bold" : ""}
                  active={index === pathParts.length - 1}
                >
                  {part}
                </Breadcrumb.Item>
              ))}
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
                  {directoryContents.map((item, index) => (
                    <tr key={index} onClick={() => handleItemClick(item)}>
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
          </>
        )}
      </Container>
    </Container>
  );
};

export default Navigator;
