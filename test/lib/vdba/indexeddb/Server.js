describe("vdba.indexeddb.IndexedDBServer", function() {
  var drv;

  before(function() {
    drv = vdba.Driver.getDriver("IndexedDB");
  });

  describe("Properties", function() {
    var cx;

    before(function() {
      cx = drv.createConnection({database: "vdba"});
    });

    before(function(done) {
      cx.server.createDatabase("vdba", schema, done);
    });

    before(function(done) {
      cx.open(done);
    });

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.server.dropDatabase("vdba", done);
    });

    it("host", function() {
      cx.server.host.should.be.eql("localhost");
    });

    it("port", function() {
      (function() {
        cx.server.port.should.be.eql(undefined);
      }).should.throwError("Unsupported property.");
    });

    it("version", function() {
      (function() {
        cx.server.version.should.be.eql(undefined);
      }).should.throwError("Unsupported property.");
    });
  });

  describe("Databases", function() {
    describe("#dropDatabase()", function() {
      describe("Unique connection", function() {
        var cx;

        before(function() {
          cx = drv.createConnection({database: "vdba"});
        });

        after(function(done) {
          cx.close(done);
        });

        describe("Error handling", function() {
          it("dropDatabase()", function() {
            (function() {
              cx.server.dropDatabase();
            }).should.throwError("Database name expected.");
          });

          it("dropDatabase(callback)", function() {
            (function() {
              cx.server.dropDatabase(function() {});
            }).should.throwError("Database name expected.");
          });
        });

        it("dropDatabase(name, callback)", function(done) {
          cx.server.dropDatabase("vdba", function(error) {
            should.assert(error === undefined);
            cx.connected.should.be.eql(false);

            cx.server.hasDatabase("vdba", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(false);
              done();
            });
          });
        });
      });

      describe("Concurrent connections", function() {
        var cx, auxCx;

        before(function() {
          cx = drv.createConnection({database: "vdba"});
          auxCx = cx.clone();
        });

        beforeEach(function(done) {
          cx.server.createDatabase("vdba", schema, done);
        });

        beforeEach(function(done) {
          auxCx.open(done);
        });

        after(function(done) {
          auxCx.close(done);
        });

        it("dropDatabase()", function(done) {
          var timeout = false;

          cx.server.dropDatabase("vdba", function(error) {
            should.assert(error === undefined);
            timeout.should.be.eql(true, "Drop should be greater than 3000ms.");
            done();
          });

          setTimeout(function() {
            auxCx.close(function(error) {
              should.assert(error === undefined);
              timeout = true;
            });
          }, 3000);
        });
      });
    });

    describe("#createDatabase()", function() {
      describe("w/connection closed", function() {
        var cx;

        beforeEach(function() {
          cx = drv.createConnection({database: "vdba"});
        });

        afterEach(function(done) {
          cx.server.dropDatabase("vdba", done);
        });

        afterEach(function(done) {
          cx.close(done);
        });

        describe("Error handling", function() {
          it("createDatabase()", function() {
            (function() {
              cx.server.createDatabase();
            }).should.throwError("Database name expected.");
          });

          it("createDatabase(ddl)", function() {
            (function() {
              cx.server.createDatabase(function() {});
            }).should.throwError("Database name expected.");
          });
        });

        it("createDatabase(name, ddl) - Check connection", function(done) {
          cx.server.createDatabase("vdba", function(db) {
            cx.database.should.be.exactly(db);
          }, function(error) {
            should.assert(error === undefined);
            cx.connected.should.be.eql(false);
            done();
          });
        });

        it("createDatabase(name, ddl)", function(done) {
          cx.server.createDatabase("vdba", schema);

          setTimeout(function() {
            cx.server.hasDatabase("vdba", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          }, 1000);
        });

        it("createDatabase(name, ddl, callback)", function(done) {
          cx.server.createDatabase("vdba", schema, function(error) {
            should.assert(error === undefined);

            cx.server.hasDatabase("vdba", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          });
        });

        it("createDatabase(name, null, callback)", function(done) {
          cx.server.createDatabase("vdba", null, function(error) {
            should.assert(error === undefined);

            cx.server.hasDatabase("vdba", function(error, exists) {
              should.assert(error === undefined);
              exists.should.be.eql(true);
              cx.connected.should.be.eql(false);
              done();
            });
          });
        });
      });

      describe("w/connection opened", function() {
        var cx;

        beforeEach(function(done) {
          drv.openConnection({database: "vdba"}, function(error, con) {
            cx = con;
            done();
          });
        });

        afterEach(function(done) {
          cx.close(done);
        });

        afterEach(function(done) {
          cx.server.dropDatabase("vdba", done);
        });

        it("createDatabase()", function() {
          (function() {
            cx.server.createDatabase();
          }).should.throwError("Database name expected.");
        });

        it("createDatabase(name)", function() {
          (function() {
            cx.server.createDatabase("vdba");
          }).should.throwError("Connection opened.");
        });

        it("createDatabase(name, ddl, callback)", function() {
          (function() {
            cx.server.createDatabase("vdba", schema, function() {});
          }).should.throwError("Connection opened.");
        });

        it("createDatabase(null, callback)", function() {
          (function() {
            cx.server.createDatabase("vdba", null, function() {});
          }).should.throwError("Connection opened.");
        });
      });
    });

    describe("#alterDatabase()", function() {
      describe("w/connection closed", function() {
        var cx, auxCx;

        before(function() {
          cx = drv.createConnection({database: "vdba"});
          auxCx = cx.clone();
        });

        before(function(done) {
          cx.server.createDatabase("vdba", schema, done);
        });

        afterEach(function(done) {
          auxCx.close(done);
        });

        afterEach(function(done) {
          cx.server.dropDatabase("vdba", done);
        });

        describe("Error handling", function() {
          it("alterDatabase()", function() {
            (function() {
              cx.server.alterDatabase();
            }).should.throwError("Database name expected.");
          });

          it("alterDatabase(name)", function() {
            (function() {
              cx.server.alterDatabase("vdba");
            }).should.throwError("Operation to alter schema expected.");
          });

          it("alterDatabase(ddo)", function() {
            (function() {
              cx.server.alterDatabase(function() {});
            }).should.throwError("Database name expected.");
          });
        });

        it("alterDatabase(name, ddl, callback) - Check connection", function(done) {
          cx.server.alterDatabase("vdba", function(db) {
            cx.database.should.be.exactly(db);
          }, function(error) {
            should.assert(error === undefined);
            cx.connected.should.be.eql(false);
            done();
          });
        });

        it("alterDatabase(name, ddl)", function(done) {
          cx.server.alterDatabase("vdba", function(db) {
            db.createTable("alter", {keyPath: "alterId"});
          });

          setTimeout(function() {
            auxCx.open(function(error, db) {
              should.assert(error === undefined);
              cx.connected.should.be.eql(false);

              db.hasTable("alter", function(error, exists) {
                should.assert(error === undefined);
                exists.should.be.eql(true);
                done();
              });
            });
          }, 1500);
        });

        it("alterDatabase(name, ddl, callback)", function(done) {
          cx.server.alterDatabase("vdba", function(db) {
            db.createTable("alter", {keyPath: "alterId"});
          }, function callback(error) {
            should.assert(error === undefined);

            auxCx.open(function(error, db) {
              should.assert(error === undefined);

              db.hasTable("alter", function(error, exists) {
                should.assert(error === undefined);
                exists.should.be.eql(true);
                done();
              });
            });
          });
        });
      });

      describe("w/connection opened", function() {
        var cx;

        beforeEach(function(done) {
          drv.openConnection({database: "vdba"}, function(error, con) {
            cx = con;
            done();
          });
        });

        afterEach(function(done) {
          cx.close(done);
        });

        afterEach(function(done) {
          cx.server.dropDatabase("vdba", done);
        });

        it("alterDatabase()", function() {
          (function() {
            cx.server.alterDatabase();
          }).should.throwError("Database name expected.");
        });

        it("alterDatabase(ddl)", function() {
          (function() {
            cx.server.alterDatabase(schema);
          }).should.throwError("Database name expected.");
        });

        it("alterDatabase(name)", function() {
          (function() {
            cx.server.alterDatabase("vdba");
          }).should.throwError("Operation to alter schema expected.");
        });

        it("alterDatabase(name, ddl)", function() {
          (function() {
            cx.server.alterDatabase("vdba", schema);
          }).should.throwError("Connection opened.");
        });

        it("alterDatabase(name, ddl, callback)", function() {
          (function() {
            cx.server.alterDatabase("vdba", schema, function() {});
          }).should.throwError("Connection opened.");
        });
      });
    });

    describe("#hasDatabase()", function() {
      var cx;

      beforeEach(function() {
        cx = drv.createConnection({database: "vdba"});
      });

      beforeEach(function(done) {
        cx.server.createDatabase("vdba", null, done);
      });

      beforeEach(function(done) {
        cx.open(done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      afterEach(function(done) {
        cx.server.dropDatabase("vdba", done);
      });

      afterEach(function(done) {
        cx.server.dropDatabase("unknown", done);
      });

      describe("Error handling", function() {
        it("hasDatabase()", function() {
          (function() {
            cx.server.hasDatabase();
          }).should.throwError("Database name expected.");
        });

        it("hasDatabase(name)", function() {
          (function() {
            cx.server.hasDatabase("vdba");
          }).should.throwError("Callback expected.");
        });

        it("hasDatabase(callback)", function() {
          (function() {
            cx.server.hasDatabase(function() {});
          }).should.throwError("Database name expected.");
        });
      });

      it("hasDatabase(name, callback)", function(done) {
        cx.server.hasDatabase("vdba", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(true);
          done();
        });
      });

      it("hasDatabase(unknown, callback)", function(done) {
        cx.server.hasDatabase("unknown", function(error, exists) {
          should.assert(error === undefined);
          exists.should.be.eql(false);
          done();
        });
      });
    });
  });
});