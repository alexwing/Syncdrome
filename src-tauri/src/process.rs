use crate::config::load_config;
use crate::utils::{
    get_drive_options, get_drives_info, get_extensions, get_space_disk, get_volume_name, write_size,
};
use serde_json::{json, Value};
use std::{fs, path::Path, path::PathBuf};
/***
 * Execute the command to list all files in the drive
 * @param {String} drive_letter - Drive letter
 * @returns {Object} - Result of the command
 */
#[tauri::command]
pub fn execute_node(drive_letter: String) -> Value {
    println!(
        "DEBUG: Iniciando execute_node con la unidad: {}",
        drive_letter
    );
    let config = match load_config() {
        Ok(cfg) => cfg,
        Err(e) => return json!({ "error": e }),
    };
    // Obtener nombre de volumen y si está en modo onlyMedia
    let volume_name = get_volume_name(&drive_letter);
    let (only_media, _, _) = get_drive_options(&volume_name, &config.folder);
    // Extensiones
    let exts = if only_media {
        get_extensions(&config.extensions)
    } else {
        vec![]
    };
    println!(
        "DEBUG: volume_name={volume_name}, only_media={only_media}, exts={:?}",
        exts
    );
    // Recorrer la unidad de forma nativa (Unicode-safe, sin code pages)
    let root = PathBuf::from(format!("{}\\", drive_letter));
    if fs::read_dir(&root).is_err() {
        return json!({ "success": false, "error": "Invalid drive letter" });
    }

    let list = list_drive_entries(&root)
        .into_iter()
        .filter(|l| !l.to_lowercase().contains("$recycle.bin") && !l.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    let filtered_list = if only_media {
        // Filtrar extensiones
        list.lines()
            .filter(|line| {
                if line.ends_with('\\') {
                    // Es carpeta (marcada explícitamente)
                    true
                } else if line.contains('.') {
                    let ext = line.split('.').last().unwrap_or("").to_lowercase();
                    exts.contains(&ext)
                } else {
                    // Es carpeta
                    true
                }
            })
            .collect::<Vec<_>>()
            .join("\n")
    } else {
        list
    };

    // Guardar en vol.txt
    let file_path = Path::new(&config.folder).join(format!("{}.txt", volume_name));
    println!("DEBUG: Guardando listado en: {}", file_path.display());
    if fs::write(&file_path, filtered_list).is_ok() {
        // Actualizar drives.json con nuevo size/freeSpace
        let (free, size) = get_space_disk(&drive_letter);
        write_size(&volume_name, &config.folder, size, free);
        json!({
            "success": true,
            "message": format!("File list in {} saved. Lines: {}", volume_name, file_path.display()),
        })
    } else {
        json!({ "success": false, "error": "Failed to write file" })
    }
}

/***
 * Recorrido iterativo de directorios (equivalente a `dir . /s /b`).
 * Devuelve rutas absolutas de archivos y carpetas. Lee los nombres en
 * Unicode nativo, evitando la corrupción por code page del terminal.
 */
fn list_drive_entries(root: &Path) -> Vec<String> {
    let mut entries: Vec<String> = Vec::new();
    let mut stack: Vec<PathBuf> = vec![root.to_path_buf()];

    while let Some(dir) = stack.pop() {
        let read = match fs::read_dir(&dir) {
            Ok(rd) => rd,
            Err(_) => continue, // sin permisos (System Volume Information, etc.)
        };
        for entry in read.flatten() {
            let path = entry.path();
            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
            if is_dir {
                // Marcar carpetas con "\" final para que el catálogo las
                // distinga de archivos sin extensión (o carpetas vacías).
                entries.push(format!("{}\\", path.to_string_lossy()));
                stack.push(path);
            } else {
                entries.push(path.to_string_lossy().to_string());
            }
        }
    }

    entries
}

/***
 *  Get the list of drives and their information
 * @returns {Object} - List of drives
 */
#[tauri::command]
pub fn get_drives() -> Value {
    let config = match load_config() {
        Ok(cfg) => cfg,
        Err(e) => return json!({ "error": e }),
    };
    println!("Iniciando get_drives...");

    // Enumerar unidades de forma nativa (Unicode-safe, sin wmic/code pages)
    let mut drives_list = vec![];
    for letter in 'A'..='Z' {
        let drive_letter = format!("{}:", letter);
        let (free, size) = get_space_disk(&drive_letter);
        if size > 0 {
            let drive_name = get_volume_name(&drive_letter);
            let mut sync = false;
            let mut sync_date = String::new();
            if !drive_name.is_empty() {
                sync = crate::utils::get_drive_sync(&drive_name, &config.folder);
                if sync {
                    sync_date = crate::utils::get_drive_sync_date(&drive_name, &config.folder);
                }
            }
            let (only_media, _, _) = crate::utils::get_drive_options(&drive_name, &config.folder);
            drives_list.push(json!({
                "connected": true,
                "letter": drive_letter,
                "name": drive_name,
                "freeSpace": free,
                "size": size,
                "sync": sync,
                "syncDate": sync_date,
                "onlyMedia": only_media
            }));
        }
    }
    println!("drives_list construido: {:?}", drives_list);

    let all_drives = get_drives_info(&config.folder, &json!(drives_list));
    println!("Array final con drives: {:?}", all_drives);
    all_drives
}

/***
 * remove volume name file from drive root
 * @param {String} drive_letter - Drive letter
 * @returns {Object} - Result of the command
 */
#[tauri::command]
pub fn delete_drive(drive_letter: String) -> Value {
    let config = match load_config() {
        Ok(cfg) => cfg,
        Err(e) => return json!({"error": e}),
    };
    let drive_identifier = drive_letter.trim();
    if drive_identifier.is_empty() {
        return json!({"success": false, "error": "Drive identifier is empty"});
    }

    let volume_name = if is_drive_letter(drive_identifier) {
        crate::utils::get_volume_name(drive_identifier)
    } else {
        drive_identifier.to_string()
    };

    if volume_name.trim().is_empty() {
        return json!({"success": false, "error": "Cannot resolve drive volume name"});
    }

    if volume_name.contains(['\\', '/', ':']) {
        return json!({"success": false, "error": "Invalid drive volume name"});
    }

    let file_path = Path::new(&config.folder).join(format!("{}.txt", volume_name));
    let mut deleted_catalog = false;
    if file_path.exists() {
        if fs::remove_file(&file_path).is_err() {
            return json!({"success": false, "error": "Cannot remove .txt file"});
        }
        deleted_catalog = true;
    }
    // Eliminar de drives.json
    let deleted_options = match crate::utils::delete_drive_options(&volume_name, &config.folder) {
        Ok(deleted) => deleted,
        Err(error) => return json!({"success": false, "error": error}),
    };

    if !deleted_catalog && !deleted_options {
        return json!({"success": false, "error": format!("No catalog found for {}", volume_name)});
    }

    json!({"success": true, "message": format!("Deleted file for {}", volume_name)})
}

fn is_drive_letter(value: &str) -> bool {
    let bytes = value.as_bytes();
    bytes.len() == 2 && bytes[0].is_ascii_alphabetic() && bytes[1] == b':'
}

/***
 * Drives.json file is used to store the onlyMedia status of each drive
 * @param {String} drive_letter - Drive letter
 * @param {Boolean} only_media - Only media files
 * @returns {Object} - Result of the command
 */
#[tauri::command]
pub fn update_drive(drive_letter: String, only_media: bool) -> Value {
    // Equivalente a app.put("/drives/:driveLetter")
    let config = match load_config() {
        Ok(cfg) => cfg,
        Err(e) => return json!({ "error": e }),
    };
    let file_path = Path::new(&config.folder).join("drives.json");
    let vol = drive_letter;
    let mut drives = json!({});
    if let Ok(content) = fs::read_to_string(&file_path) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
            drives = val;
        }
    }
    drives[vol.clone()]["onlyMedia"] = json!(only_media);
    if let Ok(serialized) = serde_json::to_string_pretty(&drives) {
        if fs::write(&file_path, serialized).is_err() {
            return json!({ "error": "Cannot update drives.json" });
        }
    }
    json!({
        "success": true,
        "message": format!("Drive {} updated, onlyMedia={}", vol, only_media)
    })
}
