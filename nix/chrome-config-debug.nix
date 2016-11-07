{ writeText }: writeText "chrome-config.js" ''
  var debugMode = true;
  var MITRO_HOST = 'localhost';
  var MITRO_PORT = 8443;
  var FAILOVER_MITRO_HOST = null;
  var FAILOVER_MITRO_PORT = null;
  var FIREFOX;
  var CHROME;
  var SAFARI;
  var WEBPAGE;
''
