{ pkgs }:

let
  # Assuming android-sdk is defined in your flake's packages or comes from the 'pkgs' attribute
  androidSdk = pkgs.android-sdk;
in
with pkgs;

devshell.mkShell {
  name = "android-project";
  motd = ''
    Entered the Android app development environment.
  '';
  
  # Existing environment variables
  env = [
    {
      name = "ANDROID_HOME";
      value = "${androidSdk}/share/android-sdk";
    }
    {
      name = "ANDROID_SDK_ROOT";
      value = "${androidSdk}/share/android-sdk";
    }
    {
      name = "JAVA_HOME";
      value = jdk17.home;
    }
    # Add GRADLE_OPTS to the environment variables
    {
      name = "GRADLE_OPTS";
      value = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidSdk}/share/android-sdk/build-tools/34.0.0/aapt2";
    }
  ];
  
  packages = [
    android-studio
    androidSdk
    gradle
    # jdk11
    android-tools
    # project specific
    jdk17
    nodejs_20
    jetbrains.webstorm
  ];
}
