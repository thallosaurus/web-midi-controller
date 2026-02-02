use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::state::messages::AppMessage;

pub type ClientsMapNew = DashMap<Uuid, mpsc::Sender<AppMessage>>;
pub type ClientsNew = Arc<ClientsMapNew>;