import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { convertFileSrc } from "@tauri-apps/api/core";
import Api from "../helpers/api";
import { Bookmark, ExplorerItem, FileTypes, TextPreview } from "../models/Interfaces";
import { getFileIcon, getExtension, openFileEvent, callOpenFolder } from "../helpers/utils";
import AddBookmarkModal from "./AddBookmarkModal";
import { useTranslation } from "../context/languageContext";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif", "ico"];
const VIDEO_EXTS = ["mp4", "webm", "m4v"];
const AUDIO_EXTS = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
const MARKDOWN_EXTS = ["md", "markdown"];
const TEXT_EXTS = [
  "txt", "json", "js", "jsx", "ts", "tsx", "css", "scss", "html", "htm",
  "xml", "csv", "log", "ini", "cfg", "yml", "yaml", "bat", "ps1", "py",
  "rs", "sh", "java", "c", "cpp", "h", "cs", "sql",
];

type PreviewKind = "image" | "video" | "audio" | "pdf" | "markdown" | "text" | "none";

const previewKind = (ext: string): PreviewKind => {
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (VIDEO_EXTS.includes(ext)) return "video";
  if (AUDIO_EXTS.includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (MARKDOWN_EXTS.includes(ext)) return "markdown";
  if (TEXT_EXTS.includes(ext)) return "text";
  return "none";
};

export const formatBytes = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[i]}`;
};

export const formatDate = (ms?: number): string => {
  if (ms === undefined || ms === null) return "—";
  return new Date(ms).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
};

interface FilePreviewPanelProps {
  item: ExplorerItem;
  /** Ruta relativa dentro del volumen, p. ej. "\\projects\\website". */
  currentPath: string;
  /** Letra de unidad ("F:") si el volumen está conectado; null si no. */
  driveLetter: string | null;
  volume: string;
  bookmark?: Bookmark;
  fileIconMappings: FileTypes;
  onBookmarkChange: (bookmark: Bookmark) => void;
  onClose: () => void;
  setAlert: (alert: any) => void;
  setShowAlert: (show: boolean) => void;
}

const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({
  item,
  currentPath,
  driveLetter,
  volume,
  bookmark,
  fileIconMappings,
  onBookmarkChange,
  onClose,
  setAlert,
  setShowAlert,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState<TextPreview | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  // El asset protocol debe autorizar la carpeta ANTES de que el <img>/<video>
  // pida el archivo; si no, la primera carga falla (carrera).
  const [scopeReady, setScopeReady] = useState(false);

  const ext = getExtension(item.name);
  const kind = previewKind(ext);
  const connected = !!driveLetter;

  // Ruta relativa limpia (sin barra inicial/final) y ruta absoluta en Windows.
  const relPath = currentPath.replace(/\//g, "\\").replace(/^\\+/, "").replace(/\\+$/, "");
  const fullPath = [driveLetter?.replace(/\\+$/, ""), relPath, item.name]
    .filter(Boolean)
    .join("\\");
  const assetUrl = connected ? convertFileSrc(fullPath) : "";

  useEffect(() => {
    setMediaError(false);
    setText(null);
    setScopeReady(false);
    if (!connected) return;
    // Autorizar la carpeta en el asset protocol (necesario fuera del explorador,
    // p. ej. al previsualizar desde el buscador).
    const dir = [driveLetter?.replace(/\\+$/, ""), relPath].filter(Boolean).join("\\");
    let cancelled = false;
    Api.allowPreviewDir(dir)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setScopeReady(true);
      });
    if (kind === "markdown" || kind === "text") {
      Api.readTextPreview(fullPath)
        .then((res) => setText(res as TextPreview))
        .catch(() => setMediaError(true));
    }
    return () => {
      cancelled = true;
    };
  }, [fullPath, kind, connected]);

  const bigIcon = (
    <div className="preview-placeholder">
      <span className="preview-placeholder-icon">
        {getFileIcon(ext, fileIconMappings).icon}
      </span>
      <span className="preview-placeholder-text">
        {connected ? t("explorer.noPreview") : t("explorer.connectToPreview")}
      </span>
    </div>
  );

  const renderPreview = () => {
    if (!connected || mediaError) return bigIcon;
    const needsScope =
      kind === "image" || kind === "video" || kind === "audio" || kind === "pdf";
    if (needsScope && !scopeReady) {
      return <small className="text-muted p-4">…</small>;
    }
    switch (kind) {
      case "image":
        return (
          <img src={assetUrl} alt={item.name} onError={() => setMediaError(true)} />
        );
      case "video":
        return <video controls src={assetUrl} onError={() => setMediaError(true)} />;
      case "audio":
        return (
          <div className="preview-audio">
            <Icon.MusicNoteBeamed size={42} className="mb-2" />
            <audio controls src={assetUrl} onError={() => setMediaError(true)} />
          </div>
        );
      case "pdf":
        return <iframe src={assetUrl} title={item.name} />;
      case "markdown":
        return (
          <div className="preview-text preview-markdown">
            {text ? <ReactMarkdown>{text.content}</ReactMarkdown> : <small>…</small>}
          </div>
        );
      case "text":
        return (
          <pre className="preview-text">{text ? text.content : "…"}</pre>
        );
      default:
        return bigIcon;
    }
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-title" title={item.name}>{item.name}</span>
        <Icon.X
          size={20}
          role="button"
          aria-label={t("common.close")}
          style={{ cursor: "pointer" }}
          onClick={onClose}
        />
      </div>

      <div className="preview-media">{renderPreview()}</div>
      {text?.truncated && (
        <small className="text-muted">{t("explorer.previewTruncated")}</small>
      )}

      <div className="preview-meta">
        <div className="meta-line">
          <span className="meta-label">{t("explorer.colType")}</span>
          <span className="meta-value">
            {getFileIcon(ext, fileIconMappings).category || t("explorer.file")}
            {ext ? ` · ${ext.toUpperCase()}` : ""}
          </span>
        </div>
        <div className="meta-line">
          <span className="meta-label">{t("explorer.colSize")}</span>
          <span className="meta-value">{formatBytes(item.size)}</span>
        </div>
        {connected && (
          <div className="meta-line">
            <span className="meta-label">{t("explorer.colModified")}</span>
            <span className="meta-value">{formatDate(item.modified)}</span>
          </div>
        )}
        <div className="meta-line">
          <span className="meta-label">{t("explorer.pathLabel")}</span>
          <span className="meta-value">
            {connected ? fullPath : `${volume} · \\${relPath ? relPath + "\\" : ""}${item.name}`}
          </span>
        </div>
      </div>

      <div
        className="preview-bookmark"
        role="button"
        title={t("explorer.editBookmark")}
        onClick={() => setShowBookmarkModal(true)}
      >
        <Icon.BookmarkPlusFill
          size={16}
          color={bookmark ? "#16ab9c" : "#cdcdcd"}
          className="flex-shrink-0"
        />
        <span className="preview-bookmark-text">
          {bookmark
            ? bookmark.description || t("explorer.bookmarked")
            : t("explorer.noBookmark")}
        </span>
        <Icon.PencilSquare size={13} className="ms-auto flex-shrink-0 preview-bookmark-edit" />
      </div>
      {showBookmarkModal && (
        <AddBookmarkModal
          show={showBookmarkModal}
          onHide={() => setShowBookmarkModal(false)}
          bookmark={
            bookmark || {
              id: null,
              name: item.name,
              path: currentPath,
              volume: volume,
              description: "",
            }
          }
          onAddBookmark={(saved: Bookmark) => {
            setShowBookmarkModal(false);
            onBookmarkChange(saved);
          }}
        />
      )}

      <div className="preview-actions">
        <Button
          size="sm"
          variant="primary"
          disabled={!connected}
          onClick={() => openFileEvent(item.name, relPath, driveLetter)}
        >
          <Icon.BoxArrowUpRight size={13} className="me-2" />
          {t("explorer.open")}
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={!connected}
          onClick={(e) => callOpenFolder(relPath, driveLetter || "", e, setAlert, setShowAlert)}
        >
          <Icon.Folder2Open size={13} className="me-2" />
          {t("explorer.showInFolder")}
        </Button>
      </div>
    </div>
  );
};

export default FilePreviewPanel;
