use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use tauri::command;
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub item_type: String,
}

#[derive(Debug, Default)]
struct Node {
    children: HashMap<String, Node>,
    is_file: bool,
}

lazy_static! {
    static ref FILE_SYSTEM: Mutex<Node> = Mutex::new(Node::default());
    static ref DRIVE_LETTER: Mutex<String> = Mutex::new(String::new());
}

fn build_file_system(contents: &str) -> Node {
    let mut root = Node::default();
    for line in contents.lines() {
        let line = line.trim().trim_start_matches("C:\\"); // Ejemplo
        let parts = line.split('\\').collect::<Vec<_>>();
        let mut current = &mut root;
        for (i, part) in parts.iter().enumerate() {
            current = current.children.entry(part.to_string())
                .or_insert(Node::default());
            if i == parts.len() - 1 {
                current.is_file = true;
            }
        }
    }
    root
}

#[command]
pub fn change_file_system(filename: String) -> Result<(), String> {
    // Simula obtener la ruta real y comprobar conexión
    let mut drive = DRIVE_LETTER.lock().unwrap();
    *drive = "C:".to_string(); // isVolumeConnected simplificado

    let file_with_extension = if filename.to_lowercase().ends_with(".txt") {
        filename.clone()
    } else {
        format!("{}.txt", filename)
    };

    // Leer archivo y construir estructura
    let data = std::fs::read_to_string(&file_with_extension)
        .map_err(|e| format!("Error leyendo archivo: {}", e))?;
    let new_fs = build_file_system(&data);

    let mut fs_data = FILE_SYSTEM.lock().unwrap();
    *fs_data = new_fs;
    Ok(())
}

#[command]
pub fn navigate(current_path: String, command: String) -> Result<(String, Vec<FileItem>, bool, String), String> {
    let drive = DRIVE_LETTER.lock().unwrap();
    let mut path_parts: Vec<_> = current_path.split('\\')
        .filter(|p| !p.is_empty()).map(|s| s.to_string()).collect();

    match command.as_str() {
        c if c == "cd .." => {
            if !path_parts.is_empty() { path_parts.pop(); }
        },
        c if c.starts_with("cd ") => {
            let target = c.trim_start_matches("cd ").trim();
            path_parts.push(target.to_string());
        },
        _ => return Err("Comando inválido".to_owned()),
    }

    let fs_data = FILE_SYSTEM.lock().unwrap();
    let mut current_node = &*fs_data;
    for part in &path_parts {
        match current_node.children.get(part) {
            Some(next_node) => current_node = next_node,
            None => return Err("Ruta inválida".to_owned()),
        }
    }

    let mut items: Vec<FileItem> = current_node.children.iter()
        .map(|(k, v)| FileItem {
            name: k.clone(),
            item_type: if v.is_file { "file".to_string() } else { "directory".to_string() },
        })
        .collect();

    // Ordenar: directorios primero
    items.sort_by(|a, b| {
        if a.item_type == b.item_type {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else {
            if a.item_type == "directory" { std::cmp::Ordering::Less } else { std::cmp::Ordering::Greater }
        }
    });

    let new_path = path_parts.join("\\");
    Ok((new_path, items, !drive.is_empty(), drive.clone()))
}