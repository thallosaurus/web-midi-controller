use axum::{
    Router, extract::{State, WebSocketUpgrade, connect_info::ConnectInfo}, http::{HeaderValue, Method}, response::IntoResponse, routing::{any, get}
};
use axum_extra::TypedHeader;
use clap::Parser;


use midi_controller::{serve_app, state};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use std::{net::SocketAddr, sync::Arc};
use tokio::{
    fs, net::TcpListener, sync::{Mutex, mpsc}
};

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let (appstate, midi_system) = state::state(args.name);

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

        let cors = CorsLayer::new()
            .allow_methods([Method::GET, Method::POST])
            .allow_origin(Any);

    let app = serve_app()
        .with_state(appstate);

        let app = app.layer(cors);
        
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
