const { app } = require("electron");
const path = require("path");
// Convert exec and writeFile to return promises
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const logFilePath = path.join(app.getPath("userData"), "syncTofolder.log");
const { deleteFile } = require("./Utils/utils");
const { exec } = require("child_process");
const iconv = require("iconv-lite");
const ENCODING = "utf8";

module.exports = function (app) {
  /***
   * getFilesInFolder - get files in folder use post method
   * @param {string} folder - folder to get files from
   * @returns {object} - response from server
   *
   * @example
   * getFilesInFolder("D:\\Pictures")
   */
  app.post("/getFilesInFolder", async (req, res) => {
    const folder = req.body.folder;
    const command = `dir /s /b /a-d "${folder}"`;
    try {
      const { stdout, stderr } = await execPromise(command);
      if (stderr) {
        res.status(500).send(stderr);
      } else {
        const files = stdout
            .split("\n")
            .filter((file) => file)
            .map((file) => {
                return {
                filename: path.basename(file).replace(/\r/g, ""),
                path: file.replace(/\r/g, ""),
                };
            }
            );
        res.send(files);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
};
