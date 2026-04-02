{ pkgs, ... }:

{
    android = {
        enable = true;
        android-studio.enable = false;
        reactNative.enable = true;
    };

    languages.javascript = {
        enable = true;
        npm = {
            enable = true;
            install.enable = true;
        };
    };

    packages = with pkgs; [ watchman eas-cli ];
}

