use std::{
    collections::VecDeque,
    ffi::{CStr, CString, c_char},
    sync::{
        Mutex,
        mpsc::{Receiver, Sender, channel},
    },
    thread,
    time::Duration,
};

use once_cell::sync::Lazy;

use crate::midi::{messages::MidiMessage, system::MidiSystem};

mod midi;

static OUTPUT_CHANNEL: Lazy<Mutex<Option<Receiver<Vec<u8>>>>> = Lazy::new(|| Mutex::new(None));
static INPUT_CHANNEL: Lazy<Mutex<Option<Sender<Vec<u8>>>>> = Lazy::new(|| Mutex::new(None));

static CLOSE_CHANNEL: Lazy<Mutex<Option<Sender<()>>>> = Lazy::new(|| Mutex::new(None));

#[unsafe(no_mangle)]
pub extern "C" fn start_driver(use_virtual: bool) {
    //let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
    let (tx_ingress, rx_ingress) = channel::<Vec<u8>>();
    let (tx_egress, rx_egress) = channel::<Vec<u8>>();
    *OUTPUT_CHANNEL.lock().unwrap() = Some(rx_ingress);
    *INPUT_CHANNEL.lock().unwrap() = Some(tx_egress);

    let (tx_close, rx_close) = channel();
    *CLOSE_CHANNEL.lock().unwrap() = Some(tx_close);

    thread::spawn(move || {
        //let mut counter = 0;
        let _system =
            MidiSystem::new(Some("test device".to_string()), use_virtual, tx_ingress, rx_egress).unwrap();
        loop {
            // await death here
            if let Ok(s) = rx_close.recv() {
                println!("awaited death");
                break;
            }
        }
    });
}
#[unsafe(no_mangle)]
pub extern "C" fn poll_event() -> *const c_char {
    let mut guard = OUTPUT_CHANNEL.lock().unwrap();

    if let Some(rx) = guard.as_mut() {
        match rx.try_recv() {
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
pub extern "C" fn poll_bytes(ptr: *mut u8, len: usize) -> usize {
    let mut guard = OUTPUT_CHANNEL.lock().unwrap();
    if let Some(rx) = guard.as_mut() {
        match rx.try_recv() {
            Ok(bytes) => {
                //let as_string = serde_json::to_string(&msg).unwrap();

                //return std::ffi::CString::new(as_string).unwrap().into_raw();
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
pub extern "C" fn send_midi(ptr: *const std::os::raw::c_char) {
    if ptr.is_null() {
        return;
    }

    let cstr = unsafe { CStr::from_ptr(ptr) };
    let json = cstr.to_str().unwrap(); // now you have the JSON string

    if let Ok(msg) = serde_json::from_str::<MidiMessage>(json) {
        // sende in den Output-Thread
        let v: Vec<u8> = msg.into();
        if let Some(tx) = &*INPUT_CHANNEL.lock().unwrap() {
            println!("EVENT FROM DENO: {:?}", msg);
            let _ = tx.send(v);
        }
    }
}
#[unsafe(no_mangle)]
pub extern "C" fn stop_driver() {
    if let Some(tx) = &*CLOSE_CHANNEL.lock().unwrap() {
        tx.send(()).unwrap();
    }

    *OUTPUT_CHANNEL.lock().unwrap() = None;
    *INPUT_CHANNEL.lock().unwrap() = None;
}

#[unsafe(no_mangle)]
pub extern "C" fn convert_bytes(ptr: *const u8, len: usize) -> *mut c_char {
    // Sicherstellen, dass Pointer gültig ist
    let slice = unsafe { std::slice::from_raw_parts(ptr, len) };

    let v = Vec::from(slice);

    // Dummy Verarbeitung
    
    let resp: MidiMessage = v.into();
    
    // convert
    let json = serde_json::to_string(&resp).unwrap();
    //println!("{:?}", json);
    let c_str = CString::new(json).unwrap();

    // Pointer zurückgeben (Deno muss frei machen!)
    c_str.into_raw()
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
