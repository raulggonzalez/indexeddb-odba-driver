/**
 * A transaction.
 *
 * @class
 * @private
 *
 * @param {IDBTransaction} tran     The native transaction.
 * @param {IndexedDBConnection} cx  The transaction connection.
 * @param {String[]} stores         The object store names that can be used into the transaction.
 * @param {Object} handlers         The event handlers: error, abort and complete.
 */
function IndexedDBTransaction(tran, cx, stores, handlers) {
  var self = this;

  //(1) initialize properties
  Object.defineProperty(this, "native", {value: tran});
  Object.defineProperty(this, "connection", {value: cx});
  Object.defineProperty(this, "abortHandlers", {value: []});
  Object.defineProperty(this, "errorHandlers", {value: []});
  Object.defineProperty(this, "completeHandlers", {value: []});
  Object.defineProperty(this, "state", {value: "active", writable: true});
  Object.defineProperty(this, "objectStoreNames", {value: stores});

  //(2) configure event native handlers
  tran.onerror = function onerror(e) {
    self.connection.transaction = undefined;
    self.handleErrorEvent(e);
  };

  tran.onabort = function onabort(e) {
    self.connection.transaction = undefined;
    self.handleAbortEvent(e);
  };

  tran.oncomplete = function oncomplete(e) {
    self.connection.transaction = undefined;
    self.handleCompleteEvent(e);
  };

  //(3) set event handlers if specified
  if (handlers) {
    if (handlers.error) this.on("error", handlers.error);
    if (handlers.abort) this.on("abort", handlers.abort);
    if (handlers.complete) this.on("complete", handlers.complete);
  }
}

/**
 * Returns the current mode: readonly, readwrite or versionchange.
 *
 * @returns {String}
 */
IndexedDBTransaction.prototype.__defineGetter__("mode", function() {
  return this.native.mode;
});

/**
 * Returns the connection database.
 *
 * @returns {IndexedDBDatabase}
 */
IndexedDBTransaction.prototype.__defineGetter__("database", function() {
  return this.connection.database;
});

/**
 * Adds an event handler.
 *
 * @param {String} event      The event name: error, abort or complete.
 * @param {Function} handler  The handler function.
 *
 * @example
 * tran.on("error", function(e) { ... })
 * tran.on({error: function(e) { ....}})
 */
IndexedDBTransaction.prototype.on = function on(event, handler) {
  if (arguments.length == 1) {
    var handlers = arguments[0];

    if (handlers.abort) this.on("abort", handlers.abort);
    else if (handlers.error) this.on("error", handlers.error);
    else if (handlers.complete) this.on("complete", handlers.complete);
  } else {
    if (event == "abort") this.abortHandlers.push(handler);
    else if (event == "error") this.errorHandlers.push(handler);
    else if (event == "complete") this.completeHandlers.push(handler);
  }
};

/**
 * Handles an error event.
 *
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleErrorEvent = function handleErrorEvent(e) {
  //(1) update state
  this.state = "aborted";

  //(2) call handlers
  for (var i = 0, handlers = this.errorHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Handles an abort event.
 *
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleAbortEvent = function handleAbortEvent(e) {
  //(1) update state
  this.state = "error";

  //(2) call handlers
  for (var i = 0, handlers = this.abortHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Handles a complete event.
 *
 * @private
 *
 * @param {EventTarget} e The event info.
 */
IndexedDBTransaction.prototype.handleCompleteEvent = function handleCompleteEvent(e) {
  //(1) update state
  this.state = "committed";

  //(2) call handlers
  for (var i = 0, handlers = this.completeHandlers; i < handlers.length; ++i) {
    handlers[i](e);
  }
};

/**
 * Returns an object store to use into this transaction.
 *
 * @param {String} name The object store name.
 *
 * @returns {IDBObjectStore}
 */
IndexedDBTransaction.prototype.getObjectStore = function getObjectStore(name) {
  if (this.mode == "readonly" || this.mode == "readwrite") {
    if (this.objectStoreNames.indexOf(name) < 0) {
      throw new Error("The active transaction only can access to the following object stores: " +
                      (this.objectStores || "no specified") + ".");
    }
  }

  return this.native.objectStore(name);
};

/**
 * Returns an object store to use into this transaction.
 *
 * @param {String} name The object store name.
 *
 * @returns {IndexedDBTable}
 */
IndexedDBTransaction.prototype.getTable = function getTable(name) {
  return new IndexedDBTable(this.database, this.getObjectStore(name));
};

/**
 * Aborts or roll backs the transaction.
 */
IndexedDBTransaction.prototype.rollback = function rollback() {
  this.native.abort();
};