use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
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

    #[serde(rename = "empty")]
    Empty,
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct HorizontalMixerProperties {
    controls: Vec<Cells>
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct VerticalMixerProperties {
    controls: Vec<Cells>
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct GridMixerProperties {
    controls: Vec<Cells>,
    w: u8,
    h: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct NoteButtonProperties {
    channel: u8,
    note: u8,
    label: Option<String>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct CCSliderProperties {
    channel: u8,
    cc: u8,
    mode: SliderMode,
    vertical: bool
}

#[derive(Serialize, Deserialize, Debug)]
enum SliderMode {

    #[serde(rename = "relative")]
    Relative,
    
    #[serde(rename = "absolute")]
    Absolute,

    #[serde(rename = "snapback")]
    Snapback
}

#[derive(Serialize, Deserialize, Debug)]
pub(super) struct CCButtonProperties {

}

#[derive(Serialize, Deserialize, Debug)]
enum ButtonMode {
    
    #[serde(rename = "trigger")]
    Trigger,
    
    #[serde(rename = "latch")]
    Latch
}