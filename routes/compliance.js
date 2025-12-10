const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { ComplianceTask } = require('../models/AnalyticsAI');

const router = express.Router();

// Compliance tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, taskType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    if (status) whereClause.status = status;
    if (taskType) whereClause.taskType = taskType;

    const { count, rows: tasks } = await ComplianceTask.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'ASC']],
    });

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get compliance tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;