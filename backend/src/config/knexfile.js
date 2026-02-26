require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const os = require('os');

const dbType = process.env.DB_TYPE || 'postgres';

const pgConfig = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'jewelry_db',
    user: process.env.DB_USER || 'jewelry_user',
    password: process.env.DB_PASSWORD || 'jewelry_pass',
  },
  migrations: {
    directory: path.join(__dirname, '../../../database/migrations'),
    extension: 'js',
  },
  seeds: {
    directory: path.join(__dirname, '../../../database/seeds'),
    extension: 'js',
  },
};

const sqliteConfig = {
  client: 'better-sqlite3',
  connection: {
    filename: process.env.SQLITE_PATH || path.join(os.homedir(), '.jewelry-manager', 'data.db'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../../../database/migrations'),
    extension: 'js',
  },
  seeds: {
    directory: path.join(__dirname, '../../../database/seeds'),
    extension: 'js',
  },
};

module.exports = dbType === 'sqlite' ? sqliteConfig : pgConfig;
