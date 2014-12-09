/**
 * An IndexedDB store.
 *
 * @class
 * @protected
 *
 * @param {IndexedDBDatabase} db  The database.
 * @param {IDBStore} store        The store.
 */
function IndexedDBTable(db, store) {
  var indexes = {};
  var indexed = {};

  //(1) define properties
  Object.defineProperty(this, "database", {value: db});
  Object.defineProperty(this, "name", {value: store.name});
  Object.defineProperty(this, "keyPath", {value: store.keyPath});
  Object.defineProperty(this, "autoIncrement", {value: store.autoIncrement});
  Object.defineProperty(this, "connection", {value: db.connection});
  Object.defineProperty(this, "indexes", {value: indexes});
  Object.defineProperty(this, "indexed", {value: indexed});

  //(2) extract indexes info
  for (var i = 0; i < store.indexNames.length; ++i) {
    var ixName = store.indexNames[i];
    var ix = new IndexedDBIndex(this, store.index(ixName));
    indexes[ixName] = ix;
    indexed[ix.column] = ix;
  }
}

/**
 * @private
 */
IndexedDBTable.prototype.__defineGetter__("transaction", function() {
  return this.connection.transaction;
});

/**
 * Checks whether an index exists.
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
 * @param {String} name       The index name.
 * @param {String} col        The column.
 * @param {Object} options    The index options: unique (boolean).
 * @param {Function} callback The function to call: fn(error).
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
 * @param {String} name       The index name.
 * @param {Function} callback The function to call: fn(error).
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
 * Returns record(s).
 * When the query can be resolved using the key or an index, the method
 * does it; otherwise, it uses a filter.
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, result).
 *
 * @example Returns all records.
 * tab.find(function(error, result) { ... });
 *
 * @example Returns records, filtering by condition.
 * tab.find({userId: 1}, function(error, result) { ... });
 * tab.find({userId: {$gt: 1, $lt: 4}, function(error, result) { ... });
 */
IndexedDBTable.prototype.find = function find(where, callback) {
  var fields;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  } else if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      callback = arguments[0];
      where = undefined;
    } else {
      throw new Error("Callback expected.");
    }
  }

  if (!where) where = {};

  //(2) get filter fields
  fields = Object.keys(where);

  //(3) find
  if (fields.length == 0) {
    this.findAll(callback);
  } else if (fields.length == 1) {
    var fld = fields[0];

    if (fld == this.keyPath) this.findByKeyPath(where, callback);
    else if (this.indexed[fld]) this.findByIndex(where, callback);
    else this.findByFilter(where, callback);
  } else {
    this.findByFilter(where, callback);
  }
};

/**
 * Finds record(s) using a filter.
 *
 * @private
 *
 * @param {Object} where      The conddition.
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.findByFilter = function findByFilter(where, callback) {
  var tran, store, req;
  var records = [];
  var filter = new ResultFilter();

   //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  } else if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      callback = arguments[0];
      where = undefined;
    } else {
      throw new Error("Callback expected.");
    }
  }

  //(2) find
  if (!where || Object.keys(where).length == 0) {
    this.findAll(callback);
    return;
  }

  //(3) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  tran.on("error", function(e) { callback(e); });
  tran.on("complete", function(e) { callback(undefined, new Result(records)); });

  //(4) get records
  store = tran.getObjectStore(this.name);

  req = store.openCursor();

  req.onsuccess = function(e) {
    var crs = e.target.result;

    if (crs) {
      var rec = crs.value;
      if (filter.check(rec, where)) records.push(rec);
      crs.continue();
    }
  };
};

/**
 * @private
 */
IndexedDBTable.prototype.getIDBKeyRange = function getIDBKeyRange(op, filter) {
  var rg;

  if (op == "$eq") rg = IDBKeyRange.only(filter.$eq);
  else if (op == "$lt") rg = IDBKeyRange.upperBound(filter.$lt, true);
  else if (op == "$le") rg = IDBKeyRange.upperBound(filter.$le);
  else if (op == "$gt") rg = IDBKeyRange.lowerBound(filter.$gt, true);
  else if (op == "$ge") rg = IDBKeyRange.lowerBound(filter.$ge);

  return rg;
};

/**
 * Finds record(s) using the key path, that is, the primary key or id.
 * The conditional predicate only can use: $eq, $lt, $le, $gt or $ge;
 * otherwise, the method will invoke findByFilter() to resolve the query.
 *
 * @private
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, records).
 */
IndexedDBTable.prototype.findByKeyPath = function findByKeyPath(where, callback) {
  var filter, rg;

  //(1) get filter
  filter = where[Object.keys(where)[0]];

  //(2) get range
  if (typeof(filter) != 'object') {
    rg = IDBKeyRange.only(filter);
  } else {
    var op = Object.keys(filter);

    if (op.length == 1) { //only one $op
      rg = this.getIDBKeyRange(op[0], filter);
    }
  }

  //(3) find
  if (rg) {
    var tran, req;
    var records = [];

    //get transaction
    tran = this.connection.beginTransaction(undefined, this.name);

    tran.on("error", function(e) { callback(e); });
    tran.on("complete", function(e) { callback(undefined, new IndexedDBResult(records, {byKey: true})); });

    //find
    req = tran.getObjectStore(this.name).openCursor(rg);

    req.onerror = function(e) {
      callback(e);
    };

    req.onsuccess = function(e) {
      var crs = e.target.result;

      if (crs) {
        records.push(crs.value);
        crs.continue();
      }
    };
  } else {
    this.findByFilter(where, callback);
  }
};

/**
 * Finds record(s) using an index.
 * The conditional predicate only can use: $eq, $lt, $le, $gt or $ge;
 * otherwise, the method will invoke findByFilter() to resolve the query.
 *
 * @private
 *
 * @param {IndexedDBIndex} ix The index name.
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.findByIndex = function findByIndex(where, callback) {
  var key, ix, filter, rg;

  //(1) get index info
  key = Object.keys(where)[0];
  ix = this.indexed[key];

  //(2) get filter
  filter = where[key];

  //(3) get range
  if (typeof(filter) != 'object') { //filter is the value: {prop: value}
    rg = IDBKeyRange.only(filter);
  } else {                          //filter is a filter: {prop: filter}
    var op = Object.keys(filter);

    if (op.length == 1) { //only one $op
      rg = this.getIDBKeyRange(op[0], filter);
    }
  }

  //(4) find
  if (rg) {
    var tran, req;
    var records = [];

    //get transaction
    tran = this.connection.beginTransaction(undefined, this.name);

    tran.on("error", function(e) { callback(e); });
    tran.on("complete", function(e) { callback(undefined, new IndexedDBResult(records, {byIndex: true})); });

    //find
    req = tran.getObjectStore(this.name).index(ix.name).openCursor(rg);

    req.onerror = function(e) {
      callback(e);
    };

    req.onsuccess = function(e) {
      var crs = e.target.result;

      if (crs) {
        records.push(crs.value);
        crs.continue();
      }
    };
  } else {
    this.findByFilter(where, callback);
  }
};

/**
 * Returns all records.
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.findAll = function findAll(callback) {
  var tran, store, req, records = [];

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  }

  //(2) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  tran.on("error", function(e) { callback(e); });
  tran.on("complete", function(e) { callback(undefined, new IndexedDBResult(records)); });

  //(3) get records
  store = tran.getObjectStore(this.name);

  req = store.openCursor();

  req.onsuccess = function(e) {
    var crs = e.target.result;

    if (crs) {
      records.push(crs.value);
      crs.continue();
    }
  };
};

/**
 * Returns one record.
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, record).
 */
IndexedDBTable.prototype.findOne = function findOne(where, callback) {
  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Callback expected.");
  } else if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      callback = arguments[0];
      where = undefined;
    } else {
      throw new Error("Callback expected.");
    }
  }

  //(2) find
  this.find(where, function(error, result) {
    var record;

    if (error) return callback(error);

    if (result.length >= 1) record = result.rows[0];
    callback(undefined, record);
  });
};

/**
 * Returns the number of records.
 *
 * @param {Function} callback The function to call: fn(error, count).
 */
IndexedDBTable.prototype.count = function count(callback) {
  this.findAll(function(error, result) {
    if (error) callback(error);
    else callback(undefined, result.length);
  });
};

/**
 * Inserts one or several records into the object store.
 *
 * @param {Array|Object} records  The records to insert.
 * @param {Function} callback     The function to call: fn(error).
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

  //helper function
  function add(i) {
    var req;

    if (i < records.length) {
      try {
        req = store.add(records[i]);

        req.onsuccess = function(e) {
          add(i+1);
        };
      } catch (e) {
        abortError = e;
        tran.rollback();
      }
    }
  }
};

/**
 * Updates a record/object.
 * The record must exist.
 *
 * @param {Object} record     The record.
 * @param {Function} callback The function to call: fn(error).
 *
 * @example
 * user.save({userId: 1, username: "user01", password: "pwd01"});
 */
IndexedDBTable.prototype.save = function save(record, callback) {
  var tran;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Object to update expected.");
  }

  if (typeof(record) != "object") {
    throw new Error("Object to update expected.");
  }

  //(2) get transaction
  tran = this.connection.beginTransaction(undefined, this.name);

  tran.on("error", function(e) { if (callback) callback(e); });
  tran.on("complete", function(e) { if (callback) callback(); });

  //(3) update
  tran.getObjectStore(this.name).put(record);

  //if (callback) callback();
};

/**
 * Removes records.
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error).
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
  if (!where || Object.keys(where).length == 0) { //TRUNCATE
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