/**
 * An column/field updater.
 *
 * @private
 */
function Updater() {

}

/**
 * Updates specified fields with given values.
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
 * @private
 */
Updater.prototype.updateField = function updateField(record, prop, expr) {
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
};

/**
 * @private
 */
Updater.prototype.$set = function $set(record, prop, value) {
  record[prop] = value;
};

/**
 * @private
 */
Updater.prototype.$inc = function $inc(record, prop, value) {
  record[prop] += value;
};

/**
 * @private
 */
Updater.prototype.$dec = function $dec(record, prop, value) {
  record[prop] -= value;
};

/**
 * @private
 */
Updater.prototype.$mul = function $mul(record, prop, value) {
  record[prop] *= value;
};