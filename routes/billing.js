const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Invoice, InvoiceLineItem, RecurringInvoice, Payment, Estimate } = require('../models/Billing');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Create invoice
router.post('/invoices', authMiddleware, [
  body('invoiceNumber').notEmpty().trim(),
  body('invoiceDate').isISO8601(),
  body('customerId').notEmpty(),
  body('customerName').notEmpty().trim(),
  body('lineItems').isArray({ min: 1 }),
  body('lineItems.*.productName').notEmpty(),
  body('lineItems.*.quantity').isFloat({ min: 0 }),
  body('lineItems.*.rate').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      invoiceNumber, invoiceDate, dueDate, customerId, customerName, customerEmail,
      customerPhone, billingAddress, shippingAddress, lineItems, terms, notes 
    } = req.body;

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({
      where: { invoiceNumber, companyId: req.user.companyId }
    });

    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    // Calculate totals
    let subTotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    let totalAmount = 0;

    for (const item of lineItems) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.rate);
      const itemDiscount = (parseFloat(item.discountAmount) || (itemTotal * (parseFloat(item.discountPercentage) || 0) / 100));
      const itemTax = ((itemTotal - itemDiscount) * (parseFloat(item.taxRate) || 0) / 100);
      
      item.totalAmount = itemTotal - itemDiscount + itemTax;
      
      subTotal += itemTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
      totalAmount += item.totalAmount;
    }

    // Create invoice
    const invoice = await Invoice.create({
      companyId: req.user.companyId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      billingAddress,
      shippingAddress,
      subTotal,
      discountAmount,
      taxAmount,
      totalAmount,
      amountDue: totalAmount,
      status: 'draft',
      terms,
      notes,
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await InvoiceLineItem.create({
        invoiceId: invoice.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'NOS',
        rate: item.rate,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        taxRate: item.taxRate || 0,
        taxAmount: (parseFloat(item.quantity) * parseFloat(item.rate) - (parseFloat(item.discountAmount) || 0)) * (parseFloat(item.taxRate) || 0) / 100,
        totalAmount: item.totalAmount,
        lineNumber: i + 1,
      });
    }

    // Fetch complete invoice with line items
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: InvoiceLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
        {
          model: Payment,
          as: 'payments',
        },
      ],
    });

    res.status(201).json({ 
      message: 'Invoice created successfully',
      invoice: completeInvoice 
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoices
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

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: InvoiceLineItem,
          as: 'lineItems',
          attributes: ['id', 'productName', 'quantity', 'rate', 'totalAmount'],
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'paymentDate', 'status'],
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
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice by ID
router.get('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: InvoiceLineItem,
          as: 'lineItems',
          order: [['lineNumber', 'ASC']],
        },
        {
          model: Payment,
          as: 'payments',
          order: [['paymentDate', 'DESC']],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update invoice
router.put('/invoices/:id', authMiddleware, [
  body('customerName').optional().notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: InvoiceLineItem,
          as: 'lineItems',
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!['draft', 'sent'].includes(invoice.status)) {
      return res.status(400).json({ error: 'Only draft or sent invoices can be modified' });
    }

    const { customerName, customerEmail, customerPhone, dueDate, terms, notes } = req.body;

    await invoice.update({
      customerName: customerName || invoice.customerName,
      customerEmail: customerEmail || invoice.customerEmail,
      customerPhone: customerPhone || invoice.customerPhone,
      dueDate: dueDate || invoice.dueDate,
      terms: terms || invoice.terms,
      notes: notes || invoice.notes,
    });

    res.json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send invoice
router.put('/invoices/:id/send', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft invoices can be sent' });
    }

    await invoice.update({
      status: 'sent',
      sentAt: new Date(),
    });

    // In a real implementation, you would send email here
    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record payment
router.post('/invoices/:id/payments', authMiddleware, [
  body('amount').isFloat({ min: 0 }),
  body('paymentDate').isISO8601(),
  body('paymentMethod').isIn(['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'netbanking']),
  body('referenceNumber').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: Payment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const { amount, paymentDate, paymentMethod, referenceNumber, bankName, chequeNumber, chequeDate, notes } = req.body;

    if (parseFloat(amount) > parseFloat(invoice.amountDue)) {
      return res.status(400).json({ error: 'Payment amount cannot exceed amount due' });
    }

    // Generate payment number
    const paymentCount = await Payment.count({
      where: { companyId: req.user.companyId }
    });
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(6, '0')}`;

    // Create payment
    const payment = await Payment.create({
      companyId: req.user.companyId,
      paymentNumber,
      paymentDate,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      chequeNumber,
      chequeDate,
      status: 'completed',
      notes,
      createdBy: req.user.userId,
    });

    // Update invoice
    const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(amount);
    const newAmountDue = parseFloat(invoice.totalAmount) - newAmountPaid;
    
    let newStatus = invoice.status;
    let paymentStatus = 'pending';
    
    if (newAmountDue <= 0) {
      newStatus = 'paid';
      paymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
      paymentStatus = 'partial';
    }

    await invoice.update({
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      status: newStatus,
      paymentStatus,
    });

    res.status(201).json({ 
      message: 'Payment recorded successfully',
      payment,
      invoice: await Invoice.findByPk(invoice.id),
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create estimate
router.post('/estimates', authMiddleware, [
  body('estimateNumber').notEmpty().trim(),
  body('estimateDate').isISO8601(),
  body('validUntil').isISO8601(),
  body('customerId').notEmpty(),
  body('customerName').notEmpty().trim(),
  body('lineItems').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { estimateNumber, estimateDate, validUntil, customerId, customerName, customerEmail, customerPhone, billingAddress, lineItems, terms, notes } = req.body;

    // Check if estimate number already exists
    const existingEstimate = await Estimate.findOne({
      where: { estimateNumber, companyId: req.user.companyId }
    });

    if (existingEstimate) {
      return res.status(400).json({ error: 'Estimate number already exists' });
    }

    // Calculate totals
    let subTotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    let totalAmount = 0;

    for (const item of lineItems) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.rate);
      const itemDiscount = (parseFloat(item.discountAmount) || (itemTotal * (parseFloat(item.discountPercentage) || 0) / 100));
      const itemTax = ((itemTotal - itemDiscount) * (parseFloat(item.taxRate) || 0) / 100);
      
      subTotal += itemTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
      totalAmount += (itemTotal - itemDiscount + itemTax);
    }

    // Create estimate
    const estimate = await Estimate.create({
      companyId: req.user.companyId,
      estimateNumber,
      estimateDate,
      validUntil,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      billingAddress,
      subTotal,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'draft',
      terms,
      notes,
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'Estimate created successfully', estimate });
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert estimate to invoice
router.post('/estimates/:id/convert-to-invoice', authMiddleware, async (req, res) => {
  try {
    const estimate = await Estimate.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
        status: 'accepted',
      },
    });

    if (!estimate) {
      return res.status(404).json({ error: 'Accepted estimate not found' });
    }

    if (estimate.convertedToInvoice) {
      return res.status(400).json({ error: 'Estimate already converted to invoice' });
    }

    // Generate invoice number
    const invoiceCount = await Invoice.count({
      where: { companyId: req.user.companyId }
    });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Create invoice from estimate
    const invoice = await Invoice.create({
      companyId: req.user.companyId,
      invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      customerEmail: estimate.customerEmail,
      customerPhone: estimate.customerPhone,
      billingAddress: estimate.billingAddress,
      subTotal: estimate.subTotal,
      discountAmount: estimate.discountAmount,
      taxAmount: estimate.taxAmount,
      totalAmount: estimate.totalAmount,
      amountDue: estimate.totalAmount,
      status: 'draft',
      terms: estimate.terms,
      notes: `Converted from estimate ${estimate.estimateNumber}`,
      createdBy: req.user.userId,
    });

    // Update estimate
    await estimate.update({
      convertedToInvoice: true,
      invoiceId: invoice.id,
      status: 'converted',
    });

    res.json({ 
      message: 'Estimate converted to invoice successfully',
      invoice,
    });
  } catch (error) {
    console.error('Convert estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recurring invoices
router.get('/recurring', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: recurringInvoices } = await RecurringInvoice.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nextInvoiceDate', 'ASC']],
    });

    res.json({
      recurringInvoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get recurring invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recurring invoice
router.post('/recurring', authMiddleware, [
  body('templateName').notEmpty().trim(),
  body('customerId').notEmpty(),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  body('startDate').isISO8601(),
  body('nextInvoiceDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateName, customerId, frequency, startDate, endDate, nextInvoiceDate, templateData } = req.body;

    const recurringInvoice = await RecurringInvoice.create({
      companyId: req.user.companyId,
      templateName,
      customerId,
      frequency,
      startDate,
      endDate,
      nextInvoiceDate,
      templateData,
      createdBy: req.user.userId,
    });

    res.status(201).json({ 
      message: 'Recurring invoice created successfully',
      recurringInvoice 
    });
  } catch (error) {
    console.error('Create recurring invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const whereClause = {
      companyId: req.user.companyId,
      invoiceDate: {
        [Op.gte]: startDate,
      },
    };

    // Get invoice statistics
    const totalInvoices = await Invoice.count({ where: whereClause });
    const totalAmount = await Invoice.sum('totalAmount', { where: whereClause }) || 0;
    const paidAmount = await Invoice.sum('amountPaid', { where: whereClause }) || 0;
    const outstandingAmount = await Invoice.sum('amountDue', { where: whereClause }) || 0;

    // Get invoices by status
    const statusBreakdown = await Invoice.findAll({
      where: whereClause,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']],
      group: ['status'],
    });

    // Get recent invoices
    const recentInvoices = await Invoice.findAll({
      where: { companyId: req.user.companyId },
      include: [
        {
          model: Payment,
          as: 'payments',
          limit: 1,
          order: [['paymentDate', 'DESC']],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      summary: {
        totalInvoices,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount),
        outstandingAmount: parseFloat(outstandingAmount),
        collectionRate: totalAmount > 0 ? (paidAmount / totalAmount * 100).toFixed(2) : 0,
      },
      statusBreakdown,
      recentInvoices,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;