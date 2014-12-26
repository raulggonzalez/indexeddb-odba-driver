describe("vdba.indexeddb.IndexedDBQuery", function() {
  var IndexedDBQuery = vdba.indexeddb.IndexedDBQuery;
  var Result = vdba.Result;
  var IndexedDBResult = vdba.indexeddb.IndexedDBResult;

  function User() {}

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

  var drv, cx, db, user, session;

  before(function() {
    drv = vdba.Driver.getDriver("IndexedDB");
    cx = drv.createConnection({database: "vdba"});
  });

  before(function(done) {
    cx.server.createDatabase("vdba", indexedSchema, done);
  });

  before(function(done) {
    cx.open(function(error, database) {
      db = database;

      db.findTable("user", function(error, tab) {
        user = tab;
        done();
      });
    });
  });

  before(function(done) {
    db.findTable("session", function(error, tab) {
      session = tab;
      done();
    });
  });

  before(function(done) {
    user.insert(users, done);
  });

  before(function(done) {
    session.insert(sessions, done);
  });

  after(function(done) {
    cx.close(done);
  });

  after(function(done) {
    cx.server.dropDatabase("vdba", done);
  });

  describe("Simple query", function() {
    var query;

    beforeEach(function() {
      query = new IndexedDBQuery(user);
    });

    describe("#isSimpleQuery()", function() {
      it("isSimpleQuery()", function() {
        query.isSimpleQuery().should.be.eql(true);
      });
    });

    describe("#isCompoundQuery()", function() {
      it("isCompoundQuery()", function() {
        query.isCompoundQuery().should.be.eql(false);
      });
    });

    describe("#findAll()", function() {
      describe("Error handling", function() {
        it("findAll()", function() {
          (function() {
            query.findAll();
          }).should.throwError("Callback expected.");
        });
      });

      it("findAll(callback)", function(done) {
        query.findAll(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(users);
          done();
        });
      });
    });

    describe("#mapAll()", function() {
      it("mapAll(map, callback)", function(done) {
        query.mapAll({clss: User}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(IndexedDBResult);
          result.length.should.be.eql(3);

          for (var i = 0; i < result.length; ++i) {
            var row  = result.rows[i];
            row.should.be.instanceOf(User);
            row.should.have.properties(users[i]);
          }

          done();
        });
      });
    });

    describe("#findOne()", function() {
      describe("Error handling", function() {
        it("findOne()", function() {
          (function() {
            query.findOne();
          }).should.throwError("Callback expected.");
        });

        it("findOne(filter)", function() {
          (function() {
            query.findOne({});
          }).should.throwError("Callback expected.");
        });
      });

      it("findOne(callback)", function(done) {
        query.findOne(function(error, record) {
          should.assert(error === undefined);
          record.should.not.be.instanceOf(Result);
          record.should.be.eql(users[0]);
          done();
        });
      });

      it("findOne(filter, callback)", function(done) {
        query.findOne({userId: 2}, function(error, record) {
          should.assert(error === undefined);
          record.should.not.be.instanceOf(Result);
          record.should.be.eql(users[1]);
          done();
        });
      });

      it("findOne(filter, callback) - No rows matched", function(done) {
        query.findOne({userId: 111}, function(error, record) {
          should.assert(error === undefined);
          should.assert(record === undefined);
          done();
        });
      });
    });

    describe("#mapOne()", function() {
      it("mapOne(map, callback)", function(done) {
        query.mapOne({clss: User}, function(error, record) {
          should.assert(error === undefined);
          record.should.be.instanceOf(User);
          record.should.have.properties(users[0]);
          done();
        });
      });

      it("mapOne(map, filter, callback) - No rows matched", function(done) {
        query.mapOne({clss: User}, {userId: 123}, function(error, record) {
          should.assert(error === undefined);
          should.assert(record === undefined);
          done();
        });
      });
    });

    describe("#find()", function() {
      describe("Error handling", function() {
        it("find()", function() {
          (function() {
            query.find();
          }).should.throwError("Callback expected.");
        });

        it("find(filter)", function() {
          (function() {
            query.find({});
          }).should.throwError("Callback expected.");
        });
      });

      it("find(callback)", function(done) {
        query.find(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(users);
          done();
        });
      });

      it("find(filter, callback)", function(done) {
        query.find({userId: 2}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql([users[1]]);
          done();
        });
      });

      it("find(filter, callback) - No rows matched", function(done) {
        query.find({userId: 111}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql([]);
          done();
        });
      });
    });

    describe("#map()", function() {
      it("map(map, callback)", function(done) {
        query.map({clss: User}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(IndexedDBResult);
          result.length.should.be.eql(3);

          for (var i = 0; i < result.length; ++i) {
            var row = result.rows[i];
            row.should.be.instanceOf(User);
            row.should.have.properties(users[i]);
          }

          done();
        });
      });
    });
  });

  describe("Compound query", function() {
    var query;

    beforeEach(function() {
      query = new IndexedDBQuery(user);
      query.join("session", "userId");
    });

    describe("#isSimpleQuery()", function() {
      it("isSimpleQuery()", function() {
        query.isSimpleQuery().should.be.eql(false);
      });
    });

    describe("#isCompoundQuery()", function() {
      it("isCompoundQuery()", function() {
        query.isCompoundQuery().should.be.eql(true);
      });
    });

    describe("#join()", function() {
      describe("Error handling", function() {
        it("join()", function() {
          (function() {
            query.join();
          }).should.throwError("Target table and join column expected.");
        });

        it("join(table)", function() {
          (function() {
            query.join("session");
          }).should.throwError("Target table and join column expected.");
        });
      });

      it("join(table, col)", function() {
        var q = query.join("session", "userId");

        q.should.be.eql(q);
        q.targetTable.should.be.eql("session");
        q.sourceColumn.should.be.eql("userId");
        q.targetColumn.should.be.eql("userId");
      });

      it("join(table, col1, col2)", function() {
        var q = query.join("session", "userId", "user");

        q.should.be.eql(q);
        q.targetTable.should.be.eql("session");
        q.sourceColumn.should.be.eql("userId");
        q.targetColumn.should.be.eql("user");
      });

      it("join(table, col, callback)", function(done) {
        query.join("session", "userId", function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(leftJoin);
          done();
        });
      });
    });

    describe("#findAll()", function() {
      describe("Error handling", function() {
        it("findAll()", function() {
          (function() {
            query.findAll();
          }).should.throwError("Callback expected.");
        });
      });

      it("findAll(callback)", function(done) {
        query.findAll(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(leftJoin);
          done();
        });
      });
    });

    describe("#find()", function() {
      describe("Error handling", function() {
        it("find()", function() {
          (function() {
            query.find();
          }).should.throwError("Callback expected.");
        });

        it("find(filter)", function() {
          (function() {
            query.find({userId: 1});
          }).should.throwError("Callback expected.");
        });
      });

      it("find(callback)", function(done) {
        query.find(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql(leftJoin);
          done();
        });
      });

      it("find(filter, callback) - No source rows", function(done) {
        query.find({userId: 111}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql([]);
          done();
        });
      });

      it("find(filter, callback) - With target rows", function(done) {
        query.find({userId: 2}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql([
            {userId: 2, username: "user02", password: "pwd02", sessions: [
              {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
              {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
            ]}
          ]);

          done();
        });
      });

      it("find(filter, callback) - No target rows", function(done) {
        query.find({userId: 3}, function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(Result);
          result.rows.should.be.eql([{userId: 3, username: "user03", password: "pwd03", sessions: []}]);
          done();
        });
      });
    });

    describe("#findOne()", function() {
      describe("Error handling", function() {
        it("findOne()", function() {
          (function() {
            query.findOne();
          }).should.throwError("Callback expected.");
        });

        it("findOne(filter)", function() {
          (function() {
            query.findOne({userId: 1});
          }).should.throwError("Callback expected.");
        });
      });

      it("findOne(callback)", function(done) {
        query.findOne(function(error, record) {
          should.assert(error === undefined);
          record.should.be.eql({
            userId: 1,
            username: "user01",
            password: "pwd01",
            sessions: [
              {sessionId: 1, userId: 1, timestamp: new Date(2014, 12, 10)},
              {sessionId: 3, userId: 1, timestamp: new Date(2014, 12, 11)},
              {sessionId: 4, userId: 1, timestamp: new Date(2014, 12, 12)}
            ]
          });
          done();
        });
      });

      it("findOne(filter, callback) - No rows", function(done) {
        query.findOne({userId: 111}, function(error, record) {
          should.assert(error === undefined);
          should.assert(record === undefined);
          done();
        });
      });

      it("findOne(filter, callback)", function(done) {
        query.findOne({userId: 2}, function(error, record) {
          should.assert(error === undefined);
          record.should.be.eql({
            userId: 2,
            username: "user02",
            password: "pwd02",
            sessions: [
              {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
              {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
            ]
          });

          done();
        });
      });
    });
  });
});