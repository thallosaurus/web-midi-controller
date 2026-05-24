# MIDI-Controller

## Installation
### Prebuilt Release
Download and run the latest Release from the "Releases" Tab or [click here](/releases/latest). Download the executable for your OS and the `overlay.zip` file which contains prebuilt mappings

Jump to [Mapping](#mapping)

### Compile from Source
To even get the next features today you also have the possibility to compile everything from source.

You need:
- NodeJS
- yarn
- Rust

Clone the Repo and run the following commands in order:
```bash
cargo test
cd web 
yarn
yarn build

cd ..
cargo build
```

This will compile everything to a usable state.

## Running
Before running the program, you need to download the overlays and place them next to the program. It searches for the `/overlay` folder and loads from it upon request. Ensure that the files are unpacked before running (or create your own)

### Running on Windows
If you are on Windows, you need to download a virtual MIDI driver since Windows lacks an API for it out-of-the-Box. A good and tested one is (https://www.nerds.de/en/loopbe1.html)[https://www.nerds.de/en/loopbe1.html]. Install it and run the executable file the `-n` flag, like so:

```
midi-controller-Windows.exe --inputName="LoopBe Internal MIDI"
```

If you don't install a virtual MIDI Driver you can only control physical MIDI ports.

### Running on MacOS and Linux
Running the executable with the `--inputName` and `--outputName` flag on any other operating system allows you to customize the name of the virtual midi ports spawned by the controller

## Mapping
You can create Mappings yourself by placing them inside the overlays folder. Refer to the Repo for examples. You can also customize the `custom.css` file for advanced CSS styling capabilities