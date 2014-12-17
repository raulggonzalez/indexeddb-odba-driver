(function() {

/**
 * An ODBA driver.
 *
 * @class odba.Driver
 * @abstract
 *
 * @param {String} name The driver name.
 */
function Driver(name) {
  /**
   * The driver name.
   *
   * @name name
   * @type {String}
   * @memberof odba.Driver#
   */
  Object.defineProperty(this, "name", {value: name});
}

Object.defineProperty(odba, "Driver", {value: Driver, enumerable: true});

/**
 * Returns a specified driver.
 *
 * @memberof odba.Driver
 *
 * @param {String} name The driver name: IndexedDB.
 * @returns A driver or undefined if the name is invalid.
 *
 * @example
 * drv = odba.Driver.getDriver("IndexedDB");
 */
Driver.getDriver = function getDriver(name) {
  var cache, drv;

  //(1) get driver cache
  if (!("cache" in this)) {
    Object.defineProperty(this, "cache", {value: {}});
  }

  cache = this.cache;

  //(2) get driver
  name = name.toLowerCase();
  drv = cache[name];

  if (!drv) {
    if (name == "indexeddb") {
      drv = cache.indexeddb = new odba.indexeddb.IndexedDBDriver();
    }
  }

  //(3) return driver
  return drv;
};

/**
 * Creates a connection object to the IndexedDB engine.
 *
 * @name createConnection
 * @function
 * @memberof odba.Driver#
 *
 * @param {Object} config The connection configuration: database (String).
 * @returns {odba.indexeddb.IndexedDBConnection}
 *
 * @example
 * cx = drv.createConnection({database: "mydb"});
 */
Driver.prototype.createConnection = function createConnection(config) {
  //(1) pre
  if (!config || !config.database) throw new Error("Database name expected.");

  //(2) return connection
  return new odba.indexeddb.IndexedDBConnection(config);
};

})();