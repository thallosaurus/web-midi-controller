{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... } @inputs :
    flake-utils.lib.eachDefaultSystem (system: 
      let
        pkgs = nixpkgs.legacyPackages.${system};
        #midi-driver = pkgs.callPackage ./midi-driver {};
        version = "v0.2.1";

        traktorController = builtins.fetchurl {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/homebrewdj_traktor.js";
          #sha256 = "sha256:c10efb572f77354430c2c53b703e6feb48592f0d21097814149c4453afeb4bdc";
          sha256 = builtins.readFile ./packaging/homebrewdj_traktor.js.sha256;
        };

        driver = builtins.fetchurl {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/libmidi_driver.so";
          sha256 = builtins.readFile ./packaging/libmidi_driver.so.sha256;
        };

        ui = pkgs.fetchzip {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/webui.zip";
          stripRoot = false;
#          sha256 = "sha256:bf73ac229aa47aafae65acf76ceed414687dad3bbf1871e7b630ad93625a4715";
          sha256 = builtins.readFile ./packaging/webui.zip.sha256;
        };

        config = pkgs.writeText "config.json" ''
          {
            "hostname": "0.0.0.0",
            "midiInput": "Launchpad Pro MK3:Launchpad Pro MK3 LPProMK3 MIDI 24:0",
            "midiOutput": "Launchpad Pro MK3:Launchpad Pro MK3 LPProMK3 MIDI 24:0",
            "dawInput": "Launchpad Pro MK3:Launchpad Pro MK3 LPProMK3 DAW 24:2",
            "dawOutput": "Launchpad Pro MK3:Launchpad Pro MK3 LPProMK3 DAW 24:2",
            "traktorInput": "hdj traktor input",
            "traktorOutput": "hdj traktor output"
          }
        '';

        homebrewdj-traktor = pkgs.stdenvNoCC.mkDerivation {
          pname = "homebrewdj";
          version = version;
          
#          inherit src;

          nativeBuildInputs = [ pkgs.alsa-lib ];

          unpackPhase = "true";

          installPhase = ''
            mkdir -p $out
            ln -s ${traktorController} $out/homebrewdj.js
            ln -s ${driver} $out/libmidi_driver.so
            ln -s ${config} $out/config.json
            cp -r ${ui}/webui $out/webui
            mkdir -p $out/bin
            cat > $out/bin/homebrewdj <<EOF
            #!/bin/sh
            export LD_LIBRARY_PATH=${pkgs.alsa-lib}/lib:$LD_LIBRARY_PATH
            exec ${pkgs.deno}/bin/deno run --allow-all $out/homebrewdj.js $out/config.json
            EOF
            chmod +x $out/bin/homebrewdj
          ''; 
        };
      in
      with pkgs;
        {
          packages = {
            default = homebrewdj;
          };

          devShells.default = mkShell {
            buildInputs = [ nodejs yarn pkgconf alsa-lib.dev deno rustc cargo ];
          };

	        apps.default = {
	          type = "app";
	          program = "${homebrewdj-traktor}/bin/homebrewdj";
	        };
        }
    );
    #system = "x86_64-linux";
    #pkgs = import nixpkgs { inherit system; };
    #midi-driver = import ./midi-driver;
    #server = import ./server;
    

#    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
#    packages.x86_64-linux.default = self.packages.x86_64-linux.hello;
#    packages.x86_64-linux.server = pkgs.callPackage ./server.nix {};

#    packages.x86_64-linux.default = self.packages.x86_64-linux.midi-driver;
}
