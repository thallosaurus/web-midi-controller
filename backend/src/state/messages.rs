use axum::extract::ws::{Message, Utf8Bytes};
use serde::{Deserialize, Serialize};

// TODO: make proper events
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(tag = "event_name")]
pub enum AppMessage {
    #[serde(rename = "ccupdate")]
    CCUpdate {
        midi_channel: u8,
        value: u8,
        cc: u8,
    },
    #[serde(rename = "noteupdate")]
    NoteUpdate {
        midi_channel: u8,
        on: bool,
        note: u8,
        velocity: u8,
    },
    #[serde(rename = "programchange")]
    ProgramChange {
        midi_channel: u8,
        value: u8,
    },
    Unsupported,
    Dummy,
}

#[derive(Debug)]
pub(crate) enum AppError {
    ClientExit,
}

impl From<AppMessage> for Message {
    fn from(value: AppMessage) -> Self {
        Message::text(serde_json::to_string(&value).expect("error while serializing update packet"))
    }
}

impl From<Utf8Bytes> for AppMessage {
    fn from(value: Utf8Bytes) -> Self {
        serde_json::from_slice(value.as_bytes()).expect("error while deserializing update packet")
    }
}

impl From<Vec<u8>> for AppMessage {
    fn from(data: Vec<u8>) -> Self {
        match data.as_slice() {
            [0x90..=0x9F, note, vel] if *vel > 0 => {
                let ch = data[0] - 0x90;
                //let n = (*note).into();
                //Self::NoteOn(ch, n, *vel)
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: true,
                    note: *note,
                    velocity: *vel,
                }
            }
            [0x80..=0x8F, note, _] => {
                let ch = data[0] - 0x80;
                //let n = (*note).into();
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                }
                //Self::NoteOff(ch, n)
            }
            [0xC0..=0xCF, val] => {
                // Program changes
                let ch = data[0] - 0xC0;
                Self::ProgramChange {
                    midi_channel: ch + 1,
                    value: *val,
                }
            }
            [0x90..=0x9F, note, 0] => {
                let ch = data[0] - 0x90;
                //Self::Note(ch, n)
                Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                }
            }

            [0xB0..=0xBF, cc, val] => {
                let ch = data[0] - 0xB0;
                //let n = (*note).into();
                //Self::AfterTouch(ch, n, *vel)
                Self::CCUpdate {
                    midi_channel: ch + 1,
                    value: *val,
                    cc: *cc,
                }
            }
            _ => Self::Unsupported, /*
                                    [0xF8] => {
                                        //Self::Clock
                                    }*/
                                    /*_ => {
                                        error!("{:?}", data);
                                        //Self::Unknown
                                    }*/
        }
    }
}

impl From<AppMessage> for Vec<u8> {
    fn from(value: AppMessage) -> Self {
        match value {
            AppMessage::CCUpdate {
                midi_channel,
                value,
                cc,
            } => {
                vec![0xB0 + (midi_channel - 1), cc, value]
            }
            AppMessage::NoteUpdate {
                midi_channel,
                on,
                note,
                velocity,
            } => {
                let base = if on { 0x90 } else { 0x80 };
                vec![base + (midi_channel - 1), note, velocity]
            }
            AppMessage::Dummy => todo!(),
            AppMessage::Unsupported => panic!("can't cast unsupported message to bytes"),
            AppMessage::ProgramChange {
                midi_channel,
                value,
            } => {
                vec![0xC0 + midi_channel, value]
            }
        }
    }
}
