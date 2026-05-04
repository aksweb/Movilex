// app/main/db/index.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const userData = app.getPath('userData');
const dbPath = path.join(userData, 'Movilex.db');

const db = new Database(dbPath);

// initialize schema
const schema = fs.readFileSync(
  path.join(__dirname, 'schema.sql'),
  'utf-8'
);

db.exec(schema);

module.exports = db;