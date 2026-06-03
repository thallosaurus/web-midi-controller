#with import <nixpkgs> {};
{ pkgs, stdenv, definitions }:
stdenv.mkDerivation {
  name = "react-bootstrap-shell";
  buildInputs = with pkgs; [
#    definitions
#    nodePackages.create-react-app
    nodejs
    yarn
  ];

  src = ./.;
  buildPhase = ''
    echo $out
    mkdir -p $out/definitions
    cp -r ${definitions} $out/definitions
    yarn
    yarn build
  '';

  installPhase = ''
    cp dist $out/app
  '';
}