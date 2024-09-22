const express = require("express");
const fs = require("fs-extra");
const path = require("path");

const app = express();
app.use(express.json());

/**
 * buildFileSystem - Parses the input file and builds a nested dictionary representing the file system.
 * @param {string} filename - The name of the file to parse.
 * @returns {object} - The file system as a nested dictionary.
 */
function buildFileSystem(filename) {
  const fileSystem = {};
  const data = fs.readFileSync(filename, "utf-8");
  //and remove the tree first character from the string "C:\"
  const lines = data.split("\n").map((line) => line.slice(3));

  lines.forEach((line) => {
    const parts = line.trim().split("\\");
    let currentLevel = fileSystem;

    parts.forEach((part, i) => {
      //console.log("*"+part+"*");
      if (i === parts.length - 1) {
        currentLevel[part] = null; // File
      } else {
        if (!currentLevel[part]) {
          currentLevel[part] = {}; // New directory
        }
        currentLevel = currentLevel[part];
      }
    });
  });

  //print fileSystem in json format
  // console.log(JSON.stringify(fileSystem, null, 2));
  return fileSystem;
}


/**
 * navigate - Handles navigation commands.
 * @param {object} fileSystem - The file system to navigate.
 * @param {string} currentPath - The current path in the file system.
 * @param {string} command - The navigation command (e.g., "cd ..", "cd FolderName").
 * @returns {object} - An object containing the current directory, path, and a list of files/directories.
 */
function navigate(fileSystem, currentPath, command) {
  let newPath = currentPath;
  let currentDir = fileSystem;

  console.log("Current path: " + currentPath);
  console.log("Command: " + command);

  if (command === "cd ..") {
    const parts = currentPath.split("\\");
    if (parts.length > 1) {
      parts.pop();
      newPath = parts.join("\\");
    } else {
      throw new Error("Already at root");
    }
  } else if (command.startsWith("cd")) {
    const targetDir = command.slice(3);
    const parts = currentPath.split("\\");
    parts.push(targetDir);
    newPath = parts.join("\\");
  } else {
    throw new Error("Invalid command");
  }
  const parts = newPath.split("\\").filter((part) => part !== "");
  
  for (const part of parts) {
    console.log("Part: " + part);
    if (currentDir && currentDir[part]) {
      currentDir = currentDir[part];
    } else {
      throw new Error("Invalid path");
    }
  }

  const filesAAndDirs = Object.keys(currentDir).map((key) => ({
    name: key,
    type: currentDir[key] === null ? "file" : "directory",
  }));

  return {
    currentPath: newPath,
    directoryContents: filesAAndDirs
  };
}

module.exports = function (app) {
  const fileSystem = buildFileSystem(
    "C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros\\PENDRIVE128.txt"
  ); // Reemplaza con tu archivo
  app.post("/navigate", (req, res) => {
    const { currentPath, command } = req.body;

    console.log("Command: " + command);
    console.log("Current path: " + currentPath);

    try {
      const navigationResult = navigate(fileSystem, currentPath, command);
      res.status(200).send(navigationResult);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
};