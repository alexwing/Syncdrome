const {
  getBookmarksFromDb,
  upsertBookmark,
  deleteBookmarkFromDb,
} = require("./Utils/sqlite");

module.exports = function (app) {
  app.get("/bookmarks", (req, res) => {
    getBookmarksFromDb(req.query.volume)
      .then((rows) => res.json(rows))
      .catch((err) => {
        throw err;
      });
  });

  app.get("/bookmarks/:volume", (req, res) => {
    getBookmarksFromDb(req.params.volume)
      .then((rows) => res.json(rows))
      .catch((err) => {
        throw err;
      });
  });

  app.post("/bookmark", (req, res) => {
    upsertBookmark(req.body, (err, result) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res.json(result);
      }
    });
  });

  app.delete("/bookmark/:id", (req, res) => {
    deleteBookmarkFromDb(req.params.id, function (err) {
      if (err) {
        return console.error(err.message);
      }
      res.json({ deletedId: req.params.id });
    });
  });
};
