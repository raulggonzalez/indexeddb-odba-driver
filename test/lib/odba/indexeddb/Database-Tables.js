describe("odba.indexeddb.IndexedDBDatabase (Tables)", function() {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var drv;

  before(function() {
    drv = odba.Driver.getDriver("IndexedDB");
  });

  describe("Query", function() {
    var cx, db;

    before(function() {
      cx = drv.createConnection({database: "odba"});
    });

    before(function(done) {
      cx.server.createDatabase("odba", schema, done);
    });

    before(function(done) {
      cx.open(function(error) {
        db = cx.database;
        done();
      });
    });

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    describe("#findTable()", function() {
      it("findTable()", function() {
        (function() { db.findTable(); }).should.throwError("Table name and callback expected.");
      });

      it("findTable(table)", function() {
        (function() { db.findTable("user"); }).should.throwError("Table name and callback expected.");
      });

      it("findTable(table, callback)", function(done) {
        db.findTable("user", function(error, tab) {
          should.assert(error === undefined);
          tab.database.should.be.eql(db);
          tab.should.be.instanceOf(IndexedDBTable);
          tab.name.should.be.eql("user");
          tab.keyPath.should.be.eql("userId");
          done();
        });
      });

      it("findTable('Unknown', callback)", function(done) {
        db.findTable("Unknown", function(error, tab) {
          should.assert(error === undefined);
          should.assert(tab === undefined);
          done();
        });
      });
    });

    describe("#hasTable()", function() {
      it("hasTable()", function() {
        (function() {
          db.hasTable();
        }).should.throwError("Table name and callback expected.");
      });

      it("hasTable(table)", function() {
        (function() {
          db.hasTable("user");
        }).should.throwError("Table name and callback expected.");
      });

      it("hasTable(table, callback)", function(done) {
        db.hasTable("user", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(true);
          done();
        });
      });

      it("hasTable('Unknown', callback)", function(done) {
        db.hasTable("Unknown", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });
    });

    describe("#hasTables()", function() {
      it("hasTables()", function() {
        (function() {
          db.hasTables();
        }).should.throwError("Table names and callback expected.");
      });

      it("hasTables(tables)", function() {
        (function() {
          db.hasTables(["user", "session"]);
        }).should.throwError("Table names and callback expected.");
      });

      it("hasTables([], callback)", function(done) {
        db.hasTables([], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(false);
          done();
        });
      });

      it("hasTables([e], callback)", function(done) {
        db.hasTables(["user"], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(true);
          done();
        });
      });

      it("hasTables([u], callback)", function(done) {
        db.hasTables(["unknown"], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(false);
          done();
        });
      });

      it("hasTables([e, u], callback)", function(done) {
        db.hasTables(["user", "unknown"], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(false);
          done();
        });
      });

      it("hasTables([e, e], callback)", function(done) {
        db.hasTables(["user", "session"], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(true);
          done();
        });
      });

      it("hasTables([u, e], callback)", function(done) {
        db.hasTables(["unknown", "user"], function(error, exist) {
          should.assert(error === undefined);
          exist.should.be.eql(false);
          done();
        });
      });

      it("hasTables([u, u], callback)", function(done) {
        db.hasTables(["unknown", "unknown"], function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });
    });
  });

  describe("#dropTable()", function() {
    var cx, auxCx;

    beforeEach(function() {
      cx = drv.createConnection({database: "odba"});
      auxCx = cx.clone();
    });

    beforeEach(function(done) {
      cx.server.createDatabase("odba", schema, done);
    });

    afterEach(function(done) {
      auxCx.close(done);
    });

    afterEach(function(done) {
      cx.close(done);
    });

    afterEach(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    it("dropTable(name)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropTable("user");
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          should.assert(error === undefined);
          db.containsObjectStore("user").should.be.eql(false);
          done();
        });
      });
    });

    it("dropTable('unknown')", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropTable("unknown");
      }, done);
    });

    it("dropTable(name, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropTable("session", function(error) {
          should.assert(error === undefined);
          auxCx.open(function(error, db) {
            db.containsObjectStore("session").should.be.eql(false);
            done();
          });
        });
      });
    });

    it("dropTable('unknown', callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropTable("unknown", done);
      });
    });

    it("dropTable(...) - Out of version change transaction", function(done) {
      auxCx.open(function(error, db) {
        db.dropTable("user", function(error) {
          error.message.should.be.eql("Database.dropTable() only into Server.alterDatabase().");
          done();
        });
      });
    });
  });

  describe("#createTable()", function() {
    var cx, auxCx;

    beforeEach(function() {
      cx = drv.createConnection({database: "odba"});
      auxCx = cx.clone();
    });

    beforeEach(function(done) {
      cx.server.createDatabase("odba", schema, done);
    });

    afterEach(function(done) {
      auxCx.close(done);
    });

    afterEach(function(done) {
      cx.close(done);
    });

    afterEach(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    it("createTable(name)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("table");
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.findTable("table", function(error, tab) {
            should.assert(error === undefined);
            tab.name.should.be.eql("table");
            should.assert(tab.keyPath === null);
            tab.autoIncrement.should.be.eql(false);
            done();
          });
        });
      });
    });

    it("createTable(name, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("table", function(error) {
          should.assert(error === undefined);
        });
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.findTable("table", function(error, tab) {
            should.assert(error === undefined);
            tab.name.should.be.eql("table");
            should.assert(tab.keyPath === null);
            tab.autoIncrement.should.be.eql(false);
            done();
          });
        });
      });
    });

    it("createTable(name, options)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("table", {keyPath: "id", autoIncrement: true});
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.findTable("table", function(error, tab) {
            should.assert(error === undefined);
            tab.name.should.be.eql("table");
            tab.keyPath.should.be.eql("id");
            tab.autoIncrement.should.be.eql(true);
            done();
          });
        });
      });
    });

    it("createTable(name, options, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("table", {keyPath: "id"}, function(error) {
          should.assert(error === undefined);
        });
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.findTable("table", function(error, tab) {
            should.assert(error === undefined);
            tab.name.should.be.eql("table");
            tab.keyPath.should.be.eql("id");
            tab.autoIncrement.should.be.eql(false);
            done();
          });
        });
      });
    });

    it("createTable(...) - Out of version change transaction", function(done) {
      auxCx.open(function(error, db) {
        db.createTable("table", function(error) {
          error.message.should.be.eql("Database.createTable() only into Server.createDatabase() or Server.alterDatabase().");
          done();
        });
      });
    });

    it("createTable('existing')", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("user");
      }, done);
    });

    it("createTable('existing', callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTable("user", function(error) {
          error.message.should.be.eql("Object store 'user' already exists.");
          done();
        });
      });
    });
  });

  describe("#createTables()", function() {
    var cx, auxCx, TABLES = [
      {name: "table1", keyPath: "id"},
      {name: "table2", keyPath: "id"}
    ];

    beforeEach(function() {
      cx = drv.createConnection({database: "odba"});
      auxCx = cx.clone();
    });

    beforeEach(function(done) {
      cx.server.createDatabase("odba", undefined, done);
    });

    afterEach(function(done) {
      auxCx.close(done);
    });

    afterEach(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    it("createTables(tables)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTables(TABLES);
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.containsObjectStores(["table1", "table2"]).should.be.eql(true);
          done();
        });
      });
    });

    it("createTables(tables, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createTables(TABLES, function(error) {
          should.assert(error === undefined);
        });
      }, function(error) {
        should.assert(error === undefined);

        auxCx.open(function(error, db) {
          db.containsObjectStores(["table1", "table2"]).should.be.eql(true);
          done();
        });
      });
    });

    it("createTables(...) - Out of version change transaction", function(done) {
      auxCx.open(function(error, db) {
        should.assert(error === undefined);

        db.createTables(TABLES, function(error) {
          error.message.should.be.eql("Database.createTables() only into Server.createDatabase() or Server.alterDatabase().");
          done();
        });
      });
    });
  });
});