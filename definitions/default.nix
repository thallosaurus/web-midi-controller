#with import <nixpkgs> {};
{ pkgs }:
pkgs.stdenv.mkDerivation {
  name = "react-bootstrap-shell";
  buildInputs = with pkgs; [
#    nodePackages.create-react-app
    deno
    rustc
    cargo
  ];
  src = ./.;
  
  buildPhase = ''
    mkdir -p $out
    deno task build
  '';

  installPhase = ''
    cp -r bindings $out/bindings
    cp -r main.ts $out/main.ts
    cp -r package.json $out/package.json
  '';
}