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

export interface CryptoKey {
  toJson(): string;
  encrypt(data: string): string;
  exportPublicKey(): CryptoKey;
}

/**
Opaque object representing the current transaction. Do not look inside.
*/
export class Transaction {};

/**
@constructor
@struct
*/
export class AclRpc {
  level: string;
  groupKeyEncryptedForMe: string;
  myPublicKey: string;
  memberGroup: ?number;
  memberIdentity: ?string;
}

/** Actually called AddGroupRequest in Java; seems like a bad name?
*/
export class GroupRpc {
  name: string;
  publicKey: string;
  signatureString: string;
  scope: string;
  autoDelete: boolean;
  acls: Array<AclRpc>;
};

/** JavaScript client arguments to mutate organization.
*/
export class MutateOrganizationClientRequest {
  orgId: number;
  // New or existing members who will get admin priviledges.
  membersToPromote: Array<string>;
  /** New members to be added. Must not be members already. @type {!Array.<string>} */
  newMembers: Array<string>;
  /** Admins who will get admin privledges removed. @type {!Array.<string>} */
  adminsToDemote: Array<string>;
  /** Members to be removed. @type {!Array.<string>} */
  membersToRemove: Array<string>;
};

/**
Performs operations with the old API.
@interface
*/
export interface LegacyAPI {
  /**
  Gets public keys for users.
  @param {!Array.<string>} identities email addresses of users to fetch.
  @param {mitro.Transaction} transaction transaction this request belongs to (or null).
  @param {function(!Object.<string, string>)} onSuccess called with address -> key mappings.
  @param {function(!Error)} onError called with an error if anything fails.
  */
  getPublicKeys(identities: Array<string>, transaction: Transaction, onSuccess: any, onError: any): void;
  /**
  @param {string} jsonString
  @return {!mitro.CryptoKey}
  */
  cryptoLoadFromJson(jsonString: string): CryptoKey;
  /**
  @param {string} path
  @param {!Object} request
  @param {mitro.Transaction} transaction transaction this request belongs to (or null).
  @param {function(!Object)} onSuccess
  @param {function(!Error)} onError
  */
  postSigned(path: string, request: Object, transaction: Transaction, onSuccess: any, onError: any): void;
  /**
  @param {number} count
  @param {function(!Array.<mitro.CryptoKey>)} onSuccess
  @param {function(!Error)} onError
  */
  getNewRSAKeysAsync(count: number, onSuccess: (Array<CryptoKey>) => void, onError: any): void;
  /**
  @param {number} groupId
  @param {mitro.Transaction} transaction transaction this request belongs to (or null).
  @param {function(mitro.GroupRpc)} onSuccess
  @param {function(!Error)} onError
  */
  getGroup(groupId: number, transaction: Transaction, onSuccess: any, onError: any): any;
  /**
  @return {string}
  */
  getIdentity(): string;
  /**
  @param {string} ciphertext
  @return {string}
  */
  decrypt(ciphertext: string): string;
}