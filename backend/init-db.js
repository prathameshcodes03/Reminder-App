const { initializeDatabase, pingDatabase } = require('./db');
const config = require('./config');

const main = async () => {
  try {
    await initializeDatabase();
    await pingDatabase();
    console.log(`✅ Database "${config.db.database}" is ready`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    process.exit(1);
  }
};

main();
