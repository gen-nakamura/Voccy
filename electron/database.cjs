const { DatabaseSync, backup } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const { formatLocal, nextTimestamp, reviewResult } = require('./dates.cjs');

function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 100000) throw new Error(`${label} must contain 1–100000 characters`);
  return value;
}
function id(value) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error('Invalid card ID');
  return value;
}
function validateSettings(value) {
  const times = typeof value.remind_times === 'string' ? JSON.parse(value.remind_times) : value.remind_times;
  if (!Array.isArray(times) || times.length > 48 || times.some(t => typeof t !== 'string' || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(t))) throw new Error('Remind times must be an array of valid HH:mm values');
  const max = Number(value.max_test_nums);
  if (!Number.isInteger(max) || max < 1 || max > 10000) throw new Error('Max test count must be 1–10000');
  if (![0, 1, false, true].includes(value.remind_enabled)) throw new Error('Invalid reminder flag');
  if (value.remind_enabled && times.length === 0) throw new Error('Enabled reminders need at least one time');
  return { remind_enabled: Number(Boolean(value.remind_enabled)), remind_times: JSON.stringify([...new Set(times)].sort()), max_test_nums: max };
}

async function openDatabase(filename) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const existed = fs.existsSync(filename);
  const db = new DatabaseSync(filename);
  // Legacy sqlite3 did not enforce this foreign key. Keep historical records
  // for deleted cards rather than discarding a user's learning history.
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = OFF');
  let backupPath = null;
  try {
    // Online SQLite backup includes committed WAL contents. Run before ANY schema/data change.
    if (existed) {
      backupPath = `${filename}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      await backup(db, backupPath);
      const check = new DatabaseSync(backupPath, { readOnly: true });
      try {
        if (check.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Backup integrity check failed');
      } finally { check.close(); }
    }
    if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Database integrity check failed');
    db.exec(`
      CREATE TABLE IF NOT EXISTS flashcards (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT, previous_result TEXT, latest_result TEXT, latest_test_timestamp TEXT, scheduled_test_timestamp TEXT);
      CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, remind_enabled INTEGER, remind_times TEXT, max_test_nums INTEGER);
      CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT, timestamp TEXT, flashcard_id INTEGER, FOREIGN KEY (flashcard_id) REFERENCES flashcards(id));
      CREATE TABLE IF NOT EXISTS notified_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, version TEXT UNIQUE);
      INSERT OR IGNORE INTO settings VALUES (1, 1, '["07:00","13:00","19:00"]', 10);
    `);
  } catch (error) { db.close(); throw error; }
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  const transaction = fn => {
    db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); db.exec('COMMIT'); return value; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const card = value => {
    const found = get('SELECT * FROM flashcards WHERE id = ?', id(value));
    if (!found) throw new Error('Card not found');
    return found;
  };
  const settings = () => get('SELECT * FROM settings WHERE id = 1');
  const log = (event, cardId, now) => run('INSERT INTO records (event,timestamp,flashcard_id) VALUES (?,?,?)', event, now, cardId);
  return {
    backupPath,
    close: () => db.close(),
    settings,
    list: () => ({ flashcards: all('SELECT * FROM flashcards ORDER BY id'), settings: settings() }),
    quiz(now = formatLocal()) {
      const max = Number(settings().max_test_nums);
      const limit = Number.isInteger(max) && max > 0 ? Math.min(max, 10000) : 10;
      return all("SELECT * FROM flashcards WHERE (latest_result IS NULL OR latest_result <> 'done') AND scheduled_test_timestamp IS NOT NULL AND scheduled_test_timestamp <= ? ORDER BY scheduled_test_timestamp, id LIMIT ?", now, limit);
    },
    add(value) {
      const question = text(value.question, 'Question');
      const answer = text(value.answer, 'Answer');
      return transaction(() => {
        const now = formatLocal();
        const scheduled = nextTimestamp({ previous_result: null, latest_result: null, latest_test_timestamp: now });
        const result = run('INSERT INTO flashcards (question,answer,latest_test_timestamp,scheduled_test_timestamp) VALUES (?,?,?,?)', question, answer, now, scheduled);
        const cardId = Number(result.lastInsertRowid);
        log('add', cardId, now);
        return card(cardId);
      });
    },
    edit(value) {
      const question = text(value.question, 'Question');
      const answer = text(value.answer, 'Answer');
      card(value.id);
      // Renderer may edit content, never learning history or scheduling fields.
      run('UPDATE flashcards SET question=?, answer=? WHERE id=?', question, answer, value.id);
      return card(value.id);
    },
    remove(value) {
      card(value.id);
      run('DELETE FROM flashcards WHERE id=?', value.id);
      // Preserve historic records, including deleted-card history, as in the old schema.
    },
    review(value) {
      return transaction(() => {
        const old = card(value.id);
        if (old.latest_result === 'done') throw new Error('Card already mastered');
        // Reject duplicated/stale clicks without accepting client-controlled history.
        if (old.previous_result !== value.expected_previous || old.latest_result !== value.expected_latest || old.latest_test_timestamp !== value.expected_timestamp) throw new Error('Card changed; reload the review');
        const now = formatLocal();
        const updated = { ...old, previous_result: old.latest_result, latest_result: reviewResult(old, value.result), latest_test_timestamp: now };
        const scheduled = nextTimestamp(updated);
        run('UPDATE flashcards SET previous_result=?, latest_result=?, latest_test_timestamp=?, scheduled_test_timestamp=? WHERE id=?', updated.previous_result, updated.latest_result, now, scheduled, old.id);
        log('study', old.id, now);
        return card(old.id);
      });
    },
    changeSettings(value) {
      const valid = validateSettings(value);
      run('UPDATE settings SET remind_enabled=?, remind_times=?, max_test_nums=? WHERE id=1', valid.remind_enabled, valid.remind_times, valid.max_test_nums);
      // Settings changes must not randomize all existing review deadlines.
      return settings();
    }
  };
}
module.exports = { openDatabase, validateSettings };
