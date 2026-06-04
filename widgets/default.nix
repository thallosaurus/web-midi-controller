{ pkgs }:
pkgs.mkYarnPackage {
  name = "homebrewdj-widgets";
  src = ./.;
}