{
    inputs = {
        flake-utils.url = "github:numtide/flake-utils";
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    };

    outputs = { nixpkgs, flake-utils, ... }:
        flake-utils.lib.eachDefaultSystem (system:
            let
                pkgs = import nixpkgs { inherit system; };
            in
            {
                devShell = pkgs.mkShell {
                    packages = with pkgs; [
                        nodejs_24
                        git
                    ];
                };
            }
        );
}
