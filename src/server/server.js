const express = require('express');
const sqlite3 = require('sqlite3').verbose();

console.log('server.jsだよおおおおおおお\n\n\n');

export function createServer() {
  const server = express();

  server.use(express.json());
  // CORS設定  
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

server.post('/api/data', (req, res) => {
    console.log('get a post request');
    const { questionInput, answerInput } = req.body;

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

});

return server;
};
