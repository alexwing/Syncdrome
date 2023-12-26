const fs = require("fs");
const path = require("path");

module.exports = function (app) {
  // Server the configuration as a GET endpoint
  app.get("/settings", (req, res) => {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
    res.json(config);
  });

  // Save the configuration as a POST endpoint
  app.post("/settings", (req, res) => {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
    const newConfig = {
      ...config,
      ...req.body,
    }
    try {
      fs.writeFileSync(
        path.join(__dirname, "../config.json"),
        JSON.stringify(newConfig, null, 2)
      );
      console.log("Configuración guardada correctamente en: ", path.join(__dirname, "../../config.json"));
      res.json({
        result: "ok",
        message: "Configuración guardada correctamente",
        path: path.join(__dirname, "../../config.json"),
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
