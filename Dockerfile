FROM nixos/nix
RUN nix-channel --update
COPY . .
RUN nix-build --experimental-features 'nix-command flakes' --flake .