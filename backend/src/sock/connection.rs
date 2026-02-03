use std::ops::ControlFlow;

use axum::extract::ws::{Message, WebSocket};
use tokio::sync::mpsc;
use tracing::{Level, span};
use uuid::Uuid;

use crate::{
    sock::{inbox::MessageType, messages::SocketMessageType},
    state::{AppState, messages::AppMessage},
};

/// Enum that describes what the event state machine should do
enum FrontendActions {
    // Updates the frontend with the given data
    Update(SocketMessageType),
    ExternalUpdate(AppMessage),
}

pub(super) struct WebsocketConnection {
    /// The message inbox of the device. is used to send data to the client
    pub(super) inbox: mpsc::Receiver<AppMessage>,
    pub id: Uuid,
}

impl WebsocketConnection {
    pub(super) async fn upgrade(mut socket: WebSocket, mut conn: Self, state: AppState, _id: Uuid) {
        // ping

        let span = span!(Level::INFO, "websocket client loop");
        let _enter = span.enter();

        if socket
            .send(axum::extract::ws::Message::Ping(
                axum::body::Bytes::from_static(&[4, 2, 0]),
            ))
            .await
            .is_ok()
        {
            //ping successful
            println!("ping successful");

            // send connection details (connection id, program change id etc)
            loop {
                //let mut socket_lock = socket.lock().await;
                let next_action = tokio::select! {
                    Some(aux) = conn.inbox.recv() => { conn.process_inbox_message(aux, &state) }
                    Some(Ok(m)) = socket.recv() => { conn.process_socket_message(m, &state) }
                };

                match next_action {
                    ControlFlow::Continue(Some(m)) => {
                        match m {
                            FrontendActions::Update(app_message) => {
                                println!(
                                    "pushing frontend update to client {}: {:?}",
                                    conn.id, app_message
                                );

                                let d = serde_json::to_string(&app_message).expect("error while serializing the app message update");

                                if let Err(e) = socket.send(d.into()).await {
                                    eprintln!("error while pushing update: {e}")
                                }

                                // distribute message to all the other peers
                                let mut responder = state.responder.lock().await;
                                responder
                                    .send_message(MessageType::Broadcast {
                                        from: Some(conn.id),
                                        data: app_message.into(),
                                    })
                                    .await;
                                drop(responder)
                            }
                            FrontendActions::ExternalUpdate(app_message) => {
                                // Only send to the frontend
                                if let Err(e) = socket.send(app_message.into()).await {
                                    eprintln!("error while pushing update: {e}")
                                }
                            }
                        }
                        continue;
                    }
                    ControlFlow::Break(_) => break,
                    _ => {
                        // we shouldn't send something back to the frontend, so we just loop back
                        continue;
                    }
                }
            }
        } else {
            eprintln!("error while sending client ping");
            return;
        }

        // connection teardown
        //state.clientsnew.remove(&conn.id);
        let mut responder = state.responder.lock().await;
        responder.remove_client(conn.id);
    }

    /// processes messages sent from the internals
    /// also from other peers
    fn process_inbox_message(
        &self,
        msg: AppMessage,
        _state: &AppState,
    ) -> ControlFlow<(), Option<FrontendActions>> {
        ControlFlow::Continue(Some(FrontendActions::ExternalUpdate(msg)))
    }

    /// processes messages sent from the frontend
    fn process_socket_message(
        &self,
        msg: Message,
        _state: &AppState,
    ) -> ControlFlow<(), Option<FrontendActions>> {
        match msg {
            Message::Text(utf8_bytes) => {
                // frontend sent a JSON message likely
                if let Ok(j) = serde_json::from_slice::<SocketMessageType>(utf8_bytes.as_bytes()) {

                    //let event: SocketMessageType = utf8_bytes.into();
                    ControlFlow::Continue(Some(FrontendActions::Update(j)))
                } else {
                    ControlFlow::Break(())
                }
            }
            Message::Binary(_bytes) => todo!(),
            Message::Ping(_bytes) => todo!(),
            Message::Pong(bytes) => {
                println!("got client pong {:?}", bytes);
                ControlFlow::Continue(None)
            }
            Message::Close(_close_frame) => ControlFlow::Break(()),
        }
    }

    /*async fn process_virtual_midi_input(&self, socket: Arc<WebSocket>, msg: AppMessage) {

    }*/

    /*async fn send_message_to_client(mut socket: WebSocket, msg: AppMessage) {
        if let Err(e) = socket.send(msg.into()).await {
            eprintln!("error while pushing program change: {e}")
        }
    }*/
}
