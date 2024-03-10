import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Api from "../helpers/api";
import { Bookmark } from "../models/Interfaces";

function AddBookmarkModal({ show = false, onHide, bookmark }) {
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
      await Api.addBookmark(bookmarkLocal);
      onHide();
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
          Añadir Bookmark
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="bookmarkName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={bookmarkLocal.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="bookmarkPath">
            <Form.Label>Ruta</Form.Label>
            <Form.Control
              type="text"
              name="path"
              value={bookmarkLocal.path}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="bookmarkVolume">
            <Form.Label>Volumen</Form.Label>
            <Form.Control
              type="text"
              name="volume"
              value={bookmarkLocal.volume}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="bookmarkDescription">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={bookmarkLocal.description}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Añadir
          </Button>
          <Button variant="secondary" onClick={handleClose} className="ml-2">
            Cancelar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddBookmarkModal;