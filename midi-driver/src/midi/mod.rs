use midir::{MidiInput, MidiOutput, PortInfoError};

pub mod messages;
pub mod system;

#[derive(Debug)]
pub enum PortListError {
    PortNotValid(PortInfoError),
}

#[derive(Debug)]
pub struct PortList {
    _inputs: Vec<String>,
    _outputs: Vec<String>,
}

pub fn default_list() -> Result<PortList, PortListError> {
    let midi_in = MidiInput::new(&"midi device lookup").unwrap();
    let midi_out = MidiOutput::new(&"midi device lookup").unwrap();

    list(midi_in, midi_out)
}

fn list(midi_in: MidiInput, midi_out: MidiOutput) -> Result<PortList, PortListError> {
    let mut _inputs = Vec::new();
    let mut _outputs = Vec::new();

    for (_, p) in midi_in.ports().iter().enumerate() {
        //println!("{}: {} (ID: \"{}\")", i, midi_in.port_name(p).unwrap(), p.id());
        let port = midi_in
            .port_name(p)
            .map_err(|e| PortListError::PortNotValid(e))?;
        _inputs.push(port);
    }

    for (_, p) in midi_out.ports().iter().enumerate() {
        //println!("{}: {} (ID: \"{}\")", i, midi_out.port_name(p)?, p.id());
        let port = midi_out
            .port_name(p)
            .map_err(|e| PortListError::PortNotValid(e))?;
        _outputs.push(port);
    }

    Ok(PortList { _inputs, _outputs })
}
