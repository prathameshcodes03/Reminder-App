const config = {
  app: {
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    jwtSecret: process.env.JWT_SECRET || 'remindme_secret_key_2025',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'IronMan@Data!03',
    database: process.env.DB_NAME || 'remindme_db',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },
};

module.exports = config;
