use std::{
    ffi::CString,
    fs, io,
    path::{Path, PathBuf},
    time::Duration,
};
use windows::core::PCSTR;

use windows::Win32::{
    Foundation::HWND,
    UI::{Shell::ShellExecuteA, WindowsAndMessaging::SW_HIDE},
};
static GAME_PROCESSES: &[&str] = &[
    "EpicgamesLauncher.exe",
    "FortniteLauncher.exe",
    "FortniteClient-Win64-Shipping.exe",
    "EasyAntiCheat_EOS.exe",
    "EpicWebHelper.exe",
    "FortniteClient-Win64-Shipping_BE.exe",
    "FortniteClient-Win64-Shipping_EAC.exe",
];

pub fn kill_all_procs() -> Result<(), String> {
    let batch_path = std::env::temp_dir().join("close.bat");

    let mut batch_content = String::with_capacity(256);
    batch_content.push_str("@echo off\n");
    
    for proc in GAME_PROCESSES {
        batch_content.push_str(&format!("taskkill /F /IM \"{}\" >nul 2>&1\n", proc));
    }
    batch_content.push_str("del \"%~f0\"\n");

    fs::write(&batch_path, batch_content)
        .map_err(|e| format!("Failed to create batch file: {}", e))?;

    let path_str = batch_path
        .to_str()
        .ok_or("Failed to convert batch path to string")?;
    let path_cstr = CString::new(path_str).map_err(|e| format!("CString error: {}", e))?;

    let hwnd = HWND(std::ptr::null_mut());

    let result = unsafe {
        ShellExecuteA(
            Some(hwnd),
            PCSTR(b"runas\0".as_ptr()),
            PCSTR(path_cstr.as_ptr() as *const u8),
            PCSTR::null(),
            PCSTR::null(),
            SW_HIDE,
        )
    };

    if result.0 as isize <= 32 {
        return Err("Failed to launch batch file with elevated permissions".into());
    }

    Ok(())
}

pub fn handle_path(game_path: &Path) -> PathBuf {
    game_path
        .parent()
        .and_then(|p| p.parent())
        .unwrap_or(game_path)
        .join("Engine/Binaries/ThirdParty/NVIDIA/NVaftermath/Win64/GFSDK_Aftermath_Lib.x64.dll")
}

const REMOVE_RETRY_ATTEMPTS: u8 = 30;
const REMOVE_RETRY_DELAY: Duration = Duration::from_millis(100);

#[tauri::command]
pub fn remove_dll_sync(dll_path: &Path) -> Result<(), String> {
    let target_path = handle_path(dll_path);

    if !target_path.exists() {
        return Ok(());
    }

    for _ in 0..REMOVE_RETRY_ATTEMPTS {
        match fs::remove_file(&target_path) {
            Ok(()) => return Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(()),
            _ => std::thread::sleep(REMOVE_RETRY_DELAY),
        }
    }

    Err("Failed to remove DLL after multiple attempts".into())
}

const DOWNLOAD_TIMEOUT: Duration = Duration::from_secs(30);

#[tauri::command]
pub fn download_file(url: &str, dest: &Path) -> Result<(), String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(DOWNLOAD_TIMEOUT)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(url)
        .send()
        .map_err(|e| format!("Failed to download: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let content = response
        .bytes()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    fs::write(dest, content).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}
