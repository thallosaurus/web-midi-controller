{ pkgs, rustPlatform, buildPackages, ... }:

pkgs.rustPlatform.buildRustPackage {
  pname = "midi-driver";
  version = "0.1.13";
  src = ./midi-driver;

  nativeBuildInputs = with pkgs; [
    pkgconf
    gcc
  ];
    buildInputs = with pkgs; [
    alsa-lib.dev
  ];

  cargoLock.lockFile = ./Cargo.lock;
}