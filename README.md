# MIDI-Controller

### TODOs
    - MIDI Input
    - More Widgets:
        - Rotaries
        - Step Sequencer

## Installation
#### Prebuilt Release
Download and run the latest Release from the "Releases" Tab. Download the executable for your OS and the `overlay.zip` file which contains prebuilt mappings

Jump to [Mapping](#mapping)

#### Compile from Source
To even get the next features today you also have the possibility to compile everything from source.

You need:
- NodeJS
- yarn
- Rust

Clone the Repo and run the following commands in order:
```bash
cd web 
yarn
yarn build

cd ..
cargo build
```

This will compile everything to a usable state.

#### Mapping
You can create Mappings yourself by placing them inside the overlays folder. Refer to the Repo for examples