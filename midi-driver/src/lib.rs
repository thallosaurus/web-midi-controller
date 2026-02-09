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

static OUTPUT_CHANNEL: Lazy<Mutex<Option<Receiver<MidiMessage>>>> = Lazy::new(|| Mutex::new(None));
static INPUT_CHANNEL: Lazy<Mutex<Option<Sender<MidiMessage>>>> = Lazy::new(|| Mutex::new(None));

static CLOSE_CHANNEL: Lazy<Mutex<Option<Sender<()>>>> = Lazy::new(|| Mutex::new(None));

#[unsafe(no_mangle)]
pub extern "C" fn start_driver() {
    let (tx_ingress, rx_ingress) = channel::<MidiMessage>();
    let (tx_egress, rx_egress) = channel::<MidiMessage>();
    *OUTPUT_CHANNEL.lock().unwrap() = Some(rx_ingress);
    *INPUT_CHANNEL.lock().unwrap() = Some(tx_egress);

    let (tx_close, rx_close) = channel();
    *CLOSE_CHANNEL.lock().unwrap() = Some(tx_close);

    thread::spawn(move || {
        //let mut counter = 0;
        let system =
            MidiSystem::new(Some("test device".to_string()), true, tx_ingress, rx_egress).unwrap();
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
        if let Some(tx) = &*INPUT_CHANNEL.lock().unwrap() {
            println!("EVENT FROM DENO: {:?}", msg);
            let _ = tx.send(msg);
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
