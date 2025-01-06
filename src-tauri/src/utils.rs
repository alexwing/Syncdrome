use std::{fs, path::{Path, PathBuf}, process::Command, str};
use serde_json::json;

pub fn get_space_disk(drive_letter: &str) -> (u64, u64) {
    let output = Command::new("wmic")
        .args([
            "logicaldisk",
            "where",
            &format!("DeviceID=\"{}\"", drive_letter),
            "get",
            "freespace,size",
        ])
        .output();

    if let Ok(result) = output {
        let lines = String::from_utf8_lossy(&result.stdout);
        println!("DEBUG get_space_disk wmic output:\n{}", lines);
        for line in lines.split('\n') {
            let raw_line = line;
            let line = line.trim();
            if line.is_empty() || line.contains("FreeSpace") {
                continue;
            }
            println!("DEBUG line parse: [{}]", raw_line);
            let parts: Vec<&str> = line.split_whitespace().collect();
            println!("DEBUG parted: {:?}", parts);
            if parts.len() == 2 {
                let free = parts[0].parse::<u64>().unwrap_or(0);
                let size = parts[1].parse::<u64>().unwrap_or(0);
                return (free, size);
            }
        }
    }
    (0, 0)
}

pub fn get_volume_name(drive_letter: &str) -> String {
    let output = Command::new("wmic")
        .args([
            "logicaldisk",
            "where",
            &format!("DeviceID=\"{}\"", drive_letter),
            "get",
            "volumename",
        ])
        .output();

    if let Ok(result) = output {
        let lines = String::from_utf8_lossy(&result.stdout);
        // ...parsear...
        for line in lines.split('\n') {
            let line = line.trim();
            if line.contains("VolumeName") || line.is_empty() {
                // ...omitir...
                continue;
            }
            return line.to_string();
        }
    }
    "".to_string()
}

pub fn get_drive_sync(volume_name: &str, folder: &str) -> bool {
    let file_path = Path::new(folder).join(format!("{}.txt", volume_name));
    file_path.exists()
}

pub fn get_drive_sync_date(volume_name: &str, folder: &str) -> String {
    let file_path = Path::new(folder).join(format!("{}.txt", volume_name));
    if let Ok(metadata) = fs::metadata(&file_path) {
        if let Ok(modified) = metadata.modified() {
            // ...formatear fecha...
            if let Ok(time) = modified.elapsed() {
                return format!("Modificado hace {} segundos", time.as_secs());
            }
        }
    }
    "".to_string()
}

pub fn get_drive_options(volume_name: &str, folder: &str) -> bool {
    let file_path = Path::new(folder).join("drives.json");
    if let Ok(content) = fs::read_to_string(&file_path) {
        if let Ok(mut json_data) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(obj) = json_data.get_mut(volume_name) {
                if let Some(only_media) = obj.get("onlyMedia") {
                    return only_media.as_bool().unwrap_or(false);
                }
            }
        }
    }
    false
}

pub fn write_size(volume_name: &str, folder: &str, size: u64, free: u64) {
    let file_path = Path::new(folder).join("drives.json");
    let mut drives = json!({});
    if let Ok(content) = fs::read_to_string(&file_path) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
            drives = val;
        }
    }
    drives[volume_name]["size"] = json!(size);
    drives[volume_name]["freeSpace"] = json!(free);
    // Guardar en drives.json
    if let Ok(serialized) = serde_json::to_string_pretty(&drives) {
        let _ = fs::write(&file_path, serialized);
    }
}

pub fn delete_drive_options(volume_name: &str, folder: &str) {
    let file_path = Path::new(folder).join("drives.json");
    if let Ok(content) = fs::read_to_string(&file_path) {
        if let Ok(mut drives) = serde_json::from_str::<serde_json::Value>(&content) {
            if drives.get(volume_name).is_some() {
                drives.as_object_mut().unwrap().remove(volume_name);
                if let Ok(serialized) = serde_json::to_string_pretty(&drives) {
                    let _ = fs::write(&file_path, serialized);
                }
            }
        }
    }
}

pub fn get_drives_info(config_folder: &str) -> serde_json::Value {
    // Leer txt y drives.json, fusionar info
    // Para simplicidad, se retorna array vacío
    serde_json::json!([])
}

pub fn get_drive_connected(drive_name: &str) -> String {
    // wmic logicaldisk where volumename="XYZ" get DeviceID
    let output = Command::new("wmic")
        .args([
            "logicaldisk",
            "where",
            &format!("volumename=\"{}\"", drive_name),
            "get",
            "DeviceID",
        ])
        .output();

    if let Ok(result) = output {
        let lines = String::from_utf8_lossy(&result.stdout);
        for line in lines.split('\n') {
            let line = line.trim();
            if line.is_empty() || line.contains("DeviceID") {
                continue;
            }
            return line.to_string();
        }
    }
    "".to_string()
}

pub fn get_name_from_file(file_name: &str) -> String {
    file_name.trim_end_matches(".txt").to_string()
}

pub fn open_file(file: &str) {
    let _ = Command::new("explorer").arg(file).spawn();
}

pub fn open_folder(folder: &str) {
    let _ = Command::new("explorer").arg(folder).spawn();
}

pub fn get_extensions(_config: &serde_json::Value) -> Vec<String> {
    // Recorrer config["extensions"] y obtener array de extensiones, placeholder
    vec![]
}

pub fn get_extensions_by_type(_extensions: &[String], _config: &serde_json::Value) -> Vec<String> {
    // Recorrer config["extensions"][key].extensions
    vec![]
}

pub fn delete_file(file_path: &str) {
    let _ = fs::remove_file(file_path);
}
