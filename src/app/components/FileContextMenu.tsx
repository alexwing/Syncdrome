import React, { useEffect } from "react";

/**
 * Menú contextual compartido (explorador, buscador, marcadores).
 * Se pinta con el aspecto de un dropdown de Bootstrap en posición fija y se
 * cierra con clic, clic derecho fuera, scroll o Escape.
 */

export interface ContextMenuEntry {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export type ContextMenuItem = ContextMenuEntry | "divider";

interface FileContextMenuProps {
  x: number;
  y: number;
  entries: ContextMenuItem[];
  onClose: () => void;
}

/** Posición ajustada para que el menú no se salga de la ventana. */
export const clampMenuPosition = (e: { clientX: number; clientY: number }) => ({
  x: Math.min(e.clientX, window.innerWidth - 230),
  y: Math.min(e.clientY, window.innerHeight - 280),
});

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  x,
  y,
  entries,
  onClose,
}) => {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="dropdown-menu show explorer-ctx-menu"
      style={{ left: x, top: y }}
    >
      {entries.map((entry, index) =>
        entry === "divider" ? (
          <div key={index} className="dropdown-divider"></div>
        ) : (
          <button
            key={index}
            className="dropdown-item"
            disabled={entry.disabled}
            onClick={() => {
              entry.onClick();
              onClose();
            }}
          >
            {entry.icon}
            {entry.label}
          </button>
        )
      )}
    </div>
  );
};

export default FileContextMenu;
