const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initiate payment
router.post('/initiate', authMiddleware, [
  body('amount').isFloat({ min: 0 }),
  body('paymentMethod').isIn(['upi', 'netbanking', 'card', 'wallet']),
  body('referenceId').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, paymentMethod, referenceId, customerDetails } = req.body;

    // Mock payment initiation
    const paymentId = `PAY_${Date.now()}`;
    const paymentUrl = `https://payment-gateway.com/pay/${paymentId}`;

    res.json({
      paymentId,
      paymentUrl,
      amount,
      status: 'initiated',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment status
router.get('/status/:paymentId', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Mock payment status
    const mockStatus = {
      paymentId,
      status: 'pending',
      amount: 1000,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json({ payment: mockStatus });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook for payment updates
router.post('/webhook', async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    // Process webhook (would update payment records, etc.)
    console.log('Payment webhook received:', { paymentId, status, transactionId });

    res.json({ received: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;