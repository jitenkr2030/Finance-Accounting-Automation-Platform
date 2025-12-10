const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { AuditLog } = require('../models/AnalyticsAI');

const router = express.Router();

// Audit logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, entity, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    if (userId) whereClause.userId = userId;
    if (entity) whereClause.entity = entity;
    if (action) whereClause.action = action;
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']],
    });

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;