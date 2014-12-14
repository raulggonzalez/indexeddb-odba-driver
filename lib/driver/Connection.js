/**
 * An IndexedDB connection.
 *
 * @class
 * @protected
 *
 * @property {IndexedDBDatabase} database The database connected to.
 * @property {Boolean} connected          Is the connection opened?
 *
 * @param {Object} config The config object: database (String).
 */
function IndexedDBConnection(config) {
  Object.defineProperty(this, "config", {value: config});
  Object.defineProperty(this, "database", {value: undefined, enumerable: true, writable: true});
  Object.defineProperty(this, "transaction", {value: undefined, writable: true});

  try {
    Object.defineProperty(this, "indexedDB", {value: Modernizr.indexedDB});
  } catch (e) {
    Object.defineProperty(this, "indexedDB", {value: window.indexedDB});
  }
}

/**
 * Generates a clone of this connection.
 * The clone connection will be closed.
 *
 * @private
 *
 * @returns {IndexedDBConnection}
 */
IndexedDBConnection.prototype.clone = function clone() {
  return new IndexedDBConnection(util._extend({}, this.config));
};

/**
 * Is it connected?
 *
 * @returns {Boolean}
 */
IndexedDBConnection.prototype.__defineGetter__("connected", function() {
  return (this.database !== undefined && this.database !== null);
});

/**
 * Opens the connection.
 *
 * @param {Function} [callback] The function to call: fn(error, db).
 *
 * @example
 * cx.open(function(error, db) { ... });
 */
IndexedDBConnection.prototype.open = function open(callback) {
  var self = this, req, indexedDB = this.indexedDB;

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

  //(2) callback
  if (callback) callback();
};

/**
 * Creates a database.
 * This operation only can be used to create a database when not connected;
 * if connected, error.
 *
 * @param {Function} ddl        The function to create the schema: fn(db).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example Empty database
 * cx.createDatabase();
 * cx.createDatabase(null, callback);
 *
 * @example Non-empty database
 * cx.createDatabase(function(db) { ... });
 * cx.createDatabase(function(db) { ... }, function(error) { ... });
 */
IndexedDBConnection.prototype.createDatabase = function createDatabase(ddl, callback) {
  var self = this, indexedDB = this.indexedDB, req;

  //(1) pre: connected?
  if (this.connected) {
    throw new Error("Connection opened.");
  }

  //(2) open connection
  req = indexedDB.open(this.config.database);

  //(3) create
  req.onupgradeneeded = function(e) {
    self.transaction = new IndexedDBTransaction(e.currentTarget.transaction, self);
    self.database = new IndexedDBDatabase(self, e.target.result);

    if (ddl) ddl(self.database);
  };

  req.onsuccess = function() {
    self.close(callback);
  };

  req.onerror = function(e) {
    self.close(function() {
      if (callback) callback(e);
    });
  };
};

/**
 * Alters the schema definition.
 *
 * Due to the IndexedDB spec, we only can alter the database during
 * a new opening. If the connection is opened, error.
 *
 * The operations fails whether another connection is opened in the database.
 *
 * @param {Function} ddl        The function to alter the schema: fn(db).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.alterDatabase(function(db) { ... });
 * cx.alterDatabase(function(db) { ... }, function(error) { ... });
 */
IndexedDBConnection.prototype.alterDatabase = function alterDatabase(ddl, callback) {
  var self = this, indexedDB = this.indexedDB, req;

  //(1) pre: connected? and arguments
  if (this.connected) {
    throw new Error("Connection opened.");
  }

  if (arguments.length < 1) {
    throw new Error("Operation to alter schema expected.");
  }

  //(2) open connection
  req = indexedDB.open(this.config.database);

  req.onerror = function(e) {
    if (callback) callback(e);
  };

  //(3) alter
  req.onsuccess = function(e) {
    var db = e.target.result, version, req;

    //get next version number
    version = db.version + 1;

    //close connection used to get next version number
    db.close();

    //alter with new connection, such as required by IndexedDB spec
    req = indexedDB.open(self.config.database, version);

    req.onupgradeneeded = function(e) {
      self.database = new IndexedDBDatabase(self, e.target.result);
      self.transaction = new IndexedDBTransaction(e.currentTarget.transaction, self);

      ddl(self.database);
    };

    req.onerror = function(e) {
      self.close(function() {
        if (callback) callback(e);
      });
    };

    req.onsuccess = function() {
      self.close(callback);
    };
  };
};

/**
 * Drops the connection database.
 *
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.deleteDatabase();
 * cx.deleteDatabase(function(error) { ... });
 */
IndexedDBConnection.prototype.dropDatabase = function dropDatabase(callback) {
  this.indexedDB.deleteDatabase(this.config.database);
  this.close(callback);
};

/**
 * Returns if a database exists.
 * This operation is not supported by all browsers.
 *
 * @param {String} name       The database name.
 * @param {Function} callback The function to call: fn(error, exists).
 *
 * @example Checking connection database
 * cx.hasDatabase(function(error, exists) { ... });
 *
 * @example Checking another database
 * cx.hasDatabase("mydb", function(error, exists) { ... });
 */
IndexedDBConnection.prototype.hasDatabase = function hasDatabase(name, callback) {
  var indexedDB = this.indexedDB, req;

  //(1) pre
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  } else if (arguments.length == 1) {
    callback = arguments[0];
    name = this.config.database;
  }

  //(2) check
  if (util.getBrowserName() == "Chrome") {
    req = this.indexedDB.webkitGetDatabaseNames();

    req.onsuccess = function(e) {
      callback(undefined, e.target.result.contains(name));
    };

    req.onerror = function(e) {
      callback(e);
    };
  } else {
    var existed = true;

    req = indexedDB.open(name);

    req.onupgradeneeded = function() {
      existed = false;
    };

    req.onsuccess = function() {
      req.result.close();

      if (existed) {
        indexedDB.deleteDatabase(self);
      }

      callback(undefined, existed);
    };
  }
};

/**
 * Begins a transaction. If currently there's an active transaction,
 * then returns this transaction; otherwise, it begins and returns
 * a new transaction.
 *
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