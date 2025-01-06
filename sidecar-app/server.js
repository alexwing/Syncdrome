const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const search = require("./backend/search.js");
const processDrive = require("./backend/process.js");
const folderSync = require("./backend/folderSync.js");
const fileCleaner = require("./backend/fileCleaner.js");

const app = express();
console.log("Leyendo configuración...");
const configPath = path.join(process.cwd(), "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
app.set('config', config);
console.log("Configuración leída correctamente de: ", configPath);
console.log("Carpeta de trabajo: ", config.folder);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Configura el servidor para servir archivos estáticos desde el directorio "public"
//app.use(express.static(path.join(__dirname, "public")));

const port = process.env?.PORT || 3001;

search(app);
processDrive(app);
folderSync(app);
fileCleaner(app);

app.listen(port, () => {
  console.log(`The app is listening on http://localhost:${port}/settings`);
});
