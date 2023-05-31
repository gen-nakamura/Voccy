const sqlite3 = require('sqlite3').verbose();
const dbPath = './voccy.db'; // SQLiteデータベースファイルのパス
const db = new sqlite3.Database(dbPath);

const createFlashcardsTable = `
CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT,
    last_result TEXT,
    result TEXT,
    last_test_timestamp TEXT
)`;
const insertSQL = 'INSERT INTO flashcards (question, answer) VALUES (?, ?)';

function insertData(questionInput, answerInput) {
  console.log('insert');
  return new Promise((resolve, reject) => {
    db.run(insertSQL, [questionInput, answerInput], error => {
      if (error) {
        reject(error);
      } else {
        console.log('inserted successfully');
        resolve();
      }
    });
  })
}

function initializeDB() {
  return new Promise((resolve, reject) => {
    console.log('init');
      db.run(createFlashcardsTable, error => {
        if (error) {
          reject(error);
        } else {
          console.log('table created successfully or it already exists');
          resolve();
        }
      });
    });
  }
  
  // async/awaitを使用して非同期処理を扱う
  async function doSomethingAsync(questionInput, answerInput) {
    console.log('dosomething');
    try {
      await initializeDB();
      await insertData(questionInput, answerInput);
    } catch (error) {
      console.log('catch error in dosth');
      throw new Error(error);
    }
  }

  export { doSomethingAsync }

// const createTable = `
// CREATE TABLE IF NOT EXISTS app_settings (
//   option1 TEXT,
//   option2 INTEGER,
//   previousStatus TEXT,
//   scheduledTestDate TEXT,
//   CONSTRAINT single_row CHECK ((SELECT COUNT(*) FROM app_settings) <= 1)
// )`;
// db.run(createTable);
