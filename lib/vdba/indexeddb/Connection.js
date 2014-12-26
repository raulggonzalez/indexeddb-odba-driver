(function() {

/**
 * An IndexedDB connection.
 *
 * @class vdba.indexeddb.IndexedDBConnection
 * @extends vdba.Connection
 * @protected
 *
 * @param {Object} config The config object: database (String).
 */
function IndexedDBConnection(config) {
  /**
   * The configuration.
   *
   * @name config
   * @type {Object}
   * @memberof vdba.indexeddb.IndexedDBConnection#
   * @private
   */
  Object.defineProperty(this, "config", {value: config});

  /**
   * The database connected to.
   *
   * @name database
   * @type {vdba.indexeddb.IndexedDBDatabase}
   * @memberof vdba.indexeddb.IndexedDBConnection#
   */
  Object.defineProperty(this, "database", {value: undefined, enumerable: true, writable: true});

  /**
   * The transaction.
   *
   * @name transaction
   * @type {vdba.indexeddb.IndexedDBTransaction}
   * @memberof vdba.indexeddb.IndexedDBConnection#
   * @private
   */
  Object.defineProperty(this, "transaction", {value: undefined, writable: true});

  try {
    Object.defineProperty(this, "indexedDB", {value: Modernizr.indexedDB});
  } catch (e) {
    Object.defineProperty(this, "indexedDB", {value: window.indexedDB});
  }
}

vdba.util.inherits(IndexedDBConnection, vdba.Connection);
Object.defineProperty(vdba.indexeddb, "IndexedDBConnection", {value: IndexedDBConnection});

/**
 * The server object.
 *
 * @name server
 * @type {vdba.indexeddb.IndexedDBServer}
 * @memberof vdba.indexeddb.IndexedDBConnection#
 */
IndexedDBConnection.prototype.__defineGetter__("server", function() {
  if (!this._server) {
    Object.defineProperty(this, "_server", {value: new vdba.indexeddb.IndexedDBServer(this), writable: true});
  }

  return this._server;
});

/**
 * Generates a clone of this connection.
 * The clone connection will be closed.
 *
 * @name clone
 * @function
 * @memberof vdba.indexeddb.Connection#
 * @private
 *
 * @returns {IndexedDBConnection}
 */
IndexedDBConnection.prototype.clone = function clone() {
  return new IndexedDBConnection(vdba.util._extend({}, this.config));
};

/**
 * Is it connected?
 *
 * @name connected
 * @type {Boolean}
 * @memberof vdba.indexeddb.IndexedDBConnection#
 */
IndexedDBConnection.prototype.__defineGetter__("connected", function() {
  return (this.database !== undefined && this.database !== null);
});

/**
 * Opens the connection.
 *
 * @name open
 * @function
 * @memberof vdba.indexeddb.IndexedDBConnection#
 *
 * @param {Function} [callback] The function to call: fn(error, db).
 *
 * @example
 * cx.open(function(error, db) { ... });
 */
IndexedDBConnection.prototype.open = function open(callback) {
  var self = this, req, indexedDB = this.indexedDB;
  var IndexedDBDatabase = vdba.indexeddb.IndexedDBDatabase;

  //(1) pre: already opened?
  if (this.connected) {
    if (callback) callback(undefined, this.database);
    return;
  }

  //(2) pre: arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  }

  //(3) open
  if (this.config.version) req = indexedDB.open(this.config.database, this.config.version);
  else req = indexedDB.open(this.config.database);

  req.onsuccess = function(e) {
    self.database = new IndexedDBDatabase(self, e.target.result);
    if (callback) callback(undefined, self.database);
  };

  req.onerror = function(e) {
    if (callback) callback(e);
  };
};

/**
 * Closes the connection.
 *
 * @name close
 * @function
 * @memberof vdba.indexeddb.IndexedDBConnection#
 *
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.close();
 * cx.close(function(error) { ... });
 */
IndexedDBConnection.prototype.close = function close(callback) {
  //(1) close
  if (this.database && this.database.native) this.database.native.close();
  this.database = undefined;
  this.transaction = undefined;
  this.server = undefined;

  //(2) callback
  if (callback) callback();
};

/**
 * Begins a transaction. If currently there's an active transaction,
 * then returns this transaction; otherwise, it begins and returns
 * a new transaction.
 *
 * @name beginTransaction
 * @function
 * @memberof vdba.indexeddb.IndexedDBConnection#
 * @private
 *
 * @param {String} mode             The transaction mode: readonly (default) or readwrite.
 * @param {String|String[]} stores  The object store names.
 * @param {Object} handlers         The event handlers: error, abort and complete.
 *
 * @returns {IndexedDBTransaction}
 *
 * @example
 * tran = cx.beginTransaction();  //readwrite with all object stores
 * tran = cx.beginTransaction([store1, store2]);  //readwrite with store1 and store2
 * tran = cx.beginTransaction({handlers});        //readwrite with all stores and handlers specified
 * tran = cx.beginTransaction("readonly");  //readonly with all object stores
 * tran = cx.beginTransaction("readonly", "user");
 * tran = cx.beginTransaction("readonly", "user", {error: function(e) { ... }});
 */
IndexedDBConnection.prototype.beginTransaction = function beginTransaction(mode, stores, handlers) {
  var IndexedDBTransaction = vdba.indexeddb.IndexedDBTransaction;
  var tran;

  //(1) pre: arguments
  if (arguments.length == 1) {
    if (arguments[0] instanceof Array) {
      stores = arguments[0];
      mode = handlers = undefined;
    } else if (typeof(arguments[0]) == "object") {
      handlers = arguments[0];
      mode = stores = undefined;
    }
  } else if (arguments.length == 2) {
    if (arguments[0] instanceof Array) {
      handlers = arguments[1];
      stores = arguments[0];
      mode = undefined;
    } else if (!(arguments[1] instanceof Array) && typeof(arguments[1]) != "string") {
      handlers = arguments[1];
      stores = undefined;
    }
  }

  mode = (mode || "readwrite");
  if (typeof(stores) == "string") stores = [stores];
  if (!handlers) handlers = {};

  //(2) get transaction
  if (this.hasTransaction()) {
    tran = this.transaction;

    if (tran.mode == "readonly" && mode != "readonly") {
      throw new Error("Active transaction is read-only and it can't be promoted to another mode.");
    }

    if (tran.mode == "readonly" || tran.mode == "readwrite") {
      if (!stores) {
        stores = this.database.objectStoreNames;
      } else if (stores.length < 1) {
        throw new Error("Object store(s) expected.");
      }

      for (var i = 0; i < stores.length; ++i) {
        var store = stores[i];

        if (tran.objectStoreNames.indexOf(store) < 0) {
          throw new Error("There's an active transaction and the new transaction can't be integrated therein. " +
                          "The object store '" + store + "' isn't in the active transaction.");
        }
      }
    }
  } else {
    if (!stores) {
      stores = this.database.objectStoreNames;
    } else if (stores.length < 1) {
      throw new Error("Object store(s) expected.");
    }

    tran = new IndexedDBTransaction(this.database.native.transaction(stores, mode), this, stores);
  }

  tran.addHandlers(handlers);

  //(3) set transaction to this connection
  this.transaction = tran;

  //(4) return transaction
  return tran;
};

/**
 * Returns if currently it has an active transaction.
 *
 * @name hasTransaction
 * @function
 * @memberof vdba.indexeddb.IndexedDBConnection#
 *
 * @param {String} mode The mode to query: versionchange, readonly or readwrite.
 *
 * @returns {Boolean}
 *
 * @example
 * cx.hasTransaction()
 * cx.hasTransaction("versionchange")
 */
IndexedDBConnection.prototype.hasTransaction = function hasTransaction(mode) {
  var tran, res = false;

  //(1) get tran
  tran = this.transaction;

  //(2) check
  if (tran) {
    if (!mode) res = true;
    else res = (tran.mode == mode);
  }

  //(3) return
  return res;
};

/**
 * Runs a function into a new transaction.
 * This method only can be called if the connection has no active transaction.
 *
 * @name runTransaction
 * @function
 * @memberof vdba.indexeddb.IndexedDBConnection#
 *
 * @param {String} mode         The transaction mode: readonly or readwrite.
 * @param {Function} op         The operation to run into a transaction.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.runTransaction("readonly", function(db) { ... });
 * cx.runTransaction("readonly", function(db) { ... }, function(error) { ... });
 */
IndexedDBConnection.prototype.runTransaction = function runTransaction(mode, op, callback) {
  var tran;

  //(1) pre: arguments and no active transaction
  if (arguments.length < 2) {
    throw new Error("Transaction mode and operation expected.");
  }

  if (this.hasTransaction()) {
    throw new Error("A transaction is active. IndexedDB can't nest transactions.");
  }

  //(3) run op
  tran = this.beginTransaction(mode, {
    error: function(e) { if (callback) callback(e); },
    complete: function() { if (callback) callback(); }
  });

  op(this.database);
  //if (callback) callback();
};

})();