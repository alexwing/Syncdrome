// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config; // Asegúrate de que el nombre del módulo sea correcto
mod sqlite;
mod bookmarks;
mod process;
mod utils;
mod config_file; // Declara el módulo config_file en main.rs
use config::{load_config, save_config}; // Importa las funciones load_config y save_config correctamente
use bookmarks::{get_bookmarks, add_bookmark, delete_bookmark};
use process::{execute_node, get_drives, delete_drive, update_drive};
use tauri::command;

#[command]
fn get_config() -> Result<config::Config, String> { // Asegúrate de que el nombre del módulo sea correcto
    println!("Attempting to load config.json...");
    let result = load_config();
    match &result {
        Ok(_) => println!("Config file loaded successfully."),
        Err(e) => eprintln!("Failed to load config file: {}", e),
    }
    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_drives,
            execute_node,
            delete_drive,
            update_drive,
            get_bookmarks,
            add_bookmark,
            delete_bookmark,
            get_config,
            save_config // Asegúrate de que save_config esté incluido en el handler
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
