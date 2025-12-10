const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GSTInvoice = sequelize.define('GSTInvoice', {
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
  customerGSTNumber: {
    type: DataTypes.STRING,
  },
  customerAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  placeOfSupply: {
    type: DataTypes.STRING,
  },
  reverseCharge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  taxApplicable: {
    type: DataTypes.ENUM('cgst+sgst', 'igst', 'utgst'),
    defaultValue: 'cgst+sgst',
  },
  igstOnIntraState: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  taxableValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  igstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  utgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cessAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalGSTAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  roundOffAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  amountInWords: {
    type: DataTypes.TEXT,
  },
  
  // Status and compliance
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft',
  },
  eInvoiceStatus: {
    type: DataTypes.ENUM('pending', 'generated', 'cancelled', 'error'),
    defaultValue: 'pending',
  },
  eInvoiceNumber: {
    type: DataTypes.STRING,
  },
  eInvoiceDate: {
    type: DataTypes.DATE,
  },
  eWayBillNumber: {
    type: DataTypes.STRING,
  },
  eWayBillDate: {
    type: DataTypes.DATE,
  },
  
  // Transport details for e-way bill
  transportationMode: {
    type: DataTypes.ENUM('road', 'rail', 'air', 'ship'),
  },
  vehicleNumber: {
    type: DataTypes.STRING,
  },
  transportationId: {
    type: DataTypes.STRING,
  },
  
  terms: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  tableName: 'gst_invoices',
});

const GSTLineItem = sequelize.define('GSTLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gstInvoiceId: {
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
  hsnSacCode: {
    type: DataTypes.STRING,
    allowNull: false,
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
  taxableValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // GST rates and amounts
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  igstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  igstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  utgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  utgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cessRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  cessAmount: {
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
  isService: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  placeOfSupply: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'gst_line_items',
});

const GSTReturn = sequelize.define('GSTReturn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  returnType: {
    type: DataTypes.ENUM('GSTR1', 'GSTR2', 'GSTR3B', 'GSTR4', 'GSTR5', 'GSTR6', 'GSTR7', 'GSTR8', 'GSTR9', 'GSTR10'),
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING, // Format: MM/YYYY
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  filingDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('pending', 'filed', 'rejected', 'amended'),
    defaultValue: 'pending',
  },
  
  // GSTR1 fields
  totalSales: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxableSales: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  igstCollected: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cgstCollected: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  sgstCollected: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cessCollected: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // GSTR3B fields
  totalPurchases: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxablePurchases: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  igstPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cgstPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  sgstPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  cessPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  inputTaxCredit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Net tax liability
  netIGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  netCGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  netSGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  netCess: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // File references
  filedBy: {
    type: DataTypes.UUID,
  },
  acknowledgementNumber: {
    type: DataTypes.STRING,
  },
  arnNumber: {
    type: DataTypes.STRING,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  
  // JSON data for complex return structures
  returnData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  errorLogs: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'gst_returns',
});

const HSNMaster = sequelize.define('HSNMaster', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hsnSacCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chapter: {
    type: DataTypes.STRING,
  },
  heading: {
    type: DataTypes.STRING,
  },
  subheading: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  igstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  utgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  cessRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  effectiveFrom: {
    type: DataTypes.DATEONLY,
  },
  effectiveTo: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'hsn_master',
});

module.exports = {
  GSTInvoice,
  GSTLineItem,
  GSTReturn,
  HSNMaster,
};