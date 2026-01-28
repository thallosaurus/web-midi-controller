
use std::{error::Error, fmt::{Display, write}};
use midir::{MidiIO, MidiInput, MidiOutput};

#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualOutput;

use tokio::{sync::mpsc, task::JoinHandle};

use crate::socket::AppMessage;
//use std::fmt::Display as DebugDisplay;

pub struct MidiSystem {
    output_task: JoinHandle<Result<(), MidiSystemErrors>>,
    //pub(crate) tx: mpsc::Sender<AppMessage>,
}

#[derive(Debug)]
pub enum MidiSystemErrors {
    InitError(midir::InitError),
    ConnectError(midir::ConnectError<MidiOutput>)
}

impl Display for MidiSystemErrors {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MidiSystemErrors::InitError(init_error) => write!(f, "{}", init_error),
            MidiSystemErrors::ConnectError(connect_error) => write!(f, "{}", connect_error),
        }
    }
}

impl MidiSystem {
    pub(crate) fn new(device_name: Option<String>, mut rx: mpsc::Receiver<AppMessage>) -> Result<Self, MidiSystemErrors> {

        Ok(Self {
            output_task: tokio::spawn(async move {
                let device_name = device_name.unwrap_or(String::from("midi control output"));

                let midi_out = MidiOutput::new(&device_name).map_err(|e|MidiSystemErrors::InitError(e))?;
                //let midi_in = MidiInput::new(&device_name).map_err(|e|MidiSystemErrors::InitError(e))?;
                
                // if not on windows
                #[cfg(not(target_os = "windows"))]
                let mut connection = {
                    midi_out.create_virtual(&(device_name + " virtual")).map_err(|e|MidiSystemErrors::ConnectError(e))?
                };

                #[cfg(target_os = "windows")]
                let mut connection = {
                    let c = select_port_by_name(&midi_out, &device_name);
                    midi_out.connect(&c, &device_name).map_err(|e| MidiSystemErrors::ConnectError(e))?
                };

                loop {
                    if let Some(msg) = rx.recv().await {
                        let m: Vec<u8> = msg.into();
                        
                        if let Err(e) = connection.send(&m) {
                            println!("error while sending {:?} to midi", e);
                            break;
                        }
                    } else {
                        break;
                    }

                }
                Ok(())
            }),
            //tx
            //output: midi_out.create_virtual("virtual midi control output").map_err(|e|MidiSystemErrors::ConnectError(e))?
        })
    }

    /*pub(crate) async fn send_update(&self, msg: AppMessage) {
        self.tx.send(msg).await.expect("failed to send message to midi system")
    }*/
}

#[cfg(target_os = "windows")]
/// Select MIDI Device by Name
fn select_port_by_name<T: MidiIO>(midi_io: &T, search: &String) -> T::Port {
    let midi_ports = midi_io.ports();

    let possible: Vec<T::Port> = midi_ports
        .iter()
        .enumerate()
        .filter(|(_, v)| {
            let name = midi_io.port_name(v).unwrap();
            return name.trim() == search.trim();
        })
        .map(|(_, p)| p.clone())
        .collect();

    possible.first().cloned().unwrap()
}