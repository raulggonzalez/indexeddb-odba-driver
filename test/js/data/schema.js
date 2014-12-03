function schema(db) {
  db.createTables([
    {name: "user", keyPath: "userId"},
    {name: "session", keyPath: "sessionId"}
  ]);
}

function indexedSchema(db) {
  db.createTables([
    {name: "user", keyPath: "userId"},
    {name: "session", keyPath: "sessionId"}
  ], function() {
    db.createIndex("user", "ix_username", "username", {unique: true});
  });
}

function autoIncrementSchema(db) {
  db.createTables([
    {name: "user", keyPath: "userId", autoIncrement: true},
    {name: "session", keyPath: "sessionId", autoIncrement: true}
  ]);
}