(function() {

/**
 * A query engine.
 *
 * @class vdba.indexeddb.QueryEngine
 * @private
 */
function QueryEngine() {

}

Object.defineProperty(vdba.indexeddb, "QueryEngine", {value: QueryEngine});

QueryEngine.prototype.__defineGetter__("combinator", function() {
  return new vdba.Combinator();
});

QueryEngine.prototype.__defineGetter__("filter", function() {
  return new vdba.ResultFilter();
});

/**
 * Runs a query.
 *
 * @param {Query} query       The query to run.
 * @param {Function} callback The function to call: fn(error, result).
 */
QueryEngine.prototype.run = function run(query, callback) {
  //(1) pre: prepare
  if (!query.filter) query.filter = {};

  //(2) run
  if (query.isSimpleQuery()) this.runSimpleQuery(query, callback);
  else this.runCompoundQuery(query, callback);
};

/**
 * @private
 */
QueryEngine.prototype.runSimpleQuery = function runSimpleQuery(query, callback) {
  this.find(query, callback);
};

/**
 * @private
 */
QueryEngine.prototype.runCompoundQuery = function runCompoundQuery(query, callback) {
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;
  var self = this;

  this.find(query, function(error, result) {
    var src;

    if (error) {
      callback(error);
    } else {
      src = result.rows;

      query.sourceTable.database.findTable(query.targetTable, function(error, tab) {
        if (error) {
          callback(error);
        } else {
          tab.find(query.filter, function(error, result) {
            if (error) {
              callback(error);
            } else {
              callback(undefined,
                       new IndexedDBResult(self.combinator.join(src,
                                                                result.rows,
                                                                query.sourceColumn,
                                                                query.targetColumn,
                                                                {arrayAgg: query.targetTable + "s"}))
              );
            }
          });
        }
      });
    }
  });
};

/**
 * Returns all records.
 *
 * @private
 *
 * @param {Query} query       The query.
 * @param {Function} callback The function to call: fn(error, result).
 */
QueryEngine.prototype.findAll = function findAll(query, callback) {
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;
  var table, tran, req, records = [];

  //(1) get table
  table = query.sourceTable;

  //(2) get transaction
  tran = table.connection.beginTransaction({
    error: function(e) { callback(e); },
    complete: function() { callback(undefined, new IndexedDBResult(records)); }
  });

  //(3) get records
  req = tran.getObjectStore(table.name).openCursor();

  req.onsuccess = function(e) {
    var crs = e.target.result;

    if (crs) {
      records.push(crs.value);
      crs.continue();
    }
  };
};

/**
 * Returns record(s).
 * When the query can be resolved using the key or an index, the method
 * does it; otherwise, it uses a filter.
 *
 * @private
 *
 * @param {Object} query      The query.
 * @param {Function} callback The function to call: fn(error, result).
 */
QueryEngine.prototype.find = function find(query, callback) {
  var table, fields;

  //(1) get table and filter fields
  table = query.sourceTable;
  fields = Object.keys(query.filter);

  //(2) find
  if (fields.length === 0) {
    this.findAll(query, callback);
  } else if (fields.length == 1) {
    var field = fields[0];

    if (field == table.keyPath) this.findByKeyPath(query, callback);
    else if (table.indexed[field]) this.findByIndex(query, callback);
    else this.findByFilter(query, callback);
  } else {
    this.findByFilter(query, callback);
  }
};

/**
 * Finds record(s) using a filter.
 *
 * @private
 *
 * @param {Object} query      The query.
 * @param {Function} callback The function to call: fn(error, result).
 */
QueryEngine.prototype.findByFilter = function findByFilter(query, callback) {
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;

  if (Object.keys(query.filter).length === 0) {
    this.findAll(query, callback);
  } else {
    var self = this, table, tran, req, records = [];

    //get table
    table = query.sourceTable;

    //get transaction
    tran = table.connection.beginTransaction({
      error: function(e) { callback(e); },
      complete: function() { callback(undefined, new IndexedDBResult(records)); }
    });

    //get records
    req = tran.getObjectStore(table.name).openCursor();

    req.onsuccess = function(e) {
      var crs = e.target.result;

      if (crs) {
        var rec = crs.value;

        if (self.filter.check(rec, query.filter)) records.push(rec);
        crs.continue();
      }
    };
  }
};

/**
 * Returns a IDBKeyRange operator.
 *
 * @private
 *
 * @param {String} op     The operation name: $eq, $lt...
 * @param {Object} filter The filter object.
 *
 * @returns {IDBKeyRange}
 */
QueryEngine.prototype.getIDBKeyRange = function getIDBKeyRange(op, filter) {
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
 * @param {Object} query      The query
 * @param {Function} callback The function to call: fn(error, records).
 */
QueryEngine.prototype.findByKeyPath = function findByKeyPath(query, callback) {
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;
  var table, filter, rg;

  //(1) get table and filter
  table = query.sourceTable;
  filter = query.filter[Object.keys(query.filter)[0]];

  //(2) get range
  if (typeof(filter) != "object") {
    rg = IDBKeyRange.only(filter);
  } else {
    var op = Object.keys(filter);

    if (op.length == 1) { //only one $op
      rg = this.getIDBKeyRange(op[0], filter);
    }
  }

  //(3) find
  if (rg) {
    var tran, req, records = [];

    //get transaction
    tran = table.connection.beginTransaction({
      error: function(e) { callback(e); },
      complete: function() { callback(undefined, new IndexedDBResult(records, {byKey: true})); }
    });

    //find
    req = tran.getObjectStore(table.name).openCursor(rg);

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
    this.findByFilter(query.filter, callback);
  }
};

/**
 * Finds record(s) using an index.
 * The conditional predicate only can use: $eq, $lt, $le, $gt or $ge;
 * otherwise, the method will invoke findByFilter() to resolve the query.
 *
 * @private
 *
 * @param {Object} query      The query.
 * @param {Function} callback The function to call: fn(error, result).
 */
QueryEngine.prototype.findByIndex = function findByIndex(query, callback) {
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;
  var table, key, ix, filter, where, rg;

  //(1) get index info
  table = query.sourceTable;
  where = query.filter;
  key = Object.keys(where)[0];
  ix = table.indexed[key];

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
    var tran, req, records = [];

    //get transaction
    tran = table.connection.beginTransaction({
      error: function(e) { callback(e); },
      complete: function() { callback(undefined, new IndexedDBResult(records, {byIndex: true})); }
    });

    //find
    req = tran.getObjectStore(table.name).index(ix.name).openCursor(rg);

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

})();