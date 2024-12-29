import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import cors from "cors"; // Importar el paquete cors
import fs from "fs"; // Importar el paquete fs

import * as settings from "./backend/settings.js";
import * as search from "./backend/search.js";
import * as processDrive from "./backend/process.js";
import * as bookmarks from "./backend/bookmarks.js";
import * as folderSync from "./backend/folderSync.js";
import * as fileCleaner from "./backend/fileCleaner.js";

const app = express();
console.log("Leyendo configuración...");
const configPath = path.join(process.cwd(), "config.json"); 
//const configPath = (await executableDir()).toString();
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
app.set('config', config); // Agregar configJson al objeto app
console.log("Configuración leída correctamente de: ", configPath);
console.log("Carpeta de trabajo: ", config.folder);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const port = process.env?.PORT || 3000;

settings.default(app);
search.default(app);
processDrive.default(app);
bookmarks.default(app);
folderSync.default(app);
fileCleaner.default(app);

app.listen(port, () => {
  console.log(`The app is listening on http://localhost:${port}/settings`);
});
