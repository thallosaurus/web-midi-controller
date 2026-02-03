todo backend:
- OSC publisher (for music video integration)
- Prettier Rust Logging with tracing (we already got that crate)


todo widgets:
- widgets class based architecture (classes exist and are working, but it could be prettier)
- note button latch?
- XY Pad
- Shift Area/Button
- midi clock
- step sequencer
- documentation (kinda?)
- tests
- file based loader (better said: dont make loading depend on fetch - could be useful for tauri/electron/native implementation)
- Scan for host on connect page
- Distler-friendly installation guide
- xypad mapping mode

laters:
- Ableton User Mapping
- Haptic Touch via WebKit App
- offline "daw" mode with funDSP
- on device edit mode

to be fixed:
- dialogs css
- double tap to zoom on iOS

settings:
- device id for program changes

Bugs:
- XYPad sometimes sends values over 127 and very weird things