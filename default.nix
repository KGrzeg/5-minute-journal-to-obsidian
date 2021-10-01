{ pkgs ? import <nixpkgs> {} }:

with pkgs;

mkShell rec {
  buildInputs = [ nodejs-14_x ];
  shellHook = ''
    npm install
  '';
}
