(function() {

/**
 * An index.
 *
 * @class odba.indexeddb.IndexedDBIndex
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