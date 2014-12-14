describe("QueryEngine", function() {
  var drv = Driver.getDriver("IndexedDB");
  var cx = drv.createConnection({database: "odba"});
  var engine = new QueryEngine();
  var records = [
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"},
    {userId: 3, username: "user03", password: "pwd03"}
  ];
  var user, query;

  before(function(done) {
    cx.createDatabase(indexedSchema, done);
  });

  before(function(done) {
    cx.open(function(error, db) {
      db.findTable("user", function(error, tab) {
        user = tab;
        done();
      });
    });
  });

  before(function(done) {
    user.insert(records, done);
  });

  beforeEach(function() {
    query = new IndexedDBQuery(user);
  });

  after(function(done) {
    cx.close(done);
  });

  after(function(done) {
    cx.dropDatabase(done);
  });

  describe("#findAll()", function() {
    it("findAll(query({}), callback)", function(done) {
      engine.findAll(query, function(error, result) {
        should.assert(error === undefined);
        result.should.be.instanceOf(Result);
        result.rows.should.be.eql(records);
        done();
      });
    });
  });

  describe("#findByFilter()", function() {
    it("findByFilter(query({}), callback)", function(done) {
      engine.findByFilter(query, function(error, result) {
        should.assert(error === undefined);
        result.rows.should.be.eql(records);
        done();
      });
    });

    it("findByFilter(query({prop: value}), callback)", function(done) {
      query.filter = {userId: 1};

      engine.findByFilter(query, function(error, result) {
        should.assert(error === undefined);
        result.rows.should.be.eql([records[0]]);
        done();
      });
    });

    it("findByFilter(query({prop: {$ne: value}}), callback)", function(done) {
      query.filter = {userId: {$ne: 1}};

      engine.findByFilter(query, function(error, result) {
        should.assert(error === undefined);
        result.rows.should.be.eql([records[1], records[2]]);
        done();
      });
    });
  });

  describe("#findByKeyPath()", function() {
    it("findByKeyPath(query({prop: value}), callback)", function(done) {
      query.filter = {userId: 1};

      engine.findByKeyPath(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(true);
        result.byIndex.should.be.eql(false);
        result.rows.should.be.eql([records[0]]);
        done();
      });
    });

    it("findByKeyPath(query({prop: {$lt: value}}), callback)", function(done) {
      query.filter = {userId: {$lt: 3}};

      engine.findByKeyPath(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(true);
        result.byIndex.should.be.eql(false);
        result.rows.should.be.eql([records[0], records[1]]);
        done();
      });
    });

    it("findByKeyPath(query({prop: {$le: value}}), callback)", function(done) {
      query.filter = {userId: {$le: 2}};

      engine.findByKeyPath(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(true);
        result.byIndex.should.be.eql(false);
        result.rows.should.be.eql([records[0], records[1]]);
        done();
      });
    });

    it("findByKeyPath(query({prop: {$gt: value}}), callback)", function(done) {
      query.filter = {userId: {$gt: 1}};

      engine.findByKeyPath(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(true);
        result.byIndex.should.be.eql(false);
        result.rows.should.be.eql([records[1], records[2]]);
        done();
      });
    });

    it("findByKeyPath(query({prop: {$ge: value}}), callback)", function(done) {
      query.filter = {userId: {$ge: 2}};

      engine.findByKeyPath(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(true);
        result.byIndex.should.be.eql(false);
        result.rows.should.be.eql([records[1], records[2]]);
        done();
      });
    });
  });

  describe("#findByIndex()", function() {
    it("findByIndex(query({prop: value}), callback)", function(done) {
      query.filter = {username: "user01"};

      engine.findByIndex(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(false);
        result.byIndex.should.be.eql(true);
        result.rows.should.be.eql([records[0]]);
        done();
      });
    });

    it("findByIndex(query({prop: {$lt: value}}), callback)", function(done) {
      query.filter = {username: {$lt: "user03"}};

      engine.findByIndex(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(false);
        result.byIndex.should.be.eql(true);
        result.rows.should.be.eql([records[0], records[1]]);
        done();
      });
    });

    it("findByIndex(query({prop: {$le: value}}), callback)", function(done) {
      query.filter = {username: {$le: "user02"}};

      engine.findByIndex(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(false);
        result.byIndex.should.be.eql(true);
        result.rows.should.be.eql([records[0], records[1]]);
        done();
      });
    });

    it("findByIndex(query({prop: {$gt: value}}), callback)", function(done) {
      query.filter = {username: {$gt: "user01"}};

      engine.findByIndex(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(false);
        result.byIndex.should.be.eql(true);
        result.rows.should.be.eql([records[1], records[2]]);
        done();
      });
    });

    it("findByIndex(query({prop: {$ge: value}}), callback)", function(done) {
      query.filter = {username: {$ge: "user02"}};

      engine.findByIndex(query, function(error, result) {
        should.assert(error === undefined);
        result.byKey.should.be.eql(false);
        result.byIndex.should.be.eql(true);
        result.rows.should.be.eql([records[1], records[2]]);
        done();
      });
    });
  });

  describe("#find()", function() {
    describe("Find all", function() {
      it("find(query({}), callback)", function(done) {
        engine.find(query, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(records);
          done();
        });
      });
    });

    describe("By key", function() {
      it("find(query({key: value}), callback)", function(done) {
        query.filter = {userId: 1};

        engine.find(query, function(error, result) {
          should.assert(error === undefined);
          result.rows.should.be.eql([records[0]]);
          result.byKey.should.be.eql(true);
          result.byIndex.should.be.eql(false);
          done();
        });
      });
    });

    describe("By index", function() {
      it("find(query({ixField: value}), callback)", function(done) {
        query.filter = {username: "user01"};

        engine.find(query, function(error, result) {
          should.assert(error === undefined);
          result.rows.should.be.eql([records[0]]);
          result.byKey.should.be.eql(false);
          result.byIndex.should.be.eql(true);
          done();
        });
      });
    });
  });
});