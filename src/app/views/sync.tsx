import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  ListGroup,
  Spinner,
  Container,
  Row,
  Col,
  Badge,
  ButtonGroup,
} from "react-bootstrap";
import Api from "../helpers/api";
import ProgressBar from "react-bootstrap/ProgressBar";
import * as Icon from "react-bootstrap-icons";
import { AlertModel, DrivesProps, TypeAlert } from "../models/Interfaces";
import AlertMessage from "../components/AlertMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../context/languageContext";

const Sync = () => {
  const { t } = useTranslation();
  const [drives, setDrives] = useState<DrivesProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDrives, setLoadingDrives] = useState(false);
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    type: "danger",
  } as AlertModel);
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<DrivesProps | null>(null);

  useEffect(() => {
    getDrives();
  }, []);

  const getDrives = async () => {
    setLoadingDrives(true);
    try {
      const res = await Api.getDrives();
      setDrives(Array.isArray(res) ? res : []);
    } catch (err) {
      console.log(err);
      setAlert({
        title: t("common.error"),
        message: t("explorer.errorGettingDrives"),
        type: TypeAlert.danger,
      });
      setShowAlert(true);
    } finally {
      setLoadingDrives(false);
    }
  };

  const executeContentDrive = (drive) => {
    setLoading(true);
    Api.getExecute(drive)
      .then((res) => {
        setLoading(false);
        getDrives();
        setAlert({
          title: t("common.success"),
          message: t("sync.driveSynced"),
          type: TypeAlert.success,
        });
        setShowAlert(true);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setAlert({
          title: t("common.error"),
          message: err.response.data,
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  const handleOKConfirm = () => {
    setShowConfirm(false);
    if (selectedDrive) {
      deleteDrive(selectedDrive);
    }
  };

  const showDeleteDrive = (drive: DrivesProps) => {
    setSelectedDrive(drive);
    setShowConfirm(true);
  };

  const deleteDrive = (drive: DrivesProps) => {
    const driveIdentifier = drive.connected && drive.letter ? drive.letter : drive.name;
    Api.deleteDrive(driveIdentifier)
      .then((res) => {
        if (!res?.success) {
          throw new Error(res?.error || t("sync.cannotDeleteCatalog"));
        }
        getDrives();
        setAlert({
          title: t("sync.deleted"),
          message: t("sync.catalogDeleted", { name: drive.name }),
          type: TypeAlert.success,
        });
        setShowAlert(true);
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: t("common.error"),
          message: err?.message || t("sync.cannotDeleteCatalog"),
          type: TypeAlert.danger,
        });
        setShowAlert(true);
      });
  };

  // open folder on click
  const openDriveHandler = (driveLetter: string) => {
    //extract letter from folder
    if (driveLetter) {
      Api.openFolder("", driveLetter);
    } else {
      setAlert({
        title: t("common.error"),
        message: t("explorer.noDriveLetter"),
        type: TypeAlert.danger,
      });
      setShowAlert(true);
    }
  };

  const percentDisk = (drive) => {
    if (!drive.size || !drive.freeSpace) return 0;
    let percent = (100 * (drive.size - drive.freeSpace)) / drive.size;
    return percent;
  };

  const percentDiskColor = (drive) => {
    const percent: number = percentDisk(drive);
    if (percent < 50) return "success";
    if (percent < 80) return "warning";
    return "danger";
  };

  const printPercentDisk = (drive) => {
    if (!drive.size || !drive.freeSpace) return null;
    return (
      <ListGroup.Item>
        <ProgressBar
          variant={percentDiskColor(drive)}
          now={percentDisk(drive)}
          label={`${percentDisk(drive).toFixed(2)}%`}
        />
      </ListGroup.Item>
    );
  };
  const byteToGB = (byte: number) => {
    return (byte / 1024 / 1024 / 1024).toFixed(2) + " GB";
  };

  const getSyncDate = (drive) => {
    if (drive.syncDate) {
      return new Date(drive.syncDate).toLocaleString();
    }
    return "";
  };

  const getTotalSize = () => {
    let total = 0;
    drives.forEach((drive: DrivesProps) => {
      total += drive.size;
    });
    return total;
  };

  const getTotalFreeSpace = () => {
    let total = 0;
    drives.forEach((drive: DrivesProps) => {
      total += drive.freeSpace;
    });
    return total;
  };

  const toogleMediaDrive = (drive: DrivesProps, state) => {
    drive.onlyMedia = state;
    Api.toogleMediaDrive(drive.name, state)
      .then((res) => {
        getDrives();
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          title: t("common.error"),
          message: err.response.data,
          type: TypeAlert.danger,
        });
      });
  };

  const showAlertMessage = (
    <AlertMessage
      show={showAlert}
      alertMessage={alert}
      onHide={() => setShowAlert(false)}
      autoClose={2500}
    />
  );

  return (
    <Container
      style={{ overflowY: "scroll", height: "100vh" }}
      className="sync"
    >
      {showAlertMessage}
      <ConfirmDialog
        title={t("sync.deleteCatalogTitle")}
        message={t("sync.confirmDeleteCatalog")}
        show={showConfirm}
        handleCancel={handleCloseConfirm}
        handleOK={handleOKConfirm}
      />
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">{t("common.home")}</Breadcrumb.Item>
        <Breadcrumb.Item active>{t("nav.sync")}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>{t("sync.title")}</h2>
      <small>{t("sync.intro")}</small>
      <Container fluid className="mt-3 mb-3">
        <Row>
          <Col md={9}>
            <ListGroup>
              <ListGroup.Item>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div className="fw-bold">Total</div>
                </div>
                <ProgressBar
                  variant={percentDiskColor({
                    size: getTotalSize(),
                    freeSpace: getTotalFreeSpace(),
                  })}
                  now={percentDisk({
                    size: getTotalSize(),
                    freeSpace: getTotalFreeSpace(),
                  })}
                  label={`${percentDisk({
                    size: getTotalSize(),
                    freeSpace: getTotalFreeSpace(),
                  }).toFixed(2)}%`}
                />
              </ListGroup.Item>
              <ListGroup.Item>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div className="fw-bold">{byteToGB(getTotalSize())}</div>
                  <div>Free: {byteToGB(getTotalFreeSpace())}</div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => getDrives()}
              disabled={loadingDrives}
              style={{ width: "225px", margin: "16px" }}
            >
              {!loadingDrives ? (
                <Icon.ArrowRepeat color="white" size={16} className="me-2" />
              ) : (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              )}
              Refresh
            </Button>
          </Col>
        </Row>
      </Container>
      <Container fluid className="d-flex flex-wrap align-items-center  py-2">
        {loadingDrives && (
          <div className="sync-loading-drives">
            <Spinner animation="border" variant="primary" role="status" />
            <span className="ms-3">{t("sync.loadingDrives")}</span>
          </div>
        )}
        {!loadingDrives && drives.length === 0 && (
          <div className="sync-loading-drives text-muted">
            No drives found
          </div>
        )}
        {!loadingDrives && drives.map((drive: DrivesProps, index) => (
          <Card
            style={{ width: "23.5rem" }}
            className={drive.connected ? "me-3 mb-3" : "me-3 mb-3 drive-disconnected"}
            key={index}
            bg={!drive.connected ? "light" : "white"}
          >
            <Card.Body>
              <Card.Title className={!drive.connected ? "text-muted" : ""}>
                {!drive.connected && (
                  <Icon.Hdd color="darkgray" size={24} className="me-2" />
                )}
                {drive.connected && (
                  <Icon.HddFill
                    color="green"
                    size={24}
                    className="me-2"
                    onClick={openDriveHandler.bind(this, drive.letter)}
                    style={{ cursor: "pointer" }}
                    key={index}
                  />
                )}
                {drive.letter} {drive.name}
              </Card.Title>
              <Card.Text>
                <Badge bg={drive.sync ? "primary" : "secondary"}>
                  {drive.sync ? t("sync.synced") : t("sync.notSynced")}
                </Badge>
                <Badge bg="light" text="dark" className="ms-2">
                  {getSyncDate(drive)}
                </Badge>
              </Card.Text>
            </Card.Body>
            {drive.size > 0 && (
              <ListGroup className="list-group-flush">
                {printPercentDisk(drive)}
                <ListGroup.Item>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="fw-bold">{byteToGB(drive.size)}</div>
                    <div>Free: {byteToGB(drive.freeSpace)}</div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            )}
            <ButtonGroup aria-label="Basic example">
              {drive.sync && (
                <Button
                  variant="danger"
                  onClick={() => showDeleteDrive(drive)}
                >
                  <Icon.TrashFill color="white" size={16} />
                </Button>
              )}
              {drive.connected && (
                <React.Fragment>
                  <Button
                    disabled={loading}
                    onClick={() => executeContentDrive(drive.letter)}
                  >
                    {!loading ? (
                      <Icon.ArrowRepeat
                        color="white"
                        size={16}
                        className="me-2"
                      />
                    ) : (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                    )}
                    Sync
                  </Button>
                </React.Fragment>
              )}
              {drive.onlyMedia}
              <Button
                variant={!drive.onlyMedia ? "success" : "secondary"}
                style={{ width: "100px" }}
                onClick={() => toogleMediaDrive(drive, !drive.onlyMedia)}
                disabled={!drive.connected}
              >
                {drive.onlyMedia ? (
                  <span className="d-none d-md-inline">
                    <Icon.Film color="white" size={16} className="me-2" />
                    {t("sync.onlyMedia")}
                  </span>
                ) : (
                  <span className="d-none d-md-inline">
                    <Icon.CheckAll color="white" size={16} className="me-2" />
                    {t("sync.all")}
                  </span>
                )}
              </Button>
            </ButtonGroup>
          </Card>
        ))}
      </Container>
    </Container>
  );
};

export default Sync;
