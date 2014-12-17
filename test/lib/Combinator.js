describe("Combinator", function() {
  var combinator = new odba.Combinator();

  var users = [
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"},
    {userId: 3, username: "user03", password: "pwd03"}
  ];

  var sessions = [
    {sessionId: 1, userId: 1, timestamp: new Date(2014, 12, 10)},
    {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
    {sessionId: 3, userId: 1, timestamp: new Date(2014, 12, 11)},
    {sessionId: 4, userId: 1, timestamp: new Date(2014, 12, 12)},
    {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
  ];

  var leftJoin = [
    {userId: 1, username: "user01", password: "pwd01", sessions: [
      {sessionId: 1, userId: 1, timestamp: new Date(2014, 12, 10)},
      {sessionId: 3, userId: 1, timestamp: new Date(2014, 12, 11)},
      {sessionId: 4, userId: 1, timestamp: new Date(2014, 12, 12)}
    ]},
    {userId: 2, username: "user02", password: "pwd02", sessions: [
      {sessionId: 2, userId: 2, timestamp: new Date(2014, 12, 10)},
      {sessionId: 5, userId: 2, timestamp: new Date(2014, 12, 12)}
    ]},
    {userId: 3, username: "user03", password: "pwd03", sessions: [
    ]}
  ];

  describe("#join()", function() {
    it("join(source, target, sourceCol, targetCol, {arrayAgg: value})", function() {
      combinator.join(users, sessions, "userId", "userId", {arrayAgg: "sessions"}).should.be.eql(leftJoin);
    });
  });
});