const express = require('express');
const { body, validationResult } = require('express-validator');
const { Customer, Vendor, PurchaseOrder, PurchaseOrderLineItem, GoodsReceiptNote, GRNLineItem } = require('../models/CustomerVendor');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Customer routes
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, customerType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { customerNumber: { [Op.iLike]: `%${search}%` } },
        { contactName: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (customerType) {
      whereClause.customerType = customerType;
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/customers', authMiddleware, [
  body('contactName').notEmpty().trim(),
  body('email').optional().isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customerData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.userId,
    };

    const customer = await Customer.create(customerData);
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor routes
router.get('/vendors', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, vendorType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { vendorNumber: { [Op.iLike]: `%${search}%` } },
        { contactName: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (vendorType) {
      whereClause.vendorType = vendorType;
    }

    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      vendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/vendors', authMiddleware, [
  body('companyName').notEmpty().trim(),
  body('contactName').notEmpty().trim(),
  body('email').optional().isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendorData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.userId,
    };

    const vendor = await Vendor.create(vendorData);
    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase Order routes
router.get('/purchase-orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, vendorId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { poNumber: { [Op.iLike]: `%${search}%` } },
        { vendorName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (vendorId) {
      whereClause.vendorId = vendorId;
    }

    const { count, rows: purchaseOrders } = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PurchaseOrderLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'quantity', 'rate', 'totalAmount'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['poDate', 'DESC']],
    });

    res.json({
      purchaseOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/purchase-orders', authMiddleware, [
  body('poNumber').notEmpty().trim(),
  body('poDate').isISO8601(),
  body('vendorId').notEmpty(),
  body('vendorName').notEmpty().trim(),
  body('lineItems').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poNumber, poDate, expectedDate, vendorId, vendorName, vendorAddress, lineItems, terms, notes } = req.body;

    // Calculate totals
    let subTotal = 0;
    let taxAmount = 0;
    let totalAmount = 0;

    for (const item of lineItems) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.rate);
      const itemTax = (itemTotal * (parseFloat(item.taxRate) || 0) / 100);
      
      subTotal += itemTotal;
      taxAmount += itemTax;
      totalAmount += (itemTotal + itemTax);
    }

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      companyId: req.user.companyId,
      poNumber,
      poDate,
      expectedDate,
      vendorId,
      vendorName,
      vendorAddress,
      subTotal,
      taxAmount,
      totalAmount,
      status: 'draft',
      terms,
      notes,
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await PurchaseOrderLineItem.create({
        purchaseOrderId: purchaseOrder.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'NOS',
        rate: item.rate,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        taxRate: item.taxRate || 0,
        taxAmount: (parseFloat(item.quantity) * parseFloat(item.rate) * (parseFloat(item.taxRate) || 0) / 100),
        totalAmount: parseFloat(item.quantity) * parseFloat(item.rate) + (parseFloat(item.quantity) * parseFloat(item.rate) * (parseFloat(item.taxRate) || 0) / 100),
        quantityOrdered: item.quantity,
        quantityReceived: 0,
        quantityPending: item.quantity,
        lineNumber: i + 1,
      });
    }

    const completePO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: PurchaseOrderLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    res.status(201).json({ message: 'Purchase order created successfully', purchaseOrder: completePO });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Goods Receipt Note routes
router.get('/grn', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { grnNumber: { [Op.iLike]: `%${search}%` } },
        { vendorName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: grns } = await GoodsReceiptNote.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GRNLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'quantityReceived', 'quantityAccepted', 'unitRate'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['grnDate', 'DESC']],
    });

    res.json({
      grns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get GRNs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/grn', authMiddleware, [
  body('grnNumber').notEmpty().trim(),
  body('grnDate').isISO8601(),
  body('vendorId').notEmpty(),
  body('vendorName').notEmpty().trim(),
  body('receivedDate').isISO8601(),
  body('lineItems').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grnNumber, grnDate, poNumber, poId, vendorId, vendorName, deliveryNoteNumber, deliveryDate, receivedDate, lineItems, notes } = req.body;

    // Calculate total value
    let totalValue = 0;
    for (const item of lineItems) {
      totalValue += parseFloat(item.quantityReceived) * parseFloat(item.unitRate);
    }

    // Create GRN
    const grn = await GoodsReceiptNote.create({
      companyId: req.user.companyId,
      grnNumber,
      grnDate,
      poNumber,
      poId,
      vendorId,
      vendorName,
      deliveryNoteNumber,
      deliveryDate,
      receivedDate,
      totalValue,
      status: 'draft',
      notes,
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await GRNLineItem.create({
        grnId: grn.id,
        poLineItemId: item.poLineItemId,
        productId: item.productId,
        productName: item.productName,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        quantityRejected: item.quantityRejected || 0,
        quantityAccepted: parseFloat(item.quantityReceived) - parseFloat(item.quantityRejected || 0),
        unitRate: item.unitRate,
        totalValue: parseFloat(item.quantityReceived) * parseFloat(item.unitRate),
        qualityStatus: 'pending',
        lineNumber: i + 1,
      });
    }

    const completeGRN = await GoodsReceiptNote.findByPk(grn.id, {
      include: [
        {
          model: GRNLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    res.status(201).json({ message: 'GRN created successfully', grn: completeGRN });
  } catch (error) {
    console.error('Create GRN error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const whereClause = { companyId: req.user.companyId };

    const totalCustomers = await Customer.count({ where: { ...whereClause, status: 'active' } });
    const totalVendors = await Vendor.count({ where: { ...whereClause, status: 'active' } });
    const totalPOs = await PurchaseOrder.count({ where: whereClause });
    const totalGRNs = await GoodsReceiptNote.count({ where: whereClause });

    // Recent activities
    const recentCustomers = await Customer.findAll({
      where: { companyId: req.user.companyId },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentVendors = await Vendor.findAll({
      where: { companyId: req.user.companyId },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentPOs = await PurchaseOrder.findAll({
      where: { companyId: req.user.companyId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: PurchaseOrderLineItem,
          as: 'lineItems',
          attributes: ['id'],
        },
      ],
    });

    res.json({
      summary: {
        totalCustomers,
        totalVendors,
        totalPOs,
        totalGRNs,
      },
      recentCustomers,
      recentVendors,
      recentPOs,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;