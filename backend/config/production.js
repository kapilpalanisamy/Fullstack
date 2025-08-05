require('dotenv').config();

module.exports = {
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    pool: {
      max: parseInt(process.env.POSTGRES_POOL_MAX) || 20,
      idleTimeoutMillis: parseInt(process.env.POSTGRES_POOL_IDLE_TIMEOUT) || 30000,
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_POOL_CONNECTION_TIMEOUT) || 10000
    },
    ssl: {
      rejectUnauthorized: process.env.POSTGRES_REJECT_UNAUTHORIZED === 'false' ? false : true
    }
  },
  server: {
    port: process.env.PORT || 8080,
    env: 'production'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};
