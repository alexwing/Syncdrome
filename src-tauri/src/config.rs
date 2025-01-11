use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;
use std::fs::OpenOptions;
use crate::utils::ensure_config_file_exists;

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub folder: String,
    #[serde(default = "default_node_env")]
    pub node_env: String, 
    pub extensions: serde_json::Value,
}

fn default_node_env() -> String {
    "development".to_string()
}

pub fn load_config() -> Result<Config, String> {
    let full_path = ensure_config_file_exists()?;
    println!("Leyendo config de: {:?}", full_path);

    if !full_path.exists() {
        return Err(format!("Config file not found at: {:?}", full_path));
    }

    let config_content = {
        let mut file = fs::File::open(full_path)
            .map_err(|e| format!("Error opening config file: {}", e))?;
        let mut content = String::new();
        use std::io::Read;
        file.read_to_string(&mut content)
            .map_err(|e| format!("Error reading config file: {}", e))?;
        content
    };
    let config: Config = serde_json::from_str(&config_content)
        .map_err(|e| format!("Error parsing config file: {}", e))?;
    println!("Config file parsed successfully.");
    Ok(config)
}

#[command]
pub fn save_config(config: Config) -> Result<String, String> {
    let full_path = ensure_config_file_exists()?;

    let config_content = serde_json::to_string_pretty(&config) // serialize config
        .map_err(|e| format!("Error serializing config: {}", e))?;

    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .create(true)
        .open(&full_path)
        .map_err(|e| format!("Error opening config file: {}", e))?;

    use std::io::Write;
    file.write_all(config_content.as_bytes())
        .map_err(|e| format!("Error writing config file: {}", e))?;

    println!("Config file saved successfully at: {:?}", full_path);
    Ok(full_path.to_string_lossy().to_string())
}
