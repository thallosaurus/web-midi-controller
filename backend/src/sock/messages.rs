use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

use crate::state::messages::AppMessage;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
#[serde(tag = "type")]
pub enum SocketMessageType {
    ConnectionInformation {
        connection_id: String,
        overlay_path: String
    },
    NoteEvent {
        #[serde(flatten)]
        midi: MidiEventPayload,
        
        #[serde(flatten)]
        note: NoteEventPayload
        
    },
    CCEvent {
        #[serde(flatten)]
        midi: MidiEventPayload,
        
        #[serde(flatten)]
        cc: CCPayload
    },
    JogEvent {
        #[serde(flatten)]
        cc: CCPayload,

        #[serde(flatten)]
        midi: MidiEventPayload
    }
}

impl From<SocketMessageType> for AppMessage {
    fn from(value: SocketMessageType) -> Self {
        match value {
            SocketMessageType::ConnectionInformation { connection_id, overlay_path } => todo!(),
            SocketMessageType::NoteEvent { midi, note } => todo!(),
            SocketMessageType::CCEvent { midi, cc } => todo!(),
            SocketMessageType::JogEvent { cc, midi } => todo!(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
pub struct MidiEventPayload {
    channel: u8
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]

pub struct NoteEventPayload {
    on: bool,
    note: u8,
    velocity: u8
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]

pub struct CCPayload {
    cc: u8,
    value: u8
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]

pub struct JogPayload {
    cc: u8,
    value: u8
}