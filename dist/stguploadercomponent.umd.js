(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.STGUploader = {}));
}(this, (function (exports) { 'use strict';

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var arguments$1 = arguments;

      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments$1[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var arguments$1 = arguments;

    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments$1[i], assignValue);
    }
    return result;
  }

  /**
   * Function equal to merge with the difference being that no reference
   * to original objects is kept.
   *
   * @see merge
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function deepMerge(/* obj1, obj2, obj3, ... */) {
    var arguments$1 = arguments;

    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = deepMerge(result[key], val);
      } else if (typeof val === 'object') {
        result[key] = deepMerge({}, val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments$1[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    deepMerge: deepMerge,
    extend: extend,
    trim: trim
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code
      };
    };
    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
        function resolveURL(url) {
          var href = url;

          if (msie) {
          // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  var cookies = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;

      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      // Listen for ready state
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils.isStandardBrowserEnv()) {
        var cookies$1 = cookies;

        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies$1.read(config.xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }

      if (requestData === undefined) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');
      if (utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { /* Ignore */ }
      }
      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };

  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );

    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};

    var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
    var defaultToConfig2Keys = [
      'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
      'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
      'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
      'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
      'httpsAgent', 'cancelToken', 'socketPath'
    ];

    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      }
    });

    utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
      if (utils.isObject(config2[prop])) {
        config[prop] = utils.deepMerge(config1[prop], config2[prop]);
      } else if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (utils.isObject(config1[prop])) {
        config[prop] = utils.deepMerge(config1[prop]);
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });

    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });

    var axiosKeys = valueFromConfig2Keys
      .concat(mergeDeepPropertiesKeys)
      .concat(defaultToConfig2Keys);

    var otherKeys = Object
      .keys(config2)
      .filter(function filterAxiosKeys(key) {
        return axiosKeys.indexOf(key) === -1;
      });

    utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
      if (typeof config2[prop] !== 'undefined') {
        config[prop] = config2[prop];
      } else if (typeof config1[prop] !== 'undefined') {
        config[prop] = config1[prop];
      }
    });

    return config;
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }

    config = mergeConfig(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url
      }));
    };
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(utils.merge(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Factory for creating new instances
  axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var default_1 = axios;
  axios_1.default = default_1;

  var axios$1 = axios_1;

  //

  var script = {
      props: {
          settings: {
              type: Object,
              required: true,
              validator: function (value) {
                  var valid = true;
                  var requiredProperties = [
                      'uploadURL',
                      'headers'
                  ];

                  for (var prop of requiredProperties) {
                      if (!value.hasOwnProperty(prop)) {
                          valid = false;
                          break;
                      }
                  }

                  if (!valid) {
                      console.log('%c%s', 'color: red; font: 0.7rem/1 Tahoma;', '(STG-UPLOADER): Неверный формат настроек');
                  }

                  return valid;
              }
          },
          containerClass: {
              type: String,
              required: false
          },
          type: {
              type: String,
              required: true,
              validator: function (value) {
                  return ['image', 'images', 'video'].indexOf(value) !== -1
              }
          },
          images: {
              type: Array[String],
              required: false
          },
          image: {
              type: String,
              required: false
          },
          video: {
              type: String,
              required: false
          },
          actionText: {
              type: String,
              required: false
          }
      },

      mounted: function mounted() {
          var this$1 = this;

          if (this.type === 'image') {
              if (this.image) {
                  this.storedImagePath = this.image;
              }
              this.dropArea = this.$refs.dropAreaImage;
          }
          if (this.type === 'images') {
              if (Array.isArray(this.images) && this.images.length > 0) {
                  for (var image of this.images) {
                      this.storedImages.push({
                          id: this.storedImages.length + 1,
                          name: this.getFileNameFromLink(image),
                          path: image,
                          uploaded: true
                      });
                  }
              }
              this.dropArea = this.$refs.dropAreaImages;
          }
          if (this.type === 'video') {
              this.storedVideo = this.video;
              this.dropArea = this.$refs.dropAreaVideo;
          }

          this.dropArea.addEventListener('drop', this.handleDrop, false)

          ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
              this$1.dropArea.addEventListener(eventName, this$1.preventDefaultEvents, false);
          })

          ;['dragenter', 'dragover'].forEach(function (eventName) {
              this$1.dropArea.addEventListener(eventName, this$1.highlight, false);
          })

          ;['dragleave', 'drop'].forEach(function (eventName) {
              this$1.dropArea.addEventListener(eventName, this$1.unHighlight, false);
          });
      },
      data: function () { return ({
          storedImages: [],
          storedImagePath: null,
          storedImageFile: null,
          storedImageName: null,
          imageUploading: false,
          videoUploading: false,
          storedVideoPath: null,
          storedVideoName: null,
          dropArea: null,
          videoUploaded: false,
          availableImagesMime: [
              'image/apng',
              'image/bmp',
              'image/gif',
              'image/x-icon',
              'image/jpeg',
              'image/png',
              'image/svg+xml',
              'image/tiff',
              'image/webp',
              'image/pjpeg' ],
          availableVideosMime: [
              'video/mp4',
              'video/ogg',
              'video/quicktime',
              'video/webm'
          ],
          videoIcon: null
      }); },
      computed: {
          showSingleImagePreview: function showSingleImagePreview() {
              return !this.imageUploading && this.storedImageName && this.storedImagePath
          },
          showSingleVideoPreview: function showSingleVideoPreview() {
              return !this.videoUploading && this.storedVideoName && this.storedVideoPath
          },
          computedContainerClass: function computedContainerClass() {
              return this.containerClass || null
          },
          computedActionText: function computedActionText() {
              return this.actionText || 'Drag&Drop your files'
          }
      },
      methods: {
          removeImageFromList: function removeImageFromList(image) {
              this.storedImages = this.storedImages.filter(function (item) {
                  return item.id !== image.id
              });
              this.$emit('fileDeleted', image.path);
          },
          removeSingleFile: function removeSingleFile(type) {
              switch (type) {
                  case 'image':
                      this.$emit('fileDeleted', this.storedImagePath);
                      this.resetSingleImage();
                      break;
                  case 'video':
                      this.$emit('fileDeleted', this.storedVideoPath);
                      this.resetSingleVideo();
                      break;
              }
          },
          getFileNameFromLink: function getFileNameFromLink(link) {
              if (link) {
                  var m = link.toString().match(/.*\/(.+?)\./);
                  if (m && m.length > 1) {
                      return m[1];
                  }
              }
              return "";
          },
          preventDefaultEvents: function preventDefaultEvents(event) {
              event.preventDefault();
              event.stopPropagation();
          },
          handleDrop: function handleDrop(event) {
              var dt = event.dataTransfer;
              var files = dt.files;


              if (files.length > 0) {
                  switch (this.type) {
                      case 'image':
                          if (this.imageUploading) {
                              alert("Wait... Uploading is progress");
                          } else {
                              this.handleSingleImage(files);
                          }
                          break;
                      case 'images':
                          if (this.storedImages.filter(function (item) { return !item.uploaded; }).length > 0) {
                              alert("Wait... Uploading is progress");
                          } else {
                              this.handleUploadMultipleFiles(files);
                          }
                          break;
                      case 'video':
                          if (this.videoUploading) {
                              alert("Wait... Uploading is progress");
                          } else {
                              this.handleSingleVideo(files);
                          }
                          break;
                  }
              }
          },
          highlight: function highlight() {
              this.dropArea.classList.add('highlight');
          },
          unHighlight: function unHighlight() {
              this.dropArea.classList.remove('highlight');
          },
          openUploadFileDialog: function openUploadFileDialog(event, type) {
              var exceptingClasses = [
                  'remove-item'
              ];
              for (var className of exceptingClasses) {
                  if (event.target.className.replace(/[\n\t]/g, " ").indexOf(className) > -1) {
                      return;
                  }
              }
              switch (type) {
                  case 'image':
                      this.$refs.dropAreaImageInput.click();
                      break;
                  case 'images':
                      this.$refs.dropAreaImagesInput.click();
                      break;
                  case 'video':
                      this.$refs.dropAreaVideoInput.click();
                      break;
              }
          },
          handleUploadMultipleFiles: function handleUploadMultipleFiles(drop) {
              if ( drop === void 0 ) drop = null;

              var files = this.$refs.dropAreaImagesInput.files;
              if (drop) {
                  files = drop;
              }
              if (files.length > 0) {
                  for (var file of files) {
                      var newImage = {
                          id: this.storedImages.length + 1,
                          name: file.name,
                          uploaded: false,
                          path: null
                      };
                      this.storedImages.push(newImage);
                      this.uploadFile(file, 'images', newImage);
                  }
              }
          },
          handleUploadFile: function handleUploadFile(type) {
              switch (type) {
                  case 'image':
                      this.handleSingleImage();
                      break;
                  case 'video':
                      this.handleSingleVideo();
                      break;
              }
          },
          handleSingleImage: function handleSingleImage(drop) {
              if ( drop === void 0 ) drop = null;

              var files = this.$refs.dropAreaImageInput.files;
              if (drop) {
                  files = drop;
              }
              if (files[0]) {
                  var file = files[0];
                  if (this.availableImagesMime.indexOf(file.type) !== -1) {
                      this.imageUploading = true;
                      this.uploadFile(file, 'image');
                  } else {
                      this.$emit('typeError', ("Неверный вормат файла изображения. Допустимые форматы (" + (this.availableImagesMime.join(', ')) + ")"));
                  }
              }
          },
          handleSingleVideo: function handleSingleVideo(drop) {
              if ( drop === void 0 ) drop = null;

              var files = this.$refs.dropAreaVideoInput.files;
              if (drop) {
                  files = drop;
              }
              if (files[0]) {
                  var file = files[0];
                  if (this.availableVideosMime.indexOf(file.type) !== -1) {
                      this.videoUploading = true;
                      this.uploadFile(files[0], 'video');
                  } else {
                      this.$emit('typeError', ("Неверный формат файла видео. Допустимые форматы (" + (this.availableVideosMime.join(', ')) + ")"));
                  }
              }
          },
          showImageName: function showImageName(type) {
              var allowInSettings = this.settings.hasOwnProperty('showFileName') && this.settings.showFileName;
              var nameIsAvailable = false;
              switch (type) {
                  case 'image':
                      nameIsAvailable = !!this.storedImagePath;
                      break;
                  case 'images':
                      nameIsAvailable = this.storedImages.length > 0;
                      break;
                  case 'video':
                      nameIsAvailable = !!this.storedVideo;
                      break;
              }
              return allowInSettings && nameIsAvailable;
          },
          isPathExist: function isPathExist(type) {
              switch (type) {
                  case 'image':
                      return !!this.storedImagePath
                  case 'video':
                      return !!this.storedVideo
                  default:
                      return false
              }
          },
          setSingleImage: function setSingleImage(path, fileName) {
              this.storedImagePath = path;
              this.storedImageName = fileName;
              this.imageUploading = false;
              this.$emit('uploadSuccess', path);
          },
          resetSingleImage: function resetSingleImage(error) {
              if ( error === void 0 ) error = null;

              if (error) {
                  this.$emit('uploadError', error);
              }
              this.storedImagePath = null;
              this.storedImageName = null;
              this.imageUploading = false;
          },
          setSingleImageFromList: function setSingleImageFromList(path, fileName, storedImage) {
              this.storedImages = this.storedImages.filter(function (item) {
                  return item.id !== storedImage.id
              });
              storedImage.path = path;
              storedImage.name = fileName;
              storedImage.uploaded = true;
              this.storedImages.push(storedImage);
              this.$emit('uploadSuccess', path);
          },
          resetSingleImageFromList: function resetSingleImageFromList(error, id) {
              if ( error === void 0 ) error = null;

              if (error) {
                  this.$emit('uploadError', error);
              }
              this.storedImages = this.storedImages.filter(function (item) {
                  return item.id !== id
              });
          },
          setSingleVideo: function setSingleVideo(path, fileName) {
              this.storedVideoPath = path;
              this.storedVideoName = fileName;
              this.videoUploading = false;
              this.$emit('uploadSuccess', path);
          },
          resetSingleVideo: function resetSingleVideo(error) {
              if ( error === void 0 ) error = null;

              if (error) {
                  this.$emit('uploadError', error);
              }
              this.storedVideoPath = null;
              this.storedVideoName = null;
              this.videoUploading = false;
          },
          uploadFile: function uploadFile(file, type, options) {
              var this$1 = this;
              if ( options === void 0 ) options = null;

              this.storedImageName = null;
              this.storedImagePath = null;
              var url = this.settings.uploadURL;
              var formData = new FormData();
              formData.append('file', file);
              var headers = {};
              headers = Object.assign({}, headers, this.headers);

              axios$1.post(url,
                  formData,
                  {
                      headers: headers
                  }
              ).then(function (data) {
                  if (type === 'image') {
                      this$1.setSingleImage(data.data, file.name);
                  }
                  if (type === 'images') {
                      this$1.setSingleImageFromList(data.data, file.name, options);
                  }
                  if (type === 'video') {
                      this$1.setSingleVideo(data.data, file.name);
                  }
              }).catch(function (error) {
                  if (type === 'image') {
                      this$1.resetSingleImage(error);
                  }
                  if (type === 'images') {
                      this$1.resetSingleImageFromList(error, options.id);
                  }
                  if (type === 'video') {
                      this$1.resetSingleVideo(error);
                  }
              });
          }
      }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      var options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      var hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              var originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              var existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  var isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return function (id, style) { return addStyle(id, style); };
  }
  var HEAD;
  var styles = {};
  function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          var code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  { style.element.setAttribute('media', css.media); }
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              var index = style.ids.size - 1;
              var textNode = document.createTextNode(code);
              var nodes = style.element.childNodes;
              if (nodes[index])
                  { style.element.removeChild(nodes[index]); }
              if (nodes.length)
                  { style.element.insertBefore(textNode, nodes[index]); }
              else
                  { style.element.appendChild(textNode); }
          }
      }
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"stg-uploader",class:_vm.computedContainerClass},[(_vm.type === 'image')?_c('div',[_c('div',{ref:"dropAreaImage",staticClass:"drop-area",on:{"click":function($event){return _vm.openUploadFileDialog($event, 'image')}}},[_c('input',{ref:"dropAreaImageInput",attrs:{"type":"file"},on:{"change":function($event){return _vm.handleUploadFile('image')}}}),_vm._v(" "),_c('div',{staticClass:"file-list"},[_c('div',{staticClass:"file-item"},[(_vm.imageUploading)?_c('div',{staticClass:"preview loading"},[_vm._m(0)]):_vm._e(),_vm._v(" "),(_vm.showSingleImagePreview)?_c('div',{staticClass:"preview"},[_c('img',{attrs:{"alt":_vm.storedImageName,"src":_vm.storedImagePath}}),_vm._v(" "),_c('div',{staticClass:"remove-item",on:{"click":function($event){$event.preventDefault();return _vm.removeSingleFile('image')}}},[_vm._v("×")])]):_vm._e(),_vm._v(" "),(_vm.imageUploading)?_c('div',{staticClass:"file-name"},[_vm._v("Wait...")]):_vm._e(),_vm._v(" "),(_vm.showSingleImagePreview)?_c('div',{staticClass:"file-name"},[_vm._v(_vm._s(_vm.storedImageName))]):_vm._e()])])])]):_vm._e(),_vm._v(" "),(_vm.type === 'images')?_c('div',[_c('div',{ref:"dropAreaImages",staticClass:"drop-area",on:{"click":function($event){return _vm.openUploadFileDialog($event, 'images')}}},[_c('input',{ref:"dropAreaImagesInput",attrs:{"multiple":"","type":"file"},on:{"change":function($event){return _vm.handleUploadMultipleFiles()}}}),_vm._v(" "),_c('div',{staticClass:"file-list"},_vm._l((_vm.storedImages),function(image){return _c('div',{key:("image-" + (image.id)),staticClass:"file-item"},[(!image.uploaded)?_c('div',{staticClass:"preview loading"},[_vm._m(1,true)]):_vm._e(),_vm._v(" "),(image.uploaded)?_c('div',{staticClass:"preview"},[_c('img',{attrs:{"alt":image.name,"src":image.path}}),_vm._v(" "),_c('div',{staticClass:"remove-item",on:{"click":function($event){$event.preventDefault();return _vm.removeImageFromList(image)}}},[_vm._v("×")])]):_vm._e(),_vm._v(" "),(!image.uploaded)?_c('div',{staticClass:"file-name"},[_vm._v("Wait...")]):_vm._e(),_vm._v(" "),(image.uploaded && image.name)?_c('div',{staticClass:"file-name"},[_vm._v(_vm._s(image.name))]):_vm._e()])}),0)])]):_vm._e(),_vm._v(" "),(_vm.type === 'video')?_c('div',[_c('div',{ref:"dropAreaVideo",staticClass:"drop-area",on:{"click":function($event){return _vm.openUploadFileDialog($event, 'video')}}},[_c('input',{ref:"dropAreaVideoInput",attrs:{"type":"file"},on:{"change":function($event){return _vm.handleUploadFile('video')}}}),_vm._v(" "),_c('div',{staticClass:"file-list"},[_c('div',{staticClass:"file-item"},[(_vm.videoUploading)?_c('div',{staticClass:"preview loading"},[_vm._m(2)]):_vm._e(),_vm._v(" "),(_vm.showSingleVideoPreview)?_c('div',{staticClass:"preview video"},[_c('video',{attrs:{"src":_vm.storedVideoPath,"autoplay":"autoplay","loop":"loop","muted":"muted"},domProps:{"muted":true}}),_vm._v(" "),_c('div',{staticClass:"remove-item",on:{"click":function($event){$event.preventDefault();return _vm.removeSingleFile('image')}}},[_vm._v("×")])]):_vm._e(),_vm._v(" "),(_vm.videoUploading)?_c('div',{staticClass:"file-name"},[_vm._v("Wait...")]):_vm._e(),_vm._v(" "),(_vm.showSingleVideoPreview)?_c('div',{staticClass:"file-name"},[_vm._v(_vm._s(_vm.storedVideoName))]):_vm._e()])])])]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"uploader-action-text"},[_vm._v(_vm._s(_vm.computedActionText))])])};
  var __vue_staticRenderFns__ = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"loader"},[_c('span',{staticClass:"loader-inner"})])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"loader"},[_c('span',{staticClass:"loader-inner"})])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"loader"},[_c('span',{staticClass:"loader-inner"})])}];

    /* style */
    var __vue_inject_styles__ = function (inject) {
      if (!inject) { return }
      inject("data-v-63e2c072_0", { source: ".stg-uploader{width:100%;border-radius:5px;border:2px dotted #e5e5e5;transition:.2s linear;color:#777;padding:15px;display:flex;flex-direction:column;box-sizing:border-box;background-color:#fff}.stg-uploader *{user-select:none}.stg-uploader:hover{background-color:#f6f6f6}.stg-uploader .drop-area{width:100%;min-height:150px}.stg-uploader .drop-area.highlight .file-list:before{content:'Drop here';position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(150,150,150,.9);font-size:32px;text-align:center;display:flex;align-items:center;justify-content:center;z-index:50;border:1px solid rgba(150,150,150,.7);border-radius:10px;box-sizing:border-box;padding:0;margin:0}.stg-uploader .drop-area input{visibility:hidden;display:none}.stg-uploader .drop-area .image-preview .img-container img{width:100%;height:100%;object-fit:cover;object-position:center center}.stg-uploader .uploader-action-text{text-align:center;color:#000}.stg-uploader .drop-area .file-list{display:flex;height:180px;width:100%;margin:0;padding:0 0 10px 0;overflow-x:auto;position:relative}.stg-uploader .drop-area .file-list .file-item{width:150px;min-width:150px;height:100%;margin-right:20px;display:flex;flex-direction:column;justify-content:space-between}.stg-uploader .drop-area .file-list .file-item:last-of-type{margin-right:0}.stg-uploader .drop-area .file-list .file-item .preview{background:rgba(0,0,0,.1);border-radius:5px;width:100%;height:150px;overflow:hidden;position:relative}.stg-uploader .drop-area .file-list .file-item .preview .remove-item{position:absolute;right:10px;top:10px;font-size:18px;width:16px;height:16px;cursor:pointer;line-height:13px;text-align:center;box-sizing:border-box}.stg-uploader .drop-area .file-list .file-item .preview img{width:100%;height:100%;object-fit:cover;object-position:center}.stg-uploader .drop-area .file-list .file-item .preview.video{display:flex}.stg-uploader .drop-area .file-list .file-item .preview.video video{width:100%;height:100%;margin:auto;object-fit:cover}.stg-uploader .drop-area .file-list .file-item .preview.loading{display:flex}.stg-uploader .drop-area .file-list .file-item .preview.loading .loader{display:inline-block;width:30px;height:30px;position:relative;border:4px solid #fff;animation:loader 2s infinite ease;margin:auto}.stg-uploader .drop-area .file-list .file-item .preview.loading .loader-inner{vertical-align:top;display:inline-block;width:100%;background-color:#fff;animation:loader-inner 2s infinite ease-in}@keyframes loader{0%{transform:rotate(0)}25%{transform:rotate(180deg)}50%{transform:rotate(180deg)}75%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}@keyframes loader-inner{0%{height:0}25%{height:0}50%{height:100%}75%{height:100%}100%{height:0}}.stg-uploader .drop-area .file-list .file-item .file-name{height:20px;width:100%;text-align:center;text-overflow:ellipsis;white-space:nowrap;line-height:100%;overflow:hidden;padding:0 7px;box-sizing:border-box}", map: undefined, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__ = undefined;
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    var __vue_component__ = normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  function install(Vue) {
      if (install.installed) { return; }
      install.installed = true;
      Vue.component("stg-uploader", __vue_component__);
  }

  var plugin = {
      install: install
  };

  var GlobalVue = null;
  if (typeof window !== "undefined") {
      GlobalVue = window.Vue;
  } else if (typeof global !== "undefined") {
      GlobalVue = global.vue;
  }

  if (GlobalVue) {
      GlobalVue.use(plugin);
  }

  __vue_component__.install = install;

  exports.default = __vue_component__;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
