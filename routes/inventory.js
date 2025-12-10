const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product, Warehouse, StockLedger, StockAdjustment, StockAdjustmentLineItem, StockTransfer, StockTransferLineItem } = require('../models/Inventory');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Product routes
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { productCode: { [Op.iLike]: `%${search}%` } },
        { productName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['productName', 'ASC']],
    });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/products', authMiddleware, [
  body('productCode').notEmpty().trim(),
  body('productName').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('productType').isIn(['finished_goods', 'raw_materials', 'work_in_progress', 'semi_finished', 'services']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.userId,
    };

    const product = await Product.create(productData);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Warehouse routes
router.get('/warehouses', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: warehouses } = await Warehouse.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['warehouseName', 'ASC']],
    });

    res.json({
      warehouses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/warehouses', authMiddleware, [
  body('warehouseCode').notEmpty().trim(),
  body('warehouseName').notEmpty().trim(),
  body('warehouseType').isIn(['main', 'sub', 'consignment', 'vendor', 'customer']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const warehouseData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.userId,
    };

    const warehouse = await Warehouse.create(warehouseData);
    res.status(201).json({ message: 'Warehouse created successfully', warehouse });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock ledger routes
router.get('/stock-ledger', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, productId, warehouseId, startDate, endDate, transactionType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (productId) {
      whereClause.productId = productId;
    }

    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    if (transactionType) {
      whereClause.transactionType = transactionType;
    }

    if (startDate && endDate) {
      whereClause.transactionDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const { count, rows: stockEntries } = await StockLedger.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productCode', 'productName', 'category'],
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'warehouseName', 'warehouseCode'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transactionDate', 'DESC']],
    });

    res.json({
      stockEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get stock ledger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock adjustment routes
router.get('/adjustments', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, adjustmentType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (adjustmentType) {
      whereClause.adjustmentType = adjustmentType;
    }

    const { count, rows: adjustments } = await StockAdjustment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: StockAdjustmentLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'systemQuantity', 'countedQuantity', 'adjustmentQuantity', 'adjustmentValue'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['adjustmentDate', 'DESC']],
    });

    res.json({
      adjustments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get stock adjustments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/adjustments', authMiddleware, [
  body('adjustmentNumber').notEmpty().trim(),
  body('adjustmentDate').isISO8601(),
  body('adjustmentType').isIn(['cycle_count', 'physical_count', 'damage', 'theft', 'loss', 'gain', 'expired', 'broken', 'other']),
  body('warehouseId').notEmpty(),
  body('lineItems').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { adjustmentNumber, adjustmentDate, adjustmentType, warehouseId, reason, description, lineItems } = req.body;

    // Calculate total adjustment value
    let totalAdjustmentValue = 0;
    for (const item of lineItems) {
      totalAdjustmentValue += parseFloat(item.adjustmentValue) || 0;
    }

    // Create stock adjustment
    const adjustment = await StockAdjustment.create({
      companyId: req.user.companyId,
      adjustmentNumber,
      adjustmentDate,
      adjustmentType,
      warehouseId,
      totalAdjustmentValue,
      reason,
      description,
      status: 'draft',
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await StockAdjustmentLineItem.create({
        stockAdjustmentId: adjustment.id,
        productId: item.productId,
        productName: item.productName,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        adjustmentQuantity: item.adjustmentQuantity,
        unitRate: item.unitRate,
        adjustmentValue: item.adjustmentValue,
        varianceReason: item.varianceReason,
        lineNumber: i + 1,
      });
    }

    const completeAdjustment = await StockAdjustment.findByPk(adjustment.id, {
      include: [
        {
          model: StockAdjustmentLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    res.status(201).json({ message: 'Stock adjustment created successfully', adjustment: completeAdjustment });
  } catch (error) {
    console.error('Create stock adjustment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock transfer routes
router.get('/transfers', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: transfers } = await StockTransfer.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: StockTransferLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'quantityToTransfer', 'quantityTransferred', 'unitRate'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transferDate', 'DESC']],
    });

    res.json({
      transfers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get stock transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transfers', authMiddleware, [
  body('transferNumber').notEmpty().trim(),
  body('transferDate').isISO8601(),
  body('fromWarehouseId').notEmpty(),
  body('toWarehouseId').notEmpty(),
  body('lineItems').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { transferNumber, transferDate, fromWarehouseId, toWarehouseId, transportMode, transportDetails, vehicleNumber, lineItems, notes } = req.body;

    // Calculate total value
    let totalValue = 0;
    for (const item of lineItems) {
      totalValue += parseFloat(item.quantityToTransfer) * parseFloat(item.unitRate);
    }

    // Create stock transfer
    const transfer = await StockTransfer.create({
      companyId: req.user.companyId,
      transferNumber,
      transferDate,
      fromWarehouseId,
      toWarehouseId,
      transportMode,
      transportDetails,
      vehicleNumber,
      totalValue,
      notes,
      status: 'draft',
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await StockTransferLineItem.create({
        stockTransferId: transfer.id,
        productId: item.productId,
        productName: item.productName,
        quantityToTransfer: item.quantityToTransfer,
        quantityTransferred: 0,
        quantityReceived: 0,
        unitRate: item.unitRate,
        totalValue: parseFloat(item.quantityToTransfer) * parseFloat(item.unitRate),
        serialNumbers: item.serialNumbers || [],
        batchNumber: item.batchNumber,
        lineNumber: i + 1,
      });
    }

    const completeTransfer = await StockTransfer.findByPk(transfer.id, {
      include: [
        {
          model: StockTransferLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    res.status(201).json({ message: 'Stock transfer created successfully', transfer: completeTransfer });
  } catch (error) {
    console.error('Create stock transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inventory dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const whereClause = { companyId: req.user.companyId };

    const totalProducts = await Product.count({ where: { ...whereClause, isActive: true } });
    const totalWarehouses = await Warehouse.count({ where: { ...whereClause, isActive: true } });
    const lowStockProducts = await Product.count({
      where: {
        ...whereClause,
        isActive: true,
        reorderLevel: { [Op.gt]: 0 },
      },
    });

    // Get stock valuation
    const stockValuation = await StockLedger.findAll({
      where: { ...whereClause, transactionType: 'purchase' },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'category'],
        },
      ],
      order: [['transactionDate', 'DESC']],
      limit: 100,
    });

    // Recent stock movements
    const recentMovements = await StockLedger.findAll({
      where: { companyId: req.user.companyId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'productName', 'productCode'],
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'warehouseName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      summary: {
        totalProducts,
        totalWarehouses,
        lowStockProducts,
      },
      stockValuation: stockValuation.slice(0, 20), // Top 20 recent purchases
      recentMovements,
    });
  } catch (error) {
    console.error('Get inventory dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;