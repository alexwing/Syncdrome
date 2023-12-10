const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = function(app, config) {
  // Servir la configuración como un endpoint GET
  app.get('/settings', (req, res) => {
    res.json(config);
  });

  // guardar la configuración como un endpoint POST
  app.post('/settings', (req, res) => {
    const newConfig = req.body;
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(newConfig, null, 2));
    res.json(newConfig);
  });
}