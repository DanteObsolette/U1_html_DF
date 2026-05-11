const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  rootDir,
  db: {
    dialect: (process.env.DB_DIALECT || 'sqlite').toLowerCase(),
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'frontend_users_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    storage: path.resolve(rootDir, process.env.SQLITE_STORAGE || './storage/database.sqlite')
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10)
};
