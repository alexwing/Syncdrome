const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const settings = require("./backend/settings")
const search = require("./backend/search")

const app = express();
const fs = require("fs");

// Cargar la configuración
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const port = 5000;

settings(app,config);
search(app,config);


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
   // freeSpace: (freeSpace / 1024 / 1024 / 1024).toFixed(2) + " GB",
   // size: (size / 1024 / 1024 / 1024).toFixed(2) + " GB",
    freeSpace: freeSpace,
    size: size,
  };
};

//get is has a ContentDrive.bat or ContentDriveMedia.bat in the root of the drive
const getDriveContent = (driveLetter) => {
  const file1 = path.join(driveLetter, "ContentDrive.bat");
  const file2 = path.join(driveLetter, "ContentDriveMedia.bat");

  return fs.existsSync(file1) || fs.existsSync(file2);
};

//execute a bat file in the root of the drive, from the drive letter
app.get("/execute/:driveLetter", (req, res) => {
  const driveLetter = req.params.driveLetter;
  let file = path.join(driveLetter, "ContentDrive.bat");
  if (!fs.existsSync(file)) {
    file = path.join(driveLetter, "ContentDriveMedia.bat");
  }
  if (fs.existsSync(file)) {
    const cp = require("child_process");
    const cmd = cp.spawnSync(file, [], {
      shell: true,
      encoding: "utf8",
      cwd: driveLetter,
    });
    if (cmd.error) {
      console.log("Error al ejecutar el archivo bat:", cmd.error);
      res.json({
        success: false,
        error: cmd.error,
        stdout: cmd.stdout,
        stderr: cmd.stderr,
      });
    } else {
      res.json({ success: true, stdout: cmd.stdout, stderr: cmd.stderr });
    }
  } else {
    console.log("Archivo bat no encontrado:", file);
    res.json({ success: false });
  }
});

app.get("/executeNode/:driveLetter", (req, res) => {
  const driveLetter = req.params.driveLetter;

  // Cambia al directorio del disco especificado
  process.chdir(driveLetter + "\\");

  // Extrae el nombre del volumen de la salida del comando 'vol'
  const vol = getVolumeName(driveLetter);

  // Ejecuta el comando 'dir' para listar todos los archivos y subcarpetas
  exec("dir . /s /b", { encoding: "utf8", maxBuffer: 1024 * 125000 }, (error, stdout, stderr) => { // Aumenta el tamaño del buffer aquí
    if (error) {
      console.error(`Error al listar los archivos: ${error}`);
      return res.json({ success: false, error: error.message });
    }

    // Ruta donde se guardarán los archivos de lista
    const drive = "C:\\Users\\Windows\\Mi unidad\\Software\\DiscosDuros\\";

    // Guarda la lista de archivos en un archivo de texto
    const filePath = path.join(drive, `${vol}.txt`);
    fs.writeFile(filePath, stdout, "utf8", (error) => {
      if (error) {
        console.error(`Error al guardar la lista de archivos: ${error}`);
        return res.json({ success: false, error: error.message });
      }

      console.log(`Lista de archivos en ${vol} guardada en ${filePath}`);
      res.json({
        success: true,
        message: `Lista de archivos en ${vol} guardada en ${filePath}`,
      });
    });
  });
});

const getVolumeName = (driveLetter) => {
  const cp = require("child_process");
  const cmd = cp.spawnSync("wmic", ["logicaldisk", "where", `DeviceID="${driveLetter}"`, "get", "volumename"]);
  const lines = cmd.stdout.toString().split("\n");
  let vol = "";
  lines.forEach((line) => {
    const drive = line.trim();
    if (drive.length > 0 && drive !== "VolumeName") {
      vol = drive;
    }
  });
  return vol;
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
