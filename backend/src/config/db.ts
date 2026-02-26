import knex from 'knex';
import path from 'path';
import os from 'os';

const dbType = process.env.DB_TYPE || 'postgres';

const db = dbType === 'sqlite'
  ? knex({
      client: 'better-sqlite3',
      connection: {
        filename: process.env.SQLITE_PATH || path.join(os.homedir(), '.jewelry-manager', 'data.db'),
      },
      useNullAsDefault: true,
    })
  : knex({
      client: 'postgresql',
      connection: process.env.DATABASE_URL || {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'jewelry_db',
        user: process.env.DB_USER || 'jewelry_user',
        password: process.env.DB_PASSWORD || 'jewelry_pass',
      },
      pool: { min: 2, max: 10 },
    });

export default db;
