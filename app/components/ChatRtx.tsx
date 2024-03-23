import React, { useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import chatApi from "../helpers/chatApi";

function ChatRtx() {
  const [message, setMessage] = useState(
    "Can you give me the list of Asimov's books?"
  );
  const [response, setResponse] = useState("");
  const [port, setPort] = useState(11365); // Reemplazar con el puerto correcto
  const [files, setFiles] = useState([] as File[]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    try {
      setLoading(true);
      const queueManager = new chatApi(port);
      queueManager
        .sendMessage(message)
        .then((response) => {
          setLoading(false);
          console.log("Respuesta del servidor:", response);
          //extract <br>Reference files:<br>ExternoHP.txt
          const filesContent = response.match(/<br>Reference files:<br>(.*)/);
          //remove after  <br>Reference files:<br> from response
          response = response.replace(/<br>Reference files:<br>(.*)/, "");
          if (filesContent.length > 1) {
            console.log("filesContent:", filesContent[1]);
            //split the files by <br>
            const fileNames = filesContent[1].split("<br>");
            if (fileNames.length > 0) {
              // remove .txt from the file names
              fileNames.forEach((file, i) => {
                fileNames[i] = file.replace(".txt", "");
              });
            } else {
              fileNames.push(filesContent[1].replace(".txt", ""));
            }
            console.log("fileNames:", fileNames);
            setFiles(fileNames);
          }
          setResponse(response);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // component to show the files
  // <Badge bg="secondary" className="me-2">{file}</Badge>
  const Files = () => {
    return (
      <div>
        {files && Array.isArray(files)
          ? files.map((file, i) => (
              <Badge key={i} bg="secondary" className="me-2 p-2 fs-6">
                  <Icon.DeviceHddFill
                    size={20}
                    className="me-2"
                  />                
                {file.toString()}
              </Badge>
            ))
          : null}
      </div>
    );
  };

  return (
    <Container style={{ overflowY: "scroll", height: "100vh" }}>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Chat</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Chat</h2>
      <Row className="p-3 m-0">
        <Col xs={9} className="p-0">
          <Form.Group controlId="search">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3} // Ajusta este número a la cantidad de líneas que desees
              placeholder="Ask a question"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={3}>
          <Form.Group controlId="port" className="mb-3">
            <Form.Label>Port</Form.Label>
            <Form.Control
              type="number"
              placeholder="Port"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="p-1 m-0">
        <Col xs={12} className="p-0">
          <Button
            onClick={sendMessage}
            className="m-auto d-block mt-3 p-3"
            size="lg"
            variant="primary"
          >
            <Icon.Send className="me-2" />
            Send
          </Button>
        </Col>
      </Row>
      <Row className="p-3 m-0">
        <Col xs={12} className="p-0">
          <Card>
            <Card.Header>Response</Card.Header>
            <Card.Body>
              {loading && (
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
              <Card.Text>
                {response.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </Card.Text>
              {Files()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatRtx;
