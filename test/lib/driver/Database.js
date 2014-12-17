describe("Database", function() {
  var IndexedDBConnection = odba.indexeddb.IndexedDBConnection;
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var IndexedDBIndex = odba.indexeddb.IndexedDBIndex;

  var drv = odba.Driver.getDriver("IndexedDB");
  var cx = drv.createConnection({database: "odba"});

  describe("Properties", function() {
    var cx = drv.createConnection({database: "odba"});
    var db;

    before(function(done) {
      cx.createDatabase(undefined, done);
    });

    before(function(done) {
      cx.open(function(error) {
        db = cx.database;
        done();
      });
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    after(function(done) {
      cx.close(done);
    });

    it("name", function() {
      db.name.should.be.eql("odba");
    });

    it("version", function() {
      db.version.should.be.eql(1);
    });

    it("native", function() {
      should.assert(!!db.native);
    });

    it("connection", function() {
      db.connection.should.be.instanceOf(IndexedDBConnection);
    });
  });

  describe("Tables", function() {
    describe("#findTable()", function() {
      var cx = drv.createConnection({database: "odba"});
      var db;

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      before(function(done) {
        cx.open(function(error) {
          db = cx.database;
          done();
        });
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      after(function(done) {
        cx.close(done);
      });

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
      var cx = drv.createConnection({database: "odba"});
      var db;

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      before(function(done) {
        cx.open(function(error) {
          db = cx.database;
          done();
        });
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      after(function(done) {
        cx.close(done);
      });

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
      var cx = drv.createConnection({database: "odba"});
      var db;

      before(function(done) {
        cx.createDatabase(schema, done);
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
        cx.dropDatabase(done);
      });

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

    describe("#dropTable()", function() {
      var cx = drv.createConnection({database: "odba"});
      var auxCx = cx.clone();

      beforeEach(function(done) {
        cx.createDatabase(schema, done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      afterEach(function(done) {
        auxCx.close(done);
      });

      it("dropTable(name)", function(done) {
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
          db.dropTable("unknown");
        }, done);
      });

      it("dropTable(name, callback)", function(done) {
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
          db.dropTable("unknown", done);
        });
      });

      it("dropTable(...) - Out of version change transaction", function(done) {
        auxCx.open(function(error, db) {
          db.dropTable("user", function(error) {
            error.message.should.be.eql("Database.dropTable() only into Connection.alterDatabase().");
            done();
          });
        });
      });
    });

    describe("#createTable()", function() {
      var cx = drv.createConnection({database: "odba"});
      var auxCx = cx.clone();

      beforeEach(function(done) {
        cx.createDatabase(schema, done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      afterEach(function(done) {
        auxCx.close(done);
      });

      it("createTable(name)", function(done) {
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
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
            error.message.should.be.eql("Database.createTable() only into Connection.createDatabase() or Connection.alterDatabase().");
            done();
          });
        });
      });

      it("createTable('existing')", function(done) {
        cx.alterDatabase(function(db) {
          db.createTable("user");
        }, done);
      });

      it("createTable('existing', callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.createTable("user", function(error) {
            error.message.should.be.eql("Object store 'user' already exists.");
            done();
          });
        });
      });
    });

    describe("#createTables()", function() {
      var cx = drv.createConnection({database: "odba"});
      var auxCx = cx.clone();
      var TABLES = [
        {name: "table1", keyPath: "id"},
        {name: "table2", keyPath: "id"}
      ];

      beforeEach(function(done) {
        cx.createDatabase(undefined, done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      afterEach(function(done) {
        auxCx.close(done);
      });

      it("createTables(tables)", function(done) {
        cx.alterDatabase(function(db) {
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
        cx.alterDatabase(function(db) {
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
            error.message.should.be.eql("Database.createTables() only into Connection.createDatabase() or Connection.alterDatabase().");
            done();
          });
        });
      });
    });
  });

  describe("Indexes", function() {
    describe("#findIndex()", function() {
      var cx = drv.createConnection({database: "odba"});
      var db;

      before(function(done) {
        cx.createDatabase(indexedSchema, done);
      });

      before(function(done) {
        cx.open(function(error, database) {
          db = database;
          done();
        });
      });

      after(function(done)  {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("findIndex()", function() {
        (function() {
          db.findIndex();
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("findIndex(table)", function() {
        (function() {
          db.findIndex("user");
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("findIndex(table, index)", function() {
        (function() {
          db.findIndex("user", "ix_username");
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("findIndex(table, index, callback)", function(done) {
        db.findIndex("user", "ix_username", function(error, ix) {
          should.assert(error === undefined);
          ix.should.be.instanceOf(IndexedDBIndex);
          ix.name.should.be.eql("ix_username");
          ix.table.should.be.instanceOf(IndexedDBTable);
          ix.table.name.should.be.eql("user");
          ix.table.keyPath.should.be.eql("userId");
          ix.column.should.be.eql("username");
          ix.unique.should.be.eql(true);
          done();
        });
      });

      it("findIndex('unknown', index, callback)", function(done) {
        db.findIndex("unknown", "ix_username", function(error, ix) {
          should.assert(error === undefined);
          should.assert(ix === undefined);
          done();
        });
      });

      it("findIndex(table, 'unknown', callback)", function(done) {
        db.findIndex("user", "ix_unknown", function(error, ix) {
          should.assert(error === undefined);
          should.assert(ix === undefined);
          done();
        });
      });
    });

    describe("#hasIndex()", function() {
      var cx = drv.createConnection({database: "odba"});
      var chkCx = cx.clone();
      var db;

      before(function(done) {
        cx.createDatabase(indexedSchema, done);
      });

      before(function(done) {
        cx.open(function() {
          db = cx.database;
          done();
        });
      });

      after(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("hasIndex()", function() {
        (function() {
          db.hasIndex();
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("hasIndex(table)", function() {
        (function() {
          db.hasIndex("user");
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("hasIndex(table, ix)", function() {
        (function() {
          db.hasIndex("user", "ix_username");
        }).should.throwError("Table name, index name and callback expected.");
      });

      it("hasIndex(table, ix, callback)", function(done) {
        db.hasIndex("user", "ix_username", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(true);
          done();
        });
      });

      it("hasIndex('unknown', ix, callback)", function(done) {
        db.hasIndex("unknown", "ix_username", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });

      it("hasIndex(table, 'unknown', callback)", function(done) {
        db.hasIndex("user", "ix_unknown", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });
    });

    describe("#createIndex()", function() {
      var cx = drv.createConnection({database: "odba"});
      var auxCx = cx.clone();

      beforeEach(function(done) {
        cx.createDatabase(schema, done);
      });

      afterEach(function(done) {
        auxCx.close(done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("createIndex()", function(done) {
        cx.alterDatabase(function(db) {
          (function() {
            db.createIndex();
          }).should.throwError("Table name, index name and indexing column name expected.");
        }, done);
      });

      it("createIndex(table)", function(done) {
        cx.alterDatabase(function(db) {
          (function() {
            db.createIndex("user");
          }).should.throwError("Table name, index name and indexing column name expected.");
        }, done);
      });

      it("createIndex(table, ix)", function(done) {
        cx.alterDatabase(function(db) {
          (function() {
            db.createIndex("user", "ix_username");
          }).should.throwError("Table name, index name and indexing column name expected.");
        }, done);
      });

      it("createIndex(table, ix, col)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex("user", "ix_username", "username");
        }, function(error) {
          should.assert(error === undefined);

          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              done();
            });
          });
        });
      });

      it("createIndex('unknown', ix, col)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex("unknown", "ix_username", "username", function(error) {
            error.message.should.be.eql("Object store 'unknown' doesn't exist.");
            done();
          });
        });
      });

      it("createIndex(table, ix, col, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex("user", "ix_username", "username", function(error) {
            should.assert(error === undefined);
          });
        }, function(error) {
          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              done();
            });
          });
        });
      });

      it("createIndex(table, ix, col, options)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex("user", "ix_username", "username", {unique: true});
        }, function(error) {
          should.assert(error === undefined);
          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              done();
            });
          });
        });
      });

      it("createIndex(table, ix, col, options, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex("user", "ix_username", "username", {unique: true}, function(error) {
            should.assert(error === undefined);
          });
        }, function(error) {
          should.assert(error === undefined);
          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              done();
            });
          });
        });
      });

      it("createIndex(...) - Out of version change transaction", function(done) {
        auxCx.open(function(error, db) {
          db.createIndex("user", "ix_username", "username", function(error) {
            error.message.should.be.eql("Database.createIndex() only into Connection.createDatabase() or Connection.alterDatabase().");
            done();
          });
        });
      });

      it("createIndex(table, 'existing', col, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.createIndex('user', 'ix_username', 'username');
        }, function(error) {
          should.assert(error === undefined);

          cx.alterDatabase(function(db) {
            db.createIndex('user', 'ix_username', 'username', function(error) {
              error.message.should.be.eql("Index 'ix_username' on 'user' already exists.");
              done();
            });
          });
        });
      });
    });

    describe("#dropIndex()", function() {
      var cx = drv.createConnection({database: "odba"});
      var auxCx  = cx.clone();

      beforeEach(function(done) {
        cx.createDatabase(indexedSchema, done);
      });

      afterEach(function(done) {
        auxCx.close(done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("dropIndex()", function() {
        cx.alterDatabase(function(db) {
          (function() {
            db.dropIndex();
          }).should.throwError("Table name and index name expected.");
        });
      });

      it("dropIndex(table)", function() {
        cx.alterDatabase(function(db) {
          (function() {
            db.dropIndex("user");
          }).should.throwError("Table name and index name expected.");
        });
      });

      it("dropIndex(table, index)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("user", "ix_username");
        }, function(error) {
          should.assert(error === undefined);

          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(false);
              done();
            });
          });
        });
      });

      it("dropIndex('unknown', index)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("unknown", "ix_username");
        }, done);
      });

      it("dropIndex('unknown', index, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("unknown", "ix_username", done);
        });
      });

      it("dropIndex(table, 'unknown')", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("user", "ix_unknown");
        }, done);
      });

      it("dropIndex(table, index, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("user", "ix_username", function(error) {
            should.assert(error === undefined);
          });
        }, function(error) {
          should.assert(error === undefined);

          auxCx.open(function(error, db) {
            db.hasIndex("user", "ix_username", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(false);
              done();
            });
          });
        });
      });

      it("dropIndex('unknown', index, callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("unknown", "ix_username", function(error) {
            should.assert(error === undefined);
          });
        }, done);
      });

      it("dropIndex(table, 'unknown', callback)", function(done) {
        cx.alterDatabase(function(db) {
          db.dropIndex("user", "ix_unknown", function(error) {
            should.assert(error === undefined);
          });
        }, done);
      });

      it("dropIndex(...) - Out of version change transaction", function(done) {
        auxCx.open(function(error, db) {
          db.dropIndex("user", "ix_username", function(error) {
            error.message.should.be.eql("Database.dropIndex() only into Connection.alterDatabase().");
            done();
          });
        });
      });
    });
  });
});