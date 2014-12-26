(function() {

/**
 * An column/field updater.
 *
 * @class vdba.indexeddb.Updater
 * @private
 */
function Updater() {

}

Object.defineProperty(vdba.indexeddb, "Updater", {value: Updater});

/**
 * Updates specified fields with given values.
 *
 * @name update
 * @function
 * @memberof vdba.indexeddb.Updater#
 *
 * @param {Object} records  The records to update.
 * @param {Object} fields   The fields and their new value.
 */
Updater.prototype.update = function update(records, fields) {
  for (var i = 0; i < records.length; ++i) {
    this.updateRecord(records[i], fields);
  }
};

/**
 * @name updateRecord
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.updateRecord = function updateRecord(record, fields) {
  for (var i = 0, props = Object.keys(fields); i < props.length; ++i) {
    var prop = props[i];
    var val = fields[prop];

    this.updateField(record, prop, val);
  }
};

/**
 * @name updateField
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.updateField = function updateField(record, prop, expr) {
  //help functions
  function hasModifier(expr) {
    var res;

    //(1) check
    if (typeof(expr) != "object") {
      res = false;
    } else {
      var props = Object.keys(expr);

      if (props.length == 1) {
        res = (/^\$.+/.test(props[0]));
      } else {
        res = false;
      }
    }

    //(2) return result
    return res;
  }

  //main
  if (hasModifier(expr)) {
    var mod = Object.keys(expr)[0];
    var val = expr[mod];

    if (mod == "$set") this.$set(record, prop, val);
    else if (mod == "$inc") this.$inc(record, prop, val);
    else if (mod == "$dec") this.$dec(record, prop, val);
    else if (mod == "$mul") this.$mul(record, prop, val);
    else throw new Error("Invalid update modifier: '" + mod + "'.");
  } else {
    this.$set(record, prop, expr);
  }
};

/**
 * @name $set
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$set = function $set(record, prop, value) {
  record[prop] = value;
};

/**
 * @name $inc
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$inc = function $inc(record, prop, value) {
  record[prop] += value;
};

/**
 * @name $dec
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$dec = function $dec(record, prop, value) {
  record[prop] -= value;
};

/**
 * @name $mul
 * @function
 * @memberof vdba.indexeddb.Updater#
 * @private
 */
Updater.prototype.$mul = function $mul(record, prop, value) {
  record[prop] *= value;
};

})();