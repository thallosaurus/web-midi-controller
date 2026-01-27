use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
#[serde(tag = "type")]
pub(super) enum Cells {
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

    #[serde(rename = "empty")]
    Empty,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct HorizontalMixerProperties {
    controls: Vec<Cells>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct VerticalMixerProperties {
    controls: Vec<Cells>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct GridMixerProperties {
    controls: Vec<Cells>,
    w: u8,
    h: u8,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct NoteButtonProperties {
    channel: u8,
    note: u8,
    label: Option<String>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct CCSliderProperties {
    channel: u8,
    cc: u8,
    mode: SliderMode,
    vertical: Option<bool>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
enum SliderMode {

    #[serde(rename = "relative")]
    Relative,
    
    #[serde(rename = "absolute")]
    Absolute,

    #[serde(rename = "snapback")]
    Snapback
}


/*export interface CCButtonOptions {
    label?: string;
    channel: number;
    cc: number;
    value: number;
    value_off?: number;
    mode: string;
}*/

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct CCButtonProperties {
    label: Option<String>,
    channel: u8,
    cc: u8,
    value: u8,
    value_off: Option<u8>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub(super) struct RotarySliderProperties {
    channel: u8,
    cc: u8,
    label: Option<String>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
enum ButtonMode {
    
    #[serde(rename = "trigger")]
    Trigger,
    
    #[serde(rename = "latch")]
    Latch
}