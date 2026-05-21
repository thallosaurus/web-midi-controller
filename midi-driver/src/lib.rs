use std::{
    collections::HashMap,
    ffi::{CStr, CString, c_char},
    io,
    sync::{
        Mutex,
        atomic::{AtomicU32, Ordering},
        mpsc::{Receiver, Sender, TryRecvError, channel},
    },
    thread::{self, JoinHandle},
};

use once_cell::sync::Lazy;
use tracing::{debug, error, info, trace};

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
    //_join_handle: JoinHandle<()>
}

impl DriverHandle {
    fn stop(&self) {
        self.close_tx.send(()).unwrap();
    }

    fn poll(&self) -> Result<Vec<u8>, TryRecvError> {
        Ok(self.output_rx.try_recv()?)
    }
}

struct DriverHost {
    handles: HashMap<u32, DriverHandle>,
    next_id: AtomicU32,
}

#[derive(Debug)]
enum DriverHostError {
    HandleNotFound(u32),
}

impl DriverHost {
    fn new() -> Self {
        Self {
            handles: HashMap::new(),
            next_id: AtomicU32::new(1),
        }
    }

    fn get_handle(&mut self, handle_id: u32) -> Result<&mut DriverHandle, DriverHostError> {
        match self.handles.get_mut(&handle_id) {
            Some(h) => Ok(h),
            None => Err(DriverHostError::HandleNotFound(handle_id)),
        }
    }

    fn add_driver(&mut self, input_name: String, output_name: String, use_virtual: bool) -> u32 {
        let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
        let (tx_egress, rx_egress) = channel::<Vec<u8>>();
        let (tx_close, rx_close) = channel();
        debug!("adding new driver");

        let _join_handle = thread::spawn(move || {
            // Initialize MidiSystem
            match MidiSystem::new(input_name, output_name, use_virtual, tx_ingress, rx_egress) {
                Ok(_) => loop {
                    // await death here
                    if let Ok(_s) = rx_close.recv() {
                        info!("exiting midi system");
                        break;
                    }
                },
                Err(e) => {
                    error!("add driver: {e}");
                    return;
                }
            }
        });

        let handle = DriverHandle {
            output_rx: rx_ingress,
            input_tx: tx_egress,
            close_tx: tx_close,
            //_join_handle
        };

        let id = self.next_id.fetch_add(1, Ordering::Relaxed);

        self.handles.insert(id, handle);

        id
    }

    fn remove_driver(&mut self, handle: u32) {
        let h = self.handles.get(&handle).unwrap();

        h.stop();
        self.handles.remove(&handle);
    }

    //fn sendToHandle(&self, handle: u32, data:)
}

/*static DRIVERS: Lazy<Mutex<HashMap<u32, DriverHandle>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});*/

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
    // Convert Input Name to native type
    let in_cstr = unsafe { CStr::from_ptr(input_name) };
    let input_name = in_cstr.to_str().unwrap();

    // Convert Output Name to native type
    let out_cstr = unsafe { CStr::from_ptr(output_name) };
    let output_name = out_cstr.to_str().unwrap();

    let mut host = DRIVERHOST.lock().unwrap();
    let id = host.add_driver(
        String::from(input_name),
        String::from(output_name),
        use_virtual,
    );
    tracing::debug!("{}", id);
    id
}

#[unsafe(no_mangle)]
pub extern "C" fn poll_bytes(handle: u32, ptr: *mut u8, len: usize) -> usize {
    //let ch = DRIVERS.lock().unwrap();
    let mut host = DRIVERHOST.lock().unwrap();
    let h = host.get_handle(handle).unwrap();

    match h.poll() {
        Ok(bytes) => {
            let copy_len = usize::min(len, bytes.len());
            trace!("copying {} bytes", copy_len);
            if !ptr.is_null() {
                unsafe {
                    std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, copy_len);
                }
            }

            return copy_len;
        }
        Err(e) => match e {
            TryRecvError::Empty => 0,
            TryRecvError::Disconnected => {
                info!("poll bytes: receiver disconnected");
                0
            }
        },
    }
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
        //tracing::debug!("send midi: {:?}", msg);
        let v: Vec<u8> = msg.into();
        tracing::debug!("send midi: {:?}", v);

        if let Some(tx) = DRIVERHOST.lock().unwrap().handles.get(&handle) {
            let _ = tx.input_tx.send(v);
        }
    }
}
#[unsafe(no_mangle)]
pub extern "C" fn stop_driver(handle: u32) {
    //if let Some(tx) = &*CLOSE_CHANNEL.lock().unwrap() {
    let mut lock = DRIVERHOST.lock().unwrap();
    lock.remove_driver(handle);
    drop(lock);
}

/*#[unsafe(no_mangle)]
pub extern "C" fn stop_all() {
    let lock = DRIVERS.lock().unwrap();
    let k: Vec<u32> = lock.keys().map(|e| *e).collect();
    drop(lock);
    k.iter().for_each(|e| stop_driver(*e));
}*/

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
