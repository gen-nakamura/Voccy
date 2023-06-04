export async function testFunction(db, func, ...args) {
    console.log('\n------------------------------');
    console.log('Start executing the function:');
    console.log('------------------------------');
    await logFlashcardsTable(db);
    await logSettingsTable(db);
    console.log('\n------------------------------');
    
    await func(...args);
  }
  
  // flashcardsテーブルの内容をログに出力する関数
  export async function logFlashcardsTable(db) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM flashcards', (error, rows) => {
        if (error) {
          console.error('Error logging flashcards table:', error);
          resolve(error);
        } else {
          console.log('Flashcards Table:');
          console.log(rows);
          resolve();
        }
      });
    });
  }
  
  // settingsテーブルの内容をログに出力する関数
  export async function logSettingsTable(db) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM settings', (error, rows) => {
        if (error) {
          console.error('Error logging settings table:', error);
          resolve(error);
        } else {
          console.log('Settings Table:');
          console.log(rows);
          resolve();
        }
      });
    });
  }
  