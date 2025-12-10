const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Employee and approver
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  approverId: {
    type: DataTypes.UUID,
  },
  approverName: {
    type: DataTypes.STRING,
  },
  
  // Expense details
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchantName: {
    type: DataTypes.STRING,
  },
  
  // Amounts
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
  },
  
  // Tax information
  gstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  gstNumber: {
    type: DataTypes.STRING,
  },
  hsnSacCode: {
    type: DataTypes.STRING,
  },
  
  // Status and workflow
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'reimbursed', 'rejected'),
    defaultValue: 'draft',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  
  // Workflow tracking
  submittedAt: {
    type: DataTypes.DATE,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  rejectedAt: {
    type: DataTypes.DATE,
  },
  reimbursedAt: {
    type: DataTypes.DATE,
  },
  
  // Business purpose
  businessPurpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
  },
  department: {
    type: DataTypes.STRING,
  },
  costCenter: {
    type: DataTypes.STRING,
  },
  
  // Location and travel details
  location: {
    type: DataTypes.STRING,
  },
  isTravelExpense: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  travelDetails: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Policy compliance
  policyCompliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  policyViolations: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  
  // Payment details
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'cheque', 'digital_wallet'),
  },
  paymentReference: {
    type: DataTypes.STRING,
  },
  
  // Attachments
  receiptImages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // OCR and AI processing
  ocrProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ocrData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  aiCategorized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Reimbursement
  isReimbursable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reimbursementMethod: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'payroll'),
  },
  reimbursedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
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
  approverComments: {
    type: DataTypes.TEXT,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'expenses',
});

const ExpensePolicy = sequelize.define('ExpensePolicy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  policyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  
  // Policy scope
  applicableTo: {
    type: DataTypes.ENUM('all', 'department', 'designation', 'employee'),
    defaultValue: 'all',
  },
  targetIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  
  // Limits and rules
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING,
  },
  dailyLimit: {
    type: DataTypes.DECIMAL(15, 2),
  },
  monthlyLimit: {
    type: DataTypes.DECIMAL(15, 2),
  },
  perTransactionLimit: {
    type: DataTypes.DECIMAL(15, 2),
  },
  
  // Rate limits for travel
  travelLimits: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  accommodationLimits: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  mealAllowances: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Receipt requirements
  receiptRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  receiptThreshold: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Approval workflow
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  approvalLevels: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  
  // Policy rules
  rules: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  effectiveFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  effectiveTo: {
    type: DataTypes.DATEONLY,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'expense_policies',
});

const ExpenseReport = sequelize.define('ExpenseReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  reportTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Employee details
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Report period
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Status and workflow
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'reimbursed'),
    defaultValue: 'draft',
  },
  
  // Financial summary
  totalExpenses: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  approvedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  reimbursedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Approval workflow
  submittedAt: {
    type: DataTypes.DATE,
  },
  submittedBy: {
    type: DataTypes.UUID,
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  rejectedBy: {
    type: DataTypes.UUID,
  },
  rejectedAt: {
    type: DataTypes.DATE,
  },
  reimbursedBy: {
    type: DataTypes.UUID,
  },
  reimbursedAt: {
    type: DataTypes.DATE,
  },
  
  // Business information
  businessPurpose: {
    type: DataTypes.STRING,
  },
  projectId: {
    type: DataTypes.UUID,
  },
  department: {
    type: DataTypes.STRING,
  },
  costCenter: {
    type: DataTypes.STRING,
  },
  
  // Summary by category
  categoryBreakdown: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
  approverComments: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'expense_reports',
});

const ExpenseReportItem = sequelize.define('ExpenseReportItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  expenseReportId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expenseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Original expense data snapshot
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Approval adjustments
  approvedAmount: {
    type: DataTypes.DECIMAL(15, 2),
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  adjustments: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'expense_report_items',
});

module.exports = {
  Expense,
  ExpensePolicy,
  ExpenseReport,
  ExpenseReportItem,
};