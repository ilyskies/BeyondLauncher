use std::ffi::CString;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;
use winapi::um::processthreadsapi::GetProcessId;
use winapi::um::shellapi::{ShellExecuteExA, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOA};
use winapi::um::{handleapi::CloseHandle, winuser::SW_SHOW};
use sysinfo::{System, SystemExt, ProcessExt};

use crate::utilities;

const CREATE_NO_WINDOW: u32 = 0x08000000;
const CREATE_SUSPENDED: u32 = 0x00000004;
const GAME_DLL_URL: &str = "https://cdn.ilyskies.wtf/BeyondTesting/Tellurium.dll";
const STARTUP_DELAY: Duration = Duration::from_secs(2);

static GAME_PROCESSES: &[&str] = &[
    "EpicgamesLauncher.exe",
    "FortniteLauncher.exe",
    "FortniteClient-Win64-Shipping.exe",
    "EasyAntiCheat_EOS.exe",
    "EpicWebHelper.exe",
    "FortniteClient-Win64-Shipping_BE.exe",
    "FortniteClient-Win64-Shipping_EAC.exe",
];

#[tauri::command]
pub fn launch_game(file_path: String, exchange_code: String) -> Result<bool, String> {
    utilities::kill_all_procs().ok();

    let game_dir = get_game_directory(&file_path)?;
    let dll_path = utilities::handle_path(&game_dir);

    utilities::remove_dll_sync(&game_dir).ok();
    utilities::download_file(GAME_DLL_URL, &dll_path)
        .map_err(|e| format!("Failed to download game DLL: {}", e))?;

    if !dll_path.exists() {
        return Err("Failed to find Redirect".to_string());
    }

    let win64_dir = game_dir.join("Win64");
    let args = build_launch_args(&exchange_code);

    launch_elevated(&win64_dir.join("FortniteClient-Win64-Shipping.exe"), &args)?;
    std::thread::sleep(STARTUP_DELAY);

    let _ = spawn_suspended_process(
        &win64_dir.join("FortniteClient-Win64-Shipping_BE.exe"),
        &args,
    );
    let _ = spawn_suspended_process(&win64_dir.join("FortniteLauncher.exe"), &args);

    Ok(true)
}

#[tauri::command]
pub fn close_game() -> Result<(), String> {
    utilities::kill_all_procs().ok();
    Ok(())
}

#[tauri::command]
pub fn is_game_running() -> bool {
    let mut system = System::new_all();
    system.refresh_processes();

    system.processes().iter().any(|(_, process)| {
        let process_name = process.name();
        GAME_PROCESSES.iter().any(|&proc| proc == process_name)
    })
}

fn get_game_directory(file_path: &str) -> Result<PathBuf, String> {
    let path = Path::new(file_path);
    path.parent()
        .and_then(|p| p.parent())
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "Failed to get game directory".to_string())
}

fn build_launch_args(exchange_code: &str) -> Vec<String> {
    vec![
        "-epicapp=Fortnite".to_string(),
        "-epicenv=Prod".to_string(),
        "-epiclocale=en-us".to_string(),
        "-epicportal".to_string(),
        "-skippatchcheck".to_string(),
        "-nobe".to_string(),
        "-fromfl=eac".to_string(),
        "-fltoken=3db3ba5dcbd2e16703f3978d".to_string(),
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQ".to_string(),
        "-AUTH_LOGIN=unused".to_string(),
        format!("-AUTH_PASSWORD={}", exchange_code),
        "-AUTH_TYPE=exchangecode".to_string(),
    ]
}


fn launch_elevated(exe_path: &Path, args: &[String]) -> Result<(), String> {
    let exe_str = exe_path.to_str().ok_or("Invalid path to executable")?;
    let exe_cstring = CString::new(exe_str).map_err(|e| format!("CString error: {}", e))?;

    let args_str = args.join(" ");
    let args_cstring = CString::new(args_str).map_err(|e| format!("CString error: {}", e))?;

    let verb = CString::new("runas").map_err(|e| format!("CString error: {}", e))?;

    let mut sei: SHELLEXECUTEINFOA = unsafe { std::mem::zeroed() };
    sei.cbSize = std::mem::size_of::<SHELLEXECUTEINFOA>() as u32;
    sei.fMask = SEE_MASK_NOCLOSEPROCESS;
    sei.hwnd = std::ptr::null_mut();
    sei.lpVerb = verb.as_ptr();
    sei.lpFile = exe_cstring.as_ptr();
    sei.lpParameters = args_cstring.as_ptr();
    sei.nShow = SW_SHOW;

    let success = unsafe { ShellExecuteExA(&mut sei) };
    if success == 0 {
        return Err("ShellExecuteExA failed".to_string());
    }

    if sei.hProcess.is_null() {
        return Err("Failed to get process handle".to_string());
    }

    unsafe {
        GetProcessId(sei.hProcess);
        CloseHandle(sei.hProcess);
    }

    Ok(())
}

fn spawn_suspended_process(exe_path: &Path, args: &[String]) -> Result<(), String> {
    Command::new(exe_path)
        .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
        .args(args)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to spawn process: {}", e))?;

    Ok(())
}
