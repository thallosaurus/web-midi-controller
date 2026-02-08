use serde::{Deserialize, Serialize};
//use ts_rs::TS;

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
//#[ts(export, export_to = "SocketMessages.ts")]
pub struct MidiPayload {
    pub channel: u8
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
//#[ts(export, export_to = "SocketMessages.ts")]

pub struct NotePayload {
    //on: bool,
    pub note: u8,
    pub velocity: u8
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
//#[ts(export, export_to = "SocketMessages.ts")]
pub struct CCPayload {
    pub cc: u8,
    pub value: u8
}

//#[derive(Clone, Copy, Serialize, Deserialize, Debug, TS)]
//#[ts(export, export_to = "SocketMessages.ts")]
#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
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

        value: u8
    },
    ControlChange {
        #[serde(flatten)]
        midi: MidiPayload,

        #[serde(flatten)]
        cc: CCPayload
    },
    Unknown
}

impl From<Vec<u8>> for MidiMessage {
    fn from(data: Vec<u8>) -> Self {
        match data.as_slice() {
            [0x90..=0x9F, note, vel] if *vel > 0 => {
                let ch = data[0] - 0x90;
                //let n = (*note).into();
                //Self::NoteOn(ch, n, *vel)
                /*Self::NoteOn {
                    midi_channel: ch + 1,
                    on: true,
                    note: *note,
                    velocity: *vel,
                }*/
                Self::NoteOn { midi: MidiPayload { channel: ch + 1 }, note: NotePayload { note: *note, velocity: *vel } }
            }
            [0x80..=0x8F, note, _] => {
                let ch = data[0] - 0x80;
                //let n = (*note).into();
/*                 Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                } */
                Self::NoteOff { midi: MidiPayload { channel: ch + 1 }, note: NotePayload { note: *note, velocity: 0} }
                //Self::NoteOff(ch, n)
            }
            [0xC0..=0xCF, val] => {
                // Program changes
                let ch = data[0] - 0xC0;
                /* Self::ProgramChange {
                    midi_channel: ch + 1,
                    value: *val,
                } */
               Self::ProgramChange { midi: MidiPayload { channel: ch }, value: *val }
            }
            [0x90..=0x9F, note, 0] => {
                let ch = data[0] - 0x90;
                //Self::Note(ch, n)
                /*Self::NoteUpdate {
                    midi_channel: ch + 1,
                    on: false,
                    note: *note,
                    velocity: 0,
                }*/

                Self::NoteOff { midi: MidiPayload { channel: ch + 1 }, note: NotePayload { note: *note, velocity: 0 } }
            }

            [0xB0..=0xBF, cc, val] => {
                let ch = data[0] - 0xB0;
                //let n = (*note).into();
                //Self::AfterTouch(ch, n, *vel)
                /*Self::CCUpdate {
                    midi_channel: ch + 1,
                    value: *val,
                    cc: *cc,
                }*/
                Self::ControlChange { midi: MidiPayload { channel: ch + 1 }, cc: CCPayload { cc: *cc, value: *val } }
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
            MidiMessage::NoteOn { midi, note } => vec![0x90 + (midi.channel - 1), note.note, note.velocity],
            MidiMessage::NoteOff { midi, note } => vec![0x80 + (midi.channel - 1), note.note, note.velocity],
            MidiMessage::ProgramChange { midi, value } => vec![0xC0 + (midi.channel - 1), value],
            MidiMessage::ControlChange { midi, cc } => vec![0xB0 + (midi.channel - 1), cc.cc, cc.value],
            MidiMessage::Unknown => vec![],
        }
    }
}