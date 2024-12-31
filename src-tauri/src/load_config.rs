use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

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
    let config_path = if cfg!(debug_assertions) { 
        PathBuf::from("../config.json")
    } else {
        PathBuf::from("config.json") 
    };

    let full_path = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join(&config_path);

    println!("Reading config file from: {:?}", full_path);

    if !full_path.exists() {
        return Err(format!("Config file not found at: {:?}", full_path));
    }

    let config_content = fs::read_to_string(full_path)
        .map_err(|e| format!("Error reading config file: {}", e))?;
    let config: Config = serde_json::from_str(&config_content)
        .map_err(|e| format!("Error parsing config file: {}", e))?;
    println!("Config file parsed successfully.");
    Ok(config)
}
