# indexeddb-odba-driver

`ODBA` (Open Database API) is an asynchronous API for the JavaScript language
that programmers can use to access data such as databases.
The ODBA philosophy is similar to the `Node.js` API's.

`indexeddb-odba-driver` is the `IndexedDB` driver to use with the browsers.

The unit testing is performed using `Should.js` and `Mocha` on:

  - Chrome.

`Grunt` is used to automate tasks.

The API documentation is in the `doc/api.html.zip` file.

## Terminology

IndexedDB is a key-value database and it uses its own terminology:

- Database = Database
- Object store = Table (SQL) or Collection (MongoDB or CouchDB)
- Record = Row (SQL) or Document (MongoDB or CouchDB)
- Key path = Primary key (SQL) or Id (MongoDB or CouchDB)
- Index = Index

## Use

To use `indexeddb-odba-driver`, we have to include:

  ```
  <script src="indexeddb-odba-driver.min.js"></script>
  ```

## odba namespace

When the driver is included, an `odba` object is created automatically.
This is the API start point.

## Getting the driver

First of all, we have to get the IndexedDB driver:

  ```
  var drv = odba.Driver.getDriver("IndexedDB");
  ```

## Getting the connection

Once we have the driver, the next thing is getting a connection:

  ```
  var cx = drv.createConnection({database: "dbName"});
  ```

## Creating a database

To create a database, we must use the method `Server.createDatabase()` with a closed
connection.

### Creating an empty database

To create an empty database:

  ```
  cx.server.createDatabase("mydb");
  cx.server.createDatabase("mydb", null, function(error) { ... });
  ```

### Creating a non-empty database

To create a database with tables:

  ```
  cx.server.createDatabase("mydb", function(db) { ... });
  cx.server.createDatabase("mydb", function(db) { ... }, function(error) { ... });
  ```

## Dropping databases

We have to use the `Server.dropDatabase()` method to delete a database:

  ```
  cx.server.dropDatabase("mydb");
  cx.server.dropDatabase("mydb", function(error) { ... });
  ```

## Checking whether a database exists

To check whether a database exists, we must use the `Server.hasDatabase()` method:

  ```
  cx.server.hasDatabase("mydb", function(error, exists) { ... });
  ```

## Creating tables (object stores)

To create a table, we use the method `Database.createTable()` whitin the
methods `Server.createDatabase()` or `Server.alterDatabase()`.

During the database creation:

  ```
  //(1) create connection
  var cx = drv.createConnection({database: "mydb"});

  //(2) create database
  cx.server.createDatabase("mydb", function(db) {
    db.createTable("user", {keyPath: "userId"});
    db.createTable("session", {keyPath: "sessionId"});
  }, function(error) {
    //...
  });
  ```

After the database creation:

  ```
  //(1) create connection
  var cx = drv.createConnection({database: "mydb"});

  //(2) alter database
  cx.server.alterDatabase("mydb", function(db) {
    db.createTable("user", {keyPath: "userId"});
    db.createTable("session", {keyPath: "sessionId"});
  }, function(error) {
    //...
  });
  ```

Options:

  - `keyPath` or `id` (String). The key path, the primary key or the id field.
  - `autoIncrement` (Boolean). If the key path is auto increment.

## Dropping tables (object stores)

Dropping a table is easy, we have to use the `Database.dropTable()` into a
`Server.alterDatabase()` method:

  ```
  cx.server.alterDatabase("mydb", function(db) {
    db.dropTable("store");
    db.dropTable("store", function(error) { ... });
  }, function(error) {
    //...
  });
  ```

## Creating indexes

The indexes can be created from a `Database` instance or a `Table` instance. In both cases,
we have to perfom into `Server.createDatabase()` or `Server.alterDatabase()`.

**Important** Nowdays, we only can create simple indexes.

From a `Database` instance:

  ```
  cx.server.createDatabase("mydb", function(db) {
    db.createIndex("user", "ix_username", "username", {unique: true});
    db.createIndex("user", "ix_username", "username", {unique: true}, function(error) { ... });
  });
  ```

From a `Table` instance:

  ```
  cx.server.alterDatabase("mydb", function(db) {
    db.findTable("user", function(error, tab) {
      tab.createIndex("ix_username", "username", {unique: true});
      tab.createIndex("ix_username", "username", {unique: true}, function(error) { ... });
    };
  });
  ```

## Dropping indexes

Similar to tables, in `Server.alterDatabase()` using a `Database` or a `Table`:

  ```
  cx.server.alterDatabase("mydb", function(db) {
    db.dropIndex("store", "index");
    db.dropIndex("store", "index", function(error) { ... });
  });
  ```

## Opening the connection

`Connection.open()` opens the connection:

  ```
  cx.open();
  cx.open(function(error, db) { ... });
  ```

**Important** The connection to create and to alter databases must be closed.
Only the R/W connections must be opened.

## Closing the connection

We have to call the method `Connection.close()`:

  ```
  cx.close();
  cx.close(function(error) { ... });
  ```

## Finding data

First of all, we have to find its table (or object store):

  ```
  db.findTable("user", function(error, table) {
    //...
  });
  ```

Next, we can use `Table.find()`, `Table.findOne()` and `Table.findAll()`:

  ```
  table.find({userId: 1}, function(error, result) {
    //result is an IndexedDBResult instance
  });

  table.findOne({userId: 1}, function(error, record) {
    //record is an object
  });

  table.findAll(function(error, result) {
    //result is an IndexedDBResult instance
  });
  ```

**Important** When the query can be resolved using the key path or an index,
the method uses.

### Result

The methods `find()` and `findAll()` returns an object with the next properties:

  - `length` (Number). The number of records.
  - `rows` (Object[]). The records.
  - `byKey` (Boolean). Whether the query has been resolved using the key path.
  - `byIndex` (Boolean). Whether the query has been resolved using an index.

### Operators

We can use the following operators:

  - `$eq`. Equality (`=`). Example: `{userId: {$eq: 1}}` or simply `{userId: 1}`.
  - `$ne`. Inequality (`!=`). Example: `{username: {$ne: "ecostello"}`.
  - `$lt`. Less than (`<`). Example: `{year: {$lt: 2014}}`.
  - `$le`. Less than or equal (`<=`). Example: `{year: {$le: 2010}}`.
  - `$gt`. Greater than (`>`). Example: `{year: {$gt: 2010}}`.
  - `$gt`. Greater than or equal (`>=`). Example: `{year: {$ge: 2010}}`.
  - `$like`. Like. Example: `{email: {$like: ".*@gmail\.com"}}`.
  - `$notLike`. Not like. Example: `{email: {$notLike: ".*@gmail\.com"}}`.
  - `$in`. In. Example: `{username: {$in: ["ecostello", "elvisc"]}}`.
  - `$notIn`. Not in. Example: `{username: {$notIn: ["costello", "elvisc"]}}`.

## Joining tables (or object stores)

IndexedDB doesn't support joins, this is implemented by the driver.

To join two object stores, we have to use the methods `Table.join()` or `Query.join()`.
Examples:

  ```
  user.join("session", "userId", function(error, result) { ... });
  user.join("session", "userId").find(function(error, result) { ... });
  ```

## Inserting data

Similar to find, but using `Table.insert()`:

  ```
  db.findTable("user", function(error, table) {
    table.insert(
      {userId: 1, username: "user01", password: "pwd01"},
      function(error) { ...  }
    );
  });
  ```

To insert several objects:

  ```
  table.insert([
    {userId: 1, username: "user01", password: "pwd01"},
    {userId: 2, username: "user02", password: "pwd02"}
  ], function(error) {
    //...
  });
  ```

## Updating data

Two methods can be used to update data: `Table.save()` and `Table.update`.

### Saving data

The data save is used to replace an record by other and it's performed using `Table.save()`.
The first argument indicates the record(s) to set, being needed that the
record(s) have the key path.

  ```
  table.save({userId: 1, username: "user01", password: "PwD01"}, function(error) { ... });
  table.save([{...}, {...}, {...}], function(error) { ... });
  ```

### Updating data

We also can use the `Table.update()` method to replace some fields.

  ```
  user.update({userId: 1}, {password: "newPwd"}, function(error) { ... });
  user.update({state: "locked"}, function(error) { ... });
  ```

The update modifiers are:

- `$set` replaces the value by another. Example: `{prop: {$set: newValue}}`, similar to `{prop: newValue}`.
- `$inc` increments the value by the specified number of units. Example: `{prop: {$inc: 1}}`.
- `$dec` decrements the alue by the specified number of units. Example: `{prop: {$dec: 1}}`.
- `$mul` multiplies the value by the specified amount. Example: `{prop: {$mul: 0.5}}`.

## Deleting data

We can use `Table.remove()`:

  ```
  //truncate
  table.remove();
  table.remove(function(error) { ... });

  //delete
  table.remove({userId: 1});
  table.remove({userId: 1}, function(error) { ... });
  ```

## Transactions

IndexedDB is a transactional engine. The driver works in auto-commit mode. If
a bounded transaction needed, we can use the method `Connection.runTransaction`
with a connection opened:

  ```
  cx.runTransaction(mode, function(db) { ... });
  cx.runTransaction(mode, function(db) { ... }, function(error) { ... });
  ```

The transaction mode can be: `readonly` or `readwrite`. The second parameter is a
function with the transaction code. The third parameter is an optional function that
is invoked when the first operation ends.

If the first function ends in success, the transaction is commited. If we want
to abort it, use the method `Transaction.rollback`:

  ```
  cx.transaction.rollback();
  ```

**Important** IndexedDB doesn't support nested transactions.