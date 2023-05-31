const sqlite3 = require('sqlite3').verbose();
const dbPath = './voccy.db'; // SQLiteデータベースファイルのパス
const db = new sqlite3.Database(dbPath);

const createTable = `
CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT,
    last_result TEXT,
    result TEXT,
    last_test_timestamp TEXT
)`;

db.run(createTable, error => {
    if (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } else {
        console.log("Table created successfully or it already exists");
        
        const sql = 'INSERT INTO flashcards (question, answer) VALUES (?, ?)';
        db.run(sql, [questionInput, answerInput], function (error) {
            if (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json({ success: true });
            }
        });
    }
});

function callback (error) {
    if (!error) return; 
    console.error('Error creating table:', error);
    throw new Error(error);
}

// コールバック関数を第二引数に取る非同期関数をPromiseでラップする
function initializeDB(arg1, callback) {
    return new Promise((resolve, reject) => {
      // 非同期処理の内容
      db.run(createTable, callback);
  
      // 成功時の処理
      const result = doSomething(arg1);
      resolve(result);
  
      // エラー時の処理
      const error = new Error('Something went wrong');
      reject(error);
    });
  }
  
  // async/awaitを使用して非同期処理を扱う
  async function doSomethingAsync(arg1) {
    try {
      const result = await someAsyncFunction(arg1);
      // 成功時の処理
      console.log(result);
    } catch (error) {
      // エラー時の処理
      console.error(error);
    }
  }

  

// const createTable = `
// CREATE TABLE IF NOT EXISTS app_settings (
//   option1 TEXT,
//   option2 INTEGER,
//   previousStatus TEXT,
//   scheduledTestDate TEXT,
//   CONSTRAINT single_row CHECK ((SELECT COUNT(*) FROM app_settings) <= 1)
// )`;
// db.run(createTable);
