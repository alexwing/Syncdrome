pub mod config; 
pub mod sqlite;
pub mod bookmarks;
pub mod process;
pub mod utils;
pub mod config_file; 
pub mod file_cleaner;
pub mod search;
pub mod folder_sync;
pub mod volume_navigator; 

use config::{load_config, save_config};
use bookmarks::{get_bookmarks, add_bookmark, delete_bookmark};
use process::{execute_node, get_drives, delete_drive, update_drive};
use file_cleaner::{get_files_in_folder, rename_files_in_folder};
use folder_sync::{sync_folders, get_sync_log};
use volume_navigator::{allow_preview_dir, change_file_system, navigate, read_text_preview};
use tauri::command;

#[cfg(desktop)]
use tauri_plugin_shell::ShellExt;
#[cfg(desktop)]
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::Manager;
#[cfg(desktop)]
use std::process::Child;

#[command]
fn get_config() -> Result<config::Config, String> {
    println!("Attempting to load config.json...");
    let result = load_config();
    match &result {
        Ok(_) => println!("Config file loaded successfully."),
        Err(e) => eprintln!("Failed to load config file: {}", e),
    }
    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_shell::init())
            .setup(|app| {
                let handle = app.handle();
                if let Ok(sidecar_command) = handle.shell().sidecar("service") {
                    match sidecar_command.spawn() {
                        Ok((_, child)) => {
                            app.manage(Mutex::new(Some(child)));
                            println!("Sidecar process started successfully.");
                        }
                        Err(e) => {
                            eprintln!("Failed to spawn sidecar: {}", e);
                        }
                    }
                }
                Ok(())
            })
            .on_window_event(|window: &tauri::Window, event: &tauri::WindowEvent| { 
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let child = window.state::<Mutex<Option<Child>>>().lock().unwrap().take();
                    if let Some(mut child) = child {
                        if let Err(e) = child.kill() {
                            eprintln!("Failed to kill sidecar process: {}", e);
                        }
                    }
                }
            });
    }

    builder
        .invoke_handler(tauri::generate_handler![
            get_drives,
            execute_node,
            delete_drive,
            update_drive,
            get_bookmarks,
            add_bookmark,
            delete_bookmark,
            get_config,
            save_config, 
            get_files_in_folder,
            rename_files_in_folder,
            search::find_files,
            search::open_file_rust,
            search::open_folder_rust,
            sync_folders,
            get_sync_log,
            change_file_system,
            navigate,
            read_text_preview,
            allow_preview_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}