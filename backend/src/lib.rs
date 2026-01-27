use std::sync::Arc;

use axum::{Router, http::HeaderValue, response::IntoResponse, routing::{any, get}};
use dashmap::DashMap;

use serde_json::Value;
use tokio::{fs, sync::{Mutex, mpsc}};
use tower_http::services;
use include_dir::{Dir, include_dir};
use tower_serve_static::ServeDir;
use web::overlays::load;

mod midi;
mod socket;

//pub mod widgets;

static ASSETS_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/../web/dist");

use crate::{
    midi::MidiSystem,
    socket::{AppMessage, Clients, ws_handler}
};

#[derive(Clone)]
pub struct AppState {
    clients: Clients,
    midi_socket: Arc<Mutex<mpsc::Sender<AppMessage>>>,
}

/// Initializes the channel and the midi system
pub fn state(name: Option<String>) -> (AppState, MidiSystem) {
    let (tx, mut rx) = mpsc::channel::<AppMessage>(64);
    (AppState {
        clients: Arc::new(DashMap::new()),
        midi_socket: Arc::new(Mutex::new(tx)),
    }, 
    MidiSystem::new(name, rx).expect("error while initializing midi system"))
}

pub fn serve_app(router: Router<AppState>) -> Router<AppState> {

    let service = ServeDir::new(&ASSETS_DIR);
    
    Router::new()
        .fallback_service(service)
        //.route("/", get( async || { include_str!("../web/dist/index.html") }))
        //.nest_service("/assets", service)
        .route("/ws", any(ws_handler)) //websocket route
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
