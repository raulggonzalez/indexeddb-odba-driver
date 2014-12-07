describe("Connection-Transaction", function() {
  var drv = Driver.getDriver("IndexedDB");

  describe("#hasTransaction()", function() {
    describe("Into read/write transaction", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("hasTransaction()", function() {
        cx.beginTransaction("readwrite");
        cx.hasTransaction().should.be.eql(true);
      });

      it("hasTransaction('versionchange')", function() {
        cx.beginTransaction("readwrite");
        cx.hasTransaction("versionchange").should.be.eql(false);
      });

      it("hasTransaction('readonly')", function() {
        cx.beginTransaction("readwrite");
        cx.hasTransaction("readonly").should.be.eql(false);
      });

      it("hasTransaction('readwrite')", function() {
        cx.beginTransaction("readwrite");
        cx.hasTransaction("readwrite").should.be.eql(true);
      });
    });

    describe("Into read-only transaction", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("hasTransaction()", function() {
        cx.beginTransaction("readonly");
        cx.hasTransaction().should.be.eql(true);
      });

      it("hasTransaction('versionchange')", function() {
        cx.beginTransaction("readonly");
        cx.hasTransaction("versionchange").should.be.eql(false);
      });

      it("hasTransaction('readonly')", function() {
        cx.beginTransaction("readonly");
        cx.hasTransaction("readonly").should.be.eql(true);
      });

      it("hasTransaction('readwrite')", function() {
        cx.beginTransaction("readonly");
        cx.hasTransaction("readwrite").should.be.eql(false);
      });
    });

    describe("Into version change transaction", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("hasTransaction()", function(done) {
        cx.alterDatabase(function(db) {
          cx.hasTransaction().should.be.eql(true);
        }, done);
      });

      it("hasTransaction('versionchange')", function(done) {
        cx.alterDatabase(function(db) {
          cx.hasTransaction("versionchange").should.be.eql(true);
        }, done);
      });

      it("hasTransaction('readonly')", function(done) {
        cx.alterDatabase(function(db) {
          cx.hasTransaction("readonly").should.be.eql(false);
        }, done);
      });

      it("hasTransaction('readwrite')", function(done) {
        cx.alterDatabase(function(db) {
          cx.hasTransaction("readwrite").should.be.eql(false);
          done();
        });
      });
    });
  });

  describe("#createDatabase()", function() {
    var cx = drv.createConnection({database: "odba"});

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    it("createDatabase(ddl, callback)", function(done) {
      cx.createDatabase(function(db) {
        cx.hasTransaction().should.be.eql(true);
        cx.transaction.should.be.instanceOf(IndexedDBTransaction);
        cx.transaction.mode.should.be.eql("versionchange");
      }, function(error) {
        should.assert(cx.transaction === undefined);
        cx.hasTransaction().should.be.eql(false);
        done();
      });
    });
  });

  describe("#alterDatabase()", function() {
    var cx = drv.createConnection({database: "odba"});

    after(function(done) {
      cx.dropDatabase(done);
    });

    it("alterDatabase(ddl, callback)", function(done) {
      cx.alterDatabase(function(db) {
        cx.hasTransaction().should.be.eql(true);
        cx.transaction.should.be.instanceOf(IndexedDBTransaction);
        cx.transaction.mode.should.be.eql("versionchange");
      }, function(error) {
        cx.hasTransaction().should.be.eql(false);
        should.assert(cx.transaction === undefined);
        done();
      });
    });
  });

  describe("#beginTransaction()", function() {
    describe("Calls", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("beginTransaction()", function(done) {
        var tran = cx.beginTransaction();
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readonly')", function(done)  {
        var tran = cx.beginTransaction("readonly");
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readonly");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readwrite')", function(done)  {
        var tran = cx.beginTransaction("readwrite");
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction(stores)", function(done) {
        var tran = cx.beginTransaction(["user"]);
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction(handlers)", function(done) {
        var tran = cx.beginTransaction({complete: function() {}});
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.length.should.be.eql(1);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readonly', store)", function(done)  {
        var tran = cx.beginTransaction("readonly", "user");
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readonly");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readwrite', store)", function(done)  {
        var tran = cx.beginTransaction("readwrite", "user");
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readonly', stores)", function(done)  {
        var tran = cx.beginTransaction("readonly", ["user"]);
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readonly");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readwrite', stores)", function(done)  {
        var tran = cx.beginTransaction("readwrite", ["user"]);
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.should.be.eql([]);
        tran.errorHandlers.should.be.eql([]);
        tran.completeHandlers.should.be.eql([]);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readonly', handlers)", function(done)  {
        var tran = cx.beginTransaction("readonly", {error: function() {}, abort: function() {}, complete: function() {}});
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readonly");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.length.should.be.eql(1);
        tran.errorHandlers.length.should.be.eql(1);
        tran.completeHandlers.length.should.be.eql(1);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readwrite', handlers)", function(done)  {
        var tran = cx.beginTransaction("readwrite", {error: function() {}, abort: function() {}, complete: function() {}});
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.length.should.be.eql(1);
        tran.errorHandlers.length.should.be.eql(1);
        tran.completeHandlers.length.should.be.eql(1);
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction(stores, handlers)", function(done)  {
        var tran = cx.beginTransaction(["user"], {error: function() {}});
        tran.native.should.be.instanceOf(IDBTransaction);
        tran.mode.should.be.eql("readwrite");
        tran.connection.should.be.eql(cx);
        tran.abortHandlers.length.should.be.eql(0);
        tran.errorHandlers.length.should.be.eql(1);
        tran.completeHandlers.length.should.be.eql(0);
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });
    });

    describe("Into Connection.createDatabase()", function() {
      var cx = drv.createConnection({database: "odba"});

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("beginTransaction()", function(done) {
        cx.createDatabase(function(db) {
          cx.beginTransaction().should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readonly')", function(done) {
        cx.createDatabase(function(db) {
          cx.beginTransaction("readonly").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readonly', store)", function(done) {
        cx.createDatabase(function(db) {
          cx.beginTransaction("readonly", "user").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readwrite')", function(done) {
        cx.createDatabase(function(db) {
          cx.beginTransaction("readwrite").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readwrite', store)", function(done) {
        cx.createDatabase(function(db) {
          cx.beginTransaction("readwrite", "user").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });
    });

    describe("Into Connection.alterDatabase()", function() {
      var cx = drv.createConnection({database: "odba"});

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("beginTransaction()", function(done) {
        cx.alterDatabase(function(db) {
          cx.beginTransaction().should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readonly')", function(done) {
        cx.alterDatabase(function(db) {
          cx.beginTransaction("readonly").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readonly', store)", function(done) {
        cx.alterDatabase(function(db) {
          cx.beginTransaction("readonly", "user").should.be.eql(cx.transaction);
          done();
        });
      });

      it("beginTransaction('readwrite')", function(done) {
        cx.alterDatabase(function(db) {
          cx.beginTransaction("readwrite").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });

      it("beginTransaction('readwrite', store)", function(done) {
        cx.alterDatabase(function(db) {
          cx.beginTransaction("readwrite", "user").should.be.eql(cx.transaction);
          cx.transaction.mode.should.be.eql("versionchange");
          done();
        });
      });
    });

    describe("No active transaction", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      it("beginTransaction()", function(done) {
        var tran = cx.beginTransaction();
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readwrite");
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readonly')", function(done) {
        var tran = cx.beginTransaction("readonly");
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readonly");
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readonly', [])", function() {
        (function() {
          cx.beginTransaction("readonly", []);
        }).should.throwError("Object store(s) expected.");
      });

      it("beginTransaction('readonly', store)", function(done) {
        var tran = cx.beginTransaction("readonly", "user");
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readonly");
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readonly', stores)", function(done) {
        var tran = cx.beginTransaction("readonly", ["user", "session"]);
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readonly");
        tran.objectStoreNames.should.be.eql(["user", "session"]);
        done();
      });

      it("beginTransaction('readwrite')", function(done) {
        var tran = cx.beginTransaction("readwrite");
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readwrite");
        tran.objectStoreNames.should.be.eql(["session", "user"]);
        done();
      });

      it("beginTransaction('readwrite', [])", function() {
        (function() {
          cx.beginTransaction("readwrite", []);
        }).should.throwError("Object store(s) expected.");
      });

      it("beginTransaction('readwrite', store)", function(done) {
        var tran = cx.beginTransaction("readwrite", "user");
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readwrite");
        tran.objectStoreNames.should.be.eql(["user"]);
        done();
      });

      it("beginTransaction('readwrite', stores)", function(done) {
        var tran = cx.beginTransaction("readwrite", ["user", "session"]);
        tran.should.be.instanceOf(IndexedDBTransaction);
        tran.should.be.eql(cx.transaction);
        tran.mode.should.be.eql("readwrite");
        tran.objectStoreNames.should.be.eql(["user", "session"]);
        done();
      });
    });

    describe("In active transaction", function() {
      describe("In version change transaction", function() {
        var cx = drv.createConnection({database: "odba"});

        before(function(done) {
          cx.createDatabase(schema, done);
        });

        afterEach(function(done) {
          cx.close(done);
        });

        after(function(done) {
          cx.dropDatabase(done);
        });

        it("beginTransaction()", function(done) {
          cx.alterDatabase(function(db) {
            var tran = cx.beginTransaction();
            tran.should.be.eql(cx.transaction);
            tran.mode.should.be.eql("versionchange");
            done();
          });
        });

        it("beginTransaction('readonly')", function(done) {
          cx.alterDatabase(function(db) {
            var tran = cx.beginTransaction("readonly");
            tran.should.be.eql(cx.transaction);
            tran.mode.should.be.eql("versionchange");
            done();
          });
        });

        it("beginTransaction('readonly', store)", function(done) {
          cx.alterDatabase(function(db) {
            var tran = cx.beginTransaction("readonly", "user");
            tran.should.be.eql(cx.transaction);
            tran.mode.should.be.eql("versionchange");
            done();
          });
        });

        it("beginTransaction('readwrite')", function(done) {
          cx.alterDatabase(function(db) {
            var tran = cx.beginTransaction("readwrite");
            tran.should.be.eql(cx.transaction);
            tran.mode.should.be.eql("versionchange");
            done();
          });
        });

        it("beginTransaction('readwrite', store)", function(done) {
          cx.alterDatabase(function(db) {
            var tran = cx.beginTransaction("readwrite", "user");
            tran.should.be.eql(cx.transaction);
            tran.mode.should.be.eql("versionchange");
            done();
          });
        });
      });

      describe("In read-only transaction", function() {
        var cx = drv.createConnection({database: "odba"});

        before(function(done) {
          cx.createDatabase(schema, done);
        });

        beforeEach(function(done) {
          cx.open(done);
        });

        afterEach(function(done) {
          cx.close(done);
        });

        after(function(done) {
          cx.dropDatabase(done);
        });

        it("beginTransaction()", function() {
          var outer = cx.beginTransaction("readonly");

          (function() {
            cx.beginTransaction();
          }).should.throwError("Active transaction is read-only and it can't be promoted to another mode.");

          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly')", function() {
          var outer = cx.beginTransaction("readonly");
          var inner = cx.beginTransaction("readonly");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', store)", function() {
          var outer = cx.beginTransaction("readonly");
          var inner = cx.beginTransaction("readonly", "user");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', store) - Store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readonly", "user");

          (function() {
            cx.beginTransaction("readonly", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', stores)", function() {
          var outer = cx.beginTransaction("readonly");
          var inner = cx.beginTransaction("readonly", ["user"]);
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', stores) - Some store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readonly", "user");

          (function() {
            cx.beginTransaction("readonly", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });
      });

      describe("In read/write transaction", function() {
        var cx = drv.createConnection({database: "odba"});

        before(function(done) {
          cx.createDatabase(schema, done);
        });

        beforeEach(function(done) {
          cx.open(done);
        });

        afterEach(function(done) {
          cx.close(done);
        });

        after(function(done) {
          cx.dropDatabase(done);
        });

        it("beginTransaction()", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction();
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly')", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readonly");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', store)", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readonly", "user");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', store) - Store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readwrite", "user");

          (function() {
            cx.beginTransaction("readonly", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', stores)", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readonly", ["user"]);
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readonly', stores) - Some store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readwrite", "user");

          (function() {
            cx.beginTransaction("readonly", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readwrite')", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readwrite");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readwrite', store)", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readwrite", "user");
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readwrite', store) - Store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readwrite", "user");

          (function() {
            cx.beginTransaction("readwrite", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readwrite', stores)", function() {
          var outer = cx.beginTransaction("readwrite");
          var inner = cx.beginTransaction("readwrite", ["user"]);
          outer.should.be.eql(inner);
          cx.transaction.should.be.eql(outer);
        });

        it("beginTransaction('readwrite', stores) - Some store can't be integrated therein", function() {
          var outer = cx.beginTransaction("readwrite", "user");

          (function() {
            cx.beginTransaction("readwrite", "session");
          }).should.throwError("There's an active transaction and the new transaction can't be integrated therein. The object store 'session' isn't in the active transaction.");

          cx.transaction.should.be.eql(outer);
        });
      });
    })
  });

  describe("#runTransaction()", function() {
    var cx = drv.createConnection({database: "odba"});

    before(function(done) {
      cx.createDatabase(schema, done);
    });

    beforeEach(function(done) {
      cx.open(done);
    });

    afterEach(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    it("runTransaction()", function() {
      (function() {
        cx.runTransaction();
      }).should.throwError("Transaction mode and operation expected.");
    });

    it("runTransaction(mode)", function() {
      (function() {
        cx.runTransaction("readonly");
      }).should.throwError("Transaction mode and operation expected.");
    });

    it("runTransaction('readonly', op)", function(done) {
      cx.runTransaction("readonly", function(db) {
        db.should.be.instanceOf(IndexedDBDatabase);
        cx.database.should.be.eql(db);
        cx.transaction.mode.should.be.eql("readonly");
      }, function(error) {
        should.assert(error === undefined);
        done();
      })
    });

    it("runTransaction('readwrite', op)", function(done) {
      cx.runTransaction("readwrite", function(db) {
        db.should.be.instanceOf(IndexedDBDatabase);
        cx.database.should.be.eql(db);
        cx.transaction.mode.should.be.eql("readwrite");
      }, function(error) {
        should.assert(error === undefined);
        done();
      })
    });
  });
});