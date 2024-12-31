// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod load_config; // Asegúrate de que el nombre del módulo sea correcto
use load_config::load_config; // Importa la función load_config correctamente
use tauri::command;

#[command]
fn get_config() -> Result<load_config::Config, String> { // Asegúrate de que el nombre del módulo sea correcto
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
        .invoke_handler(tauri::generate_handler![get_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
