describe("Updater", function() {
  var updater = new Updater();
  var records;

  beforeEach(function() {
    records = [
      {userId: 1, username: "user01", password: "pwd01"},
      {userId: 2, username: "user02", password: "pwd02"},
      {userId: 3, username: "user03", password: "pwd03"}
    ];
  });

  describe("Error handling", function() {
    it("update(records, {prop: {$unknown: value}}", function() {
      (function() {
        updater.update(records, {prop: {$unknown: 1}});
      }).should.throwError("Invalid update modifier: '$unknown'.");
    });
  });

  describe("Nothing", function() {
    it("update(records, {})", function() {
      updater.update(records, {});
      records.should.be.eql([
        {userId: 1, username: "user01", password: "pwd01"},
        {userId: 2, username: "user02", password: "pwd02"},
        {userId: 3, username: "user03", password: "pwd03"}
      ]);
    });
  });

  describe("Simple update", function() {
    it("update(records, {prop: value})", function() {
      updater.update(records, {password: "PWD"});
      records.should.be.eql([
        {userId: 1, username: "user01", password: "PWD"},
        {userId: 2, username: "user02", password: "PWD"},
        {userId: 3, username: "user03", password: "PWD"}
      ]);
    });

    it("update(records, {prop: obj})", function() {
      updater.update(records, {password: {plain: "PWD"}});
      records.should.be.eql([
        {userId: 1, username: "user01", password: {plain: "PWD"}},
        {userId: 2, username: "user02", password: {plain: "PWD"}},
        {userId: 3, username: "user03", password: {plain: "PWD"}}
      ]);
    });

    it("update(records, {prop: {$set: value}})", function() {
      updater.update(records, {password: {$set: "PWD"}});
      records.should.be.eql([
        {userId: 1, username: "user01", password: "PWD"},
        {userId: 2, username: "user02", password: "PWD"},
        {userId: 3, username: "user03", password: "PWD"}
      ]);
    });

    it("update(records, {prop: {$inc: value}})", function() {
      updater.update(records, {userId: {$inc: 10}});
      records.should.be.eql([
        {userId: 11, username: "user01", password: "pwd01"},
        {userId: 12, username: "user02", password: "pwd02"},
        {userId: 13, username: "user03", password: "pwd03"}
      ]);
    });

    it("update(records, {prop: {$dec: value})", function() {
      updater.update(records, {userId: {$dec: 10}});
      records.should.be.eql([
        {userId: -9, username: "user01", password: "pwd01"},
        {userId: -8, username: "user02", password: "pwd02"},
        {userId: -7, username: "user03", password: "pwd03"}
      ]);
    });

    it("update(records, {prop: {$mul: value})", function() {
      updater.update(records, {userId: {$mul: 10}});
      records.should.be.eql([
        {userId: 10, username: "user01", password: "pwd01"},
        {userId: 20, username: "user02", password: "pwd02"},
        {userId: 30, username: "user03", password: "pwd03"}
      ]);
    });
  });

  describe("Compound update", function() {
    it("update(records, {prop1: value, prop2: value})", function() {
      updater.update(records, {userId: {$inc: 10}, password: "PWD"});
      records.should.be.eql([
        {userId: 11, username: "user01", password: "PWD"},
        {userId: 12, username: "user02", password: "PWD"},
        {userId: 13, username: "user03", password: "PWD"}
      ]);
    });
  });
});