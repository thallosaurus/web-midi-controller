{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
    midi-driver = pkgs.rustPlatform.buildRustPackage {
      
          pname = "myapp";
          version = "0.1.12";
          src = ./.;

          nativeBuildInputs = with pkgs; [
            pkgconf
          ];
          buildInputs = with pkgs; [
            alsa-lib.dev
          ];
          cargoLock = {
            lockFile = ./Cargo.lock;
          };
        };
  in {
#    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;
#    packages.x86_64-linux.default = self.packages.x86_64-linux.hello;
    packages.x86_64-linux.server = import ./server;



    packages.x86_64-linux.midi-driver = midi-driver;
      
    packages.x86_64-linux.default = self.packages.x86_64-linux.midi-driver;
  };
}
