{ writeText }: writeText "chrome-config.js" ''
  var debugMode = false;
  var MITRO_HOST = 'passopolis.com';
  var MITRO_PORT = 443;
  var FAILOVER_MITRO_HOST = 'secondary.passopolis.com';
  var FAILOVER_MITRO_PORT = 443;
  var FIREFOX;
  var CHROME;
  var SAFARI;
  var WEBPAGE;
  CHROME = true;
''
