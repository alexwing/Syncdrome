import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { AlertMessageProps, AlertModel } from "../models/Interfaces";


function AlertMessage({
  show = false,
  alertMessage = {
    title: "",
    message: "",
    type: "danger",
  } as AlertModel,
  onHide,
  autoClose = 1000,
}: AlertMessageProps) : JSX.Element {
  const [showIn, setShowIn] = useState(false);
  const [alert, setAlert] = useState(alertMessage);
  //on load show modal
  useEffect(() => {
    setShowIn(show);
    setAlert(alertMessage);
    if (autoClose > 0) {
      setTimeout(() => {
        setShowIn(false);
      }, autoClose);
    }
  }, [show, alertMessage, autoClose]);

  function handleClose() {
    onHide();
  }

  return (
    <React.Fragment>
      <Modal
        show={showIn}
        onHide={handleClose}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        animation={false}
      >
        <Modal.Header className={"bg-" + alert.type}>
          <Modal.Title
            id="contained-modal-title-vcenter"
            className="modal-title-error"
          >
            {alert.title}
          </Modal.Title>
          <Button variant={alert.type} onClick={handleClose}>
            <i className="close-icon"></i>
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-warning">{alert.message}</Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default AlertMessage;
