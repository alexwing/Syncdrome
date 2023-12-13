const fs = require("fs");
const path = require("path");
const {
  getSpaceDisk,
  getDriveSync,
  getVolumeName,
  getDriveSyncDate,
  getDrivesInfo,
} = require("./Utils/utils");

const iconv = require("iconv-lite");

// Convert exec and writeFile to return promises
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const fsPromise = { writeFile: util.promisify(require('fs').writeFile) };

// Execute the 'dir' command to list all files and subfolders
module.exports = function (app, config) {
  app.get("/executeNode/:driveLetter", async (req, res) => {
    const driveLetter = req.params.driveLetter;
    const BUFFER_SIZE = 1024 * 1024 * 1024 * 4;
    const ENCODING = "Latin1";
  
    try {
      process.chdir(driveLetter + "\\");
  
      const vol = getVolumeName(driveLetter, config.folder);
      const drive = config.folder;
      const filePath = path.join(drive, `${vol}.txt`);
      const command = `chcp 65001 >nul && dir . /s /b`;
  
      const { stdout } = await execPromise(command, { encoding: ENCODING, maxBuffer: BUFFER_SIZE });
      // Remove $RECYCLE.BIN folder and empty lines
      let output = stdout.replace(/.*\$RECYCLE\.BIN.*/g, "").split('\n').filter(line => line.trim() !== '').join('\n');
      // Convert from Latin1 to UTF-8
      output = iconv.decode(output, "cp850");
  
      await fsPromise.writeFile(filePath, output, "utf8");
  
      console.log(`File list in ${vol} saved in ${filePath}`);
      res.json({ success: true, message: `File list in ${vol} saved in ${filePath}` });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.json({ success: false, error: error.message });
    }
  });

  //get system connected drives letters and names, create a json object
  app.get("/drives", (req, res) => {
    let drives = [];
    const cp = require("child_process");
    const cmd = cp.spawnSync("wmic", ["logicaldisk", "get", "name,volumename"]);
    const lines = cmd.stdout.toString().split("\n");
    lines.forEach((line) => {
      const drive = line.trim();
      if (drive.length > 0 && drive !== "Name  VolumeName") {
        const driveName = drive.slice(3).trim();
        const driveLetter = drive.slice(0, 2).trim();
        const { freeSpace, size } = getSpaceDisk(driveLetter);
        const driveSync = getDriveSync(driveName, config.folder);
        let syncDate = null;
        if (driveSync) {
          syncDate = getDriveSyncDate(driveName, config.folder);
        }
        drives.push({
          conected: true,
          letter: driveLetter,
          name: driveName,
          freeSpace: freeSpace,
          size: size,
          sync: driveSync,
          syncDate: syncDate,
        });
      }
    });

    //remove drives with size 0
    drives = drives.filter((drive) => drive.size > 0);

    drives = getDrivesInfo(config, drives);

    res.json(drives);
  });

  //remove volume name file from drive root
  app.delete("/drives/:driveLetter", (req, res) => {
    const driveLetter = req.params.driveLetter;
    const vol = getVolumeName(driveLetter, config.folder);
    const file = path.join(config.folder, `${vol}.txt`);
    fs.unlinkSync(file);
    res.json({ success: true, message: `File ${file} deleted` });
  });
};
