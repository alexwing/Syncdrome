import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Api from "../helpers/api";
import { Bookmark } from "../models/Interfaces";
import { Col, Row } from "react-bootstrap";

function AddBookmarkModal({ show = false, onHide, bookmark, onAddBookmark }) {
  const [bookmarkLocal, setBookmarkLocal] = useState({} as Bookmark);

  useEffect(() => {
    setBookmarkLocal(bookmark);
  }, [bookmark]);

  function handleClose() {
    onHide();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const result = await Api.addBookmark(bookmarkLocal);
      onHide();
      onAddBookmark(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event) {
    setBookmarkLocal({
      ...bookmarkLocal,
      [event.target.name]: event.target.value,
    });
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="add-bookmark-modal"
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {bookmarkLocal.id ? "Edit" : "Add"} Bookmark
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="m-0 p-0">
        <Form onSubmit={handleSubmit}>
          <Row className="p-3 m-0 text-white bg-dark">
            <Col xs={10}>
              <Form.Group controlId="bookmarkName">
                <Form.Label className="text-white-50 fs-6 fw-bold">
                  File
                </Form.Label>
                <Form.Text className="text-white">
                  {bookmarkLocal.name}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={2}>
              <Form.Group controlId="bookmarkVolume">
                <Form.Label className="text-white-50 fs-6 fw-bold">
                  Volume
                </Form.Label>
                <Form.Text className="text-white">
                  {bookmarkLocal.volume}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <div className="p-3">
            <Form.Group controlId="bookmarkDescription" className="mb-3">
              <Form.Label className="text-black-50 fs-6 fw-bold">
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={bookmarkLocal.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="me-2">
              Ok
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddBookmarkModal;
