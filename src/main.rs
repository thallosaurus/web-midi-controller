use axum::{
    Router, extract::{State, WebSocketUpgrade, connect_info::ConnectInfo}, http::HeaderValue, response::IntoResponse, routing::{any, get}
};
use axum_extra::TypedHeader;
use clap::Parser;
use dashmap::DashMap;
use serde_json::Value;
use tower_http::services;
use tower_serve_static::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
//use static_serve::embed_assets;
use include_dir::{Dir, include_dir};
use std::{net::SocketAddr, sync::Arc};
use tokio::{
    fs, net::TcpListener, sync::{Mutex, mpsc}
};

use crate::{
    midi::MidiSystem,
    socket::{AppMessage, Clients, handle_socket},
};

//#[cfg(not(all(debug_assertions,not(feature = "debug_embed"))))]
static ASSETS_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/web/dist");

//embed_assets!("web/dist");

mod midi;
mod socket;

#[derive(Clone)]
struct AppState {
    clients: Clients,
    midi_socket: Arc<Mutex<mpsc::Sender<AppMessage>>>,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                // axum logs rejections from built-in extractors with the `axum::rejection`
                // target, at `TRACE` level. `axum::rejection=trace` enables showing those events
                format!(
                    "{}=debug,tower_http=debug,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let midi_system = MidiSystem::new(args.name).expect("error while initializing midi system");

    let state = AppState {
        clients: Arc::new(DashMap::new()),
        midi_socket: Arc::new(Mutex::new(midi_system.tx)),
    };

    //let app = static_router()
    let service = ServeDir::new(&ASSETS_DIR);

    let app = Router::new()
        .fallback_service(service)
        //.route("/", get( async || { include_str!("../web/dist/index.html") }))
        //.nest_service("/assets", service)
        .route("/ws", any(ws_handler)) //websocket route
        .route(
            "/custom.css",
            get(|| async {
                let content = fs::read_to_string("overlays/css/custom.css").await.unwrap_or(String::from("/* no custom styles available */"));
                let mut response = content.into_response();
                response.headers_mut().insert("Content-Type", HeaderValue::from_static("text/css"));
                response
            }),
        ) //custom css
        .route(
            "/overlays",
            get(|| async { 
                let mut overlays = vec![];
                let paths = std::fs::read_dir("overlays").unwrap();
                for path in paths {
                    let p = path.unwrap().path();
                    if let Some(ext) = p.extension() && ext == "json" {
                        let contents = fs::read_to_string(p.as_path()).await.unwrap();
                        
                        let json: Value = serde_json::from_str(&contents).unwrap();
                        //println!("{:?}", json);
                        overlays.push(json);
                    }
                }
                //include_str!("../web/dist/demo_overlay.json") }),

                let o = serde_json::to_string(&overlays).unwrap();

                let mut res = o.into_response();
                res.headers_mut().insert("Content-Type", HeaderValue::from_static("text/css"));
                res
            })
        ) // serve overlays - TODO serve from disk
        .with_state(state);
    //.route("/", get(|| async { "Hello, World!" }));

    //let app = axum_spa::embedded(app, &ASSETS_DIR).unwrap();

    /*let app = spa(app, Config {

    })*/
    let listener = TcpListener::bind(args.address.unwrap_or(String::from("0.0.0.0:8888")))
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap()
}

async fn ws_handler(
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

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// If you are on Windows:
    ///     The name of the device the application tries to open
    /// If you are anywhere else where supported:
    ///     The name of the virtual midi port
    #[arg(short, long)]
    name: Option<String>,

    #[arg(short = 'p')]
    address: Option<String>,
}
