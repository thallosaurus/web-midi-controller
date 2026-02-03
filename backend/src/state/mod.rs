use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::{Mutex, broadcast, mpsc};
use uuid::Uuid;

use crate::{midi::host::MidiHost, sock::inbox::{ClientsNew, MessageResponder, MessageType, SharedMessageResponder}, state::messages::AppMessage};

pub mod messages;

#[derive(Clone)]
pub struct AppState {
    //clients: Clients,
    //pub clientsnew: ClientsNew,
    //midi_socket_output: Arc<Mutex<mpsc::Sender<AppMessage>>>,
    //midi_socket_input: Arc<Mutex<broadcast::Receiver<AppMessage>>>,
    pub responder: SharedMessageResponder,

    pub midi_host: MidiHost,

    // holds the program change id associations
    //device_program_ids: Arc<DashMap<u8, Uuid>>,
//    system_messages: mpsc::Sender<MessageType<AppMessage>>
}

/// Initializes the channel and the midi system
pub fn state(name: Option<String>) -> AppState {
    // output sender
    //let (output_tx, output_rx) = mpsc::channel::<AppMessage>(64);
    //let (input_tx, input_rx) = broadcast::channel::<AppMessage>(64);

    //let (sys_tx, sys_rx) = mpsc::channel(32);
    let responder = Arc::new(Mutex::new(MessageResponder::task()));

    let midi_host = MidiHost::new(name, responder.clone());

    AppState {
        //clients: Arc::new(DashMap::new()),
        //clientsnew: Arc::new(DashMap::new()),
        responder,
        midi_host,
        //midi_socket_output: Arc::new(Mutex::new(output_tx)),
        //midi_socket_input: Arc::new(Mutex::new(input_rx)),
        //system_messages: sys_tx
        //device_program_ids: Arc::new(DashMap::new()),
    }
}

