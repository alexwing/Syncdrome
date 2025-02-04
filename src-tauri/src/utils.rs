use std::{fs, path::{Path}, str};
use base64;
use serde_json::json;
use chrono::{DateTime, Local};
use std::ffi::{OsString, OsStr};
use std::os::windows::ffi::OsStrExt;
use winapi::um::fileapi::GetVolumeInformationW;
use winapi::shared::minwindef::{DWORD, MAX_PATH};
use winapi::um::winnt::ULARGE_INTEGER;
use winapi::um::fileapi::GetDiskFreeSpaceExW;
use winapi::um::shellapi::ShellExecuteW;
use winapi::um::winuser::SW_SHOW;
use std::ptr::null_mut;

pub fn get_space_disk(drive_letter: &str) -> (u64, u64) {
    use std::os::windows::ffi::OsStrExt;
    use std::ffi::OsStr;
    
    let drive = format!("{}\\", drive_letter);
    let wide: Vec<u16> = OsStr::new(&drive).encode_wide().chain(Some(0)).collect();

    let mut free_bytes_available: ULARGE_INTEGER = unsafe { std::mem::MaybeUninit::zeroed().assume_init() };
    let mut total_number_of_bytes: ULARGE_INTEGER = unsafe { std::mem::MaybeUninit::zeroed().assume_init() };
    let mut total_number_of_free_bytes: ULARGE_INTEGER = unsafe { std::mem::MaybeUninit::zeroed().assume_init() };

    unsafe {
        if GetDiskFreeSpaceExW(
            wide.as_ptr(),
            &mut free_bytes_available,
            &mut total_number_of_bytes,
            &mut total_number_of_free_bytes
        ) != 0 {
            let free = *free_bytes_available.QuadPart();
            let total = *total_number_of_bytes.QuadPart();
            return (free, total);
        }
    }
    (0, 0)
}

#[cfg(windows)]
pub fn get_volume_name(drive_letter: &str) -> String {
    use std::os::windows::ffi::OsStrExt;
    use std::ffi::OsStr;
    use winapi::shared::minwindef::{DWORD, MAX_PATH};
    use winapi::um::fileapi::GetVolumeInformationW;

    let root_path = format!("{}\\", drive_letter);
    let wide_path: Vec<u16> = OsStr::new(&root_path).encode_wide().chain(Some(0)).collect();

    let mut volume_name_buffer = [0u16; MAX_PATH + 1];
    let mut volume_serial_number: DWORD = 0;
    let mut max_component_length: DWORD = 0;
    let mut file_system_flags: DWORD = 0;
    let mut file_system_name_buffer = [0u16; MAX_PATH + 1];

    let result = unsafe {
        GetVolumeInformationW(
            wide_path.as_ptr(),
            volume_name_buffer.as_mut_ptr(),
            volume_name_buffer.len() as DWORD,
            &mut volume_serial_number,
            &mut max_component_length,
            &mut file_system_flags,
            file_system_name_buffer.as_mut_ptr(),
            file_system_name_buffer.len() as DWORD,
        )
    };

    if result != 0 {
        let len = volume_name_buffer.iter().position(|&c| c == 0).unwrap_or(volume_name_buffer.len());
        String::from_utf16_lossy(&volume_name_buffer[..len])
    } else {
        "".to_string()
    }
}

pub fn get_drive_sync(volume_name: &str, folder: &str) -> bool {
    let file_path = Path::new(folder).join(format!("{}.txt", volume_name));
    file_path.exists()
}

pub fn get_drive_sync_date(volume_name: &str, folder: &str) -> String {
    let file_path = Path::new(folder).join(format!("{}.txt", volume_name));
    if let Ok(metadata) = fs::metadata(&file_path) {
        if let Ok(modified) = metadata.modified() {
            let datetime: DateTime<Local> = DateTime::from(modified);
            return datetime.format("%Y-%m-%dT%H:%M:%S%.3f%:z").to_string();
        }
    }
    "".to_string()
}

pub fn get_drive_options(volume_name: &str, folder: &str) -> (bool, u64, u64) {
    let file_path = Path::new(folder).join("drives.json");
    let mut only_media = false;
    let mut size = 0;
    let mut free_space = 0;

    if let Ok(content) = fs::read_to_string(&file_path) {
        if let Ok(json_data) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(obj) = json_data.get(volume_name) {
                // ...mantener resto de lógica...
                if let Some(only_media_val) = obj.get("onlyMedia") {
                    only_media = only_media_val.as_bool().unwrap_or(false);
                }
                if let Some(size_val) = obj.get("size") {
                    size = size_val.as_u64().unwrap_or(0);
                }
                if let Some(free_val) = obj.get("freeSpace") {
                    free_space = free_val.as_u64().unwrap_or(0);
                }
            }
        }
    }

    (only_media, size, free_space)
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

#[cfg(windows)]
pub fn get_drives_info(config_folder: &str, connected: &serde_json::Value) -> serde_json::Value {
    use std::cmp::Ordering;
    let mut drives = vec![];

    // Obtener nombres de los .txt excluyendo los ya conectados
    let mut connected_names = vec![];
    if let Some(arr) = connected.as_array() {
        for obj in arr {
            if let Some(name) = obj["name"].as_str() {
                connected_names.push(name.to_string());
            }
        }
    }

    if let Ok(entries) = std::fs::read_dir(config_folder) {
        for entry in entries {
            if let Ok(file) = entry {
                let fname = file.file_name().into_string().unwrap_or_default();
                if fname.ends_with(".txt") {
                    let vol = fname.trim_end_matches(".txt");
                    if connected_names.contains(&vol.to_string()) {
                        continue;
                    }
                    let sync_date = get_drive_sync_date(vol, config_folder);
                    let (only_media, saved_size, saved_free) = get_drive_options(vol, config_folder);
                    drives.push(serde_json::json!({
                        "connected": false,
                        "letter": "",
                        "name": vol,
                        "freeSpace": saved_free,
                        "size": saved_size,
                        "sync": true,
                        "syncDate": sync_date,
                        "onlyMedia": only_media
                    }));
                }
            }
        }
    }

    // Convertir connected a Vec<Value> y unir
    let mut combined = if let Some(arr) = connected.as_array() {
        let mut clon = arr.clone();
        for d in drives {
            clon.push(d);
        }
        clon
    } else {
        vec![]
    };

    // Ordenar por connected, letter y name
    combined.sort_by(|a, b| {
        let a_conn = a["connected"].as_bool().unwrap_or(false);
        let b_conn = b["connected"].as_bool().unwrap_or(false);
        if a_conn && !b_conn {
            return Ordering::Less;
        }
        if !a_conn && b_conn {
            return Ordering::Greater;
        }
        // Si ambos connected, comparar letter
        if a_conn && b_conn {
            let a_letter = a["letter"].as_str().unwrap_or("");
            let b_letter = b["letter"].as_str().unwrap_or("");
            let cmp_letters = a_letter.cmp(b_letter);
            if cmp_letters != Ordering::Equal {
                return cmp_letters;
            }
        }
        // Finalmente comparar name
        let a_name = a["name"].as_str().unwrap_or("");
        let b_name = b["name"].as_str().unwrap_or("");
        a_name.cmp(b_name)
    });

    serde_json::Value::Array(combined)
}

pub fn get_extensions(config: &serde_json::Value) -> Vec<String> {
    let mut all_exts = vec![];
    if let Some(obj) = config.get("extensions") {
        if let Some(map) = obj.as_object() {
            for (_, value) in map.iter() {
                if let Some(media) = value.get("media") {
                    if let Some(array) = media.as_array() {
                        for item in array {
                            if let Some(ext_str) = item.as_str() {
                                all_exts.push(ext_str.trim().to_lowercase());
                            }
                        }
                    }
                }
            }
        }
    }
    all_exts.sort();
    all_exts.dedup();
    all_exts
}

// Migración de funciones de utils.js para búsqueda:
#[cfg(windows)]
pub fn get_drive_connected(drive_name: &str) -> String {
    use std::os::windows::ffi::OsStrExt;

    let mut drive_letter = String::new();
    for letter in 'A'..='Z' {
        let drive = format!("{}:\\", letter);
        let wide: Vec<u16> = OsString::from(drive.clone()).encode_wide().chain(Some(0)).collect();
        let mut volume_name_buffer = [0u16; MAX_PATH + 1];
        let mut volume_serial_number: DWORD = 0;
        let mut max_component_length: DWORD = 0;
        let mut file_system_flags: DWORD = 0;
        let mut file_system_name_buffer = [0u16; MAX_PATH + 1];

        let result = unsafe {
            GetVolumeInformationW(
                wide.as_ptr(),
            volume_name_buffer.as_mut_ptr(),
            volume_name_buffer.len() as DWORD,
            &mut volume_serial_number,
            &mut max_component_length,
            &mut file_system_flags,
            file_system_name_buffer.as_mut_ptr(),
            file_system_name_buffer.len() as DWORD,
            )
        };

        if result != 0 {
            let len = volume_name_buffer.iter().position(|&c| c == 0).unwrap_or(volume_name_buffer.len());
            let volume_name = String::from_utf16_lossy(&volume_name_buffer[..len]);
            if volume_name == drive_name {
                drive_letter = drive;
                break;
            }
        }
    }
    drive_letter
}

pub fn get_name_from_file(file: &str) -> String {
    // Elimina .txt, etc.
    file.trim_end_matches(".txt").to_string()
}

pub fn open_file(encoded_url: &str) -> Result<(), std::io::Error> {
    let decoded = base64::decode(encoded_url).unwrap_or_default();
    let path_str = String::from_utf8_lossy(&decoded).replace("/", "\\\\");
    println!("DEBUG: Abriendo archivo: {}", path_str);

    let wide_path: Vec<u16> = OsStr::new(&path_str).encode_wide().chain(Some(0)).collect();
    let result = unsafe {
        ShellExecuteW(
            null_mut(),
            OsStr::new("open").encode_wide().chain(Some(0)).collect::<Vec<u16>>().as_ptr(),
            wide_path.as_ptr(),
            null_mut(),
            null_mut(),
            SW_SHOW,
        )
    };

    if result as i32 <= 32 {
        println!("ERROR: Fallo al abrir el archivo con ShellExecuteW, código de error: {}", result as i32);
        return Err(std::io::Error::new(std::io::ErrorKind::Other, "Fallo al abrir el archivo"));
    }

    Ok(())
}

pub fn open_folder(encoded_url: &str) -> Result<(), std::io::Error> {
    let decoded = base64::decode(encoded_url).unwrap_or_default();
    let path_str = String::from_utf8_lossy(&decoded).replace("/", "\\\\");
    println!("DEBUG: Abriendo carpeta: {}", path_str);

    let wide_path: Vec<u16> = OsStr::new(&path_str).encode_wide().chain(Some(0)).collect();
    let result = unsafe {
        ShellExecuteW(
            null_mut(),
            OsStr::new("open").encode_wide().chain(Some(0)).collect::<Vec<u16>>().as_ptr(),
            wide_path.as_ptr(),
            null_mut(),
            null_mut(),
            SW_SHOW,
        )
    };

    if result as i32 <= 32 {
        println!("ERROR: Fallo al abrir la carpeta con ShellExecuteW, código de error: {}", result as i32);
        return Err(std::io::Error::new(std::io::ErrorKind::Other, "Fallo al abrir la carpeta"));
    }

    Ok(())
}

pub fn get_extensions_by_type(extensions: &[&str], config: &serde_json::Value) -> Vec<String> {
    let mut final_ext = Vec::new();
    if extensions.is_empty() {
        return final_ext;
    }

    for key in extensions {
        if let Some(config_extensions) = config.get("extensions") {
            if let Some(ext_object) = config_extensions.as_object() {
                if let Some(entry) = ext_object.get(*key) {
                    if let Some(exts_arr) = entry.get("extensions").and_then(|v| v.as_array()) {
                        for ex in exts_arr {
                            if let Some(ex_str) = ex.as_str() {
                                final_ext.push(ex_str.trim().to_lowercase());
                            }
                        }
                    }
                }
            }
        }
    }
    final_ext.sort();
    final_ext.dedup();
    final_ext
}

