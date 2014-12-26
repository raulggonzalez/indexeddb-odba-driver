(function() {

/**
 * An index.
 *
 * @class vdba.indexeddb.IndexedDBIndex
 * @extends vdba.Index
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
   * @type {vdba.indexeddb.IndexedDBTable}
   * @memberof vdba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "table", {value: store});

  /**
   * The index name.
   *
   * @name name
   * @type {String}
   * @memberof vdba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "name", {value: ix.name});

  /**
   * The indexing column name.
   *
   * @name column
   * @type {String}
   * @memberof vdba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "column", {value: ix.keyPath});

  /**
   * Is it unique?
   *
   * @name unique
   * @type {Boolean}
   * @memberof vdba.indexeddb.IndexedDBIndex#
   */
  Object.defineProperty(this, "unique", {value: ix.unique});

  /**
   * The native index object.
   *
   * @name native
   * @type {IDBIndex}
   * @memberof vdba.indexeddb.IndexedDBIndex#
   * @private
   */
  Object.defineProperty(this, "native", {value: ix});
}

vdba.util.inherits(IndexedDBIndex, vdba.Index);
Object.defineProperty(vdba.indexeddb, "IndexedDBIndex", {value: IndexedDBIndex});

/**
 * The database.
 *
 * @name database
 * @type {vdba.indexeddb.IndexedDBDatabase}
 * @memberof vdba.indexeddb.IndexedDBIndex#
 */
IndexedDBIndex.prototype.__defineGetter__("database", function() {
  return this.table.database;
});

/**
 * The connection.
 *
 * @name connection
 * @type {vdba.indexeddb.IndexedDBConnection}
 * @memberof vdba.indexeddb.IndexedDBIndex#
 * @private
 */
IndexedDBIndex.prototype.__defineGetter__("connection", function() {
  return this.table.connection;
});

})();