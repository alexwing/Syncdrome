import Axios from "axios";
import { FileCleanerProps, LogFile } from "../models/Interfaces";
import { invoke } from "@tauri-apps/api/core";
const repoOwner = "alexwing";
const repoName = "Syncdrome";

//port 5000 is the default port for the server
Axios.defaults.baseURL = "http://localhost:3000";
const Api = {
  /***
   * Find files in catalog by search param
   * @param {string} searchParam - search param
   * @returns {object} - response from server
   */
  getFind: (searchParam, extSelected) =>
    Axios.get(`/find/${searchParam}/${extSelected}`),

  getDrives: () => Axios.get("/drives"),

  /***
   * Execute content of drive syncronization
   * @param {string} driveLetter - drive letter
   * @returns {object} - response from server
   */
  getExecute: (driveLetter) => Axios.get(`/executeNode/${driveLetter}`),

  /***
   * Delete drive syncronization
   * @param {string} driveLetter - drive letter
   * @returns {object} - response from server
   */
  deleteDrive: (driveLetter) => Axios.delete(`/drives/${driveLetter}`),

  /***
   * Get settings from server
   * @returns {object} - response from server
   */
  getSettings() {
    return invoke("get_config") as Promise<any>;
  },

  /***
   * Save settings to server
   * @param {object} newConfig - new settings
   * @returns {object} - response from server
   */
  saveSettings(newConfig) {
    return invoke("save_config", { config: newConfig }) as unknown as { result: string, message: string };
  },

  /***
   * Open file in windows explorer
   * @param {string} fileName - name of file to open
   * @param {string} folder - folder where file is located
   * @param {string} driveLetter - drive letter where file is located
   * @returns {object} - response from server
   */
  openFile(fileName, folder, driveLetter) {
    const url = !folder
      ? btoa(driveLetter + "\\" + fileName)
      : btoa(driveLetter + "\\" + folder + "\\" + fileName);
    return Axios.get(`/openFile/${url}`);
  },

  /***
   * Open folder in windows explorer
   * @param {string} folder - folder to open
   * @param {string} driveLetter - drive letter where file is located
   * @returns {object} - response from server
   */
  openFolder(folder, driveLetter) {
    const folderName = folder;
    const url = !folder
      ? btoa(driveLetter + "\\")
      : btoa(driveLetter + "\\" + folderName);
    return Axios.get(`/openFolder/${url}`);
  },

  /***
   * set media status of drive
   * @param {string} driveLetter - drive letter
   * @param {boolean} status - status to set
   * @returns {object} - response from server
   */
  toogleMediaDrive(driveLetter, status) {
    return Axios.put(`/drives/${driveLetter}`, { onlyMedia: status });
  },

  /***
   * Get latest version from github
   * @returns {object} - response from server
   */
  getLatestVersion() {
    return Axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );
  },

  /***
   * Get commits from github
   * @returns {object} - response from server
   */
  getCommits() {
    return Axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=main`
    );
  },

  /*** get local resource
   * @param {string} path - path to resource
   * @returns {object} - response from server
   * */
  getResource(path) {
      return Axios.get(path); 
  },

  /***
   * Add bookmark
   * @param {object} bookmark - bookmark to add
   * @returns {object} - response from server
   */
  addBookmark(bookmark) {
    return Axios.post("/bookmark", bookmark);
  },
  /***
   * Get bookmarks
   * @returns {object} - response from server
   */
  getBookmarks() {
    return Axios.get("/bookmarks");
  },

    /***
   * Get bookmarks by volume
   * @returns {object} - response from server
   */
  getBookmarksByVolume(volume) {
    return Axios.get(`/bookmarks/${volume}`);
  },

  /***
   * Delete bookmark
   * @param {string} id - bookmark id
   * @returns {object} - response from server
   */
  deleteBookmark(id) {
    return Axios.delete(`/bookmark/${id}`);
  },

  /***
   * endpoint to sync a folder into another folder, using robocopy parameters:
   * @param {string} source - source folder
   * @param {string} target - target folder
   *
   * @returns {void}
   * @example
   * syncToFolder("D:\\Pictures", "F:\\backup\\Pictures")
   */
  syncToFolder: (source, target) => {
    return Axios.post("/syncToFolder", { source, target });
  },

  /***
   * getSyncLog - get sync log
   * @returns {object} - response from server
   *
   */

  getSyncLog: (): Promise<LogFile> => {
    return Axios.get("/getSyncLog").then((response) => response.data);
  },

  /***
   * getFilesInFolder - get files in folder use post method
   * @param {string} folder - folder to get files from convert
   * @returns {object} - response from server
   *
   */
  getFilesInFolder: (folder): Promise<FileCleanerProps[]> => {
    return Axios.post("/getFilesInFolder", { folder }).then(
      (response) => response.data
    );
  },

  /*** rename files in folder use post method renameFilesInFolder
   * @param FileCleanerProps [{ path: string; filename: string; fixed: string;},...]
   * @returns FileCleanerProps [{ path: string; filename: string; fixed:string, status: string;},...]
   * @example renameFilesInFolder([{ path: "D:\\Pictures\\IMG_0001.jpg", filename: "IMG_0001.jpg", fixed: "IMG_0001.jpg" },...])
   * */
  renameFilesInFolder: (files: FileCleanerProps[]) => {
    return Axios.post("/renameFilesInFolder", files).then(
      (response) => response.data
    );
  },

  navigate: (currentPath, command) => {
    return Axios.post("/navigate", { currentPath, command }).then(
      (response) => response.data
    );
  },

  /***
   * Change the file system to use
   * @param {object} params - parameters containing the filename
   * @returns {object} - response from server
   */
  changeFileSystem: (params) => {
    return Axios.post("/changeFileSystem", params).then(
      (response) => response.data
    );
  },
};

export default Api;