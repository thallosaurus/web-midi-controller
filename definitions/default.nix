#with import <nixpkgs> {};
{ pkgs }:
pkgs.rustPlatform.buildRustPackage {
  pname = "widget-definitions";
    
  src = ./.;
  version = "0.1.0";
  cargoLock = {
    lockFile = ./Cargo.lock;
  };

  postInstall = ''
    cargo test export_bindings
    mkdir -p $out/bindings
    cp -r ./bindings $out/
    cp main.ts $out/main.ts
    cp package.json $out/package.json
  '';
  
#  buildPhase = ''
#    mkdir -p $out
#    deno task build
#  '';

#  installPhase = ''
#    cp -r bindings $out/bindings
#    cp -r main.ts $out/main.ts
#    cp -r package.json $out/package.json
#  '';
}