use serde::{Deserialize, Serialize};
use tokio::fs;
use ts_rs::TS;

use crate::widget::{BaseProperties, Widget};

/// A single overlay. Sets all properties for the resulting HTML element
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Overlay.ts")]
pub struct Overlay {

    /// Name used for Identification in the UI
    name: String,

    /// Overlay Global MIDI Channel
    channel: Option<u8>,

    #[serde(flatten)]
    base: BaseProperties,

    /// The child elements of this Overlay
    cells: Vec<Widget>,
}

pub async fn load(path: &str) -> Vec<Overlay> {
    let mut overlays = vec![];
    let paths = std::fs::read_dir(path).unwrap();
    for path in paths {
        let p = path.unwrap().path();
        if let Some(ext) = p.extension()
            && ext == "json"
        {
            let contents = fs::read_to_string(p.as_path()).await.unwrap();
            
            let json: Overlay = serde_json::from_str(&contents).unwrap();
            //println!("{:?}", json);
            overlays.push(json);
        } else if let Some(ext) = p.extension() && ext == "toml" {
            let contents = fs::read_to_string(p.as_path()).await.unwrap();

            let toml: Overlay = toml::from_str(&contents).unwrap();
            overlays.push(toml);
        }
    }

    overlays
}
