use midir::{MidiIO, MidiInput, MidiInputConnection, MidiOutput};
use std::fmt::Display;

#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualInput;
#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualOutput;

use tokio::{sync::{broadcast, mpsc}, task::JoinHandle};

use crate::state::messages::AppMessage;


//use std::fmt::Display as DebugDisplay;

pub struct MidiSystem {
    output_task: JoinHandle<Result<(), MidiSystemErrors>>,
    //input_task: JoinHandle<Result<(), MidiSystemErrors>>, //pub(crate) tx: mpsc::Sender<AppMessage>,
    midi_input: MidiInputConnection<broadcast::Sender<AppMessage>>
}

#[derive(Debug)]
pub enum MidiSystemErrors {
    InitError(midir::InitError),
    OutputConnectError(midir::ConnectError<MidiOutput>),
    InputConnectError(midir::ConnectError<MidiInput>),
}

impl Display for MidiSystemErrors {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MidiSystemErrors::InitError(init_error) => write!(f, "{}", init_error),
            MidiSystemErrors::OutputConnectError(connect_error) => {
                write!(f, "output error: {}", connect_error)
            }
            MidiSystemErrors::InputConnectError(connect_error) => {
                write!(f, "input error: {}", connect_error)
            }
        }
    }
}

impl MidiSystem {
    pub(crate) fn new(
        device_name: Option<String>,
        mut output_rx: mpsc::Receiver<AppMessage>,
        input_tx: broadcast::Sender<AppMessage>,
    ) -> Result<Self, MidiSystemErrors> {
        let output_name = device_name.clone().unwrap_or(String::from("midi control output"));
        let _input_name = device_name.clone().unwrap_or(String::from("midi control input"));
        let midi_in = MidiInput::new("input name").map_err(|e| MidiSystemErrors::InitError(e))?;
        #[cfg(target_os = "windows")]
        let midi_in_conn = {
            let port = select_port_by_name(&midi_in, &input_name.clone());
            midi_in.connect(&port, &input_name, midi_in_handler, input_tx).expect("error connecting to midi port")
        };

        Ok(Self {
            output_task: tokio::spawn(async move {
                let device_name = output_name;

                let midi_out =
                    MidiOutput::new(&device_name).map_err(|e| MidiSystemErrors::InitError(e))?;

                // if not on windows
                #[cfg(not(target_os = "windows"))]
                let mut out_connection = {
                    midi_out
                        .create_virtual(&(device_name.clone() + " virtual"))
                        .map_err(|e| MidiSystemErrors::OutputConnectError(e))?
                };

                #[cfg(target_os = "windows")]
                let mut out_connection = {
                    let c = select_port_by_name(&midi_out, &device_name);
                    midi_out
                        .connect(&c, &device_name)
                        .map_err(|e| MidiSystemErrors::OutputConnectError(e))?
                };

                loop {
                    if let Some(msg) = output_rx.recv().await {
                        let m: Vec<u8> = msg.into();

                        if let Err(e) = out_connection.send(&m) {
                            println!("error while sending {:?} to midi", e);
                            break;
                        }
                    } else {
                        break;
                    }
                }
                Ok(())
            }),
            /*input_task: tokio::spawn(async move {
                let device_name = input_name.unwrap_or(String::from("midi control output"));

                #[cfg(not(target_os = "windows"))]
                let mut in_connection = {
                    midi_in
                        .create_virtual(&(device_name.clone() + " virtual"),midi_in_handler, ())
                        .map_err(|e| MidiSystemErrors::InputConnectError(e))?;
                };
                Ok(())
            }),*/ //tx
                //output: midi_out.create_virtual("virtual midi control output").map_err(|e|MidiSystemErrors::ConnectError(e))?
                #[cfg(not(target_os = "windows"))]
                midi_input: midi_in
                        .create_virtual(&("virtual input port"),midi_in_handler, input_tx)
                        .map_err(|e| MidiSystemErrors::InputConnectError(e))?,

                #[cfg(target_os = "windows")]
                midi_input:midi_in_conn
        })
    }

    /*pub(crate) async fn send_update(&self, msg: AppMessage) {
        self.tx.send(msg).await.expect("failed to send message to midi system")
    }*/
}

fn midi_in_handler(_ts: u64, data: &[u8], e: &mut broadcast::Sender<AppMessage>) {
    let msg: AppMessage = Vec::from(data).into();
    //println!("{} midi input: {:?}", ts, msg);s

    if let Err(e) = e.send(msg) {
        eprintln!("error while sending: {e}")
    }
}

//#[cfg(target_os = "windows")]
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
