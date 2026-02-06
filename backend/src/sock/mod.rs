use std::net::SocketAddr;

use axum::{
    extract::{
        ConnectInfo, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use tokio::sync::mpsc;
use tracing::instrument;
use uuid::Uuid;

use crate::{sock::connection::WebsocketConnection, state::AppState};

mod connection;
mod messages;

pub mod refactor;

//#[instrument]
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
    let id = Uuid::new_v4();
    tracing::debug!("`{user_agent}` at {addr} has Connection Id {id}.");
    let (tx, inbox) = mpsc::channel(32);
    // create channels
    // generate uuid
    let mut responder = state.responder.lock().await;

    responder.add_client(id, tx);
    let conn = WebsocketConnection { id, inbox };

    drop(responder);
    
    ws.on_upgrade(move |socket| {
        WebsocketConnection::upgrade(socket, conn, state, id)
    })
    //WebsocketConnection::upgrade();
}
