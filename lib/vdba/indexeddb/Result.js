(function() {

/**
 * An IndexedDBResult.
 *
 * @class vdba.indexeddb.IndexedDBResult
 * @extends vdba.Result
 *
 * @param {Object[]} records  The records.
 * @param {Object} options    The options: byKey (Boolean), byIndex (Boolean).
 */
function IndexedDBResult(records, options) {
  IndexedDBResult.super_.call(this, records, options);
}

vdba.util.inherits(IndexedDBResult, vdba.Result);
Object.defineProperty(vdba.indexeddb, "IndexedDBResult", {value: IndexedDBResult});

/**
 * Has it been solved by key?
 *
 * @name byKey
 * @type {Boolean}
 * @memberof vdba.indexeddb.IndexedDBResult#
 */
IndexedDBResult.prototype.__defineGetter__("byKey", function() {
  return this.options.byKey || false;
});

/**
 * Has it been solved by index?
 *
 * @name byIndex
 * @type {Boolean}
 * @memberof vdba.indexeddb.IndexedDBResult#
 */
IndexedDBResult.prototype.__defineGetter__("byIndex", function() {
  return this.options.byIndex || false;
});

})();