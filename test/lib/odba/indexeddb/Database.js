describe("odba.indexeddb.IndexedDBDatabase", function() {
  var IndexedDBConnection = odba.indexeddb.IndexedDBConnection;
  var drv;

  before(function() {
    drv = odba.Driver.getDriver("IndexedDB");
  });

  describe("Properties", function() {
    var cx, db;

    before(function() {
      cx = drv.createConnection({database: "odba"});
    });

    before(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    before(function(done) {
      cx.server.createDatabase("odba", undefined, done);
    });

    before(function(done) {
      cx.open(function(error) {
        db = cx.database;
        done();
      });
    });

    after(function(done) {
      cx.close(done);
    });

    after(function(done) {
      cx.server.dropDatabase("odba", done);
    });

    it("name", function() {
      db.name.should.be.eql("odba");
    });

    it("version", function() {
      db.version.should.be.eql(1);
    });

    it("native", function() {
      should.assert(!!db.native);
    });

    it("connection", function() {
      db.connection.should.be.instanceOf(IndexedDBConnection);
    });
  });
});