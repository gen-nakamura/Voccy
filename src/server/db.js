const sqlite3 = require('sqlite3').verbose();
const dbPath = './voccy.db'; // SQLiteデータベースファイルのパス
const db = new sqlite3.Database(dbPath);

const createFlashcardsSQL = `
CREATE TABLE IF NOT EXISTS flashcards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT,
    answer TEXT,
    last_result TEXT,
    result TEXT,
    last_test_timestamp TEXT
    )`;
    const insertQnASQL = 'INSERT INTO flashcards (question, answer) VALUES (?, ?)';
    const createSettingsSQL = `
    CREATE TABLE IF NOT EXISTS settings (
      remind_times TEXT,
      remind_nums INTEGER,
  max_test_nums INTEGER,
  tiemzone TEXT,
  CONSTRAINT single_row CHECK ((SELECT COUNT(*) FROM settings) <= 1)
  )`;
  const updateQnASQL = `UPDATE flashcards SET question = ?, answer = ? WHERE id = ?`;
  const recordTestResultSQL = `UPDATE flashcards SET last_result = ?, result = ?, last_test_timestamp = ? WHERE id = ?`;
  const deleteFlashcardSQL = `DELETE FROM flashcards WHERE id = ?`;
  const updateSettingsSQL = `
  UPDATE settings
  SET remind_times = $remind_times,
      remind_nums = $remind_nums,
      max_test_nums = $max_test_nums,
      timezone = $timezone
  WHERE id = $id
`
  const getSettingsSQL = 'SELECT * FROM settings LIMIT 1';
  const getAllFlashcardsSQL = 'SELECT * FROM flashcards LIMIT ?';
  // TODO - read the F records with some conditions
  // TODO - change status of a record
  
// Settings table
function createSettingsTable() {
  return new Promise((resolve, reject) => {
    console.log('createSettingTable');
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

// needs to be modified→全部この書き方に統一したらわかりやすい説
// const params = {
//   $remind_times: remindTimes,
//   $remind_nums: remindNums,
//   $max_test_nums: maxTestNums,
//   $timezone: timezone,
//   $id: id
// };

function updateSettings() {
  return new Promise((resolve, reject) => {
    console.log('createSettingTable');
      db.run(updateSettingsSQL, params, error => {
        if (error) {
          reject(error);
        } else {
          console.log('settings table created successfully or it already exists');
          resolve();
        }
      });
    });
}
// needs to be modified
function getSettings() {
  return new Promise((resolve, reject) => {
    console.log('get settings');
    db.run(getSettingsSQL, error => {
      if (error) {
        reject(error);
      } else {
        console.log();
        resolve();
      }
    })
  })
}

// Flashcards table
function createFlashcardsTable() {
  return new Promise((resolve, reject) => {
    console.log('createFlashcardsTable');
      db.run(createFlashcardsTable, error => {
        if (error) {
          reject(error);
        } else {
          console.log('flashcards table created successfully or it already exists');
          resolve();
        }
      });
    });
  }
// needs to be modified
function getAllFlashcards() {
  return new Promise((resolve, reject) => {
    console.log('createFlashcardsTable');
      db.run(getAllFlashcardsSQL, error => {
        if (error) {
          reject(error);
        } else {
          console.log('flashcards table created successfully or it already exists');
          resolve();
        }
      });
    });
}
  
function insertQnA(questionInput, answerInput) {
  console.log('InsertQnA');
  return new Promise((resolve, reject) => {
    db.run(insertQnASQL, [questionInput, answerInput], error => {
      if (error) {
        reject(error);
      } else {
        console.log('inserted successfully');
        resolve();
      }
    });
  })
}
// needs to be modified
function updateQnA() {
  return new Promise((resolve, reject) => {
    console.log('updateQnA');
      db.run(updateQnASQL, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
// needs to be modified
function recordTestResult() {
  return new Promise((resolve, reject) => {
    console.log('recordTestResult');
      db.run(recordTestResultSQL, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
}
// needs to be modified
function deleteFlashcard() {
  return new Promise((resolve, reject) => {
    console.log('recordTestResult');
      db.run(deleteFlashcardSQL, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
}
  
  // async/awaitを使用して非同期処理を扱う
  async function doSomethingAsync(questionInput, answerInput) {
    console.log('dosomething');
    try {
      await createFlashcardsTable();
      await createSettingsTable();
      await insertQnA(questionInput, answerInput);
    } catch (error) {
      console.log('catch error in dosth');
      throw new Error(error);
    }
  }

  export { doSomethingAsync }

