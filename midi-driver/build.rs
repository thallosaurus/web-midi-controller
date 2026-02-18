fn main() {
    let crate_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();

    cbindgen::generate(crate_dir)
        .unwrap()
        .write_to_file("native/libmidi_driver.h");
}