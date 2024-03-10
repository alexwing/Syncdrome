/**
 * Crear un nuevo endpoint para manejar los bookmarks
 * 
 * Las bookmarks se toman de una conexión a una base de datos sqlite
 * 
 * Los endpoints deben ser:
 * 
 * GET /bookmarks  - Retorna todas las bookmarks (opcionalmente de permitir filtrar por campo volume, por ejemplo /bookmarks?volume=SSD)
 * 
 * POST /bookmark - Agrega una bookmark
 * 
 * Ejemplo de request:
 * 
 * {
 *  "name": "Bookmark 1",
 * "path": "C:\\Users\\user\\Documents\\bookmark1"
 * "volume": "SSD"
 * "description": "Bookmark 1 description"
 * }
 * 
 * @api {get} /bookmarks 
 * 
 * Borra una bookmark
 * 
 * DELETE /bookmark/:id - Borra una bookmark
 * 
 * 
 * 
 * 
 */


const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const {
    getSqlitePath,
} = require("./Utils/utils");

module.exports = function (app) {
    app.get("/bookmarks", (req, res) => {
        const db = connectToDb();
        let query = "SELECT * FROM bookmarks";
        if (req.query.volume) {
            query += ` WHERE volume = '${req.query.volume}'`;
        }
        db.all(query, [], (err, rows) => {
            if (err) {
                throw err;
            }
            res.json(rows);
        });
    });

    app.post("/bookmark", (req, res) => {
        const db = connectToDb();
        const { name, path, volume, description } = req.body;
        const stmt = db.prepare("INSERT INTO bookmarks (name, path, volume, description) VALUES (?, ?, ?, ?)");
        stmt.run([name, path, volume, description], function(err) {
            if (err) {
                return console.error(err.message);
            }
            res.json({ id: this.lastID, name, path, volume, description });
        });
    });

    app.delete("/bookmark/:id", (req, res) => {
        const db = connectToDb();
        const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ?");
        stmt.run(req.params.id, function(err) {
            if (err) {
                return console.error(err.message);
            }
            res.json({ deletedId: req.params.id });
        });
    });
}

function connectToDb() {
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
        console.log('Connected to the bookmarks database.');
    });
    if (!exist) {
        db.run(`CREATE TABLE bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            volume TEXT,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Table bookmarks created.');
        });
    }
    return db;
}