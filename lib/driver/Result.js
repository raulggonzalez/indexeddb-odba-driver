/**
 * A query result.
 *
 * @class
 * @private
 *
 * @param {Array} records The records.
 */
function IndexedDBResult(records) {
  Object.defineProperty(this, "rows", {value: records});
}

/**
 * Number of records.
 */
IndexedDBResult.prototype.__defineGetter__("length", function() {
  return this.rows.length;
});