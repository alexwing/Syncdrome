const fs = require("fs");
const path = require("path");
const {
  getConfig,
  saveConfig,
} = require("./Utils/utils");

module.exports = function (app) {
  // Server the configuration as a GET endpoint
  app.get("/settings", (req, res) => {
    const config = getConfig();
    res.json(config);
  });

  // Save the configuration as a POST endpoint
  app.post("/settings", (req, res) => {
    const config = getConfig();
    const newConfig = {
      ...config,
      ...req.body,
    }
    try {
      res.json({
        result: "ok",
        message: "Configuración guardada correctamente",
        path: saveConfig(newConfig),
      });      
    } catch (error) {
      console.error('Error al escribir en el archivo:', error);
      res.status(500).send({
        result: "error",
        message: "Error al guardar la configuración",
        error: error,
      });
    }
  });
};
