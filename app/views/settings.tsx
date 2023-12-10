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
} from "react-bootstrap";
import Api from "../helpers/api";
import ProgressBar from "react-bootstrap/ProgressBar";
import Config from "../components/config";
import * as Icon from "react-bootstrap-icons";

interface DrivesProps {
  letter: string;
  name: string;
  freeSpace: string;
  size: string;
  sync: boolean;
  syncDate: string;
}

const Settings = () => {
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
  const byteToGB = (byte: string) => {
    return (parseFloat(byte) / 1024 / 1024 / 1024).toFixed(2) + " GB";
  };

  const getSyncDate = (drive) => {
    if (drive.syncDate) {
      return new Date(drive.syncDate).toLocaleString();
    }
    return "";
  }

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Settings</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Settings</h2>
      <small>Here you can configure the application.</small>
      <p className="mt-3">
        Select the folder where you want to save the files.
      </p>
      <Config />
      <h3>Drives</h3>
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
          <Card style={{ width: "23.566rem" }} className="m-2" key={index}>
            <Card.Body>
              <Card.Title>
                <Icon.HddFill color="darkgray" size={24} className="me-2" />
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
            <Card.Body>
              <Button
                variant="outline-primary"
                disabled={loading}
                onClick={() => executeContentDrive(drive.letter)}
              >
                {loading && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                Sync
              </Button>
              {drive.sync && (
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={() => deleteDrive(drive.letter)}
                >
                  <Icon.TrashFill color="white" size={16} />
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}
      </Container>
    </Container>
  );
};

export default Settings;
