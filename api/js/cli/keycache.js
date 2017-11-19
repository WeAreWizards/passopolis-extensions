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

import * as crypto from "./crypto";
import * as forge from "../../../node_modules/node-forge/js/forge";
import * as background_api from "../../../login/common/background_api";

// ideally keep the cache fill with this many keys
const CACHE_TARGET = 2;

type Cache = {
  push: (key: string) => void;
  setPopListener: (listener: any) => void;
  size: () => number;
  getNewRSAKeysAsync: (numKeys: number, onSuccess: any, onError: any) => void;
  }

// TODO(tom): migrate to class
export const MakeKeyCache = function(): Cache {
  var keys = [];
  var pushListener = null;
  var popListener = null;
  var keyLimit = CACHE_TARGET;
  var keyLimitReachedCallback = null;

  var cache: any = {
    size: function() {
      return keys.length;
    },

    push: function(key) {
      keys.push(key);
      var count = cache.size();
      if (count >= keyLimit) {
        if (keyLimitReachedCallback) {
          keyLimitReachedCallback();
          keyLimitReachedCallback = null;
        }
        keyLimit = CACHE_TARGET;
      }
      if (pushListener !== null) {
        pushListener(cache);
      }
    },

    isEmpty: function() {
      return 0 === keys.length;
    },

    pop: function() {
      if (cache.isEmpty()) {
        // TODO: do this
        //throw new Error("key cache is empty");
        console.log('WARNING: Not using key cache; will be SLOW');
        return crypto.generate();
      } else {
        var result = keys.pop();
        if (popListener !== null) popListener(cache);
        return result;
      }
    },

    toJson: function(jsonString) {
      return JSON.stringify(keys.map(function(k) { return k.toJson();}));
    },

    loadFromJson: function(jsonString) {
      keys = JSON.parse(jsonString).map(function(k) {return crypto.loadFromJson(k);});
    },

    setPushListener: function(listener) {
      pushListener = listener;
    },

    setPopListener: function(listener) {
      popListener = listener;
    },


    setTemporaryLimit : function(count, onSuccess, onError) {
      if (count < 0) {
        onError('invalid request');
        return;
      }
      if (keyLimitReachedCallback) {
        // TODO: this needs to be fixed correctly.
        onError('Key generation already taking place in the background. Try again later.');
        return;
      }

      // generate an extra key to ensure a callback happens.
      count += cache.size() + 1;
      keyLimit = count;
      keyLimitReachedCallback = onSuccess;
      for (var i = cache.size(); i < count; ++i) {
        if (popListener !== null) popListener(cache);
      }
    }
  };

  cache.getNewRSAKeysAsync = function(numKeys, onSuccess, onError) {
    try {
      var rval = [];
      for (var i = 0; i < numKeys; ++i) {
        rval.push(cache.pop());
      }
      onSuccess(rval);
    } catch (e) {
      try {
        console.log("local exception ", e);
        console.log(e.stack);
        console.log(e.message);
      } catch (ee) {
      }
      onError({status: -1,
              userVisibleError: 'Unknown local error',
              exceptionType: 'JavascriptException',
              local_exception: e});
    }
  };

  return cache;
};

/** Returns a string with random bytes from forge.random.getBytesSync. */
// TODO: Remove this
export const getEntropyBytes = function(numBytes: number) {
  return forge.random.seedFileSync(numBytes);
};

export const startFiller = function(cache: Cache) {
  // start a worker: get it to fill the cache
  const background_worker = new Worker('keycache_webworker.js');
  const type = 'keyczar';

  var hasStrongRandom = (type != 'crappy' && typeof window != 'undefined' &&
      window.crypto && window.crypto.getRandomValues);


  background_worker.onmessage = function(e: MessageEvent) {
    if (!e.data || typeof e.data !== "object") {
      return;
    }
    if (e.data.key) {
      console.log('got key from worker');
      // $FlowFixMe
      var k = crypto.loadFromJson(e.data.key);
      cache.push(k);
    } else if (e.data.request == 'log') {
      console.log('worker log:', e.data.message);
    } else if (e.data.request == 'error') {
      console.log('worker exception:', e.data.message);
    } else {
      console.log('unhandled worker message', e.data);
    }
  }

  var postGenerateKey = function() {
    var request: any = {request: 'generate'};
    if (hasStrongRandom) {
      // each time we generate a key, add some additional entropy from the browser
      // TODO: Is this a sufficient amount?
      request.seed = getEntropyBytes(32);
    }
    background_worker.postMessage(request);
  };

  cache.setPopListener(function() {
    // on pop, tell the background worker to generate another key
    postGenerateKey();
  });


  // Tell the worker to load the right crypto
  background_worker.postMessage({request: 'load', type: type});

  if (hasStrongRandom) {
    // seed the random number generator with good entropy, if we have it
    // 32 pools that each want 32 bytes of entropy
    var seed = getEntropyBytes(32 * 32);
    background_worker.postMessage({request: 'seed', seed: seed});
  }

  // Post one message to the background for each key
  var count = cache.size();
  while (count < CACHE_TARGET) {
    postGenerateKey();
    count += 1;
  }

  return {
    stop: function() {
      background_worker.terminate();
    }
  };
};
