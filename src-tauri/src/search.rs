use std::fs;
use std::path;
use crate::utils::{open_file, open_folder, get_drive_connected, get_name_from_file, get_extensions_by_type};
use crate::sqlite::fetch_bookmarks;
use crate::config::load_config;
use tauri::command;

#[derive(Debug, serde::Serialize)]
pub struct SearchResult {
    pub connected: String,
    pub content: serde_json::Value,
}

#[command]
pub fn find_files(search_param: String, extensions: String) -> Result<serde_json::Value, String> {
    println!("DEBUG: Iniciando find_files con search_param: {}, extensions: {}", search_param, extensions);
    let config = load_config().map_err(|e| e.to_string())?;
    let config_folder = config.folder.clone();
    // Convertir Config a serde_json::Value
    let config_value = serde_json::to_value(&config).map_err(|e| e.to_string())?;
    println!("DEBUG: Config folder: {}", config_folder);
    let search_text = search_param.to_lowercase();
    let extensions_lower = extensions.to_lowercase(); // Crear una variable temporal
    let extension_types: Vec<&str> = extensions_lower.split('&').collect();
    let mut results = serde_json::json!({});

    if search_text.len() < 3 {
        println!("DEBUG: search_text demasiado corto");
        return Ok(results);
    }

    let bookmarks = fetch_bookmarks(None).unwrap_or_default();
    println!("DEBUG: Bookmarks cargados: {:?}", bookmarks);
    let exts = if extension_types.get(0).unwrap_or(&"") != &"all" {
        get_extensions_by_type(&extension_types, &config_value)
    } else {
        vec![]
    };
    println!("DEBUG: Extensiones filtradas: {:?}", exts);

    for entry in fs::read_dir(&config_folder).map_err(|e| e.to_string())? {
        if let Ok(file) = entry {
            let fname = file.file_name().to_string_lossy().to_string();
            if fname.ends_with(".txt") {
                println!("DEBUG: Procesando archivo: {}", fname);
                let full_path = path::Path::new(&config_folder).join(&fname);
                let file_data = fs::read_to_string(&full_path).unwrap_or_default();
                let drive_name = get_name_from_file(&fname);
                let connected = get_drive_connected(&drive_name);
                let mut founds = Vec::new();

                for (_, row) in file_data.lines().enumerate() {
                    let row_trimmed = row.trim().replace("\r", "").replace("\n", "");
                    if row_trimmed.to_lowercase().contains(&search_text)
                        && !row_trimmed.contains("$RECYCLE.BIN")
                    {
                        let is_folder = !row_trimmed.contains('.');
                        let file_data_name = path::Path::new(&row_trimmed)
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();
                        let file_name = if is_folder { "".to_string() } else { file_data_name.clone() };

                        // Quitar la letra de unidad y slash si es archivo
                        let folder_only = if is_folder {
                            row_trimmed.clone()
                        } else {
                            let dir = path::Path::new(&row_trimmed)
                                .parent()
                                .unwrap_or_else(|| path::Path::new(""))
                                .to_string_lossy()
                                .to_string();
                            if dir.len() > 3 { dir[3..].to_string() } else { "".into() }
                        };

                        if !is_folder {
                            let extension = file_name.split('.').last().unwrap_or("").to_lowercase();
                            if !exts.is_empty() && !exts.contains(&extension) {
                                continue;
                            }
                            let clean_name = file_data_name
                                .replace("\\.[^/.]+$", "")
                                .replace(&['-', '_', '.'][..], " ");
                            let bookmark = bookmarks.iter().find(|b| {
                                folder_only.contains(&b.path) 
                                    && file_name == b.name
                                    && b.volume == Some(drive_name.clone())
                            });

                            founds.push(serde_json::json!({
                                "fileName": file_name,
                                "folder": folder_only,
                                "extension": extension,
                                "name": clean_name,
                                "bookmark": bookmark
                            }));
                        }
                    }
                }

                let mut grouped: serde_json::Map<String, serde_json::Value> = serde_json::Map::new();
                for item in founds {
                    let folder_val = item["folder"].as_str().unwrap_or("");
                    let array_ref = grouped.entry(folder_val.to_string())
                        .or_insert_with(|| serde_json::json!([]));
                    if let Some(arr) = array_ref.as_array_mut() {
                        arr.push(item);
                    }
                }

                if !grouped.is_empty() {
                    // Limpiar datos no deseados de cada JSON
                    for (key, arr) in grouped.iter_mut() {
                        if let Some(array) = arr.as_array_mut() {
                            for obj in array {
                                if let Some(o) = obj.as_object_mut() {
                                    o.remove("type");
                                    o.remove("line");
                                    o.remove("content");
                                    if let Some(f_str) = o.get_mut("folder") {
                                        if let Some(folder_str) = f_str.as_str() {
                                            *f_str = serde_json::json!(folder_str.replace(
                                                r"^[a-zA-Z]:\\",
                                                ""
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    results[drive_name.clone()] = serde_json::json!({
                        "connected": connected,
                        "content": grouped
                    });
                }
            }
        }
    }

    Ok(results)
}

#[command]
pub fn open_file_rust(encoded_url: String) -> Result<(), String> {
    open_file(&encoded_url).map_err(|e| e.to_string())
}

#[command]
pub fn open_folder_rust(encoded_url: String) -> Result<(), String> {
    open_folder(&encoded_url).map_err(|e| e.to_string())
}
