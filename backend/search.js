import fs from "fs";
import path from "path";
import {
  getDriveConected,
  getNameFromFile,
  openFile,
  openFolder,
  getExtensionsByType,
} from "./Utils/utils.js";
import { getBookmarksFromDb } from "./Utils/sqlite.js";

/*bookmark structure 

{
  "id": 1,
  "name": "Bookmark 1",
  "path": "\\Users\\user\\Documents\\bookmark1"
  "volume": "SSD"
  "description": "Bookmark 1 description"
}
*/
export default function (app) {
  const config = app.get('config'); 

  app.get("/find/", (req, res) => {
    res.json({});
  });

  //add parame extensions to search
  app.get("/find/:searchParam/:extensions", async (req, res) => {
    try {
      const searchText = req.params.searchParam.toLowerCase();
      const extensionsTypes = req.params.extensions.toLowerCase().split("&");
      //read config.json file
      //read folder
      const folder = config.folder;

      //get bookmarks from sqlite
      const bookmarks = await getBookmarksFromDb(config.folder);

      let extensions = [];
      if (extensionsTypes.length > 0 && extensionsTypes[0] !== "all") {
        extensions = getExtensionsByType(extensionsTypes, config);
      }

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
            //ignore $RECYCLE.BIN folder
            if (
              empty.toLowerCase().includes(searchText) &&
              !empty.includes("$RECYCLE.BIN")
            ) {
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

              let extension = "";
              if (!isFolder) {
                extension = fileName.split(".").pop();
                //check if extension is in extensionsTypes
                if (extensions.length > 0 && !extensions.includes(extension)) {
                  return;
                }
                const bookmark = bookmarks.find((bookmark) => {
                  return folder.includes(bookmark.path) && fileName === bookmark.name && bookmark.volume === getNameFromFile(filedata) 
                });

                founds.push({
                  line: line + 1,
                  name: name,
                  content: rowData.trim(),
                  type: isFolder ? "folder" : "file",
                  fileName: fileName,
                  folder: folder,
                  extension: extension,
                  bookmark: bookmark,
                });
              }
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
            const fileDataName = getNameFromFile(filedata);
            results[fileDataName] = {
              connected: getDriveConected(fileDataName),
              content: groupByFolder,
            };
          }
        }
      });

      res.json(results);
    } catch (error) {
      console.log("error: ", error);
      res.json({
        error: error,
      });
    }
  });

  /* open file in windows explorer
   * 1. decode url
   * 2. open explorer.exe
   */
  app.get("/openFile/:url", (req, res) => {
    const url = req.params.url;
    // decode url and replace "//" with "\""
    const decodedUrl = Buffer.from(url, "base64")
      .toString("latin1")
      .replace(/\//g, "\\");
    const result = openFile(decodedUrl);
    res.json({
      decodedUrl: decodedUrl,
      result: result,
    });
  });
  /* open Folder in windows explorer
   * 1. decode url
   * 2. open explorer.exe
   */
  app.get("/openFolder/:url", (req, res) => {
    const url = req.params.url;
    // decode url and replace "//" with "\""
    const decodedUrl = Buffer.from(url, "base64")
      .toString("latin1")
      .replace(/\//g, "\\");
    const result = openFolder(decodedUrl);
    res.json({
      decodedUrl: decodedUrl,
      result: result,
    });
  });
};
