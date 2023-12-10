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
} from "react-bootstrap";
import Api from "../helpers/api";
import ProgressBar from "react-bootstrap/ProgressBar";
import Config from "../components/config";
interface DrivesProps {
  letter: string;
  name: string;
  freeSpace: string;
  size: string;
  sync: boolean;
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

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Settings</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Settings</h2>
      <p>Here you can configure the application.</p>
      <Config />
      <h3>Drives</h3>
      <p>Here you can see the drives and syncronize them.</p>

      <Container
        fluid
        className="d-flex align-items-center justify-content-center py-2"
      >
        <Row>
          <Col className="text-center">
            <Button variant="primary" size="sm" onClick={() => getDrives()}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Container>
      <Container fluid className="d-flex flex-wrap align-items-center  py-2">
        {drives.map((drive: DrivesProps, index) => (
          <Card style={{ width: "18rem" }} className="m-2" key={index}>
            <Card.Body>
              <Card.Title>
                {drive.letter} - {drive.name}
              </Card.Title>
              <Card.Text>
                {drive.sync ? "Syncronized" : "Not Syncronized"}
              </Card.Text>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroup.Item>
                Total Space: {byteToGB(drive.size)}
              </ListGroup.Item>
              <ListGroup.Item>
                Free Space: {byteToGB(drive.freeSpace)}
              </ListGroup.Item>
              {printPercentDisk(drive)}
            </ListGroup>
            <Card.Body>
              {drive.letter && (
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
              )}
            </Card.Body>
          </Card>
        ))}
      </Container>
    </Container>
  );
};

export default Settings;
