
use std::error::Error;
use midir::{MidiIO, MidiOutput};

#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualOutput;

use tokio::{sync::mpsc, task::JoinHandle};

use crate::socket::AppMessage;

pub(crate) struct MidiSystem {
    output_task: JoinHandle<Result<(), MidiSystemErrors>>,
    pub(crate) tx: mpsc::Sender<AppMessage>,
}

#[derive(Debug)]
pub enum MidiSystemErrors {
    InitError(midir::InitError),
    ConnectError(midir::ConnectError<MidiOutput>)
}

impl MidiSystem {
    pub(crate) fn new(device_name: Option<String>) -> Result<Self, MidiSystemErrors> {
        let (tx, mut rx) = mpsc::channel::<AppMessage>(64);
        Ok(Self {
            output_task: tokio::spawn(async move {
                let device_name = device_name.unwrap_or(String::from("midi control output"));

                let midi_out = MidiOutput::new(&device_name).map_err(|e|MidiSystemErrors::InitError(e))?;
                
                // if not on windows
                #[cfg(not(target_os = "windows"))]
                let mut connection = {
                    midi_out.create_virtual(&(device_name + " virtual")).map_err(|e|MidiSystemErrors::ConnectError(e))?
                };

                #[cfg(target_os = "windows")]
                let mut connection = {
                    let c = select_port_by_name(&midi_out, &device_name).unwrap();
                    midi_out.connect(&c, &device_name).unwrap()
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
            tx
            //output: midi_out.create_virtual("virtual midi control output").map_err(|e|MidiSystemErrors::ConnectError(e))?
        })
    }

    pub(crate) async fn send_update(&self, msg: AppMessage) {
        self.tx.send(msg).await.expect("failed to send message to midi system")
    }
}

#[cfg(target_os = "windows")]
/// Select MIDI Device by Name
fn select_port_by_name<T: MidiIO>(midi_io: &T, search: &String) -> Result<T::Port, Box<dyn Error>> {
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

    Ok(possible.first().cloned().unwrap())
}