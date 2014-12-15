describe("Transaction", function() {
  var drv = odba.Driver.getDriver("IndexedDB");

  describe("Handlers", function() {
    describe("Complete handler", function() {
      var cx = drv.createConnection({database: "odba"});

      before(function(done) {
        cx.createDatabase(schema, done);
      });

      after(function(done) {
        cx.dropDatabase(done);
      });
    });
  });
});