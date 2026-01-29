use axum::{
    body::Bytes,
    extract::{
        ConnectInfo, State, WebSocketUpgrade,
        ws::{Message, Utf8Bytes, WebSocket},
    },
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};
use tokio::sync::{
    Mutex,
    mpsc::{self, Sender},
};
use uuid::Uuid;

use crate::AppState;

type ClientMap = DashMap<Uuid, mpsc::Sender<AppMessage>>;
pub(crate) type Clients = Arc<ClientMap>;

pub(crate) async fn ws_handler(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        String::from("Unknown browser")
    };
    println!("`{user_agent}` at {addr} connected.");
    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    ws.on_upgrade(move |socket| handle_socket(socket, addr, state))
}

async fn handle_socket(mut socket: WebSocket, who: SocketAddr, state: AppState) {
    let conn_id = Uuid::new_v4();
    if socket
        .send(axum::extract::ws::Message::Ping(Bytes::from_static(&[
            4, 2, 0,
        ])))
        .await
        .is_ok()
    {
        println!("Sent ping to {who} successfully");
    } else {
        println!("Could not send ping to {who}, closing...");
        return;
    }

    let (tx, mut rx) = mpsc::channel::<AppMessage>(32);

    println!("adding {conn_id} to clients map");
    state.clients.insert(conn_id, tx);

    let client_map = Arc::clone(&state.clients);
    //let in_socket = Arc::clone(&state.midi_socket_input);
    let mut in_socket = {
        let lock = &state.midi_socket_input.lock().await;
        lock.resubscribe()
    };

    _ = tokio::spawn(async move {
        // lock the midi input channel
        loop {
            tokio::select! {
                Some(aux) = rx.recv() => {
                    // we got a message from other peers
                    //if socket.send(aux)
                    println!("client with id {conn_id} got msg {:?}", aux);
                    if let Err(e) = socket.send(aux.into()).await {
                        eprintln!("error while pushing update: {e}")
                    }
                    //state.clients.get(key)
                }

                msg = in_socket.recv() => {
                        // virtual midi input update
                        match msg {
                            Ok(msg) => {
                                println!("send to socket: {:?}", msg);

                                if let Err(e) = socket.send(msg.into()).await {
                                    eprintln!("error while pushing update: {e}")
                                }
                            },
                            Err(e) => {
                                eprintln!("{}", e)
                            }
                        }

                }

                m = socket.recv() => {
                    match m {
                        Some(Ok(msg)) => {
                            if process_message(&state.midi_socket_output, msg, conn_id, &client_map).await.is_break() { break };
                        },
                        _ => {
                            println!("client {who} disconnected");
                            break;
                        }
                    }
                }
            }
        }

        client_map.remove(&conn_id);
    });
}

async fn process_message(
    midi_tx: &Arc<Mutex<Sender<AppMessage>>>,
    msg: Message,
    who: Uuid,
    map: &Clients,
) -> ControlFlow<(), ()> {
    match msg {
        Message::Close(c) => {
            if let Some(cf) = c {
                println!(
                    "{who} send close with code {} and reason {}",
                    cf.code, cf.reason
                );
            } else {
                println!("{who} somehow sent close message without CloseFrame");
            }
            //return Err(AppError::ClientExit);
            return ControlFlow::Break(());
        }
        Message::Text(txt) => {
            //println!("got message {:?}", txt.to_string());
            //ControlFlow::Continue(AppMessage::Dummy)

            // parse here
            //let event: AppMessage = serde_json::from_str(&txt.to_string())?
            //.map_err(|e| AppError::InvalidUpdatePacket(e))?;

            println!("{}", txt);

            let event = txt.into();

            broadcast(map, event, vec![who]).await;
            {
                midi_tx.lock().await.send(event.into()).await.unwrap();
            }
        }
        Message::Pong(bytes) => {
            println!("got pong {:?}", bytes);
        }
        Message::Ping(bytes) => {
            println!("got ping {:?}", bytes);
        }
        _ => {
            println!("got unimplemented message {:?}", msg);
        }
    }
    ControlFlow::Continue(())
}

async fn broadcast(map: &Clients, msg: AppMessage, except: Vec<Uuid>) {
    for client in map.iter() {
        if !except.contains(client.key()) {
            println!("sending message to {:?}", client.key());
            if let Err(e) = client.send(msg).await {
                println!("broadcast error: {:?}", e);
                continue;
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(tag = "event_name")]
pub(crate) enum AppMessage {
    #[serde(rename = "ccupdate")]
    CCUpdate {
        midi_channel: u8,
        value: u8,
        cc: u8,
    },
    #[serde(rename = "noteupdate")]
    NoteUpdate {
        midi_channel: u8,
        on: bool,
        note: u8,
        velocity: u8,
    },
    Unsupported,
    Dummy,
}

#[derive(Debug)]
pub(crate) enum AppError {
    ClientExit,
}

impl From<AppMessage> for Message {
    fn from(value: AppMessage) -> Self {
        Message::text(serde_json::to_string(&value).expect("error while serializing update packet"))
    }
}

impl From<Utf8Bytes> for AppMessage {
    fn from(value: Utf8Bytes) -> Self {
        serde_json::from_slice(value.as_bytes()).expect("error while deserializing update packet")
    }
}

impl From<Vec<u8>> for AppMessage {
    fn from(data: Vec<u8>) -> Self {
        match data.as_slice() {
            [0x90..=0x9F, note, vel] if *vel > 0 => {
                let ch = data[0] - 0x90;
                //let n = (*note).into();
                //Self::NoteOn(ch, n, *vel)
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: true,
                    note: *note,
                    velocity: *vel,
                }
            }
            [0x80..=0x8F, note, _] => {
                let ch = data[0] - 0x80;
                //let n = (*note).into();
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                }
                //Self::NoteOff(ch, n)
            }
            [0x90..=0x9F, note, 0] => {
                let ch = data[0] - 0x90;
                //Self::Note(ch, n)
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                }
            }

            [0xB0..=0xBF, cc, val] => {
                let ch = data[0] - 0xB0;
                //let n = (*note).into();
                //Self::AfterTouch(ch, n, *vel)
                Self::CCUpdate {
                    midi_channel: ch + 1,
                    value: *val,
                    cc: *cc,
                }
            }
            _ => Self::Unsupported, /*
                                    [0xF8] => {
                                        //Self::Clock
                                    }*/
                                    /*_ => {
                                        error!("{:?}", data);
                                        //Self::Unknown
                                    }*/
        }
    }
}

impl From<AppMessage> for Vec<u8> {
    fn from(value: AppMessage) -> Self {
        match value {
            AppMessage::CCUpdate {
                midi_channel,
                value,
                cc,
            } => {
                vec![0xB0 + (midi_channel - 1), cc, value]
            }
            AppMessage::NoteUpdate {
                midi_channel,
                on,
                note,
                velocity,
            } => {
                let base = if on { 0x90 } else { 0x80 };
                vec![base + (midi_channel - 1), note, velocity]
            }
            AppMessage::Dummy => todo!(),
            AppMessage::Unsupported => panic!("can't cast unsupported message to bytes"),
        }
    }
}
