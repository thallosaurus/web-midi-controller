# MIDI-Controller

### TODOs
    - MIDI Input
    - More Widgets:
        - Rotaries
        - Step Sequencer

## Installation
#### Prebuilt Release
Download and run the latest Release from the "Releases" Tab. Jump to [Mapping](#mapping)

#### Compile from Source
To even get the next features today you also have the possibility to compile everything from source.

You need:
- NodeJS
- yarn
- Deno

Clone the Repo and run the following commands:
```bash
deno task build:ui
deno task compile
```

You will find the compiled binary in the `bin` Folder.

## Mapping
To see something on the screen, you can create the mapping yourself or use a premapped file (See [overlays/ableton-performance.json](overlays/ableton-performance.json) for an example). Create a folder called `overlays`, put it next to the binary and put all mapping JSON files into it. Create `overlays/css/custom.css` to add custom CSS Styles for your mappings