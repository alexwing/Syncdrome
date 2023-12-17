const cp = require("child_process");
const path = require("path");
const fs = require("fs");

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

//get is has a volume name txt file in the root of the drive, return true or false
const getDriveSync = (driveVolumeName, folder) => {
  const file = path.join(folder, `${driveVolumeName}.txt`);
  return fs.existsSync(file);
};

//get is volume name is connected, return true or false
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

// get the modified date of the file in the root of the drive
const getDriveSyncDate = (driveVolumeName, folder) => {
  const file = path.join(folder, `${driveVolumeName}.txt`);

  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    return stats.mtime;
  } else {
    throw new Error(`File ${file} does not exist`);
  }
};


// get drives.json from the root of the drive, return the info
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


// delete drive options from drives.json
const deleteDriveOptions = (driveVolumeName, folder) => {
  const file = path.join(folder, `drives.json`);
  if (fs.existsSync(file)) {
    //get file content as json  
    const drives = JSON.parse(fs.readFileSync(file, "utf8"));
    delete drives[driveVolumeName];
    fs.writeFileSync(file, JSON.stringify(drives));
  }
}

// get the volume name of the drive letter
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

// write size and freeSpace in drives.json
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
 * @param {List} conected - The list of drives to exclude
 * @returns {Object} - The object with the info
 */
const getDrivesInfo = (config, conected) => {
  //console.log("getDrivesInfo", config, conected);

  const drives = [];

  // Obtener los nombres de los archivos txt en la carpeta y filtrar los volúmenes que no están en la lista conectada
  let volumes = fs
    .readdirSync(config.folder)
    .filter(
      (file) =>
        file.endsWith(".txt") && !conected.includes(file.replace(".txt", ""))
    )
    .map((file) => file.replace(".txt", ""));

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
  
  //combine conected and not conected drives
  drives.push(...conected);

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
}
    
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

//get extensions from config.json file
const getExtensions = (config) => {
  let extensions = [];
  Object.keys(config.extensions).forEach((key) => {
    extensions.push(...config.extensions[key].extensions);
  });
  //trim and lowercase
  extensions = extensions.map((ext) => ext.trim().toLowerCase());
  return [...new Set(extensions)];;
}


module.exports = {
  getSpaceDisk,
  getDriveSync,
  getVolumeName,
  getDriveSyncDate,
  getDrivesInfo,
  getDriveConected,
  getNameFromFile,
  openFile,
  openFolder,
  getDriveOptions,
  writeSize,
  deleteDriveOptions,
  deleteDriveOptions,
  getExtensions,
};
