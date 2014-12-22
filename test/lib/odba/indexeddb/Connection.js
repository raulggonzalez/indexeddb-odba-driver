describe("odba.indexeddb.IndexedDBConnection", function() {
  var IndexedDBDatabase = odba.indexeddb.IndexedDBDatabase;
  var IndexedDBServer = odba.indexeddb.IndexedDBServer;
  var drv, cx;

  before(function() {
    drv = odba.Driver.getDriver("IndexedDB");
    cx = drv.createConnection({database: "odba"});
  });

  before(function(done) {
    cx.server.createDatabase("odba", schema, done);
  });

  after(function(done) {
    cx.server.dropDatabase("odba", done);
  });

  after(function(done) {
    cx.close(done);
  });

  describe("Properties", function() {
    describe("Closed connection", function() {
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

      it("server", function() {
        cx.server.should.be.instanceOf(IndexedDBServer);
      });
    });

    describe("Open connection", function() {
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

  describe("#open()", function() {
    afterEach(function(done) {
      cx.close(done);
    });

    describe("w/connection closed", function() {
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
      beforeEach(function(done) {
        cx.open(done);
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
    describe("w/connection opened", function() {
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