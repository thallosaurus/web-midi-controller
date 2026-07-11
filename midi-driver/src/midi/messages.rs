use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct MidiPayload {
    pub channel: u8,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct NotePayload {
    //on: bool,
    pub note: u8,
    pub velocity: u8,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct CCPayload {
    pub cc: u8,
    pub value: u8,
}

#[derive(Clone, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct ProgramChangePayload {
    #[serde(flatten)]
    midi: MidiPayload,

    value: u8,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct NoteOnPayload {
    #[serde(flatten)]
    midi: MidiPayload,

    #[serde(flatten)]
    note: NotePayload,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct NoteOffPayload {
    #[serde(flatten)]
    midi: MidiPayload,

    #[serde(flatten)]
    note: NotePayload,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct PitchbendPayload {
    #[serde(flatten)]
    midi: MidiPayload,
    value: u16,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct ControlChangePayload {
    #[serde(flatten)]
    midi: MidiPayload,

    #[serde(flatten)]
    cc: CCPayload,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct ChannelPressurePayload {
    #[serde(flatten)]
    midi: MidiPayload,

    pressure: u8,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct AftertouchPayload {
    #[serde(flatten)]
    midi: MidiPayload,

    #[serde(flatten)]
    note: NotePayload,
}

#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct SongPositionPointerPayload {
    value: u16,
}

#[derive(Clone, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
pub struct SysExPayload {
    data: Vec<u8>,
}

#[derive(Clone, Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "MidiPayload.ts")]
#[serde(tag = "type")]
pub enum MidiMessage {
    NoteOn(NoteOnPayload),

    NoteOff(NoteOffPayload),
    ProgramChange(ProgramChangePayload),
    Pitchbend(PitchbendPayload),
    ControlChange(ControlChangePayload),
    ChannelPressure(ChannelPressurePayload),
    TimingClock,
    Start,
    Continue,
    Stop,
    Unknown,
    Aftertouch(AftertouchPayload),
    SongPositionPointer(SongPositionPointerPayload),
    SysEx(SysExPayload),
}

impl From<Vec<u8>> for MidiMessage {
    fn from(data: Vec<u8>) -> Self {
        match data.as_slice() {
            [0x90..=0x9F, note, vel] if *vel > 0 => {
                let ch = data[0] - 0x90;
                Self::NoteOn(NoteOnPayload {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: *vel,
                    },
                })
            }
            [0x80..=0x8F, note, _] => {
                let ch = data[0] - 0x80;
                Self::NoteOff(NoteOffPayload {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: 0,
                    },
                })
            }
            [0xC0..=0xCF, val] => {
                // Program changes
                let ch = data[0] - 0xC0;
                Self::ProgramChange(ProgramChangePayload {
                    midi: MidiPayload { channel: ch + 1 },
                    value: *val,
                })
            }
            [0x90..=0x9F, note, 0] => {
                let ch = data[0] - 0x90;

                Self::NoteOff(NoteOffPayload {
                    midi: MidiPayload { channel: ch + 1 },
                    note: NotePayload {
                        note: *note,
                        velocity: 0,
                    },
                })
            }

            [0xA0..=0xAF, note, vel] => {
                let ch = data[0] - 0xA0;

                Self::Aftertouch(AftertouchPayload {
                    note: NotePayload {
                        note: *note,
                        velocity: *vel,
                    },
                    midi: MidiPayload { channel: ch + 1},
                })
            }

            [0xB0..=0xBF, cc, val] => {
                let ch = data[0] - 0xB0;

                Self::ControlChange(ControlChangePayload {
                    midi: MidiPayload { channel: ch + 1 },
                    cc: CCPayload {
                        cc: *cc,
                        value: *val,
                    },
                })
            }
            [0xE0..=0xEF, lsb, msb] => {
                let ch = data[0] - 0xE0;

                let value = ((*msb as u16) << 7) | (*lsb as u16);
                Self::Pitchbend(PitchbendPayload {
                    midi: MidiPayload { channel: ch + 1},
                    value,
                })
            }
            [0xF8] => Self::TimingClock,
            [0xFA] => Self::Start,
            [0xFB] => Self::Continue,
            [0xFC] => Self::Stop,
            [0xF2, lsb, msb] => {
                let value = ((*msb as u16) << 7) | (*lsb as u16);
                Self::SongPositionPointer(SongPositionPointerPayload { value })
            }
            [0xF0, ..] => Self::SysEx(SysExPayload { data }),
            [0xD0..=0xDF, pressure] => {
                let ch = data[0] - 0xD0;
                Self::ChannelPressure(ChannelPressurePayload {
                    midi: MidiPayload { channel: ch + 1 },
                    pressure: *pressure,
                })
            }
            _ => Self::Unknown,
        }
    }
}

impl From<MidiMessage> for Vec<u8> {
    fn from(value: MidiMessage) -> Self {
        match value {
            MidiMessage::NoteOn(p) => {
                vec![0x90 + (p.midi.channel - 1), p.note.note, p.note.velocity]
            }
            MidiMessage::NoteOff(p) => {
                vec![0x80 + (p.midi.channel - 1), p.note.note, p.note.velocity]
            }
            MidiMessage::ProgramChange(p) => {
                vec![0xC0 + (p.midi.channel - 1), p.value]
            }
            MidiMessage::ControlChange(p) => {
                vec![0xB0 + (p.midi.channel - 1), p.cc.cc, p.cc.value]
            }
            MidiMessage::Pitchbend(p) => {
                let lsb = (p.value & 0x7F) as u8;
                let msb = ((p.value >> 7) & 0x7F) as u8;
                vec![0xE0 + p.midi.channel, lsb, msb]
            }
            MidiMessage::Unknown => vec![],
            MidiMessage::TimingClock => vec![0xF8],
            MidiMessage::Start => vec![0xFA],
            MidiMessage::Continue => vec![0xFB],
            MidiMessage::Stop => vec![0xFC],
            MidiMessage::SongPositionPointer(p) => {
                let lsb = (p.value & 0x7F) as u8;
                let msb = ((p.value >> 7) & 0x7F) as u8;
                vec![0xF2, lsb, msb]
            }
            MidiMessage::SysEx(p) => p.data.clone(),
            MidiMessage::ChannelPressure(p) => {
                vec![0xD0 + p.midi.channel, p.pressure]
            }
            MidiMessage::Aftertouch(p) => {
                vec![0xA0 + p.midi.channel, p.note.note, p.note.velocity]
            }
        }
    }
}
