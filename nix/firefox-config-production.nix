{ writeText }: writeText "firefox-config.js" ''
  var debugMode = false;
  var MITRO_HOST = 'passopolis.com';
  var MITRO_PORT = 443;
  var FAILOVER_MITRO_HOST = 'secondary.passopolis.com';
  var FAILOVER_MITRO_PORT = 443;
  var CHROME;
  var SAFARI;
  var WEBPAGE;
  var CHROME;
  FIREFOX = true;
  var EXTENSION_ID = 'passopolis-secret-manager';
''
