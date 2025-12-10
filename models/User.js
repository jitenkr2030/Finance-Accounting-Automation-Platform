const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'accountant', 'auditor', 'manager', 'user'),
    defaultValue: 'user',
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  profilePicture: {
    type: DataTypes.STRING,
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'users',
});

module.exports = User;