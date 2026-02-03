use axum::extract::ws::Message;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

use crate::state::messages::AppMessage;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
#[serde(tag = "type")]
pub enum ServerRequest {
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

impl From<ServerRequest> for ServerResponse {
    fn from(value: ServerRequest) -> Self {
        match value {
            ServerRequest::NoteEvent { midi, note } => ServerResponse::NoteEvent { midi, note },
            ServerRequest::CCEvent { midi, cc } => ServerResponse::CCEvent { midi, cc },
            ServerRequest::JogEvent { cc, midi } => ServerResponse::JogEvent { cc, midi },
        }
    }
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "SocketMessages.ts")]
#[serde(tag = "type")]
pub enum ServerResponse {
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

impl From<ServerResponse> for AppMessage {
    fn from(value: ServerResponse) -> Self {
        match value {
            ServerResponse::ConnectionInformation { connection_id, overlay_path } => todo!(),
            ServerResponse::NoteEvent { midi, note } => AppMessage::NoteUpdate { midi_channel: midi.channel, on: note.on, note: note.note, velocity: note.velocity },
            ServerResponse::CCEvent { midi, cc } => AppMessage::CCUpdate { midi_channel: midi.channel, value: cc.value, cc: cc.cc },
            ServerResponse::JogEvent { cc, midi } => AppMessage::CCUpdate { midi_channel: midi.channel, value: cc.value, cc: cc.cc },
        }
    }
}

impl From<AppMessage> for ServerResponse {
    fn from(value: AppMessage) -> Self {
        match value {
            AppMessage::CCUpdate { midi_channel, value, cc } => ServerResponse::CCEvent { midi: MidiEventPayload { channel: midi_channel }, cc: CCPayload { cc, value } },
            AppMessage::NoteUpdate { midi_channel, on, note, velocity } => ServerResponse::NoteEvent { midi: MidiEventPayload { channel: midi_channel }, note: NoteEventPayload { on, note, velocity } },
            AppMessage::ProgramChange { midi_channel, value } => todo!(),
            AppMessage::Unsupported => todo!(),
            AppMessage::Dummy => todo!(),
        }
    }
}

impl From<ServerResponse> for Message {
    fn from(value: ServerResponse) -> Self {
        Message::text(serde_json::to_string(&value).expect("error while serializing update packet"))
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