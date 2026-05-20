use std::{
    collections::HashMap,
    ffi::{CStr, CString, c_char},
    sync::{
        Mutex,
        atomic::{AtomicU32, Ordering},
        mpsc::{Receiver, Sender, channel},
    },
    thread,
};

use once_cell::sync::Lazy;

use crate::{
    logging::init_tracing,
    midi::{default_list, messages::MidiMessage, system::MidiSystem},
};

mod logging;
mod midi;

//static OUTPUT_CHANNEL: Lazy<Mutex<Option<Receiver<Vec<u8>>>>> = Lazy::new(|| Mutex::new(None));
//static INPUT_CHANNEL: Lazy<Mutex<Option<Sender<Vec<u8>>>>> = Lazy::new(|| Mutex::new(None));

//static CLOSE_CHANNEL: Lazy<Mutex<Option<Sender<()>>>> = Lazy::new(|| Mutex::new(None));

struct DriverHandle {
    output_rx: Receiver<Vec<u8>>,
    input_tx: Sender<Vec<u8>>,
    close_tx: Sender<()>,
}

struct DriverHost {
    handles: HashMap<u32, DriverHandle>,
    nextId: AtomicU32,
}

impl DriverHost {
    fn new() -> Self {
        Self {
            handles: HashMap::new(),
            nextId: AtomicU32::new(1),
        }
    }
    fn add_driver(&mut self, input_name: String, output_name: String, use_virtual: bool) -> u32 {
        let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
        let (tx_egress, rx_egress) = channel::<Vec<u8>>();
        let (tx_close, rx_close) = channel();

        thread::spawn(move || {
            // Initialize MidiSystem
            let _system = MidiSystem::new(
                String::from(input_name),
                String::from(output_name),
                use_virtual,
                tx_ingress,
                rx_egress,
            )
            .unwrap();
            loop {
                // await death here
                if let Ok(_s) = rx_close.recv() {
                    println!("awaited death");
                    break;
                }
            }
        });

        let handle = DriverHandle {
            output_rx: rx_ingress,
            input_tx: tx_egress,
            close_tx: tx_close,
        };

        let id = self.nextId.fetch_add(1, Ordering::Relaxed);

        self.handles.insert(id, handle);

        id
    }
}

static DRIVERS: Lazy<Mutex<HashMap<u32, DriverHandle>>> = Lazy::new(|| Mutex::new(HashMap::new()));

static DRIVERHOST: Lazy<Mutex<DriverHost>> = Lazy::new(|| Mutex::new(DriverHost::new()));

static NEXT_ID: AtomicU32 = AtomicU32::new(1);

#[unsafe(no_mangle)]
pub extern "C" fn init_logging() {
    init_tracing();
}

#[unsafe(no_mangle)]
pub extern "C" fn start_driver(
    use_virtual: bool,
    input_name: *const c_char,
    output_name: *const c_char,
) -> u32 {
    //let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
    //init_tracing();
    let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
    let (tx_egress, rx_egress) = channel::<Vec<u8>>();
    let (tx_close, rx_close) = channel();

    // Convert Input Name to native type
    let in_cstr = unsafe { CStr::from_ptr(input_name) };
    let input_name = in_cstr.to_str().unwrap();

    // Convert Output Name to native type
    let out_cstr = unsafe { CStr::from_ptr(output_name) };
    let output_name = out_cstr.to_str().unwrap();

    thread::spawn(move || {
        // Initialize MidiSystem
        let _system = MidiSystem::new(
            String::from(input_name),
            String::from(output_name),
            use_virtual,
            tx_ingress,
            rx_egress,
        )
        .unwrap();
        loop {
            // await death here
            if let Ok(_s) = rx_close.recv() {
                println!("awaited death");
                break;
            }
        }
    });

    let handle = DriverHandle {
        output_rx: rx_ingress,
        input_tx: tx_egress,
        close_tx: tx_close,
    };

    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);

    DRIVERS.lock().unwrap().insert(id, handle);

    id
}

#[unsafe(no_mangle)]
pub extern "C" fn poll_event(handle: u32) -> *const c_char {
    //let mut guard = OUTPUT_CHANNEL.lock().unwrap();

    let ch = DRIVERS.lock().unwrap();

    if let Some(handle) = ch.get(&handle).as_mut() {
        match handle.output_rx.try_recv() {
            Ok(msg) => {
                let as_string = serde_json::to_string(&msg).unwrap();

                return std::ffi::CString::new(as_string).unwrap().into_raw();
            }
            Err(std::sync::mpsc::TryRecvError::Empty) => {}
            Err(_) => {}
        }
    }

    std::ptr::null()
}

#[unsafe(no_mangle)]
pub extern "C" fn poll_bytes(handle: u32, ptr: *mut u8, len: usize) -> usize {
    let ch = DRIVERS.lock().unwrap();
    if let Some(handle) = ch.get(&handle).as_mut() {
        match handle.output_rx.try_recv() {
            Ok(bytes) => {
                let copy_len = usize::min(len, bytes.len());

                if !ptr.is_null() {
                    unsafe {
                        std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, copy_len);
                    }
                }

                return copy_len;
            }
            Err(std::sync::mpsc::TryRecvError::Empty) => {}
            Err(_) => {}
        }
    }

    0
}

#[unsafe(no_mangle)]
pub extern "C" fn free_string(ptr: *const c_char) {
    if !ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(ptr as *mut c_char);
        }
    }
}
#[unsafe(no_mangle)]
pub extern "C" fn send_midi(handle: u32, ptr: *const std::os::raw::c_char) {
    if ptr.is_null() {
        return;
    }

    let cstr = unsafe { CStr::from_ptr(ptr) };
    let json = cstr.to_str().unwrap(); // now you have the JSON string

    if let Ok(msg) = serde_json::from_str::<MidiMessage>(json) {
        // sende in den Output-Thread
        let v: Vec<u8> = msg.into();
        tracing::trace!("{:?}", v);

        if let Some(tx) = DRIVERS.lock().unwrap().get(&handle) {
            //tracing::debug!("{:?}", msg);
            let _ = tx.input_tx.send(v);
        }
    }
}
#[unsafe(no_mangle)]
pub extern "C" fn stop_driver(handle: u32) {
    //if let Some(tx) = &*CLOSE_CHANNEL.lock().unwrap() {
    let mut lock = DRIVERS.lock().unwrap();

    if let Some(h) = lock.get(&handle) {
        //tracing::debug!("sending stop signal to driver");
        h.close_tx.send(()).unwrap();
    }

    lock.remove(&handle);
}

#[unsafe(no_mangle)]
pub extern "C" fn stop_all() {
    let lock = DRIVERS.lock().unwrap();
    let k: Vec<u32> = lock.keys().map(|e| *e).collect();
    drop(lock);
    k.iter().for_each(|e| stop_driver(*e));
}

#[unsafe(no_mangle)]
pub extern "C" fn convert_bytes(ptr: *const u8, len: usize) -> *mut c_char {
    // Sicherstellen, dass Pointer gültig ist
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    let v = Vec::from(slice);
    let resp: MidiMessage = v.into();
    tracing::trace!("converted {:?}", resp);

    // convert
    let json = serde_json::to_string(&resp).unwrap();
    //println!("{:?}", json);
    tracing::trace!("{}", json);
    let c_str = CString::new(json).unwrap();

    // Pointer zurückgeben (Deno muss frei machen!)
    c_str.into_raw()
}

#[unsafe(no_mangle)]
pub extern "C" fn list_devices() {
    let list = default_list().unwrap();

    println!("{:?}", list);
}

#[unsafe(no_mangle)]
pub extern "C" fn free_bytes(ptr: *const u8, len: usize) {
    if ptr.is_null() || len == 0 {
        return;
    }

    unsafe {
        // Pointer + Länge zurück in Box<[u8]> verwandeln, damit Rust es droppen kann
        let _ = Box::from_raw(std::slice::from_raw_parts_mut(ptr as *mut u8, len));
    }
}
