require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'jewelry_db',
    user: process.env.DB_USER || 'jewelry_user',
    password: process.env.DB_PASSWORD || 'jewelry_pass',
  },
  migrations: {
    directory: require('path').join(__dirname, '../../../database/migrations'),
    extension: 'js',
  },
  seeds: {
    directory: require('path').join(__dirname, '../../../database/seeds'),
    extension: 'js',
  },
};
