use std::{fs, path::{Path, PathBuf}};
use rayon::prelude::*;

#[tauri::command]
pub async fn check_file_exists(path: &str) -> Result<bool, String> {
    Ok(Path::new(path).exists())
}

#[tauri::command]
pub fn locate_version(file_path: &str) -> Result<Vec<String>, String> {
    let file_contents = fs::read(file_path)
        .map_err(|error| format!("Failed to read file '{}': {}", file_path, error))?;

    const VERSION_SIGNATURE: &[u8] = &[
        0x2b, 0x00, 0x2b, 0x00, 0x46, 0x00, 0x6f, 0x00, 0x72, 0x00, 0x74, 0x00, 0x6e, 0x00, 0x69,
        0x00, 0x74, 0x00, 0x65, 0x00, 0x2b, 0x00,
    ];

    let mut version_strings = Vec::new();
    let signature_len = VERSION_SIGNATURE.len();

    for match_pos in find_pattern_positions(&file_contents, VERSION_SIGNATURE) {
        if let Some(version_text) = extract_version_string(&file_contents, match_pos, signature_len)
        {
            version_strings.push(version_text);
        }
    }

    Ok(version_strings)
}

#[tauri::command]
pub fn get_directory_size(path: String) -> Result<u64, String> {
    let path = PathBuf::from(path);
    
    if path.is_file() {
        return fs::metadata(&path)
            .map(|m| m.len())
            .map_err(|e| e.to_string());
    }
    
    if !path.is_dir() {
        return Ok(0);
    }

    let total_size = walkdir::WalkDir::new(&path)
        .into_iter()
        .par_bridge()
        .filter_map(|entry| entry.ok())
        .filter(|e| e.file_type().is_file())
        .map(|entry| {
            fs::metadata(entry.path())
                .map(|m| m.len())
                .unwrap_or(0)
        })
        .sum::<u64>();
    
    Ok(total_size)
}

fn find_pattern_positions(haystack: &[u8], needle: &[u8]) -> Vec<usize> {
    let needle_len = needle.len();
    if needle_len == 0 || haystack.len() < needle_len {
        return Vec::new();
    }

    haystack
        .par_windows(needle_len)
        .enumerate()
        .filter_map(|(idx, window)| {
            if window == needle {
                Some(idx)
            } else {
                None
            }
        })
        .collect()
}

fn extract_version_string(
    buffer: &[u8],
    pattern_start: usize,
    pattern_len: usize,
) -> Option<String> {
    const SEARCH_RANGE: usize = 64;

    let text_start = pattern_start;
    let search_end = (pattern_start + pattern_len + SEARCH_RANGE).min(buffer.len());

    let string_end = locate_string_terminator(&buffer[pattern_start + pattern_len..search_end])?;
    let total_length = pattern_len + string_end;

    if total_length % 2 != 0 {
        return None;
    }

    let utf16_data: Vec<u16> = buffer[text_start..text_start + total_length]
        .chunks_exact(2)
        .map(|chunk| u16::from_le_bytes([chunk[0], chunk[1]]))
        .collect();

    let decoded_string = String::from_utf16_lossy(&utf16_data);
    Some(decoded_string.trim_matches('\0').trim().to_string())
}

fn locate_string_terminator(data: &[u8]) -> Option<usize> {
    data.chunks_exact(2)
        .position(|chunk| chunk == [0x00, 0x00])
        .map(|pos| pos * 2)
        .or_else(|| Some(data.len().min(64)))
}
