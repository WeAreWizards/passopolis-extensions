{ self, fetchurl, fetchgit ? null, lib }:

{
  by-spec."abbrev"."1" =
    self.by-version."abbrev"."1.1.0";
  by-version."abbrev"."1.1.0" = self.buildNodePackage {
    name = "abbrev-1.1.0";
    version = "1.1.0";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/abbrev/-/abbrev-1.1.0.tgz";
      name = "abbrev-1.1.0.tgz";
      sha1 = "d0554c2256636e2f56e7c2e5ad183f859428d81f";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."bindings"."^1.2.1" =
    self.by-version."bindings"."1.2.1";
  by-version."bindings"."1.2.1" = self.buildNodePackage {
    name = "bindings-1.2.1";
    version = "1.2.1";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/bindings/-/bindings-1.2.1.tgz";
      name = "bindings-1.2.1.tgz";
      sha1 = "14ad6113812d2d37d72e67b4cacb4bb726505f11";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."coffee-script"."~1.7.1" =
    self.by-version."coffee-script"."1.7.1";
  by-version."coffee-script"."1.7.1" = self.buildNodePackage {
    name = "coffee-script-1.7.1";
    version = "1.7.1";
    bin = true;
    src = fetchurl {
      url = "https://registry.npmjs.org/coffee-script/-/coffee-script-1.7.1.tgz";
      name = "coffee-script-1.7.1.tgz";
      sha1 = "62996a861780c75e6d5069d13822723b73404bfc";
    };
    deps = {
      "mkdirp-0.3.5" = self.by-version."mkdirp"."0.3.5";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."gaze"."~0.5.1" =
    self.by-version."gaze"."0.5.2";
  by-version."gaze"."0.5.2" = self.buildNodePackage {
    name = "gaze-0.5.2";
    version = "0.5.2";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/gaze/-/gaze-0.5.2.tgz";
      name = "gaze-0.5.2.tgz";
      sha1 = "40b709537d24d1d45767db5a908689dfe69ac44f";
    };
    deps = {
      "globule-0.1.0" = self.by-version."globule"."0.1.0";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."glob"."~3.1.21" =
    self.by-version."glob"."3.1.21";
  by-version."glob"."3.1.21" = self.buildNodePackage {
    name = "glob-3.1.21";
    version = "3.1.21";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/glob/-/glob-3.1.21.tgz";
      name = "glob-3.1.21.tgz";
      sha1 = "d29e0a055dea5138f4d07ed40e8982e83c2066cd";
    };
    deps = {
      "minimatch-0.2.14" = self.by-version."minimatch"."0.2.14";
      "graceful-fs-1.2.3" = self.by-version."graceful-fs"."1.2.3";
      "inherits-1.0.2" = self.by-version."inherits"."1.0.2";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."globule"."~0.1.0" =
    self.by-version."globule"."0.1.0";
  by-version."globule"."0.1.0" = self.buildNodePackage {
    name = "globule-0.1.0";
    version = "0.1.0";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/globule/-/globule-0.1.0.tgz";
      name = "globule-0.1.0.tgz";
      sha1 = "d9c8edde1da79d125a151b79533b978676346ae5";
    };
    deps = {
      "lodash-1.0.2" = self.by-version."lodash"."1.0.2";
      "glob-3.1.21" = self.by-version."glob"."3.1.21";
      "minimatch-0.2.14" = self.by-version."minimatch"."0.2.14";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."graceful-fs"."~1.2.0" =
    self.by-version."graceful-fs"."1.2.3";
  by-version."graceful-fs"."1.2.3" = self.buildNodePackage {
    name = "graceful-fs-1.2.3";
    version = "1.2.3";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/graceful-fs/-/graceful-fs-1.2.3.tgz";
      name = "graceful-fs-1.2.3.tgz";
      sha1 = "15a4806a57547cb2d2dbf27f42e89a8c3451b364";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."growl"."~1.7.0" =
    self.by-version."growl"."1.7.0";
  by-version."growl"."1.7.0" = self.buildNodePackage {
    name = "growl-1.7.0";
    version = "1.7.0";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/growl/-/growl-1.7.0.tgz";
      name = "growl-1.7.0.tgz";
      sha1 = "de2d66136d002e112ba70f3f10c31cf7c350b2da";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."hogan"."^1.0.2" =
    self.by-version."hogan"."1.0.2";
  by-version."hogan"."1.0.2" = self.buildNodePackage {
    name = "hogan-1.0.2";
    version = "1.0.2";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/hogan/-/hogan-1.0.2.tgz";
      name = "hogan-1.0.2.tgz";
      sha1 = "d8d5e57fae0e7787b3e01e14256f9d588a23d1f0";
    };
    deps = {
      "hogan.js-3.0.2" = self.by-version."hogan.js"."3.0.2";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  "hogan" = self.by-version."hogan"."1.0.2";
  by-spec."hogan.js"."*" =
    self.by-version."hogan.js"."3.0.2";
  by-version."hogan.js"."3.0.2" = self.buildNodePackage {
    name = "hogan.js-3.0.2";
    version = "3.0.2";
    bin = true;
    src = fetchurl {
      url = "https://registry.npmjs.org/hogan.js/-/hogan.js-3.0.2.tgz";
      name = "hogan.js-3.0.2.tgz";
      sha1 = "4cd9e1abd4294146e7679e41d7898732b02c7bfd";
    };
    deps = {
      "nopt-1.0.10" = self.by-version."nopt"."1.0.10";
      "mkdirp-0.3.0" = self.by-version."mkdirp"."0.3.0";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."hogan.js"."^3.0.2" =
    self.by-version."hogan.js"."3.0.2";
  "hogan.js" = self.by-version."hogan.js"."3.0.2";
  by-spec."inherits"."1" =
    self.by-version."inherits"."1.0.2";
  by-version."inherits"."1.0.2" = self.buildNodePackage {
    name = "inherits-1.0.2";
    version = "1.0.2";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/inherits/-/inherits-1.0.2.tgz";
      name = "inherits-1.0.2.tgz";
      sha1 = "ca4309dadee6b54cc0b8d247e8d7c7a0975bdc9b";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."jasmine-growl-reporter"."~0.2.0" =
    self.by-version."jasmine-growl-reporter"."0.2.1";
  by-version."jasmine-growl-reporter"."0.2.1" = self.buildNodePackage {
    name = "jasmine-growl-reporter-0.2.1";
    version = "0.2.1";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/jasmine-growl-reporter/-/jasmine-growl-reporter-0.2.1.tgz";
      name = "jasmine-growl-reporter-0.2.1.tgz";
      sha1 = "d5f0a37b92f6a83fd5c6482b809495c90a8b55fe";
    };
    deps = {
      "growl-1.7.0" = self.by-version."growl"."1.7.0";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."jasmine-node"."*" =
    self.by-version."jasmine-node"."2.0.0";
  by-version."jasmine-node"."2.0.0" = self.buildNodePackage {
    name = "jasmine-node-2.0.0";
    version = "2.0.0";
    bin = true;
    src = fetchurl {
      url = "https://registry.npmjs.org/jasmine-node/-/jasmine-node-2.0.0.tgz";
      name = "jasmine-node-2.0.0.tgz";
      sha1 = "81751a72325f5497490b14181a55087f1b0371ff";
    };
    deps = {
      "coffee-script-1.7.1" = self.by-version."coffee-script"."1.7.1";
      "walkdir-0.0.11" = self.by-version."walkdir"."0.0.11";
      "underscore-1.6.0" = self.by-version."underscore"."1.6.0";
      "gaze-0.5.2" = self.by-version."gaze"."0.5.2";
      "mkdirp-0.3.5" = self.by-version."mkdirp"."0.3.5";
      "minimist-0.0.8" = self.by-version."minimist"."0.0.8";
      "jasmine-growl-reporter-0.2.1" = self.by-version."jasmine-growl-reporter"."0.2.1";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  "jasmine-node" = self.by-version."jasmine-node"."2.0.0";
  by-spec."lodash"."~1.0.1" =
    self.by-version."lodash"."1.0.2";
  by-version."lodash"."1.0.2" = self.buildNodePackage {
    name = "lodash-1.0.2";
    version = "1.0.2";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/lodash/-/lodash-1.0.2.tgz";
      name = "lodash-1.0.2.tgz";
      sha1 = "8f57560c83b59fc270bd3d561b690043430e2551";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."lru-cache"."2" =
    self.by-version."lru-cache"."2.7.3";
  by-version."lru-cache"."2.7.3" = self.buildNodePackage {
    name = "lru-cache-2.7.3";
    version = "2.7.3";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/lru-cache/-/lru-cache-2.7.3.tgz";
      name = "lru-cache-2.7.3.tgz";
      sha1 = "6d4524e8b955f95d4f5b58851ce21dd72fb4e952";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."minimatch"."~0.2.11" =
    self.by-version."minimatch"."0.2.14";
  by-version."minimatch"."0.2.14" = self.buildNodePackage {
    name = "minimatch-0.2.14";
    version = "0.2.14";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/minimatch/-/minimatch-0.2.14.tgz";
      name = "minimatch-0.2.14.tgz";
      sha1 = "c74e780574f63c6f9a090e90efbe6ef53a6a756a";
    };
    deps = {
      "lru-cache-2.7.3" = self.by-version."lru-cache"."2.7.3";
      "sigmund-1.0.1" = self.by-version."sigmund"."1.0.1";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."minimist"."0.0.8" =
    self.by-version."minimist"."0.0.8";
  by-version."minimist"."0.0.8" = self.buildNodePackage {
    name = "minimist-0.0.8";
    version = "0.0.8";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/minimist/-/minimist-0.0.8.tgz";
      name = "minimist-0.0.8.tgz";
      sha1 = "857fcabfc3397d2625b8228262e86aa7a011b05d";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."mkdirp"."0.3.0" =
    self.by-version."mkdirp"."0.3.0";
  by-version."mkdirp"."0.3.0" = self.buildNodePackage {
    name = "mkdirp-0.3.0";
    version = "0.3.0";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/mkdirp/-/mkdirp-0.3.0.tgz";
      name = "mkdirp-0.3.0.tgz";
      sha1 = "1bbf5ab1ba827af23575143490426455f481fe1e";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."mkdirp"."~0.3.5" =
    self.by-version."mkdirp"."0.3.5";
  by-version."mkdirp"."0.3.5" = self.buildNodePackage {
    name = "mkdirp-0.3.5";
    version = "0.3.5";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/mkdirp/-/mkdirp-0.3.5.tgz";
      name = "mkdirp-0.3.5.tgz";
      sha1 = "de3e5f8961c88c787ee1368df849ac4413eca8d7";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."nan"."^2.4.0" =
    self.by-version."nan"."2.6.2";
  by-version."nan"."2.6.2" = self.buildNodePackage {
    name = "nan-2.6.2";
    version = "2.6.2";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/nan/-/nan-2.6.2.tgz";
      name = "nan-2.6.2.tgz";
      sha1 = "e4ff34e6c95fdfb5aecc08de6596f43605a7db45";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."nopt"."1.0.10" =
    self.by-version."nopt"."1.0.10";
  by-version."nopt"."1.0.10" = self.buildNodePackage {
    name = "nopt-1.0.10";
    version = "1.0.10";
    bin = true;
    src = fetchurl {
      url = "https://registry.npmjs.org/nopt/-/nopt-1.0.10.tgz";
      name = "nopt-1.0.10.tgz";
      sha1 = "6ddd21bd2a31417b92727dd585f8a6f37608ebee";
    };
    deps = {
      "abbrev-1.1.0" = self.by-version."abbrev"."1.1.0";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."sigmund"."~1.0.0" =
    self.by-version."sigmund"."1.0.1";
  by-version."sigmund"."1.0.1" = self.buildNodePackage {
    name = "sigmund-1.0.1";
    version = "1.0.1";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/sigmund/-/sigmund-1.0.1.tgz";
      name = "sigmund-1.0.1.tgz";
      sha1 = "3ff21f198cad2175f9f3b781853fd94d0d19b590";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."underscore"."~1.6.0" =
    self.by-version."underscore"."1.6.0";
  by-version."underscore"."1.6.0" = self.buildNodePackage {
    name = "underscore-1.6.0";
    version = "1.6.0";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/underscore/-/underscore-1.6.0.tgz";
      name = "underscore-1.6.0.tgz";
      sha1 = "8b38b10cacdef63337b8b24e4ff86d45aea529a8";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."walkdir"."~0.0.7" =
    self.by-version."walkdir"."0.0.11";
  by-version."walkdir"."0.0.11" = self.buildNodePackage {
    name = "walkdir-0.0.11";
    version = "0.0.11";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/walkdir/-/walkdir-0.0.11.tgz";
      name = "walkdir-0.0.11.tgz";
      sha1 = "a16d025eb931bd03b52f308caed0f40fcebe9532";
    };
    deps = {
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  by-spec."webworker-threads"."*" =
    self.by-version."webworker-threads"."0.7.11";
  by-version."webworker-threads"."0.7.11" = self.buildNodePackage {
    name = "webworker-threads-0.7.11";
    version = "0.7.11";
    bin = false;
    src = fetchurl {
      url = "https://registry.npmjs.org/webworker-threads/-/webworker-threads-0.7.11.tgz";
      name = "webworker-threads-0.7.11.tgz";
      sha1 = "9d54dfaa8d5ea3308833084680636b584a8aacaa";
    };
    deps = {
      "bindings-1.2.1" = self.by-version."bindings"."1.2.1";
      "nan-2.6.2" = self.by-version."nan"."2.6.2";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  "webworker-threads" = self.by-version."webworker-threads"."0.7.11";
}
