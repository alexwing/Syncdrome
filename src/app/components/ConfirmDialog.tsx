import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./ConfirmDialog.css";
import * as Icon from "react-bootstrap-icons";
import { useTranslation } from "../context/languageContext";

interface ConfirmDialogProps {
  title: string;
  message: string;
  subMessage?: string;
  show: boolean;
  handleCancel: () => void;
  handleOK: () => void;
}

function ConfirmDialog({
  title,
  message,
  subMessage,
  show,
  handleCancel,
  handleOK,
}: ConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      className="confirmDialog"
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="modal-title">
          <Icon.PatchQuestion size={28} className="me-3 confirm-icon" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="confirm-dialog-message mb-0">{message}</p>
        {subMessage && (
          <div className="confirm-dialog-submessage mt-3">
            <Icon.ExclamationTriangleFill size={18} className="me-2 flex-shrink-0 mt-0.5" />
            <span>{subMessage}</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleOK} size="lg">
          <Icon.Check size={24} className="me-2" />
          {t("common.yes")}
        </Button>
        <Button variant="secondary" onClick={handleCancel} size="lg">
          <Icon.X size={24} className="me-2" />
          {t("common.no")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
export default ConfirmDialog;
