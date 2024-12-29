const { getBookmarksFromDb, upsertBookmark, deleteBookmarkFromDb } = require("./Utils/sqlite.js");

module.exports = function (app) {
  const config = app.get('config'); 

  app.get("/bookmarks", (req, res) => {
    getBookmarksFromDb(config.folder, req.query.volume)
      .then((rows) => res.json(rows))
      .catch((err) => {
        throw err;
      });
  });

  app.post("/bookmark", (req, res) => {
    upsertBookmark(config.folder, req.body, (err, result) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res.json(result);
      }
    });
  });

  app.delete("/bookmark/:id", (req, res) => {
    deleteBookmarkFromDb(config.folder,req.params.id, function (err) {
      if (err) {
        return console.error(err.message);
      }
      res.json({ deletedId: req.params.id });
    });
  });
};
