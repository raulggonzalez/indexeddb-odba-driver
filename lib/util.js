const util = {
  inherits: function inherits(child, parent) {
    child.super_ = parent;
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },

  _extend: function(origin, add) {
    if (typeof(add) == "object") {
      for (var i = 0, keys = Object.keys(add); i < keys.length; ++i) {
        var k = keys[i];
        origin[k] = add[k];
      }
    }

    return origin;
  }
}