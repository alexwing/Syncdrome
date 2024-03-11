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


const fs = require('fs');
const { connectToDb, getBookmarksFromDb } = require("./Utils/sqlite");



module.exports = function (app) {
    app.get("/bookmarks", (req, res) => {
        getBookmarksFromDb(req.query.volume)
            .then(rows => res.json(rows))
            .catch(err => {
                throw err;
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
