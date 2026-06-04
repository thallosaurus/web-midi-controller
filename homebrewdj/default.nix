{ pkgs, stdenv, midi-driver }:
let
  dnt = builtins.fetchurl {
    url = "https://jsr.io/@deno/dnt/0.42.3/mod.ts";
    sha256 = "sha256:1ri5z1pb23kyrpy0j37s2kh95bk3r12jzscck4bigrsw9755iyai";
  };

  oak = builtins.fetchurl {
    url = "https://deno.land/x/oak/mod.ts";
    sha256 = "sha256:164fqqkpskpf1l4j7s6i2ww92ajdprr9p3kvmz70wc9qc4d38hhz";
  };

  importmap = pkgs.writeTextFile {
    name = "deno.json";
    text = ''
    {
      "imports": {
        "@deno/dnt": "${dnt}",
        "@traktor": "../traktor-driver/main.ts",
        "@launchpad": "../launchpad-driver/main.ts",
        "@driver": "${midi-driver}/deno/index.ts",
        "@driver-deno": "${midi-driver}/deno/ffi.ts",
        "oak": "${oak}"
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
  installPhase = ''
    mkdir -p $out
    ln -s ${importmap} $out/deno.json
    cp main.ts $out/main.ts
    cp server.ts $out/server.ts
  '';
    #//deno cache --import-map ${deno-config} --lock deno.lock main.ts
    #ln -s ${deno-config} deno.json
}