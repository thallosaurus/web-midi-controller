use std::sync::Arc;

use tokio::sync::{Mutex, broadcast, mpsc::{self, error::SendError}};

use crate::{midi::system::MidiSystem, sock::inbox::{MessageResponder, MessageType, SharedMessageResponder}, state::messages::AppMessage};

#[derive(Clone)]
pub struct MidiHost {
    //system: MidiSystem,
    midi_input: Arc<Mutex<mpsc::Receiver<AppMessage>>>,
    midi_output: Arc<Mutex<mpsc::Sender<AppMessage>>>
}

impl MidiHost {
    pub fn new(name: Option<String>, responder: SharedMessageResponder) -> Self {
        let (midi_output_tx, midi_output_rx) = mpsc::channel::<AppMessage>(64);
        let (midi_input_tx, midi_input_rx) = mpsc::channel::<AppMessage>(64);

        MidiSystem::new(name, midi_output_rx, responder).expect("error while initializing midi system");
        Self {
            midi_input: Arc::new(Mutex::new(midi_input_rx)),
            midi_output: Arc::new(Mutex::new(midi_output_tx))
        }
    }

    pub async fn send(&self, data: AppMessage) -> Result<(), SendError<AppMessage>> {
        let lock = self.midi_output.lock().await;
        lock.send(data.into()).await
    }

    pub async fn recv(&mut self) -> Option<AppMessage> {
        //self.midi_input.recv().await
        let mut lock = self.midi_input.lock().await;
        lock.recv().await
    }
}