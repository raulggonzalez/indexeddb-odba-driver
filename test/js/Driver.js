describe("Driver", function() {
  var Driver = odba.Driver;

  describe("#getDriver()", function() {
    it("getDriver('IndexedDB')", function() {
      var drv = Driver.getDriver("IndexedDB");

      drv.should.be.instanceOf(IndexedDBDriver);
      drv.name.should.be.eql("IndexedDB");
    });

    it("getDriver('Unknown')", function() {
      should.assert(Driver.getDriver("Unknown") === undefined);
    });
  });

  describe("#createConnection()", function() {
    var drv = Driver.getDriver("IndexedDB");

    it("createConnection()", function() {
      (function() {
        drv.createConnection();
      }).should.throwError("Database name expected.");
    });

    it("createConnection({})", function() {
      (function() {
        drv.createConnection({});
      }).should.throwError("Database name expected.");
    });

    it("createConnection({database: 'odba'})", function() {
      var cx = drv.createConnection({database: "odba"});

      cx.should.be.instanceOf(IndexedDBConnection);
      cx.config.should.be.eql({database: "odba"});
    });
  });
});