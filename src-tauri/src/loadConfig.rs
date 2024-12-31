use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub folder: String,
    pub node_env: String, // Cambiar a snake case
    pub extensions: serde_json::Value,
}

pub fn load_config() -> Result<Config, String> {
    let config_path = if cfg!(debug_assertions) { // Eliminar `mut`
        PathBuf::from("config.json")
    } else {
        std::env::current_exe()
            .map_err(|e| e.to_string())?
            .parent()
            .unwrap()
            .join("config.json")
    };

    println!("Reading config file from: {:?}", config_path);

    let config_content = fs::read_to_string(config_path)
        .map_err(|e| format!("Error reading config file: {}", e))?;
    let config: Config = serde_json::from_str(&config_content)
        .map_err(|e| format!("Error parsing config file: {}", e))?;
    println!("Config file parsed successfully.");
    Ok(config)
}
