/* @flow */
const LOGIN_STORE_KEY_PREFIX = 'last_used_service_for_host:';
let serviceForHostCache = {};

function populateLastUsedServiceCache() {
  // TODO: this should be null but that would requiring changing
  // the stuff in helpers.js (safari)
  helper.storage.local.get(undefined, function(items) {
    let loaded = 0;
    for (var key in items) {
      if (key.indexOf(LOGIN_STORE_KEY_PREFIX) === 0) {
        serviceForHostCache[key.substr(LOGIN_STORE_KEY_PREFIX.length)] = items[key];
        ++loaded;
      }
    }
    console.log('loaded', loaded, 'recently used services from store');
  });
};

function updateLastUsedServiceForHost(service) {
  const key = LOGIN_STORE_KEY_PREFIX + getCanonicalHost(service.clientData.loginUrl);
  let data = {};
  data[key] = service.secretId;
  helper.storage.local.set(data);
  serviceForHostCache[getCanonicalHost(service.clientData.loginUrl)] = service.secretId;
};

function getLastUsedServiceForHost(canonicalHost: string) {
  return serviceForHostCache[canonicalHost];
};

function getLoginHintsForHost(host: string) {
  let data = {};
  const matches = getServiceInstances(host);

  if (matches.length) {
    data.services = matches;
  }
  return data;
};

function getServiceInstances(host: string, callback) {
  var matches = [];
  var recent = parseInt(getLastUsedServiceForHost(host), 10);
  // undefined arguments get 'null' when passed through messaging
  if (serviceInstances) {
    if (typeof host !== 'undefined' && host !== null) {
      for (var i = 0; i < serviceInstances.length; i++) {
        var instance = serviceInstances[i];
        var instanceHost = getCanonicalHost(instance.clientData.loginUrl);
        if (instanceHost === host || instanceHost === 'www.' + host) {
          serviceInstances[i].mostRecent = (serviceInstances[i].secretId === recent);
          matches.push(serviceInstances[i]);
        }
      }
    } else {
      matches = serviceInstances;
    }
  }

  if(typeof(callback) === 'function') callback(matches);
  return matches;
};

module.exports = {
  populateLastUsedServiceCache,
  updateLastUsedServiceForHost,
  getLastUsedServiceForHost,
  getLoginHintsForHost,
  getServiceInstances,
}
