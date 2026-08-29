import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Container,
  Spinner,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import classNames from "classnames";
import {
  AlertModel,
  FileTypes,
  FileType,
  IFile,
  TypeAlert,
} from "../models/Interfaces";
import AlertMessage from "../components/AlertMessage";
import ExtensionSelect from "../components/ExtensionSelect";
import {
  connectedIcon,
  getFileIcon,
  getExtension,
  openFileEvent,
  callOpenFolder,
  getConfig,
} from "../helpers/utils";
import { AddBookmarkBadge } from "../components/AddBookmarkBadge";
import FilePreviewPanel from "../components/FilePreviewPanel";
import { useTranslation } from "../context/languageContext";

const Home = () => {
  const { t } = useTranslation();
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
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);
  const [selected, setSelected] = useState<{
    volume: string;
    folder: string;
    fileName: string;
  } | null>(null);


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
    getConfig(setFileIconMappings, setAlert, setShowAlert);
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
        setFiles(res);
        setSelected(null);
        if (Object.keys(res).length > 0) {
          setFound(true);
        } else {
          setFound(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: t("common.error"),
          message: t("home.errorSearching"),
          type: TypeAlert.danger,
        });
        setIsLoading(false);
      });
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


  const openFolderBadge = (folder: string, driveLetter: any) => {
    if (driveLetter) {
      return (
        <Badge
          bg="none"
          onClick={(e) => callOpenFolder(folder, driveLetter, e, setAlert, setShowAlert)}
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

  // Volúmenes ordenados: conectados primero por letra, luego el resto por nombre
  const sortedVolumes = Object.keys(files).sort((a, b) => {
    const ca = (files[a] as any)?.connected;
    const cb = (files[b] as any)?.connected;
    if (ca && cb) return String(ca).localeCompare(String(cb));
    if (ca) return -1;
    if (cb) return 1;
    return a.localeCompare(b);
  });

  // Fila de resultado con la estética del explorador
  const resultRow = (item: IFile, volume: string, folder: string) => {
    const drive = files[volume].connected;
    const isSel =
      selected?.volume === volume &&
      selected?.folder === folder &&
      selected?.fileName === item.fileName;
    return (
      <div
        key={item.fileName}
        className={classNames("explorer-row", { selected: isSel })}
        onClick={() =>
          setSelected({ volume, folder, fileName: item.fileName })
        }
        onDoubleClick={() =>
          drive && openFileEvent(item.fileName, folder, drive)
        }
      >
        <span className="explorer-icon">
          {getFileIcon(item.extension || getExtension(item.fileName), fileIconMappings).icon}
        </span>
        <span className="explorer-cell-name">
          <span className="explorer-name explorer-file-link">
            <small className="text-muted">{item.folder}\</small>
            {item.fileName}
          </span>
          {item.bookmark && (
            <Icon.BookmarkFill size={11} className="explorer-bookmark-mark" />
          )}
        </span>
        <span
          className="explorer-col-actions explorer-actions"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <AddBookmarkBadge
            isBookmarked={!!item.bookmark}
            fileName={item.fileName}
            path={folder}
            volume={volume}
            description={item.bookmark?.description || ""}
            setFiles={setFiles}
            onAddBookmark={(bookmark) => updateFilesWithBookmark(bookmark)}
          />
          {drive && (
            <Badge
              bg="none"
              style={{ cursor: "pointer" }}
              onClick={() => openFileEvent(item.fileName, folder, drive)}
            >
              <Icon.BoxArrowUpRight size={13} color="green" />
            </Badge>
          )}
        </span>
      </div>
    );
  };

/***
   *  Update files with bookmark
   *  @param prevFiles
   *  @param bookmark
   *  @returns {any}
   */
const updateFilesWithBookmark = (
  bookmark: { volume: string | number; path: string | number; name: any }
) => {
  const newFiles = { ...files };
  if (!newFiles[bookmark.volume]) {
    console.error(`Volume ${bookmark.volume} does not exist in files`);
    return files;
  }
  const fileIndex = newFiles[bookmark.volume].content[
    bookmark.path
  ].findIndex((file: { fileName: any }) => file.fileName === bookmark.name);
  if (fileIndex !== -1) {
    newFiles[bookmark.volume].content[bookmark.path][fileIndex] = {
      ...newFiles[bookmark.volume].content[bookmark.path][fileIndex],
      bookmark,
    };
  }
  setFiles(newFiles);
};
  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      {showAlertMessage}
      <div className="centered pt-3">
      <img src="/assets/icon.png" alt="logo" className="logo" />
        <h1>{t("nav.title")}</h1>
      </div>
      <div className="container text-center pb-3">
        <form className="search" onSubmit={handleSearch}>
          <input
            value={searchTerm}
            onChange={handleInput}
            type="search"
            placeholder={t("home.searchPlaceholder")}
          />
          <ExtensionSelect
            fileExtension={fileIconMappings}
            className="my-3"
            onValuesChange={onExtSelectChange}
            values={extSelected}
          />
          <Button variant="primary" type="submit" size="lg" className="me-2">
            <Icon.Search size={20} className="me-2" />
            {t("common.search")}
          </Button>
          <Button variant="secondary" size="lg" onClick={handleClearSearch}>
            {t("common.clear")}
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
              {t("home.noResults")}
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
          <div className="d-flex gap-3 align-items-start">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <Accordion>
            {sortedVolumes.map((key, index) => (
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
                                openFolderBadge(key2, files[key].connected)}
                            </Accordion.Header>
                            <Accordion.Body>
                              {files[key].content[key2].map((item: IFile) =>
                                resultRow(item, key, key2)
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        )
                    )}
                  </Accordion>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
            </div>
            {selected &&
              (() => {
                const vol = files[selected.volume];
                const item = vol?.content?.[selected.folder]?.find(
                  (f: IFile) => f.fileName === selected.fileName
                );
                if (!item) return null;
                const drive = vol.connected;
                return (
                  <FilePreviewPanel
                    item={{ name: item.fileName, type: "file" }}
                    currentPath={selected.folder}
                    driveLetter={typeof drive === "string" ? drive : null}
                    volume={selected.volume}
                    bookmark={(item.bookmark as any) || undefined}
                    fileIconMappings={fileIconMappings}
                    onBookmarkChange={(bookmark) =>
                      updateFilesWithBookmark(bookmark as any)
                    }
                    onClose={() => setSelected(null)}
                    setAlert={setAlert}
                    setShowAlert={setShowAlert}
                  />
                );
              })()}
          </div>
        )}
      </div>

    </Container>
  );
};

export default Home;
