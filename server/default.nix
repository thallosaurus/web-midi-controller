{ pkgs }:
pkgs.stdenv.mkDerivation {
          name = "frontend";
          src = ./react-app;
          buildInputs = [pkgs.yarn pkgs.nodejs];
          buildPhase = ''
            yarn
            yarn build
          '';

          installPhase = ''
            mkdir $out
            cp dist $out
          '';
        };