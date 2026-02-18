use midir::MidiOutputConnection;
use midir::{MidiIO, MidiInput, MidiInputConnection, MidiOutput};
use std::fmt::Display;
use std::sync::{self, Arc, Mutex};
use std::thread;

#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualInput;
#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualOutput;

use crate::midi::messages::MidiMessage;

//use std::fmt::Display as DebugDisplay;

type ReturnOutputSenderType = sync::mpsc::Sender<MidiMessage>;

pub struct MidiSystem {
    _midi_input: MidiInputConnection<sync::mpsc::Sender<Vec<u8>>>,
    //midi_output: MidiOutputConnection,
}

#[derive(Debug)]
pub enum MidiSystemErrors {
    InitError(midir::InitError),
    OutputConnectError(midir::ConnectError<MidiOutput>),
    InputConnectError(midir::ConnectError<MidiInput>),
    NotSupported,
    DeviceNotFound(String),
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
            MidiSystemErrors::NotSupported => {
                write!(f, "virtual midi ports are not supported on this system")
            }
            MidiSystemErrors::DeviceNotFound(name) => {
                write!(f, "physical device with name {} not found", name)
            }
        }
    }
}

//type MidiOutputReceiver = mpsc::Receiver<MidiMessage>;

impl MidiSystem {
    fn init_virtual_input(
        device_name: String,
        responder: sync::mpsc::Sender<Vec<u8>>,
    ) -> Result<MidiInputConnection<sync::mpsc::Sender<Vec<u8>>>, MidiSystemErrors> {
        #[cfg(not(target_os = "windows"))]
        {
            let midi_in =
                MidiInput::new(&(device_name.clone() + " (input)")).map_err(|e| MidiSystemErrors::InitError(e))?;
            return Ok(midi_in
                .create_virtual(&(device_name.clone() + " (input)"), Self::input_callback, responder)
                .map_err(|e| MidiSystemErrors::InputConnectError(e))?);
        }

        #[cfg(target_os = "windows")]
        return Err(MidiSystemErrors::NotSupported);
        //panic!("cant create virtual ports on windows")
    }

    fn init_virtual_output(
        device_name: String,
        //mut output_rx: mpsc::Receiver<AppMessage>,
    ) -> Result<MidiOutputConnection, MidiSystemErrors> {
        #[cfg(not(target_os = "windows"))]
        {
            let midi_out = MidiOutput::new(&(device_name.clone() + " (output)"))
                .map_err(|e| MidiSystemErrors::InitError(e))?;

            return Ok(midi_out
                .create_virtual(&(device_name.clone() + " (output)"))
                .map_err(|e| MidiSystemErrors::OutputConnectError(e))?);
        }

        #[cfg(target_os = "windows")]
        return Err(MidiSystemErrors::NotSupported);
    }

    fn init_physical_input(
        device_name: String,
        responder: sync::mpsc::Sender<Vec<u8>>,
    ) -> Result<MidiInputConnection<sync::mpsc::Sender<Vec<u8>>>, MidiSystemErrors> {
        let midi_in = MidiInput::new(&device_name).map_err(|e| MidiSystemErrors::InitError(e))?;
        if let Some(port) = select_port_by_name(&midi_in, &device_name.clone()) {
            Ok(midi_in
                .connect(&port, &device_name, Self::input_callback, responder)
                .expect("error connecting to midi port"))
        } else {
            Err(MidiSystemErrors::DeviceNotFound(device_name))
        }
    }

    fn init_physical_output(device_name: String) -> Result<MidiOutputConnection, MidiSystemErrors> {
        let midi_out =
            MidiOutput::new(&device_name.clone()).map_err(|e| MidiSystemErrors::InitError(e))?;

        if let Some(c) = select_port_by_name(&midi_out, &device_name) {
            Ok(midi_out
                .connect(&c, &device_name)
                .map_err(|e| MidiSystemErrors::OutputConnectError(e))?)
        } else {
            Err(MidiSystemErrors::DeviceNotFound(device_name))
        }
    }

    pub(crate) fn new(
        input_device_name: String,
        output_device_name: String,
        use_virtual: bool,
        midi_ingress: sync::mpsc::Sender<Vec<u8>>,
        midi_engress: sync::mpsc::Receiver<Vec<u8>>,
    ) -> Result<Self, MidiSystemErrors> {
        /*let output_name = device_name
            .clone()
            .unwrap_or(String::from("midi control output"));
        let input_name = device_name
            .clone()
            .unwrap_or(String::from("midi control input"));*/

        let input;
        let output;
        if use_virtual {
            println!("using virtual ports");
            input = Self::init_virtual_input(input_device_name, midi_ingress)?;
            output = Self::init_virtual_output(output_device_name)?;
        } else {
            println!("using physical ports");
            input = Self::init_physical_input(input_device_name, midi_ingress)?;
            output = Self::init_physical_output(output_device_name)?;
        }

        let system = MidiSystem {
            // passing input_tx, because midi input needs to send out (transfer)
            _midi_input: input,
        };

        let output = Arc::new(Mutex::new(output));
        thread::spawn(move || {
            loop {
                let msg = midi_engress.recv();

                if let Ok(m) = msg {
                    let payload: Vec<u8> = m.into();
                    println!("egress received: {:#?}, length: {}", payload, payload.len());
                    let mut out = output.lock().unwrap();
                    out.send(&payload).unwrap();
                } else {
                    let e = msg.err().unwrap();
                    println!("{}", e);
                    break;
                }
            }
        });

        Ok(system)
    }

    /// gets called by the midi system when there was data from the midi input
    fn input_callback(ts: u64, data: &[u8], e: &mut sync::mpsc::Sender<Vec<u8>>) {
        let msg= Vec::from(data);
        println!("{} midi input: {:?}", ts, msg);
        if let Err(e) = e.send(msg) {
            println!("{}", e);
        }
    }
}

//#[cfg(target_os = "windows")]
/// Select MIDI Device by Name
fn select_port_by_name<T: MidiIO>(midi_io: &T, search: &String) -> Option<T::Port> {
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

    possible.first().cloned()
}
