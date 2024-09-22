const express = require("express");
const fs = require("fs-extra");
const path = require("path");

/**
 * buildFileSystem - Parses the input file and builds a nested dictionary representing the file system.
 * @param {string} filename - The name of the file to parse.
 * @returns {object} - The file system as a nested dictionary.
 */
function buildFileSystem(filename) {
  const fileSystem = {};
  const data = fs.readFileSync(filename, "utf-8");
  const lines = data.split("\n");

  lines.forEach((line) => {
    const parts = line.trim().split("\\");
    let currentLevel = fileSystem;

    parts.forEach((part, i) => {
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

  return fileSystem;
}

/**
 * displayDirectory - Displays the contents of a directory.
 * @param {object} directory - The directory to display.
 * @returns {array} - The contents of the directory.
 */
function displayDirectory(directory) {
  if (directory === null) {
    return ["File"];
  } else {
    return Object.keys(directory);
  }
}

/**
 * navigate - Handles navigation commands.
 * @param {object} fileSystem - The file system to navigate.
 * @param {string} currentPath - The current path in the file system.
 * @returns {object} - The current directory and path.
 */
function navigate(fileSystem, currentPath) {
  let currentDir = fileSystem;
  const parts = currentPath.split("\\");

  for (const part of parts) {
    if (currentDir[part]) {
      currentDir = currentDir[part];
    } else {
      return { error: "Invalid path" };
    }
  }

  return { currentDir, currentPath };
}

module.exports = function (app) {
  const fileSystem = buildFileSystem("C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros\\Almacenamiento.txt"); // Reemplaza con tu archivo

  app.post("/navigate", (req, res) => {
    const { currentPath, command } = req.body;
    let { currentDir } = navigate(fileSystem, currentPath);

    if (currentDir.error) {
      return res.status(400).send(currentDir.error);
    }

    if (command === "cd ..") {
      const parts = currentPath.split("\\");
      if (parts.length > 1) {
        parts.pop();
        currentDir = navigate(fileSystem, parts.join("\\")).currentDir;
      } else {
        return res.status(400).send("Already at root");
      }
    } else if (command.startsWith("cd ")) {
      const targetDir = command.slice(3);
      if (currentDir[targetDir]) {
        currentPath += "\\" + targetDir;
        currentDir = currentDir[targetDir];
      } else {
        return res.status(400).send("Invalid directory");
      }
    } else if (currentDir[command] !== undefined) {
      return res.status(200).send({ message: "Selected: " + command });
    } else {
      return res.status(400).send("Invalid command");
    }

    res.status(200).send({ currentDir: displayDirectory(currentDir), currentPath });
  });

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
};