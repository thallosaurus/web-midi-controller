use serde::{Deserialize, Serialize};
use ts_rs::TS;
//use ts_rs::TS;

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct MidiPayload {
    pub channel: u8,
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct NotePayload {
    //on: bool,
    pub note: u8,
    pub velocity: u8,
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct CCPayload {
    pub cc: u8,
    pub value: u8,
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
//#[ts(export, export_to = "SocketMessages.ts")]
#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
#[serde(tag = "type")]
pub enum MidiMessage {
    NoteOn {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        note: NotePayload,
    },

    NoteOff {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        note: NotePayload,
    },
    ProgramChange {
        #[serde(flatten)]
        midi: MidiPayload,

        value: u8,
    },
    Pitchbend {
        #[serde(flatten)]
        midi: MidiPayload,
        value: u16,
    },
    ControlChange {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        cc: CCPayload,
    },
    TimingClock,
    Start,
    Continue,
    Stop,
    Unknown,
    SongPositionPointer {
        value: u16,
    },
}

impl From<Vec<u8>> for MidiMessage {
    fn from(data: Vec<u8>) -> Self {
        match data.as_slice() {
            [0x90..=0x9F, note, vel] if *vel > 0 => {
                let ch = data[0] - 0x90;
                Self::NoteOn {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: *vel,
                    },
                }
            }
            [0x80..=0x8F, note, _] => {
                let ch = data[0] - 0x80;
                Self::NoteOff {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: 0,
                    },
                }
            }
            [0xC0..=0xCF, val] => {
                // Program changes
                let ch = data[0] - 0xC0;
                Self::ProgramChange {
                    midi: MidiPayload { channel: ch },
                    value: *val,
                }
            }
            [0x90..=0x9F, note, 0] => {
                let ch = data[0] - 0x90;

                Self::NoteOff {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: 0,
                    },
                }
            }

            [0xB0..=0xBF, cc, val] => {
                let ch = data[0] - 0xB0;

                Self::ControlChange {
                    midi: MidiPayload { channel: ch + 1 },
                    cc: CCPayload {
                        cc: *cc,
                        value: *val,
                    },
                }
            }
            [0xE0..=0xEF, lsb, msb] => {
                let ch = data[0] - 0xE0;

                let value = ((*msb as u16) << 7) | (*lsb as u16);
                Self::Pitchbend {
                    midi: MidiPayload { channel: ch },
                    value,
                }
            }
            [0xF8] => Self::TimingClock,
            [0xFA] => Self::Start,
            [0xFB] => Self::Continue,
            [0xFC] => Self::Stop,
            [0xF2, lsb, msb] => {
                let value = ((*msb as u16) << 7) | (*lsb as u16);
                Self::SongPositionPointer { value }
            }
            _ => Self::Unknown, /*
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

impl From<MidiMessage> for Vec<u8> {
    fn from(value: MidiMessage) -> Self {
        match value {
            MidiMessage::NoteOn { midi, note } => {
                vec![0x90 + (midi.channel - 1), note.note, note.velocity]
            }
            MidiMessage::NoteOff { midi, note } => {
                vec![0x80 + (midi.channel - 1), note.note, note.velocity]
            }
            MidiMessage::ProgramChange { midi, value } => vec![0xC0 + (midi.channel - 1), value],
            MidiMessage::ControlChange { midi, cc } => {
                vec![0xB0 + (midi.channel - 1), cc.cc, cc.value]
            }
            MidiMessage::Pitchbend { midi, value } => {
                let lsb = (value & 0x7F) as u8;
                let msb = ((value >> 7) & 0x7F) as u8;
                vec![0xE0 + midi.channel, lsb, msb]
            }
            MidiMessage::Unknown => vec![],
            MidiMessage::TimingClock => vec![0xF8],
            MidiMessage::Start => vec![0xFA],
            MidiMessage::Continue => vec![0xFB],
            MidiMessage::Stop => vec![0xFC],
            MidiMessage::SongPositionPointer { value } => {
                let lsb = (value & 0x7F) as u8;
                let msb = ((value >> 7) & 0x7F) as u8;
                vec![0xF2, lsb, msb]
            }
        }
    }
}
