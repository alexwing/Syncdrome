use std::{fs, process::Command, path::Path};
use serde::{Serialize, Deserialize};
use encoding_rs::WINDOWS_1252;

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
    
    let sections: Vec<&str> = content.split("------------------------------------------------------------------------------").collect();
    
    // Node.js usa i = 2 para empezar después del header
    let info = if sections.len() > 2 { 
        sections[2]
            .lines()
            .skip(1) // Saltamos la primera línea vacía
            .map(|line| line.trim())
            .filter(|line| !line.is_empty())
            .collect::<Vec<&str>>()
            .join("\n")
    } else { 
        String::new() 
    };
    
    let refresh = if sections.len() > 3 {
        sections[3]
            .lines()
            .map(|line| line.trim())
            .filter(|line| !line.is_empty() && !line.contains("%"))
            .collect::<Vec<&str>>()
            .join("\n")
    } else { 
        String::new() 
    };
    
    let summary = if sections.len() > 4 { 
        sections[4].trim().to_string()
    } else { 
        String::new() 
    };

    Ok(LogFile { info, refresh, summary })
}
