const mysql = require('mysql2/promise');
const config = require('./config');

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT '',
    role VARCHAR(100) DEFAULT 'Student',
    joined VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    iso_date VARCHAR(50) NOT NULL,
    display_date VARCHAR(50) DEFAULT '',
    display_time VARCHAR(50) DEFAULT '',
    is_done TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
];

const ensureIndex = async (tableName, indexName, columnsSql) => {
  const existingIndexes = await query(
    `SELECT 1
     FROM information_schema.statistics
     WHERE table_schema = ?
       AND table_name = ?
       AND index_name = ?
     LIMIT 1`,
    [config.db.database, tableName, indexName]
  );

  if (existingIndexes.length === 0) {
    await appPool.query(`CREATE INDEX ${mysql.escapeId(indexName)} ON ${mysql.escapeId(tableName)} (${columnsSql})`);
  }
};

const ensureColumn = async (tableName, columnName, definitionSql) => {
  const existingColumns = await query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = ?
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [config.db.database, tableName, columnName]
  );

  if (existingColumns.length === 0) {
    await appPool.query(`ALTER TABLE ${mysql.escapeId(tableName)} ADD COLUMN ${definitionSql}`);
  }
};

const rootPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
});

const appPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
});

const initializeDatabase = async () => {
  const databaseName = mysql.escapeId(config.db.database);
  await rootPool.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

  for (const statement of schemaStatements) {
    await appPool.query(statement);
  }

  await ensureColumn('users', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await ensureColumn('reminders', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await ensureIndex('users', 'idx_users_email', 'email');
  await ensureIndex('reminders', 'idx_reminders_user_id', 'user_id');
  await ensureIndex('reminders', 'idx_reminders_user_due_date', 'user_id, iso_date');
};

const pingDatabase = async () => {
  await appPool.query('SELECT 1');
};

const query = async (sql, params = []) => {
  const [rows] = await appPool.execute(sql, params);
  return rows;
};

const run = async (sql, params = []) => {
  const [result] = await appPool.execute(sql, params);
  return result;
};

const getPool = () => appPool;

module.exports = {
  getPool,
  initializeDatabase,
  pingDatabase,
  query,
  run,
};
