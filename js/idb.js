// idb.js — minimal IndexedDB wrapper for MarkLens document library.
// Exposes global mdDB (callbacks). No vendors, no network.
(function () {
  'use strict';
  var DB_NAME = 'marklens';
  var DB_VERSION = 1;
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('no indexeddb')); return; }
      var req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = req.result;
        if (!db.objectStoreNames.contains('docs')) {
          db.createObjectStore('docs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('snapshots')) {
          db.createObjectStore('snapshots', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('themes')) {
          db.createObjectStore('themes', { keyPath: 'id' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function withStore(storeName, mode, cb) {
    openDB().then(function (db) {
      try {
        var tx = db.transaction(storeName, mode);
        var store = tx.objectStore(storeName);
        var result = cb(store, tx);
        tx.oncomplete = function () { /* noop */ };
        tx.onerror = function (e) { console.error('[MD][idb] tx error', e && e.target && e.target.error); };
        return result;
      } catch (err) {
        console.error('[MD][idb] store error', err);
      }
    }).catch(function (err) {
      console.error('[MD][idb] open error', err);
    });
  }

  globalThis.mdDB = {
    ready: function (cb) {
      openDB().then(function () { cb(true); }, function () { cb(false); });
    },

    all: function (storeName, cb) {
      withStore(storeName, 'readonly', function (store) {
        var req = store.getAll();
        req.onsuccess = function () { if (cb) cb(req.result || []); };
        req.onerror = function () { if (cb) cb([]); };
        return req;
      });
    },

    get: function (storeName, key, cb) {
      withStore(storeName, 'readonly', function (store) {
        var req = store.get(key);
        req.onsuccess = function () { if (cb) cb(req.result || null); };
        req.onerror = function () { if (cb) cb(null); };
        return req;
      });
    },

    put: function (storeName, obj, cb) {
      withStore(storeName, 'readwrite', function (store) {
        var req = store.put(obj);
        req.onsuccess = function () { if (cb) cb(true, obj); };
        req.onerror = function () { if (cb) cb(false, null); };
        return req;
      });
    },

    del: function (storeName, key, cb) {
      withStore(storeName, 'readwrite', function (store) {
        var req = store.delete(key);
        req.onsuccess = function () { if (cb) cb(true); };
        req.onerror = function () { if (cb) cb(false); };
        return req;
      });
    }
  };
})();
