describe("vdba.Driver", function() {
  var Driver = vdba.Driver;
  var IndexedDBDriver = vdba.indexeddb.IndexedDBDriver;
  var IndexedDBConnection = vdba.indexeddb.IndexedDBConnection;

  describe("#getDriver()", function() {
    it("getDriver('IndexedDB')", function() {
      var drv = Driver.getDriver("IndexedDB");

      drv.should.be.instanceOf(IndexedDBDriver);
      drv.name.should.be.eql("IndexedDB");
    });
  });

  describe("#createConnection()", function() {
    var drv;

    before(function() {
      drv = Driver.getDriver("IndexedDB");
    });

    describe("Error handling", function() {
      it("createConnection()", function() {
        (function() {
          drv.createConnection();
        }).should.throwError("Configuration expected.");
      });

      it("createConnection({})", function() {
        (function() {
          drv.createConnection({});
        }).should.throwError("Database name expected.");
      });
    });

    it("createConnection({database: 'vdba'})", function() {
      var cx = drv.createConnection({database: "vdba"});

      cx.should.be.instanceOf(IndexedDBConnection);
      cx.config.should.be.eql({database: "vdba"});
    });
  });

  describe("#openConnection()", function() {
    var drv;

    before(function() {
      drv = Driver.getDriver("IndexedDB");
    });

    after(function(done) {
      drv.createConnection({database: "vdba"}).server.dropDatabase("vdba", done);
    });

    describe("Error handling", function() {
      it("openConnection()", function() {
        (function() {
          drv.openConnection();
        }).should.throwError("Configuration expected.");
      });

      it("openConnection({})", function() {
        (function() {
          drv.openConnection({});
        }).should.throwError("Callback expected.");
      });

      it("openConnection({}, callback)", function() {
        (function() {
          drv.openConnection({}, function() {});
        }).should.throwError("Database name expected.");
      });
    });

    it("openConnection(config, callback)", function(done) {
      drv.openConnection({database: "vdba"}, function(error, cx) {
        should.assert(error === undefined);
        cx.should.be.instanceOf(IndexedDBConnection);
        cx.connected.should.be.eql(true);
        cx.close(done);
      });
    });
  });
});