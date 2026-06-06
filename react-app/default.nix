#with import <nixpkgs> {};
{ pkgs, stdenv, definitions, widgets }:
let 
  modules = pkgs.mkYarnPackage {
    name = "modules";
    src = ./.;
  };
in 
stdenv.mkDerivation {
  name = "frontend";
  version = "0.1.0";
  src = ./.;
  buildInputs = [pkgs.yarn modules];

  buildPhase = ''
    export HOME=$PWD
    export TMPDIR=$PWD/tmp
    export npm_config_cache=$PWD/.npm-cache
    export YARN_CACHE_FOLDER=$PWD/.yarn-cache

    ${pkgs.yarn}/bin/yarn build --offline
    ln -s ${modules}/libexec/react-app/node_modules node_modules
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist/* $out/
  '';
}