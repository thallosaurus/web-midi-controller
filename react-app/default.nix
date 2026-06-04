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
    ln -s ${definitions} node_modules/definitions
    ln -s ${widgets} node_modules/widgets

    yarn
    yarn build
  '';

  installPhase = ''
    mkdir -p $out
    cp dist $out/app
  '';
}