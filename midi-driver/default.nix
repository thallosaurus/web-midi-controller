{ rustPlatform }:
{
  rustPlatform.buildRustPackage rec {
    pname = "midi-driver";
    version = "0.1.12";
    src = "./.";

    nativeBuildInputs = with pkgs; [
      pkgconf
    ];
    buildInputs = with pkgs; [
      alsa-lib.dev
    ];

    cargoLock.lockFile = ./Cargo.lock;
    
  };
}
