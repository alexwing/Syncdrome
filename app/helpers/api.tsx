import Axios from "axios";
const repoOwner = "alexwing";
const repoName = "Syncdrome";
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
    return Axios.get("/settings");
  },

  /***
   * Save settings to server
   * @param {object} newConfig - new settings
   * @returns {object} - response from server
   */
  saveSettings(newConfig) {
    return Axios.post("/settings", newConfig);
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
   * Delete bookmark
   * @param {string} id - bookmark id
   * @returns {object} - response from server
   */
  deleteBookmark(id) {
    return Axios.delete(`/bookmark/${id}`);
  }
};
export default Api;
