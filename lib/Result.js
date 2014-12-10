/**
 * A query result.
 *
 * @class
 *
 * @property {Number} length  Number of rows.
 * @property {Object[]} rows  The rows.
 *
 * @param {Array} rows  The rows.
 */
function Result(rows) {
  Object.defineProperty(this, "rows", {value: rows});
}

/**
 * Number of records.
 */
Result.prototype.__defineGetter__("length", function() {
  return this.rows.length;
});

/**
 * Returns the rows satisfying the restriction.
 *
 * @param {Object} where  The restriction condition.
 */
Result.prototype.find = function find(where) {
  return new ResultFilter().find(this, where);
};

