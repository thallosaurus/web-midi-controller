use midi_controller::widgets::overlays::load;

#[tokio::main]
async fn main() {
    println!("{:?}", load("overlays").await);
}