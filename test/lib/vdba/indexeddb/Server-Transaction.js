describe("vdba.indexeddb.IndexedDBServer (Transaction)", function() {
  var IndexedDBTransaction = vdba.indexeddb.IndexedDBTransaction;
  var drv;

  before(function() {
    drv = vdba.Driver.getDriver("IndexedDB");
  });

  describe("#createDatabase()", function() {
    var cx, svr;

    beforeEach(function() {
      cx = drv.createConnection({database: "vdba"});
      svr = cx.server;
    });

    afterEach(function(done) {
      svr.dropDatabase("vdba", done);
    });

    it("createDatabase(name, ddl, callback)", function(done) {
      svr.createDatabase("vdba", function(db) {
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
    var cx, svr;

    beforeEach(function() {
      cx = drv.createConnection({database: "vdba"});
      svr = cx.server;
    });

    beforeEach(function(done) {
      svr.createDatabase("vdba", schema, done);
    });

    afterEach(function(done) {
      svr.dropDatabase("vdba", done);
    });

    it("alterDatabase(ddl, callback)", function(done) {
      svr.alterDatabase("vdba", function(db) {
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
});