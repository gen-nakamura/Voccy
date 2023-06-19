const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');
const path = require('path');
const dbPath = path.join(app.getPath('userData'), './voccy.db'); // SQLiteデータベースファイルのパス
const db = new sqlite3.Database(dbPath);
import { calculateNextTestTimestamp, formatDateNow, convertToBindParameters } from './logic';
import { testFunction, logFlashcardsTable, logSettingsTable } from './test';
import { scheduleNextNotification } from './notify';
const version = require('/package.json').version;
import { releaseNotes } from './releaseNotes';

const createNotifiedVersionsSQL = `
CREATE TABLE IF NOT EXISTS notified_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT UNIQUE
  );`;
const ifVersionHasNotified = `SELECT EXISTS (SELECT 1 FROM notified_versions WHERE version = ?) AS result`;
const addNotifiedVersion = 'INSERT INTO notified_versions (version) VALUES (?);'
const createRecordsSQL = `
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT,
  timestamp TEXT,
  flashcard_id INTEGER,
  FOREIGN KEY (flashcard_id) REFERENCES flashcards (id)
  );`;
const insertNewRecordSQL = `INSERT INTO records (event, timestamp, flashcard_id) VALUES (?, ?, ?);`;
const createFlashcardsSQL = `
CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT,
    previous_result TEXT,
    latest_result TEXT,
    latest_test_timestamp TEXT,
    scheduled_test_timestamp TEXT
    )`;
const insertQnASQL = 'INSERT INTO flashcards (question, answer, latest_test_timestamp) VALUES (?, ?, ?)';
const createSettingsSQL = `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      remind_enabled INTEGER,
      remind_times TEXT,
      max_test_nums INTEGER
  );`
const updateSettingsSQL = `
  UPDATE settings
  SET remind_times = $remind_times,
      remind_enabled = $remind_enabled,
      max_test_nums = $max_test_nums
  WHERE id = 1`
const insertSettingsSQL = `
  INSERT OR IGNORE INTO settings (id, remind_times, remind_enabled, max_test_nums)
  VALUES (1, '["07:00", "13:00", "19:00"]', 1, 10);`;
const insertFlashcardsFVSQL = `
INSERT OR IGNORE INTO flashcards (id, question, answer, previous_result, latest_result, latest_test_timestamp, scheduled_test_timestamp)
VALUES (1, 'This is a Question. Click to show an Answer', 'This is an Answer! You are ready to start.\n\n Click the check circle at the very right.', 'check', 'check', '2022-01-01 12:00', '2022-01-01 15:00');
`;
const updateFlashcardSQL = `
  UPDATE flashcards
  SET question = $question,
  answer = $answer,
  previous_result = $previous_result,
  latest_result = $latest_result,
  latest_test_timestamp = $latest_test_timestamp,
  scheduled_test_timestamp = $scheduled_test_timestamp
  WHERE id = $id
`;
const recordTestResultsSQL = `
  UPDATE flashcards
  SET previous_result = $previous_result, latest_result = $latest_result, latest_test_timestamp = $latest_test_timestamp
  WHERE id = $id
`;
const deleteFlashcardSQL = `DELETE FROM flashcards WHERE id = ?`;
const getSettingsSQL = 'SELECT * FROM settings WHERE id = 1';
const getAllFlashcardsSQL = 'SELECT * FROM flashcards LIMIT ?';
const getQuizSetsSQL = `SELECT * FROM flashcards WHERE scheduled_test_timestamp IS NOT NULL AND scheduled_test_timestamp < strftime('%Y-%m-%d %H:%M', 'now') ORDER BY datetime(scheduled_test_timestamp) ASC LIMIT ?;`;
const getFlashcardSQL = 'SELECT * FROM flashcards WHERE id = ?';

// NotifiedVersions table
function createNotifiedVersionsTable() {
  return new Promise((resolve, reject) => {
    console.log('createNotifiedVersionsTable');
    db.run(createNotifiedVersionsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('notified_versions table created successfully or it already exists');
        resolve();
      }
    })
  })
}

function versionNotifyOrIgnore() {
  return new Promise((resolve, reject) => {
    console.log('versionNotifyOrIgnore');
    db.get(ifVersionHasNotified, [version], (err, row) => {
      if (err) {
        reject(err);
      } else {
        const result = row.result;
        // console.log(`バージョン ${version} の存在: ${result === 1 ? '存在する' : '存在しない'}`);
        if (result) {
          resolve(null);
        } else if (!(releaseNotes[version])) {
          console.log('there is no release note');
          resolve(null);
        } else {
          db.run(addNotifiedVersion, [version], error => {
            if (error) {
              reject(error);
            } else {
              console.log('added notified version successfully');
              resolve(releaseNotes[version]);
            }
          })
        }
      }
    });
  })
}

// Records table
function createRecordsTable() {
  return new Promise((resolve, reject) => {
    console.log('createRecordsTable');
    db.run(createRecordsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('records table created successfully or it already exists');
        resolve();
      }
    })
  })
}

function insertNewRecord(event, flashcard_id) {
  return new Promise((resolve, reject) => {
    console.log('insertNewRecord');
    db.run(insertNewRecordSQL, [event, formatDateNow(), flashcard_id], error => {
      if (error) {
        reject(error);
      } else {
        console.log('inserted a new record successfully');
        resolve();
      }
    });
  })
}

// Settings table
function createSettingsTable() {
  return new Promise((resolve, reject) => {
    console.log('createSettingsTable');
    db.run(createSettingsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('settings table created successfully or it already exists');
        resolve();
      }
    });
  });
}

function insertSettingsFirstValue() {
  return new Promise((resolve, reject) => {
    console.log('insertSettingsFirstValue');
    db.run(insertSettingsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('inserted settings first value successfully');
        resolve();
      }
    });
  });
}

function updateSettings(settings) {
  return new Promise((resolve, reject) => {
    console.log('updateSettings');
    db.run(updateSettingsSQL, convertToBindParameters(settings), error => {
      if (error) {
        reject(error);
      } else {
        console.log('updated settings successfully');
        resolve();
      }
    });
  });
}

function getSettings() {
  return new Promise((resolve, reject) => {
    console.log('getSettings');
    db.get(getSettingsSQL, function (error, data) {
      if (error || data === undefined) {
        reject(error);
      } else {
        console.log('got settings successfully');
        resolve(data);
      }
    })
  })
}

// Flashcards table
function createFlashcardsTable() {
  return new Promise((resolve, reject) => {
    console.log('createFlashcardsTable');
    db.run(createFlashcardsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('flashcards table created successfully or it already exists');
        resolve();
      }
    });
  });
}

function insertFlashcardsFirstValue() {
  return new Promise((resolve, reject) => {
    console.log('insertFlashcardsFirstValue');
    db.run(insertFlashcardsFVSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log('inserted flashcards first value successfully');
        resolve();
      }
    });
  });
}

function getSinglsFlashcard(id) {
  return new Promise((resolve, reject) => {
    db.get(getFlashcardSQL, [id], function (error, row) {
      if (error) {
        console.error('Error retrieving inserted record:', error);
        reject(error);
      }
      resolve(row);
    });
  })
}

function getAllFlashcards(limit) {
  return new Promise((resolve, reject) => {
    console.log('getAllFlashcardsTable');
    db.all(getAllFlashcardsSQL, [limit], function (error, data) {
      if (error || data.length === 0) {
        reject(error);
      } else {
        console.log('got all the flashcards successfully');
        resolve(data);
      }
    });
  });
}

function insertQnA(question, answer) {
  console.log('InsertQnA');
  return new Promise((resolve, reject) => {
    db.run(insertQnASQL, [question, answer, formatDateNow()], async function (error) {
      if (error) {
        reject(error);
      } else {
        console.log('inserted QnA successfully');
        const data = await getSinglsFlashcard(this.lastID);
        resolve(data);
      }
    });
  })
}

function updateFlashcard(flashcard) {
  return new Promise((resolve, reject) => {
    console.log('updateFlashcard');
    db.run(updateFlashcardSQL, convertToBindParameters(flashcard), error => {
      if (error) {
        reject(error);
      } else {
        console.log('updated flashcard successfully');
        resolve();
      }
    });
  });
}

function recordTestResults(testRecords) {
  return new Promise((resolve, reject) => {
    console.log('recordTestResult');
    db.run(recordTestResultsSQL, convertToBindParameters(testRecords), async function (error) {
      if (error) {
        reject(error);
      } else {
        console.log('recorded test results successfully');
        const data = await getSinglsFlashcard(testRecords.id);
        resolve(data);
      }
    });
  });
}

function deleteFlashcard(id) {
  return new Promise((resolve, reject) => {
    console.log('deleteFlashCard');
    db.run(deleteFlashcardSQL, [id], error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getQuizSets() {
  return new Promise(async (resolve, reject) => {
    console.log('getQuizSets');
    const { max_test_nums } = await getSettings();
    db.all(getQuizSetsSQL, [max_test_nums], function (error, data) {
      if (error) {
        reject(error);
      } else {
        console.log('this is quizsets');
        console.log(data);
        resolve(data);
      }
    });
  });
}

async function updateAllTheScheduledTestTimestamp() {
  const flashcards = await getAllFlashcards(1000000000);
  return new Promise((resolve, reject) => {
    console.log('updateAllTheScheduledTestTimestamp');
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      flashcards.forEach(flashcard => {
        db.run(updateFlashcardSQL, convertToBindParameters(flashcard), error => {
          if (error) {
            console.error(error);
          } else {
            // console.log('updated flashcard successfully');
          }
        });
      });

      db.run('COMMIT', [], err => {
        if (err) {
          reject(err);
          console.error(err);
          return;
        }
        console.log('All records updated successfully.');
        resolve();
      });
    });
  });
}

async function openTheApp() {
  console.log('open the app');
  try {
    await createSettingsTable();
    await insertSettingsFirstValue();
    await createFlashcardsTable();
    await insertFlashcardsFirstValue();
    await createRecordsTable();
    await createNotifiedVersionsTable();
  } catch (error) {
    console.log('catch error in openTheApp');
    throw new Error(error);
  }
}

async function addANewVocab(question, answer) {
  console.log('add a new vocab');
  try {
    const flashcard = await insertQnA(question, answer);
    const newFlashcard = calculateNextTestTimestamp(flashcard);
    await updateFlashcard(newFlashcard);
    await insertNewRecord('add', flashcard.id);
  } catch (error) {
    console.log('catch error in addANewVocab');
    throw new Error(error);
  }
}

async function changeTheSettings(settings) {
  console.log('change the settings');
  try {
    await updateSettings(settings);
    await updateAllTheScheduledTestTimestamp();
    clearTimeout(process.env.notificationId);
    scheduleNextNotification();
  } catch (error) {
    console.log('catch error in cahngeTheSettings');
    throw new Error(error);
  }
}

async function openTheFlashcardsTest() {
  console.log('open the flashcards test');
  try {
    const data = await getQuizSets();
    return data;
  } catch (error) {
    console.log('catch error in openTheFlashcardsTest');
    throw new Error(error);
  }
}

async function takeTheFlachcardsTest(testRecords) {
  console.log('take the flashcards test');
  try {
    const flashcard = await recordTestResults(testRecords);
    const newFlashcard = calculateNextTestTimestamp(flashcard);
    await updateFlashcard(newFlashcard);
    await insertNewRecord('study', flashcard.id);
  } catch (error) {
    console.log('catch error in takeTheFlashcardsTest');
    throw new Error(error);
  }
}

async function openTheListOfFlashcards(limit) {
  console.log('open the list of flashcards');
  try {
    const flashcards = await getAllFlashcards(limit);
    const settings = await getSettings();
    return { flashcards: flashcards, settings: settings };
  } catch (error) {
    console.log('catch error in openTheListOfFlashcards');
    throw new Error(error);
  }
}

async function deleteTheFlashcard(id) {
  console.log('delete the flashcard');
  try {
    deleteFlashcard(id);
  } catch (error) {
    console.log('catch error in deleteTheFlashcard');
    throw new Error(error);
  }
}

async function updateTheFlashcard(flashcard) {
  console.log('update the flashcard');
  try {
    await updateFlashcard(flashcard);
  } catch (error) {
    console.log('catch error in updateTheFlashcard');
    throw new Error(error);
  }
}
function startTest() {
  db.run('DROP TABLE IF EXISTS settings;', err => {
    db.run('DROP TABLE IF EXISTS flashcards;', async err => {
      try {
        await testFunction(db, openTheApp);
        await testFunction(db, addANewVocab, 'testQuestion1', 'testAnswer1');
        await testFunction(db, addANewVocab, 'testQuestion2', 'testAnswer2');
        await testFunction(db, addANewVocab, 'testQuestion3', 'testAnswer3');
        await testFunction(db, addANewVocab, 'testQuestion4', 'testAnswer4');
        await testFunction(db, addANewVocab, 'testQuestion5', 'testAnswer5');
        await testFunction(db, addANewVocab, 'testQuestion6', 'testAnswer6');
        await testFunction(db, updateTheFlashcard, { id: 1, question: 'updatedQuestion', answer: 'updatedAnswer', previous_result: 'cross', latest_result: 'circle', latest_test_timestamp: '2023-06-03 17:51', scheduled_test_timestamp: '2023-06-03 19:00' });
        await testFunction(db, changeTheSettings, { remind_times: '["07:00", "11:00", "15:00", "19:00", "23:00"]', remind_enabled: 1, max_test_nums: 3 });
        await testFunction(db, openTheFlashcardsTest);
        await testFunction(db, takeTheFlachcardsTest, { id: 3, previous_result: 'circle', latest_result: 'check', latest_test_timestamp: formatDateNow() });
        await testFunction(db, openTheListOfFlashcards, 5);
        await testFunction(db, deleteTheFlashcard, 1);
        await logFlashcardsTable(db);
        await logSettingsTable(db);
      } catch (e) {
        console.log('caught error in test');
        console.error(e);
      }
    });
  });
}

export { openTheApp, addANewVocab, updateTheFlashcard, changeTheSettings, openTheFlashcardsTest, takeTheFlachcardsTest, openTheListOfFlashcards, deleteTheFlashcard, getSettings, getQuizSets, versionNotifyOrIgnore }

// serverで確かめる。テストデータを用意する
// chatGPTに任せる。前後をわかりやすく出力させる