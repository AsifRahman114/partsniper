// db.js
// ------------------------------------------------------------
// Thin DB adapter. Exposes the same `query(sql, params) -> {rows}`
// shape as `pg`'s Pool, so route/model code is portable to
// PostgreSQL in production by swapping this file's internals
// (see schema.postgres.sql for the production schema).
//
// In this sandbox we run on sql.js (WASM SQLite) because native
// builds (better-sqlite3 / pg) cannot compile here (blocked
// nodejs.org headers download). sql.js needs no native compile.
//
// Differences handled by this adapter:
//  - Converts Postgres-style `$1, $2` placeholders -> `?`
//  - JSONB columns are stored as TEXT (JSON strings) - callers
//    JSON.stringify on write and JSON.parse on read where needed
//  - Persists the DB to disk (partsniper.sqlite) after writes
// ------------------------------------------------------------

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', '..', 'partsniper.sqlite');
const SCHEMA_FILE = path.join(__dirname, 'sandboxSchema.sql');

let SQL = null;
let db = null;

async function init() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    db.run(schema);
    persist();
  }
  return db;
}

function persist() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Convert $1, $2... -> ? and reorder params (sql.js binds positionally with ?)
function toSqliteSql(text) {
  return text.replace(/\$(\d+)/g, '?');
}

/**
 * Mimic node-pg's pool.query(text, params) => { rows, rowCount }
 * Supports SELECT (returns rows) and INSERT/UPDATE/DELETE (returns rowCount).
 * For INSERT ... RETURNING *, we emulate by running insert then selecting last_insert_rowid
 * OR, since our PKs are app-generated UUIDs (TEXT), RETURNING * is emulated by
 * re-selecting on the primary key value passed in params (see helper `insertReturning`).
 */
function query(text, params = []) {
  const sql = toSqliteSql(text);
  const trimmed = sql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT')) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return { rows, rowCount: rows.length };
  } else {
    // INSERT/UPDATE/DELETE
    db.run(sql, params);
    persist();
    return { rows: [], rowCount: db.getRowsModified() };
  }
}

/**
 * Helper for INSERT...RETURNING * pattern (Postgres-style) when the
 * primary key is an app-generated TEXT id located at params[0].
 * Usage: insertReturning(insertSql, params, 'products', 'id', params[0])
 */
function insertReturning(insertSql, params, table, pkCol, pkValue) {
  query(insertSql, params);
  const { rows } = query(`SELECT * FROM ${table} WHERE ${pkCol} = ?`, [pkValue]);
  return { rows, rowCount: rows.length };
}

module.exports = { init, query, insertReturning, getRaw: () => db, persist };
