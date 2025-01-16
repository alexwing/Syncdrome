use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use crate::config::load_config;

#[derive(Debug, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: Option<i32>,
    pub name: String,
    pub path: String,
    pub volume: Option<String>,
    pub description: Option<String>,
}

// Inicializa o crea la tabla si no existe
fn init_db() -> Result<Connection, String> {
    let config = load_config()?;
    let db_path = format!("{}/db.sqlite", config.folder);
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS bookmarks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            volume TEXT,
            description TEXT
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(conn)
}

// Obtiene todos o filtra por volumen
pub fn fetch_bookmarks(volume: Option<String>) -> Result<Vec<Bookmark>, String> {
    let conn = init_db()?;
    let mut result = Vec::new();
    if let Some(vol) = volume {
        let mut stmt = conn.prepare("SELECT id, name, path, volume, description FROM bookmarks WHERE volume = ?")
            .map_err(|e| e.to_string())?;
        let rows = stmt.query_map([vol], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                volume: row.get(3)?,
                description: row.get(4)?,
            })
        }).map_err(|e| e.to_string())?;
        for row in rows {
            result.push(row.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn.prepare("SELECT id, name, path, volume, description FROM bookmarks")
            .map_err(|e| e.to_string())?;
        let rows = stmt.query_map([], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                volume: row.get(3)?,
                description: row.get(4)?,
            })
        }).map_err(|e| e.to_string())?;
        for row in rows {
            result.push(row.map_err(|e| e.to_string())?);
        }
    }
    Ok(result)
}

// Inserta o actualiza segun exista id o no
pub fn upsert_bookmark(bm: Bookmark) -> Result<Bookmark, String> {
    let conn = init_db()?;
    if let Some(id) = bm.id {
        conn.execute(
            "UPDATE bookmarks SET name = ?, path = ?, volume = ?, description = ? WHERE id = ?",
            params![bm.name, bm.path, bm.volume, bm.description, id],
        ).map_err(|e| e.to_string())?;
        Ok(bm)
    } else {
        conn.execute(
            "INSERT INTO bookmarks (name, path, volume, description) VALUES (?, ?, ?, ?)",
            params![bm.name, bm.path, bm.volume, bm.description],
        ).map_err(|e| e.to_string())?;
        let last_id = conn.last_insert_rowid();
        Ok(Bookmark { id: Some(last_id as i32), ..bm })
    }
}

// Borra un bookmark dado su id
pub fn remove_bookmark(id: i32) -> Result<(), String> {
    let conn = init_db()?;
    conn.execute("DELETE FROM bookmarks WHERE id = ?", [id]).map_err(|e| e.to_string())?;
    Ok(())
}
