const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Bank Reconciliation Models
const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current', 'cc', 'od'),
    defaultValue: 'savings',
  },
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  autoReconciliation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'bank_accounts',
});

const BankStatement = sequelize.define('BankStatement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  bankAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  statementDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  closingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalCredits: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalDebits: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  fileName: {
    type: DataTypes.STRING,
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'bank_statements',
});

const BankTransaction = sequelize.define('BankTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  bankAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  statementId: {
    type: DataTypes.UUID,
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referenceNumber: {
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
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  transactionType: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
  },
  isReconciled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reconciledDate: {
    type: DataTypes.DATE,
  },
  matchedWithId: {
    type: DataTypes.UUID, // References journal entry or other transaction
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    defaultValue: 0,
  },
}, {
  tableName: 'bank_transactions',
});

// Fixed Assets Models
const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assetCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  assetName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING,
  },
  
  // Acquisition details
  acquisitionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  originalCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  vendorId: {
    type: DataTypes.UUID,
  },
  vendorName: {
    type: DataTypes.STRING,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
  },
  warrantyExpiry: {
    type: DataTypes.DATEONLY,
  },
  
  // Depreciation
  depreciationMethod: {
    type: DataTypes.ENUM('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production'),
    defaultValue: 'straight_line',
  },
  usefulLife: {
    type: DataTypes.INTEGER, // in years
    allowNull: false,
  },
  salvageValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  rateOfDepreciation: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  
  // Current values
  accumulatedDepreciation: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  bookValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Location and assignment
  location: {
    type: DataTypes.STRING,
  },
  assignedTo: {
    type: DataTypes.UUID,
  },
  department: {
    type: DataTypes.STRING,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'disposed', 'under_maintenance', 'retired'),
    defaultValue: 'active',
  },
  
  // Additional details
  serialNumber: {
    type: DataTypes.STRING,
  },
  modelNumber: {
    type: DataTypes.STRING,
  },
  brand: {
    type: DataTypes.STRING,
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Images and documents
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // Custom fields
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'assets',
});

// TDS Models
const TDSRate = sequelize.define('TDSRate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  natureOfPayment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ratePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  surchargeRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  cessRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  thresholdLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  effectiveFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  effectiveTo: {
    type: DataTypes.DATEONLY,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'tds_rates',
});

const TDSDeduction = sequelize.define('TDSDeduction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  deductionNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vendorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendorPan: {
    type: DataTypes.STRING,
  },
  
  // Bill details
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  billDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  billAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // TDS calculation
  tdsRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  tdsAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  surchargeAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cessAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalTDS: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Payment details
  paymentDate: {
    type: DataTypes.DATEONLY,
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  netPaymentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Challan details
  challanNumber: {
    type: DataTypes.STRING,
  },
  bsrCode: {
    type: DataTypes.STRING,
  },
  dateOfPayment: {
    type: DataTypes.DATEONLY,
  },
  
  // Filing status
  returnFiled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  returnPeriod: {
    type: DataTypes.STRING, // Format: YYYY-MM
  },
  
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'tds_deductions',
});

module.exports = {
  BankAccount,
  BankStatement,
  BankTransaction,
  Asset,
  TDSRate,
  TDSDeduction,
};