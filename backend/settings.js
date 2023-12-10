const fs = require("fs");
const path = require("path");

module.exports = function (app, config) {
  // Server the configuration as a GET endpoint
  app.get("/settings", (req, res) => {
    res.json(config);
  });

  // Save the configuration as a POST endpoint
  app.post("/settings", (req, res) => {
    const newConfig = req.body;
    fs.writeFileSync(
      path.join(__dirname, "config.json"),
      JSON.stringify(newConfig, null, 2)
    );
    res.json(newConfig);
  });
};
