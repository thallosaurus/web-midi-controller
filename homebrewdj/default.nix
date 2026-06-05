{ pkgs, stdenv, midi-driver, traktor-driver, launchpad-driver }:
let
  dnt = builtins.fetchurl {
    url = "https://jsr.io/@deno/dnt/0.42.3/mod.ts";
    sha256 = "sha256:1ri5z1pb23kyrpy0j37s2kh95bk3r12jzscck4bigrsw9755iyai";
  };

  #oak = builtins.fetchurl {
  #  url = "https://deno.land/x/oak/mod.ts";
  #  sha256 = "sha256:164fqqkpskpf1l4j7s6i2ww92ajdprr9p3kvmz70wc9qc4d38hhz";
  #};
  /*oak = stdenv.mkDerivation {
    name = "oak-deno";
    src = pkgs.fetchFromGitHub {
      owner = "oakserver";
      repo = "oak";
      rev = "v17.2.0";
      hash = "sha256-2fDXedLE5z7ZRT5H6kWEH6EehgoQQN5jrfPEMcWDrOs=";
    };
    installPhase = ''
      cp -r . $out
    '';
  };*/

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
    deno cache --frozen --import-map=${importmap} --lock=deno.lock $sourceRoot/main.ts
    deno compile --frozen --lock=deno.lock --output homebrewdj main.ts
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp homebrewdj $out/bin/homebrewdj
    cp ${midi-driver}/lib/libmidi_driver.so $out/libmidi_driver.so
  '';
}