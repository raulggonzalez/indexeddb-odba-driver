/*! indexeddb-odba-driver - 0.5.2 (2014-12-22) */
/*! odba-core - 0.4.1 (2014-12-21) */

(function() {

/**
 * A combinator.
 *
 * @class odba.Combinator
 * @private
 */
function Combinator() {

}

/**
 * Joins two row sets.
 *
 * memberof odba.Combinator#
 *
 * @param {Object[]} source   The source-side rows.
 * @param {Object[]} target   The target-side rows.
 * @param {String} sourceCol  The source-side column name.
 * @param {String} targetCol  The target-side column name.
 * @param {Object} opts       The join opts: arrayAgg (String), the target rows
 *                            into an source array.
 *
 * @param {Object[]}
 */
Combinator.prototype.join = function join(source, target, sourceCol, targetCol, opts) {
  var res = [], arrayAgg, util = odba.util;

  //(1) pre: arguments
  arrayAgg = opts.arrayAgg;

  //(2) join
  for (var i = 0; i < source.length; ++i) {
    var srcRow = util._extend({}, source[i]);
    var arrAgg = srcRow[arrayAgg] = [];

    for (var j = 0; j < target.length; ++j) {
      var tgtRow = util._extend(target[j]);

      if (srcRow[sourceCol] == tgtRow[targetCol]) arrAgg.push(tgtRow);
    }

    res.push(srcRow);
  }

  //(3) return
  return res;
};

/**
 * A connection.
 *
 * @class odba.Connection
 * @abstract
 *
 * @param {Object} config The configuration.
 */
function Connection(config) {
  /**
   * The configuration object.
   *
   * @name config
   * @type {Object}
   * @memberof odba.Connection#
   */
  Object.defineProperty(this, "config", {value: config, enumerable: true});
}

/**
 * Returns a connection metadata ready to open.
 *
 * @name clone
 * @function
 * @memberof odba.Connection#
 * @abstract
 */
Connection.prototype.clone = function clone() {
  throw new Error("Abstract method.");
};

/**
 * Is it connected?
 *
 * @name connected
 * @type {Boolean}
 * @memberof odba.Connection#
 * @abstract
 */
Connection.prototype.__defineGetter__("connected", function() {
  throw new Error("Abstract property.");
});

/**
 * The server object as connected.
 *
 * @name server
 * @type {odba.Server}
 * @memberof odba.Connection#
 * @abstract
 */
Connection.prototype.__defineGetter__("server", function() {
  throw new Error("Abstract property.");
});

/**
 * Opens the connection.
 *
 * @name open
 * @function
 * @memberof odba.Connection#
 * @abstract
 *
 * @param {Function} [callback] The function to call: fn(error, db).
 *
 * @example
 * cx.open(function(error, db) { ... });
 */
Connection.prototype.open = function open() {
  throw new Error("Abstract method.");
};

/**
 * Closes the connection.
 *
 * @name close
 * @function
 * @memberof odba.Connection#
 * @abstract
 *
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.close();
 * cx.close(function(error) { ... });
 */
Connection.prototype.close = function close() {
  throw new Error("Abstract method.");
};

/**
 * Runs a function into a transaction.
 *
 * @name runTransaction
 * @function
 * @memberof odba.Connection#
 * @abstract
 *
 * @param {String} mode         The transaction mode: readonly or readwrite.
 * @param {Function} op         The operation to run into a transaction.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * cx.runTransaction("readonly", function(db) { ... });
 * cx.runTransaction("readonly", function(db) { ... }, function(error) { ... });
 */
Connection.prototype.runTransaction = function runTransaction() {
  throw new Error("Abstract method.");
};

/**
 * A database.
 *
 * @class odba.Database
 * @abstract
 */
function Database() {

}

/**
 * The database name.
 *
 * @name name
 * @type {String}
 * @memberof odba.Database#
 * @abstract
 */
Database.prototype.__defineGetter__("name", function() {
  throw new Error("Abstract property.");
});

/**
 * Does the table exist?
 *
 * @name hasTable
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} name       The table name.
 * @param {Function} callback The function to call: fn(exists).
 *
 * @example
 * db.hasTable("user", function(error, exists) { ... });
 */
Database.prototype.hasTable = function hasTable() {
  throw new Error("Abstract method.");
};

/**
 * Do the tables exist?
 *
 * @name hasTables
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String[]} names    The table names.
 * @param {Function} callback The function to call: fn(exist).
 *
 * @example
 * db.hasTables(["user", "session"], function(error, exist) { ... });
 */
Database.prototype.hasTables = function hasTables() {
  throw new Error("Abstract method.");
};

/**
 * Returns a table.
 *
 * @name findTable
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} name       The table name.
 * @param {Function} callback The function to call: fn(error, store).
 *
 * @example
 * db.findTable("user", function(error, store) { ... });
 */
Database.prototype.findTable = function findTable() {
  throw new Error("Abstract method.");
};

/**
 * Creates a new table.
 *
 * @name createTable
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} name         The table name.
 * @param {Object} [options]    The creation options.
 * @param {Function} [callback] The function to call: fn(error, table).
 */
Database.prototype.createTable = function createTable() {
  throw new Error("Abstract method.");
};

/**
 * Creates new tables.
 *
 * @name createTables
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {Object[]} tables     The tables info.
 * @param {Function} [callback] The function to call: fn(error, tables).
 */
Database.prototype.createTables = function createTables() {
  throw new Error("Abstract method.");
};

/**
 * Drops a table.
 *
 * @name dropTable
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} name         The table name.
 * @param {Function} [callback] The function to call: fn(error).
 */
Database.prototype.dropTable = function dropTable() {
  throw new Error("Abstract method.");
};

/**
 * Returns an index.
 *
 * @name findIndex
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} table      The table name.
 * @param {String} index      The index name.
 * @param {Function} callback The function to call: fn(error, index).
 *
 * @example
 * db.findIndex("user", "ix_username", function(error, ix) { ... });
 */
Database.prototype.findIndex = function findIndex() {
  throw new Error("Abstract method.");
};

/**
 * Checks whether a table has a specified index.
 *
 * @name hasIndex
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} table      The object store name.
 * @param {String} ix         The index name.
 * @param {Function} callback The function to call: fn(error, exist).
 */
Database.prototype.hasIndex = function hasIndex() {
  throw new Error("Abstract method.");
};

/**
 * Creates an index.
 *
 * @name createIndex
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} table        The table name.
 * @param {String} index        The index name.
 * @param {String} col          The indexing column.
 * @param {Object} [options]    The index options: unique (boolean).
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * db.createIndex("user", "ix_username", "username");
 * db.createIndex("user", "ix_username", "username", function(error) { ... });
 * db.createIndex("user", "ix_username", "username", {unique: true});
 * db.createIndex("user", "ix_username", "username", {unique: true}, function(error) { ... });
 */
Database.prototype.createIndex = function createIndex() {
  throw new Error("Abstract method.");
};

/**
 * Drops an index.
 *
 * @name dropIndex
 * @function
 * @memberof odba.Database#
 * @abstract
 *
 * @param {String} table        The table name.
 * @param {String} index        The index name.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * db.dropIndex("user", "ix_username");
 * db.dropIndex("user", "ix_username", function(error) { ... });
 */
Database.prototype.dropIndex = function dropIndex() {
  throw new Error("Abstract method.");
};

/**
 * An ODBA driver.
 *
 * @class odba.Driver
 * @abstract
 *
 * @param {String} name The driver name.
 */
function Driver(name) {
  /**
   * The driver name.
   *
   * @name name
   * @type {String}
   * @memberof odba.Driver#
   */
  Object.defineProperty(this, "name", {value: name, enumerable: true});
}

/**
 * The driver cache.
 *
 * @name cache
 * @type {Object}
 * @memberof odba.Driver
 * @private
 */
Object.defineProperty(Driver, "cache", {value: {}});

/**
 * Returns a specified driver.
 *
 * @memberof odba.Driver
 *
 * @param {String} name The driver name: IndexedDB, C*, Cassandra, PostgreSQL, etc.
 * @returns A driver or undefined if the name is invalid.
 *
 * @example
 * drv = odba.Driver.getDriver("IndexedDB");
 * drv = odba.Driver.getDriver("C*");
 */
Driver.getDriver = function getDriver(name) {
  var cache = odba.Driver.cache;

  //(1) pre: arguments
  if (!name) {
    throw new Error("Driver name expected.");
  }

  //(2) return driver
  return cache[name.toLowerCase()];
};

/**
 * Registers a driver.
 * This method is used by the drivers to register in the ODBA API.
 *
 * @name register
 * @function
 * @memberof odba.Driver
 *
 * @param {odba.Driver} driver      The driver.
 * @param {String|String[]} [alias] The driver alias.
 *
 * @example
 * odba.Driver.register(new IndexedDBDriver());
 * odba.Driver.register(new CassandraDriver(), "C*");
 */
Driver.register = function register(driver, alias) {
  var cache = odba.Driver.cache;

  //(1) pre: arguments
  if (!driver) {
    throw new Error("Driver expected.");
  }


  //(2) register
  cache[driver.name.toLowerCase()] = driver;

  if (alias) {
    if (typeof(alias) == "string") alias = [alias];

    for (var i = 0; i < alias.length; ++i) {
      cache[alias[i].toLowerCase()] = driver;
    }
  }
};

/**
 * Creates a connection object
 *
 * @name createConnection
 * @function
 * @memberof odba.Driver#
 * @abstract
 *
 * @param {Object} config The connection configuration.
 * @returns {odba.Connection}
 *
 * @example An IndexedDB connection.
 * cx = drv.createConnection({database: "mydb"});
 */
Driver.prototype.createConnection = function createConnection() {
  throw new Error("Abstract method.");
};

/**
 * Creates and opens a connection.
 *
 * @name openConnection
 * @function
 * @memberof odba.Driver#
 *
 * @param {Object} config     The configuration object.
 * @param {Function} callback The function to call: fn(error, cx).
 *
 * @example An IndexedDB connection.
 * drv.openConnection({database: "mydb"}, function(error, cx) { ... });
 */
Driver.prototype.openConnection = function openConnection(config, callback) {
  var cx;

  //(1) pre: arguments
  if (!config) {
    throw new Error("Configuration expected.");
  }

  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) create connection
  cx = this.createConnection(config);

  //(3) open connection
  cx.open(function(error) {
    if (error) callback(error);
    else callback(undefined, cx);
  });
};

/**
 * An index.
 *
 * @class odba.Index
 * @abstract
 */
function Index() {

}

/**
 * The database.
 *
 * @name table
 * @type {odba.Database}
 * @memberof odba.Index#
 * @abstract
 */
Index.prototype.__defineGetter__("database", function() {
  throw new Error("Abstract property.");
});

/**
 * The table.
 *
 * @name table
 * @type {odba.Table}
 * @memberof odba.Index#
 * @abstract
 */
Index.prototype.__defineGetter__("table", function() {
  throw new Error("Abstract property.");
});

/**
 * The index name.
 *
 * @name name
 * @type {String}
 * @memberof odba.Index#
 * @abstract
 */
Index.prototype.__defineGetter__("name", function() {
  throw new Error("Abstract property.");
});

/**
 * Is it unique?
 *
 * @name unique
 * @type {Boolean}
 * @memberof odba.indexeddb.IndexedDBIndex#
 * @abstract
 */
Index.prototype.__defineGetter__("unique", function() {
  throw new Error("Abstract property.");
});

/**
 * A query.
 *
 * @class odba.Query
 * @abstract
 */
function Query() {

}

/**
 * Returns all records.
 *
 * @name findAll
 * @function
 * @memberof odba.Query#
 * @abstract
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
Query.prototype.findAll = function findAll() {
  throw new Error("Abstract method.");
};

/**
 * Runs the query.
 *
 * @name find
 * @function
 * @memberof odba.Query#
 * @abstract
 *
 * @param {Object} [filter]   The filter object.
 * @param {Function} callback The function to call: fn(error, result).
 */
Query.prototype.find = function find() {
  throw new Error("Abstract method.");
};

/**
 * Runs the query.
 *
 * @name findOne
 * @function
 * @memberof odba.Query#
 *
 * @param {Object} [filter]   The filter object.
 * @param {Function} callback The function to call: fn(error, record).
 */
Query.prototype.findOne = function findOne() {
  throw new Error("Abstract method.");
};

/**
 * Performs a join.
 *
 * @name join
 * @function
 * @memberof odba.Query#
 * @abstract
 *
 * @param {String|odba.Table} target  The target table.
 * @param {String} col1               The source column.
 * @param {String} [col2]             The target column.
 * @param {Function} [callback]       The function to call: function(error, result).
 *
 * @returns {odba.Query} If no callback is specified, it returns the query.
 *
 * @example Natural join.
 * q.join("session", "userId")
 * q.join("session", "userId", function(error, result) { ... });
 *
 * @example
 * q.join("session", "userId", "userId")
 * q.join("session", "userId", "userId", function(error, result) { ... });
 *
 * @example Restricting records.
 * q.join("session", "userId").find({username: "user01"}, function(error, result) { ... });
 */
Query.prototype.join = function join() {
  throw new Error("Abstract method.");
};

/**
 * A query result.
 *
 * @class odba.Result
 *
 * @param {Array} rows  The rows.
 */
function Result(rows) {
  /**
   * The rows.
   *
   * @name rows
   * @type {odba.Object[]}
   * @memberof odba.Result#
   */
  Object.defineProperty(this, "rows", {value: rows});
}

/**
 * The number of records.
 *
 * @name length
 * @type {Number}
 * @memberof odba.Result#
 */
Result.prototype.__defineGetter__("length", function() {
  return this.rows.length;
});

/**
 * Returns the rows satisfying the restriction.
 *
 * @name find
 * @function
 * @memberof odba.Result#
 *
 * @param {Object} where  The restriction condition.
 */
Result.prototype.find = function find(where) {
  return new odba.ResultFilter().find(this, where);
};

/**
 * A result filter.
 *
 * @class
 * @private
 */
function ResultFilter() {

}

/**
 * Filters rows of a result.
 *
 * @memberof odba.ResultFilter#
 *
 * @param {Result} result The result set.
 * @param {Object} filter The filter.
 *
 * @returns {Object[]}
 */
ResultFilter.prototype.find = function find(result, filter) {
  var filtered = [];

  //(1) arguments
  if (!filter) filter = {};

  //(3) filter
  for (var i = 0, rows = result.rows; i < result.length; ++i) {
    var row = rows[i];

    if (this.check(row, filter)) filtered.push(row);
  }

  //(3) retun result
  return filtered;
};

/**
 * Checks whether a row satifies the filter.
 *
 * @memberof odba.ResultFilter#
 *
 * @param {Object} row    The row to check.
 * @param {Object} filter The filter.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.check = function check(row, filter) {
  var res = false, keys = Object.keys(filter);

  //(1) check
  if (keys.length === 0) {             //{}
    res = true;
  } else if (keys.length == 1) {      //{prop: ...}
    res = this.checkProp(row, keys[0], filter);
  } else {                            //{prop1: ..., prop2: ...}
    res = true;

    for (var i = 0, props = keys; i < props.length; ++i) {
      var prop = props[i];

      if (!this.checkProp(row, prop, filter)) {
        res = false;
        break;
      }
    }
  }

  //(2) return result
  return res;
};

/**
 * Checks whether a property satisfies its filter.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} filter The filter.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.checkProp = function checkProp(row, prop, filter) {
  var res;

  //(1) get property filter
  filter = filter[prop];

  //(2) check
  if (typeof(filter) != "object") {     //{prop: value}
    res = this.$eq(row, prop, filter);
  } else {                              //{prop: {...}}
    var ops = Object.keys(filter);

    if (ops.length === 0) {              //{prop: {}}
      res = true;
    } else if (ops.length == 1) {       //{prop: {op: value}
      res = this.checkOp(row, prop, ops[0], filter);
    } else {                           //{prop: {op1: value, opt2: value}}
      res = true;

      for (var i = 0; i < ops.length; ++i) {
        if (!this.checkOp(row, prop, ops[i], filter)) {
          res = false;
          break;
        }
      }
    }
  }

  //(3) return result
  return res;
};

/**
 * Checks a property with an operator.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {String} op     The operator.
 * @param {Object} filter The filter.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.checkOp = function checkOp(row, prop, op, filter) {
  var res;

  //(1) check
  if (op == "$eq") res = this.$eq(row, prop, filter.$eq);
  else if (op == "$ne") res = this.$ne(row, prop, filter.$ne);
  else if (op == "$lt") res = this.$lt(row, prop, filter.$lt);
  else if (op == "$le") res = this.$le(row, prop, filter.$le);
  else if (op == "$gt") res = this.$gt(row, prop, filter.$gt);
  else if (op == "$ge") res = this.$ge(row, prop, filter.$ge);
  else if (op == "$like") res = this.$like(row, prop, filter.$like);
  else if (op == "$notLike") res = this.$notLike(row, prop, filter.$notLike);
  else if (op == "$in") res = this.$in(row, prop, filter.$in);
  else if (op == "$notIn") res = this.$notIn(row, prop, filter.$notIn);
  else throw new Error("Unknown operator: '" + op + "'.");

  //(2) return check
  return res;
};

/**
 * Checks the operator $eq.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property name to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$eq = function $eq(row, prop, value) {
  if (value === undefined) return (row[prop] === undefined);
  else if (value === null) return (row[prop] === null);
  else return (row[prop] == value);
};

/**
 * Checks the operator $ne.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$ne = function $ne(row, prop, value) {
  if (value === undefined) return (row[prop] !== undefined);
  else if (value === null) return (row[prop] !== null);
  else return (row[prop] != value);
};

/**
 * Checks the operator $lt.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$lt = function $lt(row, prop, value) {
  if (value === undefined || value === null) return false;
  else return (row[prop] < value);
};

/***
 * Checks the operator $le.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$le = function $le(row, prop, value) {
  if (value === undefined || value === null) return false;
  else return (row[prop] <= value);
};

/**
 * Checks the operator $gt.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$gt = function $gt(row, prop, value) {
  if (value === undefined || value === null) return false;
  else return (row[prop] > value);
};

/**
 * Checks the operator $ge.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$ge = function $ge(row, prop, value) {
  if (value === undefined || value === null) return false;
  else return (row[prop] >= value);
};

/**
 * Checks the operator $like.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The pattern to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$like = function $like(row, prop, value) {
  if (value === undefined || value === null) return this.$eq(row, prop, value);
  else return new RegExp(value).test(row[prop]);
};

/**
 * Checks the operator $notLike.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The pattern to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$notLike = function $notLike(row, prop, value) {
  if (value === undefined || value === null) return this.$ne(row, prop, value);
  else return !this.$like(row, prop, value);
};

/**
 * Checks the operator $in.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The values to check.
 *
 * @retuns {Boolean}
 */
ResultFilter.prototype.$in = function $in(row, prop, value) {
  if (value === undefined || value === null) return false;
  else return (value.indexOf(row[prop]) >= 0);
};

/**
 * Checks the operator $notIn.
 *
 * @memberof odba.ResultFilter#
 * @private
 *
 * @param {Object} row    The row to check.
 * @param {String} prop   The property to check.
 * @param {Object} value  The value to check.
 *
 * @returns {Boolean}
 */
ResultFilter.prototype.$notIn = function $notIn(row, prop, value) {
  return !this.$in(row, prop, value);
};

/**
 * A database engine.
 *
 * @class odba.Server
 * @abstract
 */
function Server() {

}

/**
 * The hostname.
 *
 * @name host
 * @memberof odba.Server#
 * @abstract
 */
Server.prototype.__defineGetter__("host", function() {
  throw new Error("Abstract method.");
});

/**
 * The port.
 *
 * @name port
 * @memberof odba.Server#
 * @abstract
 */
Server.prototype.__defineGetter__("port", function() {
  throw new Error("Abstract method.");
});

/**
 * The server version.
 *
 * @name version
 * @memberof odba.Server#
 * @abstract
 */
Server.prototype.__defineGetter__("version", function() {
  throw new Error("Abstract method.");
});

/**
 * Creates a new database.
 *
 * @name createDatabase
 * @function
 * @memberof odba.Server#
 * @abstract
 *
 * @param {String} name         The database name.
 * @param {Object} [options]    The database options.
 * @param {Function} [callback] The function to call: fn(error).
 */
Server.prototype.createDatabase = function createDatabase() {
  throw new Error("Abstract method.");
};

/**
 * Checks whether a database exists.
 *
 * @name hasDatabase
 * @function
 * @memberof odba.Server#
 * @abstract
 *
 * @param {String} name       The database name.
 * @param {Function} callback The function to call: fn(error, exists).
 */
Server.prototype.hasDatabase = function hasDatabase() {
  throw new Error("Abstract method.");
};

/**
 * Drops a database.
 *
 * @name dropDatabase
 * @function
 * @memberof odba.Server#
 * @abstract
 *
 * @param {String} name         The database name.
 * @param {Function} [callback] The function to call: fn(error).
 */
Server.prototype.dropDatabase = function dropDatabase() {
  throw new Error("Abstract method.");
};

/**
 * A table.
 *
 * @class odba.Table
 * @abstract
 */
function Table() {

}

/**
 * The database object.
 *
 * @name database
 * @type {odba.Database}
 * @memberof odba.Table#
 * @abstract
 */
Table.prototype.__defineGetter__("database", function() {
  throw new Error("Abstract method.");
});

/**
 * The table name.
 *
 * @name name
 * @type {String}
 * @memberof odba.Table#
 * @abstract
 */
Table.prototype.__defineGetter__("name", function() {
  throw new Error("Abstract method.");
});

/**
 * Checks whether an index exists.
 *
 * @name hasIndex
 * @function
 * @memberof odba.Table#
 *
 * @param {String} name       The index name.
 * @param {Function} callback The function to call: fn(error, exists).
 */
Table.prototype.hasIndex = function hasIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Index name and callback expected.");
  }

  //(2) check
  this.database.hasIndex(this.name, name, callback);
};

/**
 * Returns an index.
 *
 * @name findIndex
 * @function
 * @memberof odba.Table#
 *
 * @param {String} name       The index name.
 * @param {Function} callback The function to call: fn(error, exists).
 */
Table.prototype.findIndex = function findIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Index name and callback expected.");
  }

  //(2) find
  this.database.findIndex(this.name, name, callback);
};

/**
 * Creates an index on the table.
 *
 * @name createIndex
 * @function
 * @memberof odba.Table#
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
Table.prototype.createIndex = function createIndex(name, col, options, callback) {
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
 * @memberof odba.Table#
 *
 * @param {String} name         The index name.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example Drop an index
 * tab.drop("ix_username");
 * tab.drop("ix_username", function(error) { ... });
 */
Table.prototype.dropIndex = function dropIndex(name, callback) {
  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Index name expected.");
  }

  //(2) drop
  this.database.dropIndex(this.name, name, callback);
};

/**
 * Returns zero, one or several rows.
 *
 * @name find
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, result).
 */
Table.prototype.find = function find() {
  throw new Error("Abstract method.");
};

/**
 * Returns all rows.
 *
 * @name findAll
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
Table.prototype.findAll = function findAll() {
  throw new Error("Abstract method.");
};

/**
 * Returns one row.
 *
 * @name findOne
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Object} where      The condition.
 * @param {Function} callback The function to call: fn(error, row).
 */
Table.prototype.findOne = function findOne() {
  throw new Error("Abstract method.");
};

/**
 * Returns the number of rows.
 *
 * @name count
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Function} callback The function to call: fn(error, count).
 */
Table.prototype.count = function count() {
  throw new Error("Abstract method.");
};

/**
 * Joins this table with another.
 *
 * @name join
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {String|odba.Table} target  The target table name.
 * @param {String} col1               The source column.
 * @param {String} [col2]             The target column.
 * @param {Function} [callback]       The function to call: fn(error, result).
 *
 * @returns {odba.Query} If the call doesn't pass a callback, it returns a Query;
 *                       otherwise, asynchronous call.
 */
Table.prototype.join = function join() {
  throw new Error("Abstract method.");
};

/**
 * Inserts one or several rows into the table.
 *
 * @name insert
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {object|Object[]} rows  The row(s) to insert.
 * @param {Function} [callback]   The function to call: fn(error).
 */
Table.prototype.insert = function insert() {
  throw new Error("Abstract method.");
};

/**
 * Replaces the content of one or several rows.
 * The record must exist.
 *
 * @name save
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Object|Object[]} rows  The row(s) to save.
 * @param {Function} [callback]   The function to call: fn(error).
 *
 * @example
 * user.save({userId: 1, username: "user01", password: "pwd01"});
 * user.save([{...}, {...}, {...}], function(error) { ... });
 */
Table.prototype.save = function save() {
  throw new Error("Abstract method.");
};

/**
 * Updates zero, one or several rows.
 *
 * @name update
 * @function
 * @memberof odba.Table#
 * @abstract
 *
 * @param {Object} [where]      The condition.
 * @param {Object} cols         The columns to update.
 * @param {Function} [callback] The function to call: fn(error).
 *
 * @example
 * user.update({state: "locked"}, function(error) { ... });
 * user.update({userId: 1}, {password: "newPwd"}, function(error) { ... });
 */
Table.prototype.update = function update() {
  throw new Error("Abstract method.");
};

/**
 * Removes zero, one or several rows.
 *
 * @name remove
 * @function
 * @memberof odba.Table#
 * @abstract
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
Table.prototype.remove = function remove() {
  throw new Error("Abstract method.");
};

/**
 * The odba package.
 *
 * @namespace odba
 */
Object.defineProperty(window, "odba", {value: {}, enumerable: true});

Object.defineProperty(odba, "util", {
  value: {
    inherits: function inherits(child, parent) {
      child.super_ = parent;
      child.prototype = Object.create(parent.prototype, {
        constructor: {
          value: child,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },

    _extend: function(origin, add) {
      if (typeof(add) == "object") {
        for (var i = 0, keys = Object.keys(add); i < keys.length; ++i) {
          var k = keys[i];
          origin[k] = add[k];
        }
      }

      return origin;
    },

    getBrowserName: function() {
      return window.chrome ? "Chrome" : "Other";
    }
  }
});

Object.defineProperty(odba, "Combinator", {value: Combinator, enumerable: true});
Object.defineProperty(odba, "Connection", {value: Connection, enumerable: true});
Object.defineProperty(odba, "Database", {value: Database, enumerable: true});
Object.defineProperty(odba, "Driver", {value: Driver, enumerable: true});
Object.defineProperty(odba, "Index", {value: Index, enumerable: true});
Object.defineProperty(odba, "Query", {value: Query, enumerable: true});
Object.defineProperty(odba, "Result", {value: Result, enumerable: true});
Object.defineProperty(odba, "ResultFilter", {value: ResultFilter, enumerable: true});
Object.defineProperty(odba, "Server", {value: Server, enumerable: true});
Object.defineProperty(odba, "Table", {value: Table, enumerable: true});

})();

/**
 * The IndexedDB namespace.
 *
 * @namespace odba.indexeddb
 */
Object.defineProperty(odba, "indexeddb", {value: {}, enumerable: true});



(function() {

/**
 * An IndexedDB connection.
 *
 * @class odba.indexeddb.IndexedDBConnection
 * @extends odba.Connection
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
   * @memberof odba.indexeddb.IndexedDBConnection#
   * @private
   */
  Object.defineProperty(this, "config", {value: config});

  /**
   * The database connected to.
   *
   * @name database
   * @type {odba.indexeddb.IndexedDBDatabase}
   * @memberof odba.indexeddb.IndexedDBConnection#
   */
  Object.defineProperty(this, "database", {value: undefined, enumerable: true, writable: true});

  /**
   * The transaction.
   *
   * @name transaction
   * @type {odba.indexeddb.IndexedDBTransaction}
   * @memberof odba.indexeddb.IndexedDBConnection#
   * @private
   */
  Object.defineProperty(this, "transaction", {value: undefined, writable: true});

  try {
    Object.defineProperty(this, "indexedDB", {value: Modernizr.indexedDB});
  } catch (e) {
    Object.defineProperty(this, "indexedDB", {value: window.indexedDB});
  }
}

odba.util.inherits(IndexedDBConnection, odba.Connection);
Object.defineProperty(odba.indexeddb, "IndexedDBConnection", {value: IndexedDBConnection});

/**
 * The server object.
 *
 * @name server
 * @type {odba.indexeddb.IndexedDBServer}
 * @memberof odba.indexeddb.IndexedDBConnection#
 */
IndexedDBConnection.prototype.__defineGetter__("server", function() {
  if (!this._server) {
    Object.defineProperty(this, "_server", {value: new odba.indexeddb.IndexedDBServer(this), writable: true});
  }

  return this._server;
});

/**
 * Generates a clone of this connection.
 * The clone connection will be closed.
 *
 * @name clone
 * @function
 * @memberof odba.indexeddb.Connection#
 * @private
 *
 * @returns {IndexedDBConnection}
 */
IndexedDBConnection.prototype.clone = function clone() {
  return new IndexedDBConnection(odba.util._extend({}, this.config));
};

/**
 * Is it connected?
 *
 * @name connected
 * @type {Boolean}
 * @memberof odba.indexeddb.IndexedDBConnection#
 */
IndexedDBConnection.prototype.__defineGetter__("connected", function() {
  return (this.database !== undefined && this.database !== null);
});

/**
 * Opens the connection.
 *
 * @name open
 * @function
 * @memberof odba.indexeddb.IndexedDBConnection#
 *
 * @param {Function} [callback] The function to call: fn(error, db).
 *
 * @example
 * cx.open(function(error, db) { ... });
 */
IndexedDBConnection.prototype.open = function open(callback) {
  var self = this, req, indexedDB = this.indexedDB;
  var IndexedDBDatabase = odba.indexeddb.IndexedDBDatabase;

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
 * @memberof odba.indexeddb.IndexedDBConnection#
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
 * @memberof odba.indexeddb.IndexedDBConnection#
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
  var IndexedDBTransaction = odba.indexeddb.IndexedDBTransaction;
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
 * @memberof odba.indexeddb.IndexedDBConnection#
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
 * @memberof odba.indexeddb.IndexedDBConnection#
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

(function() {

/**
 * An IndexedDB database.
 *
 * @class odba.indexeddb.IndexedDBDatabase
 * @extends odba.Database
 * @protected
 *
 * @param {IndexedDBConnection} cx  The connection.
 * @param {IDBDatabase} db          The native database.
 */
function IndexedDBDatabase(cx, db) {
  /**
   * The connection to work with.
   *
   * @name connection
   * @type {odba.indexeddb.IndexedDBConnection}
   * @memberof odba.indexeddb.IndexedDBDatabase#
   */
  Object.defineProperty(this, "connection", {value: cx});

  /**
   * The database name.
   *
   * @name name
   * @type {String}
   * @memberof odba.indexeddb.IndexedDBDatabase#
   */
  Object.defineProperty(this, "name", {value: db.name, enumerable: true});

  /**
   * The database version.
   *
   * @name version
   * @type {Number}
   * @memberof odba.indexeddb.IndexedDBDatabase#
   */
  Object.defineProperty(this, "version", {value: db.version, enumerable: true});

  /**
   * The native database object.
   *
   * @name native
   * @type {IDBDatabase}
   * @memberof odba.indexeddb.IndexedDBDatabase#
   * @private
   */
  Object.defineProperty(this, "native", {value: db});

  /**
   * The object store names.
   *
   * @name objectStoreNames
   * @type {String[]}
   * @memberof odba.indexeddb.IndexedDBDatabase#
   * @private
   */
  Object.defineProperty(this, "objectStoreNames", {value: []});

  for (var i = 0, stores = db.objectStoreNames; i < stores.length; ++i) {
    this.objectStoreNames.push(String(stores[i]));
  }
}

odba.util.inherits(IndexedDBDatabase, odba.Database);
Object.defineProperty(odba.indexeddb, "IndexedDBDatabase", {value: IndexedDBDatabase});

/**
 * The native active transaction of the connection.
 *
 * @name transaction
 * @type {IDBTransaction}
 * @memberof odba.indexeddb.IndexedDBDatabase#
 * @private
 */
IndexedDBDatabase.prototype.__defineGetter__("transaction", function() {
  return this.connection.transaction;
});

/**
 * @private
 *
 * @returns {Boolean}
 */
IndexedDBDatabase.prototype.containsObjectStore = function containsObjectStore(name) {
  return this.native.objectStoreNames.contains(name);
};

/**
 * @private
 *
 * @returns {Boolean}
 */
IndexedDBDatabase.prototype.containsObjectStores = function containsObjectStores(names) {
  var res;

  //(1) check
  res = true;

  for (var i = 0; i < names.length; ++i) {
    if (!this.containsObjectStore(names[i])) {
      res = false;
      break;
    }
  }

  //(2) return
  return res;
};

/**
 * Does the object store exist?
 *
 * @name hasTable
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} name       The object store name.
 * @param {Function} callback The function to call: fn(exists).
 *
 * @example
 * db.hasTable("user", function(error, exists) { ... });
 */
IndexedDBDatabase.prototype.hasTable = function hasTable(name, callback) {
  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table name and callback expected.");
  }

  //(2) check
  callback(undefined, this.containsObjectStore(name));
};

/**
 * Do the object stores exist?
 *
 * @name hasTables
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String[]} names    The object store names.
 * @param {Function} callback The function to call: fn(exist).
 *
 * @example
 * db.hasTables(["user", "session"], function(error, exist) { ... });
 */
IndexedDBDatabase.prototype.hasTables = function hasTables(names, callback) {
  var res;

  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table names and callback expected.");
  }

  //(2) check
  if (names.length === 0) {
    res = false;
  } else {
    res = true;

    for (var i = 0; i < names.length; ++i) {
      if (!this.containsObjectStore(names[i])) {
        res = false;
        break;
      }
    }
  }

  //(3) return
  callback(undefined, res);
};

/**
 * Returns an object store synchronously.
 * Note: A transaction must be active.
 *
 * @name getTable
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 * @private
 *
 * @param {String} name The object store name.
 *
 * @returns {IndexedDBTable}
 */
IndexedDBDatabase.prototype.getTable = function getTable(name) {
  return new odba.indexeddb.IndexedDBTable(this, this.transaction.getObjectStore(name));
};

/**
 * Returns an object store.
 *
 * @name findTable
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} name       The object store name.
 * @param {Function} callback The function to call: fn(error, store).
 *
 * @example
 * db.findTable("user", function(error, store) { ... });
 */
IndexedDBDatabase.prototype.findTable = function findTable(name, callback) {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var table;

  //(1) arguments
  if (arguments.length < 2) {
    throw new Error("Table name and callback expected.");
  }

  //(2) check
  if (this.containsObjectStore(name)) {
    var tran;

    //get tran to know key path
    tran = this.connection.beginTransaction({
      error: function(e) { callback(e); }
    });

    //get object store
    table = new IndexedDBTable(this, tran.getObjectStore(name));
  }

  //(3) return
  callback(undefined, table);
};

/**
 * Creates a new object store.
 * Note: This operation must be run into a version change transaction.
 *
 * @name createTable
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} name         The object store name.
 * @param {Object} [options]    The creation options: keyPath or id (String) and
 *                              autoIncrement (Boolean).
 * @param {Function} [callback] The function to call: fn(error, store).
 *
 * @example
 * db.createTable("user");
 * db.createTable("user", function(error, store) { ... });
 * db.createTable("user", {id: "userId", autoIncrement: true});
 * db.createTable("user", {id: "userId", autoIncrement: true}, function(error, store) { ... });
 */
IndexedDBDatabase.prototype.createTable = function createTable(name, options, callback) {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var tran, util = odba.util;

  //(1) arguments
  if (arguments.length < 1) {
    throw new Error("Table name expected.");
  } else if (arguments.length == 2) {
    if (arguments[1] instanceof Function) {
      callback = arguments[1];
      options = undefined;
    }
  }

  options = util._extend({}, options);

  if (options.hasOwnProperty("id") && !options.hasOwnProperty("keyPath")) {
    options.keyPath = options.id;
  }

  //(2) get transaction
  tran = this.transaction;

  if (!tran) {
    if (callback) callback(new Error("Database.createTable() only into Server.createDatabase() or Server.alterDatabase()."));
    return;
  }

  //(3) create
  if (this.native.objectStoreNames.contains(name)) {
    if (callback) callback(new Error("Object store '" + name + "' already exists."));
  } else {
    var store = this.native.createObjectStore(name, options);
    if (callback) callback(undefined, new IndexedDBTable(this, store));
  }
};

/**
 * Creates new object stores.
 * Note: This operation must be run into a version change transaction.
 *
 * @name createTables
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {Object[]} stores     The object stores: name (String), keyPath (String) and autoIncrement (Boolean).
 * @param {Function} [callback] The function to call: fn(error, stores).
 *
 * @example
 * db.createTables([
 *   {name: "user", id: "userId", autoIncrement: true},
 *   {name: "session", id: "sessionId", autoIncrement: true}
 * ], function(error, stores) { ... });
 */
IndexedDBDatabase.prototype.createTables = function createTables(stores, callback) {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var tran, res = [];

  //(1) get tran
  tran = this.transaction;

  if (!tran) {
    if (callback) callback(new Error("Database.createTables() only into Server.createDatabase() or Server.alterDatabase()."));
    return;
  }

  //(2) create
  for (var i = 0; i < stores.length; ++i) {
    var store = stores[i];
    res.push(new IndexedDBTable(this, this.native.createObjectStore(store.name, store)));
  }

  //(3) callback
  if (callback) callback(undefined, res);
};

/**
 * Drops an object store.
 * Note: This operation must be run into a version change transaction.
 *
 * @name dropTable
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} name         The object store name.
 * @param {Function} [callback] The function to call: fn(error).
 */
IndexedDBDatabase.prototype.dropTable = function dropTable(name, callback) {
  var tran;

  //(1) get tran
  if (!this.connection.hasTransaction("versionchange")) {
    if (callback) callback(new Error("Database.dropTable() only into Server.alterDatabase()."));
    return;
  }

  tran = this.connection.transaction;

  //(2) drop
  if (this.containsObjectStore(name)) {
    this.native.deleteObjectStore(name);
  }

  //(3) callback
  if (callback) callback();
};

/**
 * Returns an index.
 *
 * @name findIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} table      The table name.
 * @param {String} index      The index name.
 * @param {Function} callback The function to call: fn(error, index).
 *
 * @example
 * db.findIndex("user", "ix_username", function(error, ix) { ... });
 */
IndexedDBDatabase.prototype.findIndex = function findIndex(table, index, callback) {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var tran, store, ix;

  //(1) arguments
  if (arguments.length < 3) {
    throw new Error("Table name, index name and callback expected.");
  }

  //(2) get index
  if (this.containsObjectStore(table)) {
    //get transaction
    tran = (this.activeTransaction || this.native.transaction([table], "readonly"));

    //get store
    store = tran.objectStore(table);

    //get index
    if (store.indexNames.contains(index)) {
      var tab = new IndexedDBTable(this, store);
      ix = tab.indexes[index];
    }
  }

  //(3) return index
  callback(undefined, ix);
};

/**
 * Checks whether a table has a specified index.
 *
 * @name hasIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} table      The object store name.
 * @param {String} ix         The index name.
 * @param {Function} callback The function to call: fn(error, exist).
 */
IndexedDBDatabase.prototype.hasIndex = function hasIndex(table, ix, callback) {
  var tran, res;

  //(1) arguments
  if (arguments.length < 3) {
    throw new Error("Table name, index name and callback expected.");
  }

  //(2) check object store
  if (!this.containsObjectStore(table)) {
    res = false;
  } else {
    tran = this.connection.beginTransaction(undefined, table);
    tran.on("error", function(e) { callback(e); });

    var store = tran.getObjectStore(table);
    res = store.indexNames.contains(ix);
  }

  //(3) check
  callback(undefined, res);
};

/**
 * Creates an index.
 * Note: This method must be run into a version change transaction.
 *
 * @name createIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} table        The object store name.
 * @param {String} index        The index name.
 * @param {String} col          The indexing column.
 * @param {Object} [options]    The index options: unique (boolean).
 * @param {Function} [callback] The function to call: fn(error).
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

  //(2) create
  if (!this.connection.hasTransaction("versionchange")) {
    if (callback) callback(new Error("Database.createIndex() only into Server.createDatabase() or Server.alterDatabase()."));
  } else {
    tran = this.transaction;

    if (!this.containsObjectStore(table)) {
      if (callback) callback(new Error("Object store '" + table + "' doesn't exist."));
    } else {
      store = tran.getObjectStore(table);

      if (store.indexNames.contains(index)) {
        if (callback) callback(new Error("Index '" + index + "' on '" + table + "' already exists."));
      } else {
        store.createIndex(index, col, options);
        if (callback) callback();
      }
    }
  }
};

/**
 * Drops an index.
 *
 * @name dropIndex
 * @function
 * @memberof odba.indexeddb.IndexedDBDatabase#
 *
 * @param {String} table        The object store name.
 * @param {String} index        The index name.
 * @param {Function} [callback] The function to call: fn(error).
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

  //(2) drop
  if (!this.connection.hasTransaction("versionchange")) {
    if (callback) callback(new Error("Database.dropIndex() only into Server.alterDatabase()."));
  } else {
    tran = this.transaction;

    if (this.containsObjectStore(table)) {
      store = tran.getObjectStore(table);
      if (store.indexNames.contains(index)) store.deleteIndex(index);
    }

    if (callback) callback();
  }
};

})();

(function() {

/**
 * An IndexedDB driver.
 *
 * @class odba.indexeddb.IndexedDBDriver
 * @extends odba.Driver
 * @protected
 */
function IndexedDBDriver() {
  IndexedDBDriver.super_.call(this, "IndexedDB");
}

odba.util.inherits(IndexedDBDriver, odba.Driver);
Object.defineProperty(odba.indexeddb, "IndexedDBDriver", {value: IndexedDBDriver});
odba.Driver.register(new IndexedDBDriver());

/**
 * Creates a connection object to the IndexedDB engine.
 *
 * @name createConnection
 * @function
 * @memberof odba.indexeddb.IndexedDBDriver#
 *
 * @param {Object} config The connection configuration: database (String).
 * @returns {odba.indexeddb.IndexedDBConnection}
 *
 * @example
 * cx = drv.createConnection({database: "mydb"});
 */
IndexedDBDriver.prototype.createConnection = function createConnection(config) {
  //(1) pre
  if (!config) {
    throw new Error("Configuration expected.");
  }

  if (!config.database) {
    throw new Error("Database name expected.");
  }

  //(2) return connection
  return new odba.indexeddb.IndexedDBConnection(config);
};

})();

(function() {

/**
 * An index.
 *
 * @class odba.indexeddb.IndexedDBIndex
 * @extends odba.Index
 * @protected
 *
 * @param {IndexedDBTable} store  The store.
 * @param {IDBIndex} ix           The index.
 */
function IndexedDBIndex(store, ix) {
  /**
   * The object store.
   *
   * @name table
   * @type {odba.indexeddb.IndexedDBTable}
   * @memberof odba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "table", {value: store});

  /**
   * The index name.
   *
   * @name name
   * @type {String}
   * @memberof odba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "name", {value: ix.name});

  /**
   * The indexing column name.
   *
   * @name column
   * @type {String}
   * @memberof odba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "column", {value: ix.keyPath});

  /**
   * Is it unique?
   *
   * @name unique
   * @type {Boolean}
   * @memberof odba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "unique", {value: ix.unique});

  /**
   * The native index object.
   *
   * @name native
   * @type {IDBIndex}
   * @memberof odba.indexeddb.IndexedDBIndex#
   * @private
   */
  Object.defineProperty(this, "native", {value: ix});
}

odba.util.inherits(IndexedDBIndex, odba.Index);
Object.defineProperty(odba.indexeddb, "IndexedDBIndex", {value: IndexedDBIndex});

/**
 * The database.
 *
 * @name database
 * @type {odba.indexeddb.IndexedDBDatabase}
 * @memberof odba.indexeddb.IndexedDBIndex#
 */
IndexedDBIndex.prototype.__defineGetter__("database", function() {
  return this.table.database;
});

/**
 * The connection.
 *
 * @name connection
 * @type {odba.indexeddb.IndexedDBConnection}
 * @memberof odba.indexeddb.IndexedDBIndex#
 * @private
 */
IndexedDBIndex.prototype.__defineGetter__("connection", function() {
  return this.table.connection;
});

})();

(function() {

/**
 * A query.
 *
 * @class odba.indexeddb.IndexedDBQuery
 * @extends odba.Query
 * @protected
 *
 * @param {IndexedDBTable} table
 */
function IndexedDBQuery(table) {
  Object.defineProperty(this, "sourceTable", {value: table});
  Object.defineProperty(this, "sourceColumn", {value: undefined, writable: true});
  Object.defineProperty(this, "targetTable", {value: undefined, writable: true});
  Object.defineProperty(this, "targetColumn", {value: undefined, writable: true});
  Object.defineProperty(this, "filter", {value: {}, writable: true});
}

odba.util.inherits(IndexedDBQuery, odba.Query);
Object.defineProperty(odba.indexeddb, "IndexedDBQuery", {value: IndexedDBQuery});

/**
 * Returns if the query is simple.
 *
 * @name isSimpleQuery
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 * @private
 *
 * @returns {Boolean}
 */
IndexedDBQuery.prototype.isSimpleQuery = function isSimpleQuery() {
  return !this.isCompoundQuery();
};

/**
 * Returns if the query is compund.
 *
 * @name isCompoundQuery
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 * @private
 *
 * @returns {Boolean}
 */
IndexedDBQuery.prototype.isCompoundQuery = function isCompoundQuery() {
  return !!this.targetTable;
};

/**
 * Returns all records.
 *
 * @name findAll
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBQuery.prototype.findAll = function findAll(callback) {
  //(1) pre: arguments
  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) run query
  new odba.indexeddb.QueryEngine().run(this, callback);
};

/**
 * Runs the query.
 *
 * @name find
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 *
 * @param {Object} [filter]   The filter object.
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBQuery.prototype.find = function find(filter, callback) {
  //(1) pre: arguments
  if (arguments[0] instanceof Function && !callback) {
    callback = arguments[0];
    filter = undefined;
  }

  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) configure query
  this.filter = filter;

  //(3) run query
  new odba.indexeddb.QueryEngine().run(this, callback);
};

/**
 * Runs the query.
 *
 * @name findOne
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 *
 * @param {Object} [filter]   The filter object.
 * @param {Function} callback The function to call: fn(error, record).
 */
IndexedDBQuery.prototype.findOne = function findOne(filter, callback) {
  //(1) pre: arguments
  if (arguments[0] instanceof Function && !callback) {
    callback = arguments[0];
    filter = undefined;
  }

  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) find
  this.find(filter, function(error, result) {
    if (error) callback(error);
    else callback(undefined, (result.length > 0 ? result.rows[0] : undefined));
  });
};

/**
 * Performs a join.
 *
 * @name join
 * @function
 * @memberof odba.indexeddb.IndexedDBQuery#
 *
 * @param {String} target       The target table/store.
 * @param {String} col1         The source column.
 * @param {String} [col2]       The target column.
 * @param {Function} [callback] The function to call: function(error, result).
 *
 * @returns {IndexedDBQuery} If no callback is specified, it returns the query.
 *
 * @example Natural join.
 * user.join("session", "userId")
 * user.join("session", "userId", function(error, result) { ... });
 *
 * @example
 * user.join("session", "userId", "userId")
 * user.join("session", "userId", "userId", function(error, result) { ... });
 *
 * @example Restricting records.
 * user.join("session", "userId").find({username: "user01"}, function(error, result) { ... });
 */
IndexedDBQuery.prototype.join = function join(target, col1, col2, callback) {
  //(1) pre: arguments
  if (!target || !col1) {
    throw new Error("Target table and join column expected.");
  }

  if (arguments[2] instanceof Function) {
    callback = arguments[2];
    col2 = undefined;
  }

  if (!col2) col2 = col1;

  //(2) configure query
  this.sourceColumn = col1;
  this.targetTable = target;
  this.targetColumn = col2;

  //(3) run query if needed
  if (callback) this.find(callback);
  else return this;
};

})();

(function() {

/**
 * A query engine.
 *
 * @class odba.indexeddb.QueryEngine
 * @private
 */
function QueryEngine() {

}

Object.defineProperty(odba.indexeddb, "QueryEngine", {value: QueryEngine});

QueryEngine.prototype.__defineGetter__("combinator", function() {
  return new odba.Combinator();
});

QueryEngine.prototype.__defineGetter__("filter", function() {
  return new odba.ResultFilter();
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
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;
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
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;
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
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;

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
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;
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
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;
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

(function() {

/**
 * An IndexedDBResult.
 *
 * @class odba.indexeddb.IndexedDBResult
 * @extends odba.Result
 *
 * @param {Object[]} records  The records.
 * @param {Object} options    The options: byKey (Boolean), byIndex (Boolean).
 */
function IndexedDBResult(records, options) {
  if (!options) options = {};
  if (!options.byKey) options.byKey = false;
  if (!options.byIndex) options.byIndex = false;

  IndexedDBResult.super_.call(this, records);

  /**
   * Has it been solved by key?
   *
   * @name byKey
   * @type {Boolean}
   * @memberof odba.indexeddb.IndexedDBResult#
   */
  Object.defineProperty(this, "byKey", {value: options.byKey});

  /**
   * Has it been solved by index?
   *
   * @name byIndex
   * @type {Boolean}
   * @memberof odba.indexeddb.IndexedDBResult#
   */
  Object.defineProperty(this, "byIndex", {value: options.byIndex});
}

odba.util.inherits(IndexedDBResult, odba.Result);
Object.defineProperty(odba.indexeddb, "IndexedDBResult", {value: IndexedDBResult});

})();

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

(function() {

/**
 * An IndexedDB store.
 *
 * @class odba.indexeddb.IndexedDBTable
 * @extends odba.Table
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

odba.util.inherits(IndexedDBTable, odba.Table);
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

(function() {

/**
 * A transaction.
 *
 * @class odba.indexeddb.IndexedDBTransaction
 * @protected
 *
 * @param {IDBTransaction} tran     The native transaction.
 * @param {IndexedDBConnection} cx  The transaction connection.
 * @param {String[]} stores         The object store names that can be used into the transaction.
 * @param {Object} handlers         The event handlers: error, abort and complete.
 */
function IndexedDBTransaction(tran, cx, stores, handlers) {
  var self = this;

  //(1) initialize properties
  Object.defineProperty(this, "native", {value: tran});
  Object.defineProperty(this, "connection", {value: cx});
  Object.defineProperty(this, "abortHandlers", {value: []});
  Object.defineProperty(this, "errorHandlers", {value: []});
  Object.defineProperty(this, "completeHandlers", {value: []});
  Object.defineProperty(this, "state", {value: "active", writable: true});
  Object.defineProperty(this, "objectStoreNames", {value: stores});

  //(2) configure event native handlers
  tran.onerror = function onerror(e) {
    self.connection.transaction = undefined;
    self.handleErrorEvent(e);
  };

  tran.onabort = function onabort(e) {
    self.connection.transaction = undefined;
    self.handleAbortEvent(e);
  };

  tran.oncomplete = function oncomplete(e) {
    self.connection.transaction = undefined;
    self.handleCompleteEvent(e);
  };

  //(3) set event handlers if specified
  if (handlers) {
    if (handlers.error) this.on("error", handlers.error);
    if (handlers.abort) this.on("abort", handlers.abort);
    if (handlers.complete) this.on("complete", handlers.complete);
  }
}

Object.defineProperty(odba.indexeddb, "IndexedDBTransaction", {value: IndexedDBTransaction});

/**
 * The current mode: readonly, readwrite or versionchange.
 *
 * @name mode
 * @type {String}
 * @memberof odba.indexeddb.IndexedDBTransaction#
 */
IndexedDBTransaction.prototype.__defineGetter__("mode", function() {
  return this.native.mode;
});

/**
 * The database.
 *
 * @name database
 * @type {odba.indexeddb.IndexedDBDatabase}
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 */
IndexedDBTransaction.prototype.__defineGetter__("database", function() {
  return this.connection.database;
});

/**
 * Adds an event handler.
 *
 * @name on
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 *
 * @param {String} event      The event name: error, abort or complete.
 * @param {Function} handler  The handler function.
 *
 * @example
 * tran.on("error", function(e) { ... })
 * tran.on({error: function(e) { ....}})
 */
IndexedDBTransaction.prototype.on = function on(event, handler) {
  if (arguments.length == 1) {
    var handlers = arguments[0];

    if (handlers.abort) this.on("abort", handlers.abort);
    else if (handlers.error) this.on("error", handlers.error);
    else if (handlers.complete) this.on("complete", handlers.complete);
  } else {
    if (event == "abort") this.abortHandlers.push(handler);
    else if (event == "error") this.errorHandlers.push(handler);
    else if (event == "complete") this.completeHandlers.push(handler);
  }
};

/**
 * Adds several handlers.
 *
 * @name addHandlers
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 *
 * @param {Object} handlers The events and handlers.
 *
 * @example
 * tran.addHandlers({error: function(e) { ... }, abort: function(e) { ... }});
 */
IndexedDBTransaction.prototype.addHandlers = function addHandlers(handlers) {
  if (handlers) {
    for (var i = 0, events = Object.keys(handlers); i < events.length; ++i) {
      var event = events[i];
      var handler = handlers[event];

      this.on(event, handler);
    }
  }
};

/**
 * Handles an error event.
 *
 * @name handleErrorEvent
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleErrorEvent = function handleErrorEvent(e) {
  //(1) update state
  this.state = "aborted";

  //(2) call handlers
  for (var i = 0, handlers = this.errorHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Handles an abort event.
 *
 * @name handleAbortEvent
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleAbortEvent = function handleAbortEvent(e) {
  //(1) update state
  this.state = "error";

  //(2) call handlers
  for (var i = 0, handlers = this.abortHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Handles a complete event.
 *
 * @name handleCompleteEvent
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleCompleteEvent = function handleCompleteEvent(e) {
  //(1) update state
  this.state = "committed";

  //(2) call handlers
  for (var i = 0, handlers = this.completeHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Returns an object store to use into this transaction.
 *
 * @name getObjectStore
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 *
 * @param {String} name The object store name.
 *
 * @returns {IDBObjectStore}
 */
IndexedDBTransaction.prototype.getObjectStore = function getObjectStore(name) {
  if (this.mode == "readonly" || this.mode == "readwrite") {
    if (this.objectStoreNames.indexOf(name) < 0) {
      throw new Error("The active transaction only can access to the following object stores: " +
                      (this.objectStores || "no specified") + ".");
    }
  }

  return this.native.objectStore(name);
};

/**
 * Returns an object store to use into this transaction.
 *
 * @name getTable
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 * @private
 *
 * @param {String} name The object store name.
 *
 * @returns {IndexedDBTable}
 */
IndexedDBTransaction.prototype.getTable = function getTable(name) {
  return new odba.indexeddb.IndexedDBTable(this.database, this.getObjectStore(name));
};

/**
 * Aborts or roll backs the transaction.
 *
 * @name rollback
 * @function
 * @memberof odba.indexeddb.IndexedDBTransaction#
 */
IndexedDBTransaction.prototype.rollback = function rollback() {
  this.native.abort();
};

})();

(function() {

/**
 * An column/field updater.
 *
 * @class odba.indexeddb.Updater
 * @private
 */
function Updater() {

}

Object.defineProperty(odba.indexeddb, "Updater", {value: Updater});

/**
 * Updates specified fields with given values.
 *
 * @name update
 * @function
 * @memberof odba.indexeddb.Updater#
 *
 * @param {Object} records  The records to update.
 * @param {Object} fields   The fields and their new value.
 */
Updater.prototype.update = function update(records, fields) {
  for (var i = 0; i < records.length; ++i) {
    this.updateRecord(records[i], fields);
  }
};

/**
 * @name updateRecord
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.updateRecord = function updateRecord(record, fields) {
  for (var i = 0, props = Object.keys(fields); i < props.length; ++i) {
    var prop = props[i];
    var val = fields[prop];

    this.updateField(record, prop, val);
  }
};

/**
 * @name updateField
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.updateField = function updateField(record, prop, expr) {
  //help functions
  function hasModifier(expr) {
    var res;

    //(1) check
    if (typeof(expr) != "object") {
      res = false;
    } else {
      var props = Object.keys(expr);

      if (props.length == 1) {
        res = (/^\$.+/.test(props[0]));
      } else {
        res = false;
      }
    }

    //(2) return result
    return res;
  }

  //main
  if (hasModifier(expr)) {
    var mod = Object.keys(expr)[0];
    var val = expr[mod];

    if (mod == "$set") this.$set(record, prop, val);
    else if (mod == "$inc") this.$inc(record, prop, val);
    else if (mod == "$dec") this.$dec(record, prop, val);
    else if (mod == "$mul") this.$mul(record, prop, val);
    else throw new Error("Invalid update modifier: '" + mod + "'.");
  } else {
    this.$set(record, prop, expr);
  }
};

/**
 * @name $set
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$set = function $set(record, prop, value) {
  record[prop] = value;
};

/**
 * @name $inc
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$inc = function $inc(record, prop, value) {
  record[prop] += value;
};

/**
 * @name $dec
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$dec = function $dec(record, prop, value) {
  record[prop] -= value;
};

/**
 * @name $mul
 * @function
 * @memberof odba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$mul = function $mul(record, prop, value) {
  record[prop] *= value;
};

})();