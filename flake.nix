{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: 
      let
        pkgs = nixpkgs.legacyPackages.${system};
        midi-driver = pkgs.callPackage ./midi-driver {};
        definitions = pkgs.callPackage ./definitons {};

        frontend = pkgs.callPackage ./react-app {
          inherit definitions;
        };

      in
        {
          packages = {
            definitions = definitions;
            #default = frontend;
            frontend = frontend;
            midi-driver = midi-driver;
            default = frontend;
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