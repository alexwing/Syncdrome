import Axios from "axios";
import { FileCleanerProps, LogFile } from "../models/Interfaces";
import { invoke } from "@tauri-apps/api/core";
const repoOwner = "alexwing";
const repoName = "Syncdrome";

const Api = {
  /***
   * Find files in catalog by search param
   * @param {string} searchParam - search param
   * @returns {object} - response from server
   */
  getFind: (searchParam, extSelected) => {
    return invoke("find_files", {
      searchParam,
      extensions: extSelected,
    }) as Promise<any>;
  },

  getDrives: () => invoke("get_drives") as Promise<any>,

  /***
   * Execute content of drive syncronization
   * @param {string} driveLetter - drive letter
   * @returns {object} - response from server
   */
  getExecute: (driveLetter) => invoke("execute_node", { driveLetter }),

  /***P
   * Delete drive syncronization
   * @param {string} driveLetter - drive letter
   * @returns {object} - response from server
   */
  deleteDrive: (driveLetter) => invoke("delete_drive", { driveLetter }),

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
    const url = btoa(`${driveLetter}\\${folder}\\${fileName}`);
    return invoke("open_file_rust", {
      encodedUrl: url,
    });
  },

  /***
   * Open folder in windows explorer
   * @param {string} folder - folder to open
   * @param {string} driveLetter - drive letter where file is located
   * @returns {object} - response from server
   */
  openFolder(folder, driveLetter) {
    const url = btoa(`${driveLetter}\\${folder}`);
    return invoke("open_folder_rust", {
      encodedUrl: url,
    });
  },

  /***
   * set media status of drive
   * @param {string} driveLetter - drive letter
   * @param {boolean} status - status to set
   * @returns {object} - response from server
   */
  toogleMediaDrive(driveLetter, status) {
    return invoke("update_drive", {
      driveLetter,
      onlyMedia: status,
    });
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
    return invoke("add_bookmark", { bm: bookmark });
  },
  /***
   * Get bookmarks
   * @returns {object} - response from server
   */
  getBookmarks() {
    return invoke("get_bookmarks", { volume: null });
  },

    /***
   * Get bookmarks by volume
   * @returns {object} - response from server
   */
  getBookmarksByVolume(volume) {
    return invoke("get_bookmarks", { volume });
  },

  /***
   * Delete bookmark
   * @param {string} id - bookmark id
   * @returns {object} - response from server
   */
  deleteBookmark(id) {
    return invoke("delete_bookmark", { id });
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
  syncToFolder: async (source, target) => {
    const response = await invoke("sync_folders", { source, target });
    // Podemos empezar a consultar el log inmediatamente
    return response;
  },

  /***
   * getSyncLog - get sync log
   * @returns {object} - response from server
   *
   */

  getSyncLog: (): Promise<LogFile> => {
    return invoke("get_sync_log");
  },

  /***
   * getFilesInFolder - get files in folder use post method
   * @param {string} folder - folder to get files from convert
   * @returns {object} - response from server
   *
   */
  getFilesInFolder: (folder): Promise<FileCleanerProps[]> => {
    return invoke("get_files_in_folder", { folder });
  },

  /*** rename files in folder use post method renameFilesInFolder
   * @param FileCleanerProps [{ path: string; filename: string; fixed: string;},...]
   * @returns FileCleanerProps [{ path: string; filename: string; fixed:string, status: string;},...]
   * @example renameFilesInFolder([{ path: "D:\\Pictures\\IMG_0001.jpg", filename: "IMG_0001.jpg", fixed: "IMG_0001.jpg" },...])
   * */
  renameFilesInFolder: (files: FileCleanerProps[]) => {
    return invoke("rename_files_in_folder", { files });
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