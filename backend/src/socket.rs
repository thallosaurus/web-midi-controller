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

    let client_map = Arc::clone(&state.clients);
    let prg_map = Arc::clone(&state.device_program_ids);
    println!("adding {conn_id} to clients map");
    client_map.insert(conn_id, tx);

    let prg_id = state.device_program_ids.len() as u8;
    prg_map.insert(prg_id, conn_id);

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

                                match msg {
                                    AppMessage::ProgramChange { midi_channel, value } => {
                                        if let Some(own_id) = prg_map.get(&prg_id) {

                                            
                                            //println!("{} {:?}", prg_id, own_id.value());
                                            
                                            // sloppy but eh
                                            if *own_id.value() == conn_id {
                                                if let Err(e) = socket.send(msg.into()).await {
                                                    eprintln!("error while pushing program change: {e}")
                                                }
                                            }
                                        }

                                        //direct_message(map, msg, who)
                                    }
                                    _ => {
                                        if let Err(e) = socket.send(msg.into()).await {
                                            eprintln!("error while pushing update: {e}")
                                        }
                                    }
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
        prg_map.remove(&prg_id);
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

            let event = txt.into();
            println!("{:?}", event);

            match event {
                AppMessage::CCUpdate {
                    midi_channel: _,
                    value: _,
                    cc: _,
                } => {
                    broadcast(map, event, vec![who]).await;
                    {
                        midi_tx.lock().await.send(event.into()).await.unwrap();
                    }
                }
                AppMessage::NoteUpdate {
                    midi_channel,
                    on,
                    note,
                    velocity,
                } => {
                    broadcast(map, event, vec![who]).await;
                    {
                        midi_tx.lock().await.send(event.into()).await.unwrap();
                    }
                }
                //client cant send program change for now
                AppMessage::ProgramChange {
                    midi_channel,
                    value,
                } => todo!(),
                AppMessage::Unsupported => todo!(),
                AppMessage::Dummy => todo!(),
            }

            /*broadcast(map, event, vec![who]).await;
            {
                midi_tx.lock().await.send(event.into()).await.unwrap();
            }*/
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

async fn direct_message(map: &Clients, msg: AppMessage, who: Uuid) {
    let client = map.get(&who);
    if let Some(c) = client {
        if let Err(e) = c.send(msg).await {
            println!("direct message error: {:?}", e)
        }
    }
}
