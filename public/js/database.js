const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // In-memory database

// Create Users table
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");

  // Insert sample users
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run('John Doe', 'john.doe@example.com');
  stmt.run('Jane Smith', 'jane.smith@example.com');
  stmt.finalize();
});

module.exports = db;