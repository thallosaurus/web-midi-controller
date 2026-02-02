use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};

use axum::{
    body::Bytes,
    extract::{
        ConnectInfo, State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use dashmap::DashMap;
use tokio::sync::{Mutex, mpsc};
use tracing::{Level, event, span};
use uuid::Uuid;

use crate::{AppState, sock::{self, handling::WebsocketConnection}, socket::AppMessage};

mod handling;

pub(crate) type ClientsMapNew = DashMap<Uuid, mpsc::Sender<AppMessage>>;
pub(crate) type ClientsNew = Arc<ClientsMapNew>;

pub(crate) async fn socket_handler(
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

    ws.on_upgrade(move |socket| {
        // generate uuid
        let id = Uuid::new_v4();
        println!("`{user_agent}` at {addr} has Connection Id {id}.");

        let (tx, inbox) = mpsc::channel(32);
        // create channels
        state.clientsnew.insert(id, tx);
        let conn = WebsocketConnection { id, inbox };

        WebsocketConnection::upgrade(socket, conn, state)
    })
    //WebsocketConnection::upgrade();
}

