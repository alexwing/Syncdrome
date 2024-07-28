const { app } = require("electron");
const path = require("path");
// Convert exec and writeFile to return promises
const util = require("util");

const logFilePath = path.join(app.getPath("userData"), "syncTofolder.log");
const { deleteFile } = require("./Utils/utils");
const { exec } = require("child_process");

module.exports = function (app) {
  /***
   * getFilesInFolder - get files in folder use post method
   * @param {string} folder - folder to get files from
   * @returns {object} - response from server
   *
   * @example
   * getFilesInFolder("D:\\Pictures")
   */
  const fs = require("fs");
  const path = require("path");

  app.post("/getFilesInFolder", async (req, res) => {
    const folder = req.body.folder;

    try {
      fs.readdir(folder, { withFileTypes: true }, (err, files) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          const fileList = files
            .filter((file) => file.isFile())
            .map((file) => {
              return {
                filename: file.name,
                path: path.join(folder, file.name),
              };
            });
          res.status(200).send(fileList);
        }
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
};
