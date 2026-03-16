const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./quiz.db");

db.serialize(() => {

  /* Create table if not exists */

  db.run(`
  CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT,
    chunk_id TEXT,
    text TEXT
  )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chunk_id TEXT,
    question TEXT,
    type TEXT,
    options TEXT,
    answer TEXT,
    difficulty TEXT
  )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS student_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    question_id INTEGER,
    selected_answer TEXT,
    correct INTEGER
  )
  `);

  /* ---- MIGRATIONS ---- */

  db.run(`ALTER TABLE chunks ADD COLUMN grade INTEGER`, err => {
    if (err && !err.message.includes("duplicate column")) console.error(err);
  });

  db.run(`ALTER TABLE chunks ADD COLUMN subject TEXT`, err => {
    if (err && !err.message.includes("duplicate column")) console.error(err);
  });

  db.run(`ALTER TABLE chunks ADD COLUMN topic TEXT`, err => {
    if (err && !err.message.includes("duplicate column")) console.error(err);
  });
  
  db.run(`ALTER TABLE questions ADD COLUMN source_chunk_id TEXT`, err => {
  if (err && !err.message.includes("duplicate column")) console.error(err);
});


});

module.exports = db;