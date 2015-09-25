{ self, fetchurl, fetchgit ? null, lib }:

{
  by-spec."coffee-script"."~1.7.1" =
    self.by-version."coffee-script"."1.7.1";
  by-version."coffee-script"."1.7.1" = self.buildNodePackage {
    name = "coffee-script-1.7.1";
    version = "1.7.1";
    bin = true;
    src = fetchurl {
      url = "http://registry.npmjs.org/coffee-script/-/coffee-script-1.7.1.tgz";
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
    self.by-version."gaze"."0.5.1";
  by-version."gaze"."0.5.1" = self.buildNodePackage {
    name = "gaze-0.5.1";
    version = "0.5.1";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/gaze/-/gaze-0.5.1.tgz";
      name = "gaze-0.5.1.tgz";
      sha1 = "22e731078ef3e49d1c4ab1115ac091192051824c";
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
      url = "http://registry.npmjs.org/glob/-/glob-3.1.21.tgz";
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
      url = "http://registry.npmjs.org/globule/-/globule-0.1.0.tgz";
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
      url = "http://registry.npmjs.org/graceful-fs/-/graceful-fs-1.2.3.tgz";
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
      url = "http://registry.npmjs.org/growl/-/growl-1.7.0.tgz";
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
  by-spec."inherits"."1" =
    self.by-version."inherits"."1.0.2";
  by-version."inherits"."1.0.2" = self.buildNodePackage {
    name = "inherits-1.0.2";
    version = "1.0.2";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/inherits/-/inherits-1.0.2.tgz";
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
      url = "http://registry.npmjs.org/jasmine-growl-reporter/-/jasmine-growl-reporter-0.2.1.tgz";
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
      url = "http://registry.npmjs.org/jasmine-node/-/jasmine-node-2.0.0.tgz";
      name = "jasmine-node-2.0.0.tgz";
      sha1 = "81751a72325f5497490b14181a55087f1b0371ff";
    };
    deps = {
      "coffee-script-1.7.1" = self.by-version."coffee-script"."1.7.1";
      "walkdir-0.0.10" = self.by-version."walkdir"."0.0.10";
      "underscore-1.6.0" = self.by-version."underscore"."1.6.0";
      "gaze-0.5.1" = self.by-version."gaze"."0.5.1";
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
      url = "http://registry.npmjs.org/lodash/-/lodash-1.0.2.tgz";
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
    self.by-version."lru-cache"."2.7.0";
  by-version."lru-cache"."2.7.0" = self.buildNodePackage {
    name = "lru-cache-2.7.0";
    version = "2.7.0";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/lru-cache/-/lru-cache-2.7.0.tgz";
      name = "lru-cache-2.7.0.tgz";
      sha1 = "aaa376a4cd970f9cebf5ec1909566ec034f07ee6";
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
      url = "http://registry.npmjs.org/minimatch/-/minimatch-0.2.14.tgz";
      name = "minimatch-0.2.14.tgz";
      sha1 = "c74e780574f63c6f9a090e90efbe6ef53a6a756a";
    };
    deps = {
      "lru-cache-2.7.0" = self.by-version."lru-cache"."2.7.0";
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
      url = "http://registry.npmjs.org/minimist/-/minimist-0.0.8.tgz";
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
  by-spec."mkdirp"."~0.3.5" =
    self.by-version."mkdirp"."0.3.5";
  by-version."mkdirp"."0.3.5" = self.buildNodePackage {
    name = "mkdirp-0.3.5";
    version = "0.3.5";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/mkdirp/-/mkdirp-0.3.5.tgz";
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
  by-spec."nan"."^2.0.9" =
    self.by-version."nan"."2.0.9";
  by-version."nan"."2.0.9" = self.buildNodePackage {
    name = "nan-2.0.9";
    version = "2.0.9";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/nan/-/nan-2.0.9.tgz";
      name = "nan-2.0.9.tgz";
      sha1 = "d02a770f46778842cceb94e17cab31ffc7234a05";
    };
    deps = {
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
      url = "http://registry.npmjs.org/sigmund/-/sigmund-1.0.1.tgz";
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
      url = "http://registry.npmjs.org/underscore/-/underscore-1.6.0.tgz";
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
    self.by-version."walkdir"."0.0.10";
  by-version."walkdir"."0.0.10" = self.buildNodePackage {
    name = "walkdir-0.0.10";
    version = "0.0.10";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/walkdir/-/walkdir-0.0.10.tgz";
      name = "walkdir-0.0.10.tgz";
      sha1 = "36037cab663b5e1c0166007b5f7b918b3279a54f";
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
    self.by-version."webworker-threads"."0.5.7";
  by-version."webworker-threads"."0.5.7" = self.buildNodePackage {
    name = "webworker-threads-0.5.7";
    version = "0.5.7";
    bin = false;
    src = fetchurl {
      url = "http://registry.npmjs.org/webworker-threads/-/webworker-threads-0.5.7.tgz";
      name = "webworker-threads-0.5.7.tgz";
      sha1 = "74c26e923b4bf25bf620533877d8548d6b221877";
    };
    deps = {
      "nan-2.0.9" = self.by-version."nan"."2.0.9";
    };
    optionalDependencies = {
    };
    peerDependencies = [];
    os = [ ];
    cpu = [ ];
  };
  "webworker-threads" = self.by-version."webworker-threads"."0.5.7";
}
