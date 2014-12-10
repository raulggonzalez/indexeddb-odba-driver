/**
 * An ODBA driver.
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