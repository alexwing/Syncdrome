const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const settings = require("./backend/settings");
const search = require("./backend/search");
const process = require("./backend/process");

const app = express();
const fs = require("fs");

// Load the config file
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8")
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const port = 5000;

settings(app, config);
search(app, config);
process(app, config);

app.listen(port, () => {
  console.log(
    `The app is listening on http://localhost:${port}/find/{searchParam}`
  );
});
