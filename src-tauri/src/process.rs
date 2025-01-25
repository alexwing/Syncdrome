use crate::config::load_config;
use crate::utils::{
    get_drive_options, get_drives_info, get_extensions, get_space_disk, get_volume_name, write_size,
};
use serde_json::{json, Value};
use std::{env, fs, path::Path, process::Command};
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
    // Cambiar directorio y ejecutar "dir . /s /b"
    if env::set_current_dir(format!("{}\\", drive_letter)).is_err() {
        return json!({ "success": false, "error": "Invalid drive letter" });
    }
    let cmd_output = Command::new("cmd")
        .args([
            "/C", "chcp", "65001", ">", "nul", "&&", "dir", ".", "/s", "/b",
        ])
        .output();

    // println!("DEBUG: Resultado del comando: {:?}", cmd_output);
    match cmd_output {
        Ok(output) => {
            let list = String::from_utf8_lossy(&output.stdout)
                .lines()
                .filter(|l| !l.to_lowercase().contains("$recycle.bin") && !l.trim().is_empty())
                .map(|s| s.to_string())
                .collect::<Vec<_>>()
                .join("\n");

            let filtered_list = if only_media {
                // Filtrar extensiones
                list.lines()
                    .filter(|line| {
                        if line.contains('.') {
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
        Err(e) => json!({ "success": false, "error": e.to_string() }),
    }
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

    let cmd_output = Command::new("wmic")
        .args(["logicaldisk", "get", "name,volumename"])
        .output();

    let mut drives_list = vec![];
    if let Ok(output) = cmd_output {
        let lines = String::from_utf8_lossy(&output.stdout);
        for line in lines.split('\n') {
            let line = line.trim();
            if line.is_empty() || line.contains("Name  VolumeName") {
                continue;
            }
            if let Some((letter, rest)) = line.split_once(' ') {
                let drive_letter = letter.trim();
                let drive_name = rest.trim();
                let (free, size) = get_space_disk(drive_letter);
                if size > 0 {
                    let mut sync = false;
                    let mut sync_date = String::new();
                    if !drive_name.is_empty() {
                        sync = crate::utils::get_drive_sync(drive_name, &config.folder);
                        if sync {
                            sync_date = crate::utils::get_drive_sync_date(drive_name, &config.folder);
                        }
                    }
                    let (only_media, _, _) =
                        crate::utils::get_drive_options(drive_name, &config.folder);
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
        }
        println!("drives_list construido: {:?}", drives_list);
    } else {
        println!("Error al ejecutar wmic logicaldisk.");
    }

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
    let volume_name = crate::utils::get_volume_name(&drive_letter);
    let file_path = Path::new(&config.folder).join(format!("{}.txt", volume_name));
    if file_path.exists() {
        if fs::remove_file(&file_path).is_err() {
            return json!({"error": "Cannot remove .txt file"});
        }
    }
    // Eliminar de drives.json
    crate::utils::delete_drive_options(&volume_name, &config.folder);
    json!({"success": true, "message": format!("Deleted file for {}", volume_name)})
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
