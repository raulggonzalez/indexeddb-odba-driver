/**
 * An IndexedDB connection.
 *
 * @class
 * @protected
 *
 * @param {Object} config The config object: database (String).
 */
function IndexedDBConnection(config) {
  Object.defineProperty(this, "config", {value: config});
  Object.defineProperty(this, "activeTransaction", {value: undefined, writable: true});

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
 * @returns {IndexedDBConnection}
 */
IndexedDBConnection.prototype.clone = function clone() {
  return new IndexedDBConnection(util._extend({}, this.config));
};

/**
 * Opens the connection.
 *
 * @param {Function} callback The function to call: fn(error, db).
 *
 * @example
 * cx.open(function(error, db) { ... });
 */
IndexedDBConnection.prototype.open = function open(callback) {
  var self = this;
  var req;
  var indexedDB = this.indexedDB;

  //(1) pre: already opened?
  if (this.connected) {
    if (callback) callback(undefined, this.database);

    return;
  }

  //(2) arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  }

  //(3) open
  if (this.config.version) req = indexedDB.open(this.config.database, this.config.version);
  else req = indexedDB.open(this.config.database);

  req.onsuccess = function(e) {
    Object.defineProperty(self, "database", {
      value: new IndexedDBDatabase(self, e.target.result),
      enumerable: true,
      configurable: true
    });

    if (callback) callback(undefined, self.database);
  };

  req.onerror = function(e) {
    if (callback) callback(e);
  };
};

/**
 * Is it connected?
 */
IndexedDBConnection.prototype.__defineGetter__("connected", function() {
  return (this.database !== undefined && this.database !== null);
});

/**
 * Closes the connection.
 *
 * @param {Function} callback The function to call: fn(error).
 */
IndexedDBConnection.prototype.close = function close(callback) {
  if (this.database) this.database.native.close();
  delete this.database;
  if (callback) callback();
};

/**
 * Creates a database.
 * This operation only can be used to create a database when not connected;
 * if connected, error.
 *
 * @param {Function} ddl      The function to create the schema: fn(db).
 * @param {Function} callback The function to call: fn(error).
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
  var self = this;
  var indexedDB = this.indexedDB;
  var req;

  //(1) pre
  if (this.connected) {
    throw new Error("Connection opened.");
  }

  //(2) open connection
  req = indexedDB.open(this.config.database, 1);

  req.onerror = function(e) {
    self.activeTransaction = undefined;
    if (callback) callback(e);
  };

  //(3) create
  req.onupgradeneeded = function(e) {
    self.activeTransaction = e.currentTarget.transaction;
    if (ddl) ddl(new IndexedDBDatabase(self, e.target.result));
  };

  req.onsuccess = function(e) {
    //close upgrade transaction and connection
    self.activeTransaction = undefined;
    e.target.result.close();

    //invoke callback
    if (callback) callback();
  };
};

/**
 * Alters the schema definition.
 *
 * Due to the IndexedDB spec, we only can alter the database during
 * a new opening. If connected, the connection will be closed to apply
 * the changes and, next, will be reopened.
 *
 * The operations fails whether another connection is opened in the same database.
 *
 * @param {Function} ddl      The function to alter the schema: fn(db).
 * @param {Function} callback The function to call: fn(error).
 *
 * @example
 * cx.alterDatabase(function(db) { ... });
 * cx.alterDatabase(function(db) { ... }, function(error) { ... });
 */
IndexedDBConnection.prototype.alterDatabase = function alterDatabase(ddl, callback) {
  var self = this;
  var indexedDB = this.indexedDB;
  var reopen;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Operation to alter schema expected.");
  }

  //(2) alter
  if (this.connected) {
    reopen = true;
    closeAndAlter();
  } else {
    reopen = false;
    alter();
  }

  //helper functions
  function alter() {
    //(1) open connection to get next version number
    var req = indexedDB.open(self.config.database);

    req.onerror = function(e) {
      if (callback) callback(e);
    };

    //(2) get next version number
    req.onsuccess = function(e) {
      var db = e.target.result;
      var version;

      //next version number
      version = db.version + 1;

      //close connection used to get next version number
      db.close();

      //alter with new connection, such as required by IndexedDB spec
      var req = indexedDB.open(self.config.database, version);

      req.onupgradeneeded = function(e) {
        self.activeTransaction = e.currentTarget.transaction;
        ddl(new IndexedDBDatabase(self, e.target.result));
      };

      req.onerror = function(e) {
        self.activeTransaction = undefined;
        if (callback) callback(e);
      };

      req.onsuccess = function(e) {
        //close upgrade transaction and connection
        self.activeTransaction = undefined;
        e.target.result.close();

        //invoke callback
        if (reopen) self.open(callback);
        else if (callback) callback();
      };
    };
  }

  function closeAndAlter() {
    self.close(function(error) {
      if (error) {
        if (callback) return callback(error);
      } else {
        alter();
      }
    });
  }
};

/**
 * Drops the connection database.
 *
 * @param {Function} callback The function to call: fn(error).
 *
 * @example
 * cx.deleteDatabase(function(error) { ... });
 */
IndexedDBConnection.prototype.dropDatabase = function dropDatabase(callback) {
  this.indexedDB.deleteDatabase(this.config.database);
  if (callback) callback();
};

/**
 * Returns if a database exists.
 * This operation is not supported by all browers.
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
  var req;

  //(1) pre
  if (!this.indexedDB.webkitGetDatabaseNames) {
    return callback(new Error("Non-supported operation."));
  }

  if (arguments.length == 1) {
    callback = arguments[0];
    name = undefined;
  }

  //(2) determine database name
  name = (name || this.config.database);

  //(3) check
  req = this.indexedDB.webkitGetDatabaseNames();

  req.onsuccess = function(e) {
    if (callback) callback(undefined, e.target.result.contains(name));
  };

  req.onerror = function(e) {
    if (callback) callback(e);
  };
};