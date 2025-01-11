const cp = require("child_process");
const path = require("path");
const fs = require("fs");


/***
 * get is volume name is connected, return true or false
 * @param {String} driveName - The volume name
 * @returns {Boolean} - The result
 */
const getDriveConected = (driveName) => {
  const cmd = cp.spawnSync("wmic", [
    "logicaldisk",
    "where",
    `volumename="${driveName}"`,
    "get",
    "DeviceID",
  ]);
  const lines = cmd.stdout.toString().split("\n");
  let letter = "";
  lines.forEach((line) => {
    const drive = line.trim();
    if (drive.length > 0 && drive !== "DeviceID") {
      letter = drive;
    }
  });
  return letter;
};

const getNameFromFile = (file) => {
  return file.replace(".txt", "");
};




//open file in windows explorer
const openFile = (file) => {
  const cmd = cp.spawnSync("explorer", [file]);
  return cmd;
};

//open folder in windows explorer
const openFolder = (folder) => {
  const cmd = cp.spawnSync("explorer", [folder]);
  return cmd;
};

/***
 * Get extensions from config.json file
 * @param {Object} config - The config file
 * @returns {List} - The list of extensions
 */
const getExtensions = (config) => {
  let extensions = [];
  Object.keys(config.extensions).forEach((key) => {
    extensions.push(...config.extensions[key].media);
  });
  //trim and lowercase
  extensions = extensions.map((ext) => ext.trim().toLowerCase());
  return [...new Set(extensions)];
};

/***
 * Get extension by extesions type array of string
 * @param {string[]} extensions - The array of extensions keys values
 * @param {Object} config - The config file
 * @returns {List} - The list of extensions
 */
const getExtensionsByType = (extensions, config) => {
  let ext = [];
  if (extensions.length === 0) {
    return [];
  }
  extensions.forEach((key) => {
    try {
      if (config.extensions[key]) {
        ext.push(...config.extensions[key].extensions);
      }
    } catch (error) {
      console.log("error", error);
    }
  });
  //trim and lowercase
  ext = ext.map((ext) => ext.trim().toLowerCase());
  return [...new Set(ext)];
};

/***
 * Delete a file
 * @param {String} filePath - The file path
 */
const deleteFile = async (filePath) => {
  try {
    await fs
      .unlink(filePath)
      .then(() => {
        console.log(`Deleted ${filePath}`);
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = {
  getDriveConected,
  getNameFromFile,
  openFile,
  openFolder,
  getExtensions,
  getExtensionsByType,
  deleteFile,
};
