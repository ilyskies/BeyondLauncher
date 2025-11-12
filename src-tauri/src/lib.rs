use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            #[cfg(debug_assertions)]
            {
                app_handle.plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            std::thread::spawn(move || {
                // std::thread::sleep(std::time::Duration::from_secs(3));

                // if let Some(updater) = app_handle.get_webview_window("updater") {
                //     let _ = updater.close();
                // }

                // if let Some(launcher) = app_handle.get_webview_window("launcher") {
                //     let _ = launcher.show();
                // }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
