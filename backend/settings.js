import { getConfig, saveConfig } from "./Utils/utils.js";

export default function (app) {
  // Server the configuration as a GET endpoint
  app.get("/settings", async (req, res) => {
    try {
      const config = await getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).send({
        result: "error",
        message: "Error al leer la configuración",
        error: error,
      });
    }
  });

  // Save the configuration as a POST endpoint
  app.post("/settings", async (req, res) => {
    const config = await getConfig();
    const newConfig = {
      ...config,
      ...req.body,
    }
    try {
      res.json({
        result: "ok",
        message: "Configuración guardada correctamente",
        path: await saveConfig(newConfig),
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
