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

Object.defineProperty(odba, "Result", {value: Result});
delete Result;

/**
 * Number of records.
 */
odba.Result.prototype.__defineGetter__("length", function() {
  return this.rows.length;
});

/**
 * Returns the rows satisfying the restriction.
 *
 * @param {Object} where  The restriction condition.
 */
odba.Result.prototype.find = function find(where) {
  return new odba.ResultFilter().find(this, where);
};