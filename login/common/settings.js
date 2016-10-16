/* @flow */

import { populateLastUsedServiceCache } from "./service_cache";
import { helper } from "./background_api";

type Settings = {
  username: string;
  rememberMe: boolean;
};

var settings = {username: "", rememberMe: false};

var loadSettingsAsync = function(onSuccess: (settings: Settings) => void) {
  // TODO(tom): not really async, why does this exist?
  loadSettings();
  if (onSuccess) {
    onSuccess(settings);
  }
};

var saveSettingsAsync = function(newSettings: Settings, onSuccess: (settings: Settings) => void, onError: (error: any) => void) {
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
