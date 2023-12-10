const fs = require("fs");
const path = require("path");
const {
  getSpaceDisk,
  getDriveContent,
  getVolumeName,
} = require("./Utils/utils");
const { exec } = require("child_process");

module.exports = function (app, config) {
  app.get("/executeNode/:driveLetter", (req, res) => {
    const driveLetter = req.params.driveLetter;

    // Change to the directory of the specified disk
    process.chdir(driveLetter + "\\");

    // Extract the volume name from the output of the 'vol' command
    const vol = getVolumeName(driveLetter);

    // Execute the 'dir' command to list all files and subfolders
    exec(
      "dir . /s /b",
      { encoding: "utf8", maxBuffer: 1024 * 125000 },
      (error, stdout, stderr) => {
        // Increase the buffer size here
        if (error) {
          console.error(`Error on listing files: ${error}`);
          return res.json({ success: false, error: error.message });
        }

        // Path to save the list files
        const drive = config.folder;

        // save the list of files in a text file
        const filePath = path.join(drive, `${vol}.txt`);
        fs.writeFile(filePath, stdout, "utf8", (error) => {
          if (error) {
            console.error(`Error saving the list of files: ${error}`);
            return res.json({ success: false, error: error.message });
          }

          console.log(`File list in ${vol} saved in ${filePath}`);
          res.json({
            success: true,
            message: `File list in ${vol} saved in ${filePath}`,
          });
        });
      }
    );
  });

  //get system connected drives letters and names, create a json object
  app.get("/drives", (req, res) => {
    const drives = [];
    const cp = require("child_process");
    const cmd = cp.spawnSync("wmic", ["logicaldisk", "get", "name,volumename"]);
    const lines = cmd.stdout.toString().split("\n");
    lines.forEach((line) => {
      const drive = line.trim();
      if (drive.length > 0 && drive !== "Name  VolumeName") {
        const driveName = drive.slice(3).trim();
        const driveLetter = drive.slice(0, 2).trim();
        const { freeSpace, size } = getSpaceDisk(driveLetter);
        drives.push({
          letter: driveLetter,
          name: driveName,
          freeSpace: freeSpace,
          size: size,
          content: getDriveContent(driveLetter),
        });
      }
    });

    res.json(drives);
  });
};
