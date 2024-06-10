const { app } = require("electron");
const path = require("path");
// Convert exec and writeFile to return promises
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const logFilePath = path.join(app.getPath("userData"), "syncTofolder.log");
const { deleteFile } = require("./Utils/utils");
const { exec } = require("child_process");

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

  app.post("/syncToFolder", (req, res) => {
    const source = req.body.source;
    const target = req.body.target;
    //delete previous log file
    deleteFile(logFilePath)
      .then(() => {
        const command = `robocopy "${source}" "${target}" /MIR /R:3 /W:10 /LOG:${logFilePath}`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
      })
      .catch((error) => {
        console.error(`Error deleting log file: ${error}`);
      });

    // Respond immediately
    res.json({
      success: true,
      message: `Sync ${source} to ${target} initiated`,
    });
  });
};
