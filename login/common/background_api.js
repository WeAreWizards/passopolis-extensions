/* @flow */
/*
 * *****************************************************************************
 * Copyright (c) 2012, 2013, 2014 Lectorius, Inc.
 * Authors:
 * Vijay Pandurangan (vijayp@mitro.co)
 * Evan Jones (ej@mitro.co)
 * Adam Hilss (ahilss@mitro.co)
 *
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     You can contact the authors at inbound@mitro.co.
 * *****************************************************************************
 */

import { keycache } from "../../api/js/cli/keycache";
import { _PostToMitro } from "../../api/js/cli/rpc";
import { forge } from "node-forge";
import { Client } from "../frontend/static/js/client";
import { jQuery } from "jQuery";
import { getExtensionId } from "./worker";
import { assert } from "./utils";
import { getCanonicalHost } from "./domain";
import { helpers_background } from "../firefox44/helpers_background";
import { getLoginHintsForHost } from "./service_cache";
import { saveSettingsAsync } from "./settings";
import { clearRecordedForms } from "./form_handling";

const keycacheI = keycache.MakeKeyCache();
keycache.startFiller(keycache);

type Identity = {
  uid: string,
  changePwd: boolean,
};

type LoginState = {
};

type SecretData = {
  secretId: SecretId;
  groupIds: Array<GroupId>;
  serverData: {
    loginUrl: string;
  };
  clientData: {};
  secretData: {};
};

type LoginData = {
  before_page: string;
  usernameField: HTMLInputElement;
  passwordField: HTMLInputElement;
};

type SecretId = string;
type GroupId = number;

type SiteData = {
  secretId: SecretId;
  groupIdList: Array<GroupId>;
  identityList: Array<Identity>;
  orgGroupId: GroupId;
};

type GroupData = {
  groupId: GroupId;
  name: string;
  groupIdList: Array<GroupId>;
  identityList: Array<Identity>;
};

type Issue = {
  logs: string;
};

type GetAuditLog = {};
type AuditLog = {};
type CreateOrganization = {};
type GetOrganization = {}
type OrgInfo = {};
type OrganizationId = number;
type MutateOrganization = {};
type ChangeRemotePassword = {};

const getNewRSAKeysAsync = function(numKeys, onSuccess, onError) {
    keycacheI.getNewRSAKeysAsync(numKeys, function(keys) {
        var rval = [];
        for (var i = 0; i < keys.length; ++i) {
            rval.push(keys[i].toJson());
        }
        onSuccess(rval);
    }, onError);
};

var getRandomnessFirstTime = true;
var getRandomness = function(onSuccess, onError) {
    try {
        // the first time around, we need to seed this with 32**2 bytes of randomness to
        // "fill up the pools".
        var seed = forge.random.seedFileSync(getRandomnessFirstTime ? 32*32 : 32);
        getRandomnessFirstTime = false;
        onSuccess({'seed' : seed});
    } catch (e) {
        onError(e);
    }
};

const client = new Client('background');
const worker = new Worker('worker.js');
const helper = new helpers_background.BackgroundHelper();

helper.bindClient(client); // TODO what does this so?


worker.onmessage = function(event: MessageEvent) {
    // make a deep copy of message
    var message = jQuery.extend(true, {}, event.data);

    message.sendResponse = function(data) {
        var new_message = client.composeResponse(this, data);
        worker.postMessage(new_message);
    };
    client.processIncoming(message);
};

client.addSender('worker', function(message) {
    worker.postMessage(message);
});


var ajax = _PostToMitro; // TODO: This re-assignment seems silly - why not use the correct name?


client.initRemoteCalls('worker', [
    'signMessageAsync',
    'setExtensionId', 'setFailover', 'setDeviceId', 'getDeviceId', 'getDeviceIdAsync',
    'workerInvokeOnIdentity', 'createIdentity', 'workerCreateIdentity', 'workerLogin', 'workerLoginWithToken',
    'workerLoginWithTokenAndLocalKey', 'login', 'loginWithToken', 'loginWithTokenAndLocalKey', 'addIssue', 'initCacheFromFile',
    'initCacheFromJson', 'clearCaches', 'bidirectionalSetDiff', 'workerLogout'
    ]);

client.initRemoteExecution('worker', ['getNewRSAKeysAsync', 'console_log', 'ajax', 'getRandomness'], this);
client.setExtensionId(getExtensionId());


var fe = client;
var frontend = client;
var userIdentity: ?Identity = null;
var attemptingLogin = false;

// used in background.js by the popup (and maybe by the infobar?)
var serviceInstances = null;

var storePasswordForTwoFactor = null;
var clearPasswordCallbackId = null;

var selectedOrgId = null;

type ErrorCallback = (message: Error) => void;

var reportError = function (onError: ErrorCallback, message: string) {
  console.log(message);
  if (onError === undefined || onError == null) { return };
  onError(new Error(message));
};

var checkTwoFactor = function (onSuccess, onError) {
  fe.workerInvokeOnIdentity(userIdentity, 'checkTwoFactor', onSuccess, onError);
};

var reportSuccess = function (onSuccess: ?(arg: any) => void, arg: ?mixed) {
    if (onSuccess !== undefined && onSuccess !== null) {
        onSuccess(arg);
    }
};

var refreshTabsOnMitroLogin = function () {
    console.log('refreshTabsOnMitroLogin');
    helper.tabs.getAll(function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            var host = getCanonicalHost(tab.url);
            helper.tabs.sendMessage(tab.id,
                client.composeMessage('content',
                                      'refreshOnMitroLogin',
                                      getLoginHintsForHost(host)));
        }
    });
};

var saveLoginToken = function(identity) {
    fe.workerInvokeOnIdentity(identity, 'getLoginTokenAsync', function(loginTokenRaw) {
        var token = JSON.stringify(loginTokenRaw);
        var key = 'loginToken:' + identity.uid;
        var data = {};
        data[key] = token;
        helper.storage.local.set(data, function() {
            if (CHROME && chrome.runtime.lastError) {
                // TODO(ivan): safari and ff implementation
                console.log('error storing login token', chrome.runtime.lastError.message);
            }
        });
    }, function(e) {
        console.log('could not get login token from worker: ', e);
    });
};

var getLoginToken = function(email: string, callback: (token: string) => void) {
    var key = 'loginToken:' + email;
    helper.storage.local.get(key, function(r) {
        var token = r;

        try {
            if (CHROME && chrome.runtime.lastError) {
                // TODO(ivan): safari and ff implementation
                console.log('local storage error', chrome.runtime.lastError.message);
            } else {
                token = JSON.parse(r[key]);
                console.log("got login token for user " + email);
            }
        } catch (e) {
            console.log('problem getting key', (e.stack ? e.stack : ''));
        } finally {
            callback(token);
        }
    });
};

// This method saves an encrypted key for a specific user id.
// If the uid is null, it clears the last saved key (used for logout).
var saveEncryptedKey = function(uid: ?string, keystring: ?string) {
  // TODO(tom): instead of clearing by setting to null we should have a
  // `clearEncryptedKey` function.

  const value = uid ? {key:keystring, uid:uid} : null;
  helper.storage.local.set({'encryptedKey':value}, function() {
    if (CHROME && chrome.runtime.lastError) {
      // TODO(ivan): safari and ff implementation
      console.log('error storing encrypted key: ' + chrome.runtime.lastError.message);
    }
  });
};

var pregenerateKeys = function(num, callback) {
    keycacheI.setTemporaryLimit(num, callback);
};
client.initRemoteExecution('extension', 'pregenerateKeys');

var getSiteData = function(secretId, onSuccess, onError) {
    fe.workerInvokeOnIdentity(userIdentity, 'getSiteData', secretId, false, onSuccess, onError);
};
client.initRemoteExecution('extension', 'getSiteData');

var getPendingGroupDiffs = function(identity, onSuccess, onError) {
    fe.workerInvokeOnIdentity(identity, 'getPendingGroups', null, onSuccess, onError);
};
client.initRemoteExecution('extension', 'getPendingGroupDiffs');

var commitPendingGroupDiffs = function(identity, nonce, checksum, onSuccess, onError) {
    var options = {};
    options.scope = null;
    options.nonce = nonce;
    fe.workerInvokeOnIdentity(identity, 'applyPendingGroups', options, onSuccess, onError);
};
client.initRemoteExecution('extension', 'commitPendingGroupDiffs');

var loadEncryptedKey = function(callback: (keyUid: ?string) => void) {
    var key = 'encryptedKey';
    helper.storage.local.get(key, function(items) {
        if (CHROME && chrome.runtime.lastError) {
            // TODO(ivan): safari and ff implementation
            console.log('error loading encrypted key: ' + chrome.runtime.lastError.message);
        }

        if (key in items) {
            callback(items[key]);
        } else {
            callback(null);
        }
    });
};
var mitroSignup = function (username, password, rememberMe, onSuccess, onError) {
    console.log('mitroSignup');
    var onCreateIdentity = function (identity) {
        console.log('onCreateIdentity');
        setIdentity(identity);
        saveLoginToken(identity);
        if (rememberMe) {
            fe.workerInvokeOnIdentity(identity, 'getPrivateKeyStringForLocalDiskAsync', function(diskString) {
                saveEncryptedKey(identity.uid, diskString);
            }, function(e) {
                console.log('error', e);
            });
        }

        var settings = {
            username: username,
            rememberMe: rememberMe
        };
        var ignoreResult = function() {};
        saveSettingsAsync(settings, ignoreResult, ignoreResult);

        reportSuccess(onSuccess, userIdentity);
        refreshTabsOnMitroLogin();
    };

    var onCreateIdentityError = function (error) {
        reportError(onError, 'Error during signup: ' + error.userVisibleError);
    };

    helper.cookies.get({url: 'http://' + MITRO_HOST, name: 'glcid'}, function (cookie) {
        var analyticsId = null;

        if (cookie) {
            analyticsId = cookie.value;
        }
        fe.workerCreateIdentity(username, password, analyticsId, MITRO_HOST, MITRO_PORT, onCreateIdentity, onCreateIdentityError);
    });
};

var commonOnLoginCode = function(identity: Identity, rememberMe: boolean, onSuccess: () => void, onError: (error: Error) => void) {
    console.log('onLogin: ', identity.uid);
    attemptingLogin = false;
    if (isLoggedIn()) {
        // this looks like a race condition. Abandon login efforts
        console.log('already logged in. Potential race condition? Aborted.');
        onError(new Error('already logged in'));
        return;
    }
    saveLoginToken(identity);
    setIdentity(identity);
    if (rememberMe) {
        fe.workerInvokeOnIdentity(identity, 'getPrivateKeyStringForLocalDiskAsync', function(diskString) {
            saveEncryptedKey(identity.uid, diskString);
        }, function(e) {
            console.log('error saving encrypted key', e);
        });
    }
    listUsersGroupsAndSecrets(function () {
       refreshTabsOnMitroLogin();
       onSuccess();
    }, onError);

    helper.addContextMenu();
};

var mitroLogin = function (username, password, onSuccess, onError, onTwoFactorAuth, tokenString, tokenSignature, rememberMe,
    tfaCode) {
    console.log('mitroLogin');
    attemptingLogin = true;
    if (tokenString && tokenSignature && storePasswordForTwoFactor) {
	password = storePasswordForTwoFactor;
	storePasswordForTwoFactor = null;
	if (clearPasswordCallbackId) {
        clearTimeout(clearPasswordCallbackId);
    }
	clearPasswordCallbackId = null;
    }

    var onLogin = function(identity) {
        try {
            commonOnLoginCode(identity, rememberMe, function() {
                reportSuccess(onSuccess, userIdentity);
            }, onError);
        } catch (e) {
            onError(e);
        }
    };

    var onLoginError = function (error) {
      attemptingLogin = false;
      if (onTwoFactorAuth && error.exceptionType === 'DoTwoFactorAuthException') {
        // store password in a global field
		// automatically remove it after 10 minutes.
		storePasswordForTwoFactor = password;
		clearPasswordCallbackId = setTimeout(
            function() {
                storePasswordForTwoFactor = null;
            },
            1000*60*10);
        onTwoFactorAuth(error.rawMessage);
      } else {
        reportError(onError, error);
      }
    };
    var doRequest = function(token) {
        if (!token) {
            fe.workerLogin(username, password, MITRO_HOST, MITRO_PORT, tfaCode, onLogin, onLoginError);
        } else {
            fe.workerLoginWithToken(username, password, token, MITRO_HOST, MITRO_PORT, tfaCode, onLogin, onLoginError);
        }
    };

    if (tokenString && tokenSignature) {
        var tk = {'loginToken' : tokenString, 'loginTokenSignature' : tokenSignature};
        doRequest(tk);
    } else {
        getLoginToken(username, doRequest);
    }
};

var mitroLogout = function (onSuccess: () => void, onError: (arg: any) => void) {
    console.log('mitroLogout');

    // This will clear the state in the worker
    fe.workerLogout(userIdentity);

    // This will clear state in the background context.
    setIdentity(null);
    saveEncryptedKey(null, null);
    serviceInstances = null;
    selectedOrgId = null;
    clearRecordedForms();

    helper.removeContextMenu();

    // TODO: Record the logout on the server.
    reportSuccess(onSuccess, null);
};

var isLoggedIn = function () {
    return !!userIdentity;
};

var isAttemptingLogin = function () {
    return attemptingLogin;
};

var changePassword = function (oldPassword, newPassword, up, onSuccess, onError) {
  if (!isLoggedIn() || up.token === null || up.token_signature === null) {
    reportError(onError, 'Cannot change password; not logged in');
    return;
  }

  var onMutatePrivateKeyPassword = function (response) {
    // clear the "must change password" flag: we just did!
    // TODO: reload the identity to ensure the server cleared this flag?
    if (userIdentity === null || userIdentity === undefined) {
      console.error("trying to change password without userIdentity");
      return;
    }
    userIdentity.changePwd = false;
    reportSuccess(onSuccess, response);
  };

  var onMutatePrivateKeyPasswordError = function (error) {
    reportError(onError, 'Error changing password: ' + error.userVisibleError);
  };
  if (oldPassword === null) {
    fe.workerInvokeOnIdentity(
      userIdentity, 'mutatePrivateKeyPasswordWithoutOldPassword',
      {newPassword:newPassword, up:up}, onMutatePrivateKeyPassword, onMutatePrivateKeyPasswordError);
  } else {
    fe.workerInvokeOnIdentity(
      userIdentity, 'mutatePrivateKeyPassword', oldPassword, newPassword,
      up, onMutatePrivateKeyPassword, onMutatePrivateKeyPasswordError);
  }
};

var getIdentity = function (onSuccess: (identity: Identity) => void, onError: ErrorCallback) {
    reportSuccess(onSuccess, userIdentity);
};

var getLoginState = function (onSuccess: (loginState: LoginState) => void, onError: ErrorCallback) {
  var result = {
    identity: userIdentity,
    attemptingLogin: attemptingLogin
  };
  reportSuccess(onSuccess, result);
};

var updateIconState = function () {
    var LOGGED_OUT_ICONS = {'19': 'img/passopolis-logged-out-19.png',
                            '32': 'img/passopolis-logged-out-32.png',
                            '38': 'img/passopolis-logged-out-38.png'};
    var LOGGED_IN_ICONS = {'19': 'img/passopolis-logo-19.png',
                           '32': 'img/passopolis-logo-32.png',
                           '38': 'img/passopolis-logo-38.png'};

    var icons = isLoggedIn() ? LOGGED_IN_ICONS : LOGGED_OUT_ICONS;
    helper.setIcon({path: icons});
};

var setIdentity = function (identity) {
    userIdentity = identity;
    updateIconState();
};

var listUsersGroupsAndSecrets = function (onSuccess: () => void, onError: ErrorCallback) {
    console.log('trying to fetch services from ' + MITRO_HOST + '...');

    if (!isLoggedIn()) {
        reportError(onError, 'Cannot fetch services; not logged in');
        return;
    }

    var onDoneOk = function (response) {
        console.log('fetched ' + response.secrets.length + ' services');
        console.log('fetched ' + response.users.length + ' users');
        console.log('fetched ' + response.groups.length + ' groups');
        serviceInstances = response.secrets;
        reportSuccess(onSuccess, response);
    };

    var onDoneError = function (error) {
        reportError(onError, 'Failed to fetch services: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'listUsersGroupsAndSecrets', onDoneOk, onDoneError);
};


var internalGetSiteSecretData = function (fcn, secretId, onSuccess, onError) {
    console.log('getSiteSecretData: ' + secretId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onGetSiteSecretData = function (data) {
        reportSuccess(onSuccess, data);
    };

    var onGetSiteSecretDataError = function (error) {
        reportError(onError, 'Error getting site secret data: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, fcn, secretId, onGetSiteSecretData, onGetSiteSecretDataError);
};

var getSiteSecretData = function (secretId: SecretId, onSuccess: (data: number) => void, onError: ErrorCallback) {
    return internalGetSiteSecretData('getSiteSecretData', secretId, onSuccess, onError);
};

var getSiteSecretDataForDisplay = function (secretId: SecretId, onSuccess: (data: number) => void, onError: ErrorCallback) {
    return internalGetSiteSecretData('getSiteSecretDataForDisplay', secretId, onSuccess, onError);
};


var addSecretToGroups = function (data: SecretData, onSuccess: (secretId: SecretId) => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }
    if (!data.clientData || !data.criticalData || !data.groupIds || data.groupIds.length === 0) {
        reportError(onError, 'invalid data');
        return;
    }

    var onAddSecret = function (secretId) {
        console.log('secret added to groups successfully');
        onSuccess(secretId);
    };

    var onAddSecretError = function (error) {
        reportError(onError, 'Error saving secret: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'addSecrets', data, onAddSecret, onAddSecretError);
};


var addSecret = function (data: SecretData, onSuccess: (secretId: SecretId) => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var serverData = data.serverData;
    var clientData = data.clientData;
    var secretData = data.secretData;

    var loginUrl = 'none';
    if ('loginUrl' in serverData) {
        loginUrl = serverData.loginUrl;
    }

    var onAddSecret = function (secretId) {
        console.log('secret added successfully');
        onSuccess(secretId);
    };

    var onAddSecretError = function (error) {
        reportError(onError, 'Error saving secret: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'addSecret', loginUrl, clientData, secretData, onAddSecret, onAddSecretError);
};

var editSecret = function (data: SecretData, onSuccess: (secretId: SecretId) => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onEditSecret = function (secretId) {
        console.log('secret edited successfully');
        onSuccess(secretId);
    };

    var onEditSecretError = function (error) {
        reportError(onError, 'Error saving secret: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'mutateSecret', data.secretId, data.serverData, data.clientData,
                              data.secretData, onEditSecret, onEditSecretError);
};

var addSite = function (loginData: LoginData, onSuccess: (secretId: SecretId) => void , onError: ErrorCallback) {
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var loginPage = loginData.before_page;
    var usernameField = loginData.usernameField;
    var passwordField = loginData.passwordField;
    console.log('adding site for ', loginPage, usernameField, passwordField);

    var onAddSite = function (secretId) {
        console.log('service added successfully');
        listUsersGroupsAndSecrets(function() { onSuccess(secretId);}, onError);
    };

    var onAddSiteError = function (error) {
        reportError(onError, 'Error saving password from ' + loginPage + ': ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'addSite', loginPage,
                         usernameField.value,
                         passwordField.value,
                         usernameField.name,
                         passwordField.name,
                         onAddSite,
                         onAddSiteError);
};

var removeSecret = function (secretId: SecretId, onSuccess: (data: mixed) => void, onError: ErrorCallback) {
    console.log('removeSecret: ' + secretId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onRemoveSecret = function (data) {
        reportSuccess(onSuccess, data);
    };

    var onRemoveSecretError = function (error) {
        reportError(onError, 'Error removing secret: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'deleteSecret', secretId, onRemoveSecret, onRemoveSecretError);
};

var editSiteShares = function (siteData: SiteData, onSuccess: (data: mixed) => void, onError: ErrorCallback) {
    var secretId = siteData.secretId;
    var groupIdList = siteData.groupIdList;
    var identityList = siteData.identityList;
    var orgGroupId = siteData.orgGroupId;

    console.log('editSiteShares: ' + secretId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onShareSite = function (data) {
        reportSuccess(onSuccess, data);
    };

    var onShareSiteError = function (error) {
        reportError(onError, 'Error editing site share list: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'shareSiteAndOptionallySetOrg', secretId, groupIdList, identityList, orgGroupId, onShareSite, onShareSiteError);
};

var getGroup = function (groupId: GroupId, onSuccess: (group: GroupData) => void, onError: ErrorCallback) {
    console.log('getGroup: ' + groupId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onGetGroup = function (group) {
        console.log('got group successfully');
        reportSuccess(onSuccess, group);
    };

    var onGetGroupError = function (error) {
        reportError(onError, 'Error getting group: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'getGroup', groupId, onGetGroup, onGetGroupError);
};

var addGroup = function (groupName: string, onSuccess: (groupId: GroupId) => void, onError: ErrorCallback) {
    console.log('addGroup: ' + groupName);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onAddGroup = function (groupId) {
        console.log('group created successfully');
        reportSuccess(onSuccess, groupId);
    };

    var onAddGroupError = function (error) {
        reportError(onError, 'Error creating group: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'addGroup', groupName, onAddGroup, onAddGroupError);
};

var removeGroup = function (groupId: GroupId, onSuccess: (groupId: GroupId) => void, onError: ErrorCallback) {
    console.log('removeGroup: ' + groupId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onRemoveGroup = function (groupId) {
        console.log('group removed successfully');
        reportSuccess(onSuccess, groupId);
    };

    var onRemoveGroupError = function (error) {
        reportError(onError, 'Error removing group: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'removeGroup', groupId, onRemoveGroup, onRemoveGroupError);
};

var editGroup = function (groupData: GroupData, onSuccess: (groupId: GroupId) => void, onError: ErrorCallback) {
    var groupId = groupData.groupId;
    var groupName = groupData.name;
    var groupIdList = groupData.groupIdList;
    var identityList = groupData.identityList;

    console.log('editGroup: ' + groupId);

    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onMutateGroup = function (groupId) {
        console.log('group edited successfully');
        reportSuccess(onSuccess, groupId);
    };

    var onMutateGroupError = function (error) {
        reportError(onError, 'Error editing group: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'mutateGroup', groupId, groupName, groupIdList, identityList, onMutateGroup, onMutateGroupError);
};

var addIssue = function (data: Issue, onSuccess: (data: mixed) => void, onError: ErrorCallback) {
    console.log('addIssue');

    var onAddIssue = function (data: Issue) {
        console.log('issue reported successfully');
        reportSuccess(onSuccess, data);
    };

    var onAddIssueError = function (error) {
        reportError(onError, 'Error reporting issue: ' + error.userVisibleError);
    };

    // TODO(tom) - re-implement a common logging system
    // data.logs = mitro.log.logBuffer.toString();
    fe.addIssue(data, MITRO_HOST, MITRO_PORT, onAddIssue, onAddIssueError);
};

var getAuditLog = function (data: GetAuditLog, onSuccess: (auditLog: AuditLog) => void, onError: ErrorCallback) {
    console.log('getAuditLog');

    var onGetAuditLog = function (data) {
       console.log('audit log retrieved successfully');
       reportSuccess(onSuccess, data);
    };

    var onGetAuditLogError = function (error) {
        reportError(onError, 'Error getting audit log: ' + error.userVisibleError);
    };

    fe.workerInvokeOnIdentity(userIdentity, 'getAuditLog', data, onGetAuditLog, onGetAuditLogError);
};

var createOrganization = function(data: CreateOrganization, onSuccess: () => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    fe.workerInvokeOnIdentity(userIdentity, 'createOrganization', data, onSuccess, onError);
};

var getOrganizationInfo = function (request: GetOrganization, onSuccess: (orgInfo: OrgInfo) => void, onError: ErrorCallback) {
  console.log('getOrganizationInfo');
  if (!isLoggedIn()) {
    onError(new Error('Not logged in'));
    return;
  }

  var onGetOrgInfoSuccess = function (orgInfo) {
    if (selectedOrgId === null) {
      onError(new Error('No organization selected.'));
      return;
    }

    if (orgInfo.organizations && selectedOrgId in orgInfo.organizations) {
      // Replace default org id with selected org id.
      orgInfo.myOrgId = selectedOrgId;
    }
    onSuccess(orgInfo);
  };

  fe.workerInvokeOnIdentity(userIdentity, 'getOrgInfo', onGetOrgInfoSuccess, onError);
};

var getOrganization = function (orgId: OrganizationId, onSuccess: () => void, onError: ErrorCallback) {
    console.log('getOrganization: ', orgId);
    if (!isLoggedIn()) {
        onError(new Error('Not logged in'));
        return;
    }

    fe.workerInvokeOnIdentity(userIdentity, 'getOrganizationState', orgId, onSuccess, onError);
};

var selectOrganization = function (orgId: OrganizationId, onSuccess: () => void, onError: ErrorCallback) {
    console.log('selectOrganization: ', orgId);
    if (!isLoggedIn()) {
        reportError(onError, 'Not logged in');
        return;
    }

    var onGetOrgInfoSuccess = function (orgInfo) {
        if ((typeof orgId === 'number') && (orgId in orgInfo.organizations)) {
            selectedOrgId = orgId;
            onSuccess();
        } else {
            onError(new Error({userVisibleError: 'Invalid org id: ' + orgId}));
        }
    };

    fe.workerInvokeOnIdentity(userIdentity, 'getOrgInfo', onGetOrgInfoSuccess, onError);
};

var mutateOrganization = function(request: MutateOrganization, onSuccess: () => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        onError(new Error('Not logged in'));
        return;
    }

    fe.workerInvokeOnIdentity(userIdentity, 'mutateOrganization', request, onSuccess, onError);
};

var changeRemotePassword = function(request: ChangeRemotePassword, onSuccess: () => void, onError: ErrorCallback) {
    if (!isLoggedIn()) {
        onError(new Error('Not logged in'));
        return;
    }

    fe.workerInvokeOnIdentity(userIdentity, 'changeRemotePassword', request, onSuccess, onError);
};

/**
 * Add secret from selection using page url as a title.
 * To be called from the content script.
 *
 * @param {Object} url - page url
 * @param {Object} text - selection text
 */
var addSecretFromSelection = function(url, text) {
    console.log('addSecretFromSelection: url=' + url + ', text=' + text);
    var clientData = {};
    var secretData = {};
    clientData.type = 'note';
    clientData.title = 'note for ' + getCanonicalHost(url);

    secretData.note = text;
    addSecret({
        serverData: {},
        clientData: clientData,
        secretData: secretData
    }, function(secretId) {
        console.log('SUCCESS. Successfully saved secret from selection. secretId:', secretId);
    }, function(err) {
        console.log('ERROR. Something went wrong while saving the secret from selection', err);
    });
    return true;
};


module.exports = {
  client,
  serviceInstances,
  getSiteSecretData,
  getOrganizationInfo,
  isLoggedIn,
  isAttemptingLogin,
  addSite,
  editSiteShares,
  frontend,
  userIdentity,
  reportError,
  getIdentity,
  getLoginState,
  mitroLogout,
  listUsersGroupsAndSecrets,
  getSiteSecretDataForDisplay,
  addSecret,
  addSecretToGroups,
  editSecret,
  removeSecret,
  getGroup,
  addGroup,
  removeGroup,
  editGroup,
  addIssue,
  getAuditLog,
  createOrganization,
  getOrganization,
  selectOrganization,
  mutateOrganization,
  changeRemotePassword,
  updateIconState,
  loadEncryptedKey,
  attemptingLogin,
  saveEncryptedKey,
  getLoginToken,
  commonOnLoginCode,
};
