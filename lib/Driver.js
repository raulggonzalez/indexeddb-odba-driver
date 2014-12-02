/**
 * A driver.
 *
 * @class
 * @abstract
 *
 * @param {String} name The driver name.
 */
function Driver(name) {
  Object.defineProperty(this, "name", {value: name});
}

/**
 * Returns a specified driver.
 *
 * @param {String} name The driver name: IndexedDB.
 * @returns A driver or undefined if the name is invalid.
 *
 * @example
 * drv = Driver.getDriver("IndexedDB");
 */
Driver.getDriver = function getDriver(name) {
  if (name.toLowerCase() == "indexeddb") {
    return new IndexedDBDriver();
  }
};

/**
 * An IndexedDB driver.
 *
 * @class
 * @protected
 */
function IndexedDBDriver() {
  IndexedDBDriver.super_.call(this, "IndexedDB");
}

util.inherits(IndexedDBDriver, Driver);

/**
 * Creates a connection object to the IndexedDB engine.
 *
 * @param {Object} config The connection configuration: database (String).
 * @returns {IndexedDBConnection}
 *
 * @example
 * cx = drv.createConnection({database: "mydb"});
 */
IndexedDBDriver.prototype.createConnection = function createConnection(config) {
  //(1) pre
  if (!config || !config.database) throw new Error("Database name expected.");

  //(2) return connection
  return new IndexedDBConnection(config);
};