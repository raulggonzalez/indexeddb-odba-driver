/**
 * An index.
 *
 * @class
 * @private
 *
 * @param {IndexedDBTable} store  The store.
 * @param {IDBIndex} ix           The index.
 */
function IndexedDBIndex(store, ix) {
  Object.defineProperty(this, "table", {value: store});
  Object.defineProperty(this, "name", {value: ix.name});
  Object.defineProperty(this, "column", {value: ix.keyPath});
  Object.defineProperty(this, "unique", {value: ix.unique});
  Object.defineProperty(this, "native", {value: ix});
}

/**
 * The database.
 */
IndexedDBIndex.prototype.__defineGetter__("database", function() {
  return this.table.database;
});

/**
 * The connection.
 */
IndexedDBIndex.prototype.__defineGetter__("connection", function() {
  return this.table.connection;
});