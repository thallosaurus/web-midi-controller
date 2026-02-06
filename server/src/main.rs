use crate::args::Args;
use axum::http::Method;
use clap::Parser;
use midi_controller::{midi::default_list, serve_app, state::{self, refactor::CoreState}};
use std::{error::Error, net::SocketAddr};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod args;

fn list_ports() {
    let l = default_list().expect("error while looking up ports");
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    init_tracing();

    if args.list.unwrap_or(false) {
        list_ports();
        return Ok(());
    }

    // set if virtual ports should be used
    #[cfg(not(target_os = "windows"))]
    let use_virtual = args.use_virtual.unwrap_or(true);

    #[cfg(target_os = "windows")]
    let use_virtual = args.use_virtual.unwrap_or(false);

    serve(args, use_virtual).await;

    Ok(())
}

async fn serve(args: Args, use_virtual: bool) {
    //let appstate = state::state(args.name, use_virtual);
    let appstate = CoreState::new(args.name, use_virtual);
    
    let app = serve_app(args.overlay_path).with_state(appstate);

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any);

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
    .unwrap();
}

fn init_tracing() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                // axum logs rejections from built-in extractors with the `axum::rejection`
                // target, at `TRACE` level. `axum::rejection=trace` enables showing those events

                #[cfg(debug_assertions)]
                return format!("{}=trace,tower_http=debug,axum::rejection=trace,midi_controller=trace,web=trace",env!("CARGO_CRATE_NAME")).into();

                #[cfg(not(debug_assertions))]
                return format!("{}=info,midi_controller=info,web=info",env!("CARGO_CRATE_NAME")).into();
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
}
