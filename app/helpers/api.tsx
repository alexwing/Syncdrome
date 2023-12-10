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
};

export default Api;
