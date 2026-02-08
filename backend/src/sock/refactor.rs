use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};

use axum::{
    extract::{
        ConnectInfo, State, WebSocketUpgrade,
        ws::{Message, Utf8Bytes, WebSocket},
    },
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use tokio::sync::{
    Mutex, broadcast,
    mpsc::{self, Receiver, error::SendError},
};
use ts_rs::TS;
use uuid::Uuid;

use crate::{
    midi::messages::{CCPayload, MidiPayload, NotePayload},
    state::refactor::{CoreState, StateEvents, StateResponse},
};

pub async fn upgrade_connection(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(state): State<CoreState>,
) -> impl IntoResponse {
    let (sender, receiver) = mpsc::channel(32);
    let ws_client = WebsocketClient { sender };
    // register new client
    let clients = state.websock.clients;
    let new_id = Uuid::new_v4();
    clients.insert(new_id, ws_client);

    let global_sender = state.websock.websock_sender;

    ws.on_upgrade(move |socket| {
        let inner_c = clients.clone();
        //let client_id = new_id.clone();

        let task = WebsocketClientTask {
            id: new_id,
            clients,
            socket,
            receiver,
            return_sender: global_sender,
        };
        tracing::info!("new client with id {}", new_id);
        //WebsocketConnection::upgrade(socket, conn, state, id)
        WebsocketClientTask::task(task)
    })

    // remove client
}

#[derive(Clone)]
pub struct Websock {
    clients: Arc<DashMap<Uuid, WebsocketClient>>,
    websock_sender: mpsc::Sender<ServerRequest>, //client_return_channel: broadcast::Sender<StateResponse>
                                                 //backend_sender: Arc<Mutex<
}

impl Websock {
    pub fn new(mut global_receiver: broadcast::Receiver<StateResponse>) -> Self {
        let clients = Arc::new(DashMap::new());
        let clients_task = Arc::clone(&clients);

        // channel that is used from the client back to the system
        let (return_sender, mut return_receiver) = mpsc::channel(32);

        tokio::spawn(async move {
            let clients = clients_task;

            loop {
                tokio::select! {
                    msg = global_receiver.recv() => {

                        // we got a message from
                        if let Ok(msg) = msg {
                            tracing::info!("websocket task got msg: {:?}", msg);

                            match msg {
                                StateResponse::Broadcast { from, data } => {
                                    broadcast(&clients, data, vec![from]).await
                                }
                            }
                            //broadcast(&clients, msg, vec![msg]).await
                        } else {
                            tracing::info!("exiting websocket task");
                            break;
                        }
                    }
                    msg = return_receiver.recv() => {
                        if let Some(msg) = msg {
                            tracing::info!("websocket return channel got a message: {:?}", msg);
                        }
                    }
                }
            }
        });

        Self {
            clients,
            websock_sender: return_sender,
        }
    }
}

pub async fn broadcast(
    map: &Arc<DashMap<Uuid, WebsocketClient>>,
    msg: StateEvents,
    except: Vec<Uuid>,
) {
    for client in map.iter() {
        if !except.contains(client.key()) {
            tracing::debug!("[broadcast] sending message to {:?}", client.key());

            let c = client.value();
            if let Err(e) = c.send(msg.clone()).await {
                tracing::error!("broadcast error: {:?}", e);
                continue;
            }
        }
    }
}

pub struct WebsocketClientTask {
    id: Uuid,
    clients: Arc<DashMap<Uuid, WebsocketClient>>,
    socket: WebSocket,
    receiver: mpsc::Receiver<StateEvents>,
    return_sender: mpsc::Sender<ServerRequest>,
}

impl WebsocketClientTask {
    pub async fn task(mut client: WebsocketClientTask) {
        //tokio::spawn(async move {
        if let Err(e) = client.send_connection_info().await {
            tracing::error!("error while sending connection packet to client, exiting connection");
            return;
        }

        loop {
            tokio::select! {
                msg = client.receiver.recv() => {
                    // message from the backend
                    if let Some(msg) = msg {
                        tracing::info!("websocket client task got message from backend: {:?}", msg);
                        client.socket.send(msg.into()).await.unwrap();
                        //client.socket.send(msg);
                    } else {
                        // backend went away
                        break;
                    }
                }
                msg = client.socket.recv() => {
                    // message from the connected client
                    if let Some(msg) = msg {

                        tracing::info!("websocket client task got message from frontend: {:?}", msg);
                        let res = WebsocketClientTask::process_frontend_message(msg.unwrap());
                        if res.is_break() {
                            break;
                        } else {
                            if let Some(v) = res.continue_value() {

                                // do stuff
                                client.return_sender.send(v).await.unwrap();
                            }
                        }
                    } else {
                        // connection closed
                        tracing::debug!("processor decided to end this connection ({})", client.id);
                        break;
                    }
                }

            }
        }
        tracing::info!("closing connection with id {:?}", client.id);

        client.clients.remove(&client.id);
        //});
    }

    async fn send_connection_info(&mut self) ->Result<(), axum::Error> {
        let connect_message = ServerResponse::ConnectionInformation {
            connection_id: self.id.to_string(),
            overlay_path: String::from("/overlays"),
        };

        self.socket.send(connect_message.into()).await
    }

    fn process_frontend_message(msg: Message) -> ControlFlow<(), ServerRequest> {
        match msg {
            Message::Text(utf8_bytes) => {
                if let Ok(r) = serde_json::from_slice(utf8_bytes.as_bytes()) {
                    /*                    match r {
                        ServerRequest::NoteEvent { midi, note } => ControlFlow::Continue(ServerResponse::NoteEvent { midi, note, on: note.velocity > 0 }),
                        ServerRequest::CCEvent { midi, cc } => ControlFlow::Continue(ServerResponse::CCEvent { midi, cc }),
                        ServerRequest::JogEvent { cc, midi } => todo!(),
                    }*/
                    ControlFlow::Continue(r)
                } else {
                    tracing::error!("error while serializing message: {:?}", utf8_bytes);
                    ControlFlow::Break(())
                }
            }
            Message::Binary(bytes) => todo!(),
            Message::Ping(bytes) => todo!(),
            Message::Pong(bytes) => todo!(),
            Message::Close(close_frame) => ControlFlow::Break(()),
        }
    }
}

/// What other clients see in the id<->clients map
pub struct WebsocketClient {
    sender: mpsc::Sender<StateEvents>,
}

impl WebsocketClient {
    async fn send(&self, msg: StateEvents) -> Result<(), SendError<StateEvents>> {
        //self.sender.send(msg).await
        self.sender.send(msg).await
    }
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
#[serde(tag = "type")]
pub enum ServerRequest {
    NoteEvent {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        note: NotePayload,
    },
    CCEvent {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        cc: CCPayload,
    },
    JogEvent {
        #[serde(flatten)]
        cc: CCPayload,

        #[serde(flatten)]
        midi: MidiPayload,
    },
}

impl From<ServerRequest> for ServerResponse {
    fn from(value: ServerRequest) -> Self {
        match value {
            ServerRequest::NoteEvent { midi, note } => {
                let on = note.velocity > 0;
                ServerResponse::NoteEvent { midi, note, on }
            }
            ServerRequest::CCEvent { midi, cc } => ServerResponse::CCEvent { midi, cc },
            ServerRequest::JogEvent { cc, midi } => ServerResponse::JogEvent { cc, midi },
        }
    }
}

/// Implementation of conversions of the #[ServerResponse] enum for websocket connections
impl From<ServerResponse> for Message {
    fn from(value: ServerResponse) -> Self {
        let json = serde_json::to_string(&value).unwrap();
        Message::text(json)
    }
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
#[serde(tag = "type")]
pub enum ServerResponse {
    ConnectionInformation {
        connection_id: String,
        overlay_path: String,
    },
    NoteEvent {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        note: NotePayload,

        on: bool,
    },
    CCEvent {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        cc: CCPayload,
    },
    JogEvent {
        #[serde(flatten)]
        cc: CCPayload,

        #[serde(flatten)]
        midi: MidiPayload,
    },
}
