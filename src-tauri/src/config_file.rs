use std::path::PathBuf;
use dirs::home_dir;

pub fn get_default_config_json() -> String {
    println!("Obteniendo el directorio home");
    let home = home_dir().unwrap_or_else(|| {
        println!("No se pudo obtener el directorio home, usando C:\\ como predeterminado");
        PathBuf::from("C:\\")
    });
    
    println!("Uniendo el directorio home con .syncdrome");
    let folder = home.join(".syncdrome");
    let folder_str = folder.display().to_string().replace("\\", "\\\\");
    
    println!("Formateando la configuración JSON");
    format!(r#"
    {{
      "folder": "{}",
      "node_env": "development",
      "extensions": {{
        "3d": {{
          "color": "blue",
          "extensions": [
            "stl",
            "obj",
            "fbx",
            "blend",
            "ply",
            "3mf"
          ],
          "icon": "Badge3dFill",
          "media": []
        }},
        "audio": {{
          "color": "green",
          "extensions": [
            "mp3",
            "wav",
            "wma",
            "mpa",
            "aif",
            "iff",
            "m3u",
            "m4a"
          ],
          "icon": "FileEarmarkMusicFill",
          "media": [
            "mp3",
            "wav",
            "wma"
          ]
        }},
        "book": {{
          "color": "blue",
          "extensions": [
            "pdf",
            "epub",
            "mobi",
            "azw",
            "azw3"
          ],
          "icon": "Book",
          "media": [
            "pdf",
            "epub",
            "mobi",
            "azw",
            "azw3"
          ]
        }},
        "cad": {{
          "color": "blue",
          "extensions": [
            "dwg",
            "dxf",
            "dws",
            "dwt"
          ],
          "icon": "Badge3d",
          "media": []
        }},
        "code": {{
          "color": "blue",
          "extensions": [
            "ini",
            "conf",
            "cfg",
            "config",
            "properties",
            "vue",
            "ts",
            "js",
            "java"
          ],
          "icon": "FileEarmarkCodeFill",
          "media": []
        }},
        "compressed": {{
          "color": "blue",
          "extensions": [
            "zip",
            "rar",
            "7z",
            "tar",
            "gz",
            "dmg",
            "iso",
            "xz",
            "pkg",
            "deb",
            "rpm",
            "tgz"
          ],
          "icon": "FileEarmarkZipFill",
          "media": []
        }},
        "database": {{
          "color": "blue",
          "extensions": [
            "db",
            "sql",
            "dbf",
            "mdb",
            "accdb",
            "dbx",
            "pdb",
            "pst",
            "sqlite",
            "sqlite3"
          ],
          "icon": "Database",
          "media": []
        }},
        "default": {{
          "color": "black",
          "extensions": [],
          "icon": "File",
          "media": []
        }},
        "document": {{
          "color": "black",
          "extensions": [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "txt",
            "odt",
            "ods",
            "md"
          ],
          "icon": "File",
          "media": [
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "txt",
            "odt",
            "ods",
            "doc"
          ]
        }},
        "executable": {{
          "color": "blue",
          "extensions": [
            "exe",
            "msi",
            "apk",
            "app",
            "bat",
            "jar"
          ],
          "icon": "FiletypeExe",
          "media": []
        }},
        "font": {{
          "color": "blue",
          "extensions": [
            "ttf",
            "otf",
            "woff",
            "woff2",
            "eot",
            "suit",
            "fnt",
            "odttf",
            "ttc"
          ],
          "icon": "FileEarmarkFontFill",
          "media": []
        }},
        "image": {{
          "color": "pink",
          "extensions": [
            "jpg",
            "jpeg",
            "bmp",
            "ico",
            "tif",
            "tiff",
            "arw",
            "raw",
            "psd",
            "png",
            "gif",
            "ps",
            "xcf"
          ],
          "icon": "FileImageFill",
          "media": [
            "jpg",
            "jpeg",
            "bmp",
            "tif",
            "tiff",
            "png",
            "gif",
            "psd",
            "arw",
            "raw"
          ]
        }},
        "presentation": {{
          "color": "red",
          "extensions": [
            "key",
            "odp",
            "pps",
            "ppt",
            "pptx"
          ],
          "icon": "FileEarmarkSlidesFill",
          "media": [
            "pps",
            "ppt",
            "pptx"
          ]
        }},
        "spreadsheet": {{
          "color": "blue",
          "extensions": [
            "csv",
            "json",
            "xml",
            "pst",
            "odt",
            "ods",
            "odp",
            "xls",
            "xlsx"
          ],
          "icon": "FileEarmarkSpreadsheetFill",
          "media": [
            "pdb",
            "dbx",
            "sql",
            "db",
            "accdb",
            "dbf"
          ]
        }},
        "vector": {{
          "color": "blue",
          "extensions": [
            "ai",
            "eps",
            "svg",
            "sketch",
            "cdr"
          ],
          "icon": "FiletypeAi",
          "media": [
            "eps",
            "svg",
            "cdr"
          ]
        }},
        "video": {{
          "color": "red",
          "extensions": [
            "flv",
            "mov",
            "mkv",
            "mp4",
            "avi",
            "wmv",
            "webm",
            "mpg",
            "mpeg",
            "3gp"
          ],
          "icon": "FileEarmarkPlayFill",
          "media": [
            "mov",
            "mkv",
            "mp4",
            "avi",
            "wmv",
            "webm",
            "mpg",
            "mpeg"
          ]
        }}
      }}
    }}
    "#, folder_str)
}
