const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const fs = require("fs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const port = 5000;

app.get("/find/", (req, res) => {
  res.json({});
});

app.get("/find/:searchParam", (req, res) => {
  //const folder = process.cwd() + '\\res';
  // C:\Users\Windows\Mi unidad\Software\DiscosDuros

  const folder = "C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros";

  const searchText = req.params.searchParam.toLowerCase();

  const results = {};

  if (!searchText || searchText.length < 3) {
    res.json(results);
    return;
  }

  fs.readdirSync(folder).forEach((filedata) => {
    if (filedata.endsWith(".txt")) {
      const content = fs.readFileSync(path.join(folder, filedata), "utf-8");
      const founds = [];

      content.split("\n").forEach((rowData, line) => {
        // trim and remove crlf
        const empty = rowData.trim().replace(/\r?\n|\r/g, "");
        if (empty.toLowerCase().includes(searchText)) {
          // check if is folder or file, the file has a extension
          const isFolder = !rowData.includes(".");

          const fileData = path.basename(empty);

          const fileName = isFolder ? "" : fileData;
          //extract folder from file path and remove drive letter: C:\\
          const folder = isFolder
            ? empty
            : path
                .dirname(rowData)
                .trim()
                .replace(/\r?\n|\r/g, "")
                .slice(3);

          //add prop name, clean extension, remove "." "_" "-"" and replace with space
          const name = fileData
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_\.]/g, " ");

          founds.push({
            line: line + 1,
            name: name,
            content: rowData.trim(),
            type: isFolder ? "folder" : "file",
            fileName: fileName,
            folder: folder,
          });
        }
      });

      //group by folder all files
      const groupByFolder = founds.reduce((r, a) => {
        r[a.folder] = [...(r[a.folder] || []), a];
        return r;
      }, {});

      //remove  type = "folder" of groupByFolder
      Object.keys(groupByFolder).forEach((key) => {
        groupByFolder[key] = groupByFolder[key].filter(
          (item) => item.type !== "folder"
        );
      });

      //remove prop type line and content
      //replace "[drive]:\\" with ""
      Object.keys(groupByFolder).forEach((key) => {
        groupByFolder[key].forEach((item) => {
          delete item.type;
          delete item.line;
          delete item.content;
          item.folder = item.folder.replace(/^[a-zA-Z]:\\/g, "");
        });
      });

      if (founds.length > 0) {
        results[filedata] = groupByFolder;
        //results[filedata] = founds;
      }
    }
  });

  res.json(results);
});

const getSpaceDisk = (driveLetter) => {
  const cp = require("child_process");
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
    freeSpace: (freeSpace / 1024 / 1024 / 1024).toFixed(2) + " GB",
    size: (size / 1024 / 1024 / 1024).toFixed(2) + " GB",
  };
};

//get is has a ContentDrive.bat or ContentDriveMedia.bat in the root of the drive
const getDriveContent = (driveLetter) => {
  const file1 = path.join(driveLetter, "ContentDrive.bat");
  const file2 = path.join(driveLetter, "ContentDriveMedia.bat");

  return fs.existsSync(file1) || fs.existsSync(file2);
};

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

app.listen(port, () => {
  console.log(
    `La aplicación está escuchando en http://localhost:${port}/find/{searchParam}`
  );
});
