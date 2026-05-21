{ pkgs, rustPlatform, buildPackages, ... }:

  rustPlatform.buildRustPackage {
    pname = "midi-driver";
    version = "0.1.12";
    src = ./.;

    #inherit cargoLock;

    nativeBuildInputs = with pkgs; [
      pkgconf
      gcc
    ];
    buildInputs = with pkgs; [
      alsa-lib.dev
    ];

    cargoLock.lockFile = ./Cargo.lock;
    
  }
