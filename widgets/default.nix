#with import <nixpkgs> {};
{ pkgs, stdenv, definitions }:
stdenv.mkDerivation(finalAttrs: {
  name = "homebrewdj-widgets";
  buildInputs = with pkgs; [
#    definitions
#    nodePackages.create-react-app
    nodejs
    yarn
  ];

  offlineCache = pkgs.fetchYarnDeps {
    yarnLock = "${finalAttrs.src}/yarn.lock";
    hash = "sha256-o8dDPLUE2MFQyS1r73PMMFYhXiqfQEoXBK9qyX/WNFU=";
  };

  src = ./.;

  nativeBuildInputs = with pkgs; [
    yarn
    fixup-yarn-lock
    nodejs
  ];

  configurePhase = ''
    runHook preConfigure

    export HOME=$(mktemp -d)
    yarn config --offline set yarn-offline-mirror ${finalAttrs.offlineCache}
    fixup-yarn-lock yarn.lock
    yarn install --offline --frozen-lockfile --ignore-platform --ignore-scripts --no-progress --non-interactive
    patchShebangs node_modules/

    runHook postConfigure
  '';

  buildPhase = ''
    ln -s ${definitions} node_modules/definitions
    yarn build
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist $out/dist
    cp package.json $out/package.json
  '';
})