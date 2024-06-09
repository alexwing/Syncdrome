const fs = require("fs");
const path = require("path");
const readline = require("readline");
const iconv = require("iconv-lite");
const stream = require("stream");
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
  getConfig,
} = require("./Utils/utils");

// Convert exec and writeFile to return promises
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const logFilePath = path.join(__dirname, "syncTofolder.log");

module.exports = function (app) {
  /***
   * endpoint to sync a folder into another folder, using robocopy parameters:
   * robocopy D:\Pictures F:\backup\Pictures /MIR /R:3 /W:10 /LOG:E:\projects\hd-contend-finder\scripts\syncTofolder.log
   * @param {string} source - source folder
   * @param {string} target - target folder
   *
   * @returns {void}
   * @example
   * syncToFolder("D:\\Pictures", "F:\\backup\\Pictures")
   */
  app.post("/syncToFolder", async (req, res) => {
    const source = req.body.source;
    const target = req.body.target;
    const command = `robocopy "${source}" "${target}" /MIR /R:3 /W:10 /LOG:${logFilePath}`;
    try {
      const { stdout, stderr } = await execPromise(command);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      res.json({
        success: true,
        message: `Sync ${source} to ${target} success`,
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.json({ success: false, error: error.message });
    }
  });
};
