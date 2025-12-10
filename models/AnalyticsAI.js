const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Audit Trail Models
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oldValues: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  newValues: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  ipAddress: {
    type: DataTypes.STRING,
  },
  userAgent: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('success', 'failure', 'warning'),
    defaultValue: 'success',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'audit_logs',
  timestamps: false,
});

// Compliance Models
const ComplianceTask = sequelize.define('ComplianceTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  taskName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taskType: {
    type: DataTypes.ENUM('gst_return', 'tds_return', 'income_tax', 'audit', 'roc_filing', 'pf_esic', 'professional_tax', 'other'),
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled'),
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  assignedTo: {
    type: DataTypes.UUID,
  },
  assignedToName: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  completionDate: {
    type: DataTypes.DATEONLY,
  },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrencePattern: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  reminderSettings: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'compliance_tasks',
});

// Analytics Models
const KPIDefinition = sequelize.define('KPIDefinition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  kpiName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kpiCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.ENUM('financial', 'operational', 'sales', 'inventory', 'hr', 'compliance'),
    allowNull: false,
  },
  calculationFormula: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
  },
  targetValue: {
    type: DataTypes.DECIMAL(15, 4),
  },
  benchmarkValue: {
    type: DataTypes.DECIMAL(15, 4),
  },
  dataSource: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  refreshFrequency: {
    type: DataTypes.ENUM('real_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    defaultValue: 'daily',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  chartType: {
    type: DataTypes.ENUM('line', 'bar', 'pie', 'gauge', 'metric', 'table'),
    defaultValue: 'line',
  },
  colorScheme: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'kpi_definitions',
});

const KPIData = sequelize.define('KPIData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kpiDefinitionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING, // Format: YYYY-MM-DD or YYYY-MM
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  targetValue: {
    type: DataTypes.DECIMAL(15, 4),
  },
  variance: {
    type: DataTypes.DECIMAL(15, 4),
  },
  variancePercentage: {
    type: DataTypes.DECIMAL(8, 4),
  },
  calculatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'kpi_data',
});

// Document Intelligence Models
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  documentType: {
    type: DataTypes.ENUM('invoice', 'receipt', 'bill', 'bank_statement', 'cheque', 'contract', 'report', 'other'),
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalFileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Processing status
  status: {
    type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'failed', 'archived'),
    defaultValue: 'uploaded',
  },
  ocrProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  aiProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Extracted data
  extractedData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
    defaultValue: 0,
  },
  
  // Validation
  validated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  validationErrors: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  
  // Linked entities
  linkedInvoiceId: {
    type: DataTypes.UUID,
  },
  linkedExpenseId: {
    type: DataTypes.UUID,
  },
  linkedVendorId: {
    type: DataTypes.UUID,
  },
  linkedCustomerId: {
    type: DataTypes.UUID,
  },
  
  // Metadata
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  processedBy: {
    type: DataTypes.UUID,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'documents',
});

// Budget Models
const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  budgetName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fiscalYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived'),
    defaultValue: 'draft',
  },
  totalBudgeted: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalActual: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  variance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  variancePercentage: {
    type: DataTypes.DECIMAL(8, 4),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'budgets',
});

const BudgetLineItem = sequelize.define('BudgetLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
  },
  costCenter: {
    type: DataTypes.STRING,
  },
  
  // Period-wise budget allocation
  january: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  february: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  march: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  april: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  may: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  june: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  july: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  august: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  september: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  october: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  november: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  december: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  
  totalBudgeted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  totalActual: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  variance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  variancePercentage: {
    type: DataTypes.DECIMAL(8, 4),
    defaultValue: 0,
  },
  
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'budget_line_items',
});

module.exports = {
  AuditLog,
  ComplianceTask,
  KPIDefinition,
  KPIData,
  Document,
  Budget,
  BudgetLineItem,
};