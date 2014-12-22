describe("odba.Driver", function() {
  var Driver = odba.Driver;
  var IndexedDBDriver = odba.indexeddb.IndexedDBDriver;
  var IndexedDBConnection = odba.indexeddb.IndexedDBConnection;

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

    it("createConnection({database: 'odba'})", function() {
      var cx = drv.createConnection({database: "odba"});

      cx.should.be.instanceOf(IndexedDBConnection);
      cx.config.should.be.eql({database: "odba"});
    });
  });

  describe("#openConnection()", function() {
    var drv;

    before(function() {
      drv = Driver.getDriver("IndexedDB");
    });

    after(function(done) {
      drv.createConnection({database: "odba"}).server.dropDatabase("odba", done);
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
      drv.openConnection({database: "odba"}, function(error, cx) {
        should.assert(error === undefined);
        cx.should.be.instanceOf(IndexedDBConnection);
        cx.connected.should.be.eql(true);
        cx.close(done);
      });
    });
  });
});