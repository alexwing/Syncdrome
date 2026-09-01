import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { AlertMessageProps, AlertModel, TypeAlert } from "../models/Interfaces";
import * as Icon from "react-bootstrap-icons";
import "./AlertMessage.css";
import { useTranslation } from "../context/languageContext";

function AlertMessage({
  show = false,
  alertMessage = {
    title: "",
    message: "",
    type: TypeAlert.danger,
  } as AlertModel,
  onHide,
  autoClose = 3000,
  variant = "auto",
  placement = "top-right",
}: AlertMessageProps): React.JSX.Element | null {
  const { t } = useTranslation();
  const [showIn, setShowIn] = useState(false);
  const [alert, setAlert] = useState(alertMessage);
  const [isFrozen, setIsFrozen] = useState(false);
  const isFrozenRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSuccess =
    alert.type === TypeAlert.success || alert.type === ("success" as TypeAlert);
  const isToast =
    variant === "toast" || (variant === "auto" && isSuccess);

  // Detener el temporizador de auto-cierre cuando el usuario interactúa (clic o hover)
  const freezeTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isFrozenRef.current = true;
    setIsFrozen(true);
  };

  useEffect(() => {
    setShowIn(show);
    setAlert(alertMessage);
    isFrozenRef.current = false;
    setIsFrozen(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (show && autoClose > 0) {
      timeoutRef.current = setTimeout(() => {
        if (!isFrozenRef.current) {
          setShowIn(false);
          onHide();
        }
      }, autoClose);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [show, alertMessage, autoClose]);

  function handleClose() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowIn(false);
    onHide();
  }

  if (!showIn) return null;

  // Renderizado como Toast Tip (lateral superior derecho)
  if (isToast) {
    return (
      <div
        className={`syncdrome-toast-container ${
          placement === "bottom-right" ? "placement-bottom" : ""
        }`}
        role="alert"
        aria-live="polite"
      >
        <div
          className={`syncdrome-toast toast-${alert.type}`}
          onClick={freezeTimer}
          onMouseEnter={freezeTimer}
        >
          <div className="syncdrome-toast-icon">
            {isSuccess ? (
              <Icon.CheckCircleFill size={20} className="text-success" />
            ) : (
              <Icon.InfoCircleFill size={20} className="text-info" />
            )}
          </div>
          <div className="syncdrome-toast-content">
            {alert.title && (
              <div className="syncdrome-toast-title">{alert.title}</div>
            )}
            <div className="syncdrome-toast-message">{alert.message}</div>
          </div>
          <button
            type="button"
            className="syncdrome-toast-close"
            aria-label="Cerrar"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <Icon.X size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Renderizado como Modal de Atención / Advertencia / Error (centro de la pantalla)
  const isDanger =
    alert.type === TypeAlert.danger || alert.type === ("danger" as TypeAlert);

  return (
    <Modal
      show={showIn}
      onHide={handleClose}
      centered
      className="syncdrome-alert-modal"
      animation={false}
    >
      <div onClick={freezeTimer} style={{ width: "100%" }}>
        <Modal.Header className={`bg-${alert.type}`}>
          <Modal.Title id="contained-modal-title-vcenter">
            {isDanger ? (
              <Icon.ExclamationOctagonFill size={22} className="me-2" />
            ) : (
              <Icon.ExclamationTriangleFill size={22} className="me-2" />
            )}
            {alert.title}
          </Modal.Title>
          <Button
            variant="link"
            className="text-white p-0 d-flex align-items-center"
            style={{ textDecoration: "none", opacity: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <Icon.X size={26} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{alert.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={isDanger ? "danger" : "warning"}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            size="sm"
          >
            {t("common.close") || "Cerrar"}
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}

export default AlertMessage;
