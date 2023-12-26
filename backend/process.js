const fs = require("fs");
const path = require("path");
const readline = require('readline');
const iconv = require('iconv-lite');
const stream = require('stream');
const {
  getSpaceDisk,
  getDriveSync,
  getVolumeName,
  getDriveSyncDate,
  getDrivesInfo,
  getDriveOptions,
  writeSize,
  deleteDriveOptions,
  getExtensions,
} = require("./Utils/utils");


// Convert exec and writeFile to return promises
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);
const fsPromise = { writeFile: util.promisify(require("fs").writeFile) };




module.exports = function (app, config) {

  app.get("/executeNodeNEW/:driveLetter", async (req, res) => {
    const driveLetter = req.params.driveLetter;
    const ENCODING = "Latin1";
    const BUFFER_SIZE = 1024 * 1024 * 1024 * 4;
    
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
      const lineStream = readline.createInterface({
        input: stream.PassThrough().end(Buffer.from(stdout, ENCODING)),
        output: fs.createWriteStream(filePath),
        terminal: false
      });

      lineStream.on('line', (line) => {
        if (!line.includes('$RECYCLE.BIN') && line.trim() !== "") {
          let output = iconv.decode(line, "cp850");
          if (onlyMedia) {
            if (line.indexOf(".") > -1) {
              const extension = line.split(".").pop().toLowerCase().trim();
              if (extensions.includes(extension)) {
                lineStream.output.write(output + '\n');
              }
            } else {
              lineStream.output.write(output + '\n');
            }
          } else {
            lineStream.output.write(output + '\n');
          }
        }
      });

      lineStream.on('close', () => {
        console.log(`File list in ${vol} saved in ${filePath}`);
        const { freeSpace, size } = getSpaceDisk(driveLetter);
        writeSize(vol, config.folder, size, freeSpace);
        res.json({
          success: true,
          message: `File list in ${vol} saved in ${filePath}: onlyMedia: ${onlyMedia}`,
        });
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.json({ success: false, error: error.message });
    }
  });

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
        .replace(/.*\$RECYCLE\.BIN.*/g, "")
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
        let { freeSpace, size } = getSpaceDisk(driveLetter);
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
          onlyMedia:  getDriveOptions(driveName, config.folder).onlyMedia,
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
