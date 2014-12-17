(function() {

/**
 * An IndexedDB store.
 *
 * @class odba.indexeddb.IndexedDBTable
 * @protected
 *
 * @param {IndexedDBDatabase} db  The database.
 * @param {IDBStore} store        The store.
 */
function IndexedDBTable(db, store) {
  var IndexedDBIndex = odba.indexeddb.IndexedDBIndex;
  var indexes = {};
  var indexed = {};

  //(1) define properties
  /**
   * The database.
   *
   * @name database
   * @type {odba.indexeddb.IndexedDBDatabase}
   * @memberof odba.indexeddb.IndexedDBTable#
   */
  Object.defineProperty(this, "database", {value: db, enumerable: true});

  /**
   * The table name.
   *
   * @name name
   * @type {String}
   * @memberof odba.indexeddb.IndexedDBTable#
   */
  Object.defineProperty(this, "name", {value: store.name, enumerable: true});

  /**
   * The key path.
   *
   * @name keyPath
   * @type {String}
   * @memberof odba.indexeddb.IndexedDBTable#
   */
  Object.defineProperty(this, "keyPath", {value: store.keyPath, enumerable: true});

  /**
   * Auto increment?
   *
   * @name autoIncrement
   * @type {Boolean}
   * @memberof odba.indexeddb.IndexedDBTable#
   */
  Object.defineProperty(this, "autoIncrement", {value: store.autoIncrement, enumerable: true});

  /**
   * The connection.
   *
   * @name connection
   * @type {odba.indexeddb.IndexedDBConnection}
   * @memberof odba.indexeddb.IndexedDBTable#
   * @private
   */
  Object.defineProperty(this, "connection", {value: db.connection});

  /**
   * The indexes.
   *
   * @name indexes
   * @type {odba.indexeddb.IndexedDBIndex[]}
   * @memberof odba.indexeddb.IndexedDBTable#
   * @private
   */
  Object.defineProperty(this, "indexes", {value: indexes});

  /**
   * Indexing column with index.
   *
   * @name indexed
   * @type {Object}
   * @memberof odba.indexeddb.IndexedDBTable#
   * @private
   */
  Object.defineProperty(this, "indexed", {value: indexed});

  //(2) extract indexes info
  for (var i = 0; i < store.indexNames.length; ++i) {
    var ixName = store.indexNames[i];
    var ix = new IndexedDBIndex(this, store.index(ixName));
    indexes[ixName] = ix;
    indexed[ix.column] = ix;
  }
}

Object.defineProperty(odba.indexeddb, "IndexedDBTable", {value: IndexedDBTable});

/**
 * The active transaction.
 *
 * @name transaction
 * @type {odba.indexeddb.IndexedDBTransaction}
 * @memberof odba.indexeddb.IndexedDBTable#
 * @private
 */
IndexedDBTable.prototype.__defineGetter__("transaction", function() {
  return this.connection.transaction;
});

/**
 * Checks whether an index exists.
 *
 * @name hasIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {String} name       The index name.
 * @param {Function} callback The function to call: fn(error, exists).
 */
IndexedDBTable.prototype.hasIndex = function hasIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Index name and callback expected.");
  }

  //(2) check
  this.database.hasIndex(this.name, name, callback);
};

/**
 * Returns if an index exists.
 *
 * @name findIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {String} name       The index name.
 * @param {Function} callback The function to call: fn(error, exists).
 */
IndexedDBTable.prototype.findIndex = function findIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Index name and callback expected.");
  }

  //(2) find
  this.database.findIndex(this.name, name, callback);
};

/**
 * Creates an index on the table.
 * Note: This method only can be run into a version change transaction.
 *
 * @name createIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {String} name         The index name.
 * @param {String} col          The column.
 * @param {Object} [options]    The index options: unique (boolean).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example Create a unique index
 * tab.createIndex("ix_username", "username", {unique: true});
 * tab.createIndex("ix_username", "username", {unique: true}, function(error) { ... });
 */
IndexedDBTable.prototype.createIndex = function createIndex(name, col, options, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Index name and indexing column expected.");
  } else if (arguments.length == 3) {
    if (arguments[2] instanceof Function) {
      callback = arguments[2];
      options = {};
    }
  }

  //(2) create
  this.database.createIndex(this.name, name, col, options, callback);
};

/**
 * Drops an index.
 *
 * @name dropIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {String} name         The index name.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example Drop an index
 * tab.drop("ix_username");
 * tab.drop("ix_username", function(error) { ... });
 */
IndexedDBTable.prototype.dropIndex = function dropIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Index name expected.");
  }

  //(2) drop
  this.database.dropIndex(this.name, name, callback);
};

/**
 * @name query
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 * @private
 *
 * @returns {Query}
 */
IndexedDBTable.prototype.query = function query() {
  return new odba.indexeddb.IndexedDBQuery(this);
};

/**
 * Returns zero, one or several records.
 *
 * @name find
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.find = function find(where, callback) {
  this.query().find(where, callback);
};

/**
 * Returns all records.
 *
 * @name findAll
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.findAll = function findAll(callback) {
  this.query().findAll(callback);
};

/**
 * Returns one record.
 *
 * @name findOne
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, record).
 */
IndexedDBTable.prototype.findOne = function findOne(where, callback) {
  this.query().findOne(where, callback);
};

/**
 * Returns the number of records.
 *
 * @name count
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Function} callback The function to call: fn(error, count).
 */
IndexedDBTable.prototype.count = function count(callback) {
  //(1) pre: arguments
  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) count
  this.findAll(function(error, result) {
    if (error) callback(error);
    else callback(undefined, result.length);
  });
};

/**
 * Joins this table with another.
 *
 * @name join
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {String} target
 * @param {String} col1
 * @param {String} [col2]
 * @param {Function} [callback]
 *
 * @returns {odba.indexeddb.IndexedDBQuery} If the call doesn't pass a callback,
 *            it returns a Query; otherwise, asynchronous call.
 */
IndexedDBTable.prototype.join = function join(target, col1, col2, callback) {
  return this.query().join(target, col1, col2, callback);
};

/**
 * Inserts one or several records into the object store.
 *
 * @name insert
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Array|Object} records  The records to insert.
 * @param {Function} [callback]   The function to call: fn(error).
 */
IndexedDBTable.prototype.insert = function insert(records, callback) {
  var tran, store, abortError;

  //Notes. 1) WHEN A NEW RECORD NEED A KEY PATH, BUT UNSPECIFIED,
  //          store.add() throws an exception and req.onerror and
  //          tran.onerror aren't called. Explicitly, we have to call
  //          tran.onabort; therefore, we abort the transaction into
  //          the exception handler and, so, tran.onabort is called, but
  //          req.onerror and tran.onerror not.
  //          abortError is used to know whether we have aborted the transaction
  //          explicitly.
  //
  //       2) WHEN A NEW RECORD INDICATES AN EXISTING KEY PATH,
  //          store.add() throws no exception and tran.onerror and tran.onabort
  //          are called implicitly. We omit the onabort handler using abortError:
  //          if it is empty, we don't have anything; if it has a value,
  //          see the note 1.

  //helper function
  function add(i) {
    var req;

    if (i < records.length) {
      try {
        req = store.add(records[i]);

        req.onsuccess = function() {
          add(i+1);
        };
      } catch (e) {
        abortError = e;
        tran.rollback();
      }
    }
  }

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Object(s) to insert expected.");
  }

  if (!records) {
    if (callback) callback(new Error("Object to insert can't be null or undefined."));
    return;
  }

  //(1) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  tran.on("abort", function(e) {
    if (abortError && callback) {
      callback(new Error(abortError.message));
    }
  });

  tran.on("error", function(e) {
    if (callback) callback(e instanceof Error ? e : new Error(e.message));
  });

  tran.on("complete", function(e) {
    if (callback) callback();
  });

  //(2) insert record
  store = tran.getObjectStore(this.name);

  if (!(records instanceof Array)) records = [records];

  add(0);
};

/**
 * Updates a record/object.
 * The record must exist.
 *
 * @name save
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Object} records      The record(s).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * user.save({userId: 1, username: "user01", password: "pwd01"});
 * user.save([{...}, {...}, {...}], function(error) { ... });
 */
IndexedDBTable.prototype.save = function save(records, callback) {
  var tran;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Object to update expected.");
  }

  if (arguments.length == 1) {
    if (typeof(records) != "object") {
      throw new Error("Object to update expected.");
    }
  }

  if (!(records instanceof Array)) records = [records];

  //(2) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  tran.on("error", function(e) { if (callback) callback(e); });
  tran.on("complete", function(e) { if (callback) callback(); });

  //(3) update
  for (var i = 0; i < records.length; ++i) {
    tran.getObjectStore(this.name).put(records[i]);
  }
};

/**
 * Updates zero, one or several records.
 *
 * @name update
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Object} [where]      The condition.
 * @param {Object} fields       The fields to update.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * user.update({state: "locked"}, function(error) { ... });
 * user.update({userId: 1}, {password: "newPwd"}, function(error) { ... });
 */
IndexedDBTable.prototype.update = function update(where, fields, callback) {
  var Updater = odba.indexeddb.Updater;
  var self = this;

  //(1) pre: arguments
  if (arguments.length < 1) {
    throw new Error("Fields expected.");
  } else if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      throw new Error("Fields expected.");
    } else {
      fields = arguments[0];
      where = callback = undefined;
    }
  } else if (arguments.length == 2) {
    if (arguments[1] instanceof Function) {
      callback = arguments[1];
      fields = arguments[0];
      where = undefined;
    }
  }

  //(2) get records and update
  this.find(where, function(error, result) {
    if (error) return callback(error);

    (new Updater()).update(result.rows, fields);
    self.save(result.rows, callback);
  });
};

/**
 * Removes records.
 *
 * @name remove
 * @function
 * @memberof odba.indexeddb.IndexedDBTable#
 *
 * @param {Object} where        The condition.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example TRUNCATE
 * user.remove(function(error) { ... });
 *
 * @example DELETE
 * user.remove({userId: 1}, function(error) { ... });
 */
IndexedDBTable.prototype.remove = function remove(where, callback) {
  var tran, store, req;

  //(1) arguments
  if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      callback = arguments[0];
      where = undefined;
    }
  }

  //(2) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  //tran.on("error", function(e) { if (callback) callback(e); });
  tran.on("complete", function(e) { if (callback) callback(); });

  //(3) get store
  store = tran.getObjectStore(this.name);

  //(4) remove
  if (!where || Object.keys(where).length === 0) { //TRUNCATE
    req = store.clear();

    req.onerror = function(e) {
      if (callback) callback(e);
    };
  } else {
    if (Object.keys(where).indexOf(this.keyPath) < 0) {
      throw new Error("Key path expected.");
    }

    req = store.delete(where[this.keyPath]);

    req.onerror = function(e) {
      if (callback) callback(e);
    };
  }
};

})();