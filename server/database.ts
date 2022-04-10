import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

const DBSOURCE = "db.sqlite";

let db = new sqlite.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS space (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path text UNIQUE,
            email text,
            code text,
            opt INTEGER,
            CONSTRAINT path_unique UNIQUE (path)
            )`,
      (err) => {
        console.log(err);
      }
    );
  }
});

export default db;
