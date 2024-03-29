const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const settings = require("./backend/settings");
const search = require("./backend/search");
const process = require("./backend/process");
const bookmarks = require("./backend/bookmarks");

const { ipcMain, dialog } = require("electron");

ipcMain.handle("open-directory-dialog", async (event, defaultPath) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath,
  });
  return result.filePaths[0];
});

ipcMain.handle("open-file-dialog", async (event, defaultPath) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    defaultPath,
  });
  return result.filePaths[0];
}
);

const app = express();
const fs = require("fs");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const port = 5000;

settings(app);
search(app);
process(app);
bookmarks(app);

app.listen(port, () => {
  console.log(
    `The app is listening on http://localhost:${port}/find/{searchParam}`
  );
});
