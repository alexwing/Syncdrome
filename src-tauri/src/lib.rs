use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;
use tauri::Manager;
use std::process::Child; // Importa Child

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
            
            // Ejecuta el comando de "sidecar" con manejo de errores
            match sidecar_command.spawn() {
                Ok((_, child)) => {
                    // Almacena el proceso del sidecar en el estado de la aplicación
                    app.manage(Mutex::new(Some(child)));
                }
                Err(e) => {
                    eprintln!("Failed to spawn sidecar: {}", e);
                }
            }
            
            // Indica que la configuración se completó correctamente
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
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}