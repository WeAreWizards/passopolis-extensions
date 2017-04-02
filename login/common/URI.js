// @flow
/*
 * Copyright © 2007 Dominic Mitchell
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the Dominic Mitchell nor the names of its contributors
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * An URI datatype.  Based upon examples in RFC3986.
 *
 * TODO %-escaping
 * TODO split apart authority
 * TODO split apart query_string (on demand, anyway)
 * TODO handle parameters containing empty strings properly
 * TODO keyword escaping
 */


//// HELPER FUNCTIONS /////

// RFC3986 §5.2.3 (Merge Paths)
function merge(base: URI, rel_path: string) {
  const dirname = /^(.*)\//;
  if (base.authority && !base.path) {
    return "/" + rel_path;
  }
  const path = base.getPath()
  if (!path) {
    throw "path must not be null when merging"
  }
  const matched = path.match(dirname);
  if (!matched) {
    throw ("path was not a path but: " + path)
  }
  return matched[0] + rel_path;
}

// Match two path segments, where the second is ".." and the first must
// not be "..".
var DoubleDot = /\/((?!\.\.\/)[^\/]*)\/\.\.\//;

function remove_dot_segments(path: ?string) {
  if (!path) {
    return "";
  }
  // Remove any single dots
  var newpath = path.replace(/\/\.\//g, '/');
  // Remove any trailing single dots.
  newpath = newpath.replace(/\/\.$/, '/');
  // Remove any double dots and the path previous.  NB: We can't use
  // the "g", modifier because we are changing the string that we're
  // matching over.
  while (newpath.match(DoubleDot)) {
    newpath = newpath.replace(DoubleDot, '/');
  }
  // Remove any trailing double dots.
  newpath = newpath.replace(/\/([^\/]*)\/\.\.$/, '/');
  // If there are any remaining double dot bits, then they're wrong
  // and must be nuked.  Again, we can't use the g modifier.
  while (newpath.match(/\/\.\.\//)) {
    newpath = newpath.replace(/\/\.\.\//, '/');
  }
  return newpath;
}

// give me an ordered list of keys of this object
function hashkeys(obj) {
  var list = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      list.push(key);
    }
  }
  return list.sort();
}

// TODO: Make these do something
function uriEscape(source) {
  return source;
}

function uriUnescape(source) {
  return source;
}

class URI {
  scheme: ?string;
  authority: ?string;
  path: ?string;
  query: ?string;
  fragment: ?string;

  constructor(str: ?string) {
    if (!str) {
      str = "";
    }
    // Based on the regex in RFC2396 Appendix B.
    var parser = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
    var result = str.match(parser);

    if (result === null || result == undefined) {
      throw "Invalid URI";
    }

    // Keep the results in private variables.
    this.scheme    = result[1] || null;
    this.authority = result[2] || null;
    this.path      = result[3] || null;
    this.query     = result[4] || null;
    this.fragment  = result[5] || null;
  }

  getScheme() {
    return this.scheme;
  };
  setScheme(newScheme: ?string) {
    this.scheme = newScheme;
  };
  getAuthority() {
    return this.authority;
  };
  setAuthority(newAuthority: ?string) {
    this.authority = newAuthority;
  };
  getPath(): ?string {
    return this.path;
  };
  setPath(newPath: ?string) {
    this.path = newPath;
  };
  getQuery(): ?string {
    return this.query;
  };
  setQuery(newQuery: ?string) {
    this.query = newQuery;
  };
  getFragment(): ?string {
    return this.fragment;
  };
  setFragment(newFragment: ?string) {
    this.fragment = newFragment;
  };

  toString() {
    var str = "";
    if (this.scheme) {
      str += this.scheme + ":";
    }
    if (this.authority) {
      str += "//" + this.authority;
    }
    if (this.path) {
      str += this.path;
    }
    if (this.query) {
      str += "?" + this.query;
    }
    if (this.fragment) {
      str += "#" + this.fragment;
    }
    return str;
  }

  // RFC3986 §5.2.2. Transform References;
  resolve(base: URI) {
    var target = new URI();
    if (this.scheme) {
      target.setScheme(this.scheme);
      target.setAuthority(this.authority);
      target.setPath(remove_dot_segments(this.path));
      target.setQuery(this.getQuery());
    } else {
      if (this.authority) {
        target.setAuthority(this.authority);
        target.setPath(remove_dot_segments(this.path));
        target.setQuery(this.getQuery());
      } else {
        // XXX Original spec says "if defined and empty"…;
        const path = this.path;
        if (path) {
          if (path.charAt(0) === '/') {
            target.setPath(remove_dot_segments(path));
          } else {
            target.setPath(merge(base, path));
            target.setPath(remove_dot_segments(target.getPath()));
          }
          target.setQuery(this.getQuery());
        } else {
          target.setPath(base.getPath());
          if (this.getQuery()) {
            target.setQuery(this.getQuery());
          } else {
            target.setQuery(base.getQuery());
          }
        }
        target.setAuthority(base.getAuthority());
      }
      target.setScheme(base.getScheme());
    }
    target.setFragment(this.getFragment());
    return target;
  }

  parseQuery(): ?URIQuery {
    if (this.query) {
      return URIQuery.fromString(this.query, null);
    }
    return null
  }
}


class URIQuery {
  params: any;
  separator: string;

  constuctor() {
    this.params = {};
    this.separator = "&";
  }

  static fromString(sourceString: string, separator: ?string) {
    var result = new URIQuery();
    if (separator) {
      result.separator = separator;
    }
    result.addStringParams(sourceString);
    return result;
  }

  // From http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
  // (application/x-www-form-urlencoded).
  //
  // NB: The user can get this.params and modify it directly.
  addStringParams(sourceString: string) {
    var kvp = sourceString.split(this.separator);
    var list, key, value;
    for (var i = 0; i < kvp.length; i++) {
      // var [key,value] = kvp.split("=", 2) only works on >= JS 1.7
      list  = kvp[i].split("=", 2);
      key   = uriUnescape(list[0].replace(/\+/g, " "));
      value = uriUnescape(list[1].replace(/\+/g, " "));
      if (!this.params.hasOwnProperty(key)) {
        this.params[key] = [];
      }
      this.params[key].push(value);
    }
  }

  getParam(key: string) {
    if (this.params.hasOwnProperty(key)) {
      return this.params[key][0];
    }
    return null;
  }

  toString() {
    var kvp = [];
    var keys = hashkeys(this.params);
    var ik, ip;
    for (ik = 0; ik < keys.length; ik++) {
      for (ip = 0; ip < this.params[keys[ik]].length; ip++) {
        kvp.push(keys[ik].replace(/ /g, "+") + "=" + this.params[keys[ik]][ip].replace(/ /g, "+"));
      }
    }
    return kvp.join(this.separator);
  }
}



export { URI, URIQuery };
