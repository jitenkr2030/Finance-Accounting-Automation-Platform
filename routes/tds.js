const express = require('express');
const { body, validationResult } = require('express-validator');
const { TDSDeduction, TDSRate } = require('../models/OtherEngines');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// TDS Deductions
router.get('/deductions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, vendorId, section } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    if (vendorId) whereClause.vendorId = vendorId;
    if (section) whereClause.section = section;

    const { count, rows: deductions } = await TDSDeduction.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['billDate', 'DESC']],
    });

    res.json({
      deductions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get TDS deductions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/deductions', authMiddleware, [
  body('vendorId').notEmpty(),
  body('vendorName').notEmpty(),
  body('billNumber').notEmpty(),
  body('billDate').isISO8601(),
  body('billAmount').isFloat({ min: 0 }),
  body('section').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vendorId, vendorName, vendorPan, billNumber, billDate, billAmount, section } = req.body;

    // Get TDS rate for the section
    const tdsRate = await TDSRate.findOne({
      where: { section, isActive: true },
      order: [['effectiveFrom', 'DESC']],
    });

    if (!tdsRate) {
      return res.status(400).json({ error: 'TDS rate not found for this section' });
    }

    const tdsAmount = (parseFloat(billAmount) * parseFloat(tdsRate.ratePercentage)) / 100;
    const netPaymentAmount = parseFloat(billAmount) - tdsAmount;

    const deductionCount = await TDSDeduction.count({
      where: { companyId: req.user.companyId }
    });
    const deductionNumber = `TDS-${String(deductionCount + 1).padStart(6, '0')}`;

    const deduction = await TDSDeduction.create({
      companyId: req.user.companyId,
      deductionNumber,
      vendorId,
      vendorName,
      vendorPan,
      billNumber,
      billDate,
      billAmount,
      tdsRate: tdsRate.ratePercentage,
      tdsAmount,
      netPaymentAmount,
      section,
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'TDS deduction recorded successfully', deduction });
  } catch (error) {
    console.error('Create TDS deduction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;