(function() {

/**
 * An IndexedDB driver.
 *
 * @class odba.indexeddb.IndexedDBDriver
 * @extends odba.Driver
 * @protected
 */
function IndexedDBDriver() {
  IndexedDBDriver.super_.call(this, "IndexedDB");
}

odba.util.inherits(IndexedDBDriver, odba.Driver);
Object.defineProperty(odba.indexeddb, "IndexedDBDriver", {value: IndexedDBDriver});
odba.Driver.register(new IndexedDBDriver());

/**
 * Creates a connection object to the IndexedDB engine.
 *
 * @name createConnection
 * @function
 * @memberof odba.indexeddb.IndexedDBDriver#
 *
 * @param {Object} config The connection configuration: database (String).
 * @returns {odba.indexeddb.IndexedDBConnection}
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
  return new odba.indexeddb.IndexedDBConnection(config);
};

})();