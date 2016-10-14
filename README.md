# Welcome

This is the continuation of the excellent Mitro password manager under
a new brand (https://passopolis.com/).

We split out the extensions into their own repository (this) for
easier development.

Unfortunately the extension builder scripts are all broken in their
current form. We have a hacked-together shell script that copies a few
files around and then packs the extension which we will release when
it's a bit less ugly.

# webpack

I'm in the process of webpack-ifying the extension. To test run:

```
webpack --watch login/common/background.js /tmp/bg.js
```


# Building & testing the extension for Firefox

```
$ nix-build extensions/build.nix -A firefox-44-extension && chmod a+w /tmp/pe.xpi && cp -r result/pe.xpi /tmp/pe.xpi
```

Use addon-debugging "load temporary addon", then hit reload after each rebuild.

# Branding

We're replacing the Mitro branding with our own Passopolis
branding. This makes it easier to understand that the service is still
active when searching on the Internet.


# Clean audit

Audit tables get very large, so the following has to run in a cron job
every so often. Better would be to have a date limit to only archive
old data but the following is betted than a full disk:

```
psql mitro -c "copy audit to '/tmp/audit.csv'; delete from audit;"
xz /tmp/audit.csv
mv /tmp/audit.csv.xz /var/log/audit-$(date -I).csv.xz
```
