const sqlite3 = require("sqlite3").verbose();
const { getSqlitePath } = require("./utils");
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
const connectToDb = async () => {
  const sqlitePath = getSqlitePath();
  let exist = true;
  if (!fs.existsSync(sqlitePath)) {
    fs.writeFileSync(sqlitePath, "");
    exist = false;
  }
  console.log("sqlitePath", sqlitePath);
  const db = new sqlite3.Database(sqlitePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the bookmarks database.");
  });

  if (!exist) {
    console.log("Create table bookmarks");
    await new Promise((resolve, reject) => {
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
            reject(err);
          } else {
            resolve();
            console.log("Table bookmarks created");
          }
        }
      );
    });
  }

  return db;
};

const getBookmarksFromDb = async (volume) => {
  const db = await connectToDb();
  let query = "SELECT * FROM bookmarks";
  if (volume) {
    query += ` WHERE volume = '${volume}'`;
  }
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
      db.close();
    });
  });
};

const upsertBookmark = async (bookmark, callback) => {
  const db = await connectToDb();
  const { id, name, path, volume, description } = bookmark;
  db.serialize(() => {
    if (id) {
      const stmt = db.prepare(
        "UPDATE bookmarks SET name = ?, path = ?, volume = ?, description = ? WHERE id = ?"
      );
      stmt.run([name, path, volume, description, id], function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, { id, name, path, volume, description });
      });
      stmt.finalize();
    } else {
      const stmt = db.prepare(
        "INSERT INTO bookmarks (name, path, volume, description) VALUES (?, ?, ?, ?)"
      );
      stmt.run([name, path, volume, description], function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, { id: this.lastID, name, path, volume, description });
      });
      stmt.finalize();
    }
    db.close();
  });
};

const deleteBookmarkFromDb = async (id, callback) => {
  const db = await connectToDb();
  db.serialize(() => {
    const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    stmt.run(id, function (err) {
      callback(err);
    });
    stmt.finalize();
    db.close();
  });
};
module.exports = {
  getBookmarksFromDb,
  upsertBookmark,
  deleteBookmarkFromDb,
};
