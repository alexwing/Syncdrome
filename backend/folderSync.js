import path from "path";
import util from "util";
import { exec } from "child_process";
import { deleteFile } from "./Utils/utils.js";
import iconv from "iconv-lite";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = util.promisify(exec);
const logFilePath = path.join(__dirname, "syncTofolder.log");
const ENCODING = "utf8";

export default function (app) {
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
        const command = `chcp 65001 >nul && robocopy "${source}" "${target}" /MIR /R:3 /W:10 /LOG:${logFilePath}`;
        exec(command, { encoding: ENCODING }, (error, stdout, stderr) => {
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

  /***
   * endpoint to get the log file content
   *
   * split log file in !------------------------------------------------------------------------------!
   * the element 0 is the sync information
   * the element 1 is the refresh line status
   * the element 2 is the summary
   * @returns {
   * info : string,
   * refresh : string,
   * sumary : string,
   *
   * }
   * @example
   * getSyncLog()
   */
  app.get("/getSyncLog", (req, res) => {
    // Leer el archivo como un buffer
    const logFileBuffer = fs.readFileSync(logFilePath);
    // Convertir de latin1 a utf8
    const logFile = iconv.decode(logFileBuffer, "latin1");

    //delete 3 first lines
    const i = 2;
    const logArray = logFile.split(
      "------------------------------------------------------------------------------"
    );
    const info = logArray.length > i ? logArray[i] : "";
    const content = logArray.length > i + 1 ? logArray[i + 1] : "";
    //remove lines with %
    const refreshLastArray = content
      .split("\r")
      .filter((line) => !line.includes("%"));
    const refresh = refreshLastArray.join("\r");
    const summary = logArray.length > i + 2 ? logArray[i + 2] : "";
    res.json({
      info: info,
      refresh: refresh,
      summary: summary,
    });
  });
};
