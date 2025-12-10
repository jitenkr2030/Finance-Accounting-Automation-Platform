const express = require('express');
const { body, validationResult } = require('express-validator');
const { Expense, ExpensePolicy, ExpenseReport, ExpenseReportItem } = require('../models/Expense');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Expense routes
router.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { expenseNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { merchantName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (startDate && endDate) {
      whereClause.expenseDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['expenseDate', 'DESC']],
    });

    res.json({
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/expenses', authMiddleware, [
  body('expenseNumber').notEmpty().trim(),
  body('expenseDate').isISO8601(),
  body('employeeId').notEmpty(),
  body('employeeName').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('amount').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { expenseNumber, expenseDate, employeeId, employeeName, category, subcategory, description, merchantName, amount, taxAmount, businessPurpose, projectId, department, costCenter } = req.body;

    const totalAmount = parseFloat(amount) + parseFloat(taxAmount || 0);

    const expense = await Expense.create({
      companyId: req.user.companyId,
      expenseNumber,
      expenseDate,
      employeeId,
      employeeName,
      category,
      subcategory,
      description,
      merchantName,
      amount,
      taxAmount: taxAmount || 0,
      totalAmount,
      businessPurpose,
      projectId,
      department,
      costCenter,
      status: 'draft',
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit expense for approval
router.put('/expenses/:id/submit', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
        status: 'draft',
      },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Draft expense not found' });
    }

    await expense.update({
      status: 'submitted',
      submittedAt: new Date(),
    });

    res.json({ message: 'Expense submitted for approval' });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject expense
router.put('/expenses/:id/approve', authMiddleware, [
  body('status').isIn(['approved', 'rejected']),
  body('approverComments').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, approverComments } = req.body;

    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
        status: 'submitted',
      },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Submitted expense not found' });
    }

    await expense.update({
      status,
      approvedAt: new Date(),
      approverId: req.user.userId,
      approverName: req.user.firstName + ' ' + req.user.lastName,
      approverComments,
    });

    res.json({ message: `Expense ${status} successfully` });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Expense reports
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, employeeId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const { count, rows: reports } = await ExpenseReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ExpenseReportItem,
          as: 'items',
          attributes: ['id', 'category', 'amount', 'totalAmount'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get expense reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reports', authMiddleware, [
  body('reportTitle').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('expenseIds').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportTitle, startDate, endDate, expenseIds, businessPurpose, projectId, department, costCenter } = req.body;

    // Get expenses
    const expenses = await Expense.findAll({
      where: {
        id: { [Op.in]: expenseIds },
        companyId: req.user.companyId,
        status: 'approved',
        employeeId: req.user.userId, // Only own expenses
      },
    });

    if (expenses.length === 0) {
      return res.status(400).json({ error: 'No approved expenses found for report' });
    }

    // Generate report number
    const reportCount = await ExpenseReport.count({
      where: { companyId: req.user.companyId }
    });
    const reportNumber = `ER-${String(reportCount + 1).padStart(6, '0')}`;

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0);
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += parseFloat(exp.totalAmount);
    });

    // Create report
    const report = await ExpenseReport.create({
      companyId: req.user.companyId,
      reportNumber,
      reportTitle,
      employeeId: req.user.userId,
      employeeName: req.user.firstName + ' ' + req.user.lastName,
      startDate,
      endDate,
      totalExpenses,
      approvedAmount: totalExpenses,
      status: 'draft',
      businessPurpose,
      projectId,
      department,
      costCenter,
      categoryBreakdown,
    });

    // Create report items
    for (const expense of expenses) {
      await ExpenseReportItem.create({
        expenseReportId: report.id,
        expenseId: expense.id,
        expenseDate: expense.expenseDate,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        taxAmount: expense.taxAmount,
        totalAmount: expense.totalAmount,
        approvedAmount: expense.totalAmount,
        lineNumber: report.items.length + 1,
      });
    }

    const completeReport = await ExpenseReport.findByPk(report.id, {
      include: [
        {
          model: ExpenseReportItem,
          as: 'items',
        },
      ],
    });

    res.status(201).json({ message: 'Expense report created successfully', report: completeReport });
  } catch (error) {
    console.error('Create expense report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit expense report
router.put('/reports/:id/submit', authMiddleware, async (req, res) => {
  try {
    const report = await ExpenseReport.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
        status: 'draft',
        employeeId: req.user.userId, // Only own reports
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Draft expense report not found' });
    }

    await report.update({
      status: 'submitted',
      submittedAt: new Date(),
      submittedBy: req.user.userId,
    });

    res.json({ message: 'Expense report submitted for approval' });
  } catch (error) {
    console.error('Submit expense report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Expense dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const whereClause = { companyId: req.user.companyId };

    const totalExpenses = await Expense.count({ where: whereClause });
    const pendingExpenses = await Expense.count({ where: { ...whereClause, status: 'submitted' } });
    const approvedExpenses = await Expense.count({ where: { ...whereClause, status: 'approved' } });

    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyExpenses = await Expense.sum('totalAmount', {
      where: {
        ...whereClause,
        expenseDate: {
          [Op.gte]: currentMonth,
        },
      },
    }) || 0;

    // Recent expenses
    const recentExpenses = await Expense.findAll({
      where: { companyId: req.user.companyId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Category breakdown
    const categoryBreakdown = await Expense.findAll({
      where: { ...whereClause, status: 'approved' },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']],
      group: ['category'],
      order: [[sequelize.literal('total'), 'DESC']],
    });

    res.json({
      summary: {
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        monthlyExpenses: parseFloat(monthlyExpenses),
      },
      recentExpenses,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Get expense dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;