const mysql = require('mysql2');

const db = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: 'IronMan@Data!03',   // ← change this to your MySQL password
  database: 'remindme_db',
  waitForConnections: true,
  connectionLimit: 10,
});

const dbPromise = db.promise();

dbPromise.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch(err => console.error('❌ MySQL connection error:', err.message));

module.exports = dbPromise;
