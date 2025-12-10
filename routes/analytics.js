const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { KPIDefinition, KPIData } = require('../models/AnalyticsAI');

const router = express.Router();

// KPI Definitions
router.get('/kpi-definitions', authMiddleware, async (req, res) => {
  try {
    const kpis = await KPIDefinition.findAll({
      where: { companyId: req.user.companyId, isActive: true },
      order: [['category', 'ASC'], ['kpiName', 'ASC']],
    });
    res.json({ kpis });
  } catch (error) {
    console.error('Get KPI definitions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI Data
router.get('/kpi-data', authMiddleware, async (req, res) => {
  try {
    const { kpiId, period } = req.query;
    
    const whereClause = { kpiDefinitionId: kpiId };
    if (period) whereClause.period = period;

    const kpiData = await KPIData.findAll({
      where: whereClause,
      order: [['period', 'DESC']],
      limit: 12, // Last 12 periods
    });

    res.json({ kpiData });
  } catch (error) {
    console.error('Get KPI data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Financial Dashboard
router.get('/financial-dashboard', authMiddleware, async (req, res) => {
  try {
    // This would typically involve complex calculations
    // For now, returning mock data structure
    res.json({
      metrics: {
        revenue: { value: 1000000, trend: 'up', change: 12.5 },
        expenses: { value: 750000, trend: 'down', change: -5.2 },
        profit: { value: 250000, trend: 'up', change: 18.7 },
        cashFlow: { value: 180000, trend: 'up', change: 8.3 },
      },
      charts: {
        revenueTrend: [],
        expenseBreakdown: [],
        monthlyComparison: [],
      },
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;