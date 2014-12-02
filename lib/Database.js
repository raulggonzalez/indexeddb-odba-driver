/**
 * An IndexedDB database.
 *
 * @class
 * @protected
 *
 * @param {IndexedDBConnection} cx  The connection.
 * @param {IDBDatabase} db          The native database.
 */
function IndexedDBDatabase(cx, db, tran) {
  Object.defineProperty(this, "connection", {value: cx});
  Object.defineProperty(this, "name", {value: db.name, enumerable: true});
  Object.defineProperty(this, "version", {value: db.version, enumerable: true});
  Object.defineProperty(this, "native", {value: db});
}

/**
 * Returns the native active transaction of the connection.
 *
 * @private
 */
IndexedDBDatabase.prototype.__defineGetter__("activeTransaction", function() {
  return this.connection.activeTransaction;
});

/**
 * Creates a new object store.
 * Note: This operation must be run into a version change transaction.
 *
 * @param {String} name       The object store name.
 * @param {Object} options    The creation options: keyPath (String) and autoIncrement (Boolean).
 * @param {Function} callback The function to call: fn(error, store).
 */
IndexedDBDatabase.prototype.createTable = function createTable(name, options, callback) {
  var tran;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Table name expected.");
  } else if (arguments.length == 2) {
    if (arguments[1] instanceof Function) {
      callback = arguments[1];
      options = undefined;
    }
  }

  //(2) get tran
  tran = this.activeTransaction;

  if (!tran) {
    if (callback) callback(new Error("Database.createTable() only into Connection.createDatabase() or Connection.alterDatabase()."));
    return;
  }

  //(2) create
  if (this.native.objectStoreNames.contains(name)) {
    if (callback) callback(new Error("Object store '" + name + "' already exists."));
  } else {
    var store = this.native.createObjectStore(name, options);
    if (callback) callback(undefined, store);
  }
};

/**
 * Creates a new object stores.
 * Note: This operation must be run into a version change transaction.
 *
 * @param {Object[]} stores   The object stores: name (String), keyPath (String) and autoIncrement (Boolean).
 * @param {Function} callback The function to call: fn(error, stores).
 */
IndexedDBDatabase.prototype.createTables = function createTables(stores, callback) {
  var tran;
  var res = [];

  //(1) get tran
  tran = this.activeTransaction;

  if (!tran) {
    if (callback) callback(new Error("Database.createTables() only into Connection.createDatabase() or Connection.alterDatabase()."))
    return;
  }

  //(2) create
  for (var i = 0; i < stores.length; ++i) {
    var store = stores[i];
    res.push(this.native.createObjectStore(store.name, store));
  }

  if (callback) callback(undefined, res);
};

/**
 * Does the object store exist?
 *
 * @param {String} name       The object store name.
 * @param {Function} callback The function to call: fn(exists).
 */
IndexedDBDatabase.prototype.hasTable = function hasTable(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table name and callback expected.");
  }

  //(2) check
  callback(undefined, this.native.objectStoreNames.contains(name));
};

/**
 * Do the object stores exist?
 *
 * @param {String[]} names    The object store names.
 * @param {Function} callback The function to call: fn(exist).
 */
IndexedDBDatabase.prototype.hasTables = function hasTables(names, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table names and callback expected.");
  }

  //(2) check
  if (callback) {
    if (names.length == 0) {
      callback(undefined, false);
    } else {
      var res = true;

      for (var i = 0, stores = this.native.objectStoreNames; i < names.length; ++i) {
        var name = names[i];
        if (!stores.contains(name)) {
          res = false;
          break;
        }
      }

      callback(undefined, res);
    }
  }
};

/**
 * Returns an object store.
 *
 * @param {String} name       The object store name.
 * @param {Function} callback The function to call: fn(error, store).
 */
IndexedDBDatabase.prototype.findTable = function findTable(name, callback) {
  var self = this;

  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table name and callback expected.");
  }

  //(2) check
  if (this.native.objectStoreNames.contains(name)) {
    var keyPath, tran, store;

    //get tran to know key path
    tran = this.native.transaction([name], "readonly");

    tran.onerror = function(e) {
      callback(e);
    };

    tran.oncomplete = function(e) {
      callback(undefined, new IndexedDBTable(self, name, keyPath));
    };

    //get key path
    store = tran.objectStore(name);
    keyPath = store.keyPath;
  } else {
    callback();
  }
};

/**
 * Drops a object store.
 * Note: This operation must be run into a version change transaction.
 *
 * @param {String} name       The object store name.
 * @param {Function} callback The function to call: fn(error).
 */
IndexedDBDatabase.prototype.dropTable = function dropTable(name, callback) {
  var tran;

  //(1) get tran
  tran = this.activeTransaction;

  if (!tran) {
    if (callback) callback(new Error("Database.dropTable() only into Connection.alterDatabase()."));
    return;
  }

  //(2) drop
  if (this.native.objectStoreNames.contains(name)) {
    this.native.deleteObjectStore(name);
  }

  if (callback) callback();
};

/**
 * Returns an index.
 *
 * @param {String} table      The table name.
 * @param {String} index      The index name.
 * @param {Function} callback The function to call: fn(error, index).
 *
 * @example
 * db.findIndex("user", "ix_username", function(error, ix) { ... });
 */
IndexedDBDatabase.prototype.findIndex = function findIndex(table, index, callback) {
  var tran, store, ix;

  //(1) arguments
  if (arguments.length < 3) {
    throw new Error("Table name, index name and callback expected.");
  }

  //(2) get index
  if (this.native.objectStoreNames.contains(table)) {
    //get transaction
    tran = this.activeTransaction || this.native.transaction([table], "readonly");

    //get store
    store = tran.objectStore(table);

    //get index
    if (store.indexNames.contains(index)) {
      ix = store.index(index);
    }
  }

  if (ix) callback(undefined, new IndexedDBIndex(this, store, ix));
  else callback();
};

/**
 * Checks whether a table has a specified index.
 *
 * @param {String} table      The object store name.
 * @param {String} ix         The index name.
 * @param {Function} callback The function to call: fn(error, exist).
 */
IndexedDBDatabase.prototype.hasIndex = function hasIndex(table, ix, callback) {
  var tran, store, res;

  //(1) arguments
  if (arguments.length < 3) {
    throw new Error("Table name, index name and callback expected.");
  }

  //(2) check object store
  if (!this.native.objectStoreNames.contains(table)) {
    return callback(undefined, false);
  };

  //(3) get tran
  tran = this.activeTransaction;

  if (!tran) {
    tran = this.native.transaction([table], "readonly");

    tran.onerror = function(e) {
      callback(e);
    };

    tran.oncomplete = function(e) {
      callback(undefined, res);
    };
  }

  //(3) check
  res = tran.objectStore(table).indexNames.contains(ix);

  if (tran === this.activeTransaction) {
    callback(undefined, res);
  }
};

/**
 * Creates an index.
 * Note: This method must be run into a version change transaction.
 *
 * @param {String} table      The object store name.
 * @param {String} index      The index name.
 * @param {String} col        The indexing column.
 * @param {Object} options    The index options: unique (boolean).
 * @param {Function} callback The function to call: fn(error).
 *
 * @example
 * db.createIndex("user", "ix_username", "username");
 * db.createIndex("user", "ix_username", "username", function(error) { ... });
 * db.createIndex("user", "ix_username", "username", {unique: true});
 * db.createIndex("user", "ix_username", "username", {unique: true}, function(error) { ... });
 */
IndexedDBDatabase.prototype.createIndex = function createIndex(table, index, col, options, callback) {
  var tran, store;

  //(1) arguments
  if (arguments.length < 3) {
    throw new Error("Table name, index name and indexing column name expected.");
  } else if (arguments.length == 4) {
    if (arguments[3] instanceof Function) {
      callback = arguments[3];
      options = undefined;
    }
  }

  //(2) get tran
  tran = this.activeTransaction;

  if (!tran) {
    if (callback) callback(new Error("Database.createIndex() only into Connection.createDatabase() or Connection.alterDatabase()."));
    return;
  }

  //(2) get store
  if (!this.native.objectStoreNames.contains(table)) {
    if (callback(new Error("Object store '" + table + "' doesn't exist.")));
    return;
  }

  store = tran.objectStore(table);

  //(3) create index
  if (store.indexNames.contains(index)) {
    if (callback) callback(new Error("Index '" + index + "' on '" + table + "' already exists."));
  } else {
    store.createIndex(index, col, options);
    if (callback) callback();
  }
};

/**
 * Drops an index.
 *
 * @param {String} table      The object store name.
 * @param {String} index      The index name.
 * @param {Function} callback The function to call: fn(error).
 *
 * @example
 * db.dropIndex("user", "ix_username");
 * db.dropIndex("user", "ix_username", function(error) { ... });
 */
IndexedDBDatabase.prototype.dropIndex = function dropIndex(table, index, callback) {
  var tran, store;

  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table name and index name expected.");
  }

  //(2) get tran
  tran = this.activeTransaction;

  if (!tran) {
    if (callback) callback(new Error("Database.dropIndex() only into Connection.alterDatabase()."));
    return;
  }

  //(2) get store
  if (!this.native.objectStoreNames.contains(table)) {
    if (callback) callback();
    return;
  }

  store = tran.objectStore(table);

  //(3) drop index
  if (store.indexNames.contains(index)) store.deleteIndex(index);
  if (callback) callback();
};