/**
 * An IndexedDBResult.
 *
 * @class
 * @extends Result
 *
 * @property {Boolean} byKey    Has it been solved by key?
 * @property {Boolean} byIndex  Has it been solved by index?
 *
 * @param {Object[]} records  The records.
 * @param {Object} options    The options: byKey (Boolean), byIndex (Boolean).
 */
function IndexedDBResult(records, options) {
  if (!options) options = {};
  if (!options.byKey) options.byKey = false;
  if (!options.byIndex) options.byIndex = false;

  IndexedDBResult.super_.call(this, records);
  Object.defineProperty(this, "byKey", {value: options.byKey});
  Object.defineProperty(this, "byIndex", {value: options.byIndex});
}

util.inherits(IndexedDBResult, Result);