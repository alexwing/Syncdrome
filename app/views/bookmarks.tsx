import { useEffect, useState } from "react";
import { Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { AlertModel, Bookmark, FileTypes } from "../models/Interfaces";
import React from "react";
import * as Icon from "react-bootstrap-icons";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import Api from "../helpers/api";
import ConfirmDialog from "../components/ConfirmDialog";
import AddBookmarkModal from "../components/AddBookmarkModal";
import { ipcRenderer } from "electron";
import { file } from "vfile-message";
import AlertMessage from "../components/AlertMessage";
import { connectedIcon, getFileIcon } from "../helpers/utils";

interface bookmarksByVolume {
  volume: string;
  bookmarks: Bookmark[];
}

const bookmarks = () => {
  const [search, setSearch] = useState("");
  const [bookmarksByVolume, setBookmarksByVolume] = useState(
    [] as bookmarksByVolume[]
  );
  const [bookmarksByVolumeFiltered, setBookmarksByVolumeFiltered] = useState(
    [] as bookmarksByVolume[]
  );
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Number | null>(null);
  const [bookmarkSelected, setBookmarkSelected] = useState({} as Bookmark);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [drives, setDrives] = useState([]);
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [fileIconMappings, setFileIconMappings] = useState({} as FileTypes);

  const [showAlert, setShowAlert] = useState(false);
  const [file, setFile] = useState("");
  const [draggingOver, setDraggingOver] = useState(false);

  const onChangeFile = async () => {
    const path = await ipcRenderer.invoke("open-file-dialog", file);
    setFile(path);
    createBookmark(path);
  };

  // Agrega un manejador de eventos para el evento de soltar en el contenedor adecuado
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDraggingOver(false);

    // Obtenemos la ruta del archivo soltado
    const filePath = event.dataTransfer.files[0].path;
    console.log("Ruta del archivo:", filePath);

    // Llama a la función para crear el marcador de libro con la ruta del archivo
    createBookmark(filePath);
  };

  // Agrega un manejador de eventos para el evento de arrastrar sobre el contenedor
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingOver(true); // Establece el estado para indicar que se está arrastrando sobre la ventana
  };

  // Agrega un manejador de eventos para el evento de dejar de arrastrar sobre el contenedor
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingOver(false); // Establece el estado para indicar que se ha dejado de arrastrar sobre la ventana
  };

  const createBookmark = async (path) => {
    const letter = path.split("\\")[0];
    const drives = await Api.getDrives();
    const drive = drives.data.find((drive) => drive.letter === letter);
    if (!drive || !drive.conected) {
      setAlert({
        title: "Error",
        message: "Drive not connected",
        type: "danger",
      });
      setShowAlert(true);
      return;
    }
    const bookmark = {
      name: path.split("\\").pop(),
      path: path.split("\\").slice(0, -1).join("\\").slice(3),
      volume: drive.name,
      description: "",
    };
    console.log("bookmark: ", bookmark);
    Api.addBookmark(bookmark).then(() => {
      loadBookmarks();
    });
  };

  const loadBookmarks = async () => {
    setLoading(true);
    Api.getBookmarks()
      .then((response) => {
        console.log(response.data);
        const volumes = response.data
          .map((bookmark) => bookmark.volume)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();
        const bookmarksByVolume = volumes.map((volume) => {
          return {
            volume: volume,
            bookmarks: response.data.filter((bookmark) =>
              bookmark.volume.includes(volume)
            ),
          };
        });
        setBookmarksByVolume(bookmarksByVolume);
        filterBookmarks(bookmarksByVolume);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteBookmark = (id: Number | null) => {
    if (id === null) {
      return;
    }
    Api.deleteBookmark(id).then(() => {
      loadBookmarks();
    });
  };
  useEffect(() => {
    Api.getSettings()
      .then((response) => {
        setFileIconMappings(response.data.extensions);
        loadBookmarks();
        getDrives();
      })
      .catch((error) => {
        setAlert({
          title: "Error",
          message: "Config file not found or corrupted",
          type: "danger",
        });
        setShowAlert(true);
        return;
      });
  }, []);

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        setDrives(res.data);
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
  // set Icon component from url extension
  const getIcon = (file: Bookmark) => {
    const extension = file.name.split(".").pop();
    return getFileIcon(extension, fileIconMappings).icon;
  };

  const filterBookmarks = (bookmarksByVolume: bookmarksByVolume[]) => {
    if (search === "" || search === null) {
      setBookmarksByVolumeFiltered(bookmarksByVolume);
      return;
    }
    let filteredBookmarks = bookmarksByVolume.map((volume) => {
      return {
        volume: volume.volume,
        bookmarks: volume.bookmarks.filter(
          (bookmark) =>
            bookmark.name.toLowerCase().includes(search.toLowerCase()) ||
            bookmark.description.toLowerCase().includes(search.toLowerCase())
        ),
      };
    });
    //remove empty volumes
    filteredBookmarks = filteredBookmarks.filter(volume => volume.bookmarks.length !== 0);
    setBookmarksByVolumeFiltered(filteredBookmarks);
  };

  /***
   *  Add/Edit bookmark to file
   *  @param bookmark
   *  This function is called when the user adds/edit a bookmark
   *  It updates the file state with the new bookmark
   */
  const onAddBookmarkHandler = () => {
    setShowAddBookmarkModal(false);
    loadBookmarks();
  };

  useEffect(() => {
    filterBookmarks(bookmarksByVolume);
  }, [search]);

  const handleOK = () => {
    setShowConfirmDialog(false);
    deleteBookmark(bookmarkToDelete);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const getDriveLetter = (volume: string, drives: any[]) => {
    const drive = drives.find((drive: any) => drive.name === volume) as any;
    return drive ? drive.letter : "";
  };
  //open file in windows explorer
  const onConnectedElementHandler = (bookmark: Bookmark) => {
    const driveLetter = getDriveLetter(bookmark.volume, drives);
    if (driveLetter) {
      Api.openFile(bookmark.name, bookmark.path, driveLetter).then(
        (res) => {
          // console.log(res);
        }
      );
    }
  };

  //print count of files as  <Badge>
  const openFileEye = (bookmark: Bookmark) => {
    if (!isConnect(bookmark.volume)) {
      return null;
    }
    return (
      <Button
        className="m-0 p-0 me-2"
        variant="link"
        onClick={() => {
          onConnectedElementHandler(bookmark);
        }}
      >
        <Icon.Eye size={18} color="green" />
      </Button>
    );
  };

  const isConnect = (volume: String) => {
    const driveLetter = drives.find(
      (drive: any) => drive.name === volume
    ) as any;
    return driveLetter && driveLetter.conected;
  };

  //button to open file in windows explorer
  const openFile = (bookmark: Bookmark) => {
    const isConnected = isConnect(bookmark.volume);
    return (
      <Button
        className="m-0 p-0 me-2"
        variant="link"
        disabled={!isConnected}
        onClick={
          isConnected ? () => onConnectedElementHandler(bookmark) : undefined
        }
      >
        {bookmark.name.includes(".") ? (
          getIcon(bookmark)
        ) : (
          <Icon.Folder2Open color="DarkOrange" size={20} />
        )}
      </Button>
    );
  };
  // alert message
  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000}
    />
  );

  //badge to show drive letter if volume in drives is connected
  const driveBadge = (volume) => {
    const drive = drives.find((drive: any) => drive.name === volume) as any;
    if (drive && drive.conected) {
      return connectedIcon(drive.letter);
    }
  };

  return (
    <Container
      style={{ overflowY: "scroll", height: "100vh" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {draggingOver && (
        <div className="d-flex flex-column justify-content-center align-items-center upload-area">
          <p className="text-center fs-1 text-primary">Drop Here</p>
          <Icon.ArrowUpCircle size={50} className="text-primary" />
        </div>
      )}
      {showAlertMessage}
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Bookmarks</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Bookmarks</h2>
      <Row className="p-3 m-0">
        <Col xs={10} className="p-0">
          <Form.Group controlId="search">
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={2} className="p-0">
          <Button
            className="w-100"
            variant="outline-primary"
            type="button"
            onClick={onChangeFile}
          >
            <Icon.PlusCircle size={16} className="me-2" />
            Add bookmark
          </Button>
        </Col>
      </Row>
      {!loading && bookmarksByVolumeFiltered.length === 0 && (
        <Alert variant="warning" className="text-center">
          <h3>
            <Icon.ExclamationTriangleFill
              size={30}
              className="me-3"
              color="orange"
            />
            No bookmarks found
          </h3>
        </Alert>
      )}
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      <Row className="p-3 m-0">
        <Col xs={12} className="p-0">
          {bookmarksByVolumeFiltered.map((volume, index) => (
            <Card key={index}>
              <Card.Header className="d-flex justify-content-between inline-block">
                <Icon.DeviceHddFill
                  size={20}
                  className="me-2 my-auto"
                  color={isConnect(volume.volume) ? "#16ab9c" : "dodgerblue"}
                />
                <h5 className="my-auto me-auto">
                  <span className="me-3">{volume.volume}</span>
                </h5>
                {driveBadge(volume.volume)}
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  {volume.bookmarks.map((bookmark, bookmarkIndex) => (
                    <ListGroup.Item
                      key={`bookmark-${bookmarkIndex}`}
                      className="d-flex justify-content-between inline-block"
                    >
                      {openFile(bookmark)}
                      <span className="file-path">
                        <small>{bookmark.path}\</small>
                        <strong>{bookmark.name}</strong>
                      </span>
                      <ListGroup.Item className="d-flex justify-content-between p-0 m-0 border-0">
                        <Badge
                          bg="warning"
                          className="me-2 bookmark-desc text-dark"
                        >
                          {bookmark.description}
                        </Badge>
                        {openFileEye(bookmark)}
                        <Button
                          className="m-0 p-0 me-2"
                          variant="link"
                          onClick={() => {
                            setBookmarkSelected(bookmark);
                            setShowAddBookmarkModal(true);
                          }}
                        >
                          <Icon.PencilSquare color="blue" size={20} />
                        </Button>
                        <Button
                          className="m-0 p-0"
                          variant="link"
                          onClick={() => {
                            setShowConfirmDialog(true);
                            setBookmarkToDelete(bookmark.id);
                          }}
                        >
                          <Icon.Trash color="red" size={20} />
                        </Button>
                      </ListGroup.Item>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
      <ConfirmDialog
        title="Delete bookmark"
        message="Are you sure you want to delete this bookmark?"
        show={showConfirmDialog}
        handleOK={handleOK}
        handleCancel={handleCancel}
      />
      <AddBookmarkModal
        show={showAddBookmarkModal}
        onHide={() => setShowAddBookmarkModal(false)}
        bookmark={bookmarkSelected}
        onAddBookmark={onAddBookmarkHandler}
      />
    </Container>
  );
};

export default bookmarks;
