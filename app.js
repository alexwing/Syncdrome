const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.get('/find/:searchParam', (req, res) => {
    const folder = process.cwd() + '\\res';
  const searchText = req.params.searchParam.toLowerCase();

  const results = {};

  fs.readdirSync(folder).forEach(filedata => {
    if (filedata.endsWith('.txt')) {
      const content = fs.readFileSync(path.join(folder, filedata), 'utf-8');
      const founds = [];

      content.split('\n').forEach((rowData, line) => {
        if (rowData.toLowerCase().includes(searchText)) {
            // check if is folder or file, the file has a extension
          const isFolder = !rowData.includes('.');
          // trim and remove crlf
          const fileData = path.basename(rowData).trim().replace(/\r?\n|\r/g, '');


          const fileName = isFolder ? '' : fileData;
          //extract folder from file path
          const folder = isFolder ? fileData : path.dirname(rowData).trim().replace(/\r?\n|\r/g, '');

          founds.push({
            line: line + 1,
            content: rowData.trim(),
            type: isFolder ? "folder" : "file",
            fileName: fileName,
            folder: folder
          });
        }
      });

      if (founds.length > 0) {
        results[filedata] = {
          filedata: filedata,
          founds: founds
        };
      }
    }
  });

  res.json(results);
});

app.listen(port, () => {
  console.log(`La aplicación está escuchando en http://localhost:${port}/find/{searchParam}`);
});
