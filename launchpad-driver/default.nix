{ pkgs, stdenv, midi-driver }:
let
    importmap = pkgs.writeTextFile {
      name = "deno.json";
      text = ''
        {
          "imports": {
            "@driver": "${midi-driver}/index.ts",
            "@driver-deno": "${midi-driver}/deno_mod.ts"
          }
        }
      '';
    };
in
stdenv.mkDerivation {
  name = "homebrewdj-launchpad-driver";
  version = "0.1.0";
  src = ./.;
  buildInputs = [ pkgs.deno ];
  installPhase = ''
    mkdir -p $out
    ln -s ${importmap} $out/deno.json
    cp -r src $out/
    cp -r main.ts $out/
  '';
}