use std::ops::ControlFlow;

use axum::extract::ws::{Message, WebSocket};
use tokio::sync::mpsc;
use tracing::{Level, event, span};
use uuid::Uuid;

use crate::{AppState, socket::AppMessage};


enum NextAction {
    /// sends the containing message back to all clients except the sender
    Broadcast(AppMessage),

    /// Sends the containing message to someone
    Direct(AppMessage),
    Nothing,
    // sends the input to
    //MidiOutput
}

pub(super) struct WebsocketConnection {
    /// The message inbox of the device. is used to send data to the client
    pub(super) inbox: mpsc::Receiver<AppMessage>,
    pub id: Uuid,
}

impl WebsocketConnection {
    pub(super) async fn upgrade(mut socket: WebSocket, mut conn: Self, state: AppState) {
        // ping

        let span = span!(Level::INFO, "websocket client loop");
        let _enter = span.enter();

        if socket
            .send(axum::extract::ws::Message::Ping(axum::body::Bytes::from_static(&[
                4, 2, 0,
            ])))
            .await
            .is_ok()
        {
            //ping successful
            println!("ping successful");
            loop {
                //let mut socket_lock = socket.lock().await;
                let next_action = tokio::select! {
                    Some(aux) = conn.inbox.recv() => { conn.process_inbox_message(aux, &state) }
                    Some(Ok(m)) = socket.recv() => { conn.process_socket_message(m, &state) }
                };

                // we got a loop break, exit the loop
                if next_action.is_break() {
                    //event!(Level::INFO, "client disconnected");
                    break;
                } else {
                    match next_action.continue_value().unwrap() {
                        NextAction::Broadcast(msg) => {
                            //println!("client with id {conn_id} got msg {:?}", aux);
                        }
                        NextAction::Direct(msg) => {
                            if let Err(e) = socket.send(msg.into()).await {
                                eprintln!("error while pushing update: {e}")
                            }
                        },
                        NextAction::Nothing => continue
                    }
                }
            }
        } else {
            eprintln!("error while sending client ping");
            return;
        }

        // connection teardown
        state.clientsnew.remove(&conn.id);
    }

    /// processes messages sent from the internals
    /// also from other peers
    fn process_inbox_message(
        &self,
        msg: AppMessage,
        state: &AppState,
    ) -> ControlFlow<(), NextAction> {
        ControlFlow::Continue(NextAction::Nothing)
    }

    /// processes messages sent from the frontend
    fn process_socket_message(
        &self,
        msg: Message,
        state: &AppState,
    ) -> ControlFlow<(), NextAction> {
        match msg {
            Message::Text(utf8_bytes) => {
                // frontend sent a JSON message likely
                let event: AppMessage = utf8_bytes.into();
                println!("got message: {:?}", event);
                ControlFlow::Continue(NextAction::Broadcast(event))
            },
            Message::Binary(bytes) => todo!(),
            Message::Ping(bytes) => todo!(),
            Message::Pong(bytes) => ControlFlow::Continue(NextAction::Nothing),
            Message::Close(close_frame) =>ControlFlow::Break(()) 
        }
    }

    /*async fn process_virtual_midi_input(&self, socket: Arc<WebSocket>, msg: AppMessage) {

    }*/

    async fn send_message_to_client(mut socket: WebSocket, msg: AppMessage) {
        if let Err(e) = socket.send(msg.into()).await {
            eprintln!("error while pushing program change: {e}")
        }
    }
}
