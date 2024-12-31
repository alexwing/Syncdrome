const path = require("path");
const fs = require("fs-extra");

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

  /*** rename files in folder use post method renameFilesInFolder
   * @param FileCleanerProps [{ path: string; filename: string; fixed: string;},...]
   * @returns FileCleanerProps [{ path: string; filename: string; fixed:string, status: string;},...]
   * @example renameFilesInFolder([{ path: "D:\\Pictures\\IMG_0001.jpg", filename: "IMG_0001.jpg", fixed: "IMG_0001.jpg" },...])
   * */
  app.post("/renameFilesInFolder", async (req, res) => {
    const files = req.body;
    const results = [];

    try {
      const renamePromises = files.map(async (file) => {
        try {
          const newPath = path.join(path.dirname(file.path), file.fixed);
          await fs.rename(file.path, newPath);
          results.push({ ...file, status: "success" });
        } catch (err) {
          results.push({ ...file, status: "error", message: err.message });
        }
      });
      await Promise.all(renamePromises);
      res.status(200).send(results);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
};
