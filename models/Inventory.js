const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  productName: {
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
  brand: {
    type: DataTypes.STRING,
  },
  model: {
    type: DataTypes.STRING,
  },
  
  // Classification
  productType: {
    type: DataTypes.ENUM('finished_goods', 'raw_materials', 'work_in_progress', 'semi_finished', 'services'),
    defaultValue: 'finished_goods',
  },
  isTrackedForInventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Unit of Measure
  baseUnit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NOS',
  },
  alternativeUnits: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Pricing
  purchasePrice: {
    type: DataTypes.DECIMAL(15, 4),
    defaultValue: 0,
  },
  salePrice: {
    type: DataTypes.DECIMAL(15, 4),
    defaultValue: 0,
  },
  mrp: {
    type: DataTypes.DECIMAL(15, 4),
    defaultValue: 0,
  },
  
  // Tax information
  hsnSacCode: {
    type: DataTypes.STRING,
  },
  gstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  
  // Inventory management
  reorderLevel: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  minimumStock: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  maximumStock: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  leadTime: {
    type: DataTypes.INTEGER, // Days
    defaultValue: 0,
  },
  
  // Warehouse locations
  defaultLocation: {
    type: DataTypes.STRING,
  },
  availableLocations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // Dimensions and weight
  weight: {
    type: DataTypes.DECIMAL(10, 3),
  },
  dimensions: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Tracking
  isSerialized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBatched: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Supplier information
  primarySupplierId: {
    type: DataTypes.UUID,
  },
  supplierPartNumber: {
    type: DataTypes.STRING,
  },
  
  // Custom fields and metadata
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  tableName: 'products',
});

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  warehouseCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  warehouseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  warehouseType: {
    type: DataTypes.ENUM('main', 'sub', 'consignment', 'vendor', 'customer'),
    defaultValue: 'main',
  },
  
  // Location details
  address: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Manager and staff
  managerId: {
    type: DataTypes.UUID,
  },
  staff: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  
  // Capacity and layout
  totalCapacity: {
    type: DataTypes.DECIMAL(15, 2),
  },
  currentUtilization: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  layout: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Operating hours and details
  operatingHours: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Kolkata',
  },
  
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'warehouses',
});

const StockLedger = sequelize.define('StockLedger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Transaction details
  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  transactionType: {
    type: DataTypes.ENUM('opening', 'purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage', 'expired', 'manufactured', 'consumed'),
    allowNull: false,
  },
  referenceType: {
    type: DataTypes.ENUM('invoice', 'bill', 'purchase_order', 'goods_receipt', 'stock_adjustment', 'stock_transfer', 'manufacturing', 'manual'),
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.UUID,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  
  // Quantities
  quantityIn: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  quantityOut: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  balanceQuantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  
  // Costing
  unitRate: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  runningBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Batch and serial information
  batchNumber: {
    type: DataTypes.STRING,
  },
  serialNumbers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // Manufacturing details (for finished goods)
  manufacturingDate: {
    type: DataTypes.DATEONLY,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
  },
  
  // Notes and documentation
  description: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  
  // Audit
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'stock_ledger',
});

const StockAdjustment = sequelize.define('StockAdjustment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  adjustmentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  adjustmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  adjustmentType: {
    type: DataTypes.ENUM('cycle_count', 'physical_count', 'damage', 'theft', 'loss', 'gain', 'expired', 'broken', 'other'),
    allowNull: false,
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'approved', 'posted'),
    defaultValue: 'draft',
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  
  // Financial impact
  totalAdjustmentValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Documentation
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
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
  tableName: 'stock_adjustments',
});

const StockAdjustmentLineItem = sequelize.define('StockAdjustmentLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stockAdjustmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Quantity details
  systemQuantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  countedQuantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  adjustmentQuantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  
  // Value adjustments
  unitRate: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
  adjustmentValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Variance reason
  varianceReason: {
    type: DataTypes.STRING,
  },
  
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'stock_adjustment_line_items',
});

const StockTransfer = sequelize.define('StockTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  transferNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  transferDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fromWarehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  toWarehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Status tracking
  status: {
    type: DataTypes.ENUM('draft', 'in_transit', 'received', 'cancelled'),
    defaultValue: 'draft',
  },
  shippedDate: {
    type: DataTypes.DATEONLY,
  },
  receivedDate: {
    type: DataTypes.DATEONLY,
  },
  
  // Transportation details
  transportMode: {
    type: DataTypes.ENUM('own_vehicle', 'courier', 'transport', 'hand_delivery'),
  },
  transportDetails: {
    type: DataTypes.STRING,
  },
  vehicleNumber: {
    type: DataTypes.STRING,
  },
  driverName: {
    type: DataTypes.STRING,
  },
  trackingNumber: {
    type: DataTypes.STRING,
  },
  
  // Value
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
  tableName: 'stock_transfers',
});

const StockTransferLineItem = sequelize.define('StockTransferLineItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stockTransferId: {
    type: DataTypes.UUID,
    allowNull: false,
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
  quantityToTransfer: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  quantityTransferred: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
  },
  quantityReceived: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
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
  
  // Serial/batch tracking
  serialNumbers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  batchNumber: {
    type: DataTypes.STRING,
  },
  
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'stock_transfer_line_items',
});

module.exports = {
  Product,
  Warehouse,
  StockLedger,
  StockAdjustment,
  StockAdjustmentLineItem,
  StockTransfer,
  StockTransferLineItem,
};