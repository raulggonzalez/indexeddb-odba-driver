describe("Table", function() {
  var drv = Driver.getDriver("IndexedDB");
  var RECORDS = [
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"},
    {userId: 3, username: "user03", password: "pwd03"}
  ];

  describe("Properties", function() {
    var cx = drv.createConnection({database: "odba"});
    var tab;

    before(function(done) {
      cx.createDatabase(schema, done);
    });

    before(function(done) {
      cx.open(function(error, db) {
        db.findTable("user", function(error, table) {
          tab = table;
          done();
        });
      });
    });

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    it("database", function() {
      tab.database.should.be.instanceOf(IndexedDBDatabase);
      tab.database.name.should.be.eql("odba");
    });

    it("name", function() {
      tab.name.should.be.eql("user");
    });

    it("keyPath", function() {
      tab.keyPath.should.be.eql("userId");
    });

    it("connection", function() {
      tab.connection.should.be.instanceOf(IndexedDBConnection);
    });
  });

  describe("Indexes", function() {
    describe("DQO", function() {
      var cx = drv.createConnection({database: "odba"});
      var db, tab;

      before(function(done) {
        cx.createDatabase(indexedSchema, done);
      });

      before(function(done) {
        cx.open(function(error, database) {
          db = database;
          db.findTable("user", function(error, table) {
            tab = table;
            done();
          });
        });
      });

      after(function(done) {
        cx.close(done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });

      describe("#hasIndex()", function() {
        it("hasIndex()", function() {
          (function() {
            tab.hasIndex();
          }).should.throwError("Index name and callback expected.");
        });

        it("hasIndex(name)", function() {
          (function() {
            tab.hasIndex("ix_username");
          }).should.throwError("Index name and callback expected.");
        });

        it("hasIndex(name, callback)", function(done) {
          tab.hasIndex("ix_username", function(error, exists) {
            should.assert(error === undefined);
            exists.should.be.eql(true);
            done();
          });
        });

        it("hasIndex('Unknown', callback)", function(done) {
          tab.hasIndex("ix_unknown", function(error, exists) {
            should.assert(error === undefined);
            exists.should.be.eql(false);
            done();
          });
        });
      });

      describe("#findIndex()", function() {
        it("findIndex()", function() {
          (function() {
            tab.findIndex();
          }).should.throwError("Index name and callback expected.");
        });

        it("findIndex(name)", function() {
          (function() {
            tab.findIndex("ix_username");
          }).should.throwError("Index name and callback expected.");
        });

        it("findIndex(name, callback)", function(done) {
          tab.findIndex("ix_username", function(error, ix) {
            should.assert(error === undefined);
            ix.should.be.instanceOf(IndexedDBIndex);
            ix.name.should.be.eql("ix_username");
            ix.column.should.be.eql("username");
            done();
          });
        });

        it("findIndex('unknown', callback)", function(done) {
          tab.findIndex("ix_unknown", function(error, ix) {
            should.assert(error === undefined);
            should.assert(ix === undefined);
            done();
          });
        });
      });
    });

    describe("DDO", function() {
      describe("#dropIndex()", function() {
        var cx = drv.createConnection({database: "odba"});
        var auxCx = cx.clone();

        beforeEach(function(done) {
          cx.createDatabase(indexedSchema, done);
        });

        afterEach(function(done) {
          auxCx.close(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("dropIndex()", function(done) {
          cx.alterDatabase(function(db) {
            db.findTable("user", function(error, tab) {
              should.assert(error === undefined);

              (function() {
                tab.dropIndex();
              }).should.throwError("Index name expected.");

              done();
            });
          });
        });

        it("dropIndex(index)", function(done) {
          cx.alterDatabase(function(db) {
            db.findTable("user", function(error, tab) {
              should.assert(error === undefined);

              tab.dropIndex("ix_username");

              setTimeout(function() {
                auxCx.open(function(error, db) {
                  should.assert(error === undefined);
                  db.hasIndex("user", "ix_username", function(error, exists) {
                    should.assert(error === undefined);
                    exists.should.be.eql(false);
                    done();
                  });
                });
              }, 1000);
            });
          });
        });

        it("dropIndex(unknown)", function(done) {
          cx.alterDatabase(function(db) {
            db.findTable("user", function(error, tab) {
              should.assert(error === undefined);

              tab.dropIndex("ix_unknown");

              setTimeout(function() {
                done();
              }, 1000);
            });
          });
        });

        it("dropIndex(index, callback)", function(done) {
          cx.alterDatabase(function(db) {
            db.findTable("user", function(error, tab) {
              should.assert(error === undefined);

              tab.dropIndex("ix_username", function(error) {
                should.assert(error === undefined);

                tab.hasIndex("ix_username", function(error, exists) {
                  should.assert(error === undefined);
                  exists.should.be.eql(false);
                  done();
                });
              });
            });
          });
        });

        it("dropIndex(unexisting, callback)", function(done) {
          cx.alterDatabase(function(db) {
            db.findTable("user", function(error, tab) {
              should.assert(error === undefined);

              tab.dropIndex("ix_unknown", function(error) {
                should.assert(error === undefined);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe("DQO", function() {
    var cx = drv.createConnection({database: "odba"});
    var tab;

    before(function(done) {
      cx.createDatabase(schema, done);
    });

    before(function(done) {
      cx.open(function(error, db) {
        db.findTable("user", function(error, table) {
          tab = table;
          done();
        });
      });
    });

    before(function(done) {
      tab.insert(RECORDS, done);
    });

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.dropDatabase(done);
    });

    describe("#findAll()", function() {
      it("findAll()", function() {
        (function() {
          tab.findAll();
        }).should.throwError("Callback expected.");
      });

      it("findAll(callback)", function(done) {
        tab.findAll(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(IndexedDBResult);
          result.length.should.be.eql(3);
          done();
        });
      });
    });

    describe("#find()", function() {
      it("find()", function() {
        (function() {
          tab.find();
        }).should.throwError("Callback expected.");
      });

      it("find(where)", function() {
        (function() {
          tab.find({});
        }).should.throwError("Callback expected.");
      });

      it("find(callback)", function(done) {
        tab.find(function(error, result) {
          should.assert(error === undefined);
          result.should.be.instanceOf(IndexedDBResult);
          result.length.should.be.eql(3);
          done();
        });
      });

      it("find(where, callback)", function(done) {
        tab.find({userId: 2}, function(error, result) {
          should.assert(error === undefined);
          result.length.should.be.eql(1);
          result.rows[0].should.be.eql(RECORDS[1]);
          done();
        });
      });

      it("find(where, callback) - No rows matched", function(done) {
        tab.find({userId: 111}, function(error, result) {
          should.assert(error === undefined);
          result.length.should.be.eql(0);
          result.rows.should.be.eql([]);
          done();
        });
      });

      it("find(where, callback) - No key path", function(done) {
        tab.find({noKeyPath: 1}, function(error, result) {
          error.message.should.be.eql("Invalid find criteria.");
          should.assert(result === undefined);
          done();
        });
      });
    });

    describe("#findOne()", function() {
      it("findOne()", function() {
        (function() {
          tab.findOne();
        }).should.throwError("Callback expected.");
      });

      it("findOne(where)", function() {
        (function() {
          tab.findOne({});
        }).should.throwError("Callback expected.");
      });

      it("findOne(callback)", function(done) {
        tab.findOne(function(error, record) {
          should.assert(error === undefined);
          record.should.not.be.instanceOf(IndexedDBResult);
          record.should.have.properties("userId", "username", "password");
          done();
        });
      });

      it("findOne({}, callback)", function(done) {
        tab.findOne({}, function(error, record) {
          should.assert(error === undefined);
          record.should.not.be.instanceOf(IndexedDBResult);
          record.should.have.properties("userId", "username", "password");
          done();
        });
      });

      it("findOne(where, callback)", function(done) {
        tab.findOne({userId: 2}, function(error, record) {
          should.assert(error === undefined);
          record.should.not.be.instanceOf(IndexedDBResult);
          record.should.be.eql(RECORDS[1]);
          done();
        });
      });

      it("findOne(where, callback) - No rows matched", function(done) {
        tab.findOne({userId: 111}, function(error, record) {
          should.assert(error === undefined);
          should.assert(record === undefined);
          done();
        });
      });

      it("findOne(where, callback) - No key path", function(done) {
        tab.findOne({noKeyPath: 1}, function(error, record) {
          error.message.should.be.eql("Invalid find criteria.");
          should.assert(record === undefined);
          done();
        });
      });
    });

    describe("#count()", function() {
      it("count(callback)", function(done) {
        tab.count(function(error, count) {
          should.assert(error === undefined);
          count.should.be.eql(3);
          done();
        });
      });
    });
  });

  describe("DMO", function() {
    describe("#insert()", function() {
      describe("Auto increment", function() {
        var cx = drv.createConnection({database: "odba"});
        var tab;
        var RECORDS = [
          {username: "user01", password: "pwd01"},
          {username: "user02", password: "pwd02"},
          {username: "user03", password: "pwd03"}
        ];

        beforeEach(function(done) {
          cx.createDatabase(autoIncrementSchema, done);
        });

        beforeEach(function(done) {
          cx.open(function(error, db) {
            db.findTable("user", function(error, table) {
              tab = table;
              done();
            });
          });
        });

        afterEach(function(done) {
          cx.close(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("insert(record, callback)", function(done) {
          tab.insert({username: "user01", password: "pwd01"}, function(error) {
            should.assert(error === undefined);

            tab.findAll(function(error, result) {
              should.assert(error === undefined);
              result.length.should.be.eql(1);
              result.rows[0].should.be.eql({userId: 1, username: "user01", password: "pwd01"});
              done();
            });
          });
        });

        it("insert(records, callback)", function(done) {
          tab.insert(RECORDS, function(error, result) {
            should.assert(error === undefined);

            tab.findAll(function(error, result) {
              should.assert(error === undefined);
              result.length.should.be.eql(3);
              result.rows[0].should.be.eql({userId: 1, username: "user01", password: "pwd01"});
              result.rows[1].should.be.eql({userId: 2, username: "user02", password: "pwd02"});
              result.rows[2].should.be.eql({userId: 3, username: "user03", password: "pwd03"});
              done();
            });
          });
        });
      });

      describe("Non-auto increment", function() {
        var cx = drv.createConnection({database: "odba"});
        var tab;

        beforeEach(function(done) {
          cx.createDatabase(schema, done);
        });

        beforeEach(function(done) {
          cx.open(function(error, db) {
            db.findTable("user", function(error, table)  {
              tab = table;
              done();
            });
          });
        });

        afterEach(function(done) {
          cx.close(done);
        });

        afterEach(function(done) {
          cx.dropDatabase(done);
        });

        it("insert()", function() {
          (function() {
            tab.insert();
          }).should.throwError("Object(s) to insert expected.");
        });

        it("insert(null, callback)", function(done) {
          tab.insert(null, function(error) {
            error.message.should.be.eql("Object to insert can't be null or undefined.");
            done();
          });
        });

        it("insert(record, callback)", function(done) {
          tab.insert({userId: 1, username: "user01", password: "pwd01"}, function(error) {
            should.assert(error === undefined);

            tab.count(function(error, count) {
              should.assert(error === undefined);
              count.should.be.eql(1);
              done();
            });
          });
        });

        it("insert(records, callback)", function(done) {
          tab.insert(RECORDS, function(error) {
            should.assert(error === undefined);

            tab.count(function(error, count) {
              should.assert(error === undefined);
              count.should.be.eql(3);
              done();
            });
          });
        });

        it("insert([], callback)", function(done) {
          tab.insert([], done);
        });

        it("insert(record)", function(done) {
          tab.insert({userId: 1, username: "user01", password: "pwd01"});

          setTimeout(function() {
            tab.count(function(error, count) {
              should.assert(error === undefined);
              count.should.be.eql(1);
              done();
            });
          }, 1000);
        });

        it("insert(records)", function(done) {
          tab.insert(RECORDS);

          setTimeout(function() {
            tab.count(function(error, count) {
              should.assert(error === undefined);
              count.should.be.eql(3);
              done();
            });
          }, 1000);
        });

        it("insert(record, callback) - No key path specified", function(done) {
          tab.insert({username: "user01", password: "pwd01"}, function(error) {
            error.should.be.instanceOf(Error);
            done();
          });
        });

        it("insert(records, callback) - Some record without key path", function(done) {
          tab.insert([
            {userId: 1, username: "user01", password: "pwd01"},
            {username: "user02", password: "pwd02"},
            {userId: 3, username: "user03", password: "pwd03"}
          ], function(error) {
            error.should.be.instanceOf(Error);

            tab.count(function(error, count) {
              should.assert(error === undefined);
              count.should.be.eql(0);
              done();
            });
          });
        });

        it("insert(record, callback) - Existing key path", function(done) {
          tab.insert(RECORDS, function(error) {
            should.assert(error === undefined);

            tab.insert({userId: 2, username: "user04", password: "pwd04"}, function(error) {
              error.should.be.instanceOf(Error);
              done();
            });
          });
        });
      });
    });

    describe("#save()", function() {
      var cx = drv.createConnection({database: "odba"});
      var tab;

      beforeEach(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(function(error, db) {
          db.findTable("user", function(error, table) {
            tab = table;
            done();
          });
        });
      });

      beforeEach(function(done) {
        tab.insert(RECORDS, done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("save()", function() {
        (function() {
          tab.save();
        }).should.throwError("Object to update expected.");
      });

      it("save(callback)", function() {
        (function() {
          tab.save(function() {});
        }).should.throwError("Object to update expected.");
      });

      it("save(record)", function(done) {
        tab.save({userId: 1, username: "USER01", password: "pwd01"});

        setTimeout(function() {
          tab.findOne({userId: 1}, function(error, record) {
            should.assert(error === undefined);
            record.should.be.eql({userId: 1, username: "USER01", password: "pwd01"});
            done();
          });
        }, 1000);
      });

      it("save(record, callback)", function(done) {
        tab.save({userId: 2, username: "USER02", password: "pwd02"}, function(error) {
          tab.findOne({userId: 2}, function(error, record) {
            should.assert(error === undefined);
            record.should.be.eql({userId: 2, username: "USER02", password: "pwd02"});
            done();
          });
        });
      });
    });

    describe("#remove()", function() {
      var cx= drv.createConnection({database: "odba"});
      var tab;

      beforeEach(function(done) {
        cx.createDatabase(schema, done);
      });

      beforeEach(function(done) {
        cx.open(function(error, db) {
          db.findTable("user", function(error, table) {
            tab = table;
            done();
          });
        });
      });

      beforeEach(function(done) {
        tab.insert(RECORDS, done);
      });

      afterEach(function(done) {
        cx.close(done);
      });

      afterEach(function(done) {
        cx.dropDatabase(done);
      });

      it("remove()", function(done) {
        tab.remove();

        setTimeout(function() {
          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(0);
            done();
          });
        }, 1000);
      });

      it("remove(callback)", function(done) {
        tab.remove(function(error) {
          should.assert(error === undefined);

          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(0);
            done();
          });
        });
      });

      it("remove(where)", function(done) {
        tab.remove({userId: 3});

        setTimeout(function() {
          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(2);
            done();
          });
        }, 1000);
      });

      it("remove(where) - No rows matched", function(done) {
        tab.remove({userId: 111});

        setTimeout(function() {
          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(3);
            done();
          });
        }, 1000);
      });

      it("remove(where, callback)", function(done) {
        tab.remove({userId: 2}, function(error) {
          should.assert(error === undefined);

          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(2);
            done();
          });
        });
      });

      it("remove(where, callback) - No rows matched", function(done) {
        tab.remove({userId: 111}, function(error) {
          should.assert(error === undefined);

          tab.count(function(error, count) {
            should.assert(error === undefined);
            count.should.be.eql(3);
            done();
          });
        });
      });
    });
  });
});