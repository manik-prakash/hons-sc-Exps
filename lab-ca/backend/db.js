const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'users.db'));

// Create tables using parameterized schema (safe DDL)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// SECURE: All queries use ? placeholders — no string concatenation (SQLi prevention)
const stmts = {
  createUser: db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)'),
  findUser:   db.prepare('SELECT * FROM users WHERE username = ?'),
  findById:   db.prepare('SELECT id, username FROM users WHERE id = ?'),
  addMessage: db.prepare('INSERT INTO messages (user_id, content) VALUES (?, ?)'),
  getMessages: db.prepare('SELECT m.content, u.username FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.id DESC LIMIT 20'),
};

module.exports = stmts;
