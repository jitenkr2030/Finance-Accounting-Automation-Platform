const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChartOfAccounts = sequelize.define('ChartOfAccounts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.ENUM(
      'asset', 'liability', 'equity', 'revenue', 'expense', 'cogs', 'other_income', 'other_expense'
    ),
    allowNull: false,
  },
  accountSubType: {
    type: DataTypes.STRING,
  },
  parentAccountId: {
    type: DataTypes.UUID,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isSystemAccount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'chart_of_accounts',
});

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  entryNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalDebit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalCredit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('draft', 'posted', 'reversed'),
    defaultValue: 'draft',
  },
  postedBy: {
    type: DataTypes.UUID,
  },
  postedAt: {
    type: DataTypes.DATE,
  },
  isBalanced: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  source: {
    type: DataTypes.ENUM('manual', 'gst', 'billing', 'payroll', 'expense', 'inventory', 'bank', 'import'),
    defaultValue: 'manual',
  },
  sourceId: {
    type: DataTypes.UUID,
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'journal_entries',
});

const JournalLineItem = sequelize.define('JournalLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  journalEntryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  debitAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  creditAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isBalancingLine: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  referenceType: {
    type: DataTypes.STRING, // invoice, bill, payment, etc.
  },
  referenceId: {
    type: DataTypes.UUID,
  },
  customerId: {
    type: DataTypes.UUID,
  },
  vendorId: {
    type: DataTypes.UUID,
  },
}, {
  tableName: 'journal_line_items',
});

module.exports = {
  ChartOfAccounts,
  JournalEntry,
  JournalLineItem,
};