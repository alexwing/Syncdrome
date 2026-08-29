import React from "react";
import * as Icon from "react-bootstrap-icons";
import Api from "./api";
import { Badge, Button } from "react-bootstrap";
import {
  Bookmark,
  FileCleanerProps,
  FileType,
  FileTypes,
  Substitution,
} from "../models/Interfaces";

/***
 * get file extension from a name; dotfiles and extensionless names return ""
 * @param name
 * @returns {string}
 */
export const getExtension = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
};

/***
 * copy text to the clipboard (best effort)
 * @param text
 */
export const copyToClipboard = (text: string) => {
  try {
    navigator.clipboard?.writeText(text);
  } catch (e) {
    console.log(e);
  }
};

// Canvas context reused to normalize any CSS color (names, hex, rgb…) to hex.
let colorCtx: CanvasRenderingContext2D | null = null;

/***
 * Config colors are chosen for light backgrounds; on the dark theme, dark
 * colors (black, darkblue…) become invisible. Lighten them, keeping the hue.
 */
const themeAwareColor = (color: string): string => {
  if (document.documentElement.getAttribute("data-bs-theme") !== "dark") {
    return color;
  }
  try {
    if (!colorCtx) {
      colorCtx = document.createElement("canvas").getContext("2d");
    }
    if (!colorCtx) return color;
    colorCtx.fillStyle = color;
    const hex = colorCtx.fillStyle as string;
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return color;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (l >= 0.35) return color;
    // Convertir a HSL y subir la luminosidad manteniendo el tono
    const d = max - min;
    let h = 0;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, 65%)`;
  } catch {
    return color;
  }
};

/***
 * get Icon component from extension
 * @param extension
 * @param fileIconMappings
 * @returns {{category: string, icon: JSX.Element}}
 */
export const getFileIcon = (extension: string, fileIconMappings: FileTypes) => {
  for (const category in fileIconMappings) {
    if (
      fileIconMappings[category].extensions.includes(extension.toLowerCase())
    ) {
      const { icon, color } = fileIconMappings[category];
      const IconComponent = Icon[icon];
      return {
        category,
        icon: <IconComponent size={20} color={themeAwareColor(color)} />,
      };
    }
  }
  // Si no encuentra una categoría, usa la categoría predeterminada
  const fallback = fileIconMappings["default"];
  if (!fallback || !Icon[fallback.icon]) {
    return {
      category: "default",
      icon: <Icon.FileEarmark size={20} color={themeAwareColor("gray")} />,
    };
  }
  const IconComponent = Icon[fallback.icon];
  return {
    category: "default",
    icon: <IconComponent size={20} color={themeAwareColor(fallback.color)} />,
  };
};

/***
 *  open file on click
 * @param filename
 * @param folder
 * @param driveLetter
 * @returns {void}
 */
export const openFileEvent = (filename, folder, driveLetter) => {
  if (driveLetter) {
    Api.openFile(filename, folder, driveLetter);
  }
};

/***
 * Open file in windows explorer
 * @param fileName
 * @param folder
 * @param connected
 * @returns {JSX.Element}
 */
export const openFileEye = (
  fileName: string,
  folder: string,
  connected: string
): React.JSX.Element => {
  return (
    <Badge
      bg="none"
      className="ms-4"
      style={{ cursor: "pointer", height: "28px" }}
      onClick={() => openFileEvent(fileName, folder, connected)}
    >
      <Icon.Eye size={18} color="green" />
    </Badge>
  );
};

export const connectedIcon = (connected) => {
  if (!connected) {
    return null;
  }
  return (
    <Button
      variant="outline-none"
      className="me-2 text-success"
      onClick={(event) => {
        openFileEvent("", "", connected);
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Icon.Plug size={20} className="me-1" color="green" />
      {connected}
    </Button>
  );
};

/***
 * Clean file names based on substitutions list
 * @param fileNames
 * @param substitutions
 * @returns {[]}
 */
export const cleanFileNames = (
  fileNames: FileCleanerProps[],
  substitutions: Substitution[],
  pattern: string
) => {
  const cleanedFileNames = fileNames.map((fileName) => {
    let newFileName = fileName.filename;
    const extension = newFileName.split(".").pop();

    // Remove extension
    newFileName = newFileName.slice(0, newFileName.lastIndexOf("."));

    // Remove pattern
    if (pattern) {
      const parts = newFileName.split(pattern);
      newFileName = parts[0] || newFileName;
    }

    // Replace all '.' with space
    newFileName = newFileName.split(".").join(" ");

    // Apply substitutions
    substitutions.forEach(({ find, replace }) => {
      const regex = new RegExp(find, "gi");
      newFileName = newFileName.replace(regex, replace).trim();
    });

    // Remove empty parentheses
    newFileName = newFileName.replace(/\(\s*\)/g, "");

    // Remove extra double spaces
    newFileName = newFileName.replace(/\s+/g, " ");

    // Remove leading and trailing spaces
    newFileName = newFileName.trim();

    // Remove non-UTF-8 characters
    newFileName = newFileName.replace(/[^\x00-\x7F\u00C0-\u00FF]/g, "");

    return { ...fileName, fixed: newFileName + "." + extension };
  });

  return cleanedFileNames;
};



/***
 * Open folder in windows explorer
 * @param folder
 * @param driveLetter
 * @param event
 * @param setAlert
 * @param setShowAlert
 * @returns {void}
 */
export const callOpenFolder = (
  folder: string,
  driveLetter: string,
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  setAlert,
  setShowAlert
) => {
  event.preventDefault();
  event.stopPropagation();
  if (driveLetter) {
    Api.openFolder(folder, driveLetter);
  } else {
    setAlert({
      title: "Error",
      message: "Drive not connected",
      type: "danger",
    });
    setShowAlert(true);
  }
};

/***
 *  Get configuration settings
 *  @param setFileIconMappings
 *  @param setAlert
 *  @param setShowAlert
 *  This function fetches the configuration settings and updates the state accordingly
 */
export const getConfig = async (
  setFileIconMappings,
  setAlert,
  setShowAlert
) => {
  try {
    const response:any = await Api.getSettings();
    setFileIconMappings(response.extensions);
  } catch (error) {
    setAlert({
      title: "Error",
      message: "Config file not found or corrupted",
      type: "danger",
    });
    setShowAlert(true);
    return;
  }
};
