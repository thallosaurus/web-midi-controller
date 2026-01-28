use serde::{Deserialize, Serialize};
use tokio::fs;
use ts_rs::TS;

use crate::widget::Widget;

//use crate::widgets::cell::Cells;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export, export_to = "Overlay.ts")]
pub struct Overlay {
    name: String,
    id: Option<String>,

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
        }
    }

    overlays
}
