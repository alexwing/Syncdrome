import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { AlertMessageProps, AlertModel } from "../models/Interfaces";
import * as Icon from "react-bootstrap-icons";

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
  // Create a ref that will persist
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //on load show modal
  useEffect(() => {
    setShowIn(show);
    setAlert(alertMessage);
    if (autoClose > 0) {
      // Clear previous timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Create new timeout
      timeoutRef.current = setTimeout(() => {
        setShowIn(false);
      }, autoClose);
    }

    // Clear timeout if the component is unmounted
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
        className="alert-message"
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
            <Icon.X size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body>{alert.message}</Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default AlertMessage;
