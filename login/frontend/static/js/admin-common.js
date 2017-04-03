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


import {$, jQuery} from "../../../../node_modules/jquery/dist/jquery";
import { _ } from "../../../../node_modules/underscore/underscore";
import { templates } from "../../../../api/js/cli/externs_web";

export function showSpinny($loginButton: jQuery) {
    var $img = $('<img src="../img/ajax-loader.gif">');
    $loginButton.after($img);
    $loginButton.hide();
    return $img;
};

export function hideSpinny($loginButton: jQuery, $spinny: jQuery) {
    $spinny.remove();
    $loginButton.show();
};

export function reload() {
    window.location.reload();
};

/**
@param {function(Event)=} onCancelButtonClicked
*/
export function showDialogWithButtons(title: string, message: string, primaryButtonText: string,
                                      cancelButtonText: ?string, onPrimaryButtonClicked: any, onCancelButtonClicked: any) {
    var $dialog = $(templates['modal-dialog-template'].render(
        {title: title,
         message: message,
         primaryButtonText: primaryButtonText,
         cancelButtonText: cancelButtonText}));
    var $primaryButton = $dialog.find('.btn-primary');
    var $cancelButton = $dialog.find('.btn-cancel');

    if (!primaryButtonText) {
        $primaryButton.addClass('hide');
    }
    if (!cancelButtonText) {
        $cancelButton.addClass('hide');
    }

    if (typeof onPrimaryButtonClicked !== 'undefined') {
        $primaryButton.click(onPrimaryButtonClicked);
    }
    if (typeof onCancelButtonClicked !== 'undefined') {
        $cancelButton.click(onCancelButtonClicked);
    }
    $dialog.modal('show');

    return $dialog;
};

export function showDialog(title: string, message: string, onDismiss: any) {
    return showDialogWithButtons(title, message, 'OK', null, onDismiss);
};

/**
@param {function(Event)=} onDismiss
*/
export function showErrorDialog(message: string, onDismiss: any) {
    return showDialog('Error', message, onDismiss);
};

export function showDeleteDialog(title: string, message: string, onDelete: any) {
    return showDialogWithButtons(title, message, 'Delete', 'Cancel', onDelete);
};

export function onBackgroundError(error: Error) {
    console.log('background error', error);

  showErrorDialog(error.userVisibleError ? (error.userVisibleError : any) : error.toString());
};

export function reloadOnError(error: Error) {
    console.log('reloadOnError', error);
    showErrorDialog(error.toString(), function () {
        reload();
    });
};

export function validateEmail(emailString: string) {
    // The HTML5 regexp, must be in sync with the Python code.
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
    var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailString.match(regex);
};

type Group = any

export function isVisibleGroup(group: Group) {
    return !(group.isNonOrgPrivateGroup || group.isOrgPrivateGroup || group.isTopLevelOrg || group.autoDelete);
};

export function filterVisibleGroups(groups: Array<Group>) {
    return _.filter(groups, isVisibleGroup);
};

export function showModal($modal: jQuery) {
    $modal.modal({backdrop: 'static'}).modal('show');
};

export function resetAndShowModal($modal: jQuery) {
    var $form = $modal.find('form');
    $form[0].reset();
    showModal($modal);
};

// Formats a timestamp in ms for the user's locale.
export function formatTimestamp(timestampMs: number) {
    var d = new Date(timestampMs);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};
