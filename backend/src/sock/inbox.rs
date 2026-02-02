use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::{broadcast, mpsc};
use uuid::Uuid;

use crate::{sock::WebsocketConnection, state::messages::AppMessage};

pub type ClientsMapNew = DashMap<Uuid, mpsc::Sender<AppMessage>>;
pub type ClientsNew = Arc<ClientsMapNew>;

#[derive(Clone, Copy)]
enum MessageType<T> {
    Broadcast { except: Uuid, data: T },
    Direct { recipient: Uuid, data: T }
}

struct AppMessageBus {
    clients: Arc<DashMap<Uuid, mpsc::Sender<AppMessage>>>,
    sender: broadcast::Sender<MessageType<AppMessage>>
}

impl AppMessageBus {
    fn inbox_task(clients: ClientsNew) -> Self {
        let (tx, mut rx) = broadcast::channel(32);
        let clients = Arc::new(DashMap::new());

        let clients_inner = clients.clone();
        tokio::spawn(async move {
            // if we got a message on the broadcast channel, emit it to the recipients
            while let Ok(msg) = rx.recv().await {
                match msg {
                    MessageType::Broadcast { except, data } => Self::broadcast(&clients_inner, data, vec![except]).await,
                    MessageType::Direct { recipient, data } => Self::direct_message(&clients_inner, data, recipient).await,
                }
            }
        });

        Self {
            sender: tx,
            clients
        }
    }

    pub fn subscribe(&mut self) -> broadcast::Receiver<MessageType<AppMessage>> {
        self.sender.subscribe()
    }

    pub async fn broadcast(map: &Arc<DashMap<Uuid, mpsc::Sender<AppMessage>>>, msg: AppMessage, except: Vec<Uuid>) {
        for client in map.iter() {
            if !except.contains(client.key()) {
                println!("sending message to {:?}", client.key());

                let mut c = client.value();
                if let Err(e) = c.send(msg).await {
                    println!("broadcast error: {:?}", e);
                    continue;
                }
            }
        }
    }
    
    async fn direct_message(map: &Arc<DashMap<Uuid, mpsc::Sender<AppMessage>>>, msg: AppMessage, who: Uuid) {
        let client = map.get(&who);
        if let Some(c) = client {
            if let Err(e) = c.send(msg).await {
                println!("direct message error: {:?}", e)
            }
        }
    }   
}