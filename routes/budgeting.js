const express = require('express');
const { body, validationResult } = require('express-validator');
const { Budget, BudgetLineItem } = require('../models/AnalyticsAI');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Budgets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, fiscalYear } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fiscalYear', 'DESC']],
    });

    res.json({
      budgets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, [
  body('budgetName').notEmpty(),
  body('fiscalYear').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.create({
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'Budget created successfully', budget });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;