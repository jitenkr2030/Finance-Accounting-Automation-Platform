const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  companyName: {
    type: DataTypes.STRING,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  mobile: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  
  // Tax information
  gstNumber: {
    type: DataTypes.STRING,
  },
  panNumber: {
    type: DataTypes.STRING,
  },
  tanNumber: {
    type: DataTypes.STRING,
  },
  cin: {
    type: DataTypes.STRING,
  },
  
  // Addresses
  billingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  shippingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Credit information
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  paymentTerms: {
    type: DataTypes.INTEGER, // Days
    defaultValue: 30,
  },
  creditRating: {
    type: DataTypes.ENUM('excellent', 'good', 'average', 'poor', 'bad'),
    defaultValue: 'good',
  },
  
  // Financial summary
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalReceivables: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  overdueAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Status and classification
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_hold', 'blacklisted'),
    defaultValue: 'active',
  },
  customerType: {
    type: DataTypes.ENUM('retail', 'wholesale', 'distributor', 'channel_partner', 'corporate'),
    defaultValue: 'retail',
  },
  industry: {
    type: DataTypes.STRING,
  },
  territory: {
    type: DataTypes.STRING,
  },
  
  // Sales person assignment
  salesPersonId: {
    type: DataTypes.UUID,
  },
  accountManagerId: {
    type: DataTypes.UUID,
  },
  
  // Compliance and documentation
  isTdsApplicable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tdsRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  
  // Social and contact preferences
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'sms', 'whatsapp'),
    defaultValue: 'email',
  },
  socialProfiles: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Custom fields and tags
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
}, {
  tableName: 'customers',
});

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vendorNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  mobile: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  
  // Tax information
  gstNumber: {
    type: DataTypes.STRING,
  },
  panNumber: {
    type: DataTypes.STRING,
  },
  tanNumber: {
    type: DataTypes.STRING,
  },
  cin: {
    type: DataTypes.STRING,
  },
  
  // Addresses
  billingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  shippingAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Payment information
  paymentTerms: {
    type: DataTypes.INTEGER, // Days
    defaultValue: 30,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'neft', 'rtgs', 'imps'),
    defaultValue: 'bank_transfer',
  },
  bankDetails: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Financial summary
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalPayables: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  overdueAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Status and classification
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_hold', 'blacklisted'),
    defaultValue: 'active',
  },
  vendorType: {
    type: DataTypes.ENUM('supplier', 'service_provider', 'contractor', 'consultant', 'manufacturer'),
    defaultValue: 'supplier',
  },
  category: {
    type: DataTypes.STRING,
  },
  
  // Compliance and documentation
  isTdsApplicable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tdsRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  registrationNumber: {
    type: DataTypes.STRING,
  },
  
  // Business information
  businessType: {
    type: DataTypes.ENUM('proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited'),
  },
  establishmentDate: {
    type: DataTypes.DATEONLY,
  },
  
  // Contact preferences
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'sms', 'whatsapp'),
    defaultValue: 'email',
  },
  
  // Custom fields and tags
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
}, {
  tableName: 'vendors',
});

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  poNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  poDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expectedDate: {
    type: DataTypes.DATEONLY,
  },
  vendorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendorAddress: {
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
  
  // Status tracking
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled', 'closed'),
    defaultValue: 'draft',
  },
  
  // Approval workflow
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  
  // Terms and conditions
  paymentTerms: {
    type: DataTypes.STRING,
  },
  deliveryTerms: {
    type: DataTypes.STRING,
  },
  terms: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  
  // Attachments
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // References
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'purchase_orders',
});

const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  purchaseOrderId: {
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
  
  // Received quantities
  quantityOrdered: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  quantityReceived: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  quantityPending: {
    type: DataTypes.DECIMAL(10, 4),
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
  tableName: 'purchase_order_line_items',
});

const GoodsReceiptNote = sequelize.define('GoodsReceiptNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  grnNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  grnDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  poNumber: {
    type: DataTypes.STRING,
  },
  poId: {
    type: DataTypes.UUID,
  },
  vendorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'partial', 'completed', 'cancelled'),
    defaultValue: 'draft',
  },
  
  // Quality check
  qualityCheckStatus: {
    type: DataTypes.ENUM('pending', 'passed', 'failed', 'conditionally_accepted'),
    defaultValue: 'pending',
  },
  qualityCheckNotes: {
    type: DataTypes.TEXT,
  },
  
  // Delivery information
  deliveryNoteNumber: {
    type: DataTypes.STRING,
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
  },
  receivedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Financial totals
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
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
  tableName: 'goods_receipt_notes',
});

const GRNLineItem = sequelize.define('GRNLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  grnId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  poLineItemId: {
    type: DataTypes.UUID,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Quantities
  quantityOrdered: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  quantityReceived: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  quantityRejected: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  quantityAccepted: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  
  // Pricing
  unitRate: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Quality and inspection
  qualityStatus: {
    type: DataTypes.ENUM('pending', 'passed', 'failed', 'conditionally_accepted'),
    defaultValue: 'pending',
  },
  inspectionNotes: {
    type: DataTypes.TEXT,
  },
  
  // Serial numbers (for tracked items)
  serialNumbers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'grn_line_items',
});

module.exports = {
  Customer,
  Vendor,
  PurchaseOrder,
  PurchaseOrderLineItem,
  GoodsReceiptNote,
  GRNLineItem,
};