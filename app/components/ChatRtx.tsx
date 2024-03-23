import React, { useState } from "react";
import {
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
          setResponse(response);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error:", error);
    }
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatRtx;
