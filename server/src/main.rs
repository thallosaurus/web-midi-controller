use crate::args::Args;
use axum::http::Method;
use clap::Parser;
use midi_controller::{serve_app, state};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod args;

#[tokio::main]
async fn main() {
    init_tracing();
    let args = Args::parse();

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any);


    // set if virtual ports should be used
    #[cfg(not(target_os = "windows"))]
    let use_virtual = args.use_virtual.unwrap_or(true);

    #[cfg(target_os = "windows")]
    let use_virtual = args.use_virtual.unwrap_or(false);

    let appstate = state::state(args.name, use_virtual);
    let app = serve_app(args.overlay_path).with_state(appstate);

    let app = app.layer(cors);

    let listener = TcpListener::bind(args.address.unwrap_or(String::from("0.0.0.0:8888")))
        .await
        .unwrap();

    tracing::info!("listening on {}", listener.local_addr().unwrap());

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap()
}

fn init_tracing() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                // axum logs rejections from built-in extractors with the `axum::rejection`
                // target, at `TRACE` level. `axum::rejection=trace` enables showing those events
                format!(
                    "{}=trace,tower_http=debug,axum::rejection=trace,midi_controller=trace,web=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
}
