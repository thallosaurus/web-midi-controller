use std::ops::ControlFlow;

use axum::extract::ws::{Message, WebSocket};
use tokio::sync::mpsc;
use tracing::{Level, span};
use uuid::Uuid;

use crate::{
    sock::{
        inbox::MessageType,
        messages::{ServerRequest, ServerResponse},
    },
    state::{AppState, messages::AppMessage},
};

/// Enum that describes what the event state machine should do
enum FrontendActions {
    // Updates the frontend with the given data
    Update(ServerResponse),
    ExternalUpdate(ServerResponse),
}

pub(super) struct WebsocketConnection {
    /// The message inbox of the device. is used to send data to the client
    pub(super) inbox: mpsc::Receiver<AppMessage>,
    pub id: Uuid,
}

impl WebsocketConnection {
    pub(super) async fn upgrade(mut socket: WebSocket, mut conn: Self, state: AppState, _id: Uuid) {
        // ping

        //let span = span!(Level::INFO, "websocket client loop");
        //let _enter = span.enter();

        tracing::debug!("entered websocket client loop");

        if socket
            .send(axum::extract::ws::Message::Ping(
                axum::body::Bytes::from_static(&[4, 2, 0]),
            ))
            .await
            .is_ok()
        {
            //ping successful
            tracing::info!("ping successful");

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
                            FrontendActions::Update(server_response) => {
                                tracing::debug!(
                                    "pushing frontend update to client {}: {:?}",
                                    conn.id,
                                    server_response
                                );

                                let d = serde_json::to_string(&server_response)
                                    .expect("error while serializing the app message update");

                                if let Err(e) = socket.send(d.into()).await {
                                    tracing::error!("error while pushing update: {e}")
                                }

                                // distribute message to all the other peers
                                let mut responder = state.responder.lock().await;
                                responder
                                    .send_message(MessageType::Broadcast {
                                        from: Some(conn.id),
                                        data: server_response.into(),
                                    })
                                    .await;
                                drop(responder)
                            }
                            FrontendActions::ExternalUpdate(server_response) => {
                                // Only send to the frontend
                                let d = serde_json::to_string(&server_response)
                                    .expect("error while serializing the app message update");
                                tracing::trace!("serialized external update: {}", d);

                                if let Err(e) = socket.send(server_response.into()).await {
                                    tracing::error!("error while pushing external update: {e}")
                                }
                            }
                        }
                        continue;
                    }
                    ControlFlow::Continue(None) => continue,
                    ControlFlow::Break(_) => break,
                }
            }
        } else {
            tracing::error!("error while sending client ping");
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
        ControlFlow::Continue(Some(FrontendActions::ExternalUpdate(msg.into())))
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
                match serde_json::from_slice::<ServerRequest>(utf8_bytes.as_bytes()) {
                    Ok(msg) => ControlFlow::Continue(Some(FrontendActions::Update(msg.into()))),
                    Err(e) => {
                        tracing::error!("error while parsing message: {}, {}", e, utf8_bytes);
                        ControlFlow::Continue(None)
                    }
                }
            }
            Message::Binary(_bytes) => todo!(),
            Message::Ping(bytes) => {
                tracing::debug!("got client ping {:?}", bytes);
                ControlFlow::Continue(None)
            }
            Message::Pong(bytes) => {
                tracing::debug!("got client pong {:?}", bytes);
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
