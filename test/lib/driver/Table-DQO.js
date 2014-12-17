describe("Table - DQO", function() {
  var drv = odba.Driver.getDriver("IndexedDB");
  var cx = drv.createConnection({database: "odba"});
  var Result = odba.Result;
  var db, user, session;

  var users = [
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"},
    {userId: 3, username: "user03", password: "pwd03"}
  ];

  var sessions = [
    {sessionId: 1, userId: 1, timestamp: new Date(2014, 12, 10)},
    {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
    {sessionId: 3, userId: 1, timestamp: new Date(2014, 12, 11)},
    {sessionId: 4, userId: 1, timestamp: new Date(2014, 12, 12)},
    {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
  ];

  var leftJoin = [
    {userId: 1, username: "user01", password: "pwd01", sessions: [
      {sessionId: 1, userId: 1, timestamp: new Date(2014, 12, 10)},
      {sessionId: 3, userId: 1, timestamp: new Date(2014, 12, 11)},
      {sessionId: 4, userId: 1, timestamp: new Date(2014, 12, 12)}
    ]},
    {userId: 2, username: "user02", password: "pwd02", sessions: [
      {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
      {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
    ]},
    {userId: 3, username: "user03", password: "pwd03", sessions: [
    ]}
  ];

  before(function(done) {
    cx.createDatabase(indexedSchema, done);
  });

  before(function(done) {
    cx.open(function(error, database) {
      db = database;
      done();
    });
  });

  before(function(done) {
    db.findTable("user", function(error, table) {
      user = table;
      user.insert(users, done);
    });
  });

  before(function(done) {
    db.findTable("session", function(error, table) {
      session = table;
      session.insert(sessions, done);
    });
  });

  after(function(done) {
    cx.close(done);
  });

  after(function(done) {
    cx.dropDatabase(done);
  });

  describe("#findAll()", function() {
    describe("Error handling", function() {
      it("findAll()", function() {
        (function() {
          user.findAll();
        }).should.throwError("Callback expected.");
      });
    });

    it("findAll(callback)", function(done) {
      user.findAll(function(error, result) {
        should.assert(error === undefined);
        result.should.be.instanceOf(Result);
        result.length.should.be.eql(3);
        done();
      });
    });
  });

  describe("#find()", function() {
    describe("Error handling", function() {
      it("find()", function() {
        (function() {
          user.find();
        }).should.throwError("Callback expected.");
      });

      it("find(where)", function() {
        (function() {
          user.find({});
        }).should.throwError("Callback expected.");
      });
    });

    describe("Find all", function() {
      it("find(callback)", function(done) {
        user.find(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(users);
          done();
        });
      });

      it("find({}, callback)", function(done) {
        user.find({}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.length.should.be.eql(3);
          done();
        });
      });

      it("find(undefined, callback)", function(done) {
        user.find(undefined, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.length.should.be.eql(3);
          done();
        });
      });
    });

    describe("By key", function() {
      it("find({key: value}, callback)", function(done) {
        user.find({userId: 1}, function(error, result) {
          should.assert(error === undefined);
          result.rows.should.be.eql([users[0]]);
          result.byKey.should.be.eql(true);
          result.byIndex.should.be.eql(false);
          done();
        });
      });
    });

    describe("By index", function() {
      it("find({ixField: value}, callback)", function(done) {
        user.find({username: "user01"}, function(error, result) {
          should.assert(error === undefined);
          result.rows.should.be.eql([users[0]]);
          result.byKey.should.be.eql(false);
          result.byIndex.should.be.eql(true);
          done();
        });
      });
    });
  });

  describe("#findOne()", function() {
    describe("Error handling", function() {
      it("findOne()", function() {
        (function() {
          user.findOne();
        }).should.throwError("Callback expected.");
      });

      it("findOne(where)", function() {
        (function() {
          user.findOne({});
        }).should.throwError("Callback expected.");
      });
    });

    it("findOne(callback)", function(done) {
      user.findOne(function(error, record) {
        should.assert(error === undefined);
        record.should.not.be.instanceOf(Result);
        record.should.be.eql(users[0]);
        done();
      });
    });

    it("findOne({}, callback)", function(done) {
      user.findOne({}, function(error, record) {
        should.assert(error === undefined);
        record.should.not.be.instanceOf(Result);
        record.should.have.properties("userId", "username", "password");
        done();
      });
    });

    it("findOne(where, callback)", function(done) {
      user.findOne({userId: 2}, function(error, record) {
        should.assert(error === undefined);
        record.should.not.be.instanceOf(Result);
        record.should.be.eql(users[1]);
        done();
      });
    });

    it("findOne(where, callback) - No rows matched", function(done) {
      user.findOne({userId: 111}, function(error, record) {
        should.assert(error === undefined);
        should.assert(record === undefined);
        done();
      });
    });
  });

  describe("#count()", function() {
    describe("Error handling", function() {
      it("count()", function() {
        (function() {
          user.count();
        }).should.throwError("Callback expected.");
      });
    });

    it("count(callback)", function(done) {
      user.count(function(error, count) {
        should.assert(error === undefined);
        count.should.be.eql(3);
        done();
      });
    });
  });

  describe("#join()", function() {
    describe("Error handling", function() {
      it("join()", function() {
        (function() {
          user.join();
        }).should.throwError("Target table and join column expected.");
      });

      it("join(table)", function() {
        (function() {
          user.join("session");
        }).should.throwError("Target table and join column expected.");
      });
    });

    it("join(table, col)", function() {
      var q = user.join("session", "userId");

      q.should.be.eql(q);
      q.targetTable.should.be.eql("session");
      q.sourceColumn.should.be.eql("userId");
      q.targetColumn.should.be.eql("userId");
    });

    it("join(table, col1, col2)", function() {
      var q = user.join("session", "userId", "user");

      q.should.be.eql(q);
      q.targetTable.should.be.eql("session");
      q.sourceColumn.should.be.eql("userId");
      q.targetColumn.should.be.eql("user");
    });

    it("join(table, col, callback)", function(done) {
      user.join("session", "userId", function(error, result) {
        should.assert(error === undefined);
        result.should.be.instanceOf(Result);
        result.rows.should.be.eql(leftJoin);
        done();
      });
    });
  });
});