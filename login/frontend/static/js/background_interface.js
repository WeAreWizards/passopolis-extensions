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


export class ServiceClientData {
  loginUrl: string;
  title: ?string;
  type: string;
  username: string;
  comment: ?string;
};

export class ServiceCriticalData{
  note: ?string;
  password: ?string;
};

/**
@constructor
@struct
*/
export class ServiceHintsData {
  icons: Array<string>;
  title: string;
};

/**
@constructor
@struct
*/
export class Secret {
  secretId: number;
  hostname: string;
  encryptedClientData: string;
  encryptedCriticalData: string;
  groups: Array<number>;
  hiddenGroups: Array<number>;

  users: Array<string>;
  icons: Array<string>;
  /** Maps group ids to group names to display them in the ACL. */
  groupMap: { [key: number]: GroupInfo };
  title: string;

  /** Group ID of the owning organization. This is immutable. */
  owningOrgId: number;
  owningOrgName: string;

  lastModified: AuditAction;
  lastAccessed: AuditAction;
  king: string;
  isViewable: boolean;

  canEditServerSecret: boolean;
  groupIdToPublicKeyMap: { [key: number]: string };

  // local unencrypted data:
  clientData: any;
  criticalData: any;
};

export class GroupInfo {
  groupId: number;
  autoDelete: boolean;
  name: string;
  encryptedPrivateKey: string;
  isOrgPrivateGroup: boolean;
  isNonOrgPrivateGroup: boolean;
  owningOrgId: number;
  owningOrgName: string;
  users: Array<string>;
  isTopLevelOrg: boolean;
  isRequestorAnOrgAdmin: boolean;
};
export class AuditAction {};


export class OrganizationMetadata {
  id: number;
  name: string;
  isAdmin: boolean;
  privateOrgGroupId: number;
};

export class OrganizationInfoResponse {
  myOrgId: number;
  /** @type {!Object.<number, !mitro.OrganizationMetadata>} */
  organizations: { [key: number]: OrganizationMetadata };
};

// TODO(tom): align all these with the API
export class Organization {
  groups: { [key: number]: GroupInfo };
  orgSecretsToPath: { [key: number]: Secret };
};

export class UsersGroupsSecrets {
  users: Array<string>;
  secrets: Array<Secret>;
  groups: { [key: number]: GroupInfo };
};

export class AddSecretToGroupsData {
  clientData: string;
  criticalData: string;
  groupIds: Array<number>;
}

// TODO(tom): replace any with better types
export class BackgroundApi {
  /**
  @param {function(!mitro.UsersGroupsSecrets)} onSuccess
  @param {function(!Error)} onError
  */
  listUsersGroupsAndSecrets(onSuccess: any, onError: any) {};
  /** myOrgId will be null if the user has no orgs. See getOrgInfo().
  @param {function(!mitro.OrganizationInfoResponse)} onSuccess
  @param {function(!Error)} onError
  */
  getOrganizationInfo(onSuccess: any, onError: any) {};
  /**
  @param {number} orgId
  @param {function(!mitro.Organization)} onSuccess
  @param {function(!Error)} onError
  */
  getOrganization(orgId: number, onSuccess: any, onError: any) {};
  /**
  @param {number} secretId
  @param {function(!mitro.Secret)} onSuccess
  @param {function(!Error)} onError
  */
  getSiteData(secretId: number, onSuccess: any, onError: any) {};
  /**
  @param {number} secretId
  @param {function(!mitro.Secret)} onSuccess
  @param {function(!Error)} onError
  */
  getSiteSecretDataForDisplay(secretId: number, onSuccess: any, onError: any) {};
  /**
  @param {function(!Array.<!mitro.Secret>)} onSuccess
  @param {function(!Error)} onError
  */
  fetchServices(onSuccess: any, onError: any) {};
  /**
  @param {!mitro.AddSecretToGroupsData} data
  @param {function(number)} onSuccess
  @param {function(!Error)} onError
  */
  addSecretToGroups(data: AddSecretToGroupsData, onSuccess: any, onError: any) {};
  /** Defined in client.js
  @param {!Object} serverData
  @param {!Object} clientData
  @param {!Object} secretData
  @param {function(number)} onSuccess
  @param {function(!Error)} onError
  */
  addSecret(serverData: Object, clientData: Object, secretData: Object, onSuccess: any, onError: any) {};
};
