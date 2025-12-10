const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Cash flow automation
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Mock cash flow calculation
    const cashFlow = {
      period: { startDate, endDate },
      operatingActivities: {
        inflow: 500000,
        outflow: 300000,
        net: 200000,
      },
      investingActivities: {
        inflow: 50000,
        outflow: 100000,
        net: -50000,
      },
      financingActivities: {
        inflow: 200000,
        outflow: 50000,
        net: 150000,
      },
      summary: {
        totalInflow: 750000,
        totalOutflow: 450000,
        netCashFlow: 300000,
        beginningCash: 200000,
        endingCash: 500000,
      },
    };

    res.json({ cashFlow });
  } catch (error) {
    console.error('Run cash flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;