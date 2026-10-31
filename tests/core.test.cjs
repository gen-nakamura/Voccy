const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { openDatabase, validateSettings } = require('../electron/database.cjs');
const { formatLocal, parseLocal, nextTimestamp, reviewResult } = require('../electron/dates.cjs');
const { createReminders, nextDelay } = require('../electron/reminders.cjs');

test('mastery requires the current answer to be check', () => {
  const c = { previous_result: 'check', latest_result: 'check' };
  assert.equal(reviewResult(c, 'cross'), 'cross');
  assert.equal(reviewResult(c, 'circle'), 'circle');
  assert.equal(reviewResult(c, 'check'), 'done');
  assert.equal(reviewResult({ previous_result: 'circle', latest_result: 'check' }, 'check'), 'check');
  assert.equal(nextTimestamp({ latest_result: 'done' }), null);
  assert.throws(() => reviewResult(c, 'done'));
});
test('local timestamp round-trip, leap year, deadline arithmetic', () => {
  assert.equal(formatLocal(parseLocal('2024-02-29 23:59')), '2024-02-29 23:59');
  assert.throws(() => parseLocal('2023-02-29 12:00'));
  assert.throws(() => parseLocal('2026-10-31 25:00'));
  // New York repeats an hour on Nov 1; the review interval is elapsed time.
  const expected = process.env.TZ === 'America/New_York' ? '2026-11-01 02:48' : '2026-11-01 03:48';
  assert.equal(nextTimestamp({ previous_result: null, latest_result: 'cross', latest_test_timestamp: '2026-10-31 23:00' }, () => 0), expected);
  if (process.env.TZ === 'America/New_York') assert.throws(() => parseLocal('2026-03-08 02:30'));
});
test('CRUD, history, review, local due boundary, no destructive reseeding, backup and reopen', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voccy-test-'));
  const file = path.join(dir, 'voccy.db');
  let db;
  try {
    db = await openDatabase(file);
    assert.equal(db.list().flashcards.length, 0);
    const c = db.add({ question: '日本語 <script>', answer: 'line1\nline2' });
    db.edit({ id: c.id, question: 'edited', answer: 'changed', latest_result: 'done' });
    assert.equal(db.list().flashcards[0].latest_result, null);
    const deadline = c.scheduled_test_timestamp;
    assert.equal(db.quiz(deadline).length, 1);
    const before = parseLocal(deadline); before.setMinutes(before.getMinutes() - 1);
    assert.equal(db.quiz(formatLocal(before)).length, 0);
    db.changeSettings({ remind_enabled: 0, remind_times: '[]', max_test_nums: 5 });
    assert.equal(db.list().flashcards[0].scheduled_test_timestamp, deadline);
    const request = { id: c.id, result: 'cross', expected_previous: null, expected_latest: null, expected_timestamp: c.latest_test_timestamp };
    const studied = db.review(request);
    assert.equal(studied.latest_result, 'cross');
    assert.throws(() => db.review(request), /changed/);
    assert.throws(() => db.add({ question: '', answer: 'x' }));
    assert.throws(() => db.edit({ id: 9999, question: 'x', answer: 'x' }));
    db.remove({ id: c.id });
    db.close(); db = null;
    db = await openDatabase(file);
    assert.equal(db.list().flashcards.length, 0); // Never reinsert old sample card ID 1.
    assert.ok(fs.existsSync(db.backupPath));
    const backup = new DatabaseSync(db.backupPath, { readOnly: true });
    assert.equal(backup.prepare('SELECT count(*) n FROM records').get().n, 2);
    backup.close();
  } finally { db?.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});
test('legacy schema, extra data and mastered rows survive, WAL backup is consistent', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voccy-legacy-'));
  const file = path.join(dir, 'voccy.db');
  const old = new DatabaseSync(file);
  old.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE flashcards(id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT, previous_result TEXT, latest_result TEXT, latest_test_timestamp TEXT, scheduled_test_timestamp TEXT);
    CREATE TABLE settings(id INTEGER PRIMARY KEY, remind_enabled INTEGER, remind_times TEXT, max_test_nums INTEGER);
    CREATE TABLE records(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT, timestamp TEXT, flashcard_id INTEGER, FOREIGN KEY(flashcard_id) REFERENCES flashcards(id));
    CREATE TABLE notified_versions(id INTEGER PRIMARY KEY AUTOINCREMENT,version TEXT UNIQUE);
    INSERT INTO settings VALUES(1,1,'["7:00","19:00"]',10);
    INSERT INTO flashcards VALUES(42,'既存','既存の意味','check','done','2023-06-03 17:51',NULL);
    INSERT INTO notified_versions VALUES(7,'1.5.0');
    INSERT INTO records VALUES(100,'study','2023-06-03 17:51',42);`);
  let db;
  try {
    db = await openDatabase(file);
    assert.equal(db.list().flashcards[0].id, 42);
    assert.equal(db.quiz('2099-01-01 00:00').length, 0);
    assert.ok(db.add({ question: 'new', answer: 'new' }).id > 42);
    const copy = new DatabaseSync(db.backupPath, { readOnly: true });
    assert.equal(copy.prepare('SELECT version FROM notified_versions').get().version, '1.5.0');
    assert.equal(copy.prepare('SELECT count(*) n FROM flashcards').get().n, 1);
    assert.equal(copy.prepare('SELECT count(*) n FROM records').get().n, 1);
    copy.close();
  } finally { db?.close(); old.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});
test('settings reject invalid, empty enabled times and nonpositive limits', () => {
  for (const times of ['["99:00"]', '["12:99"]', '[]', '{}', 'bad']) assert.throws(() => validateSettings({ remind_enabled: 1, remind_times: times, max_test_nums: 10 }));
  assert.throws(() => validateSettings({ remind_enabled: 1, remind_times: '["07:00"]', max_test_nums: 0 }));
  assert.equal(validateSettings({ remind_enabled: 0, remind_times: '[]', max_test_nums: 2 }).remind_enabled, 0);
});
test('reminders cancel on replacement/disable/stop, reject stale callbacks, no zero-delay loop', () => {
  let settings = { remind_enabled: 1, remind_times: '["07:00"]', max_test_nums: 10 };
  const pending = new Map(); let seq = 0; let notified = 0;
  const timers = { setTimeout: (fn, delay) => { assert.ok(delay > 0 && delay <= 90000000); pending.set(++seq, fn); return seq; }, clearTimeout: key => pending.delete(key) };
  const scheduler = createReminders({ settings: () => settings, quiz: () => [1] }, n => { notified += n; }, timers);
  scheduler.schedule(); const stale = [...pending.values()][0];
  scheduler.schedule(); assert.equal(pending.size, 1); stale(); assert.equal(notified, 0);
  const callback = [...pending.values()][0]; pending.clear(); callback(); assert.equal(notified, 1); assert.equal(pending.size, 1);
  settings = { ...settings, remind_enabled: 0 }; scheduler.schedule(); assert.equal(pending.size, 0);
  settings = { ...settings, remind_enabled: 1, remind_times: '[]' }; scheduler.schedule(); assert.equal(pending.size, 0);
  scheduler.stop();
  assert.equal(nextDelay([], new Date()), null);
  // Daily reminders follow local wall time, so the autumn DST day is 25h.
  assert.equal(nextDelay(['07:00'], new Date(2026, 9, 31, 7, 0)), process.env.TZ === 'America/New_York' ? 90000000 : 86400000);
});
