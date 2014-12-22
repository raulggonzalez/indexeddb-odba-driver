describe("odba.indexeddb.IndexedDBDatabase (Indexes)", function() {
  var IndexedDBTable = odba.indexeddb.IndexedDBTable;
  var IndexedDBIndex = odba.indexeddb.IndexedDBIndex;
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
      cx.server.createDatabase("odba", indexedSchema, done);
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
      cx.server.dropDatabase("odba", done);
    });

    describe("#findIndex()", function() {
      describe("Error handling", function() {
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
      describe("Error handling", function() {
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
  });

  describe("#createIndex()", function() {
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

    it("createIndex()", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        (function() {
          db.createIndex();
        }).should.throwError("Table name, index name and indexing column name expected.");
      }, done);
    });

    it("createIndex(table)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        (function() {
          db.createIndex("user");
        }).should.throwError("Table name, index name and indexing column name expected.");
      }, done);
    });

    it("createIndex(table, ix)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        (function() {
          db.createIndex("user", "ix_username");
        }).should.throwError("Table name, index name and indexing column name expected.");
      }, done);
    });

    it("createIndex(table, ix, col)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
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
      cx.server.alterDatabase("odba", function(db) {
        db.createIndex("unknown", "ix_username", "username", function(error) {
          error.message.should.be.eql("Object store 'unknown' doesn't exist.");
          done();
        });
      });
    });

    it("createIndex(table, ix, col, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
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
      cx.server.alterDatabase("odba", function(db) {
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
      cx.server.alterDatabase("odba", function(db) {
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
          error.message.should.be.eql("Database.createIndex() only into Server.createDatabase() or Server.alterDatabase().");
          done();
        });
      });
    });

    it("createIndex(table, 'existing', col, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.createIndex('user', 'ix_username', 'username');
      }, function(error) {
        should.assert(error === undefined);

        cx.server.alterDatabase("odba", function(db) {
          db.createIndex('user', 'ix_username', 'username', function(error) {
            error.message.should.be.eql("Index 'ix_username' on 'user' already exists.");
            done();
          });
        });
      });
    });
  });

  describe("#dropIndex()", function() {
    var cx, auxCx;

    beforeEach(function() {
      cx = drv.createConnection({database: "odba"});
      auxCx = cx.clone();
    });

    beforeEach(function(done) {
      cx.server.createDatabase("odba", indexedSchema, done);
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

    describe("Error handling", function() {
      it("dropIndex()", function(done) {
        cx.server.alterDatabase("odba", function(db) {
          (function() {
            db.dropIndex();
          }).should.throwError("Table name and index name expected.");
        }, done);
      });

      it("dropIndex(table)", function(done) {
        cx.server.alterDatabase("odba", function(db) {
          (function() {
            db.dropIndex("user");
          }).should.throwError("Table name and index name expected.");
        }, done);
      });
    });

    it("dropIndex(table, index)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
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
      cx.server.alterDatabase("odba", function(db) {
        db.dropIndex("unknown", "ix_username");
      }, done);
    });

    it("dropIndex('unknown', index, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropIndex("unknown", "ix_username", done);
      });
    });

    it("dropIndex(table, 'unknown')", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropIndex("user", "ix_unknown");
      }, done);
    });

    it("dropIndex(table, index, callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
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
      cx.server.alterDatabase("odba", function(db) {
        db.dropIndex("unknown", "ix_username", function(error) {
          should.assert(error === undefined);
        });
      }, done);
    });

    it("dropIndex(table, 'unknown', callback)", function(done) {
      cx.server.alterDatabase("odba", function(db) {
        db.dropIndex("user", "ix_unknown", function(error) {
          should.assert(error === undefined);
        });
      }, done);
    });

    it("dropIndex(...) - Out of version change transaction", function(done) {
      auxCx.open(function(error, db) {
        db.dropIndex("user", "ix_username", function(error) {
          error.message.should.be.eql("Database.dropIndex() only into Server.alterDatabase().");
          done();
        });
      });
    });
  });
});