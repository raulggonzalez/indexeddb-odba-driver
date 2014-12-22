(function() {

/**
 * An IndexedDB server.
 *
 * @class odba.indexeddb.IndexedDBServer
 * @extends odba.Server
 * @protected
 */
function IndexedDBServer(cx) {
  IndexedDBServer.super_.call(this);

  /**
   * The connection to use.
   *
   * @name connection
   * @type {odba.indexeddb.IndexedDBConnection}
   * @memberof odba.indexeddb.IndexedDBServer#
   * @private
   */
  Object.defineProperty(this, "connection", {value: cx});
}

odba.util.inherits(IndexedDBServer, odba.Server);
Object.defineProperty(odba.indexeddb, "IndexedDBServer", {value: IndexedDBServer});

/**
 * The hostname.
 *
 * @name host
 * @type {String}
 * @memberof odba.indexeddb.IndexedDBServer#
 */
IndexedDBServer.prototype.__defineGetter__("host", function() {
  return "localhost";
});

IndexedDBServer.prototype.__defineGetter__("port", function() {
  throw new Error("Unsupported property.");
});

IndexedDBServer.prototype.__defineGetter__("version", function() {
  throw new Error("Unsupported property.");
});

/**
 * Creates a database.
 * This operation only can be used to create a database when not connected;
 * if connected, error.
 *
 * @name createDatabase
 * @function
 * @memberof odba.indexeddb.IndexedDBServer#
 *
 * @param {String} name         The database name.
 * @param {Function} ddl        The function to create the schema: fn(db).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example Empty database.
 * server.createDatabase("mydb");
 * server.createDatabase("mydb", null, callback);
 *
 * @example Non-empty database.
 * server.createDatabase("mydb", function(db) { ... });
 * server.createDatabase("mydb", function(db) { ... }, function(error) { ... });
 */
IndexedDBServer.prototype.createDatabase = function createDatabase(name, ddl, callback) {
  var IndexedDBDatabase = odba.indexeddb.IndexedDBDatabase;
  var IndexedDBTransaction = odba.indexeddb.IndexedDBTransaction;
  var cx = this.connection, indexedDB = cx.indexedDB;
  var self = this, req;

  //(1) pre: arguments
  if (!name || typeof(name) != "string") {
    throw new Error("Database name expected.");
  }

  //(2) pre: connected?
  if (cx.connected) {
    throw new Error("Connection opened.");
  }

  //(3) open connection
  req = indexedDB.open(name);

  //(4) create
  req.onupgradeneeded = function(e) {
    cx.transaction = new IndexedDBTransaction(e.currentTarget.transaction, cx);
    cx.database = new IndexedDBDatabase(cx, e.target.result);

    if (ddl) ddl(cx.database);
  };

  req.onsuccess = function() {
    cx.close(callback);
  };

  req.onerror = function(e) {
    cx.close(function() {
      if (callback) callback(e);
    });
  };
};

/**
 * Drops a database.
 * This operation only can be used as not connected; if connected, error.
 *
 * @name dropDatabase
 * @function
 * @memberof odba.indexeddb.IndexedDBServer#
 *
 * @param {String} name         The database name.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * server.dropDatabase("mydb");
 * server.dropDatabase("mydb", function(error) { ... });
 */
IndexedDBServer.prototype.dropDatabase = function dropDatabase(name, callback) {
  var req, self = this, cx = this.connection;

  //(1) pre: arguments
  if (!name || typeof(name) != "string") {
    throw new Error("Database name expected.");
  }

  //(2) pre: connected?
  if (cx.connected) {
    throw new Error("Connection opened.");
  }

  //(3) drop
  req = cx.indexedDB.deleteDatabase(name);

  req.onerror = function(e) {
    if (callback) callback(e);
  };

  req.onsuccess = function() {
    if (callback) callback();
  };
};

/**
 * Alters the schema definition.
 *
 * Due to the IndexedDB spec, we only can alter the database during
 * a new opening. If the connection is opened, error.
 *
 * This method is out of the ODBA spec.
 *
 * The operations fails whether another connection is opened in the database.
 *
 * @name alterDatabase
 * @function
 * @memberof odba.indexeddb.IndexedDBServer#
 *
 * @param {String} name         The database name.
 * @param {Function} ddl        The function to alter the schema: fn(db).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * svr.alterDatabase("mydb", function(db) { ... });
 * svr.alterDatabase("mydb", function(db) { ... }, function(error) { ... });
 */
IndexedDBServer.prototype.alterDatabase = function alterDatabase(name, ddl, callback) {
  var IndexedDBDatabase = odba.indexeddb.IndexedDBDatabase;
  var IndexedDBTransaction = odba.indexeddb.IndexedDBTransaction;
  var cx = this.connection, indexedDB = cx.indexedDB, req;

  //(1) pre: arguments
  if (!name || typeof(name) != "string") {
    throw new Error("Database name expected.");
  }

  if (!ddl) {
    throw new Error("Operation to alter schema expected.");
  }

  //(2) pre: connected?
  if (cx.connected) {
    throw new Error("Connection opened.");
  }

  //(3) open connection
  req = indexedDB.open(name);

  req.onerror = function(e) {
    if (callback) callback(e);
  };

  //(4) alter
  req.onsuccess = function(e) {
    var db = e.target.result, version, req;

    //get next version number
    version = db.version + 1;

    //close connection used to get next version number
    db.close();

    //alter with new connection, such as required by IndexedDB spec
    req = indexedDB.open(name, version);

    req.onupgradeneeded = function(e) {
      cx.database = new IndexedDBDatabase(cx, e.target.result);
      cx.transaction = new IndexedDBTransaction(e.currentTarget.transaction, cx);

      ddl(cx.database);
    };

    req.onerror = function(e) {
      cx.close(function() {
        if (callback) callback(e);
      });
    };

    req.onsuccess = function() {
      cx.close(callback);
    };
  };
};

/**
 * Checks whether a database exists.
 * This operation is not supported by all browsers.
 *
 * @name hasDatabase
 * @function
 * @memberof odba.indexeddb.IndexedDBServer#
 *
 * @param {String} name       The database name.
 * @param {Function} callback The function to call: fn(error, exists).
 *
 * @example
 * server.hasDatabase("mydb", function(error, exists) { ... });
 */
IndexedDBServer.prototype.hasDatabase = function hasDatabase(name, callback) {
  var cx = this.connection, indexedDB = cx.indexedDB, req, util = odba.util;

  //(1) pre: arguments
  if (!name || typeof(name) != "string") {
    throw new Error("Database name expected.");
  }

  if (!callback)  {
    throw new Error("Callback expected.");
  }

  //(2) check
  if (util.getBrowserName() == "Chrome") {
    req = indexedDB.webkitGetDatabaseNames();

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
        indexedDB.deleteDatabase(name);
      }

      callback(undefined, existed);
    };
  }
};

})();