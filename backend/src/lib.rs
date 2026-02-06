
use axum::{Router, http::HeaderValue, response::IntoResponse, routing::{any, get}};

use tokio::fs;
use include_dir::{Dir, include_dir};
use tower_serve_static::ServeDir;
use web::overlays::load;

pub mod midi;
//mod socket;

/// New Implementation of websocket
mod sock;
pub mod state;
pub mod inbox;

//pub mod widgets;

static ASSETS_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/../web/dist");

use crate::{
    sock::{refactor::upgrade_connection, socket_handler}, state::refactor::CoreState
};

pub fn serve_app(overlay_path: String) -> Router<CoreState> {

    let service = ServeDir::new(&ASSETS_DIR);
    
    Router::new()
        .fallback_service(service)
        .route("/ws", any(upgrade_connection))
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
            get(|| async move {
                let overlays = load(&overlay_path).await;

                let o = serde_json::to_string(&overlays).unwrap();

                let mut res = o.into_response();
                res.headers_mut()
                    .insert("Content-Type", HeaderValue::from_static("text/css"));
                res
            }),
        ) // serve overlays - TODO serve from disk
}