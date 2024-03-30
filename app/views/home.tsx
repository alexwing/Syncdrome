import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
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
import {
  AlertModel,
  FileTypes,
  FileType,
  IFile,
  Bookmark,
} from "../models/Interfaces";
import AlertMessage from "../components/AlertMessage";
import ExtensionSelect from "../components/ExtensionSelect";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { connectedIcon, getFileIcon, openFileEvent, openFileEye } from "../helpers/utils";

const Home = () => {
  const initialSearchTerm = localStorage.getItem("searchTerm") || "";
  const initialExtSelected = localStorage.getItem("extSelected") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [extSelected, setExtSelected] = useState<string[]>(
    initialExtSelected ? initialExtSelected.split(",") : []
  );
  const [files, setFiles] = useState({} as FileType);
  const [found, setFound] = useState(true);
  const [fileIconMappings, setFileIconMappings] = useState({} as FileTypes);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkSelected, setBookmarkSelected] = useState({} as Bookmark);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);

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

  // alert message
  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000} ok={undefined}    />
  );

  // get config on load
  useEffect(() => {
    getConfig();
  }, []);

  // set search input
  const handleInput = (e) => {
    setSearchTerm(e.target.value);
    localStorage.setItem("searchTerm", e.target.value);
  };

  // clear search input
  const handleClearSearch = () => {
    setSearchTerm("");
    localStorage.removeItem("searchTerm");
  };

  // get all files and folders on load
  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    //ext selected transform to url param
    const extSelectedUrl = extSelected.join("&")
      ? extSelected.join("&")
      : "all";

    Api.getFind(searchTerm, extSelectedUrl)
      .then((res) => {
        setFiles(res.data);
        if (Object.keys(res.data).length > 0) {
          setFound(true);
        } else {
          setFound(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: "Error",
          message: "Error searching files, verify config file",
          type: "danger",
        });
        setIsLoading(false);
      });
  };

  // open folder on click
  const onConnectedFolderHandler = (folder, driveLetter, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (driveLetter) {
      Api.openFolder(folder, driveLetter);
    } else {
      setAlert({
        title: "Error",
        message: "Drive not connected",
        type: "danger",
      });
      setShowAlert(true);
    }
  };

  // set Icon component from url extension
  const getIcon = (extension) => {
    return (
      <span className="me-2">
        {getFileIcon(extension, fileIconMappings).icon}
      </span>
    );
  };

  //print count of files as  <Badge>
  const getFilesLength = (files) => {
    const length = files.length;
    if (length > 0) {
      return (
        <Badge
          bg="secondary"
          style={{
            width: "50px",
          }}
        >
          {length}
        </Badge>
      );
    }
  };

  //print button add to bookmark
  const addBookmark = (item, key2, key, connected) => {
    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        {item.bookmark.description}
      </Tooltip>
    );

    const badge = (
      <Badge
        bg="none"
        style={{
          position: "absolute",
          right: "-23px",
          top: "8px",
          width: "28px",
          height: "28px",
          cursor: "pointer",
          color: item.bookmark ? "#16ab9c" : "#cdcdcd",
        }}
        className="ms-4"
        onClick={() => {
          setBookmarkSelected(
            item.bookmark
              ? item.bookmark
              : {
                  id: null,
                  name: item.fileName,
                  path: key2,
                  volume: key,
                  description: "",
                }
          );
          setShowAddBookmarkModal(true);
        }}
      >
        <Icon.BookmarkPlusFill size={16} />
      </Badge>
    );

    return item.bookmark && item.bookmark.description ? (
      <OverlayTrigger
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        {badge}
      </OverlayTrigger>
    ) : (
      badge
    );
  };


  const openFolder = (folder: string, driveLetter: any) => {
    if (driveLetter) {
      return (
        <Badge
          bg="none"
          onClick={(e) => onConnectedFolderHandler(folder, driveLetter, e)}
        >
          <Icon.Folder2Open size={18} color="green" />
        </Badge>
      );
    }
  };
  const onExtSelectChange = (values: string[]) => {
    setExtSelected(values);
    localStorage.setItem("extSelected", values.join(","));
  };

  //button to open file in windows explorer
  const openFileIcon = (file: IFile, connected: any, folder: string) => {
    return (
      <Button
        className="m-0 p-0 me-2"
        variant="link"
        disabled={!connected}
        onClick={
          connected
            ? () => openFileEvent(file.fileName, folder, connected)
            : undefined
        }
      >
        {getIcon(file.extension)}
      </Button>
    );
  };

  /***
   *  Add bookmark to file
   *  @param bookmark
   *  This function is called when the user adds a bookmark to a file
   *  It updates the file state with the new bookmark
   */
  const onAddBookmarkHandler = (bookmark) => {
    setBookmarkSelected(bookmark);
    setFiles((prevFiles) => {
      const newFiles = { ...prevFiles };
      if (!newFiles[bookmark.volume]) {
        console.error(`Volume ${bookmark.volume} does not exist in files`);
        return prevFiles;
      }
      const fileIndex = newFiles[bookmark.volume].content[
        bookmark.path
      ].findIndex((file) => file.fileName === bookmark.name);
      if (fileIndex !== -1) {
        newFiles[bookmark.volume].content[bookmark.path][fileIndex] = {
          ...newFiles[bookmark.volume].content[bookmark.path][fileIndex],
          bookmark,
        };
      }
      return newFiles;
    });
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      {showAlertMessage}
      <div className="centered pt-3">
        <img src="./assets/icon.png" alt="logo" className="logo" />
        <h1>Syncdrome</h1>
      </div>
      <div className="container text-center pb-3">
        <form className="search" onSubmit={handleSearch}>
          <input
            value={searchTerm}
            onChange={handleInput}
            type="search"
            placeholder="Enter file or folder to search"
          />
          <ExtensionSelect
            fileExtension={fileIconMappings}
            className="my-3"
            onValuesChange={onExtSelectChange}
            values={extSelected}
          />
          <Button variant="primary" type="submit" size="lg" className="me-2">
            <Icon.Search size={20} className="me-2" />
            Search
          </Button>
          <Button variant="secondary" size="lg" onClick={handleClearSearch}>
            Clear
          </Button>
        </form>
      </div>
      <div className="container  pb-3">
        {!found && !isLoading && (
          <Alert variant="warning" className="text-center">
            <h3>
              <Icon.ExclamationTriangleFill
                size={30}
                className="me-3"
                color="orange"
              />
              Nothing found
            </h3>
          </Alert>
        )}
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
          <Accordion>
            {Object.keys(files).map((key, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header >
                  <div className="d-flex justify-content-between inline-block w-100">
                    <Icon.DeviceHddFill
                      size={20}
                      className="me-2 my-auto"
                      color={files[key].connected ? "#16ab9c" : "dodgerblue"}
                    />
                    <h5 className="me-auto my-auto"
                    >{key}</h5>
                    <span>
                    {connectedIcon(files[key].connected)}
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Accordion>
                    {Object.keys(files[key].content).map(
                      (key2, index2) =>
                        files[key].content[key2].length > 0 &&
                        found && (
                          <Accordion.Item
                            eventKey={index2.toString()}
                            key={index2}
                          >
                            <Accordion.Header className="d-flex justify-content-between folder-header">
                              <Icon.FolderFill
                                size={20}
                                className="me-2"
                                color="DarkOrange"
                              />
                              <span className="folder-header-text">{key2}</span>
                              {getFilesLength(files[key].content[key2])}
                              {files[key].connected &&
                                openFolder(key2, files[key].connected)}
                            </Accordion.Header>
                            <Accordion.Body>
                              <ListGroup as="ul">
                                {files[key].content[key2].map((item: IFile) => (
                                  <ListGroup.Item
                                    as="li"
                                    key={item.fileName}
                                    className="d-flex justify-content-between"
                                  >
                                    {openFileIcon(
                                      item,
                                      files[key].connected,
                                      key2
                                    )}
                                    <span className="file-path">
                                      <small>{item.folder}\</small>
                                      <strong>{item.fileName}</strong>
                                    </span>
                                    {addBookmark(
                                      item,
                                      key2,
                                      key,
                                      files[key].connected
                                    )}
                                    {files[key].connected &&
                                      openFileEye(
                                        item.fileName,
                                        key2,
                                        files[key].connected
                                      )}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        )
                    )}
                  </Accordion>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
      <AddBookmarkModal
        show={showAddBookmarkModal}
        onHide={() => setShowAddBookmarkModal(false)}
        bookmark={bookmarkSelected}
        onAddBookmark={onAddBookmarkHandler}
      />
    </Container>
  );
};

export default Home;
