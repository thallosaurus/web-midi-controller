use std::sync::Arc;

use tokio::sync::{Mutex, mpsc};

use crate::{midi::{system::MidiSystem}, sock::inbox::{MessageResponder, SharedMessageResponder}};

pub mod messages;

#[derive(Clone)]
pub struct AppState {
    pub responder: SharedMessageResponder,
}

/// Initializes the channel and the midi system
pub fn state(name: Option<String>) -> AppState {
    // output sender
    let (global_tx, global_rx) = mpsc::channel(32);
    
    let responder = Arc::new(Mutex::new(MessageResponder::task(global_tx)));

    MidiSystem::new(name, responder.clone(), global_rx).expect("error while initializing midi system");

    tracing::info!("initialized midi system");
    AppState {
        responder,
    }
}

