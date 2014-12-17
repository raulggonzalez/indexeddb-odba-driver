describe("odba", function() {
  describe("Namespacing", function() {
    it("odba.Driver", function() {
      odba.should.have.property("Driver");
    });
  });
});