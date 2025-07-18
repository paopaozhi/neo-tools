mod serial_manager;

use tauri::generate_handler;

#[tauri::command]
fn serial_list() -> Vec<String> {
    let mut ll = Vec::new();

    let ports = serialport::available_ports().expect("无法获取串口列表");
    for port in ports {
        ll.push(port.port_name);
    }

    return ll;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![
            serial_list,
            serial_manager::open_port,
            serial_manager::close_port,
            serial_manager::write_serial,
            serial_manager::start_serial_listener,
            serial_manager::stop_serial_listener,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
