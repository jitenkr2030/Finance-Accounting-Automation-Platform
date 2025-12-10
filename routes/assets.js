const express = require('express');
const { body, validationResult } = require('express-validator');
const { Asset } = require('../models/OtherEngines');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Assets routes
router.get('/assets', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    
    if (search) {
      whereClause[Op.or] = [
        { assetCode: { [Op.iLike]: `%${search}%` } },
        { assetName: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const { count, rows: assets } = await Asset.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['assetName', 'ASC']],
    });

    res.json({
      assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/assets', authMiddleware, [
  body('assetCode').notEmpty(),
  body('assetName').notEmpty(),
  body('category').notEmpty(),
  body('acquisitionDate').isISO8601(),
  body('originalCost').isFloat({ min: 0 }),
  body('usefulLife').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.create({
      ...req.body,
      companyId: req.user.companyId,
      bookValue: req.body.originalCost,
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'Asset created successfully', asset });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;