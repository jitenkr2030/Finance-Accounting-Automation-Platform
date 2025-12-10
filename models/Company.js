const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  legalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gstNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  panNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  tanNumber: {
    type: DataTypes.STRING,
  },
  cin: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  contactInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  financialYearStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  financialYearEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  baseCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Kolkata',
  },
  industry: {
    type: DataTypes.STRING,
  },
  companySize: {
    type: DataTypes.ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
    defaultValue: 'small',
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise'),
    defaultValue: 'free',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'companies',
});

module.exports = Company;