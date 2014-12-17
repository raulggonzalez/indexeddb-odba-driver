describe("Connection", function() {
  var drv = odba.Driver.getDriver("IndexedDB");
  var cx = drv.createConnection({database: "odba"});
  var IndexedDBDatabase = odba.indexeddb.IndexedDBDatabase;

  after(function(done) {
    cx.dropDatabase(done);
  });

  describe("Properties", function() {
    after(function(done) {
      cx.dropDatabase(done);
    });

    describe("Closed connection", function() {
      var cx = drv.createConnection({database: "odba"});

      it("config", function() {
        cx.config.should.be.eql({database: "odba"});
      });

      it("transaction", function() {
        should.assert(cx.transaction === undefined);
      });

      it("database", function() {
        should.assert(cx.database === undefined);
      });

      it("indexedDB", function() {
        should.assert(!!cx.indexedDB);
      });
    });

    describe("Open connection", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.open(done);
      });

      after(function(done) {
        cx.close(done);
      });

      it("database", function() {
        cx.database.should.be.instanceOf(IndexedDBDatabase);
      });

      it("transaction", function() {
        should.assert(cx.transaction === undefined);
      });
    });
  });

  describe("Databases", function() {
    describe("#dropDatabase()", function() {
      it("dropDatabase(callback)", function(done) {
        cx.dropDatabase(function(error) {
          should.assert(error === undefined);
          cx.connected.should.be.eql(false);

          cx.hasDatabase("odba", function(error, exists) {
            should.assert(error === undefined);
            exists.should.be.eql(false);
            done();
          });
        });
      });
    });

    describe("#createDatabase()", function() {
      describe("w/connection closed", function() {
        var cx = drv.createConnection({database: "odba"});

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("createDatabase()", function(done) {
          cx.createDatabase();

          setTimeout(function() {
            cx.hasDatabase(function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          }, 1000);
        });

        it("createDatabase(ddl) - Check connection", function(done) {
          cx.createDatabase(function(db) {
            cx.database.should.be.exactly(db);
          }, function(error) {
            should.assert(error === undefined);
            cx.connected.should.be.eql(false);
            done();
          });
        });

        it("createDatabase(ddl)", function(done) {
          cx.createDatabase(schema);

          setTimeout(function() {
            cx.hasDatabase(function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          }, 1000);
        });

        it("createDatabase(ddl, callback)", function(done) {
          cx.createDatabase(schema, function(error) {
            should.assert(error === undefined);

            cx.hasDatabase(function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          });
        });

        it("createDatabase(null, callback)", function(done) {
          cx.createDatabase(null, function(error) {
            should.assert(error === undefined);

            cx.hasDatabase(function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          });
        });
      });

      describe("w/connection opened", function() {
        var cx = drv.createConnection({database: "odba"});

        beforeEach(function(done) {
          cx.open(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("createDatabase()", function() {
          (function() {
            cx.createDatabase();
          }).should.throwError("Connection opened.");
        });

        it("createDatabase(ddl)", function() {
          (function() {
            cx.createDatabase(schema);
          }).should.throwError("Connection opened.");
        });

        it("createDatabase(ddl, callback)", function() {
          (function() {
            cx.createDatabase(schema, function(error) {});
          }).should.throwError("Connection opened.");
        });

        it("createDatabase(null, callback)", function() {
          (function() {
            cx.createDatabase(null, function(error) {});
          }).should.throwError("Connection opened.");
        });
      });
    });

    describe("#alterDatabase()", function() {
      describe("w/connection closed", function() {
        var cx = drv.createConnection({database: "odba"});
        var chkCx = cx.clone();

        before(function(done) {
          cx.createDatabase(schema, done);
        });

        after(function(done) {
          chkCx.close(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("alterDatabase()", function() {
          (function() {
            cx.alterDatabase();
          }).should.throwError("Operation to alter schema expected.");
        });

        it("alterDatabase(ddl)", function(done) {
          cx.alterDatabase(function(db) {
            db.createTable("alter", {keyPath: "alterId"});
          });

          setTimeout(function() {
            chkCx.open(function(error, db) {
              should.assert(error === undefined);
              cx.connected.should.be.eql(false);

              db.hasTable("alter", function(error, exists) {
                should.assert(error === undefined);
                exists.should.be.eql(true);
                chkCx.close(done);
              });
            });
          }, 1500);
        });

        it("alterDatabase(ddl, callback)", function(done) {
          function callback(error) {
            should.assert(error === undefined);

            setTimeout(function() {
              chkCx.open(function(error, db) {
                should.assert(error === undefined);
                cx.connected.should.be.eql(false);

                db.hasTable("alter", function(error, exists) {
                  should.assert(error === undefined);
                  exists.should.be.eql(true);
                  chkCx.close(done);
                });
              });
            }, 1500);
          }

          cx.alterDatabase(function(db) {
            db.createTable("alter", {keyPath: "alterId"});
          }, callback);
        });
      });

      describe("w/connection opened", function() {
        var cx = drv.createConnection({database: "odba"});

        beforeEach(function(done) {
          cx.open(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("alterDatabase()", function() {
          (function() {
            cx.alterDatabase();
          }).should.throwError("Connection opened.");
        });

        it("alterDatabase(ddl)", function() {
          (function() {
            cx.alterDatabase(schema);
          }).should.throwError("Connection opened.");
        });

        it("alterDatabase(ddl, callback)", function() {
          (function() {
            cx.alterDatabase(schema, function(error) {});
          }).should.throwError("Connection opened.");
        });

        it("alterDatabase(null, callback)", function() {
          (function() {
            cx.createDatabase(null, function(error) {});
          }).should.throwError("Connection opened.");
        });
      });
    });

    describe("#hasDatabase()", function() {
      var cx = drv.createConnection({database: "odba"});

      beforeEach(function(done) {
        cx.createDatabase(undefined, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      afterEach(function(done) {
        drv.createConnection({database: "unknown"}).dropDatabase(done);
      });

      it("hasDatabase()", function() {
        (function() {
          cx.hasDatabase();
        }).should.throwError("Callback expected.");
      });

      it("hasDatabase(callback)", function(done) {
        cx.hasDatabase(function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(true);
          done();
        });
      });

      it("hasDatabase(name, callback)", function(done) {
        cx.hasDatabase("odba", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(true);
          done();
        });
      });

      it("hasDatabase(unknown, callback)", function(done) {
        cx.hasDatabase("unknown", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });
    });
  });

  describe("#open()", function() {
    var cx = drv.createConnection({database: "odba"});

    before(function(done) {
      cx.createDatabase(undefined, done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    describe("w/connection closed", function() {
      var cx = drv.createConnection({database: "odba"});

      afterEach(function(done) {
        cx.close(done);
      });

      it("open()", function() {
        (function() {
          cx.open();
        }).should.throwError("Callback expected.");
      });

      it("open(callback)", function(done) {
        cx.open(function(error, db) {
          should.assert(error === undefined);
          db.should.be.eql(cx.database);
          cx.connected.should.be.eql(true);
          cx.database.should.be.instanceOf(IndexedDBDatabase);
          done();
        });
      });
    });

    describe("w/connection already opened", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.open(done);
      });

      after(function(done) {
        cx.close(done);
      });

      it("open()", function(done) {
        cx.open();

        setTimeout(function() {
          cx.connected.should.be.eql(true);
          cx.database.should.be.instanceOf(IndexedDBDatabase);
          done();
        }, 500);
      });

      it("open(callback)", function(done) {
        cx.open(function(error, db) {
          should.assert(error === undefined);
          db.should.be.eql(cx.database);
          cx.connected.should.be.eql(true);
          cx.database.should.be.instanceOf(IndexedDBDatabase);
          done();
        });
      });
    });
  });

  describe("#close()", function() {
    var cx = drv.createConnection({database: "obda"});

    before(function(done) {
      cx.createDatabase(undefined, done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    describe("w/connection opened", function() {
      var cx = drv.createConnection({database: "odba"});

      beforeEach(function(done) {
        cx.open(done);
      });

      it("close()", function(done) {
        cx.close();

        setTimeout(function() {
          cx.connected.should.be.eql(false);
          should.assert(cx.database === undefined);
          done();
        }, 500);
      });

      it("close(callback)", function(done) {
        cx.close(function(error) {
          should.assert(error === undefined);
          cx.connected.should.be.eql(false);
          should.assert(cx.database === undefined);
          done();
        });
      });
    });

    describe("w/connection closed", function() {
      var cx = drv.createConnection({database: "odba"});

      it("close()", function(done) {
        cx.close();

        setTimeout(function() {
          cx.connected.should.be.eql(false);
          should.assert(cx.database === undefined);
          done();
        }, 500);
      });

      it("close(callback)", function(done) {
        cx.close(function(error) {
          should.assert(error === undefined);
          cx.connected.should.be.eql(false);
          should.assert(cx.database === undefined);
          done();
        });
      });
    });
  });
});