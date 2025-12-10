const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// AI Accountant Chat
router.post('/accountant/chat', authMiddleware, [
  body('message').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;

    // In a real implementation, this would call an AI service
    // For now, returning a mock response
    const responses = [
      "I can help you with your accounting questions. What specific topic would you like to discuss?",
      "Based on your financial data, I recommend reviewing your expense categories for potential savings.",
      "Your cash flow looks healthy this month. Would you like me to analyze any specific transactions?",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    res.json({
      response: randomResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Transaction Classification
router.post('/classify-transaction', authMiddleware, async (req, res) => {
  try {
    const { description, amount } = req.body;

    // Mock AI classification
    const mockClassification = {
      category: 'Office Supplies',
      confidence: 0.85,
      subcategory: 'Stationery',
      suggestedAccount: 'Office Expenses',
    };

    res.json({ classification: mockClassification });
  } catch (error) {
    console.error('Transaction classification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Anomaly Detection
router.get('/anomaly-detection', authMiddleware, async (req, res) => {
  try {
    // Mock anomaly detection results
    const anomalies = [
      {
        type: 'Unusual Expense Amount',
        description: 'Expense amount 300% higher than average',
        severity: 'medium',
        date: '2023-12-01',
      },
      {
        type: 'Duplicate Transaction',
        description: 'Similar transaction detected',
        severity: 'low',
        date: '2023-11-28',
      },
    ];

    res.json({ anomalies });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;