use std::sync::Arc;

use axum::extract::ws::{Message, Utf8Bytes};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use tokio::sync::{Mutex, broadcast, mpsc};
use uuid::Uuid;

use crate::{Clients, midi::MidiSystem, sock::inbox::ClientsNew, state::messages::AppMessage};

pub mod messages;

#[derive(Clone)]
pub struct AppState {
    clients: Clients,
    pub clientsnew: ClientsNew,
    midi_socket_output: Arc<Mutex<mpsc::Sender<AppMessage>>>,
    midi_socket_input: Arc<Mutex<broadcast::Receiver<AppMessage>>>,

    // holds the program change id associations
    device_program_ids: Arc<DashMap<u8, Uuid>>,
}

/// Initializes the channel and the midi system
pub fn state(name: Option<String>) -> (AppState, MidiSystem) {
    // output sender
    let (output_tx, mut output_rx) = mpsc::channel::<AppMessage>(64);
    let (input_tx, mut input_rx) = broadcast::channel::<AppMessage>(64);


    (AppState {
        clients: Arc::new(DashMap::new()),
        clientsnew: Arc::new(DashMap::new()),
        midi_socket_output: Arc::new(Mutex::new(output_tx)),
        midi_socket_input: Arc::new(Mutex::new(input_rx)),
        device_program_ids: Arc::new(DashMap::new()),
    }, 
    MidiSystem::new(name, output_rx, input_tx).expect("error while initializing midi system"))
}

