use tauri_plugin_shell::ShellExt;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Obtiene el handle de la aplicación
            let handle = app.handle();
            
            // Configura el comando de "sidecar" llamado "service"
            let sidecar_command = handle.shell().sidecar("service").unwrap();
            
            // Ejecuta el comando de "sidecar"
            sidecar_command.spawn().expect("Failed to spawn sidecar");
            
            // Indica que la configuración se completó correctamente
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}