use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// MARK: - Shared
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct BaseProperties {

    /// The elements Id, which also gets used as its HTML Id.
    /// Use it to refer to this element in Custom CSS Styles
    id: Option<String>
}

/// Shared Properties for all Midi Widgets
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct MidiProperties {
    /// The midi channel the widget sends on. 1 = Channel 1; 0 is Overlay Global Channel
    channel: u8
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct ButtonProperties {
    label: Option<String>,
    mode: ButtonMode
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct CCProperties {
    cc: u8,
    value: Option<u8>,

    /// May be redundant?
    value_off: Option<u8>,
    default_value: Option<u8>,
    //label: Option<String>
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct ChildrenContainer {
    controls: Vec<Widget>
}

/// MARK: - JSON Definitions

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
#[serde(tag = "type")]
pub(super) enum Widget {
    /// Horizontal Flex
    /// Gives you a layer that conforms to the CSS flexbox
    #[serde(rename = "horiz-mixer")]
    HorizontalMixer(HorizontalMixerProperties),
    
    /// Same as [Widget::HorizontalMixer], but is vertical
    #[serde(rename = "vert-mixer")]
    VerticalMixer(VerticalMixerProperties),
    
    /// Gives you a CSS Grid which centers all elements as cells
    #[serde(rename = "grid-mixer")]
    GridMixer(GridMixerProperties),

    /// A button that sends MIDI Notes
    #[serde(rename = "notebutton")]
    NoteButton(NoteButtonProperties),

    /// A slider that sends out CC values
    #[serde(rename = "ccslider")]
    CCSlider(CCSliderProperties),

    /// A button that sends out CC values
    #[serde(rename = "ccbutton")]
    CCButton(CCButtonProperties),

    /// A rotary slider that sends out CC values
    #[serde(rename = "rotary")]
    RotarySlider(RotarySliderProperties),

    /// An input that sends out relative CC values (3Fh/41h)
    #[serde(rename = "jogwheel")]
    Jogwheel(JogwheelProperties),

    /// An empty cell useful as a grid placeholder
    #[serde(rename = "empty")]
    Empty,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct HorizontalMixerProperties {
    //id: Option<String>,

    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    children: ChildrenContainer,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct VerticalMixerProperties {
    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    children: ChildrenContainer,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct GridMixerProperties {
    /// Element Id of this Overlay - can be anything. Is assigned to the HTML Element
    /// for referencing it in CSS
    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    children: ChildrenContainer,

    /// Columns of this grid
    w: u8,

    /// Rows of this grid
    h: u8,
}

/// A single Notebutton. Sends out its defined Midi Note
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct NoteButtonProperties {
    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    midi: MidiProperties,

    #[serde(flatten)]
    button: ButtonProperties,

    note: u8,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct CCSliderProperties {
    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    midi: MidiProperties,

    #[serde(flatten)]
    ccprop: CCProperties,


    label: Option<String>,

    mode: SliderMode,
    //default_value: Option<u8>,
    vertical: Option<bool>,

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
    #[serde(flatten)]
    base: BaseProperties,
    #[serde(flatten)]
    midi: MidiProperties,

    #[serde(flatten)]
    button: ButtonProperties,

    #[serde(flatten)]
    ccprop: CCProperties,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct JogwheelProperties {
    #[serde(flatten)]
    base: BaseProperties,
    
    #[serde(flatten)]
    midi: MidiProperties,

    #[serde(flatten)]
    ccprop: CCProperties,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Widget.ts")]
pub(super) struct RotarySliderProperties {
    #[serde(flatten)]
    base: BaseProperties,

    #[serde(flatten)]
    midi: MidiProperties,

    #[serde(flatten)]
    ccprop: CCProperties,

    label: Option<String>,

    mode: RotaryMode,
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