{
    stdenv,
    pkgs,
    deno,
    ...
}:

stdenv.mkDerivation {
    name = "midi-server";
    version = "0.1.12";
    src = ./server;
    buildInputs = [ deno ];

    postUnpack = "deno cache $sourceRoot/cli.ts";
    buildPhase = "deno task run compile:linux:release";
    installPhase = "mkdir -p $out/bin";
}
