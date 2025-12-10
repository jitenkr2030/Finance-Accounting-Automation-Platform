const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
  },
  customerPhone: {
    type: DataTypes.STRING,
  },
  billingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  shippingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Financial amounts
  subTotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  amountPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  amountDue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Status and workflow
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'),
    defaultValue: 'draft',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
    defaultValue: 'pending',
  },
  
  // Recurring billing
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurringTemplateId: {
    type: DataTypes.UUID,
  },
  nextInvoiceDate: {
    type: DataTypes.DATEONLY,
  },
  
  // Terms and conditions
  terms: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  
  // Attachments and metadata
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Audit trail
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.UUID,
  },
}, {
  tableName: 'invoices',
});

const InvoiceLineItem = sequelize.define('InvoiceLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1,
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'NOS',
  },
  rate: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'invoice_line_items',
});

const RecurringInvoice = sequelize.define('RecurringInvoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  templateName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
  },
  nextInvoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastGenerated: {
    type: DataTypes.DATEONLY,
  },
  totalInvoicesGenerated: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Template data
  templateData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'recurring_invoices',
});

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  paymentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Payment method details
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'netbanking', 'neft', 'rtgs', 'imps'),
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  bankName: {
    type: DataTypes.STRING,
  },
  chequeNumber: {
    type: DataTypes.STRING,
  },
  chequeDate: {
    type: DataTypes.DATEONLY,
  },
  
  // Online payment details
  gatewayName: {
    type: DataTypes.STRING,
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'payments',
});

const Estimate = sequelize.define('Estimate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  estimateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  estimateDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
  },
  customerPhone: {
    type: DataTypes.STRING,
  },
  billingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Financial amounts
  subTotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'),
    defaultValue: 'draft',
  },
  
  // Conversion to invoice
  convertedToInvoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  invoiceId: {
    type: DataTypes.UUID,
  },
  
  terms: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'estimates',
});

module.exports = {
  Invoice,
  InvoiceLineItem,
  RecurringInvoice,
  Payment,
  Estimate,
};