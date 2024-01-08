import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./ConfirmDialog.css";
import * as Icon from "react-bootstrap-icons";

interface ConfirmDialogProps {
  title: string;
  message: string;
  show: boolean;
  handleCancel: () => void;
  handleOK: () => void;
}

function ConfirmDialog({
  title,
  message,
  show,
  handleCancel,
  handleOK,
}: ConfirmDialogProps): JSX.Element {
  return (
    <React.Fragment>
      <Modal
        show={show}
        onHide={handleCancel}
        centered
        className="confirmDialog"
        animation={false}
      >
        <Modal.Header>
          <Modal.Title>
            <Icon.PatchQuestion size={32} className="me-4" color="#007bff" />
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleOK} size="lg">
            <Icon.Check size={32} className="me-2" />
            Yes
          </Button>
          <Button variant="secondary" onClick={handleCancel} size="lg">
            <Icon.X size={32} className="me-2" />
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
export default ConfirmDialog;
