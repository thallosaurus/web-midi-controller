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
        version = "v0.2.0";

        src = builtins.fetchurl {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/homebrewdj.js";
          sha256 = "sha256:0dxssiz9kk79wxy2xz4v9z41wzzav3al1ymrzrgbrdc0kbhscgfr";
        };

        driver = builtins.fetchurl {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/libmidi_driver.so";
          sha256 = "sha256:1c7nn4246vsy5b29yapvsy465hkwf6hzviyg2r8pymy3v1cmz4nv";
        };

        ui = pkgs.fetchzip {
          url = "https://github.com/thallosaurus/web-midi-controller/releases/download/${version}/webui.zip";
          stripRoot = false;
          sha256 = "sha256-WkqiEGmUtgt5MJFSrtG/if8GHD5qHENbidlefYPqPzE=";
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

        homebrewdj = pkgs.stdenvNoCC.mkDerivation {
          pname = "homebrewdj";
          version = version;
          
          inherit src;

          nativeBuildInputs = [ pkgs.alsa-lib ];

          unpackPhase = "true";

          installPhase = ''
            mkdir -p $out
            ln -s ${src} $out/homebrewdj.js
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
	          program = "${homebrewdj}/bin/homebrewdj";
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
