use std::{ops::ControlFlow, sync::Arc};

use axum::extract::ws::Message;
use dashmap::DashMap;
use tokio::sync::{
    Mutex, broadcast,
    mpsc::{self, error::SendError},
};
use uuid::Uuid;

use crate::{midi::system::MidiSystem, sock::refactor::Websock};

#[derive(Debug, Clone, Copy)]
enum StateRequest {
    Event { from: Uuid, data: StateEvents },
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum StateEvents {
    CCData {},
    NoteData {},
}

#[derive(Debug, Clone, PartialEq)]
pub enum StateResponse {
    Broadcast { from: Uuid, data: StateEvents },
}

impl From<StateEvents> for Message {
    fn from(value: StateEvents) -> Self {
        //Message::text(serde_json::to_string(&value).unwrap())
        todo!()
    }
}

#[derive(Clone)]
pub struct CoreState {
    //clients: Arc<DashMap<Uuid, Arc<Mutex<StateResponse>>>
    //midi: MidiSystem,
    pub websock: Websock,
    input_channel: Arc<Mutex<mpsc::Sender<StateRequest>>>,
    output_channel: Arc<broadcast::Receiver<StateResponse>>,
    //global_sender: Arc<broadcast::Sender<StateResponse>>,
}

impl CoreState {
    pub fn new(name: Option<String>, use_virtual: bool) -> Self {
        let (input_channel, input_channel_reader) = mpsc::channel(32);
        let (output_channel_sender, output_channel) = broadcast::channel(32);
        //let (global_sender, global_receiver) = broadcast::channel(32);

        tokio::spawn(async move {
            task(input_channel_reader, output_channel_sender).await;
        });

        Self {
            websock: Websock::new(output_channel.resubscribe()),
            input_channel: Arc::new(Mutex::new(input_channel)),
            output_channel: Arc::new(output_channel),
            //midi: MidiSystem::new(name, use_virtual)
        }
    }

    /// sends requests to the state
    async fn send_request(&self, req: StateRequest) -> Result<(), SendError<StateRequest>> {
        let lock = self.input_channel.lock().await;
        lock.send(req).await
    }

    /// used to get a new receiver for the core receiver
    pub fn subscribe(&self) -> broadcast::Receiver<StateResponse> {
        self.output_channel.resubscribe()
    }
}

fn process_input_message(msg: StateRequest) -> ControlFlow<(), StateResponse> {
    match msg {
        StateRequest::Event { from, data } => match data {
            StateEvents::CCData {  } => ControlFlow::Continue(StateResponse::Broadcast { from, data }),
            StateEvents::NoteData {  } => ControlFlow::Continue(StateResponse::Broadcast { from, data }),
        }
    }
}

async fn task(
    mut reader: mpsc::Receiver<StateRequest>,
    output_reader: broadcast::Sender<StateResponse>,
) {
    loop {
        if let Some(msg) = reader.recv().await {
            tracing::info!("got request: {:?}", msg);

            let next_action = process_input_message(msg);

            if next_action.is_continue() {
                if let Some(value) = next_action.continue_value() {
                    tracing::info!("processed to response: {:?}", value);

                    output_reader.send(value).unwrap();
                    continue;
                } else {
                    tracing::info!("got none from processing, exiting");
                    break;
                }
            }
        } else {
            tracing::info!("got none value from reader, exit");
            break;
        }
    }
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::state::refactor::{CoreState, StateEvents, StateResponse};

    /// This state tests if a message that gets processed gets processed to a broadcast event.
    /// this should ensure that the server forwards gotten midi messages 
    #[tokio::test]
    async fn test_runtime() {
        let state = CoreState::new(Some(String::from("test")), false);
        let mut recv = state.subscribe();

        let data = StateEvents::CCData {};

        state.send_request(crate::state::refactor::StateRequest::Event {
            from: Uuid::nil(),
            data: data.clone(),
        }).await.unwrap();
        /*state
        .send_request(crate::state::refactor::StateRequest::NoteData { from: Uuid::nil() })
        .await
        .unwrap();*/

        let r = recv.recv().await.unwrap();
        assert_eq!(
            r,
            StateResponse::Broadcast { from: Uuid::nil(), data: data }
        );
    }
}
