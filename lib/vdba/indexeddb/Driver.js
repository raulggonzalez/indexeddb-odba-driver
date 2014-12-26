(function() {

/**
 * An IndexedDB driver.
 *
 * @class vdba.indexeddb.IndexedDBDriver
 * @extends vdba.Driver
 * @protected
 */
function IndexedDBDriver() {
  IndexedDBDriver.super_.call(this, "IndexedDB");
}

vdba.util.inherits(IndexedDBDriver, vdba.Driver);
Object.defineProperty(vdba.indexeddb, "IndexedDBDriver", {value: IndexedDBDriver});
vdba.Driver.register(new IndexedDBDriver());

/**
 * Creates a connection object to the IndexedDB engine.
 *
 * @name createConnection
 * @function
 * @memberof vdba.indexeddb.IndexedDBDriver#
 *
 * @param {Object} config The connection configuration: database (String).
 * @returns {vdba.indexeddb.IndexedDBConnection}
 *
 * @example
 * cx = drv.createConnection({database: "mydb"});
 */
IndexedDBDriver.prototype.createConnection = function createConnection(config) {
  //(1) pre
  if (!config) {
    throw new Error("Configuration expected.");
  }

  if (!config.database) {
    throw new Error("Database name expected.");
  }

  //(2) return connection
  return new vdba.indexeddb.IndexedDBConnection(config);
};

})();