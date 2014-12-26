describe("vdba.indexeddb.IndexedDBDatabase", function() {
  var IndexedDBConnection = vdba.indexeddb.IndexedDBConnection;
  var drv;

  before(function() {
    drv = vdba.Driver.getDriver("IndexedDB");
  });

  describe("Properties", function() {
    var cx, db;

    before(function() {
      cx = drv.createConnection({database: "vdba"});
    });

    before(function(done) {
      cx.server.dropDatabase("vdba", done);
    });

    before(function(done) {
      cx.server.createDatabase("vdba", undefined, done);
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
      cx.server.dropDatabase("vdba", done);
    });

    it("name", function() {
      db.name.should.be.eql("vdba");
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