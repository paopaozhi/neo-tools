use once_cell::sync::Lazy;
use serde::Serialize;
use serialport::SerialPort;
use serialport::{available_ports, SerialPortType};
use std::io::{Read, Write};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

#[derive(Debug, serde::Deserialize)]
pub struct PortConfig {
    port: String,
    baud_rate: u32,
    data_bits: Option<u8>,
    stop_bits: Option<u8>,
    parity: Option<String>,
    timeout: Option<u64>,
}

#[derive(Serialize)]
struct PortName {
    name: String,
    port_type: String,
}

static GLOBAL_PORT: Lazy<Mutex<Option<Box<dyn SerialPort>>>> = Lazy::new(|| Mutex::new(None));
static LISTENER_RUNNING: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

// 扫描串口
#[tauri::command]
pub fn scan_ports() -> String {
    let mut com_ports: Vec<PortName> = Vec::new();
    match available_ports() {
        Ok(ports) => {
            for p in ports {
                let name = p.port_name;
                let port_type = match p.port_type {
                    SerialPortType::UsbPort(info) => {
                        if let Some(product) = info.product {
                            product
                        } else if let Some(manufacturer) = info.manufacturer {
                            manufacturer
                        } else {
                            "USB".to_string()
                        }
                    }
                    SerialPortType::BluetoothPort => "蓝牙".to_string(),
                    SerialPortType::PciPort => "PCI".to_string(),
                    SerialPortType::Unknown => "未知".to_string(),
                };
                // com_ports.push(format!("{} ({})", port_name, port_type));
                com_ports.push(PortName { name, port_type });
            }
        }
        Err(e) => {
            eprintln!("Error listing serial ports: {}", e);
        }
    }
    serde_json::to_string(&com_ports).unwrap_or_else(|_| "[]".to_string())
}

// 打开串口
#[tauri::command]
pub async fn open_port(config: PortConfig) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let mut port = match serialport::new(&config.port, config.baud_rate)
            .timeout(Duration::from_millis(config.timeout.unwrap_or(1)))
            .open()
        {
            Ok(p) => p,
            Err(e) => return Err(format!("打开串口失败: {}", e)),
        };
        port.flush().ok();
        let mut global = GLOBAL_PORT.lock().unwrap();
        *global = Some(port);
        println!("串口打开");
        Ok(())
    })
    .await
    .unwrap_or_else(|e| Err(format!("打开串口失败: {}", e)))
}

// 关闭串口
#[tauri::command]
pub async fn close_port() -> Result<(), String> {
    tokio::task::spawn_blocking(|| {
        let mut global = GLOBAL_PORT.lock().unwrap();
        if global.is_some() {
            *global = None; // 自动 drop 关闭串口
            println!("串口以关闭");
            Ok(())
        } else {
            Err("串口未打开".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(format!("关闭串口失败: {}", e)))
}

// 写入串口
#[tauri::command]
pub fn write_serial(data: Vec<u8>) -> Result<(), String> {
    let start = Instant::now(); // 记录起始时间

    let mut global = GLOBAL_PORT.lock().unwrap();
    let gg_time = start.elapsed();
    println!("获取锁时间: {:.2?}", gg_time);
    if let Some(port) = global.as_mut() {
        match port.write_all(&data) {
            Ok(_) => {
                let elapsed = start.elapsed();
                println!("程序运行时间: {:.2?}", elapsed);
                Ok(())
            }
            Err(e) => Err(format!("写入失败: {}", e)),
        }
    } else {
        Err("串口未打开".to_string())
    }
}

// 开始监听串口
#[tauri::command]
pub fn start_serial_listener(app: AppHandle) -> Result<(), String> {
    {
        let mut running = LISTENER_RUNNING.lock().unwrap();
        if *running {
            return Err("Listener already running.".to_string());
        }
        *running = true;
    } // 锁作用域明确，自动释放

    let app_handle = app.clone();
    thread::spawn(move || {
        let mut buffer = [0u8; 1024];

        loop {
            // 检查是否需要停止
            if !*LISTENER_RUNNING.lock().unwrap() {
                break;
            }

            let result = {
                let mut port_lock = GLOBAL_PORT.lock().unwrap();
                port_lock.as_mut().map(|port| port.read(&mut buffer))
            };

            match result {
                Some(Ok(n)) if n > 0 => {
                    if let Ok(data) = std::str::from_utf8(&buffer[..n]) {
                        let _ = app_handle.emit("serial-data", data.to_string());
                    } else {
                        eprintln!("Received non-UTF8 data");
                    }
                }
                Some(Err(ref e)) if e.kind() == std::io::ErrorKind::TimedOut => {
                    // 忽略超时，继续监听
                }
                Some(Err(e)) => {
                    eprintln!("Serial read error: {}", e);
                    let _ = app_handle.emit("serial-error", e.to_string());
                    let _ = close_port();

                    // 设置状态为 false
                    let mut running = LISTENER_RUNNING.lock().unwrap();
                    *running = false;
                    break;
                }
                None => {
                    // 串口未打开，结束监听
                    let mut running = LISTENER_RUNNING.lock().unwrap();
                    *running = false;
                    break;
                }
                _ => {}
            }

            // 小睡以避免忙等
            thread::sleep(Duration::from_millis(100));
        }

        // 退出线程时清理
        let mut port = GLOBAL_PORT.lock().unwrap();
        *port = None;
        let mut running = LISTENER_RUNNING.lock().unwrap();
        *running = false;
    });
    Ok(())
}

// 停止监听串口
#[tauri::command]
pub fn stop_serial_listener() {
    let mut running = LISTENER_RUNNING.lock().unwrap();
    *running = false;
}
