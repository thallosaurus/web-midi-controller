{ pkgs, stdenv, midi-driver, traktor-driver, launchpad-driver }:
let
  dnt = builtins.fetchurl {
    url = "https://jsr.io/@deno/dnt/0.42.3/mod.ts";
    sha256 = "sha256:1ri5z1pb23kyrpy0j37s2kh95bk3r12jzscck4bigrsw9755iyai";
  };

  launcher = pkgs.writeShellScriptBin "homebrewdj" ''
    SCRIPT_DIR="$(dirname "$0")"
    LIBRARY=${midi-driver}/lib/libmidi_driver.so RUST_LOG=trace ${pkgs.deno}/bin/deno run --no-lock --import-map=${importmap} -A "$SCRIPT_DIR/main.ts"
  '';

  importmap = pkgs.writeTextFile {
    name = "deno.json";
    text = ''
    {
      "imports": {
        "@deno/dnt": "${dnt}",
        "@traktor": "${traktor-driver}/main.ts",
        "@launchpad": "${launchpad-driver}/main.ts",
        "@driver": "${midi-driver}/deno/index.ts",
        "@driver-deno": "${midi-driver}/deno/ffi.ts",
        "oak": "https://deno.land/x/oak/mod.ts"
      }
    }
  '';
  };
in
stdenv.mkDerivation {
  name = "homebrewdj";
  version = "0.1.0";
  src = ./.;
  buildInputs = [ pkgs.deno ];
  buildPhase = ''
    export DENO_DIR=$PWD/.deno
#    deno cache --frozen --import-map=${importmap} --lock=deno.lock main.ts
#    deno compile --frozen --import-map=${importmap} --lock=deno.lock --output homebrewdj $sourceRoot/main.ts
  '';

  installPhase = ''
    mkdir -p $out/bin
 #   cp homebrewdj $out/bin/homebrewdj
    cp *.ts $out/
    cp -r client $out/client
    ln -s ${importmap} $out/deno.json
    cp config.nix.json $out/config.json
    ln -s ${launcher}/bin/homebrewdj $out/homebrewdj
    #cp ${midi-driver}/lib/libmidi_driver.so $out/libmidi_driver.so
  '';
}
