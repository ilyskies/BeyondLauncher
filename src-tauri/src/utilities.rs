use std::io::Write;
use std::{
    ffi::CString,
    fs, io,
    path::{Path, PathBuf},
};
use windows::core::PCSTR;

use windows::Win32::{
    Foundation::HWND,
    UI::{Shell::ShellExecuteA, WindowsAndMessaging::SW_HIDE},
};
pub fn kill_all_procs() -> Result<(), String> {
    let fortnite_procs = [
        "EpicgamesLauncher.exe",
        "FortniteLauncher.exe",
        "FortniteClient-Win64-Shipping.exe",
        "EasyAntiCheat_EOS.exe",
        "EpicWebHelper.exe",
        "FortniteClient-Win64-Shipping_BE.exe",
        "FortniteClient-Win64-Shipping_EAC.exe",
    ];

    let batch_path = std::env::temp_dir().join("close.bat");

    let mut file = std::fs::File::create(&batch_path)
        .map_err(|e| format!("Failed to create batch file: {}", e))?;

    let mut write_line =
        |line: &str| writeln!(file, "{}", line).map_err(|e| format!("Write error: {}", e));

    write_line("@echo off")?;
    for proc in &fortnite_procs {
        write_line(&format!("taskkill /F /IM \"{}\" >nul 2>&1", proc))?;
    }
    write_line("del \"%~f0\"")?;
    drop(file);

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

#[tauri::command]
pub fn remove_dll_sync(dll_path: &Path) -> Result<(), String> {
    let target_path = handle_path(dll_path);

    for _ in 0..30 {
        match fs::remove_file(&target_path) {
            Ok(()) => return Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(()),
            _ => std::thread::sleep(std::time::Duration::from_millis(100)),
        }
    }

    Err("Failed to remove DLL after multiple attempts".into())
}

#[tauri::command]
pub fn download_file(url: &str, dest: &Path) -> Result<(), String> {
    let content = reqwest::blocking::get(url)
        .map_err(|e| format!("Failed to download: {}", e))?
        .bytes()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    fs::write(dest, content).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}
