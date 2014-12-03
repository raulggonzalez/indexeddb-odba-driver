/**
 * An index.
 *
 * @class
 * @private
 *
 * @param {Object} db   The database.
 * @param {Object} tab  The owner table.
 * @param {Object} ix   The index info.
 *
 * @example From database object
 * ix = new IndexedDB(db, tab, ix)
 */
function IndexedDBIndex() {
  var db, tab, ix;

  //(1) arguments
  if (arguments.length == 3) {
    db = arguments[0];
    tab = new IndexedDBTable(db, arguments[1].name, arguments[1].keyPath);
    ix = arguments[2];
  }

  //(2) initiate this instance
  Object.defineProperty(this, "table", {value: tab});
  Object.defineProperty(this, "name", {value: ix.name});
  Object.defineProperty(this, "column", {value: ix.keyPath});
  Object.defineProperty(this, "unique", {value: ix.unique});
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