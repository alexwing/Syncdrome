use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use tauri::command;
use std::sync::{LazyLock, Mutex};
use crate::config::load_config;
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    // Live filesystem metadata: only present when the drive is connected.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub size: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modified: Option<u64>,
    // Direct children count from the catalog tree: works offline too.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub items: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
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

static FILE_SYSTEM: LazyLock<Mutex<Node>> = LazyLock::new(|| Mutex::new(Node::default()));
static DRIVE_LETTER: LazyLock<Mutex<String>> = LazyLock::new(|| Mutex::new(String::new()));
static RE_DRIVE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^[A-Za-z]:\\").unwrap());

fn build_file_system(contents: &str) -> Node {
    println!("DEBUG: build_file_system - lines total: {}", contents.lines().count());
    let mut root = Node::default();
    
    for line in contents.lines() {
        let line = line.trim().replace(|c: char| c.is_ascii_control(), "");
        // Los catálogos nuevos marcan las carpetas con "\" final; así una
        // carpeta vacía (o filtrada) no se confunde con un archivo.
        let is_explicit_dir = line.ends_with('\\');
        let without_drive = RE_DRIVE.replace(&line, "");
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

            if !is_last || is_explicit_dir {
                // Si no es el último elemento, o la línea está marcada como
                // carpeta, es un directorio
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

    // Resolver la letra de unidad si el volumen está conectado ahora mismo,
    // para poder devolver metadatos en vivo (tamaño/fecha) y previsualizar.
    let volume = if filename.to_lowercase().ends_with(".txt") {
        filename[..filename.len() - 4].to_string()
    } else {
        filename.clone()
    };
    let mut letter = String::new();
    for l in 'A'..='Z' {
        let dl = format!("{}:", l);
        let name = crate::utils::get_volume_name(&dl);
        if !name.is_empty() && name.eq_ignore_ascii_case(&volume) {
            letter = dl;
            break;
        }
    }
    println!("DEBUG: change_file_system - drive letter: '{}'", letter);
    *DRIVE_LETTER.lock().unwrap() = letter;
    Ok(())
}

#[command]
pub fn navigate(
    app: tauri::AppHandle,
    current_path: String,
    command: String,
) -> Result<NavigateResult, String> {
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
            size: None,
            modified: None,
            items: if v.is_file { None } else { Some(v.children.len()) },
        })
        .collect();

    // Con la unidad conectada, completar con metadatos reales del sistema de
    // archivos (corrigiendo el tipo: los catálogos antiguos marcan como archivo
    // las carpetas vacías) y autorizar la carpeta en el asset protocol.
    if !drive.is_empty() {
        let base = if path_parts.is_empty() {
            format!("{}\\", drive.trim_end_matches('\\'))
        } else {
            format!("{}\\{}", drive.trim_end_matches('\\'), path_parts.join("\\"))
        };
        for item in items.iter_mut() {
            let full = format!("{}\\{}", base.trim_end_matches('\\'), item.name);
            if let Ok(md) = std::fs::metadata(&full) {
                if md.is_dir() && item.kind == "file" {
                    item.kind = "directory".to_string();
                    item.items = None;
                }
                if md.is_file() {
                    item.size = Some(md.len());
                }
                if let Ok(t) = md.modified() {
                    if let Ok(d) = t.duration_since(std::time::UNIX_EPOCH) {
                        item.modified = Some(d.as_millis() as u64);
                    }
                }
            }
        }
        use tauri::Manager;
        let _ = app
            .asset_protocol_scope()
            .allow_directory(std::path::Path::new(&base), false);
    }

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

#[derive(Debug, Serialize)]
pub struct TextPreview {
    pub content: String,
    pub truncated: bool,
}

/// Lee el comienzo de un archivo de texto (markdown, código, txt...) para la
/// vista previa del explorador. Limitado a 256 KB para no cargar archivos enormes.
#[command]
pub fn read_text_preview(path: String) -> Result<TextPreview, String> {
    const MAX_BYTES: u64 = 256 * 1024;
    let md = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    if !md.is_file() {
        return Err("No es un archivo".to_string());
    }
    use std::io::Read;
    let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let mut buf = Vec::new();
    file.take(MAX_BYTES)
        .read_to_end(&mut buf)
        .map_err(|e| e.to_string())?;
    Ok(TextPreview {
        content: String::from_utf8_lossy(&buf).to_string(),
        truncated: md.len() > MAX_BYTES,
    })
}