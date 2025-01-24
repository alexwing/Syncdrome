import React, { useState, useEffect } from "react";
import {
  Badge,
  Container,
  Spinner,
  Table,
  Breadcrumb,
  Dropdown,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import {
  AlertModel,
  Bookmark,
  BookmarksByVolume,
  DrivesProps,
  FileTypes,
  NavigateResponse,
  TypeAlert,
} from "../models/Interfaces";
import Api from "../helpers/api";
import { getFileIcon, callOpenFolder, getConfig } from "../helpers/utils";
import { AddBookmarkBadge } from "../components/AddBookmarkBadge";


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
    type: TypeAlert.success,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [drives, setDrives] = useState<DrivesProps[]>([]);
  const [selectedDrive, setSelectedDrive] = useState("");
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [bookmarksByVolume, setBookmarksByVolume] = useState([] as Bookmark[]);
  const [isChangingDrive, setIsChangingDrive] = useState(false);

  useEffect(() => {
    getConfig(setFileIconMappings, setAlert, setShowAlert);
    getDrives();
  }, []);

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        setDrives(
          res
            .filter((drive) => drive.sync)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: "Error",
          message: "Error getting drives list, verify if config file exists",
          type: TypeAlert.danger,
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
      const response = await Api.navigate(path, command) as NavigateResponse;

      // Verificar si la respuesta es {"isConnected":false,"driveLetter":null}
      if (!response.directoryContents) {
        setIsLoading(false);
        setAlert({
          title: "Error",
          message: "Drive is not data synchronized",
          type: TypeAlert.danger,
        });
        setShowAlert(true);
        return null;
      }

      setCurrentPath(response.currentPath);
      setDirectoryContents(response.directoryContents);
      setAlert({ title: "", message: "", type: TypeAlert.success });
      setShowAlert(false);
    } catch (err) {
      console.log("Error", err);
      const errorMessage =
        (err as any).response?.data?.error === "Already at root"
          ? "Already at root"
          : (err as any).response?.data || "An error occurred";
      setAlert({
        title: "Error",
        message: errorMessage,
        type: TypeAlert.danger,
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
      const driveLetter = drives.find(
        (drive) => drive.name === selectedDrive
      )?.letter;
      if (driveLetter) {
        let path = currentPath;
        //  replace / with \
        path = path.replace(/\//g, "\\");
        //remove last backslash
        path = path.replace(/\\$/, "");
        //remove first backslash
        path = path.replace(/^\\/, "");
        Api.openFile(item.name, path, driveLetter);
      }
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
      setIsChangingDrive(true);
      setCurrentPath("");
      setDirectoryContents([]);
      await Api.changeFileSystem(driveName);
      navigate("cd", "");
      loadBookmarks(driveName);
    } catch (error) {
      setAlert({
        title: "Error",
        message: "Failed to change drive",
        type: TypeAlert.danger,
      });
      setShowAlert(true);
    } finally {
      setIsChangingDrive(false);
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

  const loadBookmarks = async (volume) => {
    Api.getBookmarksByVolume(volume)
      .then((response) => {
        setBookmarksByVolume(response as any);
      })
      .catch((error) => {
        console.log(error);
        setAlert({
          title: "Error",
          message: "Error getting bookmarks",
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  const openFolder = (folder: string) => {
    //get drive letter from selected drive
    const driveLetter = drives.find(
      (drive) => drive.name === selectedDrive
    )?.letter;
    if (driveLetter) {
      folder = currentPath + folder;
      //remove duplicates backslashes and first backslash
      folder = folder.replace(/\\/g, "/").replace(/^\//, "");
      return (
        <Badge
          bg="none"
          style={{ cursor: "pointer", height: "28px" }}
          onClick={(e) => callOpenFolder(folder, driveLetter, e, setAlert, setShowAlert)}
        >
          <Icon.Eye size={18} color="green" />
        </Badge>
      );
    }
  };

  const getFileBookmark = (fileName) => {
    //find in bookmarksByVolume the bookmark with the same name and path
    const bookmark = bookmarksByVolume.find(
      (bookmark) => bookmark.name === fileName && bookmark.path === currentPath
    );
    return bookmark;
  };

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
                  fontWeight: drive.connected ? "bold" : "normal",
                  color: drive.connected ? "green" : "black",
                }}
              >
                <Icon.Hdd className="me-2" />
                {drive.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        {isChangingDrive && (
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
        {!isChangingDrive && selectedDrive && (
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
                    <tr key={index}>
                      <td>
                        {item.type === "file" ? (
                          getIcon(item.name.split(".").pop())
                        ) : (
                          <>
                            <Icon.Folder
                              color="green"
                              style={{ cursor: "pointer", height: "28px" }}
                              onClick={() => handleItemClick(item)}
                            />
                            <AddBookmarkBadge
                                isBookmarked={!!getFileBookmark(item.name)}
                                fileName={item.name}
                                path={currentPath}
                                volume={selectedDrive}
                                    description="" 
                                    setFiles={() => {}} 
                                    onAddBookmark={() => {}} 
                                />
                          </>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg="none"
                          style={{
                            cursor: "pointer",
                            color: item.type === "file" ? "blue" : "green",
                            fontSize: "1em",
                          }}
                          onClick={() => handleItemClick(item)}
                        >
                          {item.name}
                        </Badge>
                        {item.type === "directory" && openFolder(item.name)}
                      </td>
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
