use std::sync::Arc;

use tokio::sync::{Mutex, mpsc};
use tracing::{debug_span, info_span, instrument, span};

use crate::{
    inbox::inbox::{MessageResponder, SharedMessageResponder}, midi::system::MidiSystem
};

pub mod messages;

pub mod refactor;

#[derive(Clone, Debug)]
pub struct AppState {
    pub responder: SharedMessageResponder,
}

// Initializes the channel and the midi system
//#[instrument(name = "state")]
/*pub fn state(name: Option<String>, use_virtual: bool) -> AppState {
    let (global_tx, global_rx) = mpsc::channel(32);

    let responder = Arc::new(Mutex::new(MessageResponder::task(global_tx)));

    MidiSystem::new(name, use_virtual, responder.clone(), global_rx)
        .expect("error while initializing midi system");

    tracing::debug!("initialized midi system");
    AppState { responder }
}*/