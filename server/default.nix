{
    stdenv,
    pkgs,
    deno,
    ...
}:

stdenv.mkDerivation {
    name = "midi-server";
    version = "0.1.12";
    src = ./.;
    buildInputs = [ deno ];

    postUnpack = "deno cache $sourceRoot/main.ts";
    buildPhase = "deno task run compile:linux:release";
#    installPhase = "mkdir -p $out/bin";
}
