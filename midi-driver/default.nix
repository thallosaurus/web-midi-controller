{ pkgs, rustPlatform, buildPackages, ... }:

pkgs.rustPlatform.buildRustPackage {
  pname = "midi-driver";
  version = "0.1.13";
  src = ./.;

  nativeBuildInputs = with pkgs; [
    pkgconf
    gcc
    deno
  ];
  buildInputs = with pkgs; [
    alsa-lib.dev
  ];

  cargoLock.lockFile = ./Cargo.lock;

  postBuild = ''
    cargo test export_bindings
    mkdir -p $out/npm
    mkdir -p $out/deno
    cp deno.json $out/deno/deno.json
    cp package.node.json $out/npm/package.json
    cp -r bindings/ $out/deno/bindings

    cp index.ts $out/deno/index.ts    
    cp ffi.ts $out/deno/ffi.ts
  '';
    #deno bundle index.ts > $out/npm/index.js
}