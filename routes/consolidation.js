const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Multi-entity consolidation
router.get('/entities', authMiddleware, async (req, res) => {
  try {
    // Mock entities data
    const entities = [
      {
        id: 'entity1',
        name: 'Parent Company',
        type: 'parent',
        ownership: 100,
        currency: 'INR',
        consolidated: true,
      },
      {
        id: 'entity2',
        name: 'Subsidiary A',
        type: 'subsidiary',
        ownership: 75,
        currency: 'USD',
        consolidated: true,
      },
      {
        id: 'entity3',
        name: 'Subsidiary B',
        type: 'subsidiary',
        ownership: 60,
        currency: 'EUR',
        consolidated: false,
      },
    ];

    res.json({ entities });
  } catch (error) {
    console.error('Get entities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate consolidated report
router.post('/generate-report', authMiddleware, async (req, res) => {
  try {
    const { reportType, period } = req.body;

    // Mock consolidated report
    const report = {
      reportType,
      period,
      entities: ['entity1', 'entity2'],
      consolidatedFinancials: {
        revenue: 2000000,
        expenses: 1500000,
        netIncome: 500000,
        totalAssets: 5000000,
        totalLiabilities: 2000000,
        equity: 3000000,
      },
      intercompanyEliminations: [
        {
          description: 'Intercompany sales elimination',
          amount: 100000,
        },
      ],
    };

    res.json({ report });
  } catch (error) {
    console.error('Generate consolidated report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;