import { useEffect, useState } from "react";
import { Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { AlertModel, Bookmark, BookmarksByVolume, FileTypes, TypeAlert } from "../models/Interfaces";
import React from "react";
import * as Icon from "react-bootstrap-icons";
import {
  Alert,
  Badge,
  Button,
  Container,
  Spinner,
} from "react-bootstrap";
import classNames from "classnames";
import Api from "../helpers/api";
import ConfirmDialog from "../components/ConfirmDialog";
import AddBookmarkModal from "../components/AddBookmarkModal";
import AlertMessage from "../components/AlertMessage";
import FilePreviewPanel from "../components/FilePreviewPanel";
import FileContextMenu, {
  ContextMenuItem,
  clampMenuPosition,
} from "../components/FileContextMenu";
import {
  connectedIcon,
  getFileIcon,
  getExtension,
  copyToClipboard,
  buildWindowsPath,
} from "../helpers/utils";
import { open } from '@tauri-apps/plugin-dialog';
import { useTranslation } from "../context/languageContext";




const bookmarks = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [BookmarksByVolume, setBookmarksByVolume] = useState(
    [] as BookmarksByVolume[]
  );
  const [BookmarksByVolumeFiltered, setBookmarksByVolumeFiltered] = useState(
    [] as BookmarksByVolume[]
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
  const [selectedId, setSelectedId] = useState<Number | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    bookmark: Bookmark;
  } | null>(null);

  const onChangeFile = async () => {
    try {
      const file = await open({
        directory: false,
        multiple: false,
        title: t("bookmarks.selectFile"),
        defaultPath: '/ruta/inicial'
      });
      setFile(file as string);
      if (file) {
        console.log('Archivo seleccionado:', file);
        createBookmark(file as string);
      } else {
        console.log('No se seleccionó ningún archivo.');
      }
    } catch (error) {
      console.error('Error al abrir el diálogo:', error);
    }
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
    const drive = drives.find((drive) => drive.letter === letter);
    if (!drive || !drive.connected) {
      setAlert({
        title: t("common.error"),
        message: t("sync.driveNotConnected"),
        type: TypeAlert.danger,
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
    Api.addBookmark(bookmark).then(() => {
      loadBookmarks();
    });
  };

  const loadBookmarks = async () => {
    setLoading(true);
    Api.getBookmarks()
      .then((response) => {
        console.log("Bookmarks", response);
        const volumes = (response as any)
          .map((bookmark) => bookmark.volume)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();      
        const BookmarksByVolume = volumes.map((volume) => {
          return {
            volume: volume,
            bookmarks: (response as any).filter((bookmark) =>
              bookmark.volume.includes(volume)
            ),
          };
        });
        setBookmarksByVolume(BookmarksByVolume);
        filterBookmarks(BookmarksByVolume);
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
        setFileIconMappings((response as any).extensions);
        loadBookmarks();
        getDrives();
      })
      .catch((error) => {
        setAlert({
          title: t("common.error"),
          message: t("settings.configNotFound"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
        return;
      });
  }, []);

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        setDrives(res);
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: t("common.error"),
          message: t("explorer.errorGettingDrives"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };
  // set Icon component from url extension
  const getIcon = (file: Bookmark) => {
    const extension = getExtension(file.name);
    if (!extension) {
      return <Icon.FolderFill size={16} className="explorer-folder-icon" />;
    }
    return getFileIcon(extension, fileIconMappings).icon;
  };

  // Marcador seleccionado (resuelto por id para sobrevivir a recargas)
  const selectedBookmark = selectedId
    ? BookmarksByVolume.flatMap((v) => v.bookmarks).find(
        (b) => b.id === selectedId
      )
    : undefined;

  // Volúmenes ordenados: conectados primero por letra, luego el resto por nombre
  const sortedVolumes = [...BookmarksByVolumeFiltered].sort((a, b) => {
    const da = drives.find((d: any) => d.name === a.volume) as any;
    const db = drives.find((d: any) => d.name === b.volume) as any;
    if (da?.connected && db?.connected)
      return (da.letter || "").localeCompare(db.letter || "");
    if (da?.connected) return -1;
    if (db?.connected) return 1;
    return a.volume.localeCompare(b.volume);
  });

  const filterBookmarks = (BookmarksByVolume: BookmarksByVolume[]) => {
    if (search === "" || search === null) {
      setBookmarksByVolumeFiltered(BookmarksByVolume);
      return;
    }
    let filteredBookmarks = BookmarksByVolume.map((volume) => {
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
    filterBookmarks(BookmarksByVolume);
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

  const isConnect = (volume: String) => {
    const driveLetter = drives.find(
      (drive: any) => drive.name === volume
    ) as any;
    return driveLetter && driveLetter.connected;
  };

  // Entradas del menú contextual de un marcador
  const bookmarkCtxEntries = (bookmark: Bookmark): ContextMenuItem[] => {
    const connected = isConnect(bookmark.volume);
    const letter = getDriveLetter(bookmark.volume, drives);
    const fullPath =
      connected && letter
        ? buildWindowsPath(letter, bookmark.path, bookmark.name)
        : `\\${buildWindowsPath(bookmark.path, bookmark.name)}`;
    return [
      {
        label: t("explorer.open"),
        icon: <Icon.BoxArrowUpRight size={13} className="me-2" />,
        disabled: !connected,
        onClick: () => onConnectedElementHandler(bookmark),
      },
      {
        label: t("explorer.showInFolder"),
        icon: <Icon.Folder2Open size={13} className="me-2" />,
        disabled: !connected,
        onClick: () => letter && Api.openFolder(bookmark.path, letter),
      },
      "divider",
      {
        label: t("bookmarks.editBookmark"),
        icon: <Icon.PencilSquare size={13} className="me-2" />,
        onClick: () => {
          setBookmarkSelected(bookmark);
          setShowAddBookmarkModal(true);
        },
      },
      {
        label: t("common.delete"),
        icon: <Icon.Trash size={13} className="me-2" />,
        onClick: () => {
          setBookmarkToDelete(bookmark.id);
          setShowConfirmDialog(true);
        },
      },
      "divider",
      {
        label: t("explorer.copyName"),
        icon: <Icon.Files size={13} className="me-2" />,
        onClick: () => copyToClipboard(bookmark.name),
      },
      {
        label: t("explorer.copyPath"),
        icon: <Icon.Signpost size={13} className="me-2" />,
        onClick: () => copyToClipboard(fullPath),
      },
    ];
  };

  // Fila de marcador con la estética del explorador
  const bookmarkRow = (bookmark: Bookmark) => {
    const connected = isConnect(bookmark.volume);
    const isSel = selectedId === bookmark.id;
    return (
      <div
        key={`bookmark-${bookmark.id}`}
        className={classNames("explorer-row", { selected: isSel })}
        onClick={() => setSelectedId(bookmark.id)}
        onDoubleClick={() => connected && onConnectedElementHandler(bookmark)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedId(bookmark.id);
          setCtxMenu({ ...clampMenuPosition(e), bookmark });
        }}
      >
        <span className="explorer-icon">{getIcon(bookmark)}</span>
        <span className="explorer-cell-name">
          <span
            className="explorer-name explorer-file-link"
            title={`${bookmark.path}\\${bookmark.name}`}
          >
            <small className="text-muted">{bookmark.path}\</small>
            {bookmark.name}
          </span>
        </span>
        <span className="explorer-col-desc" title={bookmark.description}>
          {bookmark.description}
        </span>
        <span
          className="explorer-col-actions explorer-actions"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {connected && (
            <Badge
              bg="none"
              style={{ cursor: "pointer" }}
              onClick={() => onConnectedElementHandler(bookmark)}
            >
              <Icon.BoxArrowUpRight size={13} color="green" />
            </Badge>
          )}
          <Badge
            bg="none"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setBookmarkSelected(bookmark);
              setShowAddBookmarkModal(true);
            }}
          >
            <Icon.PencilSquare size={14} color="#6ea8fe" />
          </Badge>
          <Badge
            bg="none"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowConfirmDialog(true);
              setBookmarkToDelete(bookmark.id);
            }}
          >
            <Icon.Trash size={14} color="#dc3545" />
          </Badge>
        </span>
      </div>
    );
  };
  // alert message
  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000} ok={undefined}    />
  );

  //badge to show drive letter if volume in drives is connected
  const driveBadge = (volume) => {
    const drive = drives.find((drive: any) => drive.name === volume) as any;
    if (drive && drive.connected) {
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
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.bookmarks")}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>{t("bookmarks.title")}</h2>
      <Row className="p-3 m-0">
        <Col xs={10} className="p-0">
          <Form.Group controlId="search">
            <Form.Control
              type="text"
              placeholder={t("common.search")}
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
            {t("bookmarks.addBookmark")}
          </Button>
        </Col>
      </Row>
      {!loading && BookmarksByVolumeFiltered.length === 0 && (
        <Alert variant="warning" className="text-center">
          <h3>
            <Icon.ExclamationTriangleFill
              size={30}
              className="me-3"
              color="orange"
            />
            {t("bookmarks.noResults")}
          </h3>
        </Alert>
      )}
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      <div className="d-flex gap-3 align-items-start p-3">
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {sortedVolumes.map((volume, index) => (
            <Card key={volume.volume} className="mb-3">
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
              <Card.Body className="py-2">
                {volume.bookmarks.map((bookmark) => bookmarkRow(bookmark))}
              </Card.Body>
            </Card>
          ))}
        </div>
        {selectedBookmark && (
          <FilePreviewPanel
            item={{ name: selectedBookmark.name, type: "file" }}
            currentPath={selectedBookmark.path}
            driveLetter={
              isConnect(selectedBookmark.volume)
                ? getDriveLetter(selectedBookmark.volume, drives) || null
                : null
            }
            volume={selectedBookmark.volume}
            bookmark={selectedBookmark}
            fileIconMappings={fileIconMappings}
            onBookmarkChange={() => loadBookmarks()}
            onClose={() => setSelectedId(null)}
            setAlert={setAlert}
            setShowAlert={setShowAlert}
          />
        )}
      </div>
      {ctxMenu && (
        <FileContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          entries={bookmarkCtxEntries(ctxMenu.bookmark)}
          onClose={() => setCtxMenu(null)}
        />
      )}
      <ConfirmDialog
        title={t("bookmarks.deleteBookmarkTitle")}
        message={t("bookmarks.confirmDeleteBookmark")}
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
