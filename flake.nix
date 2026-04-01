{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
    supportedSystems = [ "x86_64-linux" ];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    pkgsFor = nixpkgs.legacyPackages;
    #midi-driver = import ./midi-driver;
    #server = import ./server;
  in {
#    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
#    packages.x86_64-linux.default = self.packages.x86_64-linux.hello;
#    packages.x86_64-linux.server = pkgs.callPackage ./server.nix {};

#    packages.x86_64-linux.midi-driver = import ./driver.nix;

#    packages.x86_64-linux.default = self.packages.x86_64-linux.midi-driver;
    packages = forAllSystems (system: {
#      default = pkgsFor.${system}.call
      driver = pkgsFor.${system}.callPackage ./midi-driver {};
      server = pkgsFor.${system}.callPackage ./server {};
    });
  };
}
