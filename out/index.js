var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// node_modules/localforage/dist/localforage.js
var require_localforage = __commonJS((exports, module) => {
  /*!
      localForage -- Offline Storage, Improved
      Version 1.10.0
      https://localforage.github.io/localForage
      (c) 2013-2017 Mozilla, Apache License 2.0
  */
  (function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f();
    } else if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      var g;
      if (typeof window !== "undefined") {
        g = window;
      } else if (typeof global !== "undefined") {
        g = global;
      } else if (typeof self !== "undefined") {
        g = self;
      } else {
        g = this;
      }
      g.localforage = f();
    }
  })(function() {
    var define2, module2, exports2;
    return function e(t, n, r) {
      function s(o2, u) {
        if (!n[o2]) {
          if (!t[o2]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o2, true);
            if (i)
              return i(o2, true);
            var f = new Error("Cannot find module '" + o2 + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o2] = { exports: {} };
          t[o2][0].call(l.exports, function(e) {
            var n2 = t[o2][1][e];
            return s(n2 ? n2 : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o2].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0;o < r.length; o++)
        s(r[o]);
      return s;
    }({ 1: [function(_dereq_, module3, exports3) {
      (function(global2) {
        var Mutation = global2.MutationObserver || global2.WebKitMutationObserver;
        var scheduleDrain;
        {
          if (Mutation) {
            var called = 0;
            var observer = new Mutation(nextTick);
            var element = global2.document.createTextNode("");
            observer.observe(element, {
              characterData: true
            });
            scheduleDrain = function() {
              element.data = called = ++called % 2;
            };
          } else if (!global2.setImmediate && typeof global2.MessageChannel !== "undefined") {
            var channel = new global2.MessageChannel;
            channel.port1.onmessage = nextTick;
            scheduleDrain = function() {
              channel.port2.postMessage(0);
            };
          } else if (("document" in global2) && ("onreadystatechange" in global2.document.createElement("script"))) {
            scheduleDrain = function() {
              var scriptEl = global2.document.createElement("script");
              scriptEl.onreadystatechange = function() {
                nextTick();
                scriptEl.onreadystatechange = null;
                scriptEl.parentNode.removeChild(scriptEl);
                scriptEl = null;
              };
              global2.document.documentElement.appendChild(scriptEl);
            };
          } else {
            scheduleDrain = function() {
              setTimeout(nextTick, 0);
            };
          }
        }
        var draining;
        var queue = [];
        function nextTick() {
          draining = true;
          var i, oldQueue;
          var len = queue.length;
          while (len) {
            oldQueue = queue;
            queue = [];
            i = -1;
            while (++i < len) {
              oldQueue[i]();
            }
            len = queue.length;
          }
          draining = false;
        }
        module3.exports = immediate;
        function immediate(task) {
          if (queue.push(task) === 1 && !draining) {
            scheduleDrain();
          }
        }
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 2: [function(_dereq_, module3, exports3) {
      var immediate = _dereq_(1);
      function INTERNAL() {
      }
      var handlers = {};
      var REJECTED = ["REJECTED"];
      var FULFILLED = ["FULFILLED"];
      var PENDING = ["PENDING"];
      module3.exports = Promise2;
      function Promise2(resolver) {
        if (typeof resolver !== "function") {
          throw new TypeError("resolver must be a function");
        }
        this.state = PENDING;
        this.queue = [];
        this.outcome = undefined;
        if (resolver !== INTERNAL) {
          safelyResolveThenable(this, resolver);
        }
      }
      Promise2.prototype["catch"] = function(onRejected) {
        return this.then(null, onRejected);
      };
      Promise2.prototype.then = function(onFulfilled, onRejected) {
        if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
          return this;
        }
        var promise = new this.constructor(INTERNAL);
        if (this.state !== PENDING) {
          var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
          unwrap(promise, resolver, this.outcome);
        } else {
          this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
        }
        return promise;
      };
      function QueueItem(promise, onFulfilled, onRejected) {
        this.promise = promise;
        if (typeof onFulfilled === "function") {
          this.onFulfilled = onFulfilled;
          this.callFulfilled = this.otherCallFulfilled;
        }
        if (typeof onRejected === "function") {
          this.onRejected = onRejected;
          this.callRejected = this.otherCallRejected;
        }
      }
      QueueItem.prototype.callFulfilled = function(value) {
        handlers.resolve(this.promise, value);
      };
      QueueItem.prototype.otherCallFulfilled = function(value) {
        unwrap(this.promise, this.onFulfilled, value);
      };
      QueueItem.prototype.callRejected = function(value) {
        handlers.reject(this.promise, value);
      };
      QueueItem.prototype.otherCallRejected = function(value) {
        unwrap(this.promise, this.onRejected, value);
      };
      function unwrap(promise, func, value) {
        immediate(function() {
          var returnValue;
          try {
            returnValue = func(value);
          } catch (e) {
            return handlers.reject(promise, e);
          }
          if (returnValue === promise) {
            handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
          } else {
            handlers.resolve(promise, returnValue);
          }
        });
      }
      handlers.resolve = function(self2, value) {
        var result = tryCatch(getThen, value);
        if (result.status === "error") {
          return handlers.reject(self2, result.value);
        }
        var thenable = result.value;
        if (thenable) {
          safelyResolveThenable(self2, thenable);
        } else {
          self2.state = FULFILLED;
          self2.outcome = value;
          var i = -1;
          var len = self2.queue.length;
          while (++i < len) {
            self2.queue[i].callFulfilled(value);
          }
        }
        return self2;
      };
      handlers.reject = function(self2, error) {
        self2.state = REJECTED;
        self2.outcome = error;
        var i = -1;
        var len = self2.queue.length;
        while (++i < len) {
          self2.queue[i].callRejected(error);
        }
        return self2;
      };
      function getThen(obj) {
        var then = obj && obj.then;
        if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
          return function appyThen() {
            then.apply(obj, arguments);
          };
        }
      }
      function safelyResolveThenable(self2, thenable) {
        var called = false;
        function onError(value) {
          if (called) {
            return;
          }
          called = true;
          handlers.reject(self2, value);
        }
        function onSuccess(value) {
          if (called) {
            return;
          }
          called = true;
          handlers.resolve(self2, value);
        }
        function tryToUnwrap() {
          thenable(onSuccess, onError);
        }
        var result = tryCatch(tryToUnwrap);
        if (result.status === "error") {
          onError(result.value);
        }
      }
      function tryCatch(func, value) {
        var out = {};
        try {
          out.value = func(value);
          out.status = "success";
        } catch (e) {
          out.status = "error";
          out.value = e;
        }
        return out;
      }
      Promise2.resolve = resolve;
      function resolve(value) {
        if (value instanceof this) {
          return value;
        }
        return handlers.resolve(new this(INTERNAL), value);
      }
      Promise2.reject = reject;
      function reject(reason) {
        var promise = new this(INTERNAL);
        return handlers.reject(promise, reason);
      }
      Promise2.all = all;
      function all(iterable) {
        var self2 = this;
        if (Object.prototype.toString.call(iterable) !== "[object Array]") {
          return this.reject(new TypeError("must be an array"));
        }
        var len = iterable.length;
        var called = false;
        if (!len) {
          return this.resolve([]);
        }
        var values = new Array(len);
        var resolved = 0;
        var i = -1;
        var promise = new this(INTERNAL);
        while (++i < len) {
          allResolver(iterable[i], i);
        }
        return promise;
        function allResolver(value, i2) {
          self2.resolve(value).then(resolveFromAll, function(error) {
            if (!called) {
              called = true;
              handlers.reject(promise, error);
            }
          });
          function resolveFromAll(outValue) {
            values[i2] = outValue;
            if (++resolved === len && !called) {
              called = true;
              handlers.resolve(promise, values);
            }
          }
        }
      }
      Promise2.race = race;
      function race(iterable) {
        var self2 = this;
        if (Object.prototype.toString.call(iterable) !== "[object Array]") {
          return this.reject(new TypeError("must be an array"));
        }
        var len = iterable.length;
        var called = false;
        if (!len) {
          return this.resolve([]);
        }
        var i = -1;
        var promise = new this(INTERNAL);
        while (++i < len) {
          resolver(iterable[i]);
        }
        return promise;
        function resolver(value) {
          self2.resolve(value).then(function(response) {
            if (!called) {
              called = true;
              handlers.resolve(promise, response);
            }
          }, function(error) {
            if (!called) {
              called = true;
              handlers.reject(promise, error);
            }
          });
        }
      }
    }, { "1": 1 }], 3: [function(_dereq_, module3, exports3) {
      (function(global2) {
        if (typeof global2.Promise !== "function") {
          global2.Promise = _dereq_(2);
        }
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "2": 2 }], 4: [function(_dereq_, module3, exports3) {
      var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function getIDB() {
        try {
          if (typeof indexedDB !== "undefined") {
            return indexedDB;
          }
          if (typeof webkitIndexedDB !== "undefined") {
            return webkitIndexedDB;
          }
          if (typeof mozIndexedDB !== "undefined") {
            return mozIndexedDB;
          }
          if (typeof OIndexedDB !== "undefined") {
            return OIndexedDB;
          }
          if (typeof msIndexedDB !== "undefined") {
            return msIndexedDB;
          }
        } catch (e) {
          return;
        }
      }
      var idb = getIDB();
      function isIndexedDBValid() {
        try {
          if (!idb || !idb.open) {
            return false;
          }
          var isSafari = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
          var hasFetch = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
          return (!isSafari || hasFetch) && typeof indexedDB !== "undefined" && typeof IDBKeyRange !== "undefined";
        } catch (e) {
          return false;
        }
      }
      function createBlob(parts, properties) {
        parts = parts || [];
        properties = properties || {};
        try {
          return new Blob(parts, properties);
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
          var builder = new Builder;
          for (var i = 0;i < parts.length; i += 1) {
            builder.append(parts[i]);
          }
          return builder.getBlob(properties.type);
        }
      }
      if (typeof Promise === "undefined") {
        _dereq_(3);
      }
      var Promise$1 = Promise;
      function executeCallback(promise, callback) {
        if (callback) {
          promise.then(function(result) {
            callback(null, result);
          }, function(error) {
            callback(error);
          });
        }
      }
      function executeTwoCallbacks(promise, callback, errorCallback) {
        if (typeof callback === "function") {
          promise.then(callback);
        }
        if (typeof errorCallback === "function") {
          promise["catch"](errorCallback);
        }
      }
      function normalizeKey(key2) {
        if (typeof key2 !== "string") {
          console.warn(key2 + " used as a key, but it is not a string.");
          key2 = String(key2);
        }
        return key2;
      }
      function getCallback() {
        if (arguments.length && typeof arguments[arguments.length - 1] === "function") {
          return arguments[arguments.length - 1];
        }
      }
      var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
      var supportsBlobs = undefined;
      var dbContexts = {};
      var toString = Object.prototype.toString;
      var READ_ONLY = "readonly";
      var READ_WRITE = "readwrite";
      function _binStringToArrayBuffer(bin) {
        var length2 = bin.length;
        var buf = new ArrayBuffer(length2);
        var arr = new Uint8Array(buf);
        for (var i = 0;i < length2; i++) {
          arr[i] = bin.charCodeAt(i);
        }
        return buf;
      }
      function _checkBlobSupportWithoutCaching(idb2) {
        return new Promise$1(function(resolve) {
          var txn = idb2.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
          var blob = createBlob([""]);
          txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
          txn.onabort = function(e) {
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
          };
          txn.oncomplete = function() {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
          };
        })["catch"](function() {
          return false;
        });
      }
      function _checkBlobSupport(idb2) {
        if (typeof supportsBlobs === "boolean") {
          return Promise$1.resolve(supportsBlobs);
        }
        return _checkBlobSupportWithoutCaching(idb2).then(function(value) {
          supportsBlobs = value;
          return supportsBlobs;
        });
      }
      function _deferReadiness(dbInfo) {
        var dbContext = dbContexts[dbInfo.name];
        var deferredOperation = {};
        deferredOperation.promise = new Promise$1(function(resolve, reject) {
          deferredOperation.resolve = resolve;
          deferredOperation.reject = reject;
        });
        dbContext.deferredOperations.push(deferredOperation);
        if (!dbContext.dbReady) {
          dbContext.dbReady = deferredOperation.promise;
        } else {
          dbContext.dbReady = dbContext.dbReady.then(function() {
            return deferredOperation.promise;
          });
        }
      }
      function _advanceReadiness(dbInfo) {
        var dbContext = dbContexts[dbInfo.name];
        var deferredOperation = dbContext.deferredOperations.pop();
        if (deferredOperation) {
          deferredOperation.resolve();
          return deferredOperation.promise;
        }
      }
      function _rejectReadiness(dbInfo, err) {
        var dbContext = dbContexts[dbInfo.name];
        var deferredOperation = dbContext.deferredOperations.pop();
        if (deferredOperation) {
          deferredOperation.reject(err);
          return deferredOperation.promise;
        }
      }
      function _getConnection(dbInfo, upgradeNeeded) {
        return new Promise$1(function(resolve, reject) {
          dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();
          if (dbInfo.db) {
            if (upgradeNeeded) {
              _deferReadiness(dbInfo);
              dbInfo.db.close();
            } else {
              return resolve(dbInfo.db);
            }
          }
          var dbArgs = [dbInfo.name];
          if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
          }
          var openreq = idb.open.apply(idb, dbArgs);
          if (upgradeNeeded) {
            openreq.onupgradeneeded = function(e) {
              var db = openreq.result;
              try {
                db.createObjectStore(dbInfo.storeName);
                if (e.oldVersion <= 1) {
                  db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                }
              } catch (ex) {
                if (ex.name === "ConstraintError") {
                  console.warn('The database "' + dbInfo.name + '" has been upgraded from version ' + e.oldVersion + " to version " + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                } else {
                  throw ex;
                }
              }
            };
          }
          openreq.onerror = function(e) {
            e.preventDefault();
            reject(openreq.error);
          };
          openreq.onsuccess = function() {
            var db = openreq.result;
            db.onversionchange = function(e) {
              e.target.close();
            };
            resolve(db);
            _advanceReadiness(dbInfo);
          };
        });
      }
      function _getOriginalConnection(dbInfo) {
        return _getConnection(dbInfo, false);
      }
      function _getUpgradedConnection(dbInfo) {
        return _getConnection(dbInfo, true);
      }
      function _isUpgradeNeeded(dbInfo, defaultVersion) {
        if (!dbInfo.db) {
          return true;
        }
        var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
        var isDowngrade = dbInfo.version < dbInfo.db.version;
        var isUpgrade = dbInfo.version > dbInfo.db.version;
        if (isDowngrade) {
          if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + `" can't be downgraded from version ` + dbInfo.db.version + " to version " + dbInfo.version + ".");
          }
          dbInfo.version = dbInfo.db.version;
        }
        if (isUpgrade || isNewStore) {
          if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
              dbInfo.version = incVersion;
            }
          }
          return true;
        }
        return false;
      }
      function _encodeBlob(blob) {
        return new Promise$1(function(resolve, reject) {
          var reader = new FileReader;
          reader.onerror = reject;
          reader.onloadend = function(e) {
            var base64 = btoa(e.target.result || "");
            resolve({
              __local_forage_encoded_blob: true,
              data: base64,
              type: blob.type
            });
          };
          reader.readAsBinaryString(blob);
        });
      }
      function _decodeBlob(encodedBlob) {
        var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
        return createBlob([arrayBuff], { type: encodedBlob.type });
      }
      function _isEncodedBlob(value) {
        return value && value.__local_forage_encoded_blob;
      }
      function _fullyReady(callback) {
        var self2 = this;
        var promise = self2._initReady().then(function() {
          var dbContext = dbContexts[self2._dbInfo.name];
          if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
          }
        });
        executeTwoCallbacks(promise, callback, callback);
        return promise;
      }
      function _tryReconnect(dbInfo) {
        _deferReadiness(dbInfo);
        var dbContext = dbContexts[dbInfo.name];
        var forages = dbContext.forages;
        for (var i = 0;i < forages.length; i++) {
          var forage = forages[i];
          if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
          }
        }
        dbInfo.db = null;
        return _getOriginalConnection(dbInfo).then(function(db) {
          dbInfo.db = db;
          if (_isUpgradeNeeded(dbInfo)) {
            return _getUpgradedConnection(dbInfo);
          }
          return db;
        }).then(function(db) {
          dbInfo.db = dbContext.db = db;
          for (var i2 = 0;i2 < forages.length; i2++) {
            forages[i2]._dbInfo.db = db;
          }
        })["catch"](function(err) {
          _rejectReadiness(dbInfo, err);
          throw err;
        });
      }
      function createTransaction(dbInfo, mode, callback, retries) {
        if (retries === undefined) {
          retries = 1;
        }
        try {
          var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
          callback(null, tx);
        } catch (err) {
          if (retries > 0 && (!dbInfo.db || err.name === "InvalidStateError" || err.name === "NotFoundError")) {
            return Promise$1.resolve().then(function() {
              if (!dbInfo.db || err.name === "NotFoundError" && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                if (dbInfo.db) {
                  dbInfo.version = dbInfo.db.version + 1;
                }
                return _getUpgradedConnection(dbInfo);
              }
            }).then(function() {
              return _tryReconnect(dbInfo).then(function() {
                createTransaction(dbInfo, mode, callback, retries - 1);
              });
            })["catch"](callback);
          }
          callback(err);
        }
      }
      function createDbContext() {
        return {
          forages: [],
          db: null,
          dbReady: null,
          deferredOperations: []
        };
      }
      function _initStorage(options) {
        var self2 = this;
        var dbInfo = {
          db: null
        };
        if (options) {
          for (var i in options) {
            dbInfo[i] = options[i];
          }
        }
        var dbContext = dbContexts[dbInfo.name];
        if (!dbContext) {
          dbContext = createDbContext();
          dbContexts[dbInfo.name] = dbContext;
        }
        dbContext.forages.push(self2);
        if (!self2._initReady) {
          self2._initReady = self2.ready;
          self2.ready = _fullyReady;
        }
        var initPromises = [];
        function ignoreErrors() {
          return Promise$1.resolve();
        }
        for (var j = 0;j < dbContext.forages.length; j++) {
          var forage = dbContext.forages[j];
          if (forage !== self2) {
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
          }
        }
        var forages = dbContext.forages.slice(0);
        return Promise$1.all(initPromises).then(function() {
          dbInfo.db = dbContext.db;
          return _getOriginalConnection(dbInfo);
        }).then(function(db) {
          dbInfo.db = db;
          if (_isUpgradeNeeded(dbInfo, self2._defaultConfig.version)) {
            return _getUpgradedConnection(dbInfo);
          }
          return db;
        }).then(function(db) {
          dbInfo.db = dbContext.db = db;
          self2._dbInfo = dbInfo;
          for (var k = 0;k < forages.length; k++) {
            var forage2 = forages[k];
            if (forage2 !== self2) {
              forage2._dbInfo.db = dbInfo.db;
              forage2._dbInfo.version = dbInfo.version;
            }
          }
        });
      }
      function getItem(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store.get(key2);
                req.onsuccess = function() {
                  var value = req.result;
                  if (value === undefined) {
                    value = null;
                  }
                  if (_isEncodedBlob(value)) {
                    value = _decodeBlob(value);
                  }
                  resolve(value);
                };
                req.onerror = function() {
                  reject(req.error);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function iterate(iterator, callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store.openCursor();
                var iterationNumber = 1;
                req.onsuccess = function() {
                  var cursor = req.result;
                  if (cursor) {
                    var value = cursor.value;
                    if (_isEncodedBlob(value)) {
                      value = _decodeBlob(value);
                    }
                    var result = iterator(value, cursor.key, iterationNumber++);
                    if (result !== undefined) {
                      resolve(result);
                    } else {
                      cursor["continue"]();
                    }
                  } else {
                    resolve();
                  }
                };
                req.onerror = function() {
                  reject(req.error);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function setItem(key2, value, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          var dbInfo;
          self2.ready().then(function() {
            dbInfo = self2._dbInfo;
            if (toString.call(value) === "[object Blob]") {
              return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                if (blobSupport) {
                  return value;
                }
                return _encodeBlob(value);
              });
            }
            return value;
          }).then(function(value2) {
            createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                if (value2 === null) {
                  value2 = undefined;
                }
                var req = store.put(value2, key2);
                transaction.oncomplete = function() {
                  if (value2 === undefined) {
                    value2 = null;
                  }
                  resolve(value2);
                };
                transaction.onabort = transaction.onerror = function() {
                  var err2 = req.error ? req.error : req.transaction.error;
                  reject(err2);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function removeItem(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store["delete"](key2);
                transaction.oncomplete = function() {
                  resolve();
                };
                transaction.onerror = function() {
                  reject(req.error);
                };
                transaction.onabort = function() {
                  var err2 = req.error ? req.error : req.transaction.error;
                  reject(err2);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function clear(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store.clear();
                transaction.oncomplete = function() {
                  resolve();
                };
                transaction.onabort = transaction.onerror = function() {
                  var err2 = req.error ? req.error : req.transaction.error;
                  reject(err2);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function length(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store.count();
                req.onsuccess = function() {
                  resolve(req.result);
                };
                req.onerror = function() {
                  reject(req.error);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function key(n, callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          if (n < 0) {
            resolve(null);
            return;
          }
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var advanced = false;
                var req = store.openKeyCursor();
                req.onsuccess = function() {
                  var cursor = req.result;
                  if (!cursor) {
                    resolve(null);
                    return;
                  }
                  if (n === 0) {
                    resolve(cursor.key);
                  } else {
                    if (!advanced) {
                      advanced = true;
                      cursor.advance(n);
                    } else {
                      resolve(cursor.key);
                    }
                  }
                };
                req.onerror = function() {
                  reject(req.error);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function keys(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
              if (err) {
                return reject(err);
              }
              try {
                var store = transaction.objectStore(self2._dbInfo.storeName);
                var req = store.openKeyCursor();
                var keys2 = [];
                req.onsuccess = function() {
                  var cursor = req.result;
                  if (!cursor) {
                    resolve(keys2);
                    return;
                  }
                  keys2.push(cursor.key);
                  cursor["continue"]();
                };
                req.onerror = function() {
                  reject(req.error);
                };
              } catch (e) {
                reject(e);
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function dropInstance(options, callback) {
        callback = getCallback.apply(this, arguments);
        var currentConfig = this.config();
        options = typeof options !== "function" && options || {};
        if (!options.name) {
          options.name = options.name || currentConfig.name;
          options.storeName = options.storeName || currentConfig.storeName;
        }
        var self2 = this;
        var promise;
        if (!options.name) {
          promise = Promise$1.reject("Invalid arguments");
        } else {
          var isCurrentDb = options.name === currentConfig.name && self2._dbInfo.db;
          var dbPromise = isCurrentDb ? Promise$1.resolve(self2._dbInfo.db) : _getOriginalConnection(options).then(function(db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0;i < forages.length; i++) {
              forages[i]._dbInfo.db = db;
            }
            return db;
          });
          if (!options.storeName) {
            promise = dbPromise.then(function(db) {
              _deferReadiness(options);
              var dbContext = dbContexts[options.name];
              var forages = dbContext.forages;
              db.close();
              for (var i = 0;i < forages.length; i++) {
                var forage = forages[i];
                forage._dbInfo.db = null;
              }
              var dropDBPromise = new Promise$1(function(resolve, reject) {
                var req = idb.deleteDatabase(options.name);
                req.onerror = function() {
                  var db2 = req.result;
                  if (db2) {
                    db2.close();
                  }
                  reject(req.error);
                };
                req.onblocked = function() {
                  console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                };
                req.onsuccess = function() {
                  var db2 = req.result;
                  if (db2) {
                    db2.close();
                  }
                  resolve(db2);
                };
              });
              return dropDBPromise.then(function(db2) {
                dbContext.db = db2;
                for (var i2 = 0;i2 < forages.length; i2++) {
                  var _forage = forages[i2];
                  _advanceReadiness(_forage._dbInfo);
                }
              })["catch"](function(err) {
                (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                });
                throw err;
              });
            });
          } else {
            promise = dbPromise.then(function(db) {
              if (!db.objectStoreNames.contains(options.storeName)) {
                return;
              }
              var newVersion = db.version + 1;
              _deferReadiness(options);
              var dbContext = dbContexts[options.name];
              var forages = dbContext.forages;
              db.close();
              for (var i = 0;i < forages.length; i++) {
                var forage = forages[i];
                forage._dbInfo.db = null;
                forage._dbInfo.version = newVersion;
              }
              var dropObjectPromise = new Promise$1(function(resolve, reject) {
                var req = idb.open(options.name, newVersion);
                req.onerror = function(err) {
                  var db2 = req.result;
                  db2.close();
                  reject(err);
                };
                req.onupgradeneeded = function() {
                  var db2 = req.result;
                  db2.deleteObjectStore(options.storeName);
                };
                req.onsuccess = function() {
                  var db2 = req.result;
                  db2.close();
                  resolve(db2);
                };
              });
              return dropObjectPromise.then(function(db2) {
                dbContext.db = db2;
                for (var j = 0;j < forages.length; j++) {
                  var _forage2 = forages[j];
                  _forage2._dbInfo.db = db2;
                  _advanceReadiness(_forage2._dbInfo);
                }
              })["catch"](function(err) {
                (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                });
                throw err;
              });
            });
          }
        }
        executeCallback(promise, callback);
        return promise;
      }
      var asyncStorage = {
        _driver: "asyncStorage",
        _initStorage,
        _support: isIndexedDBValid(),
        iterate,
        getItem,
        setItem,
        removeItem,
        clear,
        length,
        key,
        keys,
        dropInstance
      };
      function isWebSQLValid() {
        return typeof openDatabase === "function";
      }
      var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var BLOB_TYPE_PREFIX = "~~local_forage_type~";
      var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
      var SERIALIZED_MARKER = "__lfsc__:";
      var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
      var TYPE_ARRAYBUFFER = "arbf";
      var TYPE_BLOB = "blob";
      var TYPE_INT8ARRAY = "si08";
      var TYPE_UINT8ARRAY = "ui08";
      var TYPE_UINT8CLAMPEDARRAY = "uic8";
      var TYPE_INT16ARRAY = "si16";
      var TYPE_INT32ARRAY = "si32";
      var TYPE_UINT16ARRAY = "ur16";
      var TYPE_UINT32ARRAY = "ui32";
      var TYPE_FLOAT32ARRAY = "fl32";
      var TYPE_FLOAT64ARRAY = "fl64";
      var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
      var toString$1 = Object.prototype.toString;
      function stringToBuffer(serializedString) {
        var bufferLength = serializedString.length * 0.75;
        var len = serializedString.length;
        var i;
        var p = 0;
        var encoded1, encoded2, encoded3, encoded4;
        if (serializedString[serializedString.length - 1] === "=") {
          bufferLength--;
          if (serializedString[serializedString.length - 2] === "=") {
            bufferLength--;
          }
        }
        var buffer = new ArrayBuffer(bufferLength);
        var bytes = new Uint8Array(buffer);
        for (i = 0;i < len; i += 4) {
          encoded1 = BASE_CHARS.indexOf(serializedString[i]);
          encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
          encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
          encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
          bytes[p++] = encoded1 << 2 | encoded2 >> 4;
          bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
          bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
        }
        return buffer;
      }
      function bufferToString(buffer) {
        var bytes = new Uint8Array(buffer);
        var base64String = "";
        var i;
        for (i = 0;i < bytes.length; i += 3) {
          base64String += BASE_CHARS[bytes[i] >> 2];
          base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
          base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
          base64String += BASE_CHARS[bytes[i + 2] & 63];
        }
        if (bytes.length % 3 === 2) {
          base64String = base64String.substring(0, base64String.length - 1) + "=";
        } else if (bytes.length % 3 === 1) {
          base64String = base64String.substring(0, base64String.length - 2) + "==";
        }
        return base64String;
      }
      function serialize(value, callback) {
        var valueType = "";
        if (value) {
          valueType = toString$1.call(value);
        }
        if (value && (valueType === "[object ArrayBuffer]" || value.buffer && toString$1.call(value.buffer) === "[object ArrayBuffer]")) {
          var buffer;
          var marker = SERIALIZED_MARKER;
          if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
          } else {
            buffer = value.buffer;
            if (valueType === "[object Int8Array]") {
              marker += TYPE_INT8ARRAY;
            } else if (valueType === "[object Uint8Array]") {
              marker += TYPE_UINT8ARRAY;
            } else if (valueType === "[object Uint8ClampedArray]") {
              marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === "[object Int16Array]") {
              marker += TYPE_INT16ARRAY;
            } else if (valueType === "[object Uint16Array]") {
              marker += TYPE_UINT16ARRAY;
            } else if (valueType === "[object Int32Array]") {
              marker += TYPE_INT32ARRAY;
            } else if (valueType === "[object Uint32Array]") {
              marker += TYPE_UINT32ARRAY;
            } else if (valueType === "[object Float32Array]") {
              marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === "[object Float64Array]") {
              marker += TYPE_FLOAT64ARRAY;
            } else {
              callback(new Error("Failed to get type for BinaryArray"));
            }
          }
          callback(marker + bufferToString(buffer));
        } else if (valueType === "[object Blob]") {
          var fileReader = new FileReader;
          fileReader.onload = function() {
            var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
          };
          fileReader.readAsArrayBuffer(value);
        } else {
          try {
            callback(JSON.stringify(value));
          } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);
            callback(null, e);
          }
        }
      }
      function deserialize(value) {
        if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
          return JSON.parse(value);
        }
        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
        var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
        var blobType;
        if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
          var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
          blobType = matcher[1];
          serializedString = serializedString.substring(matcher[0].length);
        }
        var buffer = stringToBuffer(serializedString);
        switch (type) {
          case TYPE_ARRAYBUFFER:
            return buffer;
          case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
          case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
          case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
          case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
          case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
          case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
          case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
          case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
          case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
          case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
          default:
            throw new Error("Unkown type: " + type);
        }
      }
      var localforageSerializer = {
        serialize,
        deserialize,
        stringToBuffer,
        bufferToString
      };
      function createDbTable(t, dbInfo, callback, errorCallback) {
        t.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], callback, errorCallback);
      }
      function _initStorage$1(options) {
        var self2 = this;
        var dbInfo = {
          db: null
        };
        if (options) {
          for (var i in options) {
            dbInfo[i] = typeof options[i] !== "string" ? options[i].toString() : options[i];
          }
        }
        var dbInfoPromise = new Promise$1(function(resolve, reject) {
          try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
          } catch (e) {
            return reject(e);
          }
          dbInfo.db.transaction(function(t) {
            createDbTable(t, dbInfo, function() {
              self2._dbInfo = dbInfo;
              resolve();
            }, function(t2, error) {
              reject(error);
            });
          }, reject);
        });
        dbInfo.serializer = localforageSerializer;
        return dbInfoPromise;
      }
      function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
        t.executeSql(sqlStatement, args, callback, function(t2, error) {
          if (error.code === error.SYNTAX_ERR) {
            t2.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [dbInfo.storeName], function(t3, results) {
              if (!results.rows.length) {
                createDbTable(t3, dbInfo, function() {
                  t3.executeSql(sqlStatement, args, callback, errorCallback);
                }, errorCallback);
              } else {
                errorCallback(t3, error);
              }
            }, errorCallback);
          } else {
            errorCallback(t2, error);
          }
        }, errorCallback);
      }
      function getItem$1(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [key2], function(t2, results) {
                var result = results.rows.length ? results.rows.item(0).value : null;
                if (result) {
                  result = dbInfo.serializer.deserialize(result);
                }
                resolve(result);
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function iterate$1(iterator, callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName, [], function(t2, results) {
                var rows = results.rows;
                var length2 = rows.length;
                for (var i = 0;i < length2; i++) {
                  var item = rows.item(i);
                  var result = item.value;
                  if (result) {
                    result = dbInfo.serializer.deserialize(result);
                  }
                  result = iterator(result, item.key, i + 1);
                  if (result !== undefined) {
                    resolve(result);
                    return;
                  }
                }
                resolve();
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function _setItem(key2, value, callback, retriesLeft) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            if (value === undefined) {
              value = null;
            }
            var originalValue = value;
            var dbInfo = self2._dbInfo;
            dbInfo.serializer.serialize(value, function(value2, error) {
              if (error) {
                reject(error);
              } else {
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "INSERT OR REPLACE INTO " + dbInfo.storeName + " (key, value) VALUES (?, ?)", [key2, value2], function() {
                    resolve(originalValue);
                  }, function(t2, error2) {
                    reject(error2);
                  });
                }, function(sqlError) {
                  if (sqlError.code === sqlError.QUOTA_ERR) {
                    if (retriesLeft > 0) {
                      resolve(_setItem.apply(self2, [key2, originalValue, callback, retriesLeft - 1]));
                      return;
                    }
                    reject(sqlError);
                  }
                });
              }
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function setItem$1(key2, value, callback) {
        return _setItem.apply(this, [key2, value, callback, 1]);
      }
      function removeItem$1(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [key2], function() {
                resolve();
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function clear$1(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName, [], function() {
                resolve();
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function length$1(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t2, results) {
                var result = results.rows.item(0).c;
                resolve(result);
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function key$1(n, callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [n + 1], function(t2, results) {
                var result = results.rows.length ? results.rows.item(0).key : null;
                resolve(result);
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function keys$1(callback) {
        var self2 = this;
        var promise = new Promise$1(function(resolve, reject) {
          self2.ready().then(function() {
            var dbInfo = self2._dbInfo;
            dbInfo.db.transaction(function(t) {
              tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName, [], function(t2, results) {
                var keys2 = [];
                for (var i = 0;i < results.rows.length; i++) {
                  keys2.push(results.rows.item(i).key);
                }
                resolve(keys2);
              }, function(t2, error) {
                reject(error);
              });
            });
          })["catch"](reject);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function getAllStoreNames(db) {
        return new Promise$1(function(resolve, reject) {
          db.transaction(function(t) {
            t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(t2, results) {
              var storeNames = [];
              for (var i = 0;i < results.rows.length; i++) {
                storeNames.push(results.rows.item(i).name);
              }
              resolve({
                db,
                storeNames
              });
            }, function(t2, error) {
              reject(error);
            });
          }, function(sqlError) {
            reject(sqlError);
          });
        });
      }
      function dropInstance$1(options, callback) {
        callback = getCallback.apply(this, arguments);
        var currentConfig = this.config();
        options = typeof options !== "function" && options || {};
        if (!options.name) {
          options.name = options.name || currentConfig.name;
          options.storeName = options.storeName || currentConfig.storeName;
        }
        var self2 = this;
        var promise;
        if (!options.name) {
          promise = Promise$1.reject("Invalid arguments");
        } else {
          promise = new Promise$1(function(resolve) {
            var db;
            if (options.name === currentConfig.name) {
              db = self2._dbInfo.db;
            } else {
              db = openDatabase(options.name, "", "", 0);
            }
            if (!options.storeName) {
              resolve(getAllStoreNames(db));
            } else {
              resolve({
                db,
                storeNames: [options.storeName]
              });
            }
          }).then(function(operationInfo) {
            return new Promise$1(function(resolve, reject) {
              operationInfo.db.transaction(function(t) {
                function dropTable(storeName) {
                  return new Promise$1(function(resolve2, reject2) {
                    t.executeSql("DROP TABLE IF EXISTS " + storeName, [], function() {
                      resolve2();
                    }, function(t2, error) {
                      reject2(error);
                    });
                  });
                }
                var operations = [];
                for (var i = 0, len = operationInfo.storeNames.length;i < len; i++) {
                  operations.push(dropTable(operationInfo.storeNames[i]));
                }
                Promise$1.all(operations).then(function() {
                  resolve();
                })["catch"](function(e) {
                  reject(e);
                });
              }, function(sqlError) {
                reject(sqlError);
              });
            });
          });
        }
        executeCallback(promise, callback);
        return promise;
      }
      var webSQLStorage = {
        _driver: "webSQLStorage",
        _initStorage: _initStorage$1,
        _support: isWebSQLValid(),
        iterate: iterate$1,
        getItem: getItem$1,
        setItem: setItem$1,
        removeItem: removeItem$1,
        clear: clear$1,
        length: length$1,
        key: key$1,
        keys: keys$1,
        dropInstance: dropInstance$1
      };
      function isLocalStorageValid() {
        try {
          return typeof localStorage !== "undefined" && ("setItem" in localStorage) && !!localStorage.setItem;
        } catch (e) {
          return false;
        }
      }
      function _getKeyPrefix(options, defaultConfig) {
        var keyPrefix = options.name + "/";
        if (options.storeName !== defaultConfig.storeName) {
          keyPrefix += options.storeName + "/";
        }
        return keyPrefix;
      }
      function checkIfLocalStorageThrows() {
        var localStorageTestKey = "_localforage_support_test";
        try {
          localStorage.setItem(localStorageTestKey, true);
          localStorage.removeItem(localStorageTestKey);
          return false;
        } catch (e) {
          return true;
        }
      }
      function _isLocalStorageUsable() {
        return !checkIfLocalStorageThrows() || localStorage.length > 0;
      }
      function _initStorage$2(options) {
        var self2 = this;
        var dbInfo = {};
        if (options) {
          for (var i in options) {
            dbInfo[i] = options[i];
          }
        }
        dbInfo.keyPrefix = _getKeyPrefix(options, self2._defaultConfig);
        if (!_isLocalStorageUsable()) {
          return Promise$1.reject();
        }
        self2._dbInfo = dbInfo;
        dbInfo.serializer = localforageSerializer;
        return Promise$1.resolve();
      }
      function clear$2(callback) {
        var self2 = this;
        var promise = self2.ready().then(function() {
          var keyPrefix = self2._dbInfo.keyPrefix;
          for (var i = localStorage.length - 1;i >= 0; i--) {
            var key2 = localStorage.key(i);
            if (key2.indexOf(keyPrefix) === 0) {
              localStorage.removeItem(key2);
            }
          }
        });
        executeCallback(promise, callback);
        return promise;
      }
      function getItem$2(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = self2.ready().then(function() {
          var dbInfo = self2._dbInfo;
          var result = localStorage.getItem(dbInfo.keyPrefix + key2);
          if (result) {
            result = dbInfo.serializer.deserialize(result);
          }
          return result;
        });
        executeCallback(promise, callback);
        return promise;
      }
      function iterate$2(iterator, callback) {
        var self2 = this;
        var promise = self2.ready().then(function() {
          var dbInfo = self2._dbInfo;
          var keyPrefix = dbInfo.keyPrefix;
          var keyPrefixLength = keyPrefix.length;
          var length2 = localStorage.length;
          var iterationNumber = 1;
          for (var i = 0;i < length2; i++) {
            var key2 = localStorage.key(i);
            if (key2.indexOf(keyPrefix) !== 0) {
              continue;
            }
            var value = localStorage.getItem(key2);
            if (value) {
              value = dbInfo.serializer.deserialize(value);
            }
            value = iterator(value, key2.substring(keyPrefixLength), iterationNumber++);
            if (value !== undefined) {
              return value;
            }
          }
        });
        executeCallback(promise, callback);
        return promise;
      }
      function key$2(n, callback) {
        var self2 = this;
        var promise = self2.ready().then(function() {
          var dbInfo = self2._dbInfo;
          var result;
          try {
            result = localStorage.key(n);
          } catch (error) {
            result = null;
          }
          if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
          }
          return result;
        });
        executeCallback(promise, callback);
        return promise;
      }
      function keys$2(callback) {
        var self2 = this;
        var promise = self2.ready().then(function() {
          var dbInfo = self2._dbInfo;
          var length2 = localStorage.length;
          var keys2 = [];
          for (var i = 0;i < length2; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
              keys2.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
          }
          return keys2;
        });
        executeCallback(promise, callback);
        return promise;
      }
      function length$2(callback) {
        var self2 = this;
        var promise = self2.keys().then(function(keys2) {
          return keys2.length;
        });
        executeCallback(promise, callback);
        return promise;
      }
      function removeItem$2(key2, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = self2.ready().then(function() {
          var dbInfo = self2._dbInfo;
          localStorage.removeItem(dbInfo.keyPrefix + key2);
        });
        executeCallback(promise, callback);
        return promise;
      }
      function setItem$2(key2, value, callback) {
        var self2 = this;
        key2 = normalizeKey(key2);
        var promise = self2.ready().then(function() {
          if (value === undefined) {
            value = null;
          }
          var originalValue = value;
          return new Promise$1(function(resolve, reject) {
            var dbInfo = self2._dbInfo;
            dbInfo.serializer.serialize(value, function(value2, error) {
              if (error) {
                reject(error);
              } else {
                try {
                  localStorage.setItem(dbInfo.keyPrefix + key2, value2);
                  resolve(originalValue);
                } catch (e) {
                  if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                    reject(e);
                  }
                  reject(e);
                }
              }
            });
          });
        });
        executeCallback(promise, callback);
        return promise;
      }
      function dropInstance$2(options, callback) {
        callback = getCallback.apply(this, arguments);
        options = typeof options !== "function" && options || {};
        if (!options.name) {
          var currentConfig = this.config();
          options.name = options.name || currentConfig.name;
          options.storeName = options.storeName || currentConfig.storeName;
        }
        var self2 = this;
        var promise;
        if (!options.name) {
          promise = Promise$1.reject("Invalid arguments");
        } else {
          promise = new Promise$1(function(resolve) {
            if (!options.storeName) {
              resolve(options.name + "/");
            } else {
              resolve(_getKeyPrefix(options, self2._defaultConfig));
            }
          }).then(function(keyPrefix) {
            for (var i = localStorage.length - 1;i >= 0; i--) {
              var key2 = localStorage.key(i);
              if (key2.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key2);
              }
            }
          });
        }
        executeCallback(promise, callback);
        return promise;
      }
      var localStorageWrapper = {
        _driver: "localStorageWrapper",
        _initStorage: _initStorage$2,
        _support: isLocalStorageValid(),
        iterate: iterate$2,
        getItem: getItem$2,
        setItem: setItem$2,
        removeItem: removeItem$2,
        clear: clear$2,
        length: length$2,
        key: key$2,
        keys: keys$2,
        dropInstance: dropInstance$2
      };
      var sameValue = function sameValue(x, y) {
        return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y);
      };
      var includes = function includes(array, searchElement) {
        var len = array.length;
        var i = 0;
        while (i < len) {
          if (sameValue(array[i], searchElement)) {
            return true;
          }
          i++;
        }
        return false;
      };
      var isArray = Array.isArray || function(arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
      };
      var DefinedDrivers = {};
      var DriverSupport = {};
      var DefaultDrivers = {
        INDEXEDDB: asyncStorage,
        WEBSQL: webSQLStorage,
        LOCALSTORAGE: localStorageWrapper
      };
      var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
      var OptionalDriverMethods = ["dropInstance"];
      var LibraryMethods = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(OptionalDriverMethods);
      var DefaultConfig = {
        description: "",
        driver: DefaultDriverOrder.slice(),
        name: "localforage",
        size: 4980736,
        storeName: "keyvaluepairs",
        version: 1
      };
      function callWhenReady(localForageInstance, libraryMethod) {
        localForageInstance[libraryMethod] = function() {
          var _args = arguments;
          return localForageInstance.ready().then(function() {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
          });
        };
      }
      function extend() {
        for (var i = 1;i < arguments.length; i++) {
          var arg = arguments[i];
          if (arg) {
            for (var _key in arg) {
              if (arg.hasOwnProperty(_key)) {
                if (isArray(arg[_key])) {
                  arguments[0][_key] = arg[_key].slice();
                } else {
                  arguments[0][_key] = arg[_key];
                }
              }
            }
          }
        }
        return arguments[0];
      }
      var LocalForage = function() {
        function LocalForage2(options) {
          _classCallCheck(this, LocalForage2);
          for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
              var driver = DefaultDrivers[driverTypeKey];
              var driverName = driver._driver;
              this[driverTypeKey] = driverName;
              if (!DefinedDrivers[driverName]) {
                this.defineDriver(driver);
              }
            }
          }
          this._defaultConfig = extend({}, DefaultConfig);
          this._config = extend({}, this._defaultConfig, options);
          this._driverSet = null;
          this._initDriver = null;
          this._ready = false;
          this._dbInfo = null;
          this._wrapLibraryMethodsWithReady();
          this.setDriver(this._config.driver)["catch"](function() {
          });
        }
        LocalForage2.prototype.config = function config(options) {
          if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
            if (this._ready) {
              return new Error("Can't call config() after localforage has been used.");
            }
            for (var i in options) {
              if (i === "storeName") {
                options[i] = options[i].replace(/\W/g, "_");
              }
              if (i === "version" && typeof options[i] !== "number") {
                return new Error("Database version must be a number.");
              }
              this._config[i] = options[i];
            }
            if (("driver" in options) && options.driver) {
              return this.setDriver(this._config.driver);
            }
            return true;
          } else if (typeof options === "string") {
            return this._config[options];
          } else {
            return this._config;
          }
        };
        LocalForage2.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
          var promise = new Promise$1(function(resolve, reject) {
            try {
              var driverName = driverObject._driver;
              var complianceError = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
              if (!driverObject._driver) {
                reject(complianceError);
                return;
              }
              var driverMethods = LibraryMethods.concat("_initStorage");
              for (var i = 0, len = driverMethods.length;i < len; i++) {
                var driverMethodName = driverMethods[i];
                var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== "function") {
                  reject(complianceError);
                  return;
                }
              }
              var configureMissingMethods = function configureMissingMethods() {
                var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                  return function() {
                    var error = new Error("Method " + methodName + " is not implemented by the current driver");
                    var promise2 = Promise$1.reject(error);
                    executeCallback(promise2, arguments[arguments.length - 1]);
                    return promise2;
                  };
                };
                for (var _i = 0, _len = OptionalDriverMethods.length;_i < _len; _i++) {
                  var optionalDriverMethod = OptionalDriverMethods[_i];
                  if (!driverObject[optionalDriverMethod]) {
                    driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                  }
                }
              };
              configureMissingMethods();
              var setDriverSupport = function setDriverSupport(support) {
                if (DefinedDrivers[driverName]) {
                  console.info("Redefining LocalForage driver: " + driverName);
                }
                DefinedDrivers[driverName] = driverObject;
                DriverSupport[driverName] = support;
                resolve();
              };
              if ("_support" in driverObject) {
                if (driverObject._support && typeof driverObject._support === "function") {
                  driverObject._support().then(setDriverSupport, reject);
                } else {
                  setDriverSupport(!!driverObject._support);
                }
              } else {
                setDriverSupport(true);
              }
            } catch (e) {
              reject(e);
            }
          });
          executeTwoCallbacks(promise, callback, errorCallback);
          return promise;
        };
        LocalForage2.prototype.driver = function driver() {
          return this._driver || null;
        };
        LocalForage2.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
          var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error("Driver not found."));
          executeTwoCallbacks(getDriverPromise, callback, errorCallback);
          return getDriverPromise;
        };
        LocalForage2.prototype.getSerializer = function getSerializer(callback) {
          var serializerPromise = Promise$1.resolve(localforageSerializer);
          executeTwoCallbacks(serializerPromise, callback);
          return serializerPromise;
        };
        LocalForage2.prototype.ready = function ready(callback) {
          var self2 = this;
          var promise = self2._driverSet.then(function() {
            if (self2._ready === null) {
              self2._ready = self2._initDriver();
            }
            return self2._ready;
          });
          executeTwoCallbacks(promise, callback, callback);
          return promise;
        };
        LocalForage2.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
          var self2 = this;
          if (!isArray(drivers)) {
            drivers = [drivers];
          }
          var supportedDrivers = this._getSupportedDrivers(drivers);
          function setDriverToConfig() {
            self2._config.driver = self2.driver();
          }
          function extendSelfWithDriver(driver) {
            self2._extend(driver);
            setDriverToConfig();
            self2._ready = self2._initStorage(self2._config);
            return self2._ready;
          }
          function initDriver(supportedDrivers2) {
            return function() {
              var currentDriverIndex = 0;
              function driverPromiseLoop() {
                while (currentDriverIndex < supportedDrivers2.length) {
                  var driverName = supportedDrivers2[currentDriverIndex];
                  currentDriverIndex++;
                  self2._dbInfo = null;
                  self2._ready = null;
                  return self2.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                }
                setDriverToConfig();
                var error = new Error("No available storage method found.");
                self2._driverSet = Promise$1.reject(error);
                return self2._driverSet;
              }
              return driverPromiseLoop();
            };
          }
          var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
            return Promise$1.resolve();
          }) : Promise$1.resolve();
          this._driverSet = oldDriverSetDone.then(function() {
            var driverName = supportedDrivers[0];
            self2._dbInfo = null;
            self2._ready = null;
            return self2.getDriver(driverName).then(function(driver) {
              self2._driver = driver._driver;
              setDriverToConfig();
              self2._wrapLibraryMethodsWithReady();
              self2._initDriver = initDriver(supportedDrivers);
            });
          })["catch"](function() {
            setDriverToConfig();
            var error = new Error("No available storage method found.");
            self2._driverSet = Promise$1.reject(error);
            return self2._driverSet;
          });
          executeTwoCallbacks(this._driverSet, callback, errorCallback);
          return this._driverSet;
        };
        LocalForage2.prototype.supports = function supports(driverName) {
          return !!DriverSupport[driverName];
        };
        LocalForage2.prototype._extend = function _extend(libraryMethodsAndProperties) {
          extend(this, libraryMethodsAndProperties);
        };
        LocalForage2.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
          var supportedDrivers = [];
          for (var i = 0, len = drivers.length;i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
              supportedDrivers.push(driverName);
            }
          }
          return supportedDrivers;
        };
        LocalForage2.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
          for (var i = 0, len = LibraryMethods.length;i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
          }
        };
        LocalForage2.prototype.createInstance = function createInstance(options) {
          return new LocalForage2(options);
        };
        return LocalForage2;
      }();
      var localforage_js = new LocalForage;
      module3.exports = localforage_js;
    }, { "3": 3 }] }, {}, [4])(4);
  });
});

// node_modules/fuzzysort/fuzzysort.js
var require_fuzzysort = __commonJS((exports, module) => {
  ((root, UMD) => {
    if (typeof define === "function" && define.amd)
      define([], UMD);
    else if (typeof module === "object" && exports)
      module.exports = UMD();
    else
      root["fuzzysort"] = UMD();
  })(exports, (_) => {
    var single = (search, target) => {
      if (search == "farzher")
        return { target: "farzher was here (^-^*)/", score: 0, _indexes: [0] };
      if (!search || !target)
        return NULL;
      var preparedSearch = getPreparedSearch(search);
      if (!isObj(target))
        target = getPrepared(target);
      var searchBitflags = preparedSearch.bitflags;
      if ((searchBitflags & target._bitflags) !== searchBitflags)
        return NULL;
      return algorithm(preparedSearch, target);
    };
    var go = (search, targets, options) => {
      if (search == "farzher")
        return [{ target: "farzher was here (^-^*)/", score: 0, _indexes: [0], obj: targets ? targets[0] : NULL }];
      if (!search)
        return options && options.all ? all(search, targets, options) : noResults;
      var preparedSearch = getPreparedSearch(search);
      var searchBitflags = preparedSearch.bitflags;
      var containsSpace = preparedSearch.containsSpace;
      var threshold = options && options.threshold || INT_MIN;
      var limit2 = options && options["limit"] || INT_MAX;
      var resultsLen = 0;
      var limitedCount = 0;
      var targetsLen = targets.length;
      if (options && options.key) {
        var key = options.key;
        for (var i = 0;i < targetsLen; ++i) {
          var obj = targets[i];
          var target = getValue(obj, key);
          if (!target)
            continue;
          if (!isObj(target))
            target = getPrepared(target);
          if ((searchBitflags & target._bitflags) !== searchBitflags)
            continue;
          var result = algorithm(preparedSearch, target);
          if (result === NULL)
            continue;
          if (result.score < threshold)
            continue;
          result = { target: result.target, _targetLower: "", _targetLowerCodes: NULL, _nextBeginningIndexes: NULL, _bitflags: 0, score: result.score, _indexes: result._indexes, obj };
          if (resultsLen < limit2) {
            q.add(result);
            ++resultsLen;
          } else {
            ++limitedCount;
            if (result.score > q.peek().score)
              q.replaceTop(result);
          }
        }
      } else if (options && options.keys) {
        var scoreFn = options["scoreFn"] || defaultScoreFn;
        var keys = options.keys;
        var keysLen = keys.length;
        for (var i = 0;i < targetsLen; ++i) {
          var obj = targets[i];
          var objResults = new Array(keysLen);
          for (var keyI = 0;keyI < keysLen; ++keyI) {
            var key = keys[keyI];
            var target = getValue(obj, key);
            if (!target) {
              objResults[keyI] = NULL;
              continue;
            }
            if (!isObj(target))
              target = getPrepared(target);
            if ((searchBitflags & target._bitflags) !== searchBitflags)
              objResults[keyI] = NULL;
            else
              objResults[keyI] = algorithm(preparedSearch, target);
          }
          objResults.obj = obj;
          var score = scoreFn(objResults);
          if (score === NULL)
            continue;
          if (score < threshold)
            continue;
          objResults.score = score;
          if (resultsLen < limit2) {
            q.add(objResults);
            ++resultsLen;
          } else {
            ++limitedCount;
            if (score > q.peek().score)
              q.replaceTop(objResults);
          }
        }
      } else {
        for (var i = 0;i < targetsLen; ++i) {
          var target = targets[i];
          if (!target)
            continue;
          if (!isObj(target))
            target = getPrepared(target);
          if ((searchBitflags & target._bitflags) !== searchBitflags)
            continue;
          var result = algorithm(preparedSearch, target);
          if (result === NULL)
            continue;
          if (result.score < threshold)
            continue;
          if (resultsLen < limit2) {
            q.add(result);
            ++resultsLen;
          } else {
            ++limitedCount;
            if (result.score > q.peek().score)
              q.replaceTop(result);
          }
        }
      }
      if (resultsLen === 0)
        return noResults;
      var results = new Array(resultsLen);
      for (var i = resultsLen - 1;i >= 0; --i)
        results[i] = q.poll();
      results.total = resultsLen + limitedCount;
      return results;
    };
    var highlight = (result, hOpen, hClose) => {
      if (typeof hOpen === "function")
        return highlightCallback(result, hOpen);
      if (result === NULL)
        return NULL;
      if (hOpen === undefined)
        hOpen = "<b>";
      if (hClose === undefined)
        hClose = "</b>";
      var highlighted = "";
      var matchesIndex = 0;
      var opened = false;
      var target = result.target;
      var targetLen = target.length;
      var indexes2 = result._indexes;
      indexes2 = indexes2.slice(0, indexes2.len).sort((a, b) => a - b);
      for (var i = 0;i < targetLen; ++i) {
        var char = target[i];
        if (indexes2[matchesIndex] === i) {
          ++matchesIndex;
          if (!opened) {
            opened = true;
            highlighted += hOpen;
          }
          if (matchesIndex === indexes2.length) {
            highlighted += char + hClose + target.substr(i + 1);
            break;
          }
        } else {
          if (opened) {
            opened = false;
            highlighted += hClose;
          }
        }
        highlighted += char;
      }
      return highlighted;
    };
    var highlightCallback = (result, cb) => {
      if (result === NULL)
        return NULL;
      var target = result.target;
      var targetLen = target.length;
      var indexes2 = result._indexes;
      indexes2 = indexes2.slice(0, indexes2.len).sort((a, b) => a - b);
      var highlighted = "";
      var matchI = 0;
      var indexesI = 0;
      var opened = false;
      var result = [];
      for (var i = 0;i < targetLen; ++i) {
        var char = target[i];
        if (indexes2[indexesI] === i) {
          ++indexesI;
          if (!opened) {
            opened = true;
            result.push(highlighted);
            highlighted = "";
          }
          if (indexesI === indexes2.length) {
            highlighted += char;
            result.push(cb(highlighted, matchI++));
            highlighted = "";
            result.push(target.substr(i + 1));
            break;
          }
        } else {
          if (opened) {
            opened = false;
            result.push(cb(highlighted, matchI++));
            highlighted = "";
          }
        }
        highlighted += char;
      }
      return result;
    };
    var indexes = (result) => result._indexes.slice(0, result._indexes.len).sort((a, b) => a - b);
    var prepare = (target) => {
      if (typeof target !== "string")
        target = "";
      var info = prepareLowerInfo(target);
      return { target, _targetLower: info._lower, _targetLowerCodes: info.lowerCodes, _nextBeginningIndexes: NULL, _bitflags: info.bitflags, score: NULL, _indexes: [0], obj: NULL };
    };
    var prepareSearch = (search) => {
      if (typeof search !== "string")
        search = "";
      search = search.trim();
      var info = prepareLowerInfo(search);
      var spaceSearches = [];
      if (info.containsSpace) {
        var searches = search.split(/\s+/);
        searches = [...new Set(searches)];
        for (var i = 0;i < searches.length; i++) {
          if (searches[i] === "")
            continue;
          var _info = prepareLowerInfo(searches[i]);
          spaceSearches.push({ lowerCodes: _info.lowerCodes, _lower: searches[i].toLowerCase(), containsSpace: false });
        }
      }
      return { lowerCodes: info.lowerCodes, bitflags: info.bitflags, containsSpace: info.containsSpace, _lower: info._lower, spaceSearches };
    };
    var getPrepared = (target) => {
      if (target.length > 999)
        return prepare(target);
      var targetPrepared = preparedCache.get(target);
      if (targetPrepared !== undefined)
        return targetPrepared;
      targetPrepared = prepare(target);
      preparedCache.set(target, targetPrepared);
      return targetPrepared;
    };
    var getPreparedSearch = (search) => {
      if (search.length > 999)
        return prepareSearch(search);
      var searchPrepared = preparedSearchCache.get(search);
      if (searchPrepared !== undefined)
        return searchPrepared;
      searchPrepared = prepareSearch(search);
      preparedSearchCache.set(search, searchPrepared);
      return searchPrepared;
    };
    var all = (search, targets, options) => {
      var results = [];
      results.total = targets.length;
      var limit2 = options && options.limit || INT_MAX;
      if (options && options.key) {
        for (var i = 0;i < targets.length; i++) {
          var obj = targets[i];
          var target = getValue(obj, options.key);
          if (!target)
            continue;
          if (!isObj(target))
            target = getPrepared(target);
          target.score = INT_MIN;
          target._indexes.len = 0;
          var result = target;
          result = { target: result.target, _targetLower: "", _targetLowerCodes: NULL, _nextBeginningIndexes: NULL, _bitflags: 0, score: target.score, _indexes: NULL, obj };
          results.push(result);
          if (results.length >= limit2)
            return results;
        }
      } else if (options && options.keys) {
        for (var i = 0;i < targets.length; i++) {
          var obj = targets[i];
          var objResults = new Array(options.keys.length);
          for (var keyI = options.keys.length - 1;keyI >= 0; --keyI) {
            var target = getValue(obj, options.keys[keyI]);
            if (!target) {
              objResults[keyI] = NULL;
              continue;
            }
            if (!isObj(target))
              target = getPrepared(target);
            target.score = INT_MIN;
            target._indexes.len = 0;
            objResults[keyI] = target;
          }
          objResults.obj = obj;
          objResults.score = INT_MIN;
          results.push(objResults);
          if (results.length >= limit2)
            return results;
        }
      } else {
        for (var i = 0;i < targets.length; i++) {
          var target = targets[i];
          if (!target)
            continue;
          if (!isObj(target))
            target = getPrepared(target);
          target.score = INT_MIN;
          target._indexes.len = 0;
          results.push(target);
          if (results.length >= limit2)
            return results;
        }
      }
      return results;
    };
    var algorithm = (preparedSearch, prepared, allowSpaces = false) => {
      if (allowSpaces === false && preparedSearch.containsSpace)
        return algorithmSpaces(preparedSearch, prepared);
      var searchLower = preparedSearch._lower;
      var searchLowerCodes = preparedSearch.lowerCodes;
      var searchLowerCode = searchLowerCodes[0];
      var targetLowerCodes = prepared._targetLowerCodes;
      var searchLen = searchLowerCodes.length;
      var targetLen = targetLowerCodes.length;
      var searchI = 0;
      var targetI = 0;
      var matchesSimpleLen = 0;
      for (;; ) {
        var isMatch = searchLowerCode === targetLowerCodes[targetI];
        if (isMatch) {
          matchesSimple[matchesSimpleLen++] = targetI;
          ++searchI;
          if (searchI === searchLen)
            break;
          searchLowerCode = searchLowerCodes[searchI];
        }
        ++targetI;
        if (targetI >= targetLen)
          return NULL;
      }
      var searchI = 0;
      var successStrict = false;
      var matchesStrictLen = 0;
      var nextBeginningIndexes = prepared._nextBeginningIndexes;
      if (nextBeginningIndexes === NULL)
        nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target);
      var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
      var backtrackCount = 0;
      if (targetI !== targetLen)
        for (;; ) {
          if (targetI >= targetLen) {
            if (searchI <= 0)
              break;
            ++backtrackCount;
            if (backtrackCount > 200)
              break;
            --searchI;
            var lastMatch = matchesStrict[--matchesStrictLen];
            targetI = nextBeginningIndexes[lastMatch];
          } else {
            var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
            if (isMatch) {
              matchesStrict[matchesStrictLen++] = targetI;
              ++searchI;
              if (searchI === searchLen) {
                successStrict = true;
                break;
              }
              ++targetI;
            } else {
              targetI = nextBeginningIndexes[targetI];
            }
          }
        }
      var substringIndex = prepared._targetLower.indexOf(searchLower, matchesSimple[0]);
      var isSubstring = ~substringIndex;
      if (isSubstring && !successStrict) {
        for (var i = 0;i < matchesSimpleLen; ++i)
          matchesSimple[i] = substringIndex + i;
      }
      var isSubstringBeginning = false;
      if (isSubstring) {
        isSubstringBeginning = prepared._nextBeginningIndexes[substringIndex - 1] === substringIndex;
      }
      {
        if (successStrict) {
          var matchesBest = matchesStrict;
          var matchesBestLen = matchesStrictLen;
        } else {
          var matchesBest = matchesSimple;
          var matchesBestLen = matchesSimpleLen;
        }
        var score = 0;
        var extraMatchGroupCount = 0;
        for (var i = 1;i < searchLen; ++i) {
          if (matchesBest[i] - matchesBest[i - 1] !== 1) {
            score -= matchesBest[i];
            ++extraMatchGroupCount;
          }
        }
        var unmatchedDistance = matchesBest[searchLen - 1] - matchesBest[0] - (searchLen - 1);
        score -= (12 + unmatchedDistance) * extraMatchGroupCount;
        if (matchesBest[0] !== 0)
          score -= matchesBest[0] * matchesBest[0] * 0.2;
        if (!successStrict) {
          score *= 1000;
        } else {
          var uniqueBeginningIndexes = 1;
          for (var i = nextBeginningIndexes[0];i < targetLen; i = nextBeginningIndexes[i])
            ++uniqueBeginningIndexes;
          if (uniqueBeginningIndexes > 24)
            score *= (uniqueBeginningIndexes - 24) * 10;
        }
        if (isSubstring)
          score /= 1 + searchLen * searchLen * 1;
        if (isSubstringBeginning)
          score /= 1 + searchLen * searchLen * 1;
        score -= targetLen - searchLen;
        prepared.score = score;
        for (var i = 0;i < matchesBestLen; ++i)
          prepared._indexes[i] = matchesBest[i];
        prepared._indexes.len = matchesBestLen;
        return prepared;
      }
    };
    var algorithmSpaces = (preparedSearch, target) => {
      var seen_indexes = new Set;
      var score = 0;
      var result = NULL;
      var first_seen_index_last_search = 0;
      var searches = preparedSearch.spaceSearches;
      for (var i = 0;i < searches.length; ++i) {
        var search = searches[i];
        result = algorithm(search, target);
        if (result === NULL)
          return NULL;
        score += result.score;
        if (result._indexes[0] < first_seen_index_last_search) {
          score -= first_seen_index_last_search - result._indexes[0];
        }
        first_seen_index_last_search = result._indexes[0];
        for (var j = 0;j < result._indexes.len; ++j)
          seen_indexes.add(result._indexes[j]);
      }
      var allowSpacesResult = algorithm(preparedSearch, target, true);
      if (allowSpacesResult !== NULL && allowSpacesResult.score > score) {
        return allowSpacesResult;
      }
      result.score = score;
      var i = 0;
      for (let index of seen_indexes)
        result._indexes[i++] = index;
      result._indexes.len = i;
      return result;
    };
    var prepareLowerInfo = (str) => {
      var strLen = str.length;
      var lower = str.toLowerCase();
      var lowerCodes = [];
      var bitflags = 0;
      var containsSpace = false;
      for (var i = 0;i < strLen; ++i) {
        var lowerCode = lowerCodes[i] = lower.charCodeAt(i);
        if (lowerCode === 32) {
          containsSpace = true;
          continue;
        }
        var bit = lowerCode >= 97 && lowerCode <= 122 ? lowerCode - 97 : lowerCode >= 48 && lowerCode <= 57 ? 26 : lowerCode <= 127 ? 30 : 31;
        bitflags |= 1 << bit;
      }
      return { lowerCodes, bitflags, containsSpace, _lower: lower };
    };
    var prepareBeginningIndexes = (target) => {
      var targetLen = target.length;
      var beginningIndexes = [];
      var beginningIndexesLen = 0;
      var wasUpper = false;
      var wasAlphanum = false;
      for (var i = 0;i < targetLen; ++i) {
        var targetCode = target.charCodeAt(i);
        var isUpper = targetCode >= 65 && targetCode <= 90;
        var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
        var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
        wasUpper = isUpper;
        wasAlphanum = isAlphanum;
        if (isBeginning)
          beginningIndexes[beginningIndexesLen++] = i;
      }
      return beginningIndexes;
    };
    var prepareNextBeginningIndexes = (target) => {
      var targetLen = target.length;
      var beginningIndexes = prepareBeginningIndexes(target);
      var nextBeginningIndexes = [];
      var lastIsBeginning = beginningIndexes[0];
      var lastIsBeginningI = 0;
      for (var i = 0;i < targetLen; ++i) {
        if (lastIsBeginning > i) {
          nextBeginningIndexes[i] = lastIsBeginning;
        } else {
          lastIsBeginning = beginningIndexes[++lastIsBeginningI];
          nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;
        }
      }
      return nextBeginningIndexes;
    };
    var cleanup = () => {
      preparedCache.clear();
      preparedSearchCache.clear();
      matchesSimple = [];
      matchesStrict = [];
    };
    var preparedCache = new Map;
    var preparedSearchCache = new Map;
    var matchesSimple = [];
    var matchesStrict = [];
    var defaultScoreFn = (a) => {
      var max = INT_MIN;
      var len = a.length;
      for (var i = 0;i < len; ++i) {
        var result = a[i];
        if (result === NULL)
          continue;
        var score = result.score;
        if (score > max)
          max = score;
      }
      if (max === INT_MIN)
        return NULL;
      return max;
    };
    var getValue = (obj, prop) => {
      var tmp = obj[prop];
      if (tmp !== undefined)
        return tmp;
      var segs = prop;
      if (!Array.isArray(prop))
        segs = prop.split(".");
      var len = segs.length;
      var i = -1;
      while (obj && ++i < len)
        obj = obj[segs[i]];
      return obj;
    };
    var isObj = (x) => {
      return typeof x === "object";
    };
    var INT_MAX = Infinity;
    var INT_MIN = -INT_MAX;
    var noResults = [];
    noResults.total = 0;
    var NULL = null;
    var fastpriorityqueue = (r) => {
      var e = [], o = 0, a = {}, v = (r2) => {
        for (var a2 = 0, v2 = e[a2], c = 1;c < o; ) {
          var s = c + 1;
          a2 = c, s < o && e[s].score < e[c].score && (a2 = s), e[a2 - 1 >> 1] = e[a2], c = 1 + (a2 << 1);
        }
        for (var f = a2 - 1 >> 1;a2 > 0 && v2.score < e[f].score; f = (a2 = f) - 1 >> 1)
          e[a2] = e[f];
        e[a2] = v2;
      };
      return a.add = (r2) => {
        var a2 = o;
        e[o++] = r2;
        for (var v2 = a2 - 1 >> 1;a2 > 0 && r2.score < e[v2].score; v2 = (a2 = v2) - 1 >> 1)
          e[a2] = e[v2];
        e[a2] = r2;
      }, a.poll = (r2) => {
        if (o !== 0) {
          var a2 = e[0];
          return e[0] = e[--o], v(), a2;
        }
      }, a.peek = (r2) => {
        if (o !== 0)
          return e[0];
      }, a.replaceTop = (r2) => {
        e[0] = r2, v();
      }, a;
    };
    var q = fastpriorityqueue();
    return { single, go, highlight, prepare, indexes, cleanup };
  });
});

// node_modules/sdp/sdp.js
var require_sdp = __commonJS((exports, module) => {
  var SDPUtils = {};
  SDPUtils.generateIdentifier = function() {
    return Math.random().toString(36).substring(2, 12);
  };
  SDPUtils.localCName = SDPUtils.generateIdentifier();
  SDPUtils.splitLines = function(blob) {
    return blob.trim().split("\n").map((line) => line.trim());
  };
  SDPUtils.splitSections = function(blob) {
    const parts = blob.split("\nm=");
    return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
  };
  SDPUtils.getDescription = function(blob) {
    const sections = SDPUtils.splitSections(blob);
    return sections && sections[0];
  };
  SDPUtils.getMediaSections = function(blob) {
    const sections = SDPUtils.splitSections(blob);
    sections.shift();
    return sections;
  };
  SDPUtils.matchPrefix = function(blob, prefix) {
    return SDPUtils.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
  };
  SDPUtils.parseCandidate = function(line) {
    let parts;
    if (line.indexOf("a=candidate:") === 0) {
      parts = line.substring(12).split(" ");
    } else {
      parts = line.substring(10).split(" ");
    }
    const candidate = {
      foundation: parts[0],
      component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
      protocol: parts[2].toLowerCase(),
      priority: parseInt(parts[3], 10),
      ip: parts[4],
      address: parts[4],
      port: parseInt(parts[5], 10),
      type: parts[7]
    };
    for (let i = 8;i < parts.length; i += 2) {
      switch (parts[i]) {
        case "raddr":
          candidate.relatedAddress = parts[i + 1];
          break;
        case "rport":
          candidate.relatedPort = parseInt(parts[i + 1], 10);
          break;
        case "tcptype":
          candidate.tcpType = parts[i + 1];
          break;
        case "ufrag":
          candidate.ufrag = parts[i + 1];
          candidate.usernameFragment = parts[i + 1];
          break;
        default:
          if (candidate[parts[i]] === undefined) {
            candidate[parts[i]] = parts[i + 1];
          }
          break;
      }
    }
    return candidate;
  };
  SDPUtils.writeCandidate = function(candidate) {
    const sdp = [];
    sdp.push(candidate.foundation);
    const component = candidate.component;
    if (component === "rtp") {
      sdp.push(1);
    } else if (component === "rtcp") {
      sdp.push(2);
    } else {
      sdp.push(component);
    }
    sdp.push(candidate.protocol.toUpperCase());
    sdp.push(candidate.priority);
    sdp.push(candidate.address || candidate.ip);
    sdp.push(candidate.port);
    const type = candidate.type;
    sdp.push("typ");
    sdp.push(type);
    if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
      sdp.push("raddr");
      sdp.push(candidate.relatedAddress);
      sdp.push("rport");
      sdp.push(candidate.relatedPort);
    }
    if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
      sdp.push("tcptype");
      sdp.push(candidate.tcpType);
    }
    if (candidate.usernameFragment || candidate.ufrag) {
      sdp.push("ufrag");
      sdp.push(candidate.usernameFragment || candidate.ufrag);
    }
    return "candidate:" + sdp.join(" ");
  };
  SDPUtils.parseIceOptions = function(line) {
    return line.substring(14).split(" ");
  };
  SDPUtils.parseRtpMap = function(line) {
    let parts = line.substring(9).split(" ");
    const parsed = {
      payloadType: parseInt(parts.shift(), 10)
    };
    parts = parts[0].split("/");
    parsed.name = parts[0];
    parsed.clockRate = parseInt(parts[1], 10);
    parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
    parsed.numChannels = parsed.channels;
    return parsed;
  };
  SDPUtils.writeRtpMap = function(codec) {
    let pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    const channels = codec.channels || codec.numChannels || 1;
    return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
  };
  SDPUtils.parseExtmap = function(line) {
    const parts = line.substring(9).split(" ");
    return {
      id: parseInt(parts[0], 10),
      direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
      uri: parts[1],
      attributes: parts.slice(2).join(" ")
    };
  };
  SDPUtils.writeExtmap = function(headerExtension) {
    return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
  };
  SDPUtils.parseFmtp = function(line) {
    const parsed = {};
    let kv;
    const parts = line.substring(line.indexOf(" ") + 1).split(";");
    for (let j = 0;j < parts.length; j++) {
      kv = parts[j].trim().split("=");
      parsed[kv[0].trim()] = kv[1];
    }
    return parsed;
  };
  SDPUtils.writeFmtp = function(codec) {
    let line = "";
    let pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.parameters && Object.keys(codec.parameters).length) {
      const params = [];
      Object.keys(codec.parameters).forEach((param) => {
        if (codec.parameters[param] !== undefined) {
          params.push(param + "=" + codec.parameters[param]);
        } else {
          params.push(param);
        }
      });
      line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
    }
    return line;
  };
  SDPUtils.parseRtcpFb = function(line) {
    const parts = line.substring(line.indexOf(" ") + 1).split(" ");
    return {
      type: parts.shift(),
      parameter: parts.join(" ")
    };
  };
  SDPUtils.writeRtcpFb = function(codec) {
    let lines = "";
    let pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
      codec.rtcpFeedback.forEach((fb) => {
        lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
      });
    }
    return lines;
  };
  SDPUtils.parseSsrcMedia = function(line) {
    const sp = line.indexOf(" ");
    const parts = {
      ssrc: parseInt(line.substring(7, sp), 10)
    };
    const colon = line.indexOf(":", sp);
    if (colon > -1) {
      parts.attribute = line.substring(sp + 1, colon);
      parts.value = line.substring(colon + 1);
    } else {
      parts.attribute = line.substring(sp + 1);
    }
    return parts;
  };
  SDPUtils.parseSsrcGroup = function(line) {
    const parts = line.substring(13).split(" ");
    return {
      semantics: parts.shift(),
      ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
    };
  };
  SDPUtils.getMid = function(mediaSection) {
    const mid = SDPUtils.matchPrefix(mediaSection, "a=mid:")[0];
    if (mid) {
      return mid.substring(6);
    }
  };
  SDPUtils.parseFingerprint = function(line) {
    const parts = line.substring(14).split(" ");
    return {
      algorithm: parts[0].toLowerCase(),
      value: parts[1].toUpperCase()
    };
  };
  SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
    const lines = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=fingerprint:");
    return {
      role: "auto",
      fingerprints: lines.map(SDPUtils.parseFingerprint)
    };
  };
  SDPUtils.writeDtlsParameters = function(params, setupType) {
    let sdp = "a=setup:" + setupType + "\r\n";
    params.fingerprints.forEach((fp) => {
      sdp += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
    });
    return sdp;
  };
  SDPUtils.parseCryptoLine = function(line) {
    const parts = line.substring(9).split(" ");
    return {
      tag: parseInt(parts[0], 10),
      cryptoSuite: parts[1],
      keyParams: parts[2],
      sessionParams: parts.slice(3)
    };
  };
  SDPUtils.writeCryptoLine = function(parameters) {
    return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
  };
  SDPUtils.parseCryptoKeyParams = function(keyParams) {
    if (keyParams.indexOf("inline:") !== 0) {
      return null;
    }
    const parts = keyParams.substring(7).split("|");
    return {
      keyMethod: "inline",
      keySalt: parts[0],
      lifeTime: parts[1],
      mkiValue: parts[2] ? parts[2].split(":")[0] : undefined,
      mkiLength: parts[2] ? parts[2].split(":")[1] : undefined
    };
  };
  SDPUtils.writeCryptoKeyParams = function(keyParams) {
    return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
  };
  SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
    const lines = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=crypto:");
    return lines.map(SDPUtils.parseCryptoLine);
  };
  SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
    const ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=ice-ufrag:")[0];
    const pwd = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=ice-pwd:")[0];
    if (!(ufrag && pwd)) {
      return null;
    }
    return {
      usernameFragment: ufrag.substring(12),
      password: pwd.substring(10)
    };
  };
  SDPUtils.writeIceParameters = function(params) {
    let sdp = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
    if (params.iceLite) {
      sdp += "a=ice-lite\r\n";
    }
    return sdp;
  };
  SDPUtils.parseRtpParameters = function(mediaSection) {
    const description = {
      codecs: [],
      headerExtensions: [],
      fecMechanisms: [],
      rtcp: []
    };
    const lines = SDPUtils.splitLines(mediaSection);
    const mline = lines[0].split(" ");
    description.profile = mline[2];
    for (let i = 3;i < mline.length; i++) {
      const pt = mline[i];
      const rtpmapline = SDPUtils.matchPrefix(mediaSection, "a=rtpmap:" + pt + " ")[0];
      if (rtpmapline) {
        const codec = SDPUtils.parseRtpMap(rtpmapline);
        const fmtps = SDPUtils.matchPrefix(mediaSection, "a=fmtp:" + pt + " ");
        codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
        codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, "a=rtcp-fb:" + pt + " ").map(SDPUtils.parseRtcpFb);
        description.codecs.push(codec);
        switch (codec.name.toUpperCase()) {
          case "RED":
          case "ULPFEC":
            description.fecMechanisms.push(codec.name.toUpperCase());
            break;
          default:
            break;
        }
      }
    }
    SDPUtils.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
      description.headerExtensions.push(SDPUtils.parseExtmap(line));
    });
    const wildcardRtcpFb = SDPUtils.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils.parseRtcpFb);
    description.codecs.forEach((codec) => {
      wildcardRtcpFb.forEach((fb) => {
        const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
          return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
        });
        if (!duplicate) {
          codec.rtcpFeedback.push(fb);
        }
      });
    });
    return description;
  };
  SDPUtils.writeRtpDescription = function(kind, caps) {
    let sdp = "";
    sdp += "m=" + kind + " ";
    sdp += caps.codecs.length > 0 ? "9" : "0";
    sdp += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
    sdp += caps.codecs.map((codec) => {
      if (codec.preferredPayloadType !== undefined) {
        return codec.preferredPayloadType;
      }
      return codec.payloadType;
    }).join(" ") + "\r\n";
    sdp += "c=IN IP4 0.0.0.0\r\n";
    sdp += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
    caps.codecs.forEach((codec) => {
      sdp += SDPUtils.writeRtpMap(codec);
      sdp += SDPUtils.writeFmtp(codec);
      sdp += SDPUtils.writeRtcpFb(codec);
    });
    let maxptime = 0;
    caps.codecs.forEach((codec) => {
      if (codec.maxptime > maxptime) {
        maxptime = codec.maxptime;
      }
    });
    if (maxptime > 0) {
      sdp += "a=maxptime:" + maxptime + "\r\n";
    }
    if (caps.headerExtensions) {
      caps.headerExtensions.forEach((extension) => {
        sdp += SDPUtils.writeExtmap(extension);
      });
    }
    return sdp;
  };
  SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
    const encodingParameters = [];
    const description = SDPUtils.parseRtpParameters(mediaSection);
    const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
    const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
    const ssrcs = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
    const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
    let secondarySsrc;
    const flows = SDPUtils.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
      const parts = line.substring(17).split(" ");
      return parts.map((part) => parseInt(part, 10));
    });
    if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
      secondarySsrc = flows[0][1];
    }
    description.codecs.forEach((codec) => {
      if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
        let encParam = {
          ssrc: primarySsrc,
          codecPayloadType: parseInt(codec.parameters.apt, 10)
        };
        if (primarySsrc && secondarySsrc) {
          encParam.rtx = { ssrc: secondarySsrc };
        }
        encodingParameters.push(encParam);
        if (hasRed) {
          encParam = JSON.parse(JSON.stringify(encParam));
          encParam.fec = {
            ssrc: primarySsrc,
            mechanism: hasUlpfec ? "red+ulpfec" : "red"
          };
          encodingParameters.push(encParam);
        }
      }
    });
    if (encodingParameters.length === 0 && primarySsrc) {
      encodingParameters.push({
        ssrc: primarySsrc
      });
    }
    let bandwidth = SDPUtils.matchPrefix(mediaSection, "b=");
    if (bandwidth.length) {
      if (bandwidth[0].indexOf("b=TIAS:") === 0) {
        bandwidth = parseInt(bandwidth[0].substring(7), 10);
      } else if (bandwidth[0].indexOf("b=AS:") === 0) {
        bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
      } else {
        bandwidth = undefined;
      }
      encodingParameters.forEach((params) => {
        params.maxBitrate = bandwidth;
      });
    }
    return encodingParameters;
  };
  SDPUtils.parseRtcpParameters = function(mediaSection) {
    const rtcpParameters = {};
    const remoteSsrc = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
    if (remoteSsrc) {
      rtcpParameters.cname = remoteSsrc.value;
      rtcpParameters.ssrc = remoteSsrc.ssrc;
    }
    const rsize = SDPUtils.matchPrefix(mediaSection, "a=rtcp-rsize");
    rtcpParameters.reducedSize = rsize.length > 0;
    rtcpParameters.compound = rsize.length === 0;
    const mux = SDPUtils.matchPrefix(mediaSection, "a=rtcp-mux");
    rtcpParameters.mux = mux.length > 0;
    return rtcpParameters;
  };
  SDPUtils.writeRtcpParameters = function(rtcpParameters) {
    let sdp = "";
    if (rtcpParameters.reducedSize) {
      sdp += "a=rtcp-rsize\r\n";
    }
    if (rtcpParameters.mux) {
      sdp += "a=rtcp-mux\r\n";
    }
    if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
      sdp += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
    }
    return sdp;
  };
  SDPUtils.parseMsid = function(mediaSection) {
    let parts;
    const spec = SDPUtils.matchPrefix(mediaSection, "a=msid:");
    if (spec.length === 1) {
      parts = spec[0].substring(7).split(" ");
      return { stream: parts[0], track: parts[1] };
    }
    const planB = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
    if (planB.length > 0) {
      parts = planB[0].value.split(" ");
      return { stream: parts[0], track: parts[1] };
    }
  };
  SDPUtils.parseSctpDescription = function(mediaSection) {
    const mline = SDPUtils.parseMLine(mediaSection);
    const maxSizeLine = SDPUtils.matchPrefix(mediaSection, "a=max-message-size:");
    let maxMessageSize;
    if (maxSizeLine.length > 0) {
      maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
    }
    if (isNaN(maxMessageSize)) {
      maxMessageSize = 65536;
    }
    const sctpPort = SDPUtils.matchPrefix(mediaSection, "a=sctp-port:");
    if (sctpPort.length > 0) {
      return {
        port: parseInt(sctpPort[0].substring(12), 10),
        protocol: mline.fmt,
        maxMessageSize
      };
    }
    const sctpMapLines = SDPUtils.matchPrefix(mediaSection, "a=sctpmap:");
    if (sctpMapLines.length > 0) {
      const parts = sctpMapLines[0].substring(10).split(" ");
      return {
        port: parseInt(parts[0], 10),
        protocol: parts[1],
        maxMessageSize
      };
    }
  };
  SDPUtils.writeSctpDescription = function(media, sctp) {
    let output = [];
    if (media.protocol !== "DTLS/SCTP") {
      output = [
        "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
        "c=IN IP4 0.0.0.0\r\n",
        "a=sctp-port:" + sctp.port + "\r\n"
      ];
    } else {
      output = [
        "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
        "c=IN IP4 0.0.0.0\r\n",
        "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
      ];
    }
    if (sctp.maxMessageSize !== undefined) {
      output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
    }
    return output.join("");
  };
  SDPUtils.generateSessionId = function() {
    return Math.random().toString().substr(2, 22);
  };
  SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
    let sessionId;
    const version = sessVer !== undefined ? sessVer : 2;
    if (sessId) {
      sessionId = sessId;
    } else {
      sessionId = SDPUtils.generateSessionId();
    }
    const user = sessUser || "thisisadapterortc";
    return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
  };
  SDPUtils.getDirection = function(mediaSection, sessionpart) {
    const lines = SDPUtils.splitLines(mediaSection);
    for (let i = 0;i < lines.length; i++) {
      switch (lines[i]) {
        case "a=sendrecv":
        case "a=sendonly":
        case "a=recvonly":
        case "a=inactive":
          return lines[i].substring(2);
        default:
      }
    }
    if (sessionpart) {
      return SDPUtils.getDirection(sessionpart);
    }
    return "sendrecv";
  };
  SDPUtils.getKind = function(mediaSection) {
    const lines = SDPUtils.splitLines(mediaSection);
    const mline = lines[0].split(" ");
    return mline[0].substring(2);
  };
  SDPUtils.isRejected = function(mediaSection) {
    return mediaSection.split(" ", 2)[1] === "0";
  };
  SDPUtils.parseMLine = function(mediaSection) {
    const lines = SDPUtils.splitLines(mediaSection);
    const parts = lines[0].substring(2).split(" ");
    return {
      kind: parts[0],
      port: parseInt(parts[1], 10),
      protocol: parts[2],
      fmt: parts.slice(3).join(" ")
    };
  };
  SDPUtils.parseOLine = function(mediaSection) {
    const line = SDPUtils.matchPrefix(mediaSection, "o=")[0];
    const parts = line.substring(2).split(" ");
    return {
      username: parts[0],
      sessionId: parts[1],
      sessionVersion: parseInt(parts[2], 10),
      netType: parts[3],
      addressType: parts[4],
      address: parts[5]
    };
  };
  SDPUtils.isValidSDP = function(blob) {
    if (typeof blob !== "string" || blob.length === 0) {
      return false;
    }
    const lines = SDPUtils.splitLines(blob);
    for (let i = 0;i < lines.length; i++) {
      if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
        return false;
      }
    }
    return true;
  };
  if (typeof module === "object") {
    module.exports = SDPUtils;
  }
});

// localbase/localbase.js
var import_localforage2 = __toESM(require_localforage(), 1);

// localbase/api/actions/preactions.js
function increment(cuanto) {
  if (typeof cuanto !== "number")
    return (valor) => valor;
  return (valor) => {
    if (typeof valor !== "number")
      return valor;
    return valor + cuanto;
  };
}
function arrayUnion(data) {
  return (array) => {
    if (!Array.isArray(array))
      return array;
    const index = array.findIndex((element) => Bun.deepEquals(element, data, true));
    if (index === -1) {
      array.push(data);
    }
    return array;
  };
}
function arrayRemove(data) {
  return (array) => {
    if (!Array.isArray(array)) {
      return array;
    }
    const index = array.findIndex((element) => Bun.deepEquals(element, data, true));
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  };
}

// localbase/api/selectors/collection.js
var import_localforage = __toESM(require_localforage(), 1);
function collection(collectionName) {
  if (!collectionName) {
    this.userErrors.push("No collection name specified in collection() method.");
    return this;
  } else if (typeof collectionName !== "string") {
    this.userErrors.push("Collection name in collection() method must be a string and not an object, number or boolean.");
    return this;
  } else {
    this.collectionName = collectionName;
    let dbName = this.dbName;
    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = import_localforage.default.createInstance({
        driver: import_localforage.default.INDEXEDDB,
        name: dbName,
        storeName: collectionName
      });
    }
    return this;
  }
}

// localbase/api/selectors/doc.js
function doc(docSelectionCriteria) {
  if (!docSelectionCriteria) {
    this.userErrors.push("No document criteria specified in doc() method. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }");
  } else if (typeof docSelectionCriteria !== "string" && typeof docSelectionCriteria !== "object") {
    this.userErrors.push("Document criteria specified in doc() method must not be a number or boolean. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }");
  } else {
    this.docSelectionCriteria = docSelectionCriteria;
  }
  return this;
}

// localbase/api/filters/orderBy.js
function orderBy(property, direction) {
  if (!property) {
    this.userErrors.push("No field name specified in orderBy() method. Use a string e.g. 'name'");
  } else if (typeof property !== "string") {
    this.userErrors.push("First parameter in orderBy() method must be a string (a field name) e.g. 'name'");
  } else {
    this.orderByProperty = property;
  }
  if (direction) {
    if (direction !== "asc" && direction !== "desc") {
      this.userErrors.push("Second parameter in orderBy() method must be a string set to 'asc' or 'desc'.");
    } else {
      this.orderByDirection = direction;
    }
  }
  return this;
}

// localbase/api/filters/limit.js
function limit(limitBy) {
  if (!limitBy) {
    this.userErrors.push("No integer specified in limit() method.");
  } else if (!Number.isInteger(limitBy)) {
    this.userErrors.push("Limit parameter in limit() method must be an integer (e.g. 3) and not a float, boolean, string or object.");
  } else {
    this.limitBy = limitBy;
  }
  return this;
}

// localbase/api/filters/contains.js
function contains(property, value, exact = false, sinError = false) {
  if (!property || typeof property !== "string") {
    this.userErrors.push("Propiedad no valida");
    return this;
  } else if (typeof value !== "boolean" && typeof value !== "string" && typeof value !== "number") {
    this.userErrors.push("Valor a buscar no es valido");
  } else {
    this.containsProperty = property;
    this.containsValue = value;
    this.containsExact = exact;
    this.containsSinError = sinError;
    return this;
  }
}

// localbase/utils/isSubset.js
function isSubset(superObj, subObj) {
  return Object.keys(subObj).every((ele) => {
    if (typeof subObj[ele] == "object") {
      return isSubset(superObj[ele], subObj[ele]);
    }
    return subObj[ele] === superObj[ele];
  });
}

// localbase/utils/logger.js
var logger = {
  baseStyle: `
    padding: 2px 5px;
    background-color: #124F5C;
    border-radius: 4px;
    color: white; 
  `,
  colors: {
    log: "#124F5C",
    error: "#ed2939",
    warn: "#f39c12"
  },
  log(message, secondary) {
    if (this.config.debug) {
      let style = logger.baseStyle + `background-color: ${logger.colors.log}`;
      if (secondary) {
        console.log("%clocalbase", style, message, secondary);
      } else {
        console.log("%clocalbase", style, message);
      }
    }
  },
  error(message, secondary) {
    if (this.config.debug) {
      let style = logger.baseStyle + `background-color: ${logger.colors.error}`;
      console.error("%clocalbase", style, message);
    }
  },
  warn(message, secondary) {
    if (this.config.debug) {
      let style = logger.baseStyle + `background-color: ${logger.colors.warn}`;
      console.warn("%clocalbase", style, message);
    }
  }
};
var logger_default = logger;

// localbase/api-utils/reset.js
function reset() {
  this.collectionName = null;
  this.orderByProperty = null;
  this.orderByDirection = null;
  this.limitBy = null;
  this.docSelectionCriteria = null;
  this.userErrors = [];
  this.containsProperty = null;
  this.containsValue = null;
  this.whereArguments = [];
}

// localbase/api-utils/selectionLevel.js
function selectionLevel() {
  let level;
  if (!this.collectionName && !this.docSelectionCriteria)
    level = "db";
  else if (this.collectionName && !this.docSelectionCriteria)
    level = "collection";
  else if (this.collectionName && this.docSelectionCriteria)
    level = "doc";
  return level;
}

// localbase/api-utils/showUserErrors.js
function showUserErrors() {
  for (let i = 0;i < this.userErrors.length; i++) {
    logger_default.error.call(this, this.userErrors[i]);
  }
  reset.call(this);
}

// localbase/api-utils/cumpleCriterio.js
var sonStrings = function(valor1, valor2) {
  return typeof valor1 === "string" && typeof valor2 === "string";
};
var cumple = function(objeto, criterio) {
  for (const [clave, valor] of Object.entries(criterio)) {
    switch (true) {
      case (clave.endsWith("_eq") || !clave.includes("_")):
        if (objeto[clave.replace("_eq", "")] !== valor) {
          return false;
        }
        break;
      case clave.endsWith("_lt"):
        if (!(objeto[clave.replace("_lt", "")] < valor)) {
          return false;
        }
        break;
      case clave.endsWith("_gt"):
        if (!(objeto[clave.replace("_gt", "")] > valor)) {
          return false;
        }
        break;
      case clave.endsWith("_lte"):
        if (!(objeto[clave.replace("_lte", "")] <= valor)) {
          return false;
        }
        break;
      case clave.endsWith("_gte"):
        if (!(objeto[clave.replace("_gte", "")] >= valor)) {
          return false;
        }
        break;
      case clave.endsWith("_contains"):
        if (sonStrings(objeto[clave.replace("_contains", "")], valor)) {
          const valorObjeto2 = String(objeto[clave.replace("_contains", "")]).toLowerCase();
          if (!valorObjeto2.includes(valor.toLowerCase())) {
            return false;
          }
        } else if (!objeto[clave.replace("_contains", "")].includes(valor)) {
          return false;
        }
        break;
      case clave.endsWith("_startsWith"):
        if (!objeto[clave.replace("_startsWith", "")].startsWith(valor)) {
          return false;
        }
        break;
      case clave.endsWith("_endsWith"):
        if (!objeto[clave.replace("_endsWith", "")].endsWith(valor)) {
          return false;
        }
        break;
      case clave.endsWith("_in"):
        if (!valor.includes(objeto[clave.replace("_in", "")])) {
          return false;
        }
        break;
      case clave.endsWith("_nin"):
        if (valor.includes(objeto[clave.replace("_nin", "")])) {
          return false;
        }
        break;
      case clave.endsWith("_neq"):
        if (objeto[clave.replace("_neq", "")] === valor) {
          return false;
        }
        break;
      case clave.endsWith("_null"):
        if (objeto[clave.replace("_null", "")] !== null) {
          return false;
        }
        break;
      case clave.endsWith("_notNull"):
        if (objeto[clave.replace("_notNull", "")] === null) {
          return false;
        }
        break;
      case clave.endsWith("_between"):
        const [min, max] = valor;
        const valorObjeto = objeto[clave.replace("_between", "")];
        if (valorObjeto < min || valorObjeto > max) {
          return false;
        }
        break;
      default:
        break;
    }
  }
  return true;
};
function cumpleCriterios(objeto) {
  for (const criterio of this.whereArguments) {
    if (cumple(objeto, criterio))
      return true;
  }
}

// localbase/api/actions/get.js
var import_fuzzysort = __toESM(require_fuzzysort(), 1);
function get(options = { keys: false }) {
  this.getCollection = () => {
    let collectionName = this.collectionName;
    let orderByProperty = this.orderByProperty;
    let orderByDirection = this.orderByDirection;
    let limitBy = this.limitBy;
    let containsProperty = this.containsProperty;
    let containsValue = this.containsValue;
    let containsExact = this.containsExact;
    let containsSinError = this.containsSinError;
    let whereArguments = this.whereArguments;
    const cuantosWhere = whereArguments.length;
    if (cuantosWhere > 10)
      throw new Error("No se pueden usar mas de 10 where en una consulta");
    let collection2 = [];
    let logMessage;
    return this.lf[collectionName].iterate((value, key) => {
      let collectionItem = {};
      if (!options.keys) {
        collectionItem = value;
      } else {
        collectionItem = {
          key,
          data: value
        };
      }
      logMessage = `Got "${collectionName}" collection`;
      if (containsProperty) {
        let valor = value[containsProperty];
        try {
          if (typeof valor !== undefined) {
            if (typeof valor === "boolean" && typeof containsValue === "boolean") {
              if (valor === containsValue) {
                collection2.push(collectionItem);
              }
            } else if (typeof valor === "string" && typeof containsValue === "string") {
              const val = String(valor).toLowerCase();
              const cVal = String(containsValue).toLowerCase();
              if (!containsExact) {
                if (containsSinError && val.includes(cVal)) {
                  collection2.push(collectionItem);
                } else {
                  const search = import_fuzzysort.single(cVal, val);
                  if (search) {
                    collection2.push(collectionItem);
                  }
                }
              } else if (val === cVal)
                collection2.push(collectionItem);
              if (limitBy) {
                if (collection2.length > limitBy + 10) {
                  logMessage += `, limited to contains is ${limitBy} `;
                  return collection2;
                }
              }
            } else if (typeof valor === "number" && typeof containsValue === "number") {
              if (valor === containsValue)
                collection2.push(collectionItem);
            }
            logMessage += `, contains: "${containsValue}" in "${containsProperty}"`;
          }
        } catch (error) {
          this.userErrors.push(`Constain():${error.message}`);
        }
      } else if (typeof value === "object" && cuantosWhere) {
        cumpleCriterios.call(this, value) && collection2.push(collectionItem);
        if (limitBy) {
          if (collection2.length > limitBy + 10) {
            logMessage += `, limited to contains is ${limitBy} `;
            return collection2;
          }
        }
      } else {
        collection2.push(collectionItem);
      }
    }).then(() => {
      if (orderByProperty) {
        logMessage += `, ordered by "${orderByProperty}"`;
        if (!options.keys) {
          collection2.sort((a, b) => {
            return a[orderByProperty].toString().localeCompare(b[orderByProperty].toString());
          });
        } else {
          collection2.sort((a, b) => {
            return a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString());
          });
        }
      }
      if (orderByDirection == "desc") {
        logMessage += ` (descending)`;
        collection2.reverse();
      }
      if (limitBy) {
        logMessage += `, limited to ${limitBy}`;
        collection2 = collection2.splice(0, limitBy);
      }
      logMessage += `:`;
      logger_default.log.call(this, logMessage, collection2);
      reset.call(this);
      return collection2;
    });
  };
  this.getDocument = () => {
    let collectionName = this.collectionName;
    let docSelectionCriteria = this.docSelectionCriteria;
    let collection2 = [];
    let document = {};
    this.getDocumentByCriteria = () => {
      return this.lf[collectionName].iterate((value, key) => {
        if (isSubset(value, docSelectionCriteria)) {
          collection2.push(value);
        }
      }).then(() => {
        if (!collection2.length) {
          logger_default.error.call(this, `Could not find Document in "${collectionName}" collection with criteria: ${JSON.stringify(docSelectionCriteria)}`);
        } else {
          document = collection2[0];
          logger_default.log.call(this, `Got Document with ${JSON.stringify(docSelectionCriteria)}:`, document);
          reset.call(this);
          return document;
        }
      });
    };
    this.getDocumentByKey = () => {
      return this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
        document = value;
        if (document) {
          logger_default.log.call(this, `Got Document with key ${JSON.stringify(docSelectionCriteria)}:`, document);
        } else {
          logger_default.error.call(this, `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`);
        }
        reset.call(this);
        return document;
      }).catch((err) => {
        logger_default.error.call(this, `Could not find Document in "${collectionName}" collection with Key: ${JSON.stringify(docSelectionCriteria)}`);
        reset.call(this);
      });
    };
    if (typeof docSelectionCriteria == "object") {
      return this.getDocumentByCriteria();
    } else {
      return this.getDocumentByKey();
    }
  };
  if (!(typeof options == "object" && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }');
  } else {
    if (!options.hasOwnProperty("keys")) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }');
    } else {
      if (typeof options.keys !== "boolean") {
        this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.');
      }
    }
  }
  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this);
    if (currentSelectionLevel == "collection") {
      return this.getCollection();
    } else if (currentSelectionLevel == "doc") {
      return this.getDocument();
    }
  } else {
    showUserErrors.call(this);
    return null;
  }
}

// localbase/api-utils/success.js
function success(message, data) {
  reset.call(this);
  logger_default.log.call(this, message, data);
  return {
    success: true,
    message,
    data
  };
}

// localbase/api-utils/error.js
function error(message) {
  reset.call(this);
  logger_default.error.call(this, message);
  return `Error: ${message}`;
}

// localbase/api/actions/add.js
var import_fuzzysort2 = __toESM(require_fuzzysort(), 1);

// localbase/api-utils/StringInObject.js
function StringInObject_default(value) {
  let keys = [];
  Object.keys(value).forEach(async (k) => {
    if (typeof value[k] === "string" && value[k].length < 200) {
      if (isNaN(Number(value[k]))) {
        keys.push(k);
      }
    }
  });
  let str = "";
  keys.forEach((k2) => str += `${value[k2]} `);
  return str.trimEnd();
}

// localbase/api-utils/Constant.js
var ACTIONS = {
  ADD: "add",
  DELETE: "delete",
  UPDATE: "update",
  SET: "set",
  DROP: "drop"
};

// localbase/api/actions/add.js
function add(data, keyProvided) {
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }');
  } else if (!(typeof data == "object" && data instanceof Array == false)) {
    this.userErrors.push("Data passed to .add() must be an object. Not an array, string, number or boolean.");
  }
  if (!this.userErrors.length) {
    let collectionName = this.collectionName;
    return new Promise((resolve, reject) => {
      let key = null;
      if (!keyProvided) {
        key = this.uid();
      } else {
        key = keyProvided;
      }
      try {
        if (data._prepared_ === undefined) {
          data._prepared_ = import_fuzzysort2.prepare(StringInObject_default(data));
        }
      } catch (error3) {
        console.trace(error3);
        logger_default.error.call(this, error3.message);
      }
      return this.lf[collectionName].setItem(key, data).then(async () => {
        this.change(collectionName, ACTIONS.ADD, data, key);
        resolve(success.call(this, `Document added to "${collectionName}" collection.`, { key, data }));
      }).catch((err) => {
        reject(error.call(this, `Could not add Document to ${collectionName} collection.`));
      });
    });
  } else {
    showUserErrors.call(this);
  }
}

// localbase/utils/updateObject.js
function updateObject(obj) {
  for (var i = 1;i < arguments.length; i++) {
    for (var prop in arguments[i]) {
      var val = arguments[i][prop];
      obj[prop] = val;
    }
  }
  return obj;
}

// localbase/api-utils/isValidFunctionAndExecute.js
var incrementString = increment(1).toString();
var arrayUnionString = arrayUnion({}).toString();
var arrayRemoveString = arrayRemove({}).toString();
var incrementExecute = (key, increment2, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = 0;
  }
  const cuanto = old[key];
  return increment2(cuanto);
};
var arrayExecute = (key, arrayFuntion, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = [];
  }
  const data = old[key];
  return arrayFuntion(data);
};
function validarYEjecutarFunciones(docNewData, docOldData) {
  try {
    for (const key in docNewData) {
      if (docNewData.hasOwnProperty(key) && typeof docNewData[key] === "function") {
        const funcionEntrante = docNewData[key].toString();
        if (funcionEntrante === incrementString) {
          docNewData[key] = incrementExecute(key, docNewData[key], docOldData);
        } else if (funcionEntrante === arrayUnionString || funcionEntrante === arrayRemoveString) {
          docNewData[key] = arrayExecute(key, docNewData[key], docOldData);
        } else {
          throw new Error(`La propiedad ${key} es una funci\xF3n pero no es Localbase.increment, Localbase.arrayUnion o Localbase.arrayRemove`);
        }
      }
    }
    return docNewData;
  } catch (error3) {
    throw new Error(`Error en la funci\xF3n validarYEjecutarFunciones: ${error3.message}`);
  }
}

// localbase/api/actions/update.js
function update(docUpdates) {
  let collectionName = this.collectionName;
  let docSelectionCriteria = this.docSelectionCriteria;
  let whereArguments = this.whereArguments;
  const cuantosWhere = whereArguments.length;
  if (cuantosWhere > 10)
    throw new Error("No se pueden usar mas de 10 where en una consulta");
  return new Promise((resolve, reject) => {
    this.updateDocumentByCriteria = (isWhere = false) => {
      let docsToUpdate = [];
      this.lf[collectionName].iterate((value, key) => {
        let oldDocument = value;
        const dataAUpdated = validarYEjecutarFunciones.call(this, docUpdates, oldDocument);
        if (!isWhere) {
          if (isSubset(dataAUpdated, docSelectionCriteria)) {
            let newDocument = updateObject(value, dataAUpdated);
            docsToUpdate.push({ key, newDocument, oldDocument });
          }
        } else if (cumpleCriterios.call(this, value)) {
          let newDocument = updateObject(value, dataAUpdated);
          docsToUpdate.push({ key, newDocument, oldDocument });
        }
      }).then(() => {
        if (!docsToUpdate.length) {
          reject(error.call(this, `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`));
        }
        if (docsToUpdate.length > 1) {
          logger_default.warn.call(this, `Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(docSelectionCriteria)} found for updating.`);
        }
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          this.lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument).then((value) => {
            this.change(collectionName, ACTIONS.UPDATE, { ...docToUpdate }, docToUpdate.key);
            if (index === docsToUpdate.length - 1) {
              resolve(success.call(this, `${docsToUpdate.length} Document${docsToUpdate.length > 1 ? "s" : ""} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} updated.`, docUpdates));
            }
          }).catch((err) => {
            reject(error.call(this, `Could not update ${docsToUpdate.length} Documents in ${collectionName} Collection.`));
          });
        });
      });
    };
    this.updateDocumentByKey = () => {
      let docToUpdate = { key: docSelectionCriteria };
      this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
        docToUpdate.oldDocument = value;
        const dataAUpdated = validarYEjecutarFunciones.call(this, docUpdates, docToUpdate.oldDocument);
        docToUpdate.newDocument = updateObject(JSON.parse(JSON.stringify(docToUpdate.oldDocument)), dataAUpdated);
        this.lf[collectionName].setItem(docSelectionCriteria, docToUpdate.newDocument);
        this.change(collectionName, ACTIONS.UPDATE, docToUpdate, docToUpdate.key);
        resolve(success.call(this, `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`, docToUpdate.newDocument));
      }).catch((err) => {
        reject(error.call(this, `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`));
      });
    };
    if (!docUpdates) {
      this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }');
    } else if (!(typeof docUpdates == "object" && docUpdates instanceof Array == false)) {
      this.userErrors.push("Data passed to .update() must be an object. Not an array, string, number or boolean.");
    }
    if (!this.userErrors.length) {
      if (typeof docSelectionCriteria == "object") {
        if (docSelectionCriteria !== null) {
          this.updateDocumentByCriteria();
        } else if (cuantosWhere) {
          this.updateDocumentByCriteria(true);
        }
      } else {
        this.updateDocumentByKey();
      }
    } else {
      showUserErrors.call(this);
    }
  });
}

// localbase/api/actions/set.js
function set(newDocument, options = { keys: false }) {
  let collectionName = this.collectionName;
  let docSelectionCriteria = this.docSelectionCriteria;
  let currentSelectionLevel = selectionLevel.call(this);
  return new Promise((resolve, reject) => {
    this.setCollection = () => {
      this.lf[collectionName].clear().then(() => {
        if (!options.keys) {
          newDocument.forEach((doc2) => {
            this.add(doc2);
          });
          resolve(success.call(this, `Collection "${collectionName}" set with ${newDocument.length} Documents.`, newDocument));
        } else {
          console.log("keys provided");
          let docsWithoutKey = 0;
          newDocument.forEach((doc2) => {
            if (!doc2.hasOwnProperty("_key")) {
              docsWithoutKey++;
            }
          });
          if (docsWithoutKey) {
            reject(error.call(this, `Documents provided to .set() in an array must each have a _key property set to a string.`));
          } else {
            newDocument.forEach((doc2) => {
              let key = doc2._key;
              delete doc2._key;
              this.add(doc2, key);
            });
            resolve(success.call(this, `Collection "${collectionName}" set with ${newDocument.length} Documents.`, newDocument));
          }
        }
      }).catch((err) => {
        reject(error.call(this, `Could not set ${collectionName} Collection with data ${JSON.stringify(newDocument)}.`));
      });
    };
    this.setDocument = () => {
      this.setDocumentByCriteria = () => {
        let docsToSet = [];
        this.lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            docsToSet.push({ key, newDocument });
          }
        }).then(() => {
          if (!docsToSet.length) {
            reject(error.call(this, `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`));
          }
          if (docsToSet.length > 1) {
            logger_default.warn.call(this, `Multiple documents (${docsToSet.length}) with ${JSON.stringify(docSelectionCriteria)} found for setting.`);
          }
        }).then(() => {
          docsToSet.forEach((docToSet, index) => {
            this.lf[collectionName].setItem(docToSet.key, docToSet.newDocument).then((value) => {
              this.change(collectionName, ACTIONS.SET, docToSet.newDocument, docToSet.key);
              if (index === docsToSet.length - 1) {
                resolve(success.call(this, `${docsToSet.length} Document${docsToSet.length > 1 ? "s" : ""} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} was set.`, newDocument));
              }
            }).catch((err) => {
              reject(error.call(this, `Could not set ${docsToSet.length} Documents in ${collectionName} Collection.`));
            });
          });
        });
      };
      this.setDocumentByKey = () => {
        this.lf[collectionName].setItem(docSelectionCriteria, newDocument).then((value) => {
          this.change(collectionName, ACTIONS.SET, newDocument, docSelectionCriteria);
          resolve(success.call(this, `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} was set.`, newDocument));
        }).catch((err) => {
          reject(error.call(this, `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} could not be set.`));
        });
      };
      if (typeof docSelectionCriteria == "object") {
        return this.setDocumentByCriteria();
      } else {
        return this.setDocumentByKey();
      }
    };
    if (!newDocument) {
      this.userErrors.push('No new Document object provided to set() method. Use an object e.g. { id: 1, name: "Bill", age: 47 }');
    } else if (currentSelectionLevel === "doc") {
      if (!(typeof newDocument == "object" && newDocument instanceof Array == false)) {
        this.userErrors.push("Data passed to .set() must be an object. Not an array, string, number or boolean.");
      }
    } else if (currentSelectionLevel === "collection") {
      if (!(typeof newDocument == "object" && newDocument instanceof Array == true)) {
        this.userErrors.push("Data passed to .set() must be an array of objects. Not an object, string, number or boolean.");
      }
    }
    if (!this.userErrors.length) {
      if (currentSelectionLevel == "collection") {
        return this.setCollection();
      } else if (currentSelectionLevel == "doc") {
        return this.setDocument();
      }
    } else {
      showUserErrors.call(this);
    }
  });
}

// localbase/api/actions/delete.js
function deleteIt() {
  return new Promise((resolve, reject) => {
    this.deleteDatabase = () => {
      let dbName = this.dbName;
      indexedDB.deleteDatabase(dbName);
      this.change(null, ACTIONS.DROP, null, null);
      resolve(success.call(this, `Database "${dbName}" deleted.`, { database: dbName }));
    };
    this.deleteCollection = () => {
      let dbName = this.dbName;
      let collectionName = this.collectionName;
      this.addToDeleteCollectionQueue = (collectionName2) => {
        this.deleteCollectionQueue.queue.push(collectionName2);
        this.runDeleteCollectionQueue();
      };
      this.runDeleteCollectionQueue = () => {
        if (this.deleteCollectionQueue.running == false) {
          this.deleteCollectionQueue.running = true;
          this.deleteNextCollectionFromQueue();
        }
      };
      this.deleteNextCollectionFromQueue = () => {
        if (this.deleteCollectionQueue.queue.length) {
          let collectionToDelete = this.deleteCollectionQueue.queue[0];
          this.deleteCollectionQueue.queue.shift();
          this.lf[collectionToDelete].dropInstance({
            name: dbName,
            storeName: collectionToDelete
          }).then(() => {
            this.change(collectionToDelete, ACTIONS.DROP, null, null);
            this.deleteNextCollectionFromQueue();
            resolve(success.call(this, `Collection "${collectionToDelete}" deleted.`, { collection: collectionToDelete }));
          }).catch((error6) => {
            reject(error6.call(this, `Collection "${collectionToDelete}" could not be deleted.`));
          });
        } else {
          this.deleteCollectionQueue.running = false;
        }
      };
      this.addToDeleteCollectionQueue(collectionName);
    };
    this.deleteDocument = () => {
      let collectionName = this.collectionName;
      let docSelectionCriteria = this.docSelectionCriteria;
      this.deleteDocumentByCriteria = () => {
        let keysForDeletion = [];
        this.lf[collectionName].iterate((value, key) => {
          if (isSubset(value, docSelectionCriteria)) {
            keysForDeletion.push(key);
          }
        }).then(() => {
          if (!keysForDeletion.length) {
            reject(error.call(this, `No Documents found in "${collectionName}" Collection with criteria ${JSON.stringify(docSelectionCriteria)}. No documents deleted.`));
          }
          if (keysForDeletion.length > 1) {
            logger_default.warn.call(this, `Multiple documents (${keysForDeletion.length}) with ${JSON.stringify(docSelectionCriteria)} found.`);
          }
        }).then(() => {
          keysForDeletion.forEach((key, index) => {
            this.lf[collectionName].removeItem(key).then(() => {
              if (index === keysForDeletion.length - 1) {
                this.change(collectionName, ACTIONS.DELETE, null, key);
                resolve(success.call(this, `${keysForDeletion.length} Document${keysForDeletion.length > 1 ? "s" : ""} with ${JSON.stringify(docSelectionCriteria)} deleted.`, { keys: keysForDeletion }));
              }
            }).catch((err) => {
              reject(error.call(this, `Could not delete ${keysForDeletion.length} Documents in ${collectionName} Collection.`));
            });
          });
        });
      };
      this.deleteDocumentByKey = () => {
        this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
          if (value) {
            this.lf[collectionName].removeItem(docSelectionCriteria).then(() => {
              this.change(collectionName, ACTIONS.DELETE, value, docSelectionCriteria);
              resolve(success.call(this, `Document with key ${JSON.stringify(docSelectionCriteria)} deleted.`, { key: docSelectionCriteria }));
            }).catch(function(err) {
              reject(error.call(this, `No Document found in "${collectionName}" Collection with key ${JSON.stringify(docSelectionCriteria)}. No document was deleted.`));
            });
          } else {
            reject(error.call(this, `No Document found in "${collectionName}" Collection with key ${JSON.stringify(docSelectionCriteria)}. No document was deleted.`));
          }
        });
      };
      if (typeof docSelectionCriteria == "object") {
        return this.deleteDocumentByCriteria();
      } else {
        return this.deleteDocumentByKey();
      }
    };
    if (!this.userErrors.length) {
      let currentSelectionLevel = selectionLevel.call(this);
      if (currentSelectionLevel == "db") {
        return this.deleteDatabase();
      } else if (currentSelectionLevel == "collection") {
        return this.deleteCollection();
      } else if (currentSelectionLevel == "doc") {
        return this.deleteDocument();
      }
    } else {
      showUserErrors.call(this);
    }
  });
}

// localbase/api/actions/search.js
var import_fuzzysort3 = __toESM(require_fuzzysort(), 1);
async function search(query = "", inKeys = [], options = { highlights: true }) {
  if (!query)
    return logger_default.error.call(this, "query in search is empty");
  if (typeof options !== "object")
    return logger_default.error.call(this, "no valid options");
  this.buscar = async () => {
    console.time("buscar");
    let collectionName = this.collectionName;
    if (!!this.cache[collectionName] && this.time) {
      clearTimeout(this.time);
    } else {
      this.cache[collectionName] = [];
      console.time("cargando_cache");
      await new Promise((res, rej) => {
        this.lf[collectionName].iterate((value, key) => {
          if (!value.___prepared___) {
            value.___prepared___ = import_fuzzysort3.prepare(StringInObject_default(value));
          }
          this.cache[collectionName].push(value);
        }).then(() => {
          res(true);
        }).catch((e) => {
          rej(e);
        });
      });
      console.timeEnd("cargando_cache");
    }
    this.time = setTimeout(() => {
      delete this.cache[collectionName];
      this.time = 0;
    }, 1000 * 60 * 60);
    const optionsFuzzy = {
      limit: 50,
      threshold: -1e4,
      key: Array.isArray(inKeys) && inKeys.length ? null : "___prepared___",
      keys: Array.isArray(inKeys) && inKeys.length ? inKeys : null
    };
    const results = import_fuzzysort3.go(query, this.cache[collectionName], optionsFuzzy);
    logger_default.log.call(this, "SEARCHS", results.length);
    console.timeEnd("buscar");
    reset.call(this);
    return results.map((o) => o.obj);
  };
  if (!(typeof options == "object" && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .search() must be an object. Not an array, string, number or boolean. The object must contain a "highlights" property set to true or false, e.g. { highlights: true }');
  } else {
    if (!options.hasOwnProperty("highlights")) {
      this.userErrors.push('Object passed to search() method must contain a "highlights" property set to boolean true or false, e.g. { highlights: true }');
    } else {
      if (typeof options.highlights !== "boolean") {
        this.userErrors.push('Property "highlights" passed into search() method must be assigned a boolean value (true or false). Not a string or integer.');
      }
    }
  }
  let currentSelectionLevel = selectionLevel.call(this);
  if (currentSelectionLevel == "collection") {
    return this.buscar();
  } else if (currentSelectionLevel == "doc") {
    this.userErrors.push("Function no avalible in doc");
  }
  if (this.userErrors.length) {
    showUserErrors.call(this);
    return null;
  }
}

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
var byteToHex = [];
for (let i = 0;i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}

// node_modules/uuid/dist/esm-browser/v1.js
var v1 = function(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== undefined ? options.msecs : Date.now();
  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 12219292800000;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0;n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
};
var _nodeId;
var _clockseq;
var _lastMSecs = 0;
var _lastNSecs = 0;
var v1_default = v1;
// localbase/api-utils/uid.js
function uid_default() {
  const unordered = v1_default();
  return unordered.substring(14, 18) + unordered.substring(9, 13) + unordered.substring(0, 8) + unordered.substring(19, 23) + unordered.substring(24, unordered.length);
}

// localbase/api/filters/where.js
function where(whereSelectionCriteria) {
  if (!whereSelectionCriteria) {
    this.userErrors.push('No where criteria specified in where() method. object (with criteria) e.g. { id_eq: 1 }, { id_lt: 5 }, { id_gt: 5 }, { id_lte: 5 }, { id_gte: 5 }, { id_contains: "foo" }, { id_startsWith: "foo" }, { id_endsWith: "foo" }, { id_in: [1, 2, 3] }, { id_nin: [1, 2, 3] }, { id_neq: 1 }, { id_null: true }, { id_notNull: true }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_like: "foo" }, { id_notLike: "foo" }, { id_iLike: "foo" }, { id_notILike: "foo" }, { id_regexp: "foo" }, { id_notRegexp: "foo" }, { id_iRegexp: "foo" }, { id_notIRegexp: "foo" }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }');
  } else if (typeof whereSelectionCriteria !== "object") {
    this.userErrors.push("Where criteria specified in where() method must not be a number, boolean or string. Use object (with criteria) e.g. { id: 1 }");
  } else if (Array.isArray(whereSelectionCriteria)) {
    this.userErrors.push("Where criteria specified in where() method must not be an array. Use object (with criteria) e.g. { id: 1 }");
  } else {
    this.whereArguments.push(whereSelectionCriteria);
  }
  return this;
}

// localbase/api/observer/on.js
function on(callback) {
  this.onCollection = () => {
    let collectionName = this.collectionName;
    let dbName = this.dbName;
    CloudLocalbase.events.on(`db:${dbName}:col:${collectionName}`, callback);
  };
  this.onDocument = () => {
    let docSelectionCriteria = this.docSelectionCriteria;
    if (typeof docSelectionCriteria !== "string")
      throw new Error("no se especifico el documento a observar");
    CloudLocalbase.events.on(`doc:${docSelectionCriteria}`, callback);
  };
  if (!(typeof callback == "function")) {
    this.userErrors.push("Callback passed to on() method must be a function");
  }
  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this);
    if (currentSelectionLevel == "collection") {
      return this.onCollection();
    } else if (currentSelectionLevel == "doc") {
      return this.onDocument();
    }
  } else {
    showUserErrors.call(this);
    return null;
  }
}

// localbase/api/observer/off.js
function off(callback) {
  this.onCollection = () => {
    let collectionName = this.collectionName;
    let dbName = this.dbName;
    CloudLocalbase.events.off(`db:${dbName}:col:${collectionName}`, callback);
  };
  this.onDocument = () => {
    let docSelectionCriteria = this.docSelectionCriteria;
    if (typeof docSelectionCriteria !== "string")
      throw new Error("no se especifico el documento a observar");
    CloudLocalbase.events.off(`doc:${docSelectionCriteria}`, callback);
  };
  if (!(typeof callback == "function")) {
    this.userErrors.push("Callback passed to off() method must be a function");
  }
  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this);
    if (currentSelectionLevel == "collection") {
      return this.onCollection();
    } else if (currentSelectionLevel == "doc") {
      return this.onDocument();
    }
  } else {
    showUserErrors.call(this);
    return null;
  }
}

// node_modules/mitt/dist/mitt.mjs
function mitt_default(n) {
  return { all: n = n || new Map, on: function(t, e) {
    var i = n.get(t);
    i ? i.push(e) : n.set(t, [e]);
  }, off: function(t, e) {
    var i = n.get(t);
    i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
  }, emit: function(t, e) {
    var i = n.get(t);
    i && i.slice().map(function(n2) {
      n2(e);
    }), (i = n.get("*")) && i.slice().map(function(n2) {
      n2(t, e);
    });
  } };
}

// localbase/localbase.js
class CloudLocalbase {
  static iDB = import_localforage2.default.createInstance({
    driver: import_localforage2.default.INDEXEDDB,
    name: "localbase",
    storeName: "internal"
  });
  static transacciones = import_localforage2.default.createInstance({
    driver: import_localforage2.default.INDEXEDDB,
    name: "localbase",
    storeName: "transacciones"
  });
  static events = mitt_default();
  constructor(dbName) {
    this.dbName = dbName;
    this.lf = {};
    this.collectionName = null;
    this.orderByProperty = null;
    this.orderByDirection = null;
    this.limitBy = null;
    this.docSelectionCriteria = null;
    this.noChange = false;
    this.containsProperty = null;
    this.containsValue = null;
    this.containsExact = false;
    this.containsSinError = false;
    this.whereArguments = [];
    this.deleteCollectionQueue = {
      queue: [],
      running: false
    };
    this.config = {
      debug: false
    };
    this.userErrors = [];
    this.collection = collection.bind(this);
    this.doc = doc.bind(this);
    this.orderBy = orderBy.bind(this);
    this.limit = limit.bind(this);
    this.contains = contains.bind(this);
    this.where = where.bind(this);
    this.get = get.bind(this);
    this.add = add.bind(this);
    this.update = update.bind(this);
    this.set = set.bind(this);
    this.delete = deleteIt.bind(this);
    this.on = on.bind(this);
    this.off = off.bind(this);
    this.cache = {};
    this.time = 0;
    this.search = search.bind(this);
    this.uid = uid_default.bind(this);
  }
  change(collection3, action, data, key) {
    if (!!key) {
      CloudLocalbase.events.emit(`doc:${key}`, { action, data });
    }
    CloudLocalbase.events.emit(`db:${this.dbName}:col:${collection3}`, { key, action, data });
    CloudLocalbase.transacciones.setItem(CloudLocalbase.uid(), JSON.stringify({ db: this.dbName, collection: collection3, key, action, data })).finally(() => {
      if (!this.noChange) {
        CloudLocalbase.events.emit("change", { db: this.dbName, collection: collection3, key, action, data });
      }
    });
  }
  static increment = increment;
  static arrayUnion = arrayUnion;
  static arrayRemove = arrayRemove;
  static toTimestamp() {
    return Date.now();
  }
  static async update(data) {
    console.log(data);
    if (!data.db)
      throw new Error("db no definido");
    if (!data.collection)
      throw new Error("collection no definido");
    if (!data.action)
      throw new Error("action no definido");
    const { db, collection: collection3, key, action, data: payload } = data;
    const localDb = new CloudLocalbase(db);
    localDb.noChange = true;
    if (action === ACTIONS.ADD) {
      await localDb.collection(collection3).add(payload);
      console.log("add");
    } else if (action === ACTIONS.DELETE) {
      if (!key) {
        await localDb.collection(collection3).delete();
        console.log("delete");
      } else {
        await localDb.collection(collection3).doc(key).delete();
        console.log("delete doc");
      }
    } else if (action === ACTIONS.UPDATE) {
      try {
        if (!payload.newDocument)
          throw new Error("newDocument no definido");
        await localDb.collection(collection3).doc(key).update(payload.newDocument);
        console.log("update");
      } catch (error6) {
        await localDb.collection(collection3).add(payload.newDocument, key);
        console.log("add to update");
      }
    } else if (action === ACTIONS.SET) {
      await localDb.collection(collection3).doc(key).set(payload);
      console.log("set");
    } else if (action === ACTIONS.DROP) {
      if (collection3) {
        await localDb.collection(collection3).delete();
        console.log("drop collection");
      } else if (db) {
        await localDb.delete();
        console.log("drop db");
      }
    }
  }
  static uid = uid_default;
  static toDateString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
}

// ClientRebase/rebase.js
class ConnectRebase {
  #resolverPromesa = null;
  #rejectorPromesa = null;
  constructor(config, Localbase) {
    if (ConnectRebase.intance)
      return ConnectRebase.intance;
    if (!Localbase)
      throw new Error("Localbase no definido");
    if (!Localbase.uid)
      throw new Error("Localbase.uid no definido");
    if (!Localbase.events)
      throw new Error("Localbase.events no definido");
    if (!Localbase.iDB)
      throw new Error("Localbase.iDB no definido");
    if (!Localbase.transacciones)
      throw new Error("Localbase.transacciones no definido");
    this.config = config;
    if (!this.config)
      throw new Error("Configuracion no definida");
    if (!this.config.apiKey)
      throw new Error("ApiKey no definido");
    if (!this.config.projectId)
      throw new Error("projectId no definido");
    if (!this.config.host)
      throw new Error("host no definido");
    if (!this.config.port)
      this.config.port = 443;
    if (!this.config.id)
      this.config.id = Localbase.uid();
    if (new RegExp("^[a-zA-Z][a-zA-Z0-9-]*.[a-zA-Z]+$/").test(this.config.host))
      throw new Error("host no valido");
    this.socket = new WebSocket(`ws://${this.config.host}:${this.config.port}?id=${this.config.id}&apiKey=${this.config.apiKey}&projectId=${this.config.projectId}&ts=${Date.now()}`);
    this.promesaConexion = new Promise((resolve, reject) => {
      this.#resolverPromesa = resolve;
      this.#rejectorPromesa = reject;
    });
    const changes = (data) => {
      console.log("data", data);
      this.socket.send(JSON.stringify(data));
    };
    const onOpen = () => {
      console.log("conectado");
      this.socket.isOpened = true;
      Localbase.events.on("change", changes);
      this.#resolverPromesa();
    };
    this.socket.addEventListener("open", onOpen);
    this.socket.onclose = () => {
      this.socket.removeEventListener("open", onOpen);
      Localbase.events.off("change", changes);
      console.log("conexi\xF3n cerrada");
    };
    this.socket.onmessage = (event) => {
      if (typeof event.data !== "string")
        return console.error("Tipo de dato no valido");
      const data = JSON.parse(event.data);
      if (data.TAG === "MANTENIMIENTO") {
        Localbase.transacciones.clear();
        Localbase.iDB.setItem("lastUpdate", Date.now());
      }
    };
    this.socket.onerror = (error6) => {
      this.socket.removeEventListener("open", onOpen);
      this.#rejectorPromesa(error6);
    };
    ConnectRebase.intance = this;
  }
  async connect() {
    return this.promesaConexion;
  }
}

// node_modules/peerjs-js-binarypack/dist/binarypack.mjs
var $e8379818650e2442$var$concatArrayBuffers = function(bufs) {
  let size = 0;
  for (const buf of bufs)
    size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    result.set(view, offset);
    offset += buf.byteLength;
  }
  return result;
};
var $0cfd7828ad59115f$export$417857010dc9287f = function(data) {
  const unpacker = new $0cfd7828ad59115f$var$Unpacker(data);
  return unpacker.unpack();
};
var $0cfd7828ad59115f$export$2a703dbb0cb35339 = function(data) {
  const packer = new $0cfd7828ad59115f$export$b9ec4b114aa40074;
  const res = packer.pack(data);
  if (res instanceof Promise)
    return res.then(() => packer.getBuffer());
  return packer.getBuffer();
};

class $e8379818650e2442$export$93654d4f2d6cd524 {
  constructor() {
    this.encoder = new TextEncoder;
    this._pieces = [];
    this._parts = [];
  }
  append_buffer(data) {
    this.flush();
    this._parts.push(data);
  }
  append(data) {
    this._pieces.push(data);
  }
  flush() {
    if (this._pieces.length > 0) {
      const buf = new Uint8Array(this._pieces);
      this._parts.push(buf);
      this._pieces = [];
    }
  }
  toArrayBuffer() {
    const buffer = [];
    for (const part of this._parts)
      buffer.push(part);
    return $e8379818650e2442$var$concatArrayBuffers(buffer).buffer;
  }
}

class $0cfd7828ad59115f$var$Unpacker {
  constructor(data) {
    this.index = 0;
    this.dataBuffer = data;
    this.dataView = new Uint8Array(this.dataBuffer);
    this.length = this.dataBuffer.byteLength;
  }
  unpack() {
    const type = this.unpack_uint8();
    if (type < 128)
      return type;
    else if ((type ^ 224) < 32)
      return (type ^ 224) - 32;
    let size;
    if ((size = type ^ 160) <= 15)
      return this.unpack_raw(size);
    else if ((size = type ^ 176) <= 15)
      return this.unpack_string(size);
    else if ((size = type ^ 144) <= 15)
      return this.unpack_array(size);
    else if ((size = type ^ 128) <= 15)
      return this.unpack_map(size);
    switch (type) {
      case 192:
        return null;
      case 193:
        return;
      case 194:
        return false;
      case 195:
        return true;
      case 202:
        return this.unpack_float();
      case 203:
        return this.unpack_double();
      case 204:
        return this.unpack_uint8();
      case 205:
        return this.unpack_uint16();
      case 206:
        return this.unpack_uint32();
      case 207:
        return this.unpack_uint64();
      case 208:
        return this.unpack_int8();
      case 209:
        return this.unpack_int16();
      case 210:
        return this.unpack_int32();
      case 211:
        return this.unpack_int64();
      case 212:
        return;
      case 213:
        return;
      case 214:
        return;
      case 215:
        return;
      case 216:
        size = this.unpack_uint16();
        return this.unpack_string(size);
      case 217:
        size = this.unpack_uint32();
        return this.unpack_string(size);
      case 218:
        size = this.unpack_uint16();
        return this.unpack_raw(size);
      case 219:
        size = this.unpack_uint32();
        return this.unpack_raw(size);
      case 220:
        size = this.unpack_uint16();
        return this.unpack_array(size);
      case 221:
        size = this.unpack_uint32();
        return this.unpack_array(size);
      case 222:
        size = this.unpack_uint16();
        return this.unpack_map(size);
      case 223:
        size = this.unpack_uint32();
        return this.unpack_map(size);
    }
  }
  unpack_uint8() {
    const byte = this.dataView[this.index] & 255;
    this.index++;
    return byte;
  }
  unpack_uint16() {
    const bytes = this.read(2);
    const uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
    this.index += 2;
    return uint16;
  }
  unpack_uint32() {
    const bytes = this.read(4);
    const uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
    this.index += 4;
    return uint32;
  }
  unpack_uint64() {
    const bytes = this.read(8);
    const uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
    this.index += 8;
    return uint64;
  }
  unpack_int8() {
    const uint8 = this.unpack_uint8();
    return uint8 < 128 ? uint8 : uint8 - 256;
  }
  unpack_int16() {
    const uint16 = this.unpack_uint16();
    return uint16 < 32768 ? uint16 : uint16 - 65536;
  }
  unpack_int32() {
    const uint32 = this.unpack_uint32();
    return uint32 < 2 ** 31 ? uint32 : uint32 - 2 ** 32;
  }
  unpack_int64() {
    const uint64 = this.unpack_uint64();
    return uint64 < 2 ** 63 ? uint64 : uint64 - 2 ** 64;
  }
  unpack_raw(size) {
    if (this.length < this.index + size)
      throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${size} ${this.length}`);
    const buf = this.dataBuffer.slice(this.index, this.index + size);
    this.index += size;
    return buf;
  }
  unpack_string(size) {
    const bytes = this.read(size);
    let i = 0;
    let str = "";
    let c;
    let code;
    while (i < size) {
      c = bytes[i];
      if (c < 160) {
        code = c;
        i++;
      } else if ((c ^ 192) < 32) {
        code = (c & 31) << 6 | bytes[i + 1] & 63;
        i += 2;
      } else if ((c ^ 224) < 16) {
        code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
        i += 3;
      } else {
        code = (c & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
        i += 4;
      }
      str += String.fromCodePoint(code);
    }
    this.index += size;
    return str;
  }
  unpack_array(size) {
    const objects = new Array(size);
    for (let i = 0;i < size; i++)
      objects[i] = this.unpack();
    return objects;
  }
  unpack_map(size) {
    const map = {};
    for (let i = 0;i < size; i++) {
      const key = this.unpack();
      map[key] = this.unpack();
    }
    return map;
  }
  unpack_float() {
    const uint32 = this.unpack_uint32();
    const sign = uint32 >> 31;
    const exp = (uint32 >> 23 & 255) - 127;
    const fraction = uint32 & 8388607 | 8388608;
    return (sign === 0 ? 1 : -1) * fraction * 2 ** (exp - 23);
  }
  unpack_double() {
    const h32 = this.unpack_uint32();
    const l32 = this.unpack_uint32();
    const sign = h32 >> 31;
    const exp = (h32 >> 20 & 2047) - 1023;
    const hfrac = h32 & 1048575 | 1048576;
    const frac = hfrac * 2 ** (exp - 20) + l32 * 2 ** (exp - 52);
    return (sign === 0 ? 1 : -1) * frac;
  }
  read(length) {
    const j = this.index;
    if (j + length <= this.length)
      return this.dataView.subarray(j, j + length);
    else
      throw new Error("BinaryPackFailure: read index out of range");
  }
}

class $0cfd7828ad59115f$export$b9ec4b114aa40074 {
  getBuffer() {
    return this._bufferBuilder.toArrayBuffer();
  }
  pack(value) {
    if (typeof value === "string")
      this.pack_string(value);
    else if (typeof value === "number") {
      if (Math.floor(value) === value)
        this.pack_integer(value);
      else
        this.pack_double(value);
    } else if (typeof value === "boolean") {
      if (value === true)
        this._bufferBuilder.append(195);
      else if (value === false)
        this._bufferBuilder.append(194);
    } else if (value === undefined)
      this._bufferBuilder.append(192);
    else if (typeof value === "object") {
      if (value === null)
        this._bufferBuilder.append(192);
      else {
        const constructor = value.constructor;
        if (value instanceof Array) {
          const res = this.pack_array(value);
          if (res instanceof Promise)
            return res.then(() => this._bufferBuilder.flush());
        } else if (value instanceof ArrayBuffer)
          this.pack_bin(new Uint8Array(value));
        else if ("BYTES_PER_ELEMENT" in value) {
          const v = value;
          this.pack_bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
        } else if (value instanceof Date)
          this.pack_string(value.toString());
        else if (value instanceof Blob)
          return value.arrayBuffer().then((buffer) => {
            this.pack_bin(new Uint8Array(buffer));
            this._bufferBuilder.flush();
          });
        else if (constructor == Object || constructor.toString().startsWith("class")) {
          const res = this.pack_object(value);
          if (res instanceof Promise)
            return res.then(() => this._bufferBuilder.flush());
        } else
          throw new Error(`Type "${constructor.toString()}" not yet supported`);
      }
    } else
      throw new Error(`Type "${typeof value}" not yet supported`);
    this._bufferBuilder.flush();
  }
  pack_bin(blob) {
    const length = blob.length;
    if (length <= 15)
      this.pack_uint8(160 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(218);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(219);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(blob);
  }
  pack_string(str) {
    const encoded = this._textEncoder.encode(str);
    const length = encoded.length;
    if (length <= 15)
      this.pack_uint8(176 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(216);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(217);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(encoded);
  }
  pack_array(ary) {
    const length = ary.length;
    if (length <= 15)
      this.pack_uint8(144 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(220);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(221);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    const packNext = (index) => {
      if (index < length) {
        const res = this.pack(ary[index]);
        if (res instanceof Promise)
          return res.then(() => packNext(index + 1));
        return packNext(index + 1);
      }
    };
    return packNext(0);
  }
  pack_integer(num) {
    if (num >= -32 && num <= 127)
      this._bufferBuilder.append(num & 255);
    else if (num >= 0 && num <= 255) {
      this._bufferBuilder.append(204);
      this.pack_uint8(num);
    } else if (num >= -128 && num <= 127) {
      this._bufferBuilder.append(208);
      this.pack_int8(num);
    } else if (num >= 0 && num <= 65535) {
      this._bufferBuilder.append(205);
      this.pack_uint16(num);
    } else if (num >= -32768 && num <= 32767) {
      this._bufferBuilder.append(209);
      this.pack_int16(num);
    } else if (num >= 0 && num <= 4294967295) {
      this._bufferBuilder.append(206);
      this.pack_uint32(num);
    } else if (num >= -2147483648 && num <= 2147483647) {
      this._bufferBuilder.append(210);
      this.pack_int32(num);
    } else if (num >= -9223372036854776000 && num <= 9223372036854776000) {
      this._bufferBuilder.append(211);
      this.pack_int64(num);
    } else if (num >= 0 && num <= 18446744073709550000) {
      this._bufferBuilder.append(207);
      this.pack_uint64(num);
    } else
      throw new Error("Invalid integer");
  }
  pack_double(num) {
    let sign = 0;
    if (num < 0) {
      sign = 1;
      num = -num;
    }
    const exp = Math.floor(Math.log(num) / Math.LN2);
    const frac0 = num / 2 ** exp - 1;
    const frac1 = Math.floor(frac0 * 2 ** 52);
    const b32 = 2 ** 32;
    const h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
    const l32 = frac1 % b32;
    this._bufferBuilder.append(203);
    this.pack_int32(h32);
    this.pack_int32(l32);
  }
  pack_object(obj) {
    const keys = Object.keys(obj);
    const length = keys.length;
    if (length <= 15)
      this.pack_uint8(128 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(222);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(223);
      this.pack_uint32(length);
    } else
      throw new Error("Invalid length");
    const packNext = (index) => {
      if (index < keys.length) {
        const prop = keys[index];
        if (obj.hasOwnProperty(prop)) {
          this.pack(prop);
          const res = this.pack(obj[prop]);
          if (res instanceof Promise)
            return res.then(() => packNext(index + 1));
        }
        return packNext(index + 1);
      }
    };
    return packNext(0);
  }
  pack_uint8(num) {
    this._bufferBuilder.append(num);
  }
  pack_uint16(num) {
    this._bufferBuilder.append(num >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_uint32(num) {
    const n = num & 4294967295;
    this._bufferBuilder.append((n & 4278190080) >>> 24);
    this._bufferBuilder.append((n & 16711680) >>> 16);
    this._bufferBuilder.append((n & 65280) >>> 8);
    this._bufferBuilder.append(n & 255);
  }
  pack_uint64(num) {
    const high = num / 2 ** 32;
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  pack_int8(num) {
    this._bufferBuilder.append(num & 255);
  }
  pack_int16(num) {
    this._bufferBuilder.append((num & 65280) >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int32(num) {
    this._bufferBuilder.append(num >>> 24 & 255);
    this._bufferBuilder.append((num & 16711680) >>> 16);
    this._bufferBuilder.append((num & 65280) >>> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int64(num) {
    const high = Math.floor(num / 2 ** 32);
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  constructor() {
    this._bufferBuilder = new (0, $e8379818650e2442$export$93654d4f2d6cd524);
    this._textEncoder = new TextEncoder;
  }
}

// node_modules/webrtc-adapter/src/js/utils.js
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = new Map;
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback
    ]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb
    ]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap, this["_on" + eventNameToWrap]);
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap, this["_on" + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = { browser: null, version: null };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const { navigator: navigator2 } = window2;
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = extractVersion(navigator2.userAgent, /Firefox\/(\d+)\./, 1);
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = extractVersion(navigator2.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = extractVersion(navigator2.userAgent, /AppleWebKit\/(\d+)\./, 1);
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && ("currentDirection" in window2.RTCRtpTransceiver.prototype);
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
var isObject = function(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
};
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === undefined || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = new Map;
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}
var logDisabled_ = true;
var deprecationWarnings_ = true;

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var exports_chrome_shim = {};
__export(exports_chrome_shim, {
  shimSenderReceiverGetStats: () => {
    {
      return shimSenderReceiverGetStats;
    }
  },
  shimPeerConnection: () => {
    {
      return shimPeerConnection;
    }
  },
  shimOnTrack: () => {
    {
      return shimOnTrack;
    }
  },
  shimMediaStream: () => {
    {
      return shimMediaStream;
    }
  },
  shimGetUserMedia: () => {
    {
      return shimGetUserMedia;
    }
  },
  shimGetStats: () => {
    {
      return shimGetStats;
    }
  },
  shimGetSendersWithDtmf: () => {
    {
      return shimGetSendersWithDtmf;
    }
  },
  shimGetDisplayMedia: () => {
    {
      return shimGetDisplayMedia;
    }
  },
  shimAddTrackRemoveTrackWithNative: () => {
    {
      return shimAddTrackRemoveTrackWithNative;
    }
  },
  shimAddTrackRemoveTrack: () => {
    {
      return shimAddTrackRemoveTrack;
    }
  },
  fixNegotiationNeeded: () => {
    {
      return fixNegotiationNeeded;
    }
  }
});

// node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
function shimGetUserMedia(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
      if (r.exact !== undefined && typeof r.exact === "number") {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === "number") {
          oc[oldname_("min", key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a, b) {
        if ((a in obj) && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
        if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e) => Promise.reject(shimError_(e))));
    };
  }
}
var logging = log;
// node_modules/webrtc-adapter/src/js/chrome/getdisplaymedia.js
function shimGetDisplayMedia(window2, getSourceId) {
  if (window2.navigator.mediaDevices && ("getDisplayMedia" in window2.navigator.mediaDevices)) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  if (typeof getSourceId !== "function") {
    console.error("shimGetDisplayMedia: getSourceId argument is not a function");
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    return getSourceId(constraints).then((sourceId) => {
      const widthSpecified = constraints.video && constraints.video.width;
      const heightSpecified = constraints.video && constraints.video.height;
      const frameRateSpecified = constraints.video && constraints.video.frameRate;
      constraints.video = {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxFrameRate: frameRateSpecified || 3
        }
      };
      if (widthSpecified) {
        constraints.video.mandatory.maxWidth = widthSpecified;
      }
      if (heightSpecified) {
        constraints.video.mandatory.maxHeight = heightSpecified;
      }
      return window2.navigator.mediaDevices.getUserMedia(constraints);
    });
  };
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e) => {
          e.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === te.track.id);
            } else {
              receiver = { track: te.track };
            }
            const event = new Event("track");
            event.track = te.track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
          e.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === track.id);
            } else {
              receiver = { track };
            }
            const event = new Event("track");
            event.track = track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(e, "transceiver", { value: { receiver: e.receiver } });
      }
      return e;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && ("createDTMFSender" in window2.RTCPeerConnection.prototype)) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === undefined) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && ("getSenders" in window2.RTCPeerConnection.prototype) && ("createDTMFSender" in window2.RTCPeerConnection.prototype) && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === undefined) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimGetStats(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    if (arguments.length > 0 && typeof selector === "function") {
      return origGetStats.apply(this, arguments);
    }
    if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== "function")) {
      return origGetStats.apply(this, []);
    }
    const fixChromeStats_ = function(response) {
      const standardReport = {};
      const reports = response.result();
      reports.forEach((report) => {
        const standardStats = {
          id: report.id,
          timestamp: report.timestamp,
          type: {
            localcandidate: "local-candidate",
            remotecandidate: "remote-candidate"
          }[report.type] || report.type
        };
        report.names().forEach((name) => {
          standardStats[name] = report.stat(name);
        });
        standardReport[standardStats.id] = standardStats;
      });
      return standardReport;
    };
    const makeMapStats = function(stats) {
      return new Map(Object.keys(stats).map((key) => [key, stats[key]]));
    };
    if (arguments.length >= 2) {
      const successCallbackWrapper_ = function(response) {
        onSucc(makeMapStats(fixChromeStats_(response)));
      };
      return origGetStats.apply(this, [
        successCallbackWrapper_,
        selector
      ]);
    }
    return new Promise((resolve, reject) => {
      origGetStats.apply(this, [
        function(response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        },
        reject
      ]);
    }).then(onSucc, onErr);
  };
}
function shimSenderReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => filterStats(result, sender.track, true));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!(("getStats" in window2.RTCRtpSender.prototype) && ("getStats" in window2.RTCRtpReceiver.prototype))) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r) => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError"));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException("The RTCPeerConnection\'s signalingState is \'closed\'.", "InvalidStateError");
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
      throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
    }
    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException("Track already exists.", "InvalidAccessError");
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(internalStream.id, "g"), externalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(externalStream.id, "g"), internalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = { [method]() {
      const args = arguments;
      const isLegacyCall = arguments.length && typeof arguments[0] === "function";
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          },
          arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
    } };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(window2.RTCPeerConnection.prototype, "localDescription");
  Object.defineProperty(window2.RTCPeerConnection.prototype, "localDescription", {
    get() {
      const description = origLocalDescription.get.apply(this);
      if (description.type === "") {
        return description;
      }
      return replaceInternalStreamId(this, description);
    }
  });
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException("The RTCPeerConnection\'s signalingState is \'closed\'.", "InvalidStateError");
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
    const pc = e.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var exports_firefox_shim = {};
__export(exports_firefox_shim, {
  shimSenderGetStats: () => {
    {
      return shimSenderGetStats;
    }
  },
  shimRemoveStream: () => {
    {
      return shimRemoveStream;
    }
  },
  shimReceiverGetStats: () => {
    {
      return shimReceiverGetStats;
    }
  },
  shimRTCDataChannel: () => {
    {
      return shimRTCDataChannel;
    }
  },
  shimPeerConnection: () => {
    {
      return shimPeerConnection2;
    }
  },
  shimOnTrack: () => {
    {
      return shimOnTrack2;
    }
  },
  shimGetUserMedia: () => {
    {
      return shimGetUserMedia2;
    }
  },
  shimGetParameters: () => {
    {
      return shimGetParameters;
    }
  },
  shimGetDisplayMedia: () => {
    {
      return shimGetDisplayMedia2;
    }
  },
  shimCreateOffer: () => {
    {
      return shimCreateOffer;
    }
  },
  shimCreateAnswer: () => {
    {
      return shimCreateAnswer;
    }
  },
  shimAddTransceiver: () => {
    {
      return shimAddTransceiver;
    }
  }
});

// node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function shimGetUserMedia2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia");
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && ("autoGainControl" in navigator2.mediaDevices.getSupportedConstraints()))) {
    const remap = function(obj, a, b) {
      if ((a in obj) && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}
// node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function shimGetDisplayMedia2(window2, preferredMediaSource) {
  if (window2.navigator.mediaDevices && ("getDisplayMedia" in window2.navigator.mediaDevices)) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
function shimOnTrack2(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && ("receiver" in window2.RTCTrackEvent.prototype) && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimPeerConnection2(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          stats.forEach((stat, i) => {
            stats.set(i, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && ("getStats" in window2.RTCRtpSender.prototype)) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map);
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && ("getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || ("removeStream" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === undefined) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const { sender } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(sender.setParameters(params).then(() => {
            delete sender.sendEncodings;
          }).catch(() => {
            delete sender.sendEncodings;
          }));
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

// node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var exports_safari_shim = {};
__export(exports_safari_shim, {
  shimTrackEventTransceiver: () => {
    {
      return shimTrackEventTransceiver;
    }
  },
  shimRemoteStreamsAPI: () => {
    {
      return shimRemoteStreamsAPI;
    }
  },
  shimRTCIceServerUrls: () => {
    {
      return shimRTCIceServerUrls;
    }
  },
  shimLocalStreamsAPI: () => {
    {
      return shimLocalStreamsAPI;
    }
  },
  shimGetUserMedia: () => {
    {
      return shimGetUserMedia3;
    }
  },
  shimCreateOfferLegacy: () => {
    {
      return shimCreateOfferLegacy;
    }
  },
  shimConstraints: () => {
    {
      return shimConstraints;
    }
  },
  shimCallbacksAPI: () => {
    {
      return shimCallbacksAPI;
    }
  },
  shimAudioContext: () => {
    {
      return shimAudioContext;
    }
  }
});
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(this, track, stream));
      stream.getVideoTracks().forEach((track) => _addTrack.call(this, track, stream));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f);
        this.addEventListener("track", this._onaddstreampoly = (e) => {
          e.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e) {
          e.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            pc.dispatchEvent(event);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia3(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }.bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== undefined) {
    return Object.assign({}, constraints, { video: compactObject(constraints.video) });
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0;i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (server.urls === undefined && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && ("receiver" in window2.RTCTrackEvent.prototype) && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", { direction: "recvonly" });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", { direction: "recvonly" });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}

// node_modules/webrtc-adapter/src/js/common_shim.js
var exports_common_shim = {};
__export(exports_common_shim, {
  shimSendThrowTypeError: () => {
    {
      return shimSendThrowTypeError;
    }
  },
  shimRTCIceCandidateRelayProtocol: () => {
    {
      return shimRTCIceCandidateRelayProtocol;
    }
  },
  shimRTCIceCandidate: () => {
    {
      return shimRTCIceCandidate;
    }
  },
  shimParameterlessSetLocalDescription: () => {
    {
      return shimParameterlessSetLocalDescription;
    }
  },
  shimMaxMessageSize: () => {
    {
      return shimMaxMessageSize;
    }
  },
  shimConnectionState: () => {
    {
      return shimConnectionState;
    }
  },
  shimAddIceCandidateNullOrEmpty: () => {
    {
      return shimAddIceCandidateNullOrEmpty;
    }
  },
  removeExtmapAllowMixed: () => {
    {
      return removeExtmapAllowMixed;
    }
  }
});
var import_sdp = __toESM(require_sdp(), 1);
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && ("foundation" in window2.RTCIceCandidate.prototype)) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(nativeCandidate, key, { value: parsedCandidate[key] });
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window2.RTCIceCandidate(e.candidate),
        writable: "false"
      });
    }
    return e;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && ("relayProtocol" in window2.RTCIceCandidate.prototype)) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      const parsedCandidate = import_sdp.default.parseCandidate(e.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = import_sdp.default.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = import_sdp.default.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    return version !== version ? -1 : version;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = import_sdp.default.matchPrefix(description.sdp, "a=max-message-size:");
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const { sdpSemantics } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2) {
  if (!(window2.RTCPeerConnection && ("createDataChannel" in window2.RTCPeerConnection.prototype))) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || ("connectionState" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener("connectionstatechange", this._onconnectionstatechange);
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener("connectionstatechange", this._onconnectionstatechange = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly);
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp
        });
      } else {
        desc.sdp = sdp;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = { type: desc.type, sdp: desc.sdp };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d) => nativeSetLocalDescription.apply(this, [d]));
  };
}

// node_modules/webrtc-adapter/src/js/adapter_factory.js
var sdp = __toESM(require_sdp(), 1);
function adapterFactory({ window: window2 } = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log;
  const browserDetails = detectBrowser(window2);
  const adapter = {
    browserDetails,
    commonShim: exports_common_shim,
    extractVersion,
    disableLog,
    disableWarnings,
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!exports_chrome_shim || !shimPeerConnection || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter;
      }
      logging2("adapter.js shimming chrome.");
      adapter.browserShim = exports_chrome_shim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia(window2, browserDetails);
      shimMediaStream(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2, browserDetails);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2, browserDetails);
      shimGetStats(window2, browserDetails);
      shimSenderReceiverGetStats(window2, browserDetails);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!exports_firefox_shim || !shimPeerConnection2 || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter;
      }
      logging2("adapter.js shimming firefox.");
      adapter.browserShim = exports_firefox_shim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia2(window2, browserDetails);
      shimPeerConnection2(window2, browserDetails);
      shimOnTrack2(window2, browserDetails);
      shimRemoveStream(window2, browserDetails);
      shimSenderGetStats(window2, browserDetails);
      shimReceiverGetStats(window2, browserDetails);
      shimRTCDataChannel(window2, browserDetails);
      shimAddTransceiver(window2, browserDetails);
      shimGetParameters(window2, browserDetails);
      shimCreateOffer(window2, browserDetails);
      shimCreateAnswer(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      break;
    case "safari":
      if (!exports_safari_shim || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter;
      }
      logging2("adapter.js shimming safari.");
      adapter.browserShim = exports_safari_shim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimRTCIceServerUrls(window2, browserDetails);
      shimCreateOfferLegacy(window2, browserDetails);
      shimCallbacksAPI(window2, browserDetails);
      shimLocalStreamsAPI(window2, browserDetails);
      shimRemoteStreamsAPI(window2, browserDetails);
      shimTrackEventTransceiver(window2, browserDetails);
      shimGetUserMedia3(window2, browserDetails);
      shimAudioContext(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter;
}

// node_modules/webrtc-adapter/src/js/adapter_core.js
var adapter = adapterFactory({ window: typeof window === "undefined" ? undefined : window });
var adapter_core_default = adapter;

// node_modules/cbor-x/decode.js
function checkedRead() {
  try {
    let result = read();
    if (bundledStrings) {
      if (position >= bundledStrings.postBundlePosition) {
        let error6 = new Error("Unexpected bundle position");
        error6.incomplete = true;
        throw error6;
      }
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (position == srcEnd) {
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      let error6 = new Error("Unexpected end of CBOR data");
      error6.incomplete = true;
      throw error6;
    } else if (!sequentialMode) {
      throw new Error("Data read, but end of buffer not reached");
    }
    return result;
  } catch (error6) {
    clearSource();
    if (error6 instanceof RangeError || error6.message.startsWith("Unexpected end of buffer")) {
      error6.incomplete = true;
    }
    throw error6;
  }
}
function read() {
  let token = src[position++];
  let majorType = token >> 5;
  token = token & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        if (majorType == 7) {
          return getFloat16();
        }
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        if (majorType == 7) {
          let value = dataView.getFloat32(position);
          if (currentDecoder.useFloat32 > 2) {
            let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
            position += 4;
            return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
          }
          position += 4;
          return value;
        }
        token = dataView.getUint32(position);
        position += 4;
        break;
      case 27:
        if (majorType == 7) {
          let value = dataView.getFloat64(position);
          position += 8;
          return value;
        }
        if (majorType > 1) {
          if (dataView.getUint32(position) > 0)
            throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
          token = dataView.getUint32(position + 4);
        } else if (currentDecoder.int64AsNumber) {
          token = dataView.getUint32(position) * 4294967296;
          token += dataView.getUint32(position + 4);
        } else
          token = dataView.getBigUint64(position);
        position += 8;
        break;
      case 31:
        switch (majorType) {
          case 2:
          case 3:
            throw new Error("Indefinite length not supported for byte or text strings");
          case 4:
            let array = [];
            let value, i = 0;
            while ((value = read()) != STOP_CODE) {
              array[i++] = value;
            }
            return majorType == 4 ? array : majorType == 3 ? array.join("") : Buffer.concat(array);
          case 5:
            let key;
            if (currentDecoder.mapsAsObjects) {
              let object = {};
              if (currentDecoder.keyMap)
                while ((key = read()) != STOP_CODE)
                  object[safeKey(currentDecoder.decodeKey(key))] = read();
              else
                while ((key = read()) != STOP_CODE)
                  object[safeKey(key)] = read();
              return object;
            } else {
              if (restoreMapsAsObject) {
                currentDecoder.mapsAsObjects = true;
                restoreMapsAsObject = false;
              }
              let map = new Map;
              if (currentDecoder.keyMap)
                while ((key = read()) != STOP_CODE)
                  map.set(currentDecoder.decodeKey(key), read());
              else
                while ((key = read()) != STOP_CODE)
                  map.set(key, read());
              return map;
            }
          case 7:
            return STOP_CODE;
          default:
            throw new Error("Invalid major type for indefinite length " + majorType);
        }
      default:
        throw new Error("Unknown token " + token);
    }
  }
  switch (majorType) {
    case 0:
      return token;
    case 1:
      return ~token;
    case 2:
      return readBin(token);
    case 3:
      if (srcStringEnd >= position) {
        return srcString.slice(position - srcStringStart, (position += token) - srcStringStart);
      }
      if (srcStringEnd == 0 && srcEnd < 140 && token < 32) {
        let string = token < 16 ? shortStringInJS(token) : longStringInJS(token);
        if (string != null)
          return string;
      }
      return readFixedString(token);
    case 4:
      let array = new Array(token);
      for (let i = 0;i < token; i++)
        array[i] = read();
      return array;
    case 5:
      if (currentDecoder.mapsAsObjects) {
        let object = {};
        if (currentDecoder.keyMap)
          for (let i = 0;i < token; i++)
            object[safeKey(currentDecoder.decodeKey(read()))] = read();
        else
          for (let i = 0;i < token; i++)
            object[safeKey(read())] = read();
        return object;
      } else {
        if (restoreMapsAsObject) {
          currentDecoder.mapsAsObjects = true;
          restoreMapsAsObject = false;
        }
        let map = new Map;
        if (currentDecoder.keyMap)
          for (let i = 0;i < token; i++)
            map.set(currentDecoder.decodeKey(read()), read());
        else
          for (let i = 0;i < token; i++)
            map.set(read(), read());
        return map;
      }
    case 6:
      if (token >= BUNDLED_STRINGS_ID) {
        let structure = currentStructures[token & 8191];
        if (structure) {
          if (!structure.read)
            structure.read = createStructureReader(structure);
          return structure.read();
        }
        if (token < 65536) {
          if (token == RECORD_INLINE_ID) {
            let length = readJustLength();
            let id = read();
            let structure2 = read();
            recordDefinition(id, structure2);
            let object = {};
            if (currentDecoder.keyMap)
              for (let i = 2;i < length; i++) {
                let key = currentDecoder.decodeKey(structure2[i - 2]);
                object[safeKey(key)] = read();
              }
            else
              for (let i = 2;i < length; i++) {
                let key = structure2[i - 2];
                object[safeKey(key)] = read();
              }
            return object;
          } else if (token == RECORD_DEFINITIONS_ID) {
            let length = readJustLength();
            let id = read();
            for (let i = 2;i < length; i++) {
              recordDefinition(id++, read());
            }
            return read();
          } else if (token == BUNDLED_STRINGS_ID) {
            return readBundleExt();
          }
          if (currentDecoder.getShared) {
            loadShared();
            structure = currentStructures[token & 8191];
            if (structure) {
              if (!structure.read)
                structure.read = createStructureReader(structure);
              return structure.read();
            }
          }
        }
      }
      let extension = currentExtensions[token];
      if (extension) {
        if (extension.handlesRead)
          return extension(read);
        else
          return extension(read());
      } else {
        let input = read();
        for (let i = 0;i < currentExtensionRanges.length; i++) {
          let value = currentExtensionRanges[i](token, input);
          if (value !== undefined)
            return value;
        }
        return new Tag(input, token);
      }
    case 7:
      switch (token) {
        case 20:
          return false;
        case 21:
          return true;
        case 22:
          return null;
        case 23:
          return;
        case 31:
        default:
          let packedValue = (packedValues || getPackedValues())[token];
          if (packedValue !== undefined)
            return packedValue;
          throw new Error("Unknown token " + token);
      }
    default:
      if (isNaN(token)) {
        let error6 = new Error("Unexpected end of CBOR data");
        error6.incomplete = true;
        throw error6;
      }
      throw new Error("Unknown CBOR token " + token);
  }
}
var createStructureReader = function(structure) {
  function readObject() {
    let length = src[position++];
    length = length & 31;
    if (length > 23) {
      switch (length) {
        case 24:
          length = src[position++];
          break;
        case 25:
          length = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          length = dataView.getUint32(position);
          position += 4;
          break;
        default:
          throw new Error("Expected array header, but got " + src[position - 1]);
      }
    }
    let compiledReader = this.compiledReader;
    while (compiledReader) {
      if (compiledReader.propertyCount === length)
        return compiledReader(read);
      compiledReader = compiledReader.next;
    }
    if (this.slowReads++ >= inlineObjectReadThreshold) {
      let array = this.length == length ? this : this.slice(0, length);
      compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k) => currentDecoder.decodeKey(k)).map((k) => validName.test(k) ? safeKey(k) + ":r()" : "[" + JSON.stringify(k) + "]:r()").join(",") + "}") : new Function("r", "return {" + array.map((key) => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}");
      if (this.compiledReader)
        compiledReader.next = this.compiledReader;
      compiledReader.propertyCount = length;
      this.compiledReader = compiledReader;
      return compiledReader(read);
    }
    let object = {};
    if (currentDecoder.keyMap)
      for (let i = 0;i < length; i++)
        object[safeKey(currentDecoder.decodeKey(this[i]))] = read();
    else
      for (let i = 0;i < length; i++) {
        object[safeKey(this[i])] = read();
      }
    return object;
  }
  structure.slowReads = 0;
  return readObject;
};
var safeKey = function(key) {
  return key === "__proto__" ? "__proto_" : key;
};
var readStringJS = function(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
};
var longStringInJS = function(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0;i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
};
var shortStringInJS = function(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
};
var readBin = function(length) {
  return currentDecoder.copyBuffers ? Uint8Array.prototype.slice.call(src, position, position += length) : src.subarray(position, position += length);
};
var getFloat16 = function() {
  let byte0 = src[position++];
  let byte1 = src[position++];
  let exponent = (byte0 & 127) >> 2;
  if (exponent === 31) {
    if (byte1 || byte0 & 3)
      return NaN;
    return byte0 & 128 ? (-Infinity) : Infinity;
  }
  if (exponent === 0) {
    let abs = ((byte0 & 3) << 8 | byte1) / (1 << 24);
    return byte0 & 128 ? -abs : abs;
  }
  u8Array[3] = byte0 & 128 | (exponent >> 1) + 56;
  u8Array[2] = (byte0 & 7) << 5 | byte1 >> 3;
  u8Array[1] = byte1 << 5;
  u8Array[0] = 0;
  return f32Array[0];
};
var combine = function(a, b) {
  if (typeof a === "string")
    return a + b;
  if (a instanceof Array)
    return a.concat(b);
  return Object.assign({}, a, b);
};
var getPackedValues = function() {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      throw new Error("No packed values available");
  }
  return packedValues;
};
var registerTypedArray = function(TypedArray, tag) {
  let dvMethod = "get" + TypedArray.name.slice(0, -5);
  let bytesPerElement;
  if (typeof TypedArray === "function")
    bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
  else
    TypedArray = null;
  for (let littleEndian = 0;littleEndian < 2; littleEndian++) {
    if (!littleEndian && bytesPerElement == 1)
      continue;
    let sizeShift = bytesPerElement == 2 ? 1 : bytesPerElement == 4 ? 2 : 3;
    currentExtensions[littleEndian ? tag : tag - 4] = bytesPerElement == 1 || littleEndian == isLittleEndianMachine ? (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
    } : (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      let elements = buffer.length >> sizeShift;
      let ta = new TypedArray(elements);
      let method = dv[dvMethod];
      for (let i = 0;i < elements; i++) {
        ta[i] = method.call(dv, i << sizeShift, littleEndian);
      }
      return ta;
    };
  }
};
var readBundleExt = function() {
  let length = readJustLength();
  let bundlePosition = position + read();
  for (let i = 2;i < length; i++) {
    let bundleLength = readJustLength();
    position += bundleLength;
  }
  let dataPosition = position;
  position = bundlePosition;
  bundledStrings = [readStringJS(readJustLength()), readStringJS(readJustLength())];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
};
var readJustLength = function() {
  let token = src[position++] & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        token = dataView.getUint32(position);
        position += 4;
        break;
    }
  }
  return token;
};
var loadShared = function() {
  if (currentDecoder.getShared) {
    let sharedData = saveState(() => {
      src = null;
      return currentDecoder.getShared();
    }) || {};
    let updatedStructures = sharedData.structures || [];
    currentDecoder.sharedVersion = sharedData.version;
    packedValues = currentDecoder.sharedValues = sharedData.packedValues;
    if (currentStructures === true)
      currentDecoder.structures = currentStructures = updatedStructures;
    else
      currentStructures.splice.apply(currentStructures, [0, updatedStructures.length].concat(updatedStructures));
  }
};
var saveState = function(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedDecoder = currentDecoder;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentDecoder = savedDecoder;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
};
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
var decoder;
try {
  decoder = new TextDecoder;
} catch (error6) {
}
var src;
var srcEnd;
var position = 0;
var EMPTY_ARRAY = [];
var LEGACY_RECORD_INLINE_ID = 105;
var RECORD_DEFINITIONS_ID = 57342;
var RECORD_INLINE_ID = 57343;
var BUNDLED_STRINGS_ID = 57337;
var PACKED_REFERENCE_TAG_ID = 6;
var STOP_CODE = {};
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentDecoder = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var currentExtensionRanges = [];
var packedValues;
var dataView;
var restoreMapsAsObject;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
try {
  new Function("");
} catch (error6) {
  inlineObjectReadThreshold = Infinity;
}

class Decoder {
  constructor(options) {
    if (options) {
      if ((options.keyMap || options._keyMap) && !options.useRecords) {
        options.useRecords = false;
        options.mapsAsObjects = true;
      }
      if (options.useRecords === false && options.mapsAsObjects === undefined)
        options.mapsAsObjects = true;
      if (options.getStructures)
        options.getShared = options.getStructures;
      if (options.getShared && !options.structures)
        (options.structures = []).uninitialized = true;
      if (options.keyMap) {
        this.mapKey = new Map;
        for (let [k, v] of Object.entries(options.keyMap))
          this.mapKey.set(v, k);
      }
    }
    Object.assign(this, options);
  }
  decodeKey(key) {
    return this.keyMap ? this.mapKey.get(key) || key : key;
  }
  encodeKey(key) {
    return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
  }
  encodeKeys(rec) {
    if (!this._keyMap)
      return rec;
    let map = new Map;
    for (let [k, v] of Object.entries(rec))
      map.set(this._keyMap.hasOwnProperty(k) ? this._keyMap[k] : k, v);
    return map;
  }
  decodeKeys(map) {
    if (!this._keyMap || map.constructor.name != "Map")
      return map;
    if (!this._mapKey) {
      this._mapKey = new Map;
      for (let [k, v] of Object.entries(this._keyMap))
        this._mapKey.set(v, k);
    }
    let res = {};
    map.forEach((v, k) => res[safeKey(this._mapKey.has(k) ? this._mapKey.get(k) : k)] = v);
    return res;
  }
  mapDecode(source, end) {
    let res = this.decode(source);
    if (this._keyMap) {
      switch (res.constructor.name) {
        case "Array":
          return res.map((r) => this.decodeKeys(r));
      }
    }
    return res;
  }
  decode(source, end) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.decode(source, end) : Decoder.prototype.decode.call(defaultOptions, source, end);
      });
    }
    srcEnd = end > -1 ? end : source.length;
    position = 0;
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error6) {
      src = null;
      if (source instanceof Uint8Array)
        throw error6;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof Decoder) {
      currentDecoder = this;
      packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues);
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead();
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentDecoder = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
      packedValues = null;
    }
    return checkedRead();
  }
  decodeMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      let size = source.length;
      sequentialMode = true;
      let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
      if (forEach) {
        if (forEach(value) === false) {
          return;
        }
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead()) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error6) {
      error6.lastPosition = lastPosition;
      error6.values = values;
      throw error6;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
var readFixedString = readStringJS;
var fromCharCode = String.fromCharCode;
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
var keyCache = new Array(4096);

class Tag {
  constructor(value, tag) {
    this.value = value;
    this.tag = tag;
  }
}
currentExtensions[0] = (dateString) => {
  return new Date(dateString);
};
currentExtensions[1] = (epochSec) => {
  return new Date(Math.round(epochSec * 1000));
};
currentExtensions[2] = (buffer) => {
  let value = BigInt(0);
  for (let i = 0, l = buffer.byteLength;i < l; i++) {
    value = BigInt(buffer[i]) + value << BigInt(8);
  }
  return value;
};
currentExtensions[3] = (buffer) => {
  return BigInt(-1) - currentExtensions[2](buffer);
};
currentExtensions[4] = (fraction) => {
  return +(fraction[1] + "e" + fraction[0]);
};
currentExtensions[5] = (fraction) => {
  return fraction[1] * Math.exp(fraction[0] * Math.log(2));
};
var recordDefinition = (id, structure) => {
  id = id - 57344;
  let existingStructure = currentStructures[id];
  if (existingStructure && existingStructure.isShared) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure);
};
currentExtensions[LEGACY_RECORD_INLINE_ID] = (data) => {
  let length = data.length;
  let structure = data[1];
  recordDefinition(data[0], structure);
  let object = {};
  for (let i = 2;i < length; i++) {
    let key = structure[i - 2];
    object[safeKey(key)] = data[i];
  }
  return object;
};
currentExtensions[14] = (value) => {
  if (bundledStrings)
    return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 += value);
  return new Tag(value, 14);
};
currentExtensions[15] = (value) => {
  if (bundledStrings)
    return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
  return new Tag(value, 15);
};
var glbl = { Error, RegExp };
currentExtensions[27] = (data) => {
  return (glbl[data[0]] || Error)(data[1], data[2]);
};
var packedTable = (read2) => {
  if (src[position++] != 132)
    throw new Error("Packed values structure must be followed by a 4 element array");
  let newPackedValues = read2();
  packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues;
  packedValues.prefixes = read2();
  packedValues.suffixes = read2();
  return read2();
};
packedTable.handlesRead = true;
currentExtensions[51] = packedTable;
currentExtensions[PACKED_REFERENCE_TAG_ID] = (data) => {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      return new Tag(data, PACKED_REFERENCE_TAG_ID);
  }
  if (typeof data == "number")
    return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
  throw new Error("No support for non-integer packed references yet");
};
currentExtensions[28] = (read2) => {
  if (!referenceMap) {
    referenceMap = new Map;
    referenceMap.id = 0;
  }
  let id = referenceMap.id++;
  let token = src[position];
  let target;
  if (token >> 5 == 4)
    target = [];
  else
    target = {};
  let refEntry = { target };
  referenceMap.set(id, refEntry);
  let targetProperties = read2();
  if (refEntry.used)
    return Object.assign(target, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[28].handlesRead = true;
currentExtensions[29] = (id) => {
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[258] = (array) => new Set(array);
(currentExtensions[259] = (read2) => {
  if (currentDecoder.mapsAsObjects) {
    currentDecoder.mapsAsObjects = false;
    restoreMapsAsObject = true;
  }
  return read2();
}).handlesRead = true;
var SHARED_DATA_TAG_ID = 1399353956;
currentExtensionRanges.push((tag, input) => {
  if (tag >= 225 && tag <= 255)
    return combine(getPackedValues().prefixes[tag - 224], input);
  if (tag >= 28704 && tag <= 32767)
    return combine(getPackedValues().prefixes[tag - 28672], input);
  if (tag >= 1879052288 && tag <= 2147483647)
    return combine(getPackedValues().prefixes[tag - 1879048192], input);
  if (tag >= 216 && tag <= 223)
    return combine(input, getPackedValues().suffixes[tag - 216]);
  if (tag >= 27647 && tag <= 28671)
    return combine(input, getPackedValues().suffixes[tag - 27639]);
  if (tag >= 1811940352 && tag <= 1879048191)
    return combine(input, getPackedValues().suffixes[tag - 1811939328]);
  if (tag == SHARED_DATA_TAG_ID) {
    return {
      packedValues,
      structures: currentStructures.slice(0),
      version: input
    };
  }
  if (tag == 55799)
    return input;
});
var isLittleEndianMachine = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
var typedArrays = [
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? { name: "BigUint64Array" } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? { name: "BigInt64Array" } : BigInt64Array,
  Float32Array,
  Float64Array
];
var typedArrayTags = [64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86];
for (let i = 0;i < typedArrays.length; i++) {
  registerTypedArray(typedArrays[i], typedArrayTags[i]);
}
var mult10 = new Array(147);
for (let i = 0;i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var defaultDecoder = new Decoder({ useRecords: false });
var decode = defaultDecoder.decode;
var decodeMultiple = defaultDecoder.decodeMultiple;

// node_modules/cbor-x/encode.js
var writeEntityLength = function(length, majorValue) {
  if (length < 24)
    target[position2++] = majorValue | length;
  else if (length < 256) {
    target[position2++] = majorValue | 24;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = majorValue | 25;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = majorValue | 26;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
};
var writeArrayHeader = function(length) {
  if (length < 24)
    target[position2++] = 128 | length;
  else if (length < 256) {
    target[position2++] = 152;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 153;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 154;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
};
var isBlob = function(object) {
  if (object instanceof BlobConstructor)
    return true;
  let tag = object[Symbol.toStringTag];
  return tag === "Blob" || tag === "File";
};
var findRepetitiveStrings = function(value, packedValues2) {
  switch (typeof value) {
    case "string":
      if (value.length > 3) {
        if (packedValues2.objectMap[value] > -1 || packedValues2.values.length >= packedValues2.maxValues)
          return;
        let packedStatus = packedValues2.get(value);
        if (packedStatus) {
          if (++packedStatus.count == 2) {
            packedValues2.values.push(value);
          }
        } else {
          packedValues2.set(value, {
            count: 1
          });
          if (packedValues2.samplingPackedValues) {
            let status = packedValues2.samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              packedValues2.samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
      }
      break;
    case "object":
      if (value) {
        if (value instanceof Array) {
          for (let i = 0, l = value.length;i < l; i++) {
            findRepetitiveStrings(value[i], packedValues2);
          }
        } else {
          let includeKeys = !packedValues2.encoder.useRecords;
          for (var key in value) {
            if (value.hasOwnProperty(key)) {
              if (includeKeys)
                findRepetitiveStrings(key, packedValues2);
              findRepetitiveStrings(value[key], packedValues2);
            }
          }
        }
      }
      break;
    case "function":
      console.log(value);
  }
};
var typedArrayEncoder = function(tag, size) {
  if (!isLittleEndianMachine2 && size > 1)
    tag -= 4;
  return {
    tag,
    encode: function writeExtBuffer(typedArray, encode) {
      let length = typedArray.byteLength;
      let offset = typedArray.byteOffset || 0;
      let buffer = typedArray.buffer || typedArray;
      encode(hasNodeBuffer ? Buffer2.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
    }
  };
};
var writeBuffer = function(buffer, makeRoom) {
  let length = buffer.byteLength;
  if (length < 24) {
    target[position2++] = 64 + length;
  } else if (length < 256) {
    target[position2++] = 88;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 89;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 90;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
  if (position2 + length >= target.length) {
    makeRoom(position2 + length);
  }
  target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position2);
  position2 += length;
};
var insertIds = function(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 2;
  let lastEnd = serialized.length - distanceToMove;
  idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
  for (let id = 0;id < idsToInsert.length; id++) {
    let referee = idsToInsert[id];
    referee.id = id;
    for (let position2 of referee.references) {
      serialized[position2++] = id >> 8;
      serialized[position2] = id & 255;
    }
  }
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 2;
    let position2 = offset + distanceToMove;
    serialized[position2++] = 216;
    serialized[position2++] = 28;
    lastEnd = offset;
  }
  return serialized;
};
var writeBundles = function(start, encode) {
  targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start + 1);
  let writeStrings = bundledStrings2;
  bundledStrings2 = null;
  encode(writeStrings[0]);
  encode(writeStrings[1]);
};
var textEncoder;
try {
  textEncoder = new TextEncoder;
} catch (error6) {
}
var extensions;
var extensionClasses;
var Buffer2 = typeof globalThis === "object" && globalThis.Buffer;
var hasNodeBuffer = typeof Buffer2 !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? Buffer2.allocUnsafeSlow : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer2 : Uint8Array;
var MAX_STRUCTURES = 256;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var throwOnIterable;
var target;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var MAX_BUNDLE_SIZE = 61440;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");

class Encoder extends Decoder {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let sharedStructures;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    options = options || {};
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3, maxBytes) {
      return target.utf8Write(string, position3, maxBytes);
    } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
      return textEncoder.encodeInto(string, target.subarray(position3)).written;
    } : false;
    let encoder = this;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 128 : 0;
    if (maxSharedStructures > 8190)
      throw new Error("Maximum maxSharedStructure is 8190");
    let isSequential = options.sequential;
    if (isSequential) {
      maxSharedStructures = 0;
    }
    if (!this.structures)
      this.structures = [];
    if (this.saveStructures)
      this.saveShared = this.saveStructures;
    let samplingPackedValues, packedObjectMap2, sharedValues = options.sharedValues;
    let sharedPackedObjectMap2;
    if (sharedValues) {
      sharedPackedObjectMap2 = Object.create(null);
      for (let i = 0, l = sharedValues.length;i < l; i++) {
        sharedPackedObjectMap2[sharedValues[i]] = i;
      }
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.mapEncode = function(value, encodeOptions) {
      if (this._keyMap && !this._mapped) {
        switch (value.constructor.name) {
          case "Array":
            value = value.map((r) => this.encodeKeys(r));
            break;
        }
      }
      return this.encode(value, encodeOptions);
    };
    this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = new DataView(target.buffer, 0, 8192);
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = new DataView(target.buffer, 0, target.length);
        safeEnd = target.length - 10;
        position2 = 0;
      } else if (encodeOptions === REUSE_BUFFER_MODE)
        position2 = position2 + 7 & 2147483640;
      start = position2;
      if (encoder.useSelfDescribedHeader) {
        targetView.setUint32(position2, 3654940416);
        position2 += 3;
      }
      referenceMap2 = encoder.structuredClone ? new Map : null;
      if (encoder.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      sharedStructures = encoder.structures;
      if (sharedStructures) {
        if (sharedStructures.uninitialized) {
          let sharedData = encoder.getShared() || {};
          encoder.structures = sharedStructures = sharedData.structures || [];
          encoder.sharedVersion = sharedData.version;
          let sharedValues2 = encoder.sharedValues = sharedData.packedValues;
          if (sharedValues2) {
            sharedPackedObjectMap2 = {};
            for (let i = 0, l = sharedValues2.length;i < l; i++)
              sharedPackedObjectMap2[sharedValues2[i]] = i;
          }
        }
        let sharedStructuresLength = sharedStructures.length;
        if (sharedStructuresLength > maxSharedStructures && !isSequential)
          sharedStructuresLength = maxSharedStructures;
        if (!sharedStructures.transitions) {
          sharedStructures.transitions = Object.create(null);
          for (let i = 0;i < sharedStructuresLength; i++) {
            let keys = sharedStructures[i];
            if (!keys)
              continue;
            let nextTransition, transition = sharedStructures.transitions;
            for (let j = 0, l = keys.length;j < l; j++) {
              if (transition[RECORD_SYMBOL] === undefined)
                transition[RECORD_SYMBOL] = i;
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i | 1048576;
          }
        }
        if (!isSequential)
          sharedStructures.nextId = sharedStructuresLength;
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      structures = sharedStructures || [];
      packedObjectMap2 = sharedPackedObjectMap2;
      if (options.pack) {
        let packedValues2 = new Map;
        packedValues2.values = [];
        packedValues2.encoder = encoder;
        packedValues2.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap2 ? 16 : Infinity);
        packedValues2.objectMap = sharedPackedObjectMap2 || false;
        packedValues2.samplingPackedValues = samplingPackedValues;
        findRepetitiveStrings(value, packedValues2);
        if (packedValues2.values.length > 0) {
          target[position2++] = 216;
          target[position2++] = 51;
          writeArrayHeader(4);
          let valuesArray = packedValues2.values;
          encode(valuesArray);
          writeArrayHeader(0);
          writeArrayHeader(0);
          packedObjectMap2 = Object.create(sharedPackedObjectMap2 || null);
          for (let i = 0, l = valuesArray.length;i < l; i++) {
            packedObjectMap2[valuesArray[i]] = i;
          }
        }
      }
      throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
      try {
        if (throwOnIterable)
          return;
        encode(value);
        if (bundledStrings2) {
          writeBundles(start, encode);
        }
        encoder.offset = position2;
        if (referenceMap2 && referenceMap2.idsToInsert) {
          position2 += referenceMap2.idsToInsert.length * 2;
          if (position2 > safeEnd)
            makeRoom(position2);
          encoder.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } finally {
        if (sharedStructures) {
          if (serializationsSinceTransitionRebuild < 10)
            serializationsSinceTransitionRebuild++;
          if (sharedStructures.length > maxSharedStructures)
            sharedStructures.length = maxSharedStructures;
          if (transitionsCount > 1e4) {
            sharedStructures.transitions = null;
            serializationsSinceTransitionRebuild = 0;
            transitionsCount = 0;
            if (recordIdsToRemove.length > 0)
              recordIdsToRemove = [];
          } else if (recordIdsToRemove.length > 0 && !isSequential) {
            for (let i = 0, l = recordIdsToRemove.length;i < l; i++) {
              recordIdsToRemove[i][RECORD_SYMBOL] = undefined;
            }
            recordIdsToRemove = [];
          }
        }
        if (hasSharedUpdate && encoder.saveShared) {
          if (encoder.structures.length > maxSharedStructures) {
            encoder.structures = encoder.structures.slice(0, maxSharedStructures);
          }
          let returnBuffer = target.subarray(start, position2);
          if (encoder.updateSharedData() === false)
            return encoder.encode(value);
          return returnBuffer;
        }
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    this.findCommonStringsToPack = () => {
      samplingPackedValues = new Map;
      if (!sharedPackedObjectMap2)
        sharedPackedObjectMap2 = Object.create(null);
      return (options2) => {
        let threshold = options2 && options2.threshold || 4;
        let position3 = this.pack ? options2.maxPrivatePackedValues || 16 : 0;
        if (!sharedValues)
          sharedValues = this.sharedValues = [];
        for (let [key, status] of samplingPackedValues) {
          if (status.count > threshold) {
            sharedPackedObjectMap2[key] = position3++;
            sharedValues.push(key);
            hasSharedUpdate = true;
          }
        }
        while (this.saveShared && this.updateSharedData() === false) {
        }
        samplingPackedValues = null;
      };
    };
    const encode = (value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type = typeof value;
      var length;
      if (type === "string") {
        if (packedObjectMap2) {
          let packedPosition = packedObjectMap2[value];
          if (packedPosition >= 0) {
            if (packedPosition < 16)
              target[position2++] = packedPosition + 224;
            else {
              target[position2++] = 198;
              if (packedPosition & 1)
                encode(15 - packedPosition >> 1);
              else
                encode(packedPosition - 16 >> 1);
            }
            return;
          } else if (samplingPackedValues && !options.pack) {
            let status = samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 1024) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            target[position2++] = 217;
            target[position2++] = 223;
            target[position2++] = 249;
            target[position2++] = bundledStrings2.position ? 132 : 130;
            target[position2++] = 26;
            extStart = position2 - start;
            position2 += 4;
            if (bundledStrings2.position) {
              writeBundles(start, encode);
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = twoByte ? 206 : 207;
          encode(strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c2, strPosition = position2 + headerSize;
          for (i = 0;i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf8(value, position2 + headerSize, maxBytes);
        }
        if (length < 24) {
          target[position2++] = 96 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 120;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 121;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 122;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type === "number") {
        if (!this.alwaysUseFloat && value >>> 0 === value) {
          if (value < 24) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 24;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 25;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 26;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (!this.alwaysUseFloat && value >> 0 === value) {
          if (value >= -24) {
            target[position2++] = 31 - value;
          } else if (value >= -256) {
            target[position2++] = 56;
            target[position2++] = ~value;
          } else if (value >= -65536) {
            target[position2++] = 57;
            targetView.setUint16(position2, ~value);
            position2 += 2;
          } else {
            target[position2++] = 58;
            targetView.setUint32(position2, ~value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 250;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 251;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type === "object") {
        if (!value)
          target[position2++] = 246;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              target[position2++] = 216;
              target[position2++] = 29;
              target[position2++] = 25;
              if (!referee.references) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.references = [];
                idsToInsert.push(referee);
              }
              referee.references.push(position2 - start);
              position2 += 2;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value, true);
          } else if (constructor === Array) {
            length = value.length;
            if (length < 24) {
              target[position2++] = 128 | length;
            } else {
              writeArrayHeader(length);
            }
            for (let i = 0;i < length; i++) {
              encode(value[i]);
            }
          } else if (constructor === Map) {
            if (this.mapsAsObjects ? this.useTag259ForMaps !== false : this.useTag259ForMaps) {
              target[position2++] = 217;
              target[position2++] = 1;
              target[position2++] = 3;
            }
            length = value.size;
            if (length < 24) {
              target[position2++] = 160 | length;
            } else if (length < 256) {
              target[position2++] = 184;
              target[position2++] = length;
            } else if (length < 65536) {
              target[position2++] = 185;
              target[position2++] = length >> 8;
              target[position2++] = length & 255;
            } else {
              target[position2++] = 186;
              targetView.setUint32(position2, length);
              position2 += 4;
            }
            if (encoder.keyMap) {
              for (let [key, entryValue] of value) {
                encode(encoder.encodeKey(key));
                encode(entryValue);
              }
            } else {
              for (let [key, entryValue] of value) {
                encode(key);
                encode(entryValue);
              }
            }
          } else {
            for (let i = 0, l = extensions.length;i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                let tag = extension.tag;
                if (tag == undefined)
                  tag = extension.getTag && extension.getTag.call(this, value);
                if (tag < 24) {
                  target[position2++] = 192 | tag;
                } else if (tag < 256) {
                  target[position2++] = 216;
                  target[position2++] = tag;
                } else if (tag < 65536) {
                  target[position2++] = 217;
                  target[position2++] = tag >> 8;
                  target[position2++] = tag & 255;
                } else if (tag > -1) {
                  target[position2++] = 218;
                  targetView.setUint32(position2, tag);
                  position2 += 4;
                }
                extension.encode.call(this, value, encode, makeRoom);
                return;
              }
            }
            if (value[Symbol.iterator]) {
              if (throwOnIterable) {
                let error6 = new Error("Iterable should be serialized as iterator");
                error6.iteratorNotHandled = true;
                throw error6;
              }
              target[position2++] = 159;
              for (let entry of value) {
                encode(entry);
              }
              target[position2++] = 255;
              return;
            }
            if (value[Symbol.asyncIterator] || isBlob(value)) {
              let error6 = new Error("Iterable/blob should be serialized as iterator");
              error6.iteratorNotHandled = true;
              throw error6;
            }
            if (this.useToJSON && value.toJSON) {
              const json = value.toJSON();
              if (json !== value)
                return encode(json);
            }
            writeObject(value, !value.hasOwnProperty);
          }
        }
      } else if (type === "boolean") {
        target[position2++] = value ? 245 : 244;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(64) && value >= 0) {
          target[position2++] = 27;
          targetView.setBigUint64(position2, value);
        } else if (value > -(BigInt(1) << BigInt(64)) && value < 0) {
          target[position2++] = 59;
          targetView.setBigUint64(position2, -value - BigInt(1));
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 251;
            targetView.setFloat64(position2, Number(value));
          } else {
            throw new RangeError(value + " was too large to fit in CBOR 64-bit integer format, set largeBigIntToFloat to convert to float-64");
          }
        }
        position2 += 8;
      } else if (type === "undefined") {
        target[position2++] = 247;
      } else {
        throw new Error("Unknown type: " + type);
      }
    };
    const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
      let keys = Object.keys(object);
      let vals = Object.values(object);
      let length = keys.length;
      if (length < 24) {
        target[position2++] = 160 | length;
      } else if (length < 256) {
        target[position2++] = 184;
        target[position2++] = length;
      } else if (length < 65536) {
        target[position2++] = 185;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 186;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      let key;
      if (encoder.keyMap) {
        for (let i = 0;i < length; i++) {
          encode(encoder.encodeKey(keys[i]));
          encode(vals[i]);
        }
      } else {
        for (let i = 0;i < length; i++) {
          encode(keys[i]);
          encode(vals[i]);
        }
      }
    } : (object, safePrototype) => {
      target[position2++] = 185;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      if (encoder.keyMap) {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            encode(encoder.encodeKey(key));
            encode(object[key]);
            size++;
          }
      } else {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            encode(key);
            encode(object[key]);
            size++;
          }
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    } : (object, safePrototype) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
      let newTransitions = 0;
      let length = 0;
      let parentRecordId;
      let keys;
      if (this.keyMap) {
        keys = Object.keys(object).map((k) => this.encodeKey(k));
        length = keys.length;
        for (let i = 0;i < length; i++) {
          let key = keys[i];
          nextTransition = transition[key];
          if (!nextTransition) {
            nextTransition = transition[key] = Object.create(null);
            newTransitions++;
          }
          transition = nextTransition;
        }
      } else {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (!nextTransition) {
              if (transition[RECORD_SYMBOL] & 1048576) {
                parentRecordId = transition[RECORD_SYMBOL] & 65535;
              }
              nextTransition = transition[key] = Object.create(null);
              newTransitions++;
            }
            transition = nextTransition;
            length++;
          }
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId !== undefined) {
        recordId &= 65535;
        target[position2++] = 217;
        target[position2++] = recordId >> 8 | 224;
        target[position2++] = recordId & 255;
      } else {
        if (!keys)
          keys = transition.__keys__ || (transition.__keys__ = Object.keys(object));
        if (parentRecordId === undefined) {
          recordId = structures.nextId++;
          if (!recordId) {
            recordId = 0;
            structures.nextId = 1;
          }
          if (recordId >= MAX_STRUCTURES) {
            structures.nextId = (recordId = maxSharedStructures) + 1;
          }
        } else {
          recordId = parentRecordId;
        }
        structures[recordId] = keys;
        if (recordId < maxSharedStructures) {
          target[position2++] = 217;
          target[position2++] = recordId >> 8 | 224;
          target[position2++] = recordId & 255;
          transition = structures.transitions;
          for (let i = 0;i < length; i++) {
            if (transition[RECORD_SYMBOL] === undefined || transition[RECORD_SYMBOL] & 1048576)
              transition[RECORD_SYMBOL] = recordId;
            transition = transition[keys[i]];
          }
          transition[RECORD_SYMBOL] = recordId | 1048576;
          hasSharedUpdate = true;
        } else {
          transition[RECORD_SYMBOL] = recordId;
          targetView.setUint32(position2, 3655335680);
          position2 += 3;
          if (newTransitions)
            transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
          if (recordIdsToRemove.length >= MAX_STRUCTURES - maxSharedStructures)
            recordIdsToRemove.shift()[RECORD_SYMBOL] = undefined;
          recordIdsToRemove.push(transition);
          writeArrayHeader(length + 2);
          encode(57344 + recordId);
          encode(keys);
          if (safePrototype === null)
            return;
          for (let key in object)
            if (safePrototype || object.hasOwnProperty(key))
              encode(object[key]);
          return;
        }
      }
      if (length < 24) {
        target[position2++] = 128 | length;
      } else {
        writeArrayHeader(length);
      }
      if (safePrototype === null)
        return;
      for (let key in object)
        if (safePrototype || object.hasOwnProperty(key))
          encode(object[key]);
    };
    const makeRoom = (end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Encoded buffer would be larger than maximum buffer size");
        newSize = Math.min(MAX_BUFFER_SIZE, Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096);
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = new DataView(newBuffer.buffer, 0, newSize);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };
    let chunkThreshold = 100;
    let continuedChunkThreshold = 1000;
    this.encodeAsIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsIterable);
    };
    this.encodeAsAsyncIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsAsyncIterable);
    };
    function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
      let constructor = object.constructor;
      if (constructor === Object) {
        let useRecords = encoder.useRecords !== false;
        if (useRecords)
          writeObject(object, null);
        else
          writeEntityLength(Object.keys(object).length, 160);
        for (let key in object) {
          let value = object[key];
          if (!useRecords)
            encode(key);
          if (value && typeof value === "object") {
            if (iterateProperties[key])
              yield* encodeObjectAsIterable(value, iterateProperties[key]);
            else
              yield* tryEncode(value, iterateProperties, key);
          } else
            encode(value);
        }
      } else if (constructor === Array) {
        let length = object.length;
        writeArrayHeader(length);
        for (let i = 0;i < length; i++) {
          let value = object[i];
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else
            encode(value);
        }
      } else if (object[Symbol.iterator]) {
        target[position2++] = 159;
        for (let value of object) {
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else
            encode(value);
        }
        target[position2++] = 255;
      } else if (isBlob(object)) {
        writeEntityLength(object.size, 64);
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
      } else if (object[Symbol.asyncIterator]) {
        target[position2++] = 159;
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
        target[position2++] = 255;
      } else {
        encode(object);
      }
      if (finalIterable && position2 > start)
        yield target.subarray(start, position2);
      else if (position2 - start > chunkThreshold) {
        yield target.subarray(start, position2);
        restartEncoding();
      }
    }
    function* tryEncode(value, iterateProperties, key) {
      let restart = position2 - start;
      try {
        encode(value);
        if (position2 - start > chunkThreshold) {
          yield target.subarray(start, position2);
          restartEncoding();
        }
      } catch (error6) {
        if (error6.iteratorNotHandled) {
          iterateProperties[key] = {};
          position2 = start + restart;
          yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
        } else
          throw error6;
      }
    }
    function restartEncoding() {
      chunkThreshold = continuedChunkThreshold;
      encoder.encode(null, THROW_ON_ITERABLE);
    }
    function startEncoding(value, options2, encodeIterable) {
      if (options2 && options2.chunkThreshold)
        chunkThreshold = continuedChunkThreshold = options2.chunkThreshold;
      else
        chunkThreshold = 100;
      if (value && typeof value === "object") {
        encoder.encode(null, THROW_ON_ITERABLE);
        return encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), true);
      }
      return [encoder.encode(value)];
    }
    async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
      for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, true)) {
        let constructor = encodedValue.constructor;
        if (constructor === ByteArray || constructor === Uint8Array)
          yield encodedValue;
        else if (isBlob(encodedValue)) {
          let reader = encodedValue.stream().getReader();
          let next;
          while (!(next = await reader.read()).done) {
            yield next.value;
          }
        } else if (encodedValue[Symbol.asyncIterator]) {
          for await (let asyncValue of encodedValue) {
            restartEncoding();
            if (asyncValue)
              yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {}));
            else
              yield encoder.encode(asyncValue);
          }
        } else {
          yield encodedValue;
        }
      }
    }
  }
  useBuffer(buffer) {
    target = buffer;
    targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    position2 = 0;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.sharedValues)
      this.sharedValues = undefined;
  }
  updateSharedData() {
    let lastVersion = this.sharedVersion || 0;
    this.sharedVersion = lastVersion + 1;
    let structuresCopy = this.structures.slice(0);
    let sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion);
    let saveResults = this.saveShared(sharedData, (existingShared) => (existingShared && existingShared.version || 0) == lastVersion);
    if (saveResults === false) {
      sharedData = this.getShared() || {};
      this.structures = sharedData.structures || [];
      this.sharedValues = sharedData.packedValues;
      this.sharedVersion = sharedData.version;
      this.structures.nextId = this.structures.length;
    } else {
      structuresCopy.forEach((structure, i) => this.structures[i] = structure);
    }
    return saveResults;
  }
}

class SharedData {
  constructor(structures, values, version) {
    this.structures = structures;
    this.packedValues = values;
    this.version = version;
  }
}
var BlobConstructor = typeof Blob === "undefined" ? function() {
} : Blob;
var isLittleEndianMachine2 = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
extensionClasses = [
  Date,
  Set,
  Error,
  RegExp,
  Tag,
  ArrayBuffer,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? function() {
  } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? function() {
  } : BigInt64Array,
  Float32Array,
  Float64Array,
  SharedData
];
extensions = [
  {
    tag: 1,
    encode(date, encode) {
      let seconds = date.getTime() / 1000;
      if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
        target[position2++] = 26;
        targetView.setUint32(position2, seconds);
        position2 += 4;
      } else {
        target[position2++] = 251;
        targetView.setFloat64(position2, seconds);
        position2 += 8;
      }
    }
  },
  {
    tag: 258,
    encode(set3, encode) {
      let array = Array.from(set3);
      encode(array);
    }
  },
  {
    tag: 27,
    encode(error6, encode) {
      encode([error6.name, error6.message]);
    }
  },
  {
    tag: 27,
    encode(regex, encode) {
      encode(["RegExp", regex.source, regex.flags]);
    }
  },
  {
    getTag(tag) {
      return tag.tag;
    },
    encode(tag, encode) {
      encode(tag.value);
    }
  },
  {
    encode(arrayBuffer, encode, makeRoom) {
      writeBuffer(arrayBuffer, makeRoom);
    }
  },
  {
    getTag(typedArray) {
      if (typedArray.constructor === Uint8Array) {
        if (this.tagUint8Array || hasNodeBuffer && this.tagUint8Array !== false)
          return 64;
      }
    },
    encode(typedArray, encode, makeRoom) {
      writeBuffer(typedArray, makeRoom);
    }
  },
  typedArrayEncoder(68, 1),
  typedArrayEncoder(69, 2),
  typedArrayEncoder(70, 4),
  typedArrayEncoder(71, 8),
  typedArrayEncoder(72, 1),
  typedArrayEncoder(77, 2),
  typedArrayEncoder(78, 4),
  typedArrayEncoder(79, 8),
  typedArrayEncoder(85, 4),
  typedArrayEncoder(86, 8),
  {
    encode(sharedData, encode) {
      let packedValues2 = sharedData.packedValues || [];
      let sharedStructures = sharedData.structures || [];
      if (packedValues2.values.length > 0) {
        target[position2++] = 216;
        target[position2++] = 51;
        writeArrayHeader(4);
        let valuesArray = packedValues2.values;
        encode(valuesArray);
        writeArrayHeader(0);
        writeArrayHeader(0);
        packedObjectMap = Object.create(sharedPackedObjectMap || null);
        for (let i = 0, l = valuesArray.length;i < l; i++) {
          packedObjectMap[valuesArray[i]] = i;
        }
      }
      if (sharedStructures) {
        targetView.setUint32(position2, 3655335424);
        position2 += 3;
        let definitions = sharedStructures.slice(0);
        definitions.unshift(57344);
        definitions.push(new Tag(sharedData.version, 1399353956));
        encode(definitions);
      } else
        encode(new Tag(sharedData.version, 1399353956));
    }
  }
];
var defaultEncoder = new Encoder({ useRecords: false });
var encode = defaultEncoder.encode;
var encodeAsIterable = defaultEncoder.encodeAsIterable;
var encodeAsAsyncIterable = defaultEncoder.encodeAsAsyncIterable;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;
var THROW_ON_ITERABLE = 2048;
// node_modules/peerjs/dist/bundler.mjs
var $parcel$export = function(e, n, v, s) {
  Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
};
var $fcbcc7538a6776d5$export$52c89ebcdc4f53f2 = function(bufs) {
  let size = 0;
  for (const buf of bufs)
    size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    result.set(buf, offset);
    offset += buf.byteLength;
  }
  return result;
};
var $c4dcfd1d1ea86647$var$Events = function() {
};
var $c4dcfd1d1ea86647$var$EE = function(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
};
var $c4dcfd1d1ea86647$var$addListener = function(emitter, event, fn, context, once) {
  if (typeof fn !== "function")
    throw new TypeError("The listener must be a function");
  var listener = new $c4dcfd1d1ea86647$var$EE(fn, context || emitter, once), evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!emitter._events[evt])
    emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn)
    emitter._events[evt].push(listener);
  else
    emitter._events[evt] = [
      emitter._events[evt],
      listener
    ];
  return emitter;
};
var $c4dcfd1d1ea86647$var$clearEvent = function(emitter, evt) {
  if (--emitter._eventsCount === 0)
    emitter._events = new $c4dcfd1d1ea86647$var$Events;
  else
    delete emitter._events[evt];
};
var $c4dcfd1d1ea86647$var$EventEmitter = function() {
  this._events = new $c4dcfd1d1ea86647$var$Events;
  this._eventsCount = 0;
};
class $fcbcc7538a6776d5$export$f1c5f4c9cb95390b {
  constructor() {
    this.chunkedMTU = 16300;
    this._dataCount = 1;
    this.chunk = (blob) => {
      const chunks = [];
      const size = blob.byteLength;
      const total = Math.ceil(size / this.chunkedMTU);
      let index = 0;
      let start = 0;
      while (start < size) {
        const end = Math.min(size, start + this.chunkedMTU);
        const b = blob.slice(start, end);
        const chunk = {
          __peerData: this._dataCount,
          n: index,
          data: b,
          total
        };
        chunks.push(chunk);
        start = end;
        index++;
      }
      this._dataCount++;
      return chunks;
    };
  }
}
var $fb63e766cfafaab9$var$webRTCAdapter = (0, adapter_core_default).default || (0, adapter_core_default);
var $fb63e766cfafaab9$export$25be9502477c137d = new class {
  isWebRTCSupported() {
    return typeof RTCPeerConnection !== "undefined";
  }
  isBrowserSupported() {
    const browser = this.getBrowser();
    const version = this.getVersion();
    const validBrowser = this.supportedBrowsers.includes(browser);
    if (!validBrowser)
      return false;
    if (browser === "chrome")
      return version >= this.minChromeVersion;
    if (browser === "firefox")
      return version >= this.minFirefoxVersion;
    if (browser === "safari")
      return !this.isIOS && version >= this.minSafariVersion;
    return false;
  }
  getBrowser() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.browser;
  }
  getVersion() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
  }
  isUnifiedPlanSupported() {
    const browser = this.getBrowser();
    const version = $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
    if (browser === "chrome" && version < this.minChromeVersion)
      return false;
    if (browser === "firefox" && version >= this.minFirefoxVersion)
      return true;
    if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype))
      return false;
    let tempPc;
    let supported = false;
    try {
      tempPc = new RTCPeerConnection;
      tempPc.addTransceiver("audio");
      supported = true;
    } catch (e) {
    } finally {
      if (tempPc)
        tempPc.close();
    }
    return supported;
  }
  toString() {
    return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
  }
  constructor() {
    this.isIOS = [
      "iPad",
      "iPhone",
      "iPod"
    ].includes(navigator.platform);
    this.supportedBrowsers = [
      "firefox",
      "chrome",
      "safari"
    ];
    this.minFirefoxVersion = 59;
    this.minChromeVersion = 72;
    this.minSafariVersion = 605;
  }
};
var $9a84a32bf0bf36bb$export$f35f128fd59ea256 = (id) => {
  return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
};
var $0e5fd1585784c252$export$4e61f672936bec77 = () => Math.random().toString(36).slice(2);
var $4f4134156c446392$var$DEFAULT_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: [
        "turn:eu-0.turn.peerjs.com:3478",
        "turn:us-0.turn.peerjs.com:3478"
      ],
      username: "peerjs",
      credential: "peerjsp"
    }
  ],
  sdpSemantics: "unified-plan"
};

class $4f4134156c446392$export$f8f26dd395d7e1bd extends (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b) {
  noop() {
  }
  blobToArrayBuffer(blob, cb) {
    const fr = new FileReader;
    fr.onload = function(evt) {
      if (evt.target)
        cb(evt.target.result);
    };
    fr.readAsArrayBuffer(blob);
    return fr;
  }
  binaryStringToArrayBuffer(binary) {
    const byteArray = new Uint8Array(binary.length);
    for (let i = 0;i < binary.length; i++)
      byteArray[i] = binary.charCodeAt(i) & 255;
    return byteArray.buffer;
  }
  isSecure() {
    return location.protocol === "https:";
  }
  constructor(...args) {
    super(...args);
    this.CLOUD_HOST = "0.peerjs.com";
    this.CLOUD_PORT = 443;
    this.chunkedBrowsers = {
      Chrome: 1,
      chrome: 1
    };
    this.defaultConfig = $4f4134156c446392$var$DEFAULT_CONFIG;
    this.browser = (0, $fb63e766cfafaab9$export$25be9502477c137d).getBrowser();
    this.browserVersion = (0, $fb63e766cfafaab9$export$25be9502477c137d).getVersion();
    this.pack = $0cfd7828ad59115f$export$2a703dbb0cb35339;
    this.unpack = $0cfd7828ad59115f$export$417857010dc9287f;
    this.supports = function() {
      const supported = {
        browser: (0, $fb63e766cfafaab9$export$25be9502477c137d).isBrowserSupported(),
        webRTC: (0, $fb63e766cfafaab9$export$25be9502477c137d).isWebRTCSupported(),
        audioVideo: false,
        data: false,
        binaryBlob: false,
        reliable: false
      };
      if (!supported.webRTC)
        return supported;
      let pc;
      try {
        pc = new RTCPeerConnection($4f4134156c446392$var$DEFAULT_CONFIG);
        supported.audioVideo = true;
        let dc;
        try {
          dc = pc.createDataChannel("_PEERJSTEST", {
            ordered: true
          });
          supported.data = true;
          supported.reliable = !!dc.ordered;
          try {
            dc.binaryType = "blob";
            supported.binaryBlob = !(0, $fb63e766cfafaab9$export$25be9502477c137d).isIOS;
          } catch (e) {
          }
        } catch (e) {
        } finally {
          if (dc)
            dc.close();
        }
      } catch (e) {
      } finally {
        if (pc)
          pc.close();
      }
      return supported;
    }();
    this.validateId = (0, $9a84a32bf0bf36bb$export$f35f128fd59ea256);
    this.randomToken = (0, $0e5fd1585784c252$export$4e61f672936bec77);
  }
}
var $4f4134156c446392$export$7debb50ef11d5e0b = new $4f4134156c446392$export$f8f26dd395d7e1bd;
var $257947e92926277a$var$LOG_PREFIX = "PeerJS: ";
var $257947e92926277a$export$243e62d78d3b544d;
(function(LogLevel) {
  LogLevel[LogLevel["Disabled"] = 0] = "Disabled";
  LogLevel[LogLevel["Errors"] = 1] = "Errors";
  LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
  LogLevel[LogLevel["All"] = 3] = "All";
})($257947e92926277a$export$243e62d78d3b544d || ($257947e92926277a$export$243e62d78d3b544d = {}));

class $257947e92926277a$var$Logger {
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(logLevel) {
    this._logLevel = logLevel;
  }
  log(...args) {
    if (this._logLevel >= 3)
      this._print(3, ...args);
  }
  warn(...args) {
    if (this._logLevel >= 2)
      this._print(2, ...args);
  }
  error(...args) {
    if (this._logLevel >= 1)
      this._print(1, ...args);
  }
  setLogFunction(fn) {
    this._print = fn;
  }
  _print(logLevel, ...rest) {
    const copy = [
      $257947e92926277a$var$LOG_PREFIX,
      ...rest
    ];
    for (const i in copy)
      if (copy[i] instanceof Error)
        copy[i] = "(" + copy[i].name + ") " + copy[i].message;
    if (logLevel >= 3)
      console.log(...copy);
    else if (logLevel >= 2)
      console.warn("WARNING", ...copy);
    else if (logLevel >= 1)
      console.error("ERROR", ...copy);
  }
  constructor() {
    this._logLevel = 0;
  }
}
var $257947e92926277a$export$2e2bcd8739ae039 = new $257947e92926277a$var$Logger;
var $c4dcfd1d1ea86647$exports = {};
var $c4dcfd1d1ea86647$var$has = Object.prototype.hasOwnProperty;
var $c4dcfd1d1ea86647$var$prefix = "~";
if (Object.create) {
  $c4dcfd1d1ea86647$var$Events.prototype = Object.create(null);
  if (!new $c4dcfd1d1ea86647$var$Events().__proto__)
    $c4dcfd1d1ea86647$var$prefix = false;
}
$c4dcfd1d1ea86647$var$EventEmitter.prototype.eventNames = function eventNames() {
  var names = [], events, name;
  if (this._eventsCount === 0)
    return names;
  for (name in events = this._events)
    if ($c4dcfd1d1ea86647$var$has.call(events, name))
      names.push($c4dcfd1d1ea86647$var$prefix ? name.slice(1) : name);
  if (Object.getOwnPropertySymbols)
    return names.concat(Object.getOwnPropertySymbols(events));
  return names;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listeners = function listeners(event) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, handlers = this._events[evt];
  if (!handlers)
    return [];
  if (handlers.fn)
    return [
      handlers.fn
    ];
  for (var i = 0, l = handlers.length, ee = new Array(l);i < l; i++)
    ee[i] = handlers[i].fn;
  return ee;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event, listeners2 = this._events[evt];
  if (!listeners2)
    return 0;
  if (listeners2.fn)
    return 1;
  return listeners2.length;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!this._events[evt])
    return false;
  var listeners2 = this._events[evt], len = arguments.length, args, i;
  if (listeners2.fn) {
    if (listeners2.once)
      this.removeListener(event, listeners2.fn, undefined, true);
    switch (len) {
      case 1:
        return listeners2.fn.call(listeners2.context), true;
      case 2:
        return listeners2.fn.call(listeners2.context, a1), true;
      case 3:
        return listeners2.fn.call(listeners2.context, a1, a2), true;
      case 4:
        return listeners2.fn.call(listeners2.context, a1, a2, a3), true;
      case 5:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4), true;
      case 6:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4, a5), true;
    }
    for (i = 1, args = new Array(len - 1);i < len; i++)
      args[i - 1] = arguments[i];
    listeners2.fn.apply(listeners2.context, args);
  } else {
    var length = listeners2.length, j;
    for (i = 0;i < length; i++) {
      if (listeners2[i].once)
        this.removeListener(event, listeners2[i].fn, undefined, true);
      switch (len) {
        case 1:
          listeners2[i].fn.call(listeners2[i].context);
          break;
        case 2:
          listeners2[i].fn.call(listeners2[i].context, a1);
          break;
        case 3:
          listeners2[i].fn.call(listeners2[i].context, a1, a2);
          break;
        case 4:
          listeners2[i].fn.call(listeners2[i].context, a1, a2, a3);
          break;
        default:
          if (!args)
            for (j = 1, args = new Array(len - 1);j < len; j++)
              args[j - 1] = arguments[j];
          listeners2[i].fn.apply(listeners2[i].context, args);
      }
    }
  }
  return true;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.on = function on3(event, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, false);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.once = function once(event, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event, fn, context, true);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
  if (!this._events[evt])
    return this;
  if (!fn) {
    $c4dcfd1d1ea86647$var$clearEvent(this, evt);
    return this;
  }
  var listeners2 = this._events[evt];
  if (listeners2.fn) {
    if (listeners2.fn === fn && (!once2 || listeners2.once) && (!context || listeners2.context === context))
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    for (var i = 0, events = [], length = listeners2.length;i < length; i++)
      if (listeners2[i].fn !== fn || once2 && !listeners2[i].once || context && listeners2[i].context !== context)
        events.push(listeners2[i]);
    if (events.length)
      this._events[evt] = events.length === 1 ? events[0] : events;
    else
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;
  if (event) {
    evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event : event;
    if (this._events[evt])
      $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    this._events = new $c4dcfd1d1ea86647$var$Events;
    this._eventsCount = 0;
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.off = $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener;
$c4dcfd1d1ea86647$var$EventEmitter.prototype.addListener = $c4dcfd1d1ea86647$var$EventEmitter.prototype.on;
$c4dcfd1d1ea86647$var$EventEmitter.prefixed = $c4dcfd1d1ea86647$var$prefix;
$c4dcfd1d1ea86647$var$EventEmitter.EventEmitter = $c4dcfd1d1ea86647$var$EventEmitter;
$c4dcfd1d1ea86647$exports = $c4dcfd1d1ea86647$var$EventEmitter;
var $78455e22dea96b8c$exports = {};
$parcel$export($78455e22dea96b8c$exports, "ConnectionType", () => $78455e22dea96b8c$export$3157d57b4135e3bc);
$parcel$export($78455e22dea96b8c$exports, "PeerErrorType", () => $78455e22dea96b8c$export$9547aaa2e39030ff);
$parcel$export($78455e22dea96b8c$exports, "BaseConnectionErrorType", () => $78455e22dea96b8c$export$7974935686149686);
$parcel$export($78455e22dea96b8c$exports, "DataConnectionErrorType", () => $78455e22dea96b8c$export$49ae800c114df41d);
$parcel$export($78455e22dea96b8c$exports, "SerializationType", () => $78455e22dea96b8c$export$89f507cf986a947);
$parcel$export($78455e22dea96b8c$exports, "SocketEventType", () => $78455e22dea96b8c$export$3b5c4a4b6354f023);
$parcel$export($78455e22dea96b8c$exports, "ServerMessageType", () => $78455e22dea96b8c$export$adb4a1754da6f10d);
var $78455e22dea96b8c$export$3157d57b4135e3bc;
(function(ConnectionType) {
  ConnectionType["Data"] = "data";
  ConnectionType["Media"] = "media";
})($78455e22dea96b8c$export$3157d57b4135e3bc || ($78455e22dea96b8c$export$3157d57b4135e3bc = {}));
var $78455e22dea96b8c$export$9547aaa2e39030ff;
(function(PeerErrorType) {
  PeerErrorType["BrowserIncompatible"] = "browser-incompatible";
  PeerErrorType["Disconnected"] = "disconnected";
  PeerErrorType["InvalidID"] = "invalid-id";
  PeerErrorType["InvalidKey"] = "invalid-key";
  PeerErrorType["Network"] = "network";
  PeerErrorType["PeerUnavailable"] = "peer-unavailable";
  PeerErrorType["SslUnavailable"] = "ssl-unavailable";
  PeerErrorType["ServerError"] = "server-error";
  PeerErrorType["SocketError"] = "socket-error";
  PeerErrorType["SocketClosed"] = "socket-closed";
  PeerErrorType["UnavailableID"] = "unavailable-id";
  PeerErrorType["WebRTC"] = "webrtc";
})($78455e22dea96b8c$export$9547aaa2e39030ff || ($78455e22dea96b8c$export$9547aaa2e39030ff = {}));
var $78455e22dea96b8c$export$7974935686149686;
(function(BaseConnectionErrorType) {
  BaseConnectionErrorType["NegotiationFailed"] = "negotiation-failed";
  BaseConnectionErrorType["ConnectionClosed"] = "connection-closed";
})($78455e22dea96b8c$export$7974935686149686 || ($78455e22dea96b8c$export$7974935686149686 = {}));
var $78455e22dea96b8c$export$49ae800c114df41d;
(function(DataConnectionErrorType) {
  DataConnectionErrorType["NotOpenYet"] = "not-open-yet";
  DataConnectionErrorType["MessageToBig"] = "message-too-big";
})($78455e22dea96b8c$export$49ae800c114df41d || ($78455e22dea96b8c$export$49ae800c114df41d = {}));
var $78455e22dea96b8c$export$89f507cf986a947;
(function(SerializationType) {
  SerializationType["Binary"] = "binary";
  SerializationType["BinaryUTF8"] = "binary-utf8";
  SerializationType["JSON"] = "json";
  SerializationType["None"] = "raw";
})($78455e22dea96b8c$export$89f507cf986a947 || ($78455e22dea96b8c$export$89f507cf986a947 = {}));
var $78455e22dea96b8c$export$3b5c4a4b6354f023;
(function(SocketEventType) {
  SocketEventType["Message"] = "message";
  SocketEventType["Disconnected"] = "disconnected";
  SocketEventType["Error"] = "error";
  SocketEventType["Close"] = "close";
})($78455e22dea96b8c$export$3b5c4a4b6354f023 || ($78455e22dea96b8c$export$3b5c4a4b6354f023 = {}));
var $78455e22dea96b8c$export$adb4a1754da6f10d;
(function(ServerMessageType) {
  ServerMessageType["Heartbeat"] = "HEARTBEAT";
  ServerMessageType["Candidate"] = "CANDIDATE";
  ServerMessageType["Offer"] = "OFFER";
  ServerMessageType["Answer"] = "ANSWER";
  ServerMessageType["Open"] = "OPEN";
  ServerMessageType["Error"] = "ERROR";
  ServerMessageType["IdTaken"] = "ID-TAKEN";
  ServerMessageType["InvalidKey"] = "INVALID-KEY";
  ServerMessageType["Leave"] = "LEAVE";
  ServerMessageType["Expire"] = "EXPIRE";
})($78455e22dea96b8c$export$adb4a1754da6f10d || ($78455e22dea96b8c$export$adb4a1754da6f10d = {}));
var $f5f881ec4575f1fc$exports = {};
$f5f881ec4575f1fc$exports = JSON.parse('{"name":"peerjs","version":"1.5.2","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz St\xFCckler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","So\u0308ren Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","browser-minified-cbor":"dist/serializer.cbor.mjs","browser-minified-msgpack":"dist/serializer.msgpack.mjs","types":"dist/types.d.ts","engines":{"node":">= 14"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-minified-cbor":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/Cbor.ts"},"browser-minified-msgpack":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/MsgPack.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit && tsc -p e2e/tsconfig.json --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"jest","test:watch":"jest --watch","coverage":"jest --coverage --collectCoverageFrom=\\"./lib/**\\"","format":"prettier --write .","format:check":"prettier --check .","semantic-release":"semantic-release","e2e":"wdio run e2e/wdio.local.conf.ts","e2e:bstack":"wdio run e2e/wdio.bstack.conf.ts"},"devDependencies":{"@parcel/config-default":"^2.9.3","@parcel/packager-ts":"^2.9.3","@parcel/transformer-typescript-tsc":"^2.9.3","@parcel/transformer-typescript-types":"^2.9.3","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@swc/core":"^1.3.27","@swc/jest":"^0.2.24","@types/jasmine":"^4.3.4","@wdio/browserstack-service":"^8.11.2","@wdio/cli":"^8.11.2","@wdio/globals":"^8.11.2","@wdio/jasmine-framework":"^8.11.2","@wdio/local-runner":"^8.11.2","@wdio/spec-reporter":"^8.11.2","@wdio/types":"^8.10.4","http-server":"^14.1.1","jest":"^29.3.1","jest-environment-jsdom":"^29.3.1","mock-socket":"^9.0.0","parcel":"^2.9.3","prettier":"^3.0.0","semantic-release":"^21.0.0","ts-node":"^10.9.1","typescript":"^5.0.0","wdio-geckodriver-service":"^5.0.1"},"dependencies":{"@msgpack/msgpack":"^2.8.0","cbor-x":"1.5.4","eventemitter3":"^4.0.7","peerjs-js-binarypack":"^2.1.0","webrtc-adapter":"^8.0.0"},"alias":{"process":false,"buffer":false}}');

class $8f5bfa60836d261d$export$4798917dbf149b79 extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
  constructor(secure, host, port, path, key, pingInterval = 5000) {
    super();
    this.pingInterval = pingInterval;
    this._disconnected = true;
    this._messagesQueue = [];
    const wsProtocol = secure ? "wss://" : "ws://";
    this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
  }
  start(id, token) {
    this._id = id;
    const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;
    if (!!this._socket || !this._disconnected)
      return;
    this._socket = new WebSocket(wsUrl + "&version=" + (0, $f5f881ec4575f1fc$exports.version));
    this._disconnected = false;
    this._socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Server message received:", data);
      } catch (e) {
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Invalid server message", event.data);
        return;
      }
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, data);
    };
    this._socket.onclose = (event) => {
      if (this._disconnected)
        return;
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket closed.", event);
      this._cleanup();
      this._disconnected = true;
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected);
    };
    this._socket.onopen = () => {
      if (this._disconnected)
        return;
      this._sendQueuedMessages();
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Socket open");
      this._scheduleHeartbeat();
    };
  }
  _scheduleHeartbeat() {
    this._wsPingTimer = setTimeout(() => {
      this._sendHeartbeat();
    }, this.pingInterval);
  }
  _sendHeartbeat() {
    if (!this._wsOpen()) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Cannot send heartbeat, because socket closed`);
      return;
    }
    const message = JSON.stringify({
      type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Heartbeat
    });
    this._socket.send(message);
    this._scheduleHeartbeat();
  }
  _wsOpen() {
    return !!this._socket && this._socket.readyState === 1;
  }
  _sendQueuedMessages() {
    const copiedQueue = [
      ...this._messagesQueue
    ];
    this._messagesQueue = [];
    for (const message of copiedQueue)
      this.send(message);
  }
  send(data) {
    if (this._disconnected)
      return;
    if (!this._id) {
      this._messagesQueue.push(data);
      return;
    }
    if (!data.type) {
      this.emit((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, "Invalid message");
      return;
    }
    if (!this._wsOpen())
      return;
    const message = JSON.stringify(data);
    this._socket.send(message);
  }
  close() {
    if (this._disconnected)
      return;
    this._cleanup();
    this._disconnected = true;
  }
  _cleanup() {
    if (this._socket) {
      this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
      this._socket.close();
      this._socket = undefined;
    }
    clearTimeout(this._wsPingTimer);
  }
}

class $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a {
  constructor(connection) {
    this.connection = connection;
  }
  startConnection(options) {
    const peerConnection = this._startPeerConnection();
    this.connection.peerConnection = peerConnection;
    if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media && options._stream)
      this._addTracksToConnection(options._stream, peerConnection);
    if (options.originator) {
      const dataConnection = this.connection;
      const config = {
        ordered: !!options.reliable
      };
      const dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
      dataConnection._initializeDataChannel(dataChannel);
      this._makeOffer();
    } else
      this.handleSDP("OFFER", options.sdp);
  }
  _startPeerConnection() {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Creating RTCPeerConnection.");
    const peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
    this._setupListeners(peerConnection);
    return peerConnection;
  }
  _setupListeners(peerConnection) {
    const peerId = this.connection.peer;
    const connectionId = this.connection.connectionId;
    const connectionType = this.connection.type;
    const provider = this.connection.provider;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for ICE candidates.");
    peerConnection.onicecandidate = (evt) => {
      if (!evt.candidate || !evt.candidate.candidate)
        return;
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received ICE candidates for ${peerId}:`, evt.candidate);
      provider.socket.send({
        type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate,
        payload: {
          candidate: evt.candidate,
          type: connectionType,
          connectionId
        },
        dst: peerId
      });
    };
    peerConnection.oniceconnectionstatechange = () => {
      switch (peerConnection.iceConnectionState) {
        case "failed":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is failed, closing connections to " + peerId);
          this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).NegotiationFailed, "Negotiation of connection to " + peerId + " failed.");
          this.connection.close();
          break;
        case "closed":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState is closed, closing connections to " + peerId);
          this.connection.emitError((0, $78455e22dea96b8c$export$7974935686149686).ConnectionClosed, "Connection to " + peerId + " closed.");
          this.connection.close();
          break;
        case "disconnected":
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("iceConnectionState changed to disconnected on the connection with " + peerId);
          break;
        case "completed":
          peerConnection.onicecandidate = () => {
          };
          break;
      }
      this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
    };
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for data channel");
    peerConnection.ondatachannel = (evt) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received data channel");
      const dataChannel = evt.channel;
      const connection = provider.getConnection(peerId, connectionId);
      connection._initializeDataChannel(dataChannel);
    };
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Listening for remote stream");
    peerConnection.ontrack = (evt) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Received remote stream");
      const stream = evt.streams[0];
      const connection = provider.getConnection(peerId, connectionId);
      if (connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
        const mediaConnection = connection;
        this._addStreamToMediaConnection(stream, mediaConnection);
      }
    };
  }
  cleanup() {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Cleaning up PeerConnection to " + this.connection.peer);
    const peerConnection = this.connection.peerConnection;
    if (!peerConnection)
      return;
    this.connection.peerConnection = null;
    peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => {
    };
    const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
    let dataChannelNotClosed = false;
    const dataChannel = this.connection.dataChannel;
    if (dataChannel)
      dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
    if (peerConnectionNotClosed || dataChannelNotClosed)
      peerConnection.close();
  }
  async _makeOffer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const offer = await peerConnection.createOffer(this.connection.options.constraints);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created offer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
        offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
      try {
        await peerConnection.setLocalDescription(offer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Set localDescription:", offer, `for:${this.connection.peer}`);
        let payload = {
          sdp: offer,
          type: this.connection.type,
          connectionId: this.connection.connectionId,
          metadata: this.connection.metadata
        };
        if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
          const dataConnection = this.connection;
          payload = {
            ...payload,
            label: dataConnection.label,
            reliable: dataConnection.reliable,
            serialization: dataConnection.serialization
          };
        }
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer,
          payload,
          dst: this.connection.peer
        });
      } catch (err) {
        if (err != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
        }
      }
    } catch (err_1) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to createOffer, ", err_1);
    }
  }
  async _makeAnswer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const answer = await peerConnection.createAnswer();
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created answer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
        answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
      try {
        await peerConnection.setLocalDescription(answer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set localDescription:`, answer, `for:${this.connection.peer}`);
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer,
          payload: {
            sdp: answer,
            type: this.connection.type,
            connectionId: this.connection.connectionId
          },
          dst: this.connection.peer
        });
      } catch (err) {
        provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
      }
    } catch (err_1) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err_1);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to create answer, ", err_1);
    }
  }
  async handleSDP(type, sdp2) {
    sdp2 = new RTCSessionDescription(sdp2);
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Setting remote description", sdp2);
    const self2 = this;
    try {
      await peerConnection.setRemoteDescription(sdp2);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set remoteDescription:${type} for:${this.connection.peer}`);
      if (type === "OFFER")
        await self2._makeAnswer();
    } catch (err) {
      provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setRemoteDescription, ", err);
    }
  }
  async handleCandidate(ice) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`handleCandidate:`, ice);
    try {
      await this.connection.peerConnection.addIceCandidate(ice);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Added ICE candidate for:${this.connection.peer}`);
    } catch (err) {
      this.connection.provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to handleCandidate, ", err);
    }
  }
  _addTracksToConnection(stream, peerConnection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add tracks from stream ${stream.id} to peer connection`);
    if (!peerConnection.addTrack)
      return (0, $257947e92926277a$export$2e2bcd8739ae039).error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }
  _addStreamToMediaConnection(stream, mediaConnection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`);
    mediaConnection.addStream(stream);
  }
}

class $23779d1881157a18$export$6a678e589c8a4542 extends (0, $c4dcfd1d1ea86647$exports.EventEmitter) {
  emitError(type, err) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error:", err);
    this.emit("error", new $23779d1881157a18$export$98871882f492de82(`${type}`, err));
  }
}

class $23779d1881157a18$export$98871882f492de82 extends Error {
  constructor(type, err) {
    if (typeof err === "string")
      super(err);
    else {
      super();
      Object.assign(this, err);
    }
    this.type = type;
  }
}

class $5045192fc6d387ba$export$23a2a68283c24d80 extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
  get open() {
    return this._open;
  }
  constructor(peer, provider, options) {
    super();
    this.peer = peer;
    this.provider = provider;
    this.options = options;
    this._open = false;
    this.metadata = options.metadata;
  }
}

class $5c1d08c7c57da9a3$export$4a84e95a2324ac29 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
  static #_ = this.ID_PREFIX = "mc_";
  get type() {
    return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media;
  }
  get localStream() {
    return this._localStream;
  }
  get remoteStream() {
    return this._remoteStream;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this._localStream = this.options._stream;
    this.connectionId = this.options.connectionId || $5c1d08c7c57da9a3$export$4a84e95a2324ac29.ID_PREFIX + (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken();
    this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
    if (this._localStream)
      this._negotiator.startConnection({
        _stream: this._localStream,
        originator: true
      });
  }
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
      this.emit("willCloseOnRemote");
    };
    this.dataChannel.onclose = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  addStream(remoteStream) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log("Receiving stream", remoteStream);
    this._remoteStream = remoteStream;
    super.emit("stream", remoteStream);
  }
  handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    switch (message.type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
        this._negotiator.handleSDP(type, payload.sdp);
        this._open = true;
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
        this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Unrecognized message type:${type} from peer:${this.peer}`);
        break;
    }
  }
  answer(stream, options = {}) {
    if (this._localStream) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
      return;
    }
    this._localStream = stream;
    if (options && options.sdpTransform)
      this.options.sdpTransform = options.sdpTransform;
    this._negotiator.startConnection({
      ...this.options._payload,
      _stream: stream
    });
    const messages = this.provider._getMessages(this.connectionId);
    for (const message of messages)
      this.handleMessage(message);
    this._open = true;
  }
  close() {
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    this._localStream = null;
    this._remoteStream = null;
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.options && this.options._stream)
      this.options._stream = null;
    if (!this.open)
      return;
    this._open = false;
    super.emit("close");
  }
}

class $abf266641927cd89$export$2c4e825dc9120f87 {
  constructor(_options) {
    this._options = _options;
  }
  _buildRequest(method) {
    const protocol = this._options.secure ? "https" : "http";
    const { host, port, path, key } = this._options;
    const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
    url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
    url.searchParams.set("version", (0, $f5f881ec4575f1fc$exports.version));
    return fetch(url.href, {
      referrerPolicy: this._options.referrerPolicy
    });
  }
  async retrieveId() {
    try {
      const response = await this._buildRequest("id");
      if (response.status !== 200)
        throw new Error(`Error. Status:${response.status}`);
      return response.text();
    } catch (error6) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving ID", error6);
      let pathError = "";
      if (this._options.path === "/" && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
        pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
      throw new Error("Could not get an ID from the server." + pathError);
    }
  }
  async listAllPeers() {
    try {
      const response = await this._buildRequest("peers");
      if (response.status !== 200) {
        if (response.status === 401) {
          let helpfulError = "";
          if (this._options.host === (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
            helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
          else
            helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
          throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
        }
        throw new Error(`Error. Status:${response.status}`);
      }
      return response.json();
    } catch (error6) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("Error retrieving list peers", error6);
      throw new Error("Could not get list peers from the server." + error6);
    }
  }
}

class $6366c4ca161bc297$export$d365f7ad9d7df9c9 extends (0, $5045192fc6d387ba$export$23a2a68283c24d80) {
  static #_ = this.ID_PREFIX = "dc_";
  static #_1 = this.MAX_BUFFERED_AMOUNT = 8388608;
  get type() {
    return (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.connectionId = this.options.connectionId || $6366c4ca161bc297$export$d365f7ad9d7df9c9.ID_PREFIX + (0, $0e5fd1585784c252$export$4e61f672936bec77)();
    this.label = this.options.label || this.connectionId;
    this.reliable = !!this.options.reliable;
    this._negotiator = new (0, $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a)(this);
    this._negotiator.startConnection(this.options._payload || {
      originator: true,
      reliable: this.reliable
    });
  }
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
      this._open = true;
      this.emit("open");
    };
    this.dataChannel.onmessage = (e) => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc onmessage:`, e.data);
    };
    this.dataChannel.onclose = () => {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  close(options) {
    if (options?.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.dataChannel) {
      this.dataChannel.onopen = null;
      this.dataChannel.onmessage = null;
      this.dataChannel.onclose = null;
      this.dataChannel = null;
    }
    if (!this.open)
      return;
    this._open = false;
    super.emit("close");
  }
  send(data, chunked = false) {
    if (!this.open) {
      this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
      return;
    }
    return this._send(data, chunked);
  }
  async handleMessage(message) {
    const payload = message.payload;
    switch (message.type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer:
        await this._negotiator.handleSDP(message.type, payload.sdp);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Candidate:
        await this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        (0, $257947e92926277a$export$2e2bcd8739ae039).warn("Unrecognized message type:", message.type, "from peer:", this.peer);
        break;
    }
  }
}

class $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b extends (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9) {
  get bufferSize() {
    return this._bufferSize;
  }
  _initializeDataChannel(dc) {
    super._initializeDataChannel(dc);
    this.dataChannel.binaryType = "arraybuffer";
    this.dataChannel.addEventListener("message", (e) => this._handleDataMessage(e));
  }
  _bufferedSend(msg) {
    if (this._buffering || !this._trySend(msg)) {
      this._buffer.push(msg);
      this._bufferSize = this._buffer.length;
    }
  }
  _trySend(msg) {
    if (!this.open)
      return false;
    if (this.dataChannel.bufferedAmount > (0, $6366c4ca161bc297$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT) {
      this._buffering = true;
      setTimeout(() => {
        this._buffering = false;
        this._tryBuffer();
      }, 50);
      return false;
    }
    try {
      this.dataChannel.send(msg);
    } catch (e) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error(`DC#:${this.connectionId} Error when sending:`, e);
      this._buffering = true;
      this.close();
      return false;
    }
    return true;
  }
  _tryBuffer() {
    if (!this.open)
      return;
    if (this._buffer.length === 0)
      return;
    const msg = this._buffer[0];
    if (this._trySend(msg)) {
      this._buffer.shift();
      this._bufferSize = this._buffer.length;
      this._tryBuffer();
    }
  }
  close(options) {
    if (options?.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    this._buffer = [];
    this._bufferSize = 0;
    super.close();
  }
  constructor(...args) {
    super(...args);
    this._buffer = [];
    this._bufferSize = 0;
    this._buffering = false;
  }
}

class $9fcfddb3ae148f88$export$f0a5a64d5bb37108 extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  close(options) {
    super.close(options);
    this._chunkedData = {};
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.chunker = new (0, $fcbcc7538a6776d5$export$f1c5f4c9cb95390b);
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).Binary;
    this._chunkedData = {};
  }
  _handleDataMessage({ data }) {
    const deserializedData = (0, $0cfd7828ad59115f$export$417857010dc9287f)(data);
    const peerData = deserializedData["__peerData"];
    if (peerData) {
      if (peerData.type === "close") {
        this.close();
        return;
      }
      this._handleChunk(deserializedData);
      return;
    }
    this.emit("data", deserializedData);
  }
  _handleChunk(data) {
    const id = data.__peerData;
    const chunkInfo = this._chunkedData[id] || {
      data: [],
      count: 0,
      total: data.total
    };
    chunkInfo.data[data.n] = new Uint8Array(data.data);
    chunkInfo.count++;
    this._chunkedData[id] = chunkInfo;
    if (chunkInfo.total === chunkInfo.count) {
      delete this._chunkedData[id];
      const data2 = (0, $fcbcc7538a6776d5$export$52c89ebcdc4f53f2)(chunkInfo.data);
      this._handleDataMessage({
        data: data2
      });
    }
  }
  _send(data, chunked) {
    const blob = (0, $0cfd7828ad59115f$export$2a703dbb0cb35339)(data);
    if (blob instanceof Promise)
      return this._send_blob(blob);
    if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  async _send_blob(blobPromise) {
    const blob = await blobPromise;
    if (blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  _sendChunks(blob) {
    const blobs = this.chunker.chunk(blob);
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);
    for (const blob2 of blobs)
      this.send(blob2, true);
  }
}

class $bbaee3f15f714663$export$6f88fe47d32c9c94 extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  _handleDataMessage({ data }) {
    super.emit("data", data);
  }
  _send(data, _chunked) {
    this._bufferedSend(data);
  }
  constructor(...args) {
    super(...args);
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).None;
  }
}

class $817f931e3f9096cf$export$48880ac635f47186 extends (0, $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b) {
  _handleDataMessage({ data }) {
    const deserializedData = this.parse(this.decoder.decode(data));
    const peerData = deserializedData["__peerData"];
    if (peerData && peerData.type === "close") {
      this.close();
      return;
    }
    this.emit("data", deserializedData);
  }
  _send(data, _chunked) {
    const encodedData = this.encoder.encode(this.stringify(data));
    if (encodedData.byteLength >= (0, $4f4134156c446392$export$7debb50ef11d5e0b).chunkedMTU) {
      this.emitError((0, $78455e22dea96b8c$export$49ae800c114df41d).MessageToBig, "Message too big for JSON channel");
      return;
    }
    this._bufferedSend(encodedData);
  }
  constructor(...args) {
    super(...args);
    this.serialization = (0, $78455e22dea96b8c$export$89f507cf986a947).JSON;
    this.encoder = new TextEncoder;
    this.decoder = new TextDecoder;
    this.stringify = JSON.stringify;
    this.parse = JSON.parse;
  }
}
class $416260bce337df90$export$ecd1fc136c422448 extends (0, $23779d1881157a18$export$6a678e589c8a4542) {
  static #_ = this.DEFAULT_KEY = "peerjs";
  get id() {
    return this._id;
  }
  get options() {
    return this._options;
  }
  get open() {
    return this._open;
  }
  get socket() {
    return this._socket;
  }
  get connections() {
    const plainConnections = Object.create(null);
    for (const [k, v] of this._connections)
      plainConnections[k] = v;
    return plainConnections;
  }
  get destroyed() {
    return this._destroyed;
  }
  get disconnected() {
    return this._disconnected;
  }
  constructor(id, options) {
    super();
    this._serializers = {
      raw: (0, $bbaee3f15f714663$export$6f88fe47d32c9c94),
      json: (0, $817f931e3f9096cf$export$48880ac635f47186),
      binary: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
      "binary-utf8": (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108),
      default: (0, $9fcfddb3ae148f88$export$f0a5a64d5bb37108)
    };
    this._id = null;
    this._lastServerId = null;
    this._destroyed = false;
    this._disconnected = false;
    this._open = false;
    this._connections = new Map;
    this._lostMessages = new Map;
    let userId;
    if (id && id.constructor == Object)
      options = id;
    else if (id)
      userId = id.toString();
    options = {
      debug: 0,
      host: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST,
      port: (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_PORT,
      path: "/",
      key: $416260bce337df90$export$ecd1fc136c422448.DEFAULT_KEY,
      token: (0, $4f4134156c446392$export$7debb50ef11d5e0b).randomToken(),
      config: (0, $4f4134156c446392$export$7debb50ef11d5e0b).defaultConfig,
      referrerPolicy: "strict-origin-when-cross-origin",
      serializers: {},
      ...options
    };
    this._options = options;
    this._serializers = {
      ...this._serializers,
      ...this.options.serializers
    };
    if (this._options.host === "/")
      this._options.host = window.location.hostname;
    if (this._options.path) {
      if (this._options.path[0] !== "/")
        this._options.path = "/" + this._options.path;
      if (this._options.path[this._options.path.length - 1] !== "/")
        this._options.path += "/";
    }
    if (this._options.secure === undefined && this._options.host !== (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
      this._options.secure = (0, $4f4134156c446392$export$7debb50ef11d5e0b).isSecure();
    else if (this._options.host == (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST)
      this._options.secure = true;
    if (this._options.logFunction)
      (0, $257947e92926277a$export$2e2bcd8739ae039).setLogFunction(this._options.logFunction);
    (0, $257947e92926277a$export$2e2bcd8739ae039).logLevel = this._options.debug || 0;
    this._api = new (0, $abf266641927cd89$export$2c4e825dc9120f87)(options);
    this._socket = this._createServerConnection();
    if (!(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.audioVideo && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).supports.data) {
      this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).BrowserIncompatible, "The current browser does not support WebRTC");
      return;
    }
    if (!!userId && !(0, $4f4134156c446392$export$7debb50ef11d5e0b).validateId(userId)) {
      this._delayedAbort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidID, `ID "${userId}" is invalid`);
      return;
    }
    if (userId)
      this._initialize(userId);
    else
      this._api.retrieveId().then((id2) => this._initialize(id2)).catch((error6) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error6));
  }
  _createServerConnection() {
    const socket = new (0, $8f5bfa60836d261d$export$4798917dbf149b79)(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Message, (data) => {
      this._handleMessage(data);
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Error, (error6) => {
      this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketError, error6);
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Disconnected, () => {
      if (this.disconnected)
        return;
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Network, "Lost connection to server.");
      this.disconnect();
    });
    socket.on((0, $78455e22dea96b8c$export$3b5c4a4b6354f023).Close, () => {
      if (this.disconnected)
        return;
      this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).SocketClosed, "Underlying socket is already closed.");
    });
    return socket;
  }
  _initialize(id) {
    this._id = id;
    this.socket.start(id, this._options.token);
  }
  _handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    const peerId = message.src;
    switch (type) {
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Open:
        this._lastServerId = this.id;
        this._open = true;
        this.emit("open", this.id);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Error:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, payload.msg);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).IdTaken:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).UnavailableID, `ID "${this.id}" is taken`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).InvalidKey:
        this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).InvalidKey, `API KEY "${this._options.key}" is invalid`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Leave:
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Received leave message from ${peerId}`);
        this._cleanupPeer(peerId);
        this._connections.delete(peerId);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Expire:
        this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).PeerUnavailable, `Could not connect to peer ${peerId}`);
        break;
      case (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer: {
        const connectionId = payload.connectionId;
        let connection = this.getConnection(peerId, connectionId);
        if (connection) {
          connection.close();
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Offer received for existing Connection ID:${connectionId}`);
        }
        if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Media) {
          const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata
          });
          connection = mediaConnection;
          this._addConnection(peerId, connection);
          this.emit("call", mediaConnection);
        } else if (payload.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
          const dataConnection = new this._serializers[payload.serialization](peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata,
            label: payload.label,
            serialization: payload.serialization,
            reliable: payload.reliable
          });
          connection = dataConnection;
          this._addConnection(peerId, connection);
          this.emit("connection", dataConnection);
        } else {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`Received malformed connection type:${payload.type}`);
          return;
        }
        const messages = this._getMessages(connectionId);
        for (const message2 of messages)
          connection.handleMessage(message2);
        break;
      }
      default: {
        if (!payload) {
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn(`You received a malformed message from ${peerId} of type ${type}`);
          return;
        }
        const connectionId = payload.connectionId;
        const connection = this.getConnection(peerId, connectionId);
        if (connection && connection.peerConnection)
          connection.handleMessage(message);
        else if (connectionId)
          this._storeMessage(connectionId, message);
        else
          (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You received an unrecognized message:", message);
        break;
      }
    }
  }
  _storeMessage(connectionId, message) {
    if (!this._lostMessages.has(connectionId))
      this._lostMessages.set(connectionId, []);
    this._lostMessages.get(connectionId).push(message);
  }
  _getMessages(connectionId) {
    const messages = this._lostMessages.get(connectionId);
    if (messages) {
      this._lostMessages.delete(connectionId);
      return messages;
    }
    return [];
  }
  connect(peer, options = {}) {
    options = {
      serialization: "default",
      ...options
    };
    if (this.disconnected) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    const dataConnection = new this._serializers[options.serialization](peer, this, options);
    this._addConnection(peer, dataConnection);
    return dataConnection;
  }
  call(peer, stream, options = {}) {
    if (this.disconnected) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
      this.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    if (!stream) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
      return;
    }
    const mediaConnection = new (0, $5c1d08c7c57da9a3$export$4a84e95a2324ac29)(peer, this, {
      ...options,
      _stream: stream
    });
    this._addConnection(peer, mediaConnection);
    return mediaConnection;
  }
  _addConnection(peerId, connection) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`);
    if (!this._connections.has(peerId))
      this._connections.set(peerId, []);
    this._connections.get(peerId).push(connection);
  }
  _removeConnection(connection) {
    const connections = this._connections.get(connection.peer);
    if (connections) {
      const index = connections.indexOf(connection);
      if (index !== -1)
        connections.splice(index, 1);
    }
    this._lostMessages.delete(connection.connectionId);
  }
  getConnection(peerId, connectionId) {
    const connections = this._connections.get(peerId);
    if (!connections)
      return null;
    for (const connection of connections) {
      if (connection.connectionId === connectionId)
        return connection;
    }
    return null;
  }
  _delayedAbort(type, message) {
    setTimeout(() => {
      this._abort(type, message);
    }, 0);
  }
  _abort(type, message) {
    (0, $257947e92926277a$export$2e2bcd8739ae039).error("Aborting!");
    this.emitError(type, message);
    if (!this._lastServerId)
      this.destroy();
    else
      this.disconnect();
  }
  destroy() {
    if (this.destroyed)
      return;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Destroy peer with ID:${this.id}`);
    this.disconnect();
    this._cleanup();
    this._destroyed = true;
    this.emit("close");
  }
  _cleanup() {
    for (const peerId of this._connections.keys()) {
      this._cleanupPeer(peerId);
      this._connections.delete(peerId);
    }
    this.socket.removeAllListeners();
  }
  _cleanupPeer(peerId) {
    const connections = this._connections.get(peerId);
    if (!connections)
      return;
    for (const connection of connections)
      connection.close();
  }
  disconnect() {
    if (this.disconnected)
      return;
    const currentId = this.id;
    (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Disconnect peer with ID:${currentId}`);
    this._disconnected = true;
    this._open = false;
    this.socket.close();
    this._lastServerId = currentId;
    this._id = null;
    this.emit("disconnected", currentId);
  }
  reconnect() {
    if (this.disconnected && !this.destroyed) {
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Attempting reconnection to server with ID ${this._lastServerId}`);
      this._disconnected = false;
      this._initialize(this._lastServerId);
    } else if (this.destroyed)
      throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
    else if (!this.disconnected && !this.open)
      (0, $257947e92926277a$export$2e2bcd8739ae039).error("In a hurry? We're still trying to make the initial connection!");
    else
      throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
  }
  listAllPeers(cb = (_) => {
  }) {
    this._api.listAllPeers().then((peers) => cb(peers)).catch((error6) => this._abort((0, $78455e22dea96b8c$export$9547aaa2e39030ff).ServerError, error6));
  }
}
var $dcf98445f54823f4$var$NullValue = Symbol.for(null);

// cloud/cloud.js
class Cloud {
  #resolverPromesa = null;
  constructor(config, Localbase) {
    if (Cloud.intance)
      return Cloud.intance;
    if (!Localbase)
      throw new Error("Localbase no definido");
    if (!Localbase.uid)
      throw new Error("Localbase.uid no definido");
    if (!Localbase.events)
      throw new Error("Localbase.events no definido");
    if (!Localbase.iDB)
      throw new Error("Localbase.iDB no definido");
    if (!Localbase.transacciones)
      throw new Error("Localbase.transacciones no definido");
    this.Localbase = Localbase;
    this.config = config;
    this.connecciones = [];
    if (!this.config)
      throw new Error("Configuracion no definida");
    if (!this.config.key)
      throw new Error("ApiKey no definido");
    if (!this.config.host)
      throw new Error("host no definido");
    if (!this.config.debug)
      this.config.debug = 1;
    this.promesaConexion = new Promise((resolve, reject) => {
      this.#resolverPromesa = resolve;
    });
    const changes = (data) => {
      console.log("notificando cambios");
      this.connecciones.forEach((conn) => {
        if (conn.open)
          conn.send({ event: "change", data });
      });
    };
    this.Localbase.iDB.getItem("peerId").then((peerId) => {
      if (peerId) {
        this.peer = new $416260bce337df90$export$ecd1fc136c422448(peerId, this.config);
      } else {
        this.peer = new $416260bce337df90$export$ecd1fc136c422448(this.config);
      }
      this.peer.on("open", (id) => {
        console.log("peerId", id);
        this.Localbase.events.on("change", changes);
        if (!peerId) {
          this.Localbase.iDB.setItem("peerId", id);
        }
        this.#resolverPromesa();
      });
      this.peer.on("connection", (conn) => {
        console.log("connection", conn.peer);
        this.connecciones.push(conn);
        conn.on("data", async (data) => {
          if (data.event === "change") {
            await this.Localbase.update(data.data);
          }
        });
      });
      this.peer.on("error", (error6) => {
        console.error(error6);
        this.Localbase.events.off("change", changes);
      });
    });
    Cloud.intance = this;
  }
  async init() {
    await this.promesaConexion;
  }
  async addNode(nodeId) {
    if (!nodeId)
      throw new Error("nodeId no definido");
    let peers = await Cloud.intance.Localbase.iDB.getItem("peers");
    if (!peers)
      peers = JSON.stringify([]);
    peers = JSON.parse(peers);
    peers = peers.filter((peer) => peer !== nodeId);
    peers.push(nodeId);
    if (Cloud.intance.peer.id === nodeId)
      return;
    const cone = Cloud.intance.peer.connect(nodeId);
    cone.on("open", () => {
      console.log("cone", cone.peer, cone.open);
      Cloud.intance.connecciones.push(cone);
    });
    await Cloud.intance.Localbase.iDB.setItem("peers", JSON.stringify(peers));
  }
  myId() {
    return Cloud.intance.peer.id;
  }
  async removeNode(nodeId) {
    if (!nodeId)
      throw new Error("nodeId no definido");
    let peers = await Cloud.intance.Localbase.iDB.getItem("peers");
    if (!peers)
      peers = JSON.stringify([]);
    peers = JSON.parse(peers);
    peers = peers.filter((peer) => peer !== nodeId);
    await Cloud.intance.Localbase.iDB.setItem("peers", JSON.stringify(peers));
  }
}
export {
  CloudLocalbase as Localbase,
  ConnectRebase,
  Cloud
};
