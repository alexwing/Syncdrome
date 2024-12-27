// En Settings.tsx
import React, { useState, useEffect } from "react";
import Api from "../helpers/api";
import {
  Button,
  Col,
  Container,
  Row,
  Alert,
  Badge,
  ListGroup,
  Spinner,
  FormSelect,
  Card,
  Form,
} from "react-bootstrap";

//import { ipcRenderer } from "electron";
import { invoke } from "@tauri-apps/api/core";
import { AlertModel, DrivesProps, FileTypes, TypeAlert } from "../models/Interfaces";
import AlertMessage from "../components/AlertMessage";
import * as Icon from "react-bootstrap-icons";

const Comfig = () => {
  const [folder, setFolder] = useState("");
  const [fileTypes, setFileTypes] = useState({} as FileTypes);
  const [selectedExtension, setSelectedExtension] = useState({
    key: "",
    ext: "",
  });
  const [newExtension, setNewExtension] = useState({ key: "", ext: "" });
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newConfig = { folder } as any;
    newConfig.extensions = fileTypes;
    Api.saveSettings(newConfig)
      .then((response) => {
        getConfig();
        if (response.data.result === "error") {
          setAlert({
            title: "Error",
            message: "Config file not saved: " + response.data.message,
            type: TypeAlert.danger
          });
          setShowAlert(true);
          return;
        }
        setAlert({
          title: "Success",
          message: "Config file saved successfully",
          type: TypeAlert.success
        });
        setShowAlert(true);
      })
      .catch((error) => {
        setAlert({
          title: "Error",
          message: "Config file not saved",
          type: TypeAlert.danger
        });
        setShowAlert(true);
      });
  };

  const getConfig = async () => {
    try {
      const response = await Api.getSettings();
      setFolder(response.data.folder);
      setFileTypes(response.data.extensions);
    } catch (error) {
      setAlert({
        title: "Error",
        message: "Config file not found or corrupted",
        type: TypeAlert.danger
      });
      setShowAlert(true);
      return;
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  // alert message
  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2000}
      ok={true}
    />
  );

  // open folder on click
  const openFolderHandler = (event) => {
    //extract leter from folder
    const driveLetter = folder.slice(0, 2);
    //extract path from folder
    const folderPath = folder.slice(3);
    event.preventDefault();
    event.stopPropagation();
    Api.openFolder(folderPath, driveLetter);
  };

  const onChangeFolder = async () => {
    const path = await invoke("open-directory-dialog", { folder });
    setFolder(path as string);
  };

  /* settings json 

  {
    "folder": "C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros",
    "NODE_ENV": "production",
    "extensions": {
        "document": {
            "icon": "File",
            "color": "black",
            "extensions": [
                "doc",
                "docx",
                "xls",
                "xlsx",
                "ppt",
                "pptx",
                "txt",
                "odt",
                "ods",
                "odp"
            ],
            "media": [
                "doc",
                "docx",
                "xls",
                "xlsx",
                "ppt",
                "pptx",
                "txt",
                "odt",
                "ods",
                "odp"
            ]
        },
        "image": {
            "icon": "FileImageFill",
            "color": "pink",
            "extensions": [
                "jpg",
                "jpeg",
                "bmp",
                "ico",
                "tif",
                "tiff",
                "arw",
                "raw",
                "psd",
                "png",
                "gif",
                "ps",
                "xcf"
            ],
            "media": [
                "jpg",
                "jpeg",
                "bmp",
                "tif",
                "tiff",
                "png",
                "gif",
                "psd"
            ]
        },
        "video": {
            "icon": "FileEarmarkPlayFill",
            "color": "red",
            "extensions": [
                "flv",
                "mov",
                "mkv",
                "mp4",
                "avi",
                "wmv",
                "webm",
                "mpg",
                "mpeg",
                "3gp"
            ],
            "media": [
                "mov",
                "mkv",
                "mp4",
                "avi",
                "wmv",
                "webm",
                "mpg",
                "mpeg"
            ]
        },
        "audio": {
            "icon": "FileEarmarkMusicFill",
            "color": "green",
            "extensions": [
                "mp3",
                "wav",
                "wma",
                "mpa",
                "aif",
                "iff",
                "m3u",
                "m4a"
            ],
            "media": [
                "mp3",
                "wav",
                "wma"
            ]
        },    
        "default": {
            "icon": "File",
            "color": "black",
            "extensions": [],
            "media": []
        }
    }
}
  
    */

  const getFileIcon = (icon: string, color: string) => {
    const IconComponent = Icon[icon];
    return <IconComponent size={20} className="me-2" color={color} />;
  };

  const isSelectected = (key, ext) => {
    return fileTypes[key].media.includes(ext);
  };

  const onSelected = (key, ext) => {
    const index = fileTypes[key].media.indexOf(ext);
    if (index > -1) {
      fileTypes[key].media.splice(index, 1);
    } else {
      fileTypes[key].media.push(ext);
    }
    setFileTypes({ ...fileTypes });
  };

  const onAddExtension = (key) => {
    if (newExtension.ext === "") return;
    //check if extension already exists in all file types
    for (const fileType in fileTypes) {
      if (
        fileTypes[fileType].extensions.includes(newExtension.ext.toLowerCase())
      ) {
        setAlert({
          title: "Error",
          message: "Extension already exists in " + fileType,
          type: TypeAlert.danger
        });
        setShowAlert(true);
        return;
      }
    }
    fileTypes[key].extensions.push(newExtension.ext.toLowerCase());
    setFileTypes({ ...fileTypes });
  };

  const filestypes = (key) => (
    <div className="form-group">
      <div className="d-flex justify-content-between align-items-center my-auto">
        <Form.Control
          name={key}
          id={key}
          type="text"
          placeholder="Extension"
          value={newExtension.ext}
          onChange={(e) => setNewExtension({ key, ext: e.target.value })}
        />
        <Button
          className="m-auto pt-0 pb-3 px-1"
          variant="link"
          onClick={() => onAddExtension(key)}
        >
          <Icon.PlusCircle color="RGB(0,123,255)" size={18} />
        </Button>
        <Button
          className="m-auto pt-0 pb-3 px-1"
          variant="link"
          onClick={() => {
            const index = fileTypes[key].extensions.indexOf(
              selectedExtension.ext
            );
            if (index > -1) {
              fileTypes[key].extensions.splice(index, 1);
              setFileTypes({ ...fileTypes });
            }
          }}
        >
          <Icon.DashCircle color="RGB(220,53,69)" size={18} />
        </Button>
      </div>
      <div
        id="fileTypes"
        className="border mt-2 p-2"
        style={{ height: "200px", overflow: "auto" }}
      >
        {fileTypes[key].extensions.map((ext) => (
          <div
            key={ext}
            className={`extension-check ${
              selectedExtension.ext === ext && selectedExtension.key === key
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedExtension({ key, ext })}
          >
            <input
              className="form-check-input"
              type="checkbox"
              value={ext}
              id={ext}
              checked={isSelectected(key, ext)}
              onChange={() => onSelected(key, ext)}
            />
            <label className="form-check-label" htmlFor={ext}>
              {ext}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <form onSubmit={handleSubmit}>
      {showAlertMessage}
      <label>
        Folder:
        <input
          type="text"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        />
        <Button
          variant="outline-secondary"
          type="button"
          onClick={onChangeFolder}
        >
          ...
        </Button>
        <Button
          variant="outline-none"
          type="button"
          onClick={openFolderHandler}
        >
          <Icon.Folder2Open color="green" size={22} className="m-0" />
        </Button>
      </label>
      <Row>
        <Col className="text-center">
          <Button variant="primary" type="submit" className="full-width">
            <Icon.Save color="white" size={18} className="me-3" />
            Save
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <Alert variant="info" className="mt-2 px-3 py-1 mb-0 opacity-75">
             Add or remove file extensions to the file types. The checked extensions will be considered as media files in sync.
          </Alert>
        </Col>
      </Row>
      <Container fluid className="d-flex flex-wrap align-items-center  py-2">
        {Object.keys(fileTypes).map((key) =>
          key === "default" ? null : (
            <React.Fragment key={key}>
              <Card style={{ width: "23.5rem" }} className="p-0 m-2">
                <Card.Body>
                  <Card.Title>
                    {getFileIcon(fileTypes[key].icon, fileTypes[key].color)}
                    {key}
                  </Card.Title>
                  <Card.Text>{filestypes(key)}</Card.Text>
                </Card.Body>
              </Card>
            </React.Fragment>
          )
        )}
      </Container>
      <Container
        fluid
        className="d-flex align-items-center justify-content-center py-2"
      ></Container>
    </form>
  );
};

export default Comfig;
