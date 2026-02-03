use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::{Mutex, mpsc};
use uuid::Uuid;

use crate::state::messages::AppMessage;

pub type ClientsMapNew = DashMap<Uuid, mpsc::Sender<AppMessage>>;
pub type ClientsNew = Arc<ClientsMapNew>;

#[derive(Debug, Clone, Copy)]
pub enum MessageType<T> {
    Broadcast { from: Option<Uuid>, data: T },
    Direct { recipient: Uuid, data: T }
}

pub type SharedMessageResponder = Arc<Mutex<MessageResponder>>;

#[derive(Clone)]
pub struct MessageResponder {
    clients: ClientsNew,
    pub sender: mpsc::Sender<MessageType<AppMessage>>
}

impl MessageResponder {
    pub fn task(global_tx: mpsc::Sender<AppMessage>) -> Self {
        let (tx, mut rx) = mpsc::channel(32);
        let clients = Arc::new(DashMap::new());

        let clients_inner = clients.clone();
        tokio::spawn(async move {
            loop {
                tokio::select! {
                    Some(msg) = rx.recv() => {
                        // if we got a message on the broadcast channel, emit it to the recipients
                        match msg {
                            MessageType::Broadcast { from, data } => {
                                if let Some(from) = from {
                                    Self::broadcast(&clients_inner, data, vec![from]).await
                                } else {
                                    Self::broadcast(&clients_inner, data, vec![]).await
                                }
                                global_tx.send(data).await;
                            },
                            MessageType::Direct { recipient, data } => Self::direct_message(&clients_inner, data, recipient).await,
                        }
                    }
                }
            }
        });

        Self {
            sender: tx,
            clients
        }
    }

    /// send message from the AppState
    pub async fn send_message(&mut self, msg: MessageType<AppMessage>) {
        if let Err(e) = self.sender.send(msg).await {
            eprintln!("{e}");
        }
    }

    /// sends messages from an asynchronous context. spawns a tokio thread
    pub fn send_message_sync(responder: &mut SharedMessageResponder, msg: MessageType<AppMessage>) {
        let r = responder.clone();

        let lock = r.blocking_lock();
        lock.sender.blocking_send(msg).unwrap();
    }

    pub fn add_client(&mut self, id: Uuid, conn: mpsc::Sender<AppMessage>) {
        println!("adding client {id}");
        self.clients.insert(id, conn);
    }
    
    pub fn remove_client(&mut self, id: Uuid) {
        println!("removing client {id}");
        self.clients.remove(&id);
    }

    pub async fn broadcast(map: &Arc<DashMap<Uuid, mpsc::Sender<AppMessage>>>, msg: AppMessage, except: Vec<Uuid>) {
        for client in map.iter() {
            if !except.contains(client.key()) {
                println!("[broadcast] sending message to {:?}", client.key());

                let c = client.value();
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