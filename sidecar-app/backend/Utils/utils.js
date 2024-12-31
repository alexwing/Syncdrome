const cp = require("child_process");
const path = require("path");
const fs = require("fs");

/***
 * Get the free space and size of the drive
 * @param {String} driveLetter - The drive letter
 * @returns {Object} - The object with the info
 */
const getSpaceDisk = (driveLetter) => {
  const cmd = cp.spawnSync("wmic", [
    "logicaldisk",
    "where",
    `DeviceID="${driveLetter}"`,
    "get",
    "freespace,size",
  ]);
  const lines = cmd.stdout.toString().split("\n");
  let freeSpace = 0;
  let size = 0;
  lines.forEach((line) => {
    const drive = line.trim();
    if (drive.length > 0 && drive !== "FreeSpace  Size") {
      const info = drive.split("  ");
      freeSpace = info[0];
      size = info[1];
    }
  });
  return {
    freeSpace: parseInt(freeSpace),
    size: parseInt(size),
  };
};

/***
 * get is has a volume name txt file in the root of the drive, return true or false
 * @param {String} driveVolumeName - The volume name
 * @param {String} folder - The folder to search
 * @returns {Boolean} - The result
 */
const getDriveSync = (driveVolumeName, folder) => {
  const file = path.join(folder, `${driveVolumeName}.txt`);
  return fs.existsSync(file);
};

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

/***
 * get the modified date of the file in the root of the drive
 * @param {String} driveVolumeName - The volume name
 * @param {String} folder - The folder to search
 * @returns {Date} - The date
 */
const getDriveSyncDate = (driveVolumeName, folder) => {
  const file = path.join(folder, `${driveVolumeName}.txt`);

  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    return stats.mtime;
  } else {
    throw new Error(`File ${file} does not exist`);
  }
};

/***
 * get drives.json from the root of the drive, return the info
 * @param {String} driveVolumeName - The volume name
 * @param {String} folder - The folder to search
 * @returns {Object} - The object with the info
 */
const getDriveOptions = (driveVolumeName, folder) => {
  const file = path.join(folder, `drives.json`);
  if (fs.existsSync(file)) {
    //get file content as json
    const drives = JSON.parse(fs.readFileSync(file, "utf8"));
    const onlyMedia = drives[driveVolumeName]?.onlyMedia || false;
    //if exist size and freeSpace, return it
    if (drives[driveVolumeName]?.size && drives[driveVolumeName]?.freeSpace) {
      return {
        onlyMedia: onlyMedia,
        size: drives[driveVolumeName].size,
        freeSpace: drives[driveVolumeName].freeSpace,
      };
    } else {
      //if not exist size and freeSpace, return 0
      return {
        onlyMedia: onlyMedia,
        size: 0,
        freeSpace: 0,
      };
    }
  }
  //if file not exist, return 0
  return {
    onlyMedia: false,
    size: 0,
    freeSpace: 0,
  };
};

/***
 *  delete drive options from drives.json
 * @param {String} driveVolumeName - The volume name
 * @param {String} folder - The folder to search
 */
const deleteDriveOptions = (driveVolumeName, folder) => {
  const file = path.join(folder, `drives.json`);
  if (fs.existsSync(file)) {
    //get file content as json
    const drives = JSON.parse(fs.readFileSync(file, "utf8"));
    delete drives[driveVolumeName];
    fs.writeFileSync(file, JSON.stringify(drives));
  }
};

/***
 * get the volume name of the drive letter
 * @param {String} driveLetter - The drive letter
 * @returns {String} - The volume name
 */
const getVolumeName = (driveLetter) => {
  const cmd = cp.spawnSync("wmic", [
    "logicaldisk",
    "where",
    `DeviceID="${driveLetter}"`,
    "get",
    "volumename",
  ]);
  const lines = cmd.stdout.toString().split("\n");
  let vol = "";
  lines.forEach((line) => {
    const drive = line.trim();
    if (drive.length > 0 && drive !== "VolumeName") {
      vol = drive;
    }
  });
  return vol;
};

/***
 * Write size and freeSpace in drives.json
 * @param {String} driveVolumeName - The volume name
 * @param {String} folder - The folder to search
 * @param {Number} size - The size
 * @param {Number} freeSpace - The free space
 */
const writeSize = (driveVolumeName, folder, size, freeSpace) => {
  const file = path.join(folder, `drives.json`);
  let drives = {};
  if (fs.existsSync(file)) {
    drives = JSON.parse(fs.readFileSync(file));
  }
  drives[driveVolumeName] = {
    ...drives[driveVolumeName],
    size: size,
    freeSpace: freeSpace,
  };
  fs.writeFileSync(file, JSON.stringify(drives, null, 2));
};

/***
 * Get de files in the root of the drive, and return sync date, volume name and free space and size
 * exclude the files in the exclude list conected drives
 * @param {Object} config - The config file
 * @param {List} connected - The list of drives to exclude
 * @returns {Object} - The object with the info
 */
const getDrivesInfo = async (config, connected) => {
  const drives = [];


  console.log("config folder", config.folder);

  // Get the names of the txt files in the folder and filter the volumes that are not in the conected list
  // conected name is the volume name
  let volumes = fs
    .readdirSync(config.folder)
    .filter(
      (file) =>
        file.endsWith(".txt") &&
        !connected.map((drive) => drive.name).includes(getNameFromFile(file))
    )
    .map((file) => file.replace(".txt", ""));
  //console.log("volumes", volumes);
  //get info of each volume
  volumes.forEach((vol) => {
    const syncDate = getDriveSyncDate(vol, config.folder);
    const driveOptions = getDriveOptions(vol, config.folder);
    drives.push({
      conected: false,
      letter: "",
      name: vol,
      freeSpace: driveOptions.freeSpace,
      size: driveOptions.size,
      sync: true,
      syncDate: syncDate,
      onlyMedia: driveOptions.onlyMedia,
    });
  });

  //print conected drives
   //console.log("connected", connected);

  //print drives
   //console.log("drives", drives);

  //combine conected and not conected drives
  drives.push(...connected);

  console.log("drives", drives);

  //sort drives by conected, drive letter and volume name
  drives.sort(sortDrives);

  return drives;
};

// sort drives function by conected, drive letter and volume name
const sortDrives = (a, b) => {
  if (a.conected && !b.conected) {
    return -1;
  }
  if (!a.conected && b.conected) {
    return 1;
  }
  if (a.conected && b.conected) {
    if (a.letter < b.letter) {
      return -1;
    }
    if (a.letter > b.letter) {
      return 1;
    }
  }
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }

  return 0;
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
  getSpaceDisk,
  getDriveSync,
  getDriveConected,
  getNameFromFile,
  getDriveSyncDate,
  getDriveOptions,
  deleteDriveOptions,
  getVolumeName,
  writeSize,
  getDrivesInfo,
  openFile,
  openFolder,
  getExtensions,
  getExtensionsByType,
  deleteFile,
};
