# Welcome

This is the continuation of the excellent Mitro password manager under
a new brand (https://passopolis.com/).

We split out the extensions into their own repository (this) for
easier development.

Unfortunately the extension builder scripts are all broken in their
current form. We have a hacked-together shell script that copies a few
files around and then packs the extension which we will release when
it's a bit less ugly.

# Cloning the repository

We assume that you create a folder `passopolis` and clone this repository to a subfolder called `extensions`. This is currently assumend at various places, so it makes sense to follow these steps (pull requests for more flexibility are welcome)

    mkdir passopolis
    git clone https://github.com/WeAreWizards/passopolis-extensions.git extensions
     
# NixOs

We use NixOs for building clean packages.

## Quickstart

Installing

    bash <(curl https://nixos.org/nix/install)

Activate nix shell

    . ~/.nix-profile/etc/profile.d/nix.sh

(your might want to add this to your profile)

# Building & testing the extension for Firefox

```
cd extensions
nix-build nix/build.nix -A firefox-44-extension && chmod a+w /tmp/pe.xpi && cp -r result/pe.xpi /tmp/pe.xpi
```
Use addon-debugging "load temporary addon", then hit reload after each rebuild.

# Branding

We're replacing the Mitro branding with our own Passopolis
branding. This makes it easier to understand that the service is still
active when searching on the Internet.
