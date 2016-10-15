/* @flow */

import { populateLastUsedServiceCache } from "./service_cache";


var settings = {};

var loadSettingsAsync = function(onSuccess) {
    loadSettings();
    if (onSuccess) {
        onSuccess(settings);
    }
};

var saveSettingsAsync = function(newSettings, onSuccess, onError) {
    helper.storage_sync.set({'settings': newSettings}, function () {
        if(CHROME && chrome.runtime.lastError){
            // TODO(ivan): safari and ff implementation
            console.log('error saving settings to storage', chrome.runtime.lastError.message);
            if (onError) {
                onError(chrome.runtime.lastError.message);
            }
        } else {
            loadSettingsAsync(onSuccess);
        }
    });
};

var loadSettings = function () {
    helper.storage_sync.get('settings', function (items) {
        if (CHROME && chrome.runtime.lastError) {
            // TODO(ivan): safari and ff implementation
            console.log('error loading settings', chrome.runtime.lastError.message);
        } else if ('settings' in items) {
            console.log('settings loaded; username:', items.settings.username,
                    'rememberMe:', items.settings.rememberMe);
            settings = items.settings;
        }
    });
    populateLastUsedServiceCache();
};

module.exports = {
  loadSettings,
  loadSettingsAsync,
  saveSettingsAsync,
}
