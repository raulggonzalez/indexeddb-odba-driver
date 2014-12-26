(function() {

/**
 * A query.
 *
 * @class vdba.indexeddb.IndexedDBQuery
 * @extends vdba.Query
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

vdba.util.inherits(IndexedDBQuery, vdba.Query);
Object.defineProperty(vdba.indexeddb, "IndexedDBQuery", {value: IndexedDBQuery});

/**
 * Returns if the query is simple.
 *
 * @name isSimpleQuery
 * @function
 * @memberof vdba.indexeddb.IndexedDBQuery#
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
 * @memberof vdba.indexeddb.IndexedDBQuery#
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
 * @memberof vdba.indexeddb.IndexedDBQuery#
 *
 * @param {Function} callback The function to call: fn(error, result).
 */
IndexedDBQuery.prototype.findAll = function findAll(callback) {
  //(1) pre: arguments
  if (!callback) {
    throw new Error("Callback expected.");
  }

  //(2) run query
  new vdba.indexeddb.QueryEngine().run(this, callback);
};

/**
 * Runs the query.
 *
 * @name find
 * @function
 * @memberof vdba.indexeddb.IndexedDBQuery#
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
  new vdba.indexeddb.QueryEngine().run(this, callback);
};

/**
 * Runs the query.
 *
 * @name findOne
 * @function
 * @memberof vdba.indexeddb.IndexedDBQuery#
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
 * @memberof vdba.indexeddb.IndexedDBQuery#
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