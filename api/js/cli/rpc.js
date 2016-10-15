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

var PLATFORM = 'unknown';
if(typeof(window) !== 'undefined') {
  try {
    if (CHROME) {
      PLATFORM = 'CHROME';
    } else if (SAFARI) {
      PLATFORM = 'SAFARI';
    } else if (FIREFOX) {
      PLATFORM = 'FIREFOX';
    } else if (WEBPAGE) {
      PLATFORM = 'WEBPAGE';
    }
  } catch (e) {
  }
}

//////////////////////////////////////////////////////////////////////////
//   Code below here is only for the browser
//////////////////////////////////////////////////////////////////////////
var _PostToMitro = function(outdict, args, path, onSuccess, onError) {
  var url = 'https://' + args.server_host + ':' + args.server_port + path;
  outdict.clientIdentifier = helper.getClientIdentifier();
  outdict.platform = PLATFORM;

  var requestString = JSON.stringify(outdict);
  helper.ajax({
    type: 'POST',
    url: url,
    data: requestString,
    dataType: 'json',
    complete: function (response) {
      try {
        var rval = JSON.parse(response.text);
        if(response.status === 200){
          onSuccess(rval);
        } else {
          onError(rval);
        }
      } catch(e) {
        onError({
          status : response.status,
          userVisibleError: 'Unknown error',
          exceptionType: 'UnknownException'
        });
      }
    }
  });
};

module.exports = { _PostToMitro };
