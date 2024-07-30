import React, { useEffect, useState } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { ipcRenderer } from "electron";
import Api from "../helpers/api";
import "../styles/components/fileCleaner.css";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  AlertModel,
  FileCleanerProps,
  Substitution,
} from "../models/Interfaces";
import { cleanFileNames } from "../helpers/utils";
import AlertMessage from "../components/AlertMessage";

const defaultSubstitutions = [
  { find: "720p", replace: "" },
  { find: "1080p", replace: "" },
  { find: "720", replace: "" },
  { find: "1080", replace: "" },
  { find: "4K", replace: "" },
  { find: "(Spanish English)", replace: "" },
  { find: "web-dl", replace: "" },
  { find: "x264", replace: "" },
  { find: "x265", replace: "" },
  { find: "h264", replace: "" },
  { find: "h265", replace: "" },
  { find: "10bit", replace: "" },
  { find: "8bit", replace: "" },
  { find: "6ch", replace: "" },
  { find: "Spanish", replace: "" },
  { find: "English", replace: "" },
  { find: "Latino", replace: "" },
  { find: "Castellano", replace: "" },
  { find: "Español", replace: "" },
  { find: "Dual", replace: "" },
  { find: "Subtitulado", replace: "" },
  { find: "Subtitulos", replace: "" },
  { find: "AC3", replace: "" },
  { find: "()", replace: "" },
] as Substitution[];

const FileCleaner = () => {
  const initialPattenrTerm = localStorage.getItem("patternTerm") || "";
  const [originFolder, setOriginFolder] = useState("");
  const [substitutions, setSubstitutions] =
    useState<Substitution[]>(defaultSubstitutions);
  const [fileNames, setFileNames] = useState<FileCleanerProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [pattern, setPattern] = useState(initialPattenrTerm);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({} as AlertModel);

  const changeOriginFolder = async () => {
    const path = await ipcRenderer.invoke(
      "open-directory-dialog",
      originFolder
    );
    setOriginFolder(path);
  };

  const loadFileNames = async () => {
    if (originFolder) {
      setLoading(true);
      const files = await Api.getFilesInFolder(originFolder);
      setFileNames(files);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileNames.length > 0 && !loading) {
      cleanFileNamesHandler();
    }
  }, [loading]);

  useEffect(() => {
    if (originFolder) {
      loadFileNames();
    }
  }, [originFolder]);

  const handleAddSubstitution = () => {
    setSubstitutions([{ find: "", replace: "" }, ...substitutions]);
  };

  const handleDeleteSubstitution = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const deleteSubstitution = (index) => {
    const newSubstitutions = [...substitutions];
    newSubstitutions.splice(index, 1);
    setSubstitutions(newSubstitutions);
    setShowConfirm(false);
    setDeleteIndex(0);
  };

  const handleSubstitutionChange = (index, field, value) => {
    const newSubstitutions = [...substitutions];
    newSubstitutions[index][field] = value;
    setSubstitutions(newSubstitutions);
  };

  const cleanFileNamesHandler = () => {
    const cleanedFileNames = cleanFileNames(fileNames, substitutions, pattern);
    setFileNames(cleanedFileNames);
  };

  const handleInputChange = (index, event) => {
    const newFileNames = [...fileNames];
    newFileNames[index].fixed = event.target.value;
    setFileNames(newFileNames);
  };

  const handlePatternChange = (event) => {
    localStorage.setItem("patternTerm", event.target.value);  
    setPattern(event.target.value);
  };

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

  const applyChanges = () => {
    //use api to rename files send fileNames to api, is success show alert message and reload folder
    /*** rename files in folder use post method renameFilesInFolder
     * @param FileCleanerProps [{ path: string; filename: string; fixed: string;},...]
     * @returns FileCleanerProps [{ path: string; filename: string; fixed:string, status: string;},...]
     * @example renameFilesInFolder([{ path: "D:\\Pictures\\IMG_0001.jpg", filename: "IMG_0001.jpg", fixed: "IMG_0001.jpg" },...])
     * */
    Api.renameFilesInFolder(fileNames)
      .then((response) => {
        setAlert({
          title: "Files renamed successfully",
          message: "",
          type: "success",
        });
        setShowAlert(true);
        setFileNames(response);
      })
      .catch((error) => {
        setAlert({
          title: "Error renaming files",
          message: error.message,
          type: "danger",
        });
        setShowAlert(true);
      });
  };

  return (
    <Container className="container-scroll">
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>File Name Cleaner</Breadcrumb.Item>
      </Breadcrumb>
      <h2>File Name Cleaner</h2>
      <Row style={{ backgroundColor: "#f8f9fa", padding: "20px" }}>
        <Col md={6}>
          <Form>
            <Form.Group controlId="formOriginFolder" className="mt-2">
              <Form.Label>
                <Icon.Folder2Open className="me-2" size={20} color="blue" />
                Origin Folder
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Origin Folder"
                value={originFolder}
                readOnly
                className="mt-3"
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={changeOriginFolder}
              >
                ...
              </Button>
            </Form.Group>
            <Form.Group controlId="formPattern" className="mt-5">
              <Form.Label>
                <Icon.Scissors className="me-2" size={20} color="blue" />
                Pattern
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Pattern"
                onChange={handlePatternChange}
                value={pattern || ""}
              />
            </Form.Group>
          </Form>
        </Col>
        <Col md={6}>
          <Form.Label>
            <Icon.CurrencyExchange className="me-2" size={20} color="blue" />
            Substitution Rules
            <Button
              variant="none"
              onClick={handleAddSubstitution}
              className="mt-1"
            >
              <Icon.PlusCircle size={20} color="green" />
            </Button>
          </Form.Label>
          <div className="table-container">
            <Table striped bordered hover>
              <thead className="table-header">
                <tr>
                  <th>Find</th>
                  <th>Replace</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {substitutions.map((substitution, index) => (
                  <tr key={index}>
                    <td className="cell-no-padding">
                      <Form.Control
                        type="text"
                        value={substitution.find}
                        onChange={(e) =>
                          handleSubstitutionChange(
                            index,
                            "find",
                            e.target.value
                          )
                        }
                        className="form-control-flat"
                      />
                    </td>
                    <td className="cell-no-padding">
                      <Form.Control
                        type="text"
                        value={substitution.replace}
                        onChange={(e) =>
                          handleSubstitutionChange(
                            index,
                            "replace",
                            e.target.value
                          )
                        }
                        className="form-control-flat"
                      />
                    </td>
                    <td className="cell-no-padding">
                      <Button
                        variant="none"
                        onClick={() => handleDeleteSubstitution(index)}
                      >
                        <Icon.Trash size={20} color="red" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={12} className="d-flex justify-content-center">
          <Button
            variant="primary"
            type="button"
            size="lg"
            className="mx-2 mt-3"
            onClick={loadFileNames}
            disabled={!originFolder}
          >
            <Icon.ArrowRepeat className="me-2" size={20} color="white" />
            Reload
          </Button>
          <Button
            variant="primary"
            type="button"
            size="lg"
            className="mx-2 mt-3"
            onClick={cleanFileNamesHandler}
            disabled={!originFolder}
          >
            <Icon.FileEarmarkText className="me-2" size={20} color="white" />
            Clean File Names
          </Button>
          <Button
            variant="success"
            type="button"
            size="lg"
            className="mx-2 mt-3"
            onClick={applyChanges}
            disabled={!originFolder}
          >
            <Icon.Check2All className="me-2" size={20} color="white" />
            Apply Changes
          </Button>
        </Col>
      </Row>
      {!fileNames.length && (
        <Row>
          <Col md={12}>
            <div className="text-center mt-3">
              <Alert variant="info">
                {" "}
                <Icon.FileEarmarkText className="m-2" size={32} color="black" />
                No files to clean
              </Alert>
            </div>
          </Col>
        </Row>
      )}
      {fileNames.length > 0 && (
        <Row>
          <Col md={12}>
            <h4>File Names</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                </tr>
              </thead>
              <tbody>
                {fileNames.map((file, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="file-name">
                        <strong>Original:</strong> {file.filename}
                      </div>
                      <div className="fixed-name">
                        <strong>Fixed:</strong>
                        <Form.Control
                          type="text"
                          value={file.fixed || ""}
                          onChange={(event) => handleInputChange(index, event)}
                        />
                      </div>
                      {file.status && (
                        <div className="file-status">
                          <strong>Status:</strong> {file.status}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
      <ConfirmDialog
        title="Delete Substitution Rule"
        message="Are you sure you want to delete this substitution rule?"
        show={showConfirm}
        handleCancel={() => setShowConfirm(false)}
        handleOK={() => deleteSubstitution(deleteIndex)}
      />
      {showAlertMessage}
    </Container>
  );
};

export default FileCleaner;
