use midir::MidiOutputConnection;
use midir::{MidiIO, MidiInput, MidiInputConnection, MidiOutput};
use tokio::sync::Mutex;
use std::fmt::Display;
use std::sync::Arc;

#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualInput;
#[cfg(not(target_os = "windows"))]
use midir::os::unix::VirtualOutput;

use tokio::{
    sync::{broadcast, mpsc},
    task::JoinHandle,
};

use crate::sock::inbox::{MessageResponder, MessageType, SharedMessageResponder};
use crate::state::messages::AppMessage;

//use std::fmt::Display as DebugDisplay;

pub struct MidiSystem {
    //output_task: JoinHandle<Result<(), MidiSystemErrors>>,
    //input_task: JoinHandle<Result<(), MidiSystemErrors>>, //pub(crate) tx: mpsc::Sender<AppMessage>,
    midi_input: MidiInputConnection<SharedMessageResponder>,
    midi_output: MidiOutputConnection,
    midi_output_rx: mpsc::Receiver<AppMessage>,
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
    fn init_input(
        device_name: String,
        responder: SharedMessageResponder
    ) -> Result<MidiInputConnection<SharedMessageResponder>, MidiSystemErrors> {
        let midi_in = MidiInput::new(&device_name).map_err(|e| MidiSystemErrors::InitError(e))?;

        #[cfg(target_os = "windows")]
        let midi_in_conn = {
            let port = select_port_by_name(&midi_in, &input_name.clone());
            midi_in
                .connect(&port, &input_name, Self::input_task, input_tx)
                .expect("error connecting to midi port")
        };

        #[cfg(not(target_os = "windows"))]
        let midi_in_conn = midi_in
            .create_virtual(&("virtual input port"), Self::input_task, responder)
            .map_err(|e| MidiSystemErrors::InputConnectError(e))?;

        Ok(midi_in_conn)
    }

    fn init_output(
        device_name: String,
        //mut output_rx: mpsc::Receiver<AppMessage>,
    ) -> Result<MidiOutputConnection, MidiSystemErrors> {
        let midi_out =
            MidiOutput::new(&device_name.clone()).map_err(|e| MidiSystemErrors::InitError(e))?;

        // if not on windows
        #[cfg(not(target_os = "windows"))]
        let out_connection = {
            midi_out
                .create_virtual(&(device_name.clone() + " virtual"))
                .map_err(|e| MidiSystemErrors::OutputConnectError(e))?
        };

        #[cfg(target_os = "windows")]
        let out_connection = {
            let c = select_port_by_name(&midi_out, &device_name);
            midi_out
                .connect(&c, &device_name)
                .map_err(|e| MidiSystemErrors::OutputConnectError(e))?
        };

        Ok(out_connection)
    }

    pub(crate) fn new(
        device_name: Option<String>,
        midi_output_rx: mpsc::Receiver<AppMessage>,
        responder: SharedMessageResponder
        //system_messages: ()
    ) -> Result<(), MidiSystemErrors> {
        let output_name = device_name
            .clone()
            .unwrap_or(String::from("midi control output"));
        let input_name = device_name
            .clone()
            .unwrap_or(String::from("midi control input"));

        /*let input = Self::init_input(input_name, input_tx).expect("error opeing midi input");
        let output = Self::init_output(output_name).expect("error opening midi output");*/

        let system = MidiSystem {
            // passing input_tx, because midi input needs to send out (transfer)
            midi_input: Self::init_input(input_name, responder.clone())
                .expect("error opeing midi input"),

            // not passing output_rx, because we need to implement it ourselves
            midi_output: Self::init_output(output_name).expect("error opening midi output"),
            midi_output_rx, //system_input: output_rx
        };

        //let device_name = output_name;
        tokio::spawn(async move {
            let system = system;
            Self::output_task(system.midi_output_rx, system.midi_output, responder.clone()).await
        });

        Ok(())
    }

    /*pub(crate) async fn send_update(&self, msg: AppMessage) {
        self.tx.send(msg).await.expect("failed to send message to midi system")
    }*/

    fn input_task(ts: u64, data: &[u8], e: &mut SharedMessageResponder) {
        let msg: AppMessage = Vec::from(data).into();
        println!("{} midi input: {:?}", ts, msg);        
        MessageResponder::send_message_sync(e, MessageType::Broadcast { from: None, data: msg });
        //e.blocking_lock().send_message(MessageType::Broadcast { from: None, data: msg });
    }

    async fn output_task(
        mut midi_output_rx: mpsc::Receiver<AppMessage>,
        mut midi_output: MidiOutputConnection,
        responder: SharedMessageResponder
    ) {
        //start midi here
        loop {
            if let Some(msg) = midi_output_rx.recv().await {
                let m: Vec<u8> = msg.into();

                println!("sending midi message: {:?}", msg);

                if let Err(e) = midi_output.send(&m) {
                    println!("error while sending {:?} to midi", e);
                    break;
                }
            } else {
                break;
            }
        }
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
