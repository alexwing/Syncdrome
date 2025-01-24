use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use tauri::command;
use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::config::load_config;
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NavigateResult {
    pub currentPath: String,
    pub directoryContents: Vec<FileItem>,
    pub isConnected: bool,
    pub driveLetter: Option<String>,
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
    println!("DEBUG: build_file_system - lines total: {}", contents.lines().count());
    let mut root = Node::default();
    
    for line in contents.lines() {
        let line = line.trim().replace(|c: char| c.is_ascii_control(), "");
        // Quitar [X]:\ al inicio
        let without_drive = Regex::new(r"^[A-Za-z]:\\").unwrap()
            .replace(&line, "");
        let parts: Vec<_> = without_drive.split('\\')
            .filter(|p| !p.is_empty())
            .collect();

        // Construir árbol - si una ruta tiene partes después, es un directorio
        let mut current = &mut root;
        for (i, part) in parts.iter().enumerate() {
            let is_last = i == parts.len() - 1;
            let node = current.children.entry(part.to_string())
                .or_insert_with(|| Node {
                    children: HashMap::new(),
                    is_file: true, // Por defecto asumimos archivo
                });
            
            if !is_last {
                // Si no es el último elemento, debe ser un directorio
                node.is_file = false;
            }
            current = node;
        }
    }
    
    println!("DEBUG: Tree built. Root children: {:?}", root.children.keys());
    root
}

#[command]
pub fn change_file_system(filename: String) -> Result<(), String> {
    println!("DEBUG: change_file_system - received filename: {}", filename);
    let config = load_config().map_err(|e| e.to_string())?;
    let config_folder = config.folder;

    let file_with_extension = if filename.to_lowercase().ends_with(".txt") {
        format!("{}\\{}", config_folder, filename)
    } else {
        format!("{}\\{}.txt", config_folder, filename)
    };

    println!("DEBUG: final file_with_extension: {}", file_with_extension);

    // Leer archivo y construir estructura
    let data = std::fs::read_to_string(&file_with_extension)
        .map_err(|e| format!("Error leyendo archivo: {}", e))?;
    let new_fs = build_file_system(&data);

    let mut fs_data = FILE_SYSTEM.lock().unwrap();
    *fs_data = new_fs;
    Ok(())
}

#[command]
pub fn navigate(current_path: String, command: String) -> Result<NavigateResult, String> {
    println!("DEBUG: navigate - current_path: {}, command: {}", current_path, command);
    let drive = DRIVE_LETTER.lock().unwrap();

    // Limpiar el path actual (quitar \ inicial si existe y filtrar partes vacías)
    let mut path_parts: Vec<_> = current_path
        .trim_start_matches('\\')
        .split('\\')
        .filter(|p| !p.is_empty())
        .map(|s| s.to_string())
        .collect();

    println!("DEBUG: path_parts antes del comando: {:?}", path_parts);

    match command.as_str() {
        c if c == "cd .." => {
            if !path_parts.is_empty() { path_parts.pop(); }
        },
        c if c == "cd" => {
            // No limpiar path_parts si ya tenemos una ruta
            if path_parts.is_empty() {
                // Solo limpiar si estamos en la raíz
                path_parts.clear();
            }
        },
        c if c.starts_with("cd ") => {
            let target = c.trim_start_matches("cd ").trim();
            if !target.is_empty() {
                path_parts.push(target.to_string());
            }
        },
        _ => return Err("Comando inválido".to_owned()),
    }

    println!("DEBUG: path_parts después del comando: {:?}", path_parts);

    let fs_data = FILE_SYSTEM.lock().unwrap();
    let mut current_node = &*fs_data;

    // Navegar por el árbol con las partes del path
    for part in &path_parts {
        match current_node.children.get(part) {
            Some(next_node) => current_node = next_node,
            None => return Err(format!("Ruta inválida: {}", part)),
        }
    }

    let mut items: Vec<FileItem> = current_node.children.iter()
        .map(|(k, v)| FileItem {
            name: k.clone(),
            kind: if v.is_file { "file".to_string() } else { "directory".to_string() },
        })
        .collect();

    // Ordenar: directorios primero
    items.sort_by(|a, b| {
        if a.kind == b.kind {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else {
            if a.kind == "directory" { std::cmp::Ordering::Less } else { std::cmp::Ordering::Greater }
        }
    });

    let new_path = if path_parts.is_empty() {
        "\\".to_string()
    } else {
        format!("\\{}", path_parts.join("\\"))
    };

    println!("DEBUG: new_path final: {}", new_path);

    let result = NavigateResult {
        currentPath: new_path,
        directoryContents: items,
        isConnected: !drive.is_empty(),
        driveLetter: if drive.is_empty() { None } else { Some(drive.clone()) },
    };
    Ok(result)
}