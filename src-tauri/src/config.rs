use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;
use std::fs::OpenOptions;
use dirs::home_dir;
use crate::config_file::get_default_config_json;

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub folder: String,
    #[serde(default = "default_node_env")]
    pub node_env: String, 
    pub extensions: serde_json::Value,
    pub defaultSubstitutions: Vec<Substitution>,
    pub pattern: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Substitution {
    pub find: String,
    pub replace: String,
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
    println!("Iniciando save_config con folder: {:?}", config.folder);
    println!("Config completo recibido: {:?}", config);
    
    let full_path = ensure_config_file_exists()?;

    let config_content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Error serializing config: {}", e))?;
    
    println!("Config serializado: {}", config_content);

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
    println!("Contenido guardado: {}", config_content);
    
    Ok(full_path.to_string_lossy().to_string())
}

pub fn ensure_config_file_exists() -> Result<PathBuf, String> {
    // get home directory and .syncdrome/config.json
    println!("Obteniendo el directorio home");
    let home = home_dir().ok_or("No se pudo obtener HOME")?;
    let syncdrome_dir = home.join(".syncdrome");
    let config_file = syncdrome_dir.join("config.json");

    // Make folder if it doesn't exist
    if !syncdrome_dir.exists() {
        println!("Creando carpeta .syncdrome");
        std::fs::create_dir_all(&syncdrome_dir)
            .map_err(|e| format!("No se pudo crear carpeta: {}", e))?;
    } else {
        println!("La carpeta .syncdrome ya existe");
    }

    // copy default config.json to .syncdrome
    if !config_file.exists() {
        println!("Creando config.json con contenido por defecto");
        if let Err(e) = fs::write(&config_file, get_default_config_json()) {
            return Err(format!("No se pudo crear config.json: {}", e));
        }
    } else {
        println!("El archivo config.json ya existe");
    }

    Ok(config_file)
}

