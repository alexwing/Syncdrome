const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.get("/find/:searchParam", (req, res) => {
  //const folder = process.cwd() + '\\res';
  // C:\Users\Windows\Mi unidad\Software\DiscosDuros

  const folder = "C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros";

  const searchText = req.params.searchParam.toLowerCase();

  const results = {};

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
          //extract folder from file path
          const folder = isFolder
            ? empty
            : path
                .dirname(rowData)
                .trim()
                .replace(/\r?\n|\r/g, "");

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
            }
        );

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

app.listen(port, () => {
  console.log(
    `La aplicación está escuchando en http://localhost:${port}/find/{searchParam}`
  );
});
