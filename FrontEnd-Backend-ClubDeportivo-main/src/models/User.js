const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const env = require('../config/env');

class User extends Model {
  async isPasswordValid(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  toSafeJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: sequelize.getDialect() === 'mysql' ? DataTypes.INTEGER.UNSIGNED : DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 150]
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(value) {
        this.setDataValue('email', String(value || '').trim().toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255]
      }
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'coach', 'admin']]
      }
    },
    must_change_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        sports: []
      },
      validate: {
        isValidMetadata(value) {
          if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('metadata must be a valid object');
          }

          if (value.sports && !Array.isArray(value.sports)) {
            throw new Error('metadata.sports must be an array');
          }
        }
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    },
    hooks: {
      async beforeCreate(user) {
        user.password = await bcrypt.hash(user.password, env.bcryptSaltRounds);
      },
      async beforeUpdate(user) {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, env.bcryptSaltRounds);
        }
      }
    }
  }
);

module.exports = User;