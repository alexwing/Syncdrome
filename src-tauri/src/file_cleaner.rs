use tauri::command;
use std::{fs, path::Path};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct FileCleanerProps {
    pub path: String,
    pub filename: String,
    pub fixed: Option<String>,
    pub status: Option<String>,
    pub message: Option<String>,
}

#[command]
pub fn get_files_in_folder(folder: String) -> Result<Vec<FileCleanerProps>, String> {
    let mut results = Vec::new();
    let entries = fs::read_dir(&folder).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            let filename = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            results.push(FileCleanerProps {
                path: path.to_string_lossy().to_string(),
                filename,
                fixed: None,
                status: None,
                message: None,
            });
        }
    }
    Ok(results)
}

#[command]
pub fn rename_files_in_folder(files: Vec<FileCleanerProps>) -> Result<Vec<FileCleanerProps>, String> {
    let mut results = Vec::new();

    for mut file_info in files {
        if let Some(ref new_name) = file_info.fixed {
            let parent = Path::new(&file_info.path).parent();
            if let Some(parent_path) = parent {
                let new_path = parent_path.join(new_name);
                match fs::rename(&file_info.path, &new_path) {
                    Ok(_) => {
                        file_info.path = new_path.to_string_lossy().to_string();
                        file_info.status = Some("success".to_string());
                    }
                    Err(e) => {
                        file_info.status = Some("error".to_string());
                        file_info.message = Some(e.to_string());
                    }
                }
            } else {
                file_info.status = Some("error".to_string());
                file_info.message = Some("Invalid path parent".to_string());
            }
        }
        results.push(file_info);
    }
    Ok(results)
}
