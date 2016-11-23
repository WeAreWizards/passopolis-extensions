{ nixpkgs ? import (fetchTarball https://github.com/NixOS/nixpkgs-channels/archive/nixos-16.09.tar.gz) {}, debug ? false }:
with nixpkgs;
let
  keyzcar_src = fetchzip {
        url = https://github.com/mitro-co/keyczarjs/archive/master.zip;
        sha256 = "0hcxiqpyvs504qd0ars658c1v4hxj87dg48xij28rvyixk634bvi";
      };
  forge_src = fetchzip {
      url = https://github.com/digitalbazaar/forge/archive/0.3.0.zip;
      sha256 = "0wmfyrjhwwx96g72swl83mlsmn4m52mb45v9j7dnvxlc6zdp76ja";
  };

  chrome-config = if debug then
    callPackage ./chrome-config-debug.nix { }
  else
    callPackage ./chrome-config-production.nix { };

  firefox-44-config = writeText "firefox-44-config.js" ''
    var debugMode = false;
    var MITRO_HOST = 'passopolis.com';
    var MITRO_PORT = 443;
    var FAILOVER_MITRO_HOST = 'secondary.passopolis.com';
    var FAILOVER_MITRO_PORT = 443;
    var FIREFOX;
    var CHROME;
    var SAFARI;
    var WEBPAGE;
    CHROME = true; // Not chrome but we pretend it is
  '';

  firefox-44-manifest = writeText "manifest.json" (import ./firefox-44-manifest.json.nix { version = "2016.11.23";});

  firefox-package-js = writeText "package.js" ''
  {
    "name": "passopolis-secret-manager",
    "fullName": "Passopolis secret manager",
    "id": "passopolis-secret-manager",
    "description": "Passopolis is a well-designed, well-functioning and secure secret manager.",
    "author": "Lectorius, Inc. / We Are Wizards Ltd.",
    "license": "",
    "version": "2015.12.1",
    "icon": "data/img/passopolis-logo-128.png",
    "icon64": "data/img/passopolis-logo-128.png",
    "dependencies": ["toolbarwidget"],
    "permissions": {
      "unsafe-content-script": true
    }
  }
  '';

  # If you want to build your own extension you need to create your
  # own key.
  chrome-signing-key = ../../service/extensions/chrome-extension-key.pem;

  firefox-sdk = stdenv.mkDerivation {
    name = "firefox-sdk-latest";
    src = fetchurl {
      url = https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.tar.gz;
      sha256 = "0347a8mr3xzad8jch9hqy1pfiwrv2aqmnk1an1y657as55y5sbdv";
    };
    patches = [ ./1970-date-not-supported-by-zipfile.patch ];
    phases = "unpackPhase patchPhase installPhase";
    installPhase = ''
    mkdir $out
    cp -r . $out/
    '';
  };

  firefox-toolbar-widget = stdenv.mkDerivation {
    name = "toolbarwidget-jplib-master";
    buildInputs = [ unzip ];
    src = fetchurl {
      url = https://github.com/Rob--W/toolbarwidget-jplib/archive/master.zip;
      sha256 = "015337ipr18d0mz98h9mmyrn15hyk60zjg8bsdxz6hvag5yrq91k";
    };
    phases = "unpackPhase installPhase";
    installPhase = ''
    mkdir $out
    cp -r . $out/
    '';
  };
in
rec {
  chrome-extension = callPackage ./chrome-extension.nix {
    inherit forge_src;
    inherit keyzcar_src;
    inherit chrome-config;
  };

  firefox-44-extension = callPackage ./firefox-44-extension.nix {
    inherit forge_src;
    inherit keyzcar_src;
    inherit firefox-44-config;
    manifest = firefox-44-manifest;
  };

  chrome-extension-zip = stdenv.mkDerivation {
    name = "passopolis-chrome-extension-zip";
    buildInputs = [
      chrome-extension
      zip
    ];
    srcs = "${chrome-extension}";

    phases = "unpackPhase buildPhase";
    buildPhase = ''
    mkdir ext
    cp ${chrome-signing-key} key.pem
    zip -r passopolis-chrome-ext.zip .

    mkdir $out
    cp  passopolis-chrome-ext.zip $out/
    '';
  };
}
