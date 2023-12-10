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
    // freeSpace: (freeSpace / 1024 / 1024 / 1024).toFixed(2) + " GB",
    // size: (size / 1024 / 1024 / 1024).toFixed(2) + " GB",
    freeSpace: freeSpace,
    size: size,
  };
};

//get is has a volume name txt file in the root of the drive, return true or false
const getDriveSync = (driveVolumeName,folder) => {
  const file = path.join(folder, `${driveVolumeName}.txt`);
  return fs.existsSync(file);
};

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

module.exports = {
  getSpaceDisk,
  getDriveSync,
  getVolumeName,
};
