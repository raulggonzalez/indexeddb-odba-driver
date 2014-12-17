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