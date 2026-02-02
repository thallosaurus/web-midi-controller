use std::sync::Arc;

use axum::{Router, http::HeaderValue, response::IntoResponse, routing::{any, get}};
use dashmap::DashMap;

use serde_json::Value;
use tokio::{fs, sync::{Mutex, broadcast, mpsc}};
use tower_http::services;
use include_dir::{Dir, include_dir};
use tower_serve_static::ServeDir;
use uuid::Uuid;
use web::overlays::load;

mod midi;
//mod socket;

/// New Implementation of websocket
mod sock;
pub mod state;

//pub mod widgets;

static ASSETS_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/../web/dist");

use crate::{
    midi::MidiSystem, sock::{inbox::ClientsNew, socket_handler}, state::{AppState, messages::AppMessage}
};

#[deprecated]
type ClientMap = DashMap<Uuid, mpsc::Sender<AppMessage>>;
#[deprecated]
pub(crate) type Clients = Arc<ClientMap>;

pub fn serve_app() -> Router<AppState> {

    let service = ServeDir::new(&ASSETS_DIR);
    
    Router::new()
        .fallback_service(service)
        //.route("/", get( async || { include_str!("../web/dist/index.html") }))
        //.nest_service("/assets", service)
        //.route("/ws", any(ws_handler)) //websocket route
        .route("/wsdev", any(socket_handler))
        .route(
            "/custom.css",
            get(|| async {
                let content = fs::read_to_string("overlays/css/custom.css")
                    .await
                    .unwrap_or(String::from("/* no custom styles available */"));
                let mut response = content.into_response();
                response
                    .headers_mut()
                    .insert("Content-Type", HeaderValue::from_static("text/css"));
                response
            }),
        ) //custom css
        .route(
            "/overlays",
            get(|| async {
                let overlays = load("overlays").await;

                let o = serde_json::to_string(&overlays).unwrap();

                let mut res = o.into_response();
                res.headers_mut()
                    .insert("Content-Type", HeaderValue::from_static("text/css"));
                res
            }),
        ) // serve overlays - TODO serve from disk
}
