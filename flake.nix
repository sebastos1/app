{
  description = "CRUD app in React Native with Firebase";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    devshell.url = "github:numtide/devshell";
    flake-utils.url = "github:numtide/flake-utils";
    android.url = "github:tadfisher/android-nixpkgs";
  };

  outputs = { self, nixpkgs, devshell, flake-utils, android }:
    {
      overlay = final: prev: {
        inherit (self.packages.${final.system}) android-sdk android-studio;
      };
    }
    //
    flake-utils.lib.eachSystem [ "aarch64-darwin" "x86_64-darwin" "x86_64-linux" ] (system:
      let
        inherit (nixpkgs) lib;
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
          overlays = [
            devshell.overlays.default
            self.overlay
          ];
        };
      in
      {
        packages = {
          android-sdk = android.sdk.${system} (sdkPkgs: with sdkPkgs; [
            # Useful packages for building and testing.
            build-tools-34-0-0
            cmdline-tools-latest
            emulator
            platform-tools
            platforms-android-34
          ]);
        } // lib.optionalAttrs (system == "x86_64-linux") {
          android-studio = pkgs.androidStudioPackages.stable;
        };

        shellHook = ''
          echo "Installing react-native..."
          npm install
        '';

        devShell = import ./devshell.nix { inherit pkgs; };

      }
    );
}