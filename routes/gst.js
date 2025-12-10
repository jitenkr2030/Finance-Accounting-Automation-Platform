const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { GSTInvoice, GSTLineItem, GSTReturn, HSNMaster } = require('../models/GST');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');
const axios = require('axios');

const router = express.Router();

// Create GST invoice
router.post('/invoices', authMiddleware, [
  body('invoiceNumber').notEmpty().trim(),
  body('invoiceDate').isISO8601(),
  body('customerId').notEmpty(),
  body('customerName').notEmpty().trim(),
  body('customerGSTNumber').optional().isLength({ min: 15, max: 15 }),
  body('placeOfSupply').notEmpty(),
  body('lineItems').isArray({ min: 1 }),
  body('lineItems.*.productName').notEmpty(),
  body('lineItems.*.hsnSacCode').notEmpty(),
  body('lineItems.*.quantity').isFloat({ min: 0 }),
  body('lineItems.*.rate').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      invoiceNumber, invoiceDate, dueDate, customerId, customerName, customerGSTNumber,
      customerAddress, placeOfSupply, reverseCharge, lineItems, terms, notes 
    } = req.body;

    // Check if invoice number already exists
    const existingInvoice = await GSTInvoice.findOne({
      where: { invoiceNumber, companyId: req.user.companyId }
    });

    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    // Calculate totals
    let subTotal = 0;
    let totalGST = 0;
    let totalAmount = 0;

    for (const item of lineItems) {
      const taxableValue = parseFloat(item.quantity) * parseFloat(item.rate);
      const discountAmount = (parseFloat(item.discountAmount) || 0);
      const itemTaxableValue = taxableValue - discountAmount;
      
      item.taxableValue = itemTaxableValue;
      
      // Calculate GST (simplified - in real implementation, get rates from HSN master)
      const gstRate = parseFloat(item.gstRate || 18); // Default 18%
      const gstAmount = (itemTaxableValue * gstRate) / 100;
      
      item.cgstAmount = (gstAmount * 50) / 100; // 50% CGST
      item.sgstAmount = (gstAmount * 50) / 100; // 50% SGST
      item.igstAmount = 0; // Will be calculated based on place of supply
      
      item.totalAmount = itemTaxableValue + gstAmount;
      
      subTotal += itemTaxableValue;
      totalGST += gstAmount;
      totalAmount += item.totalAmount;
    }

    // Create GST invoice
    const gstInvoice = await GSTInvoice.create({
      companyId: req.user.companyId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId,
      customerName,
      customerGSTNumber,
      customerAddress,
      placeOfSupply,
      reverseCharge: reverseCharge || false,
      subTotal,
      taxableValue: subTotal,
      totalGSTAmount: totalGST,
      totalAmount,
      status: 'draft',
      terms,
      notes,
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await GSTLineItem.create({
        gstInvoiceId: gstInvoice.id,
        productName: item.productName,
        description: item.description,
        hsnSacCode: item.hsnSacCode,
        quantity: item.quantity,
        unit: item.unit || 'NOS',
        rate: item.rate,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        taxableValue: item.taxableValue,
        cgstRate: (item.gstRate || 18) * 0.5, // Half for CGST
        cgstAmount: item.cgstAmount,
        sgstRate: (item.gstRate || 18) * 0.5, // Half for SGST
        sgstAmount: item.sgstAmount,
        totalAmount: item.totalAmount,
        lineNumber: i + 1,
      });
    }

    // Fetch complete invoice with line items
    const completeInvoice = await GSTInvoice.findByPk(gstInvoice.id, {
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    res.status(201).json({ 
      message: 'GST Invoice created successfully',
      invoice: completeInvoice 
    });
  } catch (error) {
    console.error('Create GST invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get GST invoices
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, startDate, endDate, status, customerId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { invoiceNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (startDate && endDate) {
      whereClause.invoiceDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const { count, rows: invoices } = await GSTInvoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'quantity', 'rate', 'totalAmount'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['invoiceDate', 'DESC']],
    });

    res.json({
      invoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get GST invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get GST invoice by ID
router.get('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await GSTInvoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'GST Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get GST invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update GST invoice
router.put('/invoices/:id', authMiddleware, [
  body('customerName').optional().notEmpty().trim(),
  body('placeOfSupply').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await GSTInvoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'GST Invoice not found' });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft invoices can be modified' });
    }

    const { customerName, customerGSTNumber, customerAddress, placeOfSupply, terms, notes } = req.body;

    await invoice.update({
      customerName: customerName || invoice.customerName,
      customerGSTNumber: customerGSTNumber || invoice.customerGSTNumber,
      customerAddress: customerAddress || invoice.customerAddress,
      placeOfSupply: placeOfSupply || invoice.placeOfSupply,
      terms: terms || invoice.terms,
      notes: notes || invoice.notes,
    });

    res.json({ message: 'GST Invoice updated successfully', invoice });
  } catch (error) {
    console.error('Update GST invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete GST invoice
router.delete('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await GSTInvoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'GST Invoice not found' });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft invoices can be deleted' });
    }

    // Delete line items first
    await Promise.all(
      invoice.lineItems.map(item => item.destroy())
    );

    // Delete invoice
    await invoice.destroy();

    res.json({ message: 'GST Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete GST invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate e-invoice (simplified - real implementation would integrate with GST portal)
router.post('/invoices/:id/e-invoice', authMiddleware, async (req, res) => {
  try {
    const invoice = await GSTInvoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: GSTLineItem,
          as: 'lineItems',
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'GST Invoice not found' });
    }

    if (invoice.eInvoiceStatus === 'generated') {
      return res.status(400).json({ error: 'E-invoice already generated' });
    }

    // In a real implementation, this would call the GST e-invoice API
    // For now, we'll simulate the process
    const eInvoiceNumber = `EINV-${Date.now()}`;
    const eInvoiceDate = new Date();

    await invoice.update({
      eInvoiceStatus: 'generated',
      eInvoiceNumber,
      eInvoiceDate,
    });

    res.json({ 
      message: 'E-invoice generated successfully',
      eInvoiceNumber,
      eInvoiceDate,
    });
  } catch (error) {
    console.error('Generate e-invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate e-way bill
router.post('/invoices/:id/e-way-bill', authMiddleware, [
  body('transportationMode').isIn(['road', 'rail', 'air', 'ship']),
  body('vehicleNumber').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await GSTInvoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'GST Invoice not found' });
    }

    if (!invoice.eInvoiceNumber) {
      return res.status(400).json({ error: 'E-invoice must be generated first' });
    }

    if (invoice.eWayBillNumber) {
      return res.status(400).json({ error: 'E-way bill already generated' });
    }

    const { transportationMode, vehicleNumber, transportationId } = req.body;
    const eWayBillNumber = `EWB-${Date.now()}`;
    const eWayBillDate = new Date();

    await invoice.update({
      transportationMode,
      vehicleNumber,
      transportationId,
      eWayBillNumber,
      eWayBillDate,
    });

    res.json({ 
      message: 'E-way bill generated successfully',
      eWayBillNumber,
      eWayBillDate,
    });
  } catch (error) {
    console.error('Generate e-way bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get GST returns
router.get('/returns', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, returnType, period, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (returnType) {
      whereClause.returnType = returnType;
    }

    if (period) {
      whereClause.period = period;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: returns } = await GSTReturn.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['period', 'DESC']],
    });

    res.json({
      returns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get GST returns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create GST return
router.post('/returns', authMiddleware, [
  body('returnType').isIn(['GSTRSTR2', '1', 'GGSTR3B', 'GSTR4', 'GSTR5', 'GSTR6', 'GSTR7', 'GSTR8', 'GSTR9', 'GSTR10']),
  body('period').matches(/^\d{2}\/\d{4}$/), // MM/YYYY format
  body('dueDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { returnType, period, dueDate } = req.body;

    // Check if return already exists for this period
    const existingReturn = await GSTReturn.findOne({
      where: { returnType, period, companyId: req.user.companyId }
    });

    if (existingReturn) {
      return res.status(400).json({ error: 'Return already exists for this period' });
    }

    // Calculate return data based on transactions
    let returnData = {};
    
    if (returnType === 'GSTR1') {
      // Calculate GSTR1 data from sales invoices
      const invoices = await GSTInvoice.findAll({
        where: {
          companyId: req.user.companyId,
          invoiceDate: {
            [Op.between]: [
              new Date(`${period.split('/')[1]}-${period.split('/')[0]}-01`),
              new Date(`${period.split('/')[1]}-${period.split('/')[0]}-31`)
            ]
          }
        }
      });

      returnData = {
        totalSales: invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0),
        taxableSales: invoices.reduce((sum, inv) => sum + parseFloat(inv.taxableValue), 0),
        igstCollected: invoices.reduce((sum, inv) => sum + parseFloat(inv.igstAmount), 0),
        cgstCollected: invoices.reduce((sum, inv) => sum + parseFloat(inv.cgstAmount), 0),
        sgstCollected: invoices.reduce((sum, inv) => sum + parseFloat(inv.sgstAmount), 0),
      };
    }

    const gstReturn = await GSTReturn.create({
      companyId: req.user.companyId,
      returnType,
      period,
      dueDate,
      status: 'pending',
      ...returnData,
      createdBy: req.user.userId,
    });

    res.status(201).json({ 
      message: 'GST Return created successfully',
      return: gstReturn 
    });
  } catch (error) {
    console.error('Create GST return error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get HSN/SAC master data
router.get('/hsn-master', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true,
    };

    if (search) {
      whereClause[Op.or] = [
        { hsnSacCode: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: hsnData } = await HSNMaster.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['hsnSacCode', 'ASC']],
    });

    res.json({
      hsnData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get HSN master error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search HSN/SAC by code
router.get('/hsn-search/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    
    const hsnData = await HSNMaster.findOne({
      where: {
        hsnSacCode: code,
        isActive: true,
      },
    });

    if (!hsnData) {
      return res.status(404).json({ error: 'HSN/SAC code not found' });
    }

    res.json({ hsnData });
  } catch (error) {
    console.error('Search HSN error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;