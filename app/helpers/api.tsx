import Axios from "axios";

const Api = {
  getFind: (searchParam) => Axios.get(`/find/${searchParam}`),

  getDrives: () => Axios.get("/drives"),
  getExecute: (driveLetter) => Axios.get(`/executeNode/${driveLetter}`),
  deleteDrive: (driveLetter) => Axios.delete(`/drives/${driveLetter}`),

  getSettings() {
    return Axios.get("/settings");
  },

  saveSettings(newConfig) {
    return Axios.post("/settings", newConfig);
  },

  /*
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

  openFolder(folder, driveLetter) {
    const folderName = folder;
    console.log(folderName);
    const url = !folder
      ? btoa(driveLetter + "\\")
      : btoa(driveLetter + "\\" + folderName);
    return Axios.get(`/openFolder/${url}`);
  },
};
export default Api;
