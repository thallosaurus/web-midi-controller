pub mod widget;
pub mod overlays;

#[cfg(test)]
mod tests {
    use crate::overlays::{Overlay, load};

    const ABLETON_OVERLAY: &'static str = include_str!("../../overlays/ableton-performance.json");
    const DEMO_OVERLAY: &'static str = include_str!("../../web/public/demo_overlay.json");

    #[tokio::test]
    async fn test_loading() {

        let json: Overlay = serde_json::from_str(ABLETON_OVERLAY).unwrap();
        println!("{:#?}", json);
        assert!(true);
    }
    
    #[tokio::test]
    async fn test_demo_loading() {
        let json: Vec<Overlay> = serde_json::from_str(DEMO_OVERLAY).unwrap();
        println!("{:#?}", json);
        assert!(true);
    }
}
