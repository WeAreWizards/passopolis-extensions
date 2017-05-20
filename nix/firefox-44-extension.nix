{ stdenv, closurecompiler, p7zip, unzip, nodejs, python, lessc, zip, forge_src, keyzcar_src, firefox-44-config, manifest, node_packages }:
stdenv.mkDerivation {
    name = "passopolis-firefox-44-extension";
    buildInputs = [
      closurecompiler
      unzip
      nodejs
      python
      lessc
      zip
      p7zip
      node_packages.hogan
      node_packages."hogan.js"
    ];
    srcs = ../../extensions;

    phases = "unpackPhase buildPhase";
    buildPhase = ''
    cd login/

    mkdir -p ext/js

    # deps
    cat ${forge_src}/start.frag ${forge_src}/js/*js ${forge_src}/end.frag > ext/forge.js

    # TODO: the following is almost certainly not necessary but we're adding it
    # to remove diffs.
    cp ${forge_src}/js/* ext/
    cp ${keyzcar_src}/*js ext/

    cp common/*.js ext/
    cp firefox44/*.js ext/
    cp ../api/js/cli/*.js ext/

    # TODO config in two places?
    cp ${firefox-44-config} ext/config.js

    cp -r ./frontend/static/css/ ext/css
    cp -r ./frontend/static/fonts/ ext/fonts
    cp -r ./frontend/static/img/ ext/img
    cp -r ./frontend/static/js/* ext/js

    lessc --strict-imports --strict-math=on --strict-units=on ./frontend/static/less/site.less > ext/css/site.css
    lessc --strict-imports --strict-math=on --strict-units=on ./frontend/static/less/mitro_popup2.less > ext/css/mitro_popup2.css

    cp ${manifest} manifest.json
    chmod u+w manifest.json
    python assign_scripts.py chrome manifest.json ext/

    # Due to iframe origins, we inject the HTML as Javascriptconfg (see makefile)
    python ./makejsresource.py common/infobar.html ext/infobar_html.js

    mkdir -p ext/html/
    for t in $(find frontend/templates/*mustache); do
        node ./mustache_renderer.js $t ext/html/$(basename $t .mustache).html
    done

    for t in $(find frontend/partials/*mustache); do
        hulk $t > ext/js/$(basename $t .mustache).js
    done

    # Remove tests
    find ext/ | egrep "(_test.js|_regtest.js|_regtest2.js)$" | xargs rm
    find ext/ | grep csv$ | xargs rm

    mkdir $out
    cd ext/
    7z a $out/pe.xpi * -r
    '';
}
