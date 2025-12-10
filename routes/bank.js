const express = require('express');
const { body, validationResult } = require('express-validator');
const { BankAccount, BankStatement, BankTransaction } = require('../models/OtherEngines');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Bank account routes
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await BankAccount.findAll({
      where: { companyId: req.user.companyId },
      order: [['accountName', 'ASC']],
    });
    res.json({ accounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/accounts', authMiddleware, [
  body('accountName').notEmpty().trim(),
  body('accountNumber').notEmpty().trim(),
  body('bankName').notEmpty().trim(),
  body('ifscCode').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await BankAccount.create({
      ...req.body,
      companyId: req.user.companyId,
    });

    res.status(201).json({ message: 'Bank account created successfully', account });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bank statement upload
router.post('/statements/upload', authMiddleware, [
  body('bankAccountId').notEmpty(),
  body('statementDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bankAccountId, statementDate } = req.body;

    const statement = await BankStatement.create({
      companyId: req.user.companyId,
      bankAccountId,
      statementDate,
      fileName: req.file ? req.file.filename : 'manual_entry',
      uploadDate: new Date(),
      processed: false,
    });

    res.status(201).json({ message: 'Bank statement uploaded successfully', statement });
  } catch (error) {
    console.error('Upload bank statement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bank reconciliation
router.get('/reconciliation/:accountId', authMiddleware, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;

    const account = await BankAccount.findOne({
      where: { id: accountId, companyId: req.user.companyId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Get unmatched bank transactions
    const bankTransactions = await BankTransaction.findAll({
      where: {
        bankAccountId: accountId,
        isReconciled: false,
        ...(startDate && endDate && {
          transactionDate: {
            [Op.between]: [startDate, endDate],
          },
        }),
      },
      order: [['transactionDate', 'DESC']],
    });

    // Get unmatched journal entries (this would need to be implemented based on your journal entry structure)
    // For now, we'll return just the bank transactions
    res.json({
      account,
      unmatchedBankTransactions: bankTransactions,
      reconciliationSummary: {
        totalUnreconciled: bankTransactions.length,
        totalUnreconciledAmount: bankTransactions.reduce((sum, txn) => 
          sum + (parseFloat(txn.debitAmount) || 0) - (parseFloat(txn.creditAmount) || 0), 0
        ),
      },
    });
  } catch (error) {
    console.error('Bank reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;