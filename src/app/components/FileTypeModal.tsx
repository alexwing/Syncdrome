import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useTranslation } from "../context/languageContext";

// Selección corta y reconocible para el estado sin búsqueda; el buscador da
// acceso al catálogo completo de react-bootstrap-icons.
const SUGGESTED_ICONS = [
  "File",
  "FileEarmark",
  "FileEarmarkText",
  "FileEarmarkRichtext",
  "FileEarmarkPdf",
  "FileEarmarkWord",
  "FileEarmarkExcel",
  "FileEarmarkSlides",
  "FileEarmarkCode",
  "FileEarmarkZip",
  "FileEarmarkBinary",
  "FileEarmarkFont",
  "FileImageFill",
  "FileEarmarkImage",
  "Image",
  "Images",
  "Camera",
  "CameraReels",
  "FileEarmarkPlayFill",
  "FileEarmarkPlay",
  "Film",
  "PlayBtn",
  "FileEarmarkMusicFill",
  "FileEarmarkMusic",
  "MusicNoteBeamed",
  "Headphones",
  "Archive",
  "Box",
  "Cpu",
  "Controller",
  "Book",
  "JournalText",
  "Globe",
  "Database",
  "Terminal",
  "Braces",
];

const ALL_ICON_NAMES = Object.keys(Icon);
const MAX_RESULTS = 60;

// Los colores guardados pueden ser nombres CSS ("pink"); <input type="color">
// solo acepta #rrggbb, así que se normaliza vía canvas.
const toHexColor = (color: string): string => {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#888888";
  ctx.fillStyle = "#888888";
  ctx.fillStyle = color;
  return /^#[0-9a-f]{6}$/i.test(ctx.fillStyle) ? ctx.fillStyle : "#888888";
};

export interface FileTypeDraft {
  name: string;
  icon: string;
  color: string;
}

interface FileTypeModalProps {
  show: boolean;
  /** Valores actuales al editar; undefined al crear. */
  initial?: FileTypeDraft;
  /** Nombres ya ocupados (sin contar el propio al editar). */
  takenNames: string[];
  onSave: (draft: FileTypeDraft) => void;
  onHide: () => void;
}

const FileTypeModal: React.FC<FileTypeModalProps> = ({
  show,
  initial,
  takenNames,
  onSave,
  onHide,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "File");
  const [color, setColor] = useState(toHexColor(initial?.color || "#888888"));
  const [search, setSearch] = useState("");

  const iconNames = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return SUGGESTED_ICONS;
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(term)).slice(
      0,
      MAX_RESULTS
    );
  }, [search]);

  const cleanName = name.trim();
  const taken = takenNames.some(
    (n) => n.toLowerCase() === cleanName.toLowerCase()
  );
  const reserved = cleanName.toLowerCase() === "default";
  const invalid = !cleanName || taken || reserved;

  const SelectedIcon = Icon[icon] || Icon.File;

  const save = () => {
    if (invalid) return;
    onSave({ name: cleanName, icon, color });
  };

  return (
    <Modal show={show} onHide={onHide} centered animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {initial ? t("settings.editType") : t("settings.addType")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2 align-items-end mb-3">
          <div className="flex-grow-1">
            <Form.Label className="mb-1">{t("settings.typeName")}</Form.Label>
            <Form.Control
              type="text"
              autoFocus
              value={name}
              isInvalid={!!cleanName && (taken || reserved)}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
            />
            <Form.Control.Feedback type="invalid">
              {t("settings.typeExists")}
            </Form.Control.Feedback>
          </div>
          <div className="text-center">
            <Form.Label className="mb-1">{t("settings.typeColor")}</Form.Label>
            <Form.Control
              type="color"
              value={color}
              title={t("settings.typeColor")}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <span className="filetype-preview" title={icon}>
            <SelectedIcon size={26} color={color} />
          </span>
        </div>

        <Form.Label className="mb-1">{t("settings.typeIcon")}</Form.Label>
        <Form.Control
          type="text"
          placeholder={t("settings.searchIcon")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="icon-picker-grid">
          {iconNames.map((n) => {
            const IconComp = Icon[n];
            return (
              <span
                key={n}
                role="button"
                title={n}
                className={`icon-picker-cell ${icon === n ? "selected" : ""}`}
                onClick={() => setIcon(n)}
              >
                <IconComp size={20} />
              </span>
            );
          })}
          {iconNames.length === 0 && (
            <small className="text-muted p-2">
              {t("settings.noIconsFound")}
            </small>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("common.cancel")}
        </Button>
        <Button variant="primary" disabled={invalid} onClick={save}>
          {t("common.ok")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileTypeModal;
