const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Available integrations
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const integrations = [
      {
        name: 'Shopify',
        type: 'ecommerce',
        description: 'Sync orders, customers, and inventory',
        icon: 'shopify',
        connected: false,
      },
      {
        name: 'WooCommerce',
        type: 'ecommerce',
        description: 'Sync orders, customers, and inventory',
        icon: 'woocommerce',
        connected: false,
      },
      {
        name: 'Tally',
        type: 'accounting',
        description: 'Import/export data from Tally',
        icon: 'tally',
        connected: false,
      },
      {
        name: 'Zoho Books',
        type: 'accounting',
        description: 'Sync with Zoho Books',
        icon: 'zoho',
        connected: false,
      },
      {
        name: 'Razorpay',
        type: 'payment',
        description: 'Process payments and sync transactions',
        icon: 'razorpay',
        connected: false,
      },
      {
        name: 'Stripe',
        type: 'payment',
        description: 'Process payments and sync transactions',
        icon: 'stripe',
        connected: false,
      },
    ];

    res.json({ integrations });
  } catch (error) {
    console.error('Get available integrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect integration
router.post('/connect/:integrationName', authMiddleware, [
  body('credentials').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { integrationName } = req.params;
    const { credentials } = req.body;

    // Mock connection process
    res.json({
      message: `${integrationName} integration connected successfully`,
      status: 'connected',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Connect integration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync data
router.post('/sync/:integrationName', authMiddleware, async (req, res) => {
  try {
    const { integrationName } = req.params;
    const { dataTypes } = req.body; // e.g., ['customers', 'products', 'orders']

    // Mock sync process
    const syncId = `SYNC_${Date.now()}`;
    
    res.json({
      syncId,
      message: 'Sync initiated',
      estimatedDuration: '5-10 minutes',
      dataTypes,
    });
  } catch (error) {
    console.error('Sync integration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Integration status
router.get('/status/:integrationName', authMiddleware, async (req, res) => {
  try {
    const { integrationName } = req.params;

    // Mock integration status
    const status = {
      name: integrationName,
      connected: true,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      recordsSynced: 1250,
      errors: [],
    };

    res.json({ integration: status });
  } catch (error) {
    console.error('Get integration status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;