use std::{fs, process::Command, path::Path};
use serde::{Serialize, Deserialize};
use encoding_rs::*;

#[derive(Serialize, Deserialize)]
pub struct LogFile {
    pub info: String,
    pub refresh: String,
    pub summary: String,
}

#[tauri::command]
pub fn sync_folders(source: String, target: String) -> Result<String, String> {
    let log_path = std::env::temp_dir().join("syncTofolder.log");
    println!("Iniciando sincronización de '{}' a '{}'", source, target);
    let output = Command::new("robocopy")
        .arg(&source)
        .arg(&target)
        .arg("/MIR")
        .arg("/R:3")
        .arg("/W:10")
        .arg(format!("/LOG:{}", log_path.display()))
        .output();

    match output {
        Ok(_) => {
            println!("Sync finalizada exitosamente");
            Ok(format!("Sync {} to {} success", source, target))
        },
        Err(e) => {
            println!("Error de robocopy: {}", e);
            Err(format!("Error: {}", e))
        },
    }
}

#[tauri::command]
pub fn get_sync_log() -> Result<LogFile, String> {
    let log_path = std::env::temp_dir().join("syncTofolder.log");
    println!("Leyendo archivo de log: {}", log_path.display());
    let data = fs::read(&log_path).map_err(|e| e.to_string())?;
    let (decoded, _, _) = WINDOWS_1252.decode(&data);
    let content = decoded.to_string();
    let info = content.lines().take(10).collect::<Vec<_>>().join("\n");
    let refresh = "".to_string(); 
    let summary = content.lines().rev().take(5).collect::<Vec<_>>().join("\n");
    println!("Total de líneas del log: {}", content.lines().count());
    Ok(LogFile { info, refresh, summary })
}
