use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
#[serde(tag = "type")]
pub(super) enum Widget {
    #[serde(rename = "horiz-mixer")]
    HorizontalMixer(HorizontalMixerProperties),
    
    #[serde(rename = "vert-mixer")]
    VerticalMixer(VerticalMixerProperties),
    
    #[serde(rename = "grid-mixer")]
    GridMixer(GridMixerProperties),

    #[serde(rename = "notebutton")]
    NoteButton(NoteButtonProperties),

    #[serde(rename = "ccslider")]
    CCSlider(CCSliderProperties),

    #[serde(rename = "ccbutton")]
    CCButton(CCButtonProperties),

    #[serde(rename = "rotary")]
    RotarySlider(RotarySliderProperties),

    #[serde(rename = "jogwheel")]
    Jogwheel(JogwheelProperties),

    #[serde(rename = "empty")]
    Empty,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct HorizontalMixerProperties {
    id: Option<String>,
    controls: Vec<Widget>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct VerticalMixerProperties {
    id: Option<String>,
    controls: Vec<Widget>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct GridMixerProperties {
    id: Option<String>,
    controls: Vec<Widget>,
    w: u8,
    h: u8,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct NoteButtonProperties {
    id: Option<String>,
    channel: u8,
    note: u8,
    label: Option<String>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct CCSliderProperties {
    id: Option<String>,
    channel: u8,
    cc: u8,
    mode: SliderMode,
    default_value: Option<u8>,
    vertical: Option<bool>,
    label: Option<String>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
enum SliderMode {

    #[serde(rename = "relative")]
    Relative,
    
    #[serde(rename = "absolute")]
    Absolute,

    #[serde(rename = "snapback")]
    Snapback
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct CCButtonProperties {
    id: Option<String>,
    label: Option<String>,
    channel: u8,
    cc: u8,
    value: u8,
    value_off: Option<u8>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct JogwheelProperties {
    channel: u8,
    cc: u8,
    id: Option<String>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct RotarySliderProperties {
    id: Option<String>,
    channel: u8,
    cc: u8,
    label: Option<String>,
    mode: RotaryMode,
    default_value: Option<u8>,
}



#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
enum RotaryMode {
    #[serde(rename = "relative")]
    Relative,

    #[serde(rename = "snapback")]
    Snapback,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
enum ButtonMode {
    
    #[serde(rename = "trigger")]
    Trigger,
    
    #[serde(rename = "latch")]
    Latch
}