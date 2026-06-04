{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    deno2nix.url = "github:SnO2WMaN/deno2nix";
  };

  outputs = { self, nixpkgs, flake-utils, deno2nix }:
    flake-utils.lib.eachDefaultSystem (system: 
      let
        pkgs = nixpkgs.legacyPackages.${system};
        midi-driver = pkgs.callPackage ./midi-driver {};
        definitions = pkgs.callPackage ./definitions {};
        widgets = pkgs.callPackage ./widgets {
          inherit definitions;
        };

        frontend = pkgs.callPackage ./react-app {
          inherit definitions;
          inherit widgets;
        };

        homebrewdj = pkgs.callPackage ./homebrewdj {
          inherit midi-driver;
          inherit traktor-driver;
          inherit launchpad-driver;
        };

        traktor-driver = pkgs.callPackage ./traktor-driver {
          inherit midi-driver;
        };

        launchpad-driver = pkgs.callPackage ./launchpad-driver {
          inherit midi-driver;
        };
      in
      with pkgs;
        {
          packages = {
            definitions = definitions;
            #default = frontend;
            frontend = frontend;
            midi-driver = midi-driver;
            homebrewdj = homebrewdj;
            default = homebrewdj;
            widgets = widgets;
          };

          devShells.default = mkShell {
            buildInputs = [ nodejs yarn pkgconf alsa-lib.dev deno rustc cargo ];
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