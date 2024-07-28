import React from "react";
import * as Icon from "react-bootstrap-icons";
import Api from "./api";
import { Badge, Button } from "react-bootstrap";
import { FileCleanerProps, Substitution } from "../models/Interfaces";

/***
 * get Icon component from extension
 * @param extension
 * @param fileIconMappings
 * @returns {{category: string, icon: JSX.Element}}
 */
export const getFileIcon = (extension, fileIconMappings) => {
  for (const category in fileIconMappings) {
    if (
      fileIconMappings[category].extensions.includes(extension.toLowerCase())
    ) {
      const { icon, color } = fileIconMappings[category];
      const IconComponent = Icon[icon];
      return {
        category,
        icon: <IconComponent size={20} color={color} />,
      };
    }
  }
  // Si no encuentra una categoría, usa la categoría predeterminada
  const { icon, color } = fileIconMappings["default"];
  const IconComponent = Icon[icon];
  return {
    category: "default",
    icon: <IconComponent size={20} color={color} />,
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
): JSX.Element => {
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
    newFileName = newFileName.replace(/[^\x00-\x7F]/g, "");

    return { ...fileName, fixed: newFileName + "." + extension };
  });

  return cleanedFileNames;
};
