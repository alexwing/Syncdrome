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
  Form,
  ButtonGroup,
} from "react-bootstrap";
import Api from "../helpers/api";
import ProgressBar from "react-bootstrap/ProgressBar";
import * as Icon from "react-bootstrap-icons";
import { DrivesProps } from "../interfaces/interface";

const Sync = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDrives();
  }, []);

  const getDrives = () => {
    Api.getDrives()
      .then((res) => {
        console.log(res.data);
        setDrives(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const executeContentDrive = (drive) => {
    setLoading(true);
    Api.getExecute(drive)
      .then((res) => {
        console.log(res.data);
        setLoading(false);
        getDrives();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteDrive = (drive) => {
    Api.deleteDrive(drive)
      .then((res) => {
        console.log(res.data);
        getDrives();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const percentDisk = (drive) => {
    if (!drive.size || !drive.freeSpace) return 0;
    let percent = (100 * (drive.size - drive.freeSpace)) / drive.size;
    console.log(
      "Drive: ",
      drive.letter,
      "size: ",
      drive.size,
      "freeSpace: ",
      drive.freeSpace,
      "percent: ",
      percent
    );
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

  const toogleMediaDrive = (drive:DrivesProps, state) => {
    drive.onlyMedia = state;
    Api.toogleMediaDrive(drive.name, state)
      .then((res) => {
        console.log(res.data);
        getDrives();
      })
      .catch((err) => { 
        console.log(err);
      });
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }} className="sync">
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Sync</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Syncronize Drives</h2>
      <small>Here you can see the drives and syncronize them.</small>
      <Container fluid>
        <Row>
          <Col className="text-right">
            <Button variant="primary" size="sm" onClick={() => getDrives()}>
              <Icon.ArrowRepeat color="white" size={16} className="me-2" />
              Refresh
            </Button>
          </Col>
        </Row>
      </Container>
      <Container fluid className="d-flex flex-wrap align-items-center  py-2">
        {drives.map((drive: DrivesProps, index) => (
          <Card
            style={{ width: "23.566rem" }}
            className="m-2"
            key={index}
            bg={!drive.conected ? "light" : "white"}
          >
            <Card.Body>
              <Card.Title className={!drive.conected ? "text-muted" : ""}>
                {!drive.conected && (
                  <Icon.Hdd color="darkgray" size={24} className="me-2" />
                )}
                {drive.conected && (
                  <Icon.HddFill color="darkgray" size={24} className="me-2" />
                )}
                {drive.letter} {drive.name}
              </Card.Title>
              <Card.Text>
                <Badge bg={drive.sync ? "primary" : "secondary"}>
                  {drive.sync ? "Syncronized" : "Not Syncronized"}
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
                  onClick={() => deleteDrive(drive.letter)}
                >
                  <Icon.TrashFill color="white" size={16} />
                </Button>
              )}
              {drive.conected && (
                <React.Fragment>
                  <Button
                    disabled={loading}
                    onClick={() => executeContentDrive(drive.letter)}
                  >
                    {! loading ? 
                      <Icon.ArrowRepeat color="white" size={16} className="me-2" />
                      :
                     (
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
              )}{drive.onlyMedia}            
                  <Button
                    variant={!drive.onlyMedia ? "success" : "secondary"}
                    style={{width: "100px"}}
                    onClick={() =>
                      toogleMediaDrive(drive, !drive.onlyMedia)
                    }
                    disabled={!drive.conected}
                  >{drive.onlyMedia ? 
                    <span className="d-none d-md-inline"><Icon.Film color="white" size={16} className="me-2" />Only Media</span>
                    :
                    <span className="d-none d-md-inline"><Icon.CheckAll color="white" size={16} className="me-2" />All</span>
                  }
                 
                  </Button>
            </ButtonGroup>
          </Card>
        ))}
      </Container>
    </Container>
  );
};

export default Sync;
