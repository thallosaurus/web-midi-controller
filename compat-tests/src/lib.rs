pub mod widget;
pub mod overlays;

#[cfg(test)]
mod tests {
    use crate::overlays::{Overlay};

    const EIGHT_X_EIGHT: &'static str = include_str!("../../overlays/8x8-midi-grid.toml");
    const FULLSCREEN_XY_NOTE: &'static str = include_str!("../../overlays/fullscreen-xypad-note.toml");
    const FULLSCREEN_XY: &'static str = include_str!("../../overlays/fullscreen-xypad.toml");
    const PHONE_DUAL_VOLUME: &'static str = include_str!("../../overlays/phone-dual-volume.toml");
    const SHIFT_TEST: &'static str = include_str!("../../overlays/shift-test.toml");
    const TEST: &'static str = include_str!("../../overlays/test.toml");
    const TRAKTOR_DECK_A: &'static str = include_str!("../../overlays/traktor-deck-a.toml");
    const TRAKTOR_DECK_B: &'static str = include_str!("../../overlays/traktor-deck-b.toml");
    const TRAKTOR_DECK_ONE_DEVICE: &'static str = include_str!("../../overlays/traktor-one-device.toml");

    const ABLETON_OVERLAY: &'static str = include_str!("../../overlays/ableton-performance.toml");

    #[tokio::test]
    async fn test_new_cells() {
        let s = "
        name = 'test'
        [[cells]]
        type = 'grid-mixer'
        w = 4
        h = 4

        [[cells.grid]]
        type = 'horiz-mixer'

        [[cells.grid.horiz]]
        type = 'notebutton'
        channel = 1
        note = 2
        mode = 'trigger'

        [[cells.grid.horiz]]
        type = 'notebutton'
        channel = 1
        note = 3
        mode = 'trigger'
        ";

        let _overlay: Overlay = toml::from_str(s).unwrap();
        assert!(true)
    }

    
    #[tokio::test]
    async fn test_eight_x_eight() {
        let t: Overlay = toml::from_str(EIGHT_X_EIGHT).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn fullscreen_xy_note() {
        let t: Overlay = toml::from_str(FULLSCREEN_XY_NOTE).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn fullscreen_xy() {
        let t: Overlay = toml::from_str(FULLSCREEN_XY).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }

    #[tokio::test]
    async fn phone_dual_volume() {
        let t: Overlay = toml::from_str(PHONE_DUAL_VOLUME).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }

    #[tokio::test]
    async fn shift_test() {
        let t: Overlay = toml::from_str(SHIFT_TEST).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn test_test() {
        let t: Overlay = toml::from_str(TEST).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn traktor_deck_a() {
        let t: Overlay = toml::from_str(TRAKTOR_DECK_A).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn traktor_deck_b() {
        let t: Overlay = toml::from_str(TRAKTOR_DECK_B).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    #[tokio::test]
    async fn traktor_deck_one_device() {
        let t: Overlay = toml::from_str(TRAKTOR_DECK_ONE_DEVICE).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }

    #[tokio::test]
    async fn ableton_overlay() {
        let t: Overlay = toml::from_str(ABLETON_OVERLAY).unwrap();
        println!("{:#?}", t);
        assert!(true)
    }
    
    /*#[tokio::test]
    async fn test_demo_loading() {
        let json: Vec<Overlay> = serde_json::from_str(DEMO_OVERLAY).unwrap();
        println!("{:#?}", json);
        assert!(true);
    }*/
}
