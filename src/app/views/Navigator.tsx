import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "../context/languageContext";
import {
  Badge,
  Card,
  Container,
  Form,
  ProgressBar,
  Spinner,
  Breadcrumb,
  Dropdown,
} from "react-bootstrap";
import classNames from "classnames";
import * as Icon from "react-bootstrap-icons";
import AlertMessage from "../components/AlertMessage";
import {
  AlertModel,
  Bookmark,
  DrivesProps,
  ExplorerItem,
  FileTypes,
  NavigateResponse,
  TypeAlert,
} from "../models/Interfaces";
import Api from "../helpers/api";
import {
  getFileIcon,
  getExtension,
  callOpenFolder,
  getConfig,
  openFileEvent,
} from "../helpers/utils";
import { AddBookmarkBadge } from "../components/AddBookmarkBadge";
import AddBookmarkModal from "../components/AddBookmarkModal";
import FilePreviewPanel, { formatBytes, formatDate } from "../components/FilePreviewPanel";


const Navigator = () => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState("");
  const [directoryContents, setDirectoryContents] = useState<ExplorerItem[]>([]);
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
  const [bookmarksByVolume, setBookmarksByVolume] = useState([] as Bookmark[]);
  const [isChangingDrive, setIsChangingDrive] = useState(false);
  const [driveLetter, setDriveLetter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExplorerItem | null>(null);
  const [filter, setFilter] = useState("");
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    item: ExplorerItem;
  } | null>(null);
  const [bookmarkModalItem, setBookmarkModalItem] = useState<ExplorerItem | null>(null);

  const isConnected = !!driveLetter;

  useEffect(() => {
    getConfig(setFileIconMappings, setAlert, setShowAlert);
    getDrives();
  }, []);

  // Cerrar el menú contextual con clic, Escape, scroll o clic derecho fuera.
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctxMenu]);

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
          title: t("common.error"),
          message: t("explorer.errorGettingDrives"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  const byteToGB = (byte: number) =>
    (byte / 1024 / 1024 / 1024).toFixed(2) + " GB";

  const percentDisk = (drive: DrivesProps) =>
    drive.size && drive.freeSpace
      ? (100 * (drive.size - drive.freeSpace)) / drive.size
      : 0;

  const percentDiskColor = (drive: DrivesProps) => {
    const percent = percentDisk(drive);
    if (percent < 50) return "success";
    if (percent < 80) return "warning";
    return "danger";
  };

  const connectedDrives = drives.filter((drive) => drive.connected);

  const driveCard = (drive: DrivesProps) => (
    <Card
      key={drive.name}
      className={classNames("drive-card", {
        "drive-card-selected": selectedDrive === drive.name,
      })}
      onClick={() => {
        if (isChangingDrive) return;
        handleDriveSelect({ target: { value: drive.name } });
      }}
    >
      <Card.Body className="d-flex align-items-center py-2 px-3">
        <Icon.HddFill size={24} color="green" className="me-2 flex-shrink-0" />
        <div className="drive-card-info flex-grow-1">
          <div className="drive-card-title">
            {drive.letter} {drive.name}
          </div>
          {drive.size > 0 && (
            <>
              <ProgressBar
                variant={percentDiskColor(drive)}
                now={percentDisk(drive)}
              />
              <small className="text-muted">
                {byteToGB(drive.freeSpace)} {t("explorer.free")}
              </small>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const navigate = async (command, path = "") => {
    setIsLoading(true);
    try {
      const response = await Api.navigate(path, command) as NavigateResponse;

      if (!response.directoryContents) {
        setIsLoading(false);
        setAlert({
          title: t("common.error"),
          message: t("sync.driveNotDataSynced"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
        return null;
      }

      setCurrentPath(response.currentPath);
      setDirectoryContents(response.directoryContents);
      setDriveLetter(response.driveLetter || null);
      setSelectedItem(null);
      setFilter("");
      setAlert({ title: "", message: "", type: TypeAlert.success });
      setShowAlert(false);
    } catch (err) {
      console.log("Error", err);
      const errorMessage =
        (err as any).response?.data?.error === "Already at root"
          ? t("explorer.alreadyAtRoot")
          : (err as any).response?.data || t("common.anErrorOccurred");
      setAlert({
        title: t("common.error"),
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

  const cleanRelPath = (path: string) =>
    path.replace(/\//g, "\\").replace(/^\\+/, "").replace(/\\+$/, "");

  const handleItemClick = (item: ExplorerItem) => {
    if (item.type === "file") {
      setSelectedItem(item);
      return;
    }
    if (currentPath.match(/\\$/)) {
      navigate("cd", `${currentPath}${item.name}`);
    } else {
      navigate("cd", `${currentPath}\\${item.name}`);
    }
  };

  const handleItemDoubleClick = (item: ExplorerItem) => {
    if (item.type === "file" && isConnected) {
      openFileEvent(item.name, cleanRelPath(currentPath), driveLetter);
    }
  };

  const handleDriveChange = async (driveName) => {
    try {
      setIsChangingDrive(true);
      setCurrentPath("");
      setDirectoryContents([]);
      setSelectedItem(null);
      setFilter("");
      await Api.changeFileSystem(driveName);
      navigate("cd", "");
      loadBookmarks(driveName);
    } catch (error) {
      setAlert({
        title: t("common.error"),
        message: t("explorer.failedToChangeDrive"),
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
    if (path.charAt(0) === "\\") {
      path = path.substr(1);
    }
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
          title: t("common.error"),
          message: t("bookmarks.errorGetting"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  const getFileBookmark = (fileName) => {
    const bookmark = bookmarksByVolume.find(
      (bookmark) => bookmark.name === fileName && bookmark.path === currentPath
    );
    return bookmark;
  };

  function toBackslashPath(parts: string[]) {
    return "\\" + parts.join("\\");
  }

  const updateFilesWithBookmark = (bookmark: Bookmark) => {
    const newBookmarks = [...bookmarksByVolume];
    const bookmarkIndex = newBookmarks.findIndex(
      (b) => b.name === bookmark.name && b.path === bookmark.path
    );
    if (bookmarkIndex !== -1) {
      newBookmarks[bookmarkIndex] = { ...newBookmarks[bookmarkIndex], ...bookmark };
    } else {
      newBookmarks.push(bookmark);
    }
    setBookmarksByVolume(newBookmarks);
  };

  const getItemCategory = (item: ExplorerItem) => {
    if (item.type === "directory") return t("explorer.folder");
    const category = getFileIcon(getExtension(item.name), fileIconMappings).category;
    if (!category || category === "default") return t("explorer.file");
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const itemFullPath = (item: ExplorerItem) => {
    const rel = cleanRelPath(currentPath);
    const parts = [rel, item.name].filter(Boolean).join("\\");
    return driveLetter ? `${driveLetter}\\${parts}` : `\\${parts}`;
  };

  const copyText = (text: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch (e) {
      console.log(e);
    }
  };

  const visibleItems = useMemo(() => {
    if (!filter.trim()) return directoryContents;
    const term = filter.trim().toLowerCase();
    return directoryContents.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return item.name.toLowerCase().includes(term) || ext === term.replace(/^\./, "");
    });
  }, [directoryContents, filter]);

  const totals = useMemo(() => {
    const folders = visibleItems.filter((i) => i.type === "directory").length;
    const files = visibleItems.length - folders;
    const bytes = visibleItems.reduce((acc, i) => acc + (i.size || 0), 0);
    return { folders, files, bytes };
  }, [visibleItems]);

  const explorerRow = (item: ExplorerItem) => {
    const isDir = item.type === "directory";
    const ext = isDir ? "" : getExtension(item.name);
    const bookmark = isDir ? undefined : getFileBookmark(item.name);
    const isSelected = selectedItem?.name === item.name && !isDir;
    return (
      <div
        key={item.name}
        className={classNames("explorer-row", { selected: isSelected })}
        onClick={() => handleItemClick(item)}
        onDoubleClick={() => handleItemDoubleClick(item)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDir) setSelectedItem(item);
          setCtxMenu({
            x: Math.min(e.clientX, window.innerWidth - 230),
            y: Math.min(e.clientY, window.innerHeight - 260),
            item,
          });
        }}
      >
        <span className="explorer-icon">
          {isDir ? (
            <Icon.FolderFill size={16} className="explorer-folder-icon" />
          ) : (
            getFileIcon(ext, fileIconMappings).icon
          )}
        </span>
        <span className="explorer-cell-name">
          <span
            className={classNames(
              "explorer-name",
              isDir ? "explorer-folder-link" : "explorer-file-link"
            )}
          >
            {item.name}
          </span>
          {!isDir && bookmark && (
            <Icon.BookmarkFill size={11} className="explorer-bookmark-mark" />
          )}
        </span>
        <span className="explorer-col-type">{getItemCategory(item)}</span>
        <span className="explorer-col-size">
          {isDir
            ? item.items !== undefined
              ? `${item.items} ${t("explorer.elementsShort")}`
              : "—"
            : formatBytes(item.size)}
        </span>
        {isConnected && (
          <span className="explorer-col-mod">{formatDate(item.modified)}</span>
        )}
        <span
          className="explorer-col-actions explorer-actions"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {!isDir && (
            <AddBookmarkBadge
              isBookmarked={!!bookmark}
              fileName={item.name}
              path={currentPath}
              volume={selectedDrive}
              description={bookmark?.description || ""}
              setFiles={() => {}}
              onAddBookmark={updateFilesWithBookmark}
            />
          )}
          {!isDir && isConnected && (
            <Badge
              bg="none"
              style={{ cursor: "pointer" }}
              onClick={() =>
                openFileEvent(item.name, cleanRelPath(currentPath), driveLetter)
              }
            >
              <Icon.BoxArrowUpRight size={13} color="green" />
            </Badge>
          )}
          {isDir && isConnected && (
            <Badge
              bg="none"
              style={{ cursor: "pointer" }}
              onClick={(e) =>
                callOpenFolder(
                  cleanRelPath(currentPath)
                    ? `${cleanRelPath(currentPath)}\\${item.name}`
                    : item.name,
                  driveLetter || "",
                  e,
                  setAlert,
                  setShowAlert
                )
              }
            >
              <Icon.FolderSymlinkFill size={14} color="darkorange" />
            </Badge>
          )}
        </span>
      </div>
    );
  };

  return (
    <Container
      style={{ overflowY: "scroll", height: "100vh" }}
      className="sync"
    >
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.explorer")}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>{t("explorer.title")}</h2>
      <small>{t("explorer.subtitle")}</small>
      <Container fluid className="mt-3 mb-3">
        {showAlertMessage}
        {connectedDrives.length > 0 && (
          <div className="d-flex flex-wrap gap-3 mb-3">
            {connectedDrives.map(driveCard)}
          </div>
        )}
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {selectedDrive ? selectedDrive : t("explorer.selectDrive")}
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
                  color: drive.connected ? "green" : "inherit",
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
            <div className="explorer-toolbar">
              <Breadcrumb className="explorer-breadcrumb bg-body-tertiary p-0 m-0 flex-grow-1">
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
                        `cd`,
                        toBackslashPath(pathParts.slice(0, index + 1))
                      )
                    }
                    className={index === pathParts.length - 1 ? "fw-bold" : ""}
                    active={index === pathParts.length - 1}
                  >
                    {part}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
              <Form.Control
                size="sm"
                type="search"
                className="explorer-filter"
                placeholder={t("explorer.filterPlaceholder")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
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
              <div className="d-flex gap-3 align-items-start">
                <div className="explorer-list flex-grow-1">
                  <div className="explorer-colhead">
                    <span className="explorer-icon"></span>
                    <span className="explorer-cell-name">{t("explorer.name")}</span>
                    <span className="explorer-col-type">{t("explorer.colType")}</span>
                    <span className="explorer-col-size">{t("explorer.colSize")}</span>
                    {isConnected && (
                      <span className="explorer-col-mod">{t("explorer.colModified")}</span>
                    )}
                    <span className="explorer-col-actions">{t("explorer.actions")}</span>
                  </div>
                  {pathParts.length > 0 && (
                    <div
                      className="explorer-row explorer-row-up"
                      onClick={() => navigate("cd ..", currentPath)}
                    >
                      <span className="explorer-icon">
                        <Icon.ArrowUp size={14} />
                      </span>
                      <span className="explorer-cell-name text-muted">..</span>
                      <span className="explorer-col-type text-muted">
                        {t("explorer.upOneLevel")}
                      </span>
                      <span className="explorer-col-size"></span>
                      {isConnected && <span className="explorer-col-mod"></span>}
                      <span className="explorer-col-actions"></span>
                    </div>
                  )}
                  {visibleItems.map(explorerRow)}
                  <div className="explorer-statusbar">
                    <span>
                      {totals.folders} {t("explorer.folders")} · {totals.files}{" "}
                      {t("explorer.files")}
                      {isConnected && totals.bytes > 0
                        ? ` · ${formatBytes(totals.bytes)} ${t("explorer.inThisView")}`
                        : ""}
                    </span>
                    <span>
                      <span
                        className={classNames(
                          "status-dot",
                          isConnected ? "status-dot-on" : "status-dot-off"
                        )}
                      ></span>
                      {isConnected
                        ? `${driveLetter} ${selectedDrive} ${t("explorer.connectedDrive")}`
                        : `${selectedDrive} ${t("explorer.disconnectedDrive")}`}
                    </span>
                  </div>
                </div>
                {selectedItem && (
                  <FilePreviewPanel
                    item={selectedItem}
                    currentPath={currentPath}
                    driveLetter={driveLetter}
                    volume={selectedDrive}
                    bookmark={getFileBookmark(selectedItem.name)}
                    fileIconMappings={fileIconMappings}
                    onBookmarkChange={updateFilesWithBookmark}
                    onClose={() => setSelectedItem(null)}
                    setAlert={setAlert}
                    setShowAlert={setShowAlert}
                  />
                )}
              </div>
            )}
          </>
        )}
        {ctxMenu && (
          <div
            className="dropdown-menu show explorer-ctx-menu"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
          >
            {ctxMenu.item.type === "file" ? (
              <>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedItem(ctxMenu.item);
                    setCtxMenu(null);
                  }}
                >
                  <Icon.Eye size={13} className="me-2" />
                  {t("explorer.preview")}
                </button>
                <button
                  className="dropdown-item"
                  disabled={!isConnected}
                  onClick={() => {
                    openFileEvent(
                      ctxMenu.item.name,
                      cleanRelPath(currentPath),
                      driveLetter
                    );
                    setCtxMenu(null);
                  }}
                >
                  <Icon.BoxArrowUpRight size={13} className="me-2" />
                  {t("explorer.open")}
                </button>
                <button
                  className="dropdown-item"
                  disabled={!isConnected}
                  onClick={(e) => {
                    callOpenFolder(
                      cleanRelPath(currentPath),
                      driveLetter || "",
                      e,
                      setAlert,
                      setShowAlert
                    );
                    setCtxMenu(null);
                  }}
                >
                  <Icon.Folder2Open size={13} className="me-2" />
                  {t("explorer.showInFolder")}
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setBookmarkModalItem(ctxMenu.item);
                    setCtxMenu(null);
                  }}
                >
                  <Icon.BookmarkPlus size={13} className="me-2" />
                  {t("explorer.editBookmark")}
                </button>
              </>
            ) : (
              <>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleItemClick(ctxMenu.item);
                    setCtxMenu(null);
                  }}
                >
                  <Icon.FolderFill size={13} className="me-2" />
                  {t("explorer.open")}
                </button>
                <button
                  className="dropdown-item"
                  disabled={!isConnected}
                  onClick={(e) => {
                    const rel = cleanRelPath(currentPath);
                    callOpenFolder(
                      rel ? `${rel}\\${ctxMenu.item.name}` : ctxMenu.item.name,
                      driveLetter || "",
                      e,
                      setAlert,
                      setShowAlert
                    );
                    setCtxMenu(null);
                  }}
                >
                  <Icon.Folder2Open size={13} className="me-2" />
                  {t("explorer.showInFolder")}
                </button>
              </>
            )}
            <div className="dropdown-divider"></div>
            <button
              className="dropdown-item"
              onClick={() => {
                copyText(ctxMenu.item.name);
                setCtxMenu(null);
              }}
            >
              <Icon.Files size={13} className="me-2" />
              {t("explorer.copyName")}
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                copyText(itemFullPath(ctxMenu.item));
                setCtxMenu(null);
              }}
            >
              <Icon.Signpost size={13} className="me-2" />
              {t("explorer.copyPath")}
            </button>
          </div>
        )}
        {bookmarkModalItem && (
          <AddBookmarkModal
            show={true}
            onHide={() => setBookmarkModalItem(null)}
            bookmark={
              getFileBookmark(bookmarkModalItem.name) || {
                id: null,
                name: bookmarkModalItem.name,
                path: currentPath,
                volume: selectedDrive,
                description: "",
              }
            }
            onAddBookmark={(bookmark: Bookmark) => {
              updateFilesWithBookmark(bookmark);
              setBookmarkModalItem(null);
            }}
          />
        )}
      </Container>
    </Container>
  );
};

export default Navigator;
