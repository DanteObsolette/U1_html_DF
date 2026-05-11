const { Sequelize } = require('sequelize');
const env = require('./env');

const commonOptions = {
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

let sequelize;

if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.db.storage,
    ...commonOptions
  });
} else if (env.db.dialect === 'mysql') {
  sequelize = new Sequelize(env.db.name, env.db.username, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    dialectOptions: {
      decimalNumbers: true
    },
    ...commonOptions
  });
} else {
  throw new Error(`DB_DIALECT no soportado: ${env.db.dialect}`);
}

module.exports = sequelize;
