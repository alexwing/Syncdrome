const electron = require("electron");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const server = require("./app");

const path = require("path");
const url = require("url");

let mainWindow;

//require('electron-reload')(__dirname);
//only fron require electron-reload in development mode at app folder and backend folder
if (
  process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV.trim() === "development"
) {
  require("electron-reload")(`${__dirname}/app`);
  require("electron-reload")(`${__dirname}/backend`);
}
function createWindow() {
  //enabled showOpenDialog in renderer
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });
  //full screen
  mainWindow.maximize();

  mainWindow.loadURL("http://localhost:5000/");
  // mainWindow.loadURL(url.format({
  //     pathname: path.join(__dirname, 'index.html'),
  //     protocol: 'file:',
  //     slashes: true
  // }));

  mainWindow.setIcon(path.join(__dirname, "public", "favicon.ico"));

  // Open the DevTools if run in development mode.
  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV.trim() === "development"
  ) {
    mainWindow.webContents.openDevTools();
  } else {
    //remove menu
    mainWindow.setMenu(null);
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
