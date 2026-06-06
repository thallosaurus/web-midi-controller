#with import <nixpkgs> {};
{ pkgs, stdenv, definitions, widgets }:
stdenv.mkDerivation {
  name = "homebrewdj-overlay-host";
  buildInputs = with pkgs; [
#    definitions
#    nodePackages.create-react-app
    nodejs
    yarn
  ];

  src = ./.;
  buildPhase = ''
    mkdir -p $out/node_modules
    ln -s ${definitions} $out/node_modules/definitions
    ln -s ${widgets} $out/node_modules/widgets

    yarn
    yarn build
  '';

  installPhase = ''
    cp dist $out/app
  '';
}