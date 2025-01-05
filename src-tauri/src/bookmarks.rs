use crate::sqlite::{Bookmark, fetch_bookmarks, upsert_bookmark, remove_bookmark};
use tauri::command;

#[command]
pub fn get_bookmarks(volume: Option<String>) -> Result<Vec<Bookmark>, String> {
    fetch_bookmarks(volume)
}

#[command]
pub fn add_bookmark(bm: Bookmark) -> Result<Bookmark, String> {
    upsert_bookmark(bm)
}

#[command]
pub fn delete_bookmark(id: i32) -> Result<(), String> {
    remove_bookmark(id)
}
