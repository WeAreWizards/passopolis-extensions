/* @flow */
import { helper } from "./background_api";
import { getCanonicalHost } from "./domain";
import type { SecretData } from "./background_api";

const LOGIN_STORE_KEY_PREFIX = 'last_used_service_for_host:';
let serviceForHostCache = {};

// used in background.js by the popup (and maybe by the infobar?)
var serviceInstances: ?Array<SecretData> = null;

export type FrameId = number;

export type LoginHints = {
  // TODO(tom): services, serviceInstances, secrets, ... naming is hugely inconsistent
  services: Array<SecretData>;
  serverHints: ?mixed;
  frameId: FrameId;
};


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

function updateLastUsedServiceForHost(service: SecretData) {
  const key = LOGIN_STORE_KEY_PREFIX + getCanonicalHost(service.clientData.loginUrl);
  let data = {};
  data[key] = service.secretId;
  helper.storage.local.set(data);
  serviceForHostCache[getCanonicalHost(service.clientData.loginUrl)] = service.secretId;
};

function getLastUsedServiceForHost(canonicalHost: string) {
  return serviceForHostCache[canonicalHost];
};

function getLoginHintsForHost(host: string): LoginHints {
  return {
    serverHints: null,
    frameId: 0,
    services: getServiceInstances(host),
  };
};

function getServiceInstances(host: string, callback: ?(matches: Array<SecretData>) => void): Array<SecretData> {
  var matches = [];
  var recent = parseInt(getLastUsedServiceForHost(host), 10);

  if (serviceInstances === null || serviceInstances === undefined) {
    return [];
  }

  if (typeof host !== 'undefined' && host !== null) {
    for (var i = 0; i < serviceInstances.length; i++) {
      var instance = (serviceInstances[i] : any);
      var instanceHost = getCanonicalHost(instance.clientData.loginUrl);
      if (instanceHost === host || instanceHost === 'www.' + host) {
        instance.mostRecent = (serviceInstances[i].secretId === recent);
        matches.push(instance);
      }
    }
  } else {
    matches = serviceInstances;
  }

  if (callback !== null && callback !== undefined) {
    callback(matches);
  }
  return matches;
};

function clearServiceInstances() {
  serviceInstances = null;
}

function setServiceInstances(services: Array<SecretData>) {
  serviceInstances = services;
}


module.exports = {
  populateLastUsedServiceCache,
  updateLastUsedServiceForHost,
  getLastUsedServiceForHost,
  getLoginHintsForHost,
  getServiceInstances,
  clearServiceInstances,
  setServiceInstances,
}
