/**
 * An IndexedDB store.
 *
 * @class
 * @protected
 *
 * @param {IndexedDBDatabase} db  The database.
 * @param {String} name           The table store name.
 */
function IndexedDBTable(db, name, keyPath) {
  Object.defineProperty(this, "database", {value: db});
  Object.defineProperty(this, "name", {value: name});
  Object.defineProperty(this, "keyPath", {value: keyPath});
  Object.defineProperty(this, "connection", {value: db.connection});
}

/**
 * @private
 */
IndexedDBTable.prototype.__defineGetter__("activeTransaction", function() {
  return this.connection.activeTransaction;
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
 * @private
 */
IndexedDBTable.prototype.validateWhere = function validateWhere(where) {
  return (Object.keys(where).indexOf(this.keyPath) >= 0);
};

/**
 * Returns record(s).
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBTable.prototype.find = function find(where, callback) {
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
  } else {
    var tran, store, req;

    //pre
    if (!this.validateWhere(where)) {
      return callback(new Error("Invalid find criteria."));
    }

    //get transaction
    tran = this.database.native.transaction([this.name], "readonly");

    tran.onerror = function(e) {
      callback(e);
    };

    tran.oncomplete = function(e) {
      var res = new IndexedDBResult([]);
      if (req.result) res.rows.push(req.result);
      callback(undefined, res);
    };

    //get store
    store = tran.objectStore(this.name);

    //find
    req = store.get(where[this.keyPath]);

    req.onerror = function(e) {
      callback(e);
    };
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
  tran = this.activeTransaction;

  if (!tran) {
    tran = this.database.native.transaction([this.name], "readonly");

    tran.onerror = function(e) {
      callback(e);
    };

    tran.oncomplete = function(e) {
      callback(undefined, new IndexedDBResult(records));
    };
  }

  //(2) get records
  store = tran.objectStore(this.name);

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
      throw new Error("Callback expected.")
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
  //          tran.noerror aren't called. Explicitly, we have to call
  //          tran.onerror; therefore, we abort the transaction into
  //          the exception handler and, so, tran.onabort is called, but
  //          req.onerror and tran.noerror not.
  //          abortError is used to know if we have aborted the transaction
  //          explicitly.
  //
  //       2) WHEN A NEW RECORD INDICATES AN EXISTING KEY PATH,
  //          store.add() throw no exception and tran.onerror and tran.onabort
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
  tran = this.activeTransaction;

  if (!tran) {
    tran = this.database.native.transaction([this.name], "readwrite");

    tran.onabort = function(e) {
      if (abortError && callback) {
        callback(new Error(abortError.message));
      }
    };

    tran.onerror = function(e) {
      if (callback) callback(e instanceof Error ? e : new Error(e.message));
    };

    tran.oncomplete = function(e) {
      if (callback) callback();
    };
  }

  //(2) insert record
  store = tran.objectStore(this.name);

  if (! (records instanceof Array)) records = [records];

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
        tran.abort();
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
  tran = this.activeTransaction;

  if (!tran)  {
    tran = this.database.native.transaction([this.name], "readwrite");

    tran.onerror = function(e) {
      if (callback) callback(e);
    };

    tran.oncomplete = function(e) {
      if (callback) callback();
    };
  }

  //(3) update
  tran.objectStore(this.name).put(record);

  if (tran === this.activeTransaction) {
    if (callback) callback();
  }
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
  var self = this;
  var tran, store;

  //(1) arguments
  if (arguments.length == 1) {
    if (arguments[0] instanceof Function) {
      callback = arguments[0];
      arguments[0] = undefined;
    }
  }

  //(2) get transaction
  tran = this.database.native.transaction([this.name], "readwrite");

  tran.onerror = function(e) {
    callback(e);
  };

  tran.oncomplete = function(e) {
    if (callback) callback();
  };

  //(3) get store
  store = tran.objectStore(this.name);

  //(4) remove
  if (!where || Object.keys(where).length == 0) { //TRUNCATE
    var req = store.clear();

    req.onerror = function(e) {
      callback(e);
    };
  } else {
    if (Object.keys(where).indexOf(this.keyPath) < 0) {
      throw new Error("Key path expected.");
    }

    req = store.delete(where[this.keyPath]);

    req.onerror = function(e) {
      callback(e);
    };
  }
};