describe("ResultFilter", function() {
  var IndexedDBResult = odba.indexeddb.IndexedDBResult;
  var filter = new odba.ResultFilter();
  var rows = [
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"},
    {userId: 3, username: "user03", password: "pwd03"},
    {userId: 4, username: "usr04", password: "pwd04"},
    {userId: 5, username: "usr05", password: "pwd05"},
    {userId: 6, username: "usr06", password: "pwd06"},
    {userId: 7, username: "UsEr07", password: undefined},
    {userId: 8, username: "UsEr08", password: undefined},
    {userId: 9, username: "UsR09", password: null},
    {userId: 10, username: "UsR10", password: null}
  ];

  describe("Operators", function() {
    describe("#$eq", function() {
      it("$eq(row, prop, val) : true", function() {
        filter.$eq(rows[0], "username", "user01").should.be.eql(true);
      });

      it("$eq(row, prop, val) : false", function() {
        filter.$eq(rows[0], "username", "user02").should.be.eql(false);
      });

      it("$eq(row, prop, undefined) : true", function() {
        filter.$eq(rows[7], "password", undefined).should.be.eql(true);
      });

      it("$eq(row, prop, undefined) : false", function() {
        filter.$eq(rows[0], "password", undefined).should.be.eql(false);
      });

      it("$eq(row, prop, null) : true", function() {
        filter.$eq(rows[9], "password", null).should.be.eql(true);
      });

      it("$eq(row, prop, null) : false", function() {
        filter.$eq(rows[0], "username", null).should.be.eql(false);
      });

      it("$eq(row, unknown, val)", function() {
        filter.$eq(rows[0], "unknown", 1).should.be.eql(false);
      });

      it("$eq(row, unknown, undefined)", function() {
        filter.$eq(rows[0], "unknown", undefined).should.be.eql(true);
      });

      it("$eq(row, unknown, null)", function() {
        filter.$eq(rows[0], "unknown", null).should.be.eql(false);
      });
    });

    describe("#$ne", function() {
      it("$ne(row, prop, val) : false", function() {
        filter.$ne(rows[0], "username", "user01").should.be.eql(false);
      });

      it("$ne(row, prop, val) : true", function() {
        filter.$ne(rows[0], "username", "user02").should.be.eql(true);
      });

      it("$ne(row, prop, undefined) : false", function() {
        filter.$ne(rows[7], "password", undefined).should.be.eql(false);
      });

      it("$ne(row, prop, undefined) : true", function() {
        filter.$ne(rows[0], "password", undefined).should.be.eql(true);
      });

      it("$ne(row, prop, null) : false", function() {
        filter.$ne(rows[9], "password", null).should.be.eql(false);
      });

      it("$ne(row, prop, null) : true", function() {
        filter.$ne(rows[0], "username", null).should.be.eql(true);
      });

      it("$ne(row, unknown, val)", function() {
        filter.$ne(rows[0], "unknown", 1).should.be.eql(true);
      });

      it("$ne(row, unknown, undefined)", function() {
        filter.$ne(rows[0], "unknown", undefined).should.be.eql(false);
      });

      it("$ne(row, unknown, null)", function() {
        filter.$ne(rows[0], "unknown", null).should.be.eql(true);
      });
    });

    describe("#$lt()", function() {
      it("$lt(row, prop, val-)", function() {
        filter.$lt(rows[0], "userId", 0).should.be.eql(false);
      });

      it("$lt(row, prop, val=)", function() {
        filter.$lt(rows[0], "userId", 1).should.be.eql(false);
      });

      it("$lt(row, prop, val+)", function() {
        filter.$lt(rows[0], "userId", 10).should.be.eql(true);
      });

      it("$lt(row, prop, undefined)", function() {
        filter.$lt(rows[0], "userId", undefined).should.be.eql(false);
      });

      it("$lt(row, prop, null)", function() {
        filter.$lt(rows[0], "userId", null).should.be.eql(false);
      });
    });

    describe("#$le()", function() {
      it("$le(row, prop, val-)", function() {
        filter.$le(rows[0], "userId", 0).should.be.eql(false);
      });

      it("$le(row, prop, val=)", function() {
        filter.$le(rows[0], "userId", 1).should.be.eql(true);
      });

      it("$le(row, prop, val+)", function() {
        filter.$le(rows[0], "userId", 2).should.be.eql(true);
      });

      it("$le(row, prop, undefined)", function() {
        filter.$le(rows[0], "userId", undefined).should.be.eql(false);
      });

      it("$le(row, prop, null)", function() {
        filter.$le(rows[0], "userId", null).should.be.eql(false);
      });
    });

    describe("#$gt()", function() {
      it("$gt(row, prop, val-)", function() {
        filter.$gt(rows[0], "userId", 0).should.be.eql(true);
      });

      it("$gt(row, prop, val=)", function() {
        filter.$gt(rows[0], "userId", 1).should.be.eql(false);
      });

      it("$gt(row, prop, val+)", function() {
        filter.$gt(rows[0], "userId", 2).should.be.eql(false);
      });

      it("$gt(row, prop, undefined)", function() {
        filter.$gt(rows[0], "userId", undefined).should.be.eql(false);
      });

      it("$gt(row, prop, null)", function() {
        filter.$gt(rows[0], "userId", null).should.be.eql(false);
      });
    });

    describe("#$ge()", function() {
      it("$ge(row, prop, val-)", function() {
        filter.$ge(rows[0], "userId", 0).should.be.eql(true);
      });

      it("$ge(row, prop, val=)", function() {
        filter.$ge(rows[0], "userId", 1).should.be.eql(true);
      });

      it("$ge(row, prop, val+)", function() {
        filter.$ge(rows[0], "userId", 2).should.be.eql(false);
      });

      it("$ge(row, prop, undefined)", function() {
        filter.$ge(rows[0], "userId", undefined).should.be.eql(false);
      });

      it("$ge(row, prop, null)", function() {
        filter.$ge(rows[0], "userId", null).should.be.eql(false);
      });
    });

    describe("#$like()", function() {
      it("$like(row, prop, pattern) : true", function() {
        filter.$like(rows[0], "username", "us*").should.be.eql(true);
      });

      it("$like(row, prop, pattern) : false", function() {
        filter.$like(rows[0], "username", "US*").should.be.eql(false);
      });

      it("$like(row, prop, undefined)", function() {
        filter.$like(rows[0], "username", undefined).should.be.eql(false);
      });

      it("$like(row, unknown, undefined)", function() {
        filter.$like(rows[0], "unknown", undefined).should.be.eql(true);
      });

      it("$like(row, prop, null) : true", function() {
        filter.$like(rows[9], "password", null).should.be.eql(true);
      });

      it("$like(row, prop, null) : false", function() {
        filter.$like(rows[0], "username", null).should.be.eql(false);
      });

      it("$like(row, unknown, null)", function() {
        filter.$like(rows[0], "unknown", null).should.be.eql(false);
      });
    });

    describe("#$notLike()", function() {
      it("$notLike(row, prop, pattern) : true", function() {
        filter.$notLike(rows[0], "username", "US*").should.be.eql(true);
      });

      it("$notLike(row, prop, patter) : false", function() {
        filter.$notLike(rows[0], "username", "us*").should.be.eql(false);
      });

      it("$notLike(row, prop, undefined)", function() {
        filter.$notLike(rows[0], "username", undefined).should.be.eql(true);
      });

      it("$notLike(row, unknown, undefined)", function() {
        filter.$notLike(rows[0], "unknown", undefined).should.be.eql(false);
      });

      it("$notLike(row, prop, null) : true", function() {
        filter.$notLike(rows[0], "username", null).should.be.eql(true);
      });

      it("$notLike(row, prop, null) : false", function() {
        filter.$notLike(rows[9], "password", null).should.be.eql(false);
      });

      it("$notLike(row, unknown, null)", function() {
        filter.$notLike(rows[0], "unknown", null).should.be.eql(true);
      });
    });

    describe("#$in()", function() {
      it("$in(row, prop, array) : true", function() {
        filter.$in(rows[0], "userId", [0, 1, 2]).should.be.eql(true);
      });

      it("$in(row, prop, array) : false", function() {
        filter.$in(rows[0], "userId", [0, 2]).should.be.eql(false);
      });

      it("$in(row, prop, undefined)", function() {
        filter.$in(rows[0], "userId", undefined).should.be.eql(false);
      });

      it("$in(row, prop, null)", function() {
        filter.$in(rows[0], "userId", null).should.be.eql(false);
      });

      it("$in(row, unknown, array) : true", function() {
        filter.$in(rows[0], "unknown", [0, undefined, 2]).should.be.eql(true);
      });

      it("$in(row, unknown, array) : false", function() {
        filter.$in(rows[0], "unknown", [0, 1, 2]).should.be.eql(false);
      });

      it("$in(row, null, array) : true", function() {
        filter.$in(rows[9], "password", [0, null, 2]).should.be.eql(true);
      });

      it("$in(row, null, array) : false", function() {
        filter.$in(rows[9], "password", [0, 1, 2]).should.be.eql(false);
      });
    });

    describe("#$notIn()", function() {
      it("$notIn(row, prop, array) : true", function() {
        filter.$notIn(rows[0], "userId", [0, 1, 2]).should.be.eql(false);
      });

      it("$notIn(row, prop, array) : false", function() {
        filter.$notIn(rows[0], "userId", [0, 2]).should.be.eql(true);
      });

      it("$notIn(row, prop, undefined)", function() {
        filter.$notIn(rows[0], "userId", undefined).should.be.eql(true);
      });

      it("$notIn(row, prop, null)", function() {
        filter.$notIn(rows[0], "userId", null).should.be.eql(true);
      });

      it("$notIn(row, unknown, array) : true", function() {
        filter.$notIn(rows[0], "unknown", [0, 1, 2]).should.be.eql(true);
      });

      it("$notIn(row, unknown, array) : false", function() {
        filter.$notIn(rows[0], "unknown", [0, undefined, 2]).should.be.eql(false);
      });

      it("$notIn(row, null, array) : true", function() {
        filter.$notIn(rows[9], "password", [0, 1, 2]).should.be.eql(true);
      });

      it("$notIn(row, null, array) : false", function() {
        filter.$notIn(rows[9], "password", [0, null, 2]).should.be.eql(false);
      });
    });
  });

  describe("#checkop()", function() {
    var row = rows[0];

    it("checkOp(row, prop, '$eq', filter) : true", function() {
      filter.checkOp(row, "userId", "$eq", {$eq: 1}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$eq', filter) : false", function() {
      filter.checkOp(row, "userId", "$eq", {$eq: 2}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$ne', filter) : true", function() {
      filter.checkOp(row, "userId", "$ne", {$ne: 2}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$ne', filter) : false", function() {
      filter.checkOp(row, "userId", "$ne", {$ne: 1}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$lt', filter) : true", function() {
      filter.checkOp(row, "userId", "$lt", {$lt: 2}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$lt', filter) : false", function() {
      filter.checkOp(row, "userId", "$lt", {$lt: 0}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$le', filter) : true", function() {
      filter.checkOp(row, "userId", "$le", {$le: 1}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$le', filter) : false", function() {
      filter.checkOp(row, "userId", "$le", {$le: 0}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$gt', filter) : true", function() {
      filter.checkOp(row, "userId", "$gt", {$gt: 0}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$gt', filter) : false", function() {
      filter.checkOp(row, "userId", "$gt", {$gt: 1}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$ge', filter) : true", function() {
      filter.checkOp(row, "userId", "$ge", {$ge: 1}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$ge', filter) : false", function() {
      filter.checkOp(row, "userId", "$ge", {$ge: 2}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$like', filter) : true", function() {
      filter.checkOp(row, "username", "$like", {$like: "us*"}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$like', filter) : false", function() {
      filter.checkOp(row, "username", "$like", {$like: "US*"}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$notLike', filter) : true", function() {
      filter.checkOp(row, "username", "$notLike", {$notLike: "US*"}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$notLike', filter) : false", function() {
      filter.checkOp(row, "username", "$notLike", {$notLike: "us*"}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$in', filter) : true", function() {
      filter.checkOp(row, "userId", "$in", {$in: [0, 1, 2]}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$in', filter) : false", function() {
      filter.checkOp(row, "userId", "$in", {$in: [0, 2]}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$notIn', filter) : true", function() {
      filter.checkOp(row, "userId", "$notIn", {$notIn: [0, 2]}).should.be.eql(true);
    });

    it("checkOp(row, prop, '$notIn', filter) : false", function() {
      filter.checkOp(row, "userId", "$notIn", {$notIn: [0, 1, 2]}).should.be.eql(false);
    });

    it("checkOp(row, prop, '$unknown', filter)", function() {
      (function() {
        filter.checkOp(row, "userId", "$unknown", {$unknown: 1});
      }).should.throwError("Unknown operator: '$unknown'.");
    });
  });

  describe("#check()", function() {
    var row = rows[0];

    describe("Simple", function() {
      it("check(row, {})", function() {
        filter.check(row, {}).should.be.eql(true);
      });

      it("check(row, filter) : true", function() {
        filter.check(row, {userId: 1}).should.be.eql(true);
      });

      it("check(row, filter) : false", function() {
        filter.check(row, {userId: 2}).should.be.eql(false);
      });

      it("check(row, {prop: {}}", function() {
        filter.check(row, {userId: {}}).should.be.eql(true);
      });

      it("check(row, {prop: {$unknown: vallue}})", function() {
        (function() {
          filter.check(row, {userId: {$unknown: 1}});
        }).should.throwError("Unknown operator: '$unknown'.");
      });

      it("check(row, {prop: {$eq: value}}) : true", function() {
        filter.check(row, {userId: {$eq: 1}}).should.be.eql(true);
      });

      it("check(row, {prop, {$eq: value}}) : false", function() {
        filter.check(row, {userId: {$eq: 2}}).should.be.eql(false);
      });

      it("check(row, {prop, {$ne: value}}) : true", function() {
        filter.check(row, {userId: {$ne: 0}}).should.be.eql(true);
      });

      it("check(row, {prop, {$ne: value}} : false", function() {
        filter.check(row, {userId: {$ne: 1}}).should.be.eql(false);
      });

      it("check(row, {prop, {$lt: value}) : true", function() {
        filter.check(row, {userId: {$lt: 2}}).should.be.eql(true);
      });

      it("check(row, {prop: {$lt: value}}) : false", function() {
        filter.check(row, {userId: {$lt: 0}}).should.be.eql(false);
      });

      it("check(row, {prop: {$le: value}}) : true", function() {
        filter.check(row, {userId: {$le: 1}}).should.be.eql(true);
      });

      it("check(row, {prop, {$le: value}}) : false", function() {
        filter.check(row, {userId: {$le: 0}}).should.be.eql(false);
      });

      it("check(row, {prop, {$gt: value}}) : true", function() {
        filter.check(row, {userId: {$gt: 0}}).should.be.eql(true);
      });

      it("check(row, {prop: {$gt: value}}) : false", function() {
        filter.check(row, {userId: {$gt: 2}}).should.be.eql(false);
      });

      it("check(row, {prop: {$ge: value}}) : true", function() {
        filter.check(row, {userId: {$ge: 1}}).should.be.eql(true);
      });

      it("check(row, {prop: {$ge: value}}) : false", function() {
        filter.check(row, {userId: {$ge: 2}}).should.be.eql(false);
      });

      it("check(row, {prop: {$in: value}}) : true", function() {
        filter.check(row, {userId: {$in: [0, 1, 2]}}).should.be.eql(true);
      });

      it("check(row, {prop: {$in: value}}) : false", function() {
        filter.check(row, {userId: {$in: [0, 2]}}).should.be.eql(false);
      });

      it("check(row, {prop: {$like: value}}) : true", function() {
        filter.check(row, {username: {$like: "us*"}}).should.be.eql(true);
      });

      it("check(row, {prop: {$like: value}}) : false", function() {
        filter.check(row, {username: {$like: "US*"}}).should.be.eql(false);
      });
    });

    describe("Compound w/ one property", function() {
      it("check(row, {prop: {$gt: value, $lt: value}) : true", function() {
        filter.check(row, {userId: {$gt: 0, $lt: 100}}).should.be.eql(true);
      });

      it("check(row, {prop, {$gt: value, $lt: value}}) : false", function() {
        filter.check(row, {userId: {$gt: 2, $lt: 100}}).should.be.eql(false);
      });
    });

    describe("Compound w/ two properties", function() {
      describe("value and value", function() {
        it("check(row, {prop1: value, prop2, value}) : true and true", function() {
          filter.check(row, {userId: 1, username: "user01"}).should.be.eql(true);
        });

        it("check(row, {prop1: value, prop2: value}) : true and false", function() {
          filter.check(row, {userId: 1, username: "USER01"}).should.be.eql(false);
        });

        it("check(row, {prop1: value, prop2: value}) : false and false", function() {
          filter.check(row, {userId: 2, username: "USER01"}).should.be.eql(false);
        });

        it("check(row, {prop1: value, prop2: value}) : false and true", function() {
          filter.check(row, {userId: 2, username: "user01"}).should.be.eql(false);
        });
      });

      describe("value and filter", function() {
        it("check(row, {prop1: value, prop2: filter} : true and true", function() {
          filter.check(row, {userId: 1, username: {$in: ["user01", "user02"]}}).should.be.eql(true);
        });

        it("check(row, {prop1: value, prop2: filter} : true and false", function() {
          filter.check(row, {userId: 1, username: {$notIn: ["user01", "user02"]}}).should.be.eql(false);
        });

        it("check(row, {prop1: value, prop2: filter} : false and false", function() {
          filter.check(row, {userId: 2, username: {$notIn: ["user01", "user02"]}}).should.be.eql(false);
        });

        it("check(row, {prop1: value, prop2: filter} : false and true", function() {
          filter.check(row, {userId: 2, username: {$In: ["user01", "user02"]}}).should.be.eql(false);
        });
      });

      describe("filter and value", function() {
        it("check(row, {prop1: filter, prop2: value}) : true and true", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 100}, username: "user01"}).should.be.eql(true);
        });

        it("check(row, {prop1: filter, prop2: value}) : true and false", function() {
          filter.check(row, {userId: {$gt: 2, $lt: 100}, username: "user01"}).should.be.eql(false);
        });

        it("check(row, {prop1: filter, prop2: value}) : false and false", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 1}, username: "USER01"}).should.be.eql(false);
        });

        it("check(row, {prop1: filter, prop2: value}) : false and true", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 1}, username: "user01"}).should.be.eql(false);
        });
      });

      describe("filter and filter", function() {
        it("check(row, {prop1: filter, prop2: filter}) : true and true", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 100}, username: {$in: ["user01", "user02"]}}).should.be.eql(true);
        });

        it("check(row, {prop1: filter, prop2: filter}) : true and false", function() {
          filter.check(row, {userId: {$gt: 2, $lt: 100}, username: {$notIn: ["user01", "user02"]}}).should.be.eql(false);
        });

        it("check(row, {prop1: filter, prop2: filter}) : false and false", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 1}, username: {$notIn: ["user01", "user02]"]}}).should.be.eql(false);
        });

        it("check(row, {prop1: filter, prop2: filter}) : false and true", function() {
          filter.check(row, {userId: {$gt: 0, $lt: 1}, username: {$in: ["user01", "user02"]}}).should.be.eql(false);
        });
      });
    });
  });

  describe("#find()", function() {
    var result = new IndexedDBResult(rows);

    it("find(result)", function() {
      filter.find(result).should.be.eql(rows);
    });

    it("find(result, {})", function() {
      filter.find(result, {}).should.be.eql(rows);
    });

    it("find(result, {prop: val})", function() {
      filter.find(result, {userId: 1}).should.be.eql([rows[0]]);
    });

    it("find(result, {prop: {$like: val}}", function() {
      filter.find(result, {username: {$like: "user*"}}).should.be.eql([rows[0], rows[1], rows[2]]);
    });
  });
});