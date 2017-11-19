// @flow
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

import { assert } from "./assert";
import * as lru_cache from "./lru_cache";
import * as crypto from "./crypto";
import * as rpc from "./rpc";
import * as config from "../../../login/chrome/config/config";
import { getExtensionId } from "../../../login/common/worker";
import * as KeyCache from "./keycache.js";
import { GroupInfo, AuditAction } from "../../../login/frontend/static/js/background_interface";

const globalDecryptionCache = new lru_cache.LRUCache(1024);
const txnSpecificCaches = {};

function makeLocalException (e: Error) {
  try {
    console.log('local exception:', e, e.stack);
  } catch (ee) {}
  var output = {
    status: -1,
    userVisibleError: 'Unknown local error',
    exceptionType: 'JavascriptException',
    local_exception: e
  };
  if (e.userVisibleError) {
    output.userVisibleError = "" + (e.userVisibleError : any);
  }
  return output;
};

// cache things for ~ 1 minute.
const CACHE_TIME_MS = 1000*60*1;
const GENERAL_TRANSACTION = 'general-transaction'
function _getCache(args) {
  if (args._transactionSpecificData && args._transactionSpecificData.isWriteOperation && args._transactionSpecificData.id) {
    if (!(args._transactionSpecificData.id in txnSpecificCaches)) {
      txnSpecificCaches[args._transactionSpecificData.id] = new lru_cache.LRUCache();
    }
    return txnSpecificCaches[args._transactionSpecificData.id];
  } else {
    if (txnSpecificCaches[GENERAL_TRANSACTION] === undefined) {
      txnSpecificCaches[GENERAL_TRANSACTION] = new lru_cache.LRUCache(1024);
    }
    return txnSpecificCaches[GENERAL_TRANSACTION];
  }
};

type TransactionSpecificData = any // todo

function postEndTransaction(transactionSpecificData: TransactionSpecificData) {
  delete txnSpecificCaches[transactionSpecificData.id];
};

var clearCacheAndCall = function(f: any) {
  return function(...rest: any) {
    console.log('mitro_lib: clearing global cache');
    delete txnSpecificCaches[GENERAL_TRANSACTION];
    f.apply(null, Array.prototype.slice.call(arguments));
  };
};


// General code for all modules
function PostToMitro(outdict: Object, args: Object, path: string, onSuccess: any, onError: any) {

  // include the device id in the signed portion of the request
  outdict.deviceId = args.deviceId;

  const message: any = {
    'identity': args.uid,
    'request': JSON.stringify(outdict)
  };

  if (args._transactionSpecificData) {
    message.operationName = args._transactionSpecificData.operationName;
    message.transactionId = args._transactionSpecificData.id;
    message.implicitEndTransaction = args._transactionSpecificData.implicitEndTransaction;
    if (args._transactionSpecificData.implicitBeginTransaction) {
      args._transactionSpecificData.implicitBeginTransaction = false;
      message.implicitBeginTransaction = true;
    }
  }

  // GetPrivateKey cannot sign the request
  if (args._privateKey !== undefined) {
    message.signature = args._privateKey.sign(message.request);
  }

  return rpc._PostToMitro(message, args, path, function(resp) {
    if (args._transactionSpecificData && !args._transactionSpecificData.id) {
      args._transactionSpecificData.id = resp.transactionId;
    }
    onSuccess(resp);
    }, onError);
};

// TODO(tom): we can probably do better for types of onSuccess and onError
function PostToMitroAgent(request: Object, path: string, onSuccess: any, onError: any) {
  var args = {
    server_host: config.MITRO_AGENT_HOST,
    server_port: config.MITRO_AGENT_PORT,
  };
  return rpc._PostToMitro(request, args, path, onSuccess, onError);
};

function setPostToMitroForTest(replacementFunction: any) {
  PostToMitro = replacementFunction;
};

// TODO: Apply other password strength rules?
// Calculations from the following say a 8 char mixed-case alpha password
// takes > 1 year to crack, so that seems like a reasonable rule?
// TODO: Enforce mixed-case, numeric, or special char rules?
// http://blog.agilebits.com/2013/04/16/1password-hashcat-strong-master-passwords/
const MIN_PASSWORD_LENGTH = 8;

type EncryptedPrivateKey = any // TODO

function EditEncryptedPrivateKey(args: any, up: any, newEncryptedPrivateKey: EncryptedPrivateKey, onSuccess: any, onError: any) {
  try {
    var request = {
      userId: args.uid, encryptedPrivateKey: newEncryptedPrivateKey, tfaToken: up.token, tfaSignature: up.token_signature
    };
    assert (newEncryptedPrivateKey);
    PostToMitro(request,
		args, '/mitro-core/api/EditEncryptedPrivateKey', onSuccess, onError);
  } catch(e) {
    onError(makeLocalException(e));
  }
}

type OnSuccess = any
type OnError = any

function checkTwoFactor(args: any, onSuccess: OnSuccess, onError: OnError) {
  try {
    var request = {
      userId: args.uid,
      extensionId: getExtensionId()
    };
    PostToMitro(request, args, '/mitro-core/api/ChangePwdTwoFactorRequired', onSuccess, onError);
  }
  catch (e) {
    onError(makeLocalException(e));
  }
}


/**
 * AddIdentity -- Adds a new identity with a new generated key.
 * Args:
 *   args:
 *     { uid: user id to add (string), password: password to protect the key (string) }
 *   onSuccess: function(response)
 *     callback to call; response contains privateKey and transaction id
 *
 */
const AddIdentity = clearCacheAndCall(function(args, onSuccess, onError) {
  try {
    console.log('>>Add Identity');
    // uid must be email, password must be long enough
    if (args.uid.indexOf('@') == -1) {
      throw new Error('uid does not appear to be an email address: ' + args.uid);
    }
    if (args.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('password is not long enough (' + args.password.length +
        ' characters; must be at least ' + MIN_PASSWORD_LENGTH + ' characters)');
    }

    args._keyCache.getNewRSAKeysAsync(2, function(keys) {
      var privateKey = keys[0];
      var groupKey = keys[1];
      // generate a key; encrypt it
      var request: any = {
        userId: args.uid,
        publicKey: privateKey.exportPublicKey().toJson(),
        encryptedPrivateKey: privateKey.toJsonEncrypted(args.password),
        analyticsId: args.analyticsId
      };

      var onSuccessWithResult = null;
      if (onSuccess) {
        onSuccessWithResult = function(response) {
          response.privateKey = privateKey;
          onSuccess(response);
        };
      }

      args._privateKey = privateKey;
      if (args._createPrivateGroup) {
        request.groupKeyEncryptedForMe = privateKey.encrypt(groupKey.toJson());
        request.groupPublicKey = groupKey.exportPublicKey().toJson();
      }
      PostToMitro(request, args, '/mitro-core/api/AddIdentity', clearCacheAndCall(onSuccessWithResult), onError);
    }, onError);
  } catch (e) {
    onError(makeLocalException(e));
  }
});


/**
 * AddGroup -- add a new group to the DB, and add me to it.
 * Args:
 *   args:
 *     { uid : user id of the actor (string)
 *       _privateKey: an initialized Private Key object from crypto.
 *      '_' : [ name (string)]},
 *       }
 *   onSuccess: function(response)
 *     callback to call; response = {groupId:int};
 *
 */
var AddGroup = clearCacheAndCall(function(args, onSuccess, onError) {
  try {
    args._keyCache.getNewRSAKeysAsync(1, function(keys) {
      var newGroupKey = keys[0];
      console.log('>>Add Group');
      assert(args.uid);
      if (args._.length < 2) {
        console.log('usage: mitro.js addgroup --uid=me@example.com NAME');
        throw new Error('Incorrect aruments');
      }
      args.name = args._[1];

      var request = {
        name : args.name,
        autoDelete : args.autoDelete,
        publicKey: newGroupKey.exportPublicKey().toJson(),
        signatureString: 'TODO',
        scope : args.scope,
        'acls' : [
                  {
                    level: 'ADMIN',
                    groupKeyEncryptedForMe: args._privateKey.encrypt(newGroupKey.toJson()),
                    memberGroup:null,
                    memberIdentity: args.uid
                    }
                  ]
      };

      PostToMitro(request, args, '/mitro-core/api/AddGroup', clearCacheAndCall(onSuccess), onError);
    }, onError);
  } catch (e) {
    console.log('>> exception in add group');
    onError(makeLocalException(e));
  }
});

/**
 * TODO: this is broken and should use a different field for the actor and the public key
 *
 * GetPublicKey -- get a specific user's public key
 * Args:
 *   args:
 *
 *     { uid : user id of the calling user.
 *       target_uid: user id whose public key you want (string)
 *       _privateKey: an initialized Private Key object from crypto.
 *       }
 *   onSuccess: function(response)
 *     callback to call; response = {myUserId: int, publicKey: string}
 *
 */
function GetPublicKey(args: Object, onSuccess: OnSuccess, onError: OnError) {
  var uids = [args.target_uid];
  GetPublicKeys(args, uids,
                function(response) {
                  // TODO: this is kind of ugly. We should fix this code eventually
                  response.publicKey = response.userIdToPublicKey[uids[0]];
                  response.myUserId = uids[0];
                  onSuccess(response);
                }, onError);
}

type Identities = any // TODO

function GetPublicKeys(args: Object, uids: Identities, onSuccess: OnSuccess, onError: OnError) {
  return GetUserAndGroupPublicKeys(args, args.addMissingUsers, uids, null, onSuccess, onError);
};

function GetUserAndGroupPublicKeys(args: Object, addMissingUsers: bool, uids: Identities, gids: ?Array<number>, onSuccess: OnSuccess, onError: OnError) {
  try {
    console.log('>>Get public key');
    var request = {userIds : uids, addMissingUsers: addMissingUsers, groupIds: gids};
    PostToMitro(request, args, '/mitro-core/api/GetPublicKeyForIdentity',
                function(r) {
                  //TODO: pass this back so we can prompt users
                  assert (!r.missingUsers || r.missingUsers.length === 0);
                  onSuccess(r);
                }, onError);
  } catch (e) {
    console.log(e.stack);
    onError(makeLocalException(e));
  }
}

function RetrieveDeviceSpecificKey(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    console.log('>>Retrieve Device key');
    assert(args.uid);
    var request = {
      userId: args.uid,
      extensionId: getExtensionId()
    };
    PostToMitro(request, args, '/mitro-core/api/GetMyDeviceKey', onSuccess, onError);
  } catch (e) {
    onError(makeLocalException(e));
  }
};

/**
 * Get Private key for a user
 * args {uid: user id}
 * calls onSuccess with object from  RPC.java
 */
function GetPrivateKey(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    console.log('>>Get private key');
    assert(args.uid);
    var request = {
      userId: args.uid,
      loginToken: args.loginToken,
      loginTokenSignature: args.loginTokenSignature,
      twoFactorCode: args.twoFactorCode,
      extensionId: getExtensionId(),
      automatic: args.automatic
    };
    PostToMitro(request, args, '/mitro-core/api/GetMyPrivateKey', onSuccess, onError);
  } catch (e) {
    onError(makeLocalException(e));
  }
};

var decryptSecretWithKeyString = function(secret, keyString, privateKeyObject) {
  var keyStr = privateKeyObject.decrypt(keyString);
  var keyObj = crypto.loadFromJson(keyStr);
  secret.clientData = keyObj.decrypt(secret.encryptedClientData);
  if (secret.encryptedCriticalData) {
    secret.criticalData = keyObj.decryptNoMemo(secret.encryptedCriticalData);
  }
  return secret;
};

function decryptSecretWithGroups(secret: SecretToPath, groups: Array<GroupInfo>, previousUnencryptedKey) {
  assert(secret);
  var path = secret.groupIdPath;
  for (let pathId of path) {
    var groupId = path[pathId];
    if (!groups[groupId]) {
      console.log("ERROR: could not get group info for (group)", groupId);
      continue;
    }
    var pvtKeyString = groups[groupId].encryptedPrivateKey;
    var keyStr = previousUnencryptedKey.decrypt(
        pvtKeyString);
    previousUnencryptedKey = crypto.loadFromJson(keyStr);
  }

  secret.clientData = previousUnencryptedKey.decrypt(secret.encryptedClientData);
  if (secret.encryptedCriticalData) {
    secret.criticalData = previousUnencryptedKey.decryptNoMemo(secret.encryptedCriticalData);
  }
  return secret;


};

var _decryptSecret = function(secretId, listGroupAndSecretsResp, userPrivateKey) {
  var secret = listGroupAndSecretsResp.secretToPath[secretId];
  var rval = decryptSecretWithGroups(secret, listGroupAndSecretsResp.groups, userPrivateKey);
  return rval;
};

/**
 * GetSecret
 * args {uid: userId, '_':['secret_id'], _privateKey: key object}
 * calls onSuccess with a secret object, with .criticalData and .clientData set
 */
function GetSecret(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    // This is a bit complicated. First we have to list groups and secrets, then decrypt the
    // chain of group keys, then decrypt the secret, by re-requesting it, requesting the critical data.
    // TODO: cache this.
    assert(onSuccess);
    var includeCriticalData = args.includeCriticalData;
    if (includeCriticalData === undefined) {
      includeCriticalData = 'true';
    }
    var cacheKey = null;
    if (!includeCriticalData) {
      cacheKey = lru_cache.makeKey('GetSecret', args.uid, args._[1]);
      var resp = _getCache(args).getItem(cacheKey);
      if (resp) {
          console.log('mitro_lib GetSecret: Found response in cache');
          onSuccess(JSON.parse(resp));
          return; // IMPORTANT DO NOT REMOVE
      }
    }
    if (args._.length < 2) {
      console.log('usage: mitro.js cat --uid=me@example.com SECRET_ID');
      process.exit(-1);
    }

    var secretId = parseInt(args._[1], 10);
    var request = {userId: args.uid, secretId: secretId, includeCriticalData:includeCriticalData};
    console.log('>>GetSecret ('+JSON.stringify(request)+')');
    PostToMitro(request, args, '/mitro-core/api/GetSecret', function(response) {
      try {
        // This has critical data now, so replace it
        var output = decryptSecretWithKeyString(response.secret, response.encryptedGroupKey, args._privateKey);
        // output groupNames: required to edit ACLs for groups we do not belong to.
        if (response.secret.groupNames) {
          output.groupNames = response.secret.groupNames;
        }
        if (response.secret.groupMap) {
          output.groupMap = response.secret.groupMap;
        }
        output.groups = [];
        for (var i in output.groupNames) {
          var groupId = parseInt(i, 10);
          output.groups.push(groupId);
        }

        if (!includeCriticalData) {
          assert(cacheKey);
          _getCache(args).setItem(cacheKey, JSON.stringify(output),
                                  {expirationAbsolute: new Date(new Date().getTime() + CACHE_TIME_MS)});
        }
        onSuccess(output);
      } catch (e) {
        onError(makeLocalException(e));
      }
    }, onError);
  } catch (e) {
    onError(makeLocalException(e));
  }

};

/**
 * ListGroupsAndSecrets
 *
 * args {uid: userId, _privateKey: key object}
 *
 * calls onSuccess with object in RPC.java, but with unencrypted .clientData
 * added to every secret.
 */
function ListGroupsAndSecrets(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    var resp = _getCache(args).getItem(lru_cache.makeKey('ListGroupsAndSecrets', args.uid));
    if (resp) {
        console.log('mitro_lib ListGroupsAndSecrets: Found response in cache');
        (onSuccess || rpc.DefaultResponseHandler)(JSON.parse(resp));
        return; // IMPORTANT DO NOT REMOVE
    }
    console.log('>>Get List Groups and Secrets');
    assert(args.uid);
    var request = {myUserId : args.uid};
    PostToMitro(request, args, '/mitro-core/api/ListMySecretsAndGroupKeys', function(resp) {
      var secretIds = Object.keys(resp.secretToPath);
      for (let x of secretIds) {
        _decryptSecret(x, resp, args._privateKey);
      }
      // Cache for one minute
      _getCache(args).setItem(lru_cache.makeKey('ListGroupsAndSecrets', args.uid),
          // TODO: this should actually be a deep copy but I have no idea how to do that in JS.
          JSON.stringify(resp),
          {expirationAbsolute: new Date(new Date().getTime() + CACHE_TIME_MS)});
      (onSuccess || rpc.DefaultResponseHandler)(resp);
    },
    onError
    );
  } catch (e) {
    console.log(e);
    console.log(e.stack);
    onError(makeLocalException(e));
  }

};

function GetOrganizationState(args: Object, postArgs: Object, onSuccess: OnSuccess, onError: OnError) {
  var path = '/mitro-core/api/GetOrganizationState';
  var key = lru_cache.makeKey(path, postArgs.orgId);
  var resp = _getCache(args).getItem(key);
  if (resp) {
    onSuccess(JSON.parse(resp));
  } else {
    PostToMitro(postArgs, args, path, function(resp) {
      _getCache(args).setItem(key, JSON.stringify(resp),
      {expirationAbsolute: new Date(new Date().getTime() + CACHE_TIME_MS)});
      onSuccess(resp);
    }, onError);
  }
};

// mutationFunction MUST RETURN TRUE if secrets are to be re-encrypted with
// a new key
const MutateMembership = clearCacheAndCall(
  function(args, mutationFunction, onSuccess: OnSuccess, onError: OnError) {
  try {
    args.orgId = parseInt(args.orgId, 10);
    assert(onSuccess);
    assert(onError);
    console.log('mitro_lib MutateMembership(); onSuccess is truthy?', !!onSuccess);

    assert(args.gid);
    args.includeCriticalData = true;
    GetGroup(args, function(group) {
      // get the unencrypted group key.
      var unencryptedOldGroupKey = null;
      for (var i in group.acls) {
        var acl = group.acls[i];
        // make sure we're not already in the ACL (no duplicates!)
        if (acl.memberIdentity === args.uid) {
          // it's me!
          unencryptedOldGroupKey = crypto.loadFromJson(args._privateKey.decrypt(acl.groupKeyEncryptedForMe));
        }
      }
      function doRest(unencryptedOldGroupKey: ?Object) {
        try {
          var reEncrypt = mutationFunction(group, unencryptedOldGroupKey);
          if (!reEncrypt) {
            PostToMitro(group, args, '/mitro-core/api/EditGroup', clearCacheAndCall(onSuccess), onError);
          } else {
            assert (unencryptedOldGroupKey);
            assert (group.secrets !== null);
            // we need to re-encrypt everything with a new key
            args._keyCache.getNewRSAKeysAsync(1, function(keys) {
              try {
                var newGroupKey = keys[0];
                for (var i in group.acls) {
                  var userPublicKey = crypto.loadFromJson(group.acls[i].myPublicKey);
                  group.acls[i].groupKeyEncryptedForMe = userPublicKey.encrypt(newGroupKey.toJson());
                }
                // re-encrypt all the secret data with the new key
                for (i in group.secrets) {
                  group.secrets[i].encryptedClientData = newGroupKey.encrypt(
                    // $FlowFixMe
                      unencryptedOldGroupKey.decrypt(group.secrets[i].encryptedClientData));
                  group.secrets[i].encryptedCriticalData = newGroupKey.encrypt(
                    // $FlowFixMe
                    unencryptedOldGroupKey.decrypt(group.secrets[i].encryptedCriticalData));
                }
                group.publicKey = newGroupKey.exportPublicKey().toJson();
                PostToMitro(group, args, '/mitro-core/api/EditGroup', clearCacheAndCall(onSuccess), onError);
              } catch (e) {
                onError(makeLocalException(e));
              }
            }, onError);
          }
        } catch (e) {
          onError(makeLocalException(e));
        }
      };

      if (unencryptedOldGroupKey === null && args.orgId) {
        // see if we can access this data through the top level org group (for admins)

        var groupAcl = null;
        for (i in group.acls) {
          groupAcl = group.acls[i];
          args.gid = null;
          // make sure we're not already in the ACL (no duplicates!)
          if (parseInt(groupAcl.memberGroup, 10) === args.orgId) {
            args.gid = args.orgId;
            break;
          }
        }

        GetGroup(args, function(org) {
          var unencryptedOldGroupKey = null;
          for (var i in org.acls) {
            var orgAcl = org.acls[i];
            // make sure we're not already in the ACL (no duplicates!)
            if (orgAcl.memberIdentity === args.uid) {

              if (groupAcl === null) {
                throw (`groupacl for orgId ${args.orgId} not found`);
              }

              // it's me!
              const unencryptedOrgGroupKey = crypto.loadFromJson(args._privateKey.decrypt(orgAcl.groupKeyEncryptedForMe));
              unencryptedOldGroupKey = crypto.loadFromJson(unencryptedOrgGroupKey.decrypt(groupAcl.groupKeyEncryptedForMe));
            }
          }
          doRest(unencryptedOldGroupKey);
        }, onError);

      } else {
        doRest(unencryptedOldGroupKey);
      }
    }, onError);
  }  catch (e) {
    onError(makeLocalException(e));
  }
});

/**
 * AddMember
 *
 * args {uid: userId, gid: group_id, target_uid: target user,
 *       _privateKey: key object for me,
 *       _targetPublicKey: key object for the target,
 * calls onSuccess with : see RPC.java
 */
var AddMember = clearCacheAndCall(function(args, onSuccess: OnSuccess, onError: OnError) {
  MutateMembership(args, function(group, unencryptedGroupKey) {
    assert(unencryptedGroupKey);
    group.acls.push(
        {
          level: 'ADMIN',
          groupKeyEncryptedForMe: args._targetPublicKey.encrypt(unencryptedGroupKey.toJson()),
          memberIdentity : args.target_uid
        }
        );
    group.secrets = null;
    return false;
  }, onSuccess, onError);
});

/**
 * RemoveMember
 *
 * args {uid: userId, gid: group_id, target_uid: target user,
 *       _privateKey: key object for me,
 *       _targetPublicKey: key object for the target,
 * calls onSuccess with: see RPC.java
 */
var RemoveMember = clearCacheAndCall(function(args, onSuccess: OnSuccess, onError: OnError) {
  args.includeCriticalData = true;
  MutateMembership(args, function(group, unencryptedOldGroupKey) {
    var newacls = [];
    for (var i in group.acls) {
      var acl = group.acls[i];
      if (acl.memberIdentity === args.target_uid) {
        continue;
      }
      newacls.push(acl);
    }
    assert((newacls.length + 1) === group.acls.length);
    group.acls = newacls;
    return true;
  }, onSuccess, onError);
});


// TODO(tom): move to RPC module
type Secret = {
  secretId: number,
  hostname: string,
  encryptedClientData: string,
  encryptedCriticalData: string,
  groups: Array<number>,
  hiddenGroups: Array<number>,

  users: Array<string>,
  icons: Array<string>,
  /** Maps group ids to group names to display them in the ACL. */
  groupMap: { [key: number]: GroupInfo },
  title: string,

  /** Group ID of the owning organization. This is immutable. */
  owningOrgId: number,
  owningOrgName: string,

  lastModified: AuditAction,
  lastAccessed: AuditAction,
  king: string,
  isViewable: boolean,

  canEditServerSecret: boolean,
  groupIdToPublicKeyMap: { [key: number]: string },

  // local unencrypted data:
  clientData: any,
  criticalData: any,
};

type SecretToPath = Secret & { groupIdPath: Array<number> };

type Group = {
  groupId: number;
  secrets: Array<Secret>;
};

/**
 * GetGroup
 *
 * args {uid: userId, gid: group_id
 *       _privateKey: key object for me,
 * calls onSuccess with: see RPC.java
 */
function GetGroup(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    assert(args.gid);
    const request = {
      groupId: args.gid,
      userId: args.uid,
      includeCriticalData: args.includeCriticalData,
    };
    const resp = _getCache(args).getItem(lru_cache.makeKey('GetGroup', args.uid, args.gid, args.includeCriticalData));

    if (resp) {
        console.log('mitro_lib GetGroup: Found response in cache');
        onSuccess(JSON.parse(resp));
        return; // IMPORTANT DO NOT REMOVE
    }

    PostToMitro(request, args, '/mitro-core/api/GetGroup', function(resp) {
      _getCache(args).setItem(lru_cache.makeKey('GetGroup', args.uid, args.gid, args.includeCriticalData),
        JSON.stringify(resp),
        {expirationAbsolute: new Date(new Date().getTime() + CACHE_TIME_MS)});
      onSuccess(resp);
    }, onError);
  } catch (e) {
    onError(makeLocalException(e));
  }
};


var AddSecrets = clearCacheAndCall(function(args, data, onSuccess: OnSuccess, onError: OnError) {
  try {
    if (data.groupIds.length === 0) {
      onSuccess();
      return;
    }
    var _AddSecretToGroups = function(clientSecret, criticalSecret) {
      GetUserAndGroupPublicKeys(args, false, [], data.groupIds, function(keys) {
        var toRun = [];
        try {

          //Used to prevent creating a function within a loop
          var messageFunction = function(response, onSuccess: OnSuccess, onError: OnError){
            for (var j = 2; j < toRun.length; j++) {
              // $FlowFixMe
              toRun[j][1][0].secretId = response.secretId;
            }
            onSuccess();
          };

          for (var i = 0; i < data.groupIds.length; ++i) {
            var gid = data.groupIds[i];
            var publicKeyString = keys.groupIdToPublicKey[gid];
            console.log("getting key for ", gid);
            assert(publicKeyString);
            const groupPublicKey = crypto.loadFromJson(publicKeyString);
            const secretId = data.secretId; // could be undefined, this is OK (!)
            assert (groupPublicKey);
            const request = {
              myUserId: args.uid,
              ownerGroupId : gid,
              encryptedClientData: groupPublicKey.encrypt(clientSecret),
              encryptedCriticalData: groupPublicKey.encrypt(criticalSecret),
              secretId: secretId
            };
            toRun.push([PostToMitro, [request, args, '/mitro-core/api/AddSecret']]);
            // if we are adding a new secret, set the secret id for the subsequent requests
            // TODO: Ideally this API should do this with one server request
            if (data.secretId === undefined && i === 0) {
              toRun.push([messageFunction, [undefined]]);
            }
          }
          series(toRun, clearCacheAndCall(onSuccess), onError);
        } catch (e) {
          onError(makeLocalException(e));
        }
      }, onError);
    };

    if (data.secretId) {
      // TODO: this is so gross I want to cry.
      args._ = [null, data.secretId];
      GetSecret(args, function (response){
        _AddSecretToGroups(response.clientData, response.criticalData);
      }, onError);
    } else {
      assert(data.clientData);
      assert(data.criticalData);
      _AddSecretToGroups(data.clientData, data.criticalData);
    }


  } catch (e) {
    onError(makeLocalException(e));
  }
});
/**
 * AddSecret
 *
 * args {uid: userId, gid: group_id,
 *       _privateKey: key object for me,
 *       secretId: If provided, adds an existing secret to a new group
 *       '_' : ['hostname', 'client secret', 'critical secret'],
 *
 *       if chainedValue is set and group id is not, it is used in place of group id.

 * calls onSuccess with: see RPC.java
 */
const AddSecret = clearCacheAndCall(function(args, gid: number, onSuccess: OnSuccess, onError: OnError) {
  try {
    // this is a horrible hack.
    // TODO(tom): what does this do?
    if (onError === undefined) {
      onError = onSuccess;
      onSuccess = gid;
      // $FlowFixMe
      gid = undefined;
    }
    if (args.gid === undefined) {
      args.gid = gid;
      console.log('set gid to ' + gid ? gid : "undefined");
    }
    assert(args.gid);

    const wrappedOnSuccess = function(results) {
      try {
        onSuccess(results[0]);
      } catch (e) {
        onError(makeLocalException(e));
      }
    };

    if (args.secretId) {
      AddSecrets(args, {groupIds : [args.gid], secretId : args.secretId}, wrappedOnSuccess, onError);
    } else if (args._.length < 3) {
      console.log('usage: mitro.js add --uid=me@example.com --gid=21 HOSTNAME client critical');
      process.exit(-1);
    } else {
      AddSecrets(args,
        {groupIds : [args.gid],
        secretId : args.secretId,
        clientData: args._[2],
        // TODO: WTF?
        criticalData: (args._.length === 4) ? args._[3] : null},
        wrappedOnSuccess, onError);
    }
  } catch (e) {
    onError(makeLocalException(e));
  }

});


/**
 * RemoveSecret
 *
 * args {uid: userId,
 *       gid: if provided, remove a secret from only this group
 *       _privateKey: key object for me,
 *       '_' : ['secret id'],
 * calls onSuccess with: see RPC.java
 */
var RemoveSecret = clearCacheAndCall(function(args, onSuccess: OnSuccess, onError: OnError) {
  try {
    assert(args.uid);
    var secretId;
    if (args._) {
      if (args._.length < 2) {
        console.log('usage: mitro.js rm --uid=me@example.com SECRET_ID');
        process.exit(-1);
      }
      secretId = parseInt(args._[1], 10);
    } else {
      assert (args.secretId);
      secretId = args.secretId;
    }
    var request = {myUserId: args.uid, secretId:secretId, groupId: args.gid};
    PostToMitro(request, args, '/mitro-core/api/RemoveSecret', clearCacheAndCall(onSuccess), onError);
  } catch (e) {
    onError(makeLocalException(e));
  }

});

/**
 * AddIssue - report a new issue and add to the DB.
 */
function AddIssue(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    console.log('>>Add Issue');
    PostToMitro(args, args, '/mitro-core/api/AddIssue', onSuccess, onError);
  } catch (e) {
    console.log('>> exception in add issue');
    onError(makeLocalException(e));
  }
}

function GetAuditLog(args: Object, onSuccess: OnSuccess, onError: OnError) {
  try {
    console.log('>>Get Audit Log');
    var request = args;
    PostToMitro(request, args, '/mitro-core/api/GetAuditLog', onSuccess, onError);
  } catch (e) {
    console.log('>> exception in get audit log');
    onError(makeLocalException(e));
  }
}

function runCommandWithPrivateKey(cmdFcn: any, argv: any, unencryptedPrivateKey, onSuccessIn: any, onErrorIn: any) {

  var onError = function(e) {
    console.log('ERROR IN TRANSACTION CODE:', e.message, e.stack);
    onErrorIn(makeLocalException(e));
  };

  argv._privateKey = unencryptedPrivateKey;
  PostToMitro({}, argv, '/mitro-core/api/BeginTransaction', function(txResp) {
    var onSuccess = function(successResponse) {
      // close transaction
      console.log('trying to close transaction');
      PostToMitro({}, argv, '/mitro-core/api/EndTransaction', function(etResp) {
        postEndTransaction(argv._transactionSpecificData.id);
        onSuccessIn(successResponse);
      }, onError);
    };


    argv._transactionSpecificData = {id:txResp.transactionId, isWriteOperation: false};

    if (argv.target_uid) {
      // we need to get the private key
      var args = {
        uid: argv.uid,
        target_uid: argv.target_uid,
        deviceId: argv.deviceId,
        _transactionSpecificData: argv._transactionSpecificData,
        '_privateKey': unencryptedPrivateKey,
        server_host: argv.server_host,
        server_port: argv.server_port,
        _keyCache : argv._keyCache
      };

      GetPublicKey(args, function(pubResponse) {
        var targetKey = crypto.loadFromJson(pubResponse.publicKey);
        argv._targetPublicKey = targetKey;
        cmdFcn(argv, onSuccess, onError);
      }, onError);
    } else {
      cmdFcn(argv, onSuccess, onError);
    }
  }, onError);
  return true;
}


var runCommand = function(cmdFcn: any, argv: Object, onSuccess: OnSuccess, onError: OnError) {
    var success = false;
    onSuccess = onSuccess || rpc.DefaultResponseHandler;
    onError = onError || rpc.DefaultErrorHandler;

    argv._keyCache = argv._keyCache || KeyCache.MakeKeyCache();
    if (cmdFcn) {
      if (cmdFcn !== AddIdentity && cmdFcn !== GetPrivateKey) {
        // get the current user's private key and pass it along.
        // TODO: read this from a cache or something
        GetPrivateKey(argv, function(response) {
          var myKey = crypto.loadFromJson(response.encryptedPrivateKey, argv.password);
          runCommandWithPrivateKey(cmdFcn, argv, myKey, onSuccess, onError);
        },
        onError);
      } else {
        cmdFcn(argv, onSuccess, onError);

      }
    success = true;
  }
  return success;
};


function parallel(fcnArgListTuple: Array<any>, onSuccess: OnSuccess, onError: OnError) {
  if (fcnArgListTuple.length === 0) {
    setTimeout(function() {onSuccess([]);}, 0);
    return;
  }
  var rvals = {};
  var success = 0;
  var error = false;
  var called = false;
  var _success = function(i, response) {
    if (error) {
      return;
    }
    assert(rvals[i] === undefined);
    rvals[i] = response;
    ++success;
    if (success === fcnArgListTuple.length) {
      assert (!called);
      called = true;
      var rvlist = [];
      for (var j = 0; j < success; ++j) {
        rvlist.push(rvals[j]);
      }
      onSuccess(rvlist);
    }
  };
  var _error = function(response) {
    if (error) // only first error gets called
      return;
    called = error = true;
    onError(response);
  };
  var makeCallback = function(counter) {
    return function(response) {_success(counter, response);};
  };

  let i = 0;
  for (let x of fcnArgListTuple) {
    var myargs = x[1];
    if (x[2] === undefined || x[2] === undefined) {
      myargs.push(makeCallback(i));
      myargs.push(_error);
    } else {
      // this command should fail
      myargs.push(_error);
      myargs.push(makeCallback(i));
    }
    i++;
    x[0].apply(undefined, myargs);
  }
};

/**
@param {!Array} fcnArgListTuple
@param {function(*)} onSuccess
@param {function(Error)} onError
@param {*=} chainedArg
*/
function series(fcnArgListTuple: Array<any>, onSuccess: OnSuccess, onError: OnError, chainedArg: any) {
  var labels = [];
  for (let x of fcnArgListTuple) {
    if (typeof(x[0]) === 'string' || typeof(x[0]) === 'number') {
      // assume this is a label
      labels.push(String(x[0]));
      x.shift();
    } else {
      labels.push(undefined);
    }
  }
  return _series(labels, fcnArgListTuple, onSuccess, onError, chainedArg);
}

function _series(labels: Array<any>, fcnArgListTuple: Array<any>, onSuccess: OnSuccess, onError: OnError, chainedArg) {
  if (fcnArgListTuple.length === 0) {
    setTimeout(function() {onSuccess([]);}, 0);
    return;
  }
  var rvals = [];
  var rvalMap = {};
  var functions = [];
  var _success = function(response) {
    if (labels[rvals.length]) {
      console.log('*** FINISHED ', labels[rvals.length]);
      rvalMap[labels[rvals.length]] = response;
    }

    rvals.push(response);

    var fcnargs = functions.pop();
    if (fcnargs !== undefined) {
      // replace any undefined value with the chained value or push to the end.
      for (var i in fcnargs[1]) {
        if (fcnargs[1][i] === undefined) {
          fcnargs[1][i] = response;
          response = undefined;
          break;
        }
      }
      ///
      fcnargs[0].apply(undefined, fcnargs[1]);
    } else {
      onSuccess(rvals, rvalMap);
    }
  };

  var _error = onError;

  for (let x of fcnArgListTuple) {
    var myargs = x[1];
    if (x[2] === undefined || x[2] === undefined) {
      myargs.push(_success);
      myargs.push(_error);
    } else {
      // this command should fail
      myargs.push(_error);
      myargs.push(_success);
    }
    functions.push([x[0], myargs]);
  }
  functions.reverse();
  var fcnargs = functions.pop();

  // replace any undefined value with the chained value or push to the end.
  for (let x of fcnargs[1]) {
    if (x === undefined) {
      x = chainedArg;
      chainedArg = undefined;
      break;
    }
  }
  ///

  fcnargs[0].apply(undefined, fcnargs[1]);
};

// TODO: implement batch operations in Java
var batch = series;

function clearCaches() {delete txnSpecificCaches[GENERAL_TRANSACTION];};


export {

  parallel,
  series,
  batch,

  GetGroup,
  GetSecret,
  GetPrivateKey,
  GetPublicKey,
  GetPublicKeys,
  GetUserAndGroupPublicKeys,
  MutateMembership,
  AddSecret,
  AddSecrets,

  RetrieveDeviceSpecificKey,
  AddMember,
  AddGroup,
  AddIdentity,
  RemoveSecret,
  RemoveMember,
  ListGroupsAndSecrets,
  GetOrganizationState,
  AddIssue,
  GetAuditLog,
  runCommand,
  runCommandWithPrivateKey,

  postEndTransaction,
  PostToMitro,
  PostToMitroAgent,
  setPostToMitroForTest,
  decryptSecretWithGroups,
  EditEncryptedPrivateKey,
  clearCaches,
  makeLocalException,

  checkTwoFactor,
}
