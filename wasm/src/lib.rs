use wasm_bindgen::prelude::*;
use c2pa::Reader;
use std::io::Cursor;

#[wasm_bindgen]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Process a file and return a C2PA report as JSON
#[wasm_bindgen]
pub fn process_file(file_bytes: &[u8], file_name: &str) -> Result<String, JsValue> {
    // Create a cursor for the file bytes
    let cursor = Cursor::new(file_bytes);

    // Create a reader from the stream
    let reader = Reader::from_stream(file_name, cursor)
        .map_err(|e| JsValue::from_str(&format!("Failed to read C2PA data: {}", e)))?;

    // Get the JSON representation
    let json = reader.json();

    Ok(json)
}

/// Get version information
#[wasm_bindgen]
pub fn get_version() -> String {
    format!("c2pa-wasm v{} using c2pa-rs {}",
            env!("CARGO_PKG_VERSION"),
            c2pa::VERSION)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        let version = get_version();
        assert!(version.contains("c2pa-wasm"));
    }
}
