import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Col, Container, Form, Row } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import ConfirmDialog from "../components/ConfirmDialog";
import Api from "../helpers/api";
import { LogFile } from "../models/Interfaces";
import { open } from '@tauri-apps/plugin-dialog';

const FolderSync = () => {
  // Estado para almacenar los logs
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialOriginFolder = localStorage.getItem("originFolder") || "";
  const initialDestinationFolder =
    localStorage.getItem("destinationFolder") || "";
  const [originFolder, setOriginFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const syncTime = 2000; // Tiempo de refresco de logs

  useEffect(() => {
    setOriginFolder(initialOriginFolder);
    setDestinationFolder(initialDestinationFolder);
  }, []);

  // Función para simular la adición de logs
  const handleSync = () => {
    Api.syncToFolder(originFolder, destinationFolder)
      .then((response: any) => {
        const newLog = response.message;
        setLogs([newLog]); // Añade el nuevo log al estado
        setRefreshFlag(true);
      })
      .catch((error) => {
        const newLog = `Sync failed. ${error.message}`;
        setLogs([newLog]); // Añade el nuevo log al estado
        setRefreshFlag(false);
      });
  };

  //refrescar logs cada 5 segundos para obtener los logs en tiempo real
  useEffect(() => {
    if (!refreshFlag) return;
    const interval = setInterval(() => {
      Api.getSyncLog().then((fileLog: LogFile) => {
        setLogs([fileLog.info, fileLog.refresh, fileLog.summary]);
        if (fileLog.summary.length > 0) {
          setRefreshFlag(false);
        }
      });
    }, syncTime);
    return () => clearInterval(interval);
  }, [refreshFlag]);

  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  const handleOKConfirm = () => {
    setShowConfirm(false);
    handleSync();
  };

  const changeOriginFolder = (path: string) => {
    setOriginFolder(path);
    localStorage.setItem("originFolder", path);
  };

  const changeDestinationFolder = (path: string) => {
    setDestinationFolder(path);
    localStorage.setItem("destinationFolder", path);
  };

  const onChangeFolderOrigin = async () => {
    try {
      const folder = await open({
        directory: true,
        multiple: false,
        title: 'Selecciona una carpeta',
        defaultPath: '/ruta/inicial'
      });
      setOriginFolder(folder as string);
      if (folder) {
        console.log('Carpeta seleccionada:', folder);
        changeOriginFolder(folder as string);
      } else {
        console.log('No se seleccionó ninguna carpeta.');
      }
    } catch (error) {
      console.error('Error al abrir el diálogo:', error);
    }
  };

  const onChangeFolderDestination = async () => {
    try {
      const folder = await open({
        directory: true,
        multiple: false,
        title: 'Selecciona una carpeta',
        defaultPath: '/ruta/inicial'
      });
      setDestinationFolder(folder as string);
      if (folder) {
        console.log('Carpeta seleccionada:', folder);
        changeDestinationFolder(folder as string);
      } else {
        console.log('No se seleccionó ninguna carpeta.');
      }
    } catch (error) {
      console.error('Error al abrir el diálogo:', error);
    }
  };

  // open origin folder on click
  const openOriginFolderHandler = (event) => {
    //extract leter from folder
    const driveLetter = originFolder.slice(0, 2);
    //extract path from folder
    const folderPath = originFolder.slice(3);
    event.preventDefault();
    event.stopPropagation();
    Api.openFolder(folderPath, driveLetter);
  };

  // open destination folder on click
  const openDestinationFolderHandler = (event) => {
    //extract leter from folder
    const driveLetter = destinationFolder.slice(0, 2);
    //extract path from folder
    const folderPath = destinationFolder.slice(3);
    event.preventDefault();
    event.stopPropagation();
    Api.openFolder(folderPath, driveLetter);
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <ConfirmDialog
        title="Sync Confirmation"
        message={`Are you sure you want to sync the folders?`}
        subMessage={`'${destinationFolder}' will be overwritten.`}
        show={showConfirm}
        handleCancel={handleCloseConfirm}
        handleOK={handleOKConfirm}
      />
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Folder Sync</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Folder Sync</h2>
      <small>Select folders to synchronize. Existing files in the destination that match the source will be preserved; those missing in the destination will be added; and those not present in the source will be deleted.</small>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                <Icon.CollectionPlayFill
                  className="me-2"
                  size={20}
                  color="red"
                />
                Origin Folder
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Origin Folder"
                onChange={(e) => changeOriginFolder(e.target.value)}
                value={originFolder}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={onChangeFolderOrigin}
              >
                ...
              </Button>
              <Button
                variant="outline-none"
                type="button"
                onClick={openOriginFolderHandler}
              >
                <Icon.Folder2Open color="green" size={22} className="m-0" />
              </Button>
              <Form.Text className="text-muted">
                Select the folder Origin.
              </Form.Text>
            </Form.Group>
          </Form>
        </Col>
        <Col md={6}>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                <Icon.InboxFill className="me-2" size={20} color="blue" />
                Destination Folder
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Destination Folder"
                onChange={(e) => changeDestinationFolder(e.target.value)}
                value={destinationFolder}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={onChangeFolderDestination}
              >
                ...
              </Button>
              <Button
                variant="outline-none"
                type="button"
                onClick={openDestinationFolderHandler}
              >
                <Icon.Folder2Open color="green" size={22} className="m-0" />
              </Button>
              <Form.Text className="text-muted">
                Select the folder Destination.
              </Form.Text>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Button
            variant="primary"
            type="submit"
            size="lg"
            className="mx-auto d-block mt-3"
            onClick={() => setShowConfirm(true)}
            disabled={
              !originFolder ||
              !destinationFolder ||
              originFolder === destinationFolder
            }
          >
            <Icon.ArrowRepeat className="me-3" size={20} />
            Sync
          </Button>
        </Col>
      </Row>
      {logs.length > 0 && (
        <Row>
          <Col md={12}>
            <div className="mt-3">
              <h4>Sync Logs</h4>
              <code
                className="p-3 bg-dark text-light rounded"
                style={{
                  display: "block",
                  width: "100%",
                  height: "calc(100vh - 32em)",
                  overflowY: "scroll",
                }}
              >
                {logs.map((log, index) => (
                  <p style={{ whiteSpace: "pre-wrap" }} key={index}>
                    {log}
                  </p>
                ))}
              </code>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default FolderSync;
