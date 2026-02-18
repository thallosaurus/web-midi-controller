const PKG_CONF: &'static str = "prefix=/usr
libdir=${prefix}/lib
includedir=${prefix}/include

Name: midicore
Description: MIDI control runtime
Version: 0.1.12

Libs: -L${libdir} -lmidicore
Cflags: -I${includedir}";

fn main() {
    let crate_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();

    cbindgen::generate(crate_dir)
        .unwrap()
        .write_to_file("native/libmidi_driver.h");

    std::fs::write("native/libmidi_driver.pc", PKG_CONF).unwrap();
}