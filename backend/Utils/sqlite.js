const sqlite3 = require("sqlite3").verbose();
const {
    getSqlitePath,
} = require("./utils");
const fs = require("fs");
/*bookmark structure 

{
  "id": 1,
  "name": "Bookmark 1",
  "path": "\\Users\\user\\Documents\\bookmark1"
  "volume": "SSD"
  "description": "Bookmark 1 description"
}
*/

// Init sqlite3 database
const connectToDb = () => {
  const sqlitePath = getSqlitePath();
  let exist = true;
  if (!fs.existsSync(sqlitePath)) {
    fs.writeFileSync(sqlitePath, "");
    exist = false;
  }
  const db = new sqlite3.Database(sqlitePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the bookmarks database.");
  });
  if (!exist) {
    db.run(
      `CREATE TABLE bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            volume TEXT,
            description TEXT
        )`,
      (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Table bookmarks created.");
      }
    );
  }
  return db;
};

const getBookmarksFromDb = (volume) => {
  const db = connectToDb();
  let query = "SELECT * FROM bookmarks";
  if (volume) {
    query += ` WHERE volume = '${volume}'`;
  }
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

const upsertBookmark = ( bookmark, callback) => {
  const db = connectToDb();
  const { id, name, path, volume, description } = bookmark;
  if (id) {
      const stmt = db.prepare("UPDATE bookmarks SET name = ?, path = ?, volume = ?, description = ? WHERE id = ?");
      stmt.run([name, path, volume, description, id], function(err) {
          if (err) {
              return callback(err);
          }
          callback(null, { id, name, path, volume, description });
      });
  } else {
      const stmt = db.prepare("INSERT INTO bookmarks (name, path, volume, description) VALUES (?, ?, ?, ?)");
      stmt.run([name, path, volume, description], function(err) {
          if (err) {
              return callback(err);
          }
          callback(null, { id: this.lastID, name, path, volume, description });
      });
  }
}

module.exports = {
  connectToDb,
  getBookmarksFromDb,
  upsertBookmark,
};
