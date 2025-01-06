const fs = require("fs");
const path = require("path");
const iconv = require('iconv-lite');
const { getSpaceDisk, getDriveSync, getVolumeName, getDriveSyncDate, getDrivesInfo, getDriveOptions, writeSize, deleteDriveOptions, getExtensions } = require("./Utils/utils.js");
const util = require("util");
const { exec, spawnSync } = require("child_process");

const execPromise = util.promisify(exec);
const fsPromise = { writeFile: util.promisify(fs.writeFile) };

module.exports = function (app) {
  const config = app.get('config'); 

  /***
   *  Execute a command to get all files in a drive and save it in a file
   *  @param {string} driveLetter
   *  @returns {void}
   */
  app.get("/executeNode/:driveLetter", async (req, res) => {
    const driveLetter = req.params.driveLetter;
    const BUFFER_SIZE = 1024 * 1024 * 1024 * 1024 * 4;
    const ENCODING = "Latin1";

    try {
      process.chdir(driveLetter + "\\");
      
      const vol = getVolumeName(driveLetter, config.folder);
      const onlyMedia = getDriveOptions(vol, config.folder).onlyMedia;
      let extensions = [];
      if (onlyMedia) {
        extensions = getExtensions(config);
      }      
      const drive = config.folder;
      const filePath = path.join(drive, `${vol}.txt`);
      const command = `chcp 65001 >nul && dir . /s /b`;

      const { stdout } = await execPromise(command, {
        encoding: ENCODING,
        maxBuffer: BUFFER_SIZE,
      });
      // Remove $RECYCLE.BIN folder and empty lines
      let output = stdout
        .replace(/.*\$recycle\.bin.*/gi, "")
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");
      // Convert from Latin1 to UTF-8
      output = iconv.decode(output, "cp850");

      // Filter by extension
      if (onlyMedia) {
        output = output
          .split("\n")
          .filter((line) => {
            //if line has extension
            if (line.indexOf(".") > -1) {
              const extension = line.split(".").pop().toLowerCase().trim();
              return extensions.includes(extension);
            } else {
              //is a folder
              return true;
            }
          })
          .join("\n");
      }

      await fsPromise.writeFile(filePath, output, "utf8");

      console.log(`File list in ${vol} saved in ${filePath}`);

      const { freeSpace, size } = getSpaceDisk(driveLetter);
      writeSize(vol, config.folder, size, freeSpace);

      res.json({
        success: true,
        message: `File list in ${vol} saved in ${filePath}: onlyMedia: ${onlyMedia}, lines: ${output.split("\n").length}`,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.json({ success: false, error: error.message });
    }
  });

  /***
   * get system connected drives letters and names, create a json object with the drives info
   * @returns {
   * {
   *  connected: boolean,
   * letter: string,
   * name: string,
   * freeSpace: number,
   * size: number,
   * sync: string,
   * syncDate: string,
   * onlyMedia: boolean
   * }[]
   * }
   */  
  app.get("/drives", async (req, res) => {
    let drives = [];
    const cmd = spawnSync("wmic", ["logicaldisk", "get", "name,volumename"]);
    const lines = cmd.stdout.toString().split("\n");

    console.log("Lines", lines);

    lines.forEach((line) => {
      const drive = line.trim();
      if (drive.length > 0 && drive !== "Name  VolumeName") {
        const driveName = drive.slice(3).trim();
        const driveLetter = drive.slice(0, 2).trim();
        let { freeSpace, size } = getSpaceDisk(driveLetter);
        let driveSync = null;
        let syncDate = null;
        if (driveName && config.folder) {
          driveSync = getDriveSync(driveName, config.folder);
          if (driveSync) {
            syncDate = getDriveSyncDate(driveName, config.folder);
          }
        }
        drives.push({
          connected: true,
          letter: driveLetter,
          name: driveName,
          freeSpace: freeSpace,
          size: size,
          sync: driveSync,
          syncDate: syncDate,
          onlyMedia: config.folder ? getDriveOptions(driveName, config.folder).onlyMedia : false,
        });
      }
    });

    console.log("Drives", drives);

    //remove drives with size 0
    drives = drives.filter((drive) => drive.size > 0);

    drives = await getDrivesInfo(config, drives);
    console.log("Drives", drives);

    res.json(drives);
  });

  /***
   *  remove volume name file from drive root
   * @param {string} driveLetter
   * @returns { success: boolean, message: string }
   * 
   */
  app.delete("/drives/:driveLetter", (req, res) => {
    const driveLetter = req.params.driveLetter;
    const vol = getVolumeName(driveLetter, config.folder);
    const file = path.join(config.folder, `${vol}.txt`);
    fs.unlinkSync(file);
    deleteDriveOptions(vol, config.folder);
    res.json({ success: true, message: `File ${file} deleted` });
  });

  /***
   * Drives.json file is used to store the onlyMedia status of each drive
   * @param {string} driveLetter
   * @param {boolean} onlyMedia
   * @returns {void}
   * @example
   * updateDriveJson("D:\\", true)
   */
  app.put("/drives/:driveLetter", (req, res) => {
    try {
      const onlyMedia = req.body.onlyMedia;
      const vol = req.params.driveLetter;
      const file = path.join(config.folder, `drives.json`);
      let drives = {};
      if (fs.existsSync(file)) {
        drives = JSON.parse(fs.readFileSync(file));
      }
      drives[vol] = { ...drives[vol], // keep the other properties
         onlyMedia: onlyMedia };
      // write drives.json file in drive folder
      fs.writeFileSync(file, JSON.stringify(drives, null, 2));
      res.json({ success: true, message: `File ${file} updated, Sync ${vol} with onlyMedia: ${onlyMedia}`});
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: `Error updating file: ${error.message}`,
        });
    }
  });
};
