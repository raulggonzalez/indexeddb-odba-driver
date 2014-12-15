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

Object.defineProperty(odba, "Driver", {value: Driver, enumerable: true});
delete Driver;

/**
 * Returns a specified driver.
 *
 * @param {String} name The driver name: IndexedDB.
 * @returns A driver or undefined if the name is invalid.
 *
 * @example
 * drv = odba.Driver.getDriver("IndexedDB");
 */
Driver.getDriver = function getDriver(name) {
  if (name.toLowerCase() == "indexeddb") {
    return new IndexedDBDriver();
  }
};