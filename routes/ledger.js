const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { ChartOfAccounts, JournalEntry, JournalLineItem } = require('../models/Ledger');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all chart of accounts
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, accountType, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { accountCode: { [Op.iLike]: `%${search}%` } },
        { accountName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (accountType) {
      whereClause.accountType = accountType;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: accounts } = await ChartOfAccounts.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['accountCode', 'ASC']],
    });

    res.json({
      accounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new account
router.post('/accounts', authMiddleware, [
  body('accountCode').notEmpty().trim(),
  body('accountName').notEmpty().trim(),
  body('accountType').isIn(['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs', 'other_income', 'other_expense']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountCode, accountName, accountType, accountSubType, parentAccountId, description, openingBalance } = req.body;

    // Check if account code already exists
    const existingAccount = await ChartOfAccounts.findOne({
      where: { accountCode, companyId: req.user.companyId }
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Account code already exists' });
    }

    const account = await ChartOfAccounts.create({
      companyId: req.user.companyId,
      accountCode,
      accountName,
      accountType,
      accountSubType,
      parentAccountId,
      description,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
      createdBy: req.user.userId,
    });

    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account by ID
router.get('/accounts/:id', authMiddleware, async (req, res) => {
  try {
    const account = await ChartOfAccounts.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: JournalLineItem,
          as: 'journalEntries',
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              order: [['entryDate', 'DESC']],
              limit: 10,
            },
          ],
        },
      ],
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update account
router.put('/accounts/:id', authMiddleware, [
  body('accountName').optional().notEmpty().trim(),
  body('accountType').optional().isIn(['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs', 'other_income', 'other_expense']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await ChartOfAccounts.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Don't allow changing system accounts
    if (account.isSystemAccount) {
      return res.status(400).json({ error: 'Cannot modify system accounts' });
    }

    const { accountName, accountSubType, description, isActive } = req.body;

    await account.update({
      accountName: accountName || account.accountName,
      accountSubType: accountSubType || account.accountSubType,
      description: description || account.description,
      isActive: isActive !== undefined ? isActive : account.isActive,
    });

    res.json({ message: 'Account updated successfully', account });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/accounts/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const account = await ChartOfAccounts.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: JournalLineItem,
          as: 'journalEntries',
          limit: 1,
        },
      ],
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Don't allow deleting system accounts or accounts with transactions
    if (account.isSystemAccount) {
      return res.status(400).json({ error: 'Cannot delete system accounts' });
    }

    if (account.journalEntries && account.journalEntries.length > 0) {
      return res.status(400).json({ error: 'Cannot delete account with existing transactions' });
    }

    await account.destroy();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get journal entries
router.get('/journal-entries', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, startDate, endDate, status, source } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { entryNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (startDate && endDate) {
      whereClause.entryDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (source) {
      whereClause.source = source;
    }

    const { count, rows: journalEntries } = await JournalEntry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: JournalLineItem,
          as: 'lineItems',
          include: [
            {
              model: ChartOfAccounts,
              as: 'account',
              attributes: ['id', 'accountCode', 'accountName', 'accountType'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['entryDate', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      journalEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create journal entry
router.post('/journal-entries', authMiddleware, [
  body('entryDate').isISO8601(),
  body('description').notEmpty().trim(),
  body('lineItems').isArray({ min: 2 }),
  body('lineItems.*.accountId').notEmpty(),
  body('lineItems.*.debitAmount').optional().isFloat({ min: 0 }),
  body('lineItems.*.creditAmount').optional().isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entryDate, referenceNumber, description, lineItems } = req.body;

    // Validate that at least one line item has amount
    const validLineItems = lineItems.filter(item => 
      (item.debitAmount && item.debitAmount > 0) || 
      (item.creditAmount && item.creditAmount > 0)
    );

    if (validLineItems.length < 2) {
      return res.status(400).json({ error: 'At least two line items with amounts are required' });
    }

    // Calculate totals
    const totalDebit = validLineItems.reduce((sum, item) => sum + (parseFloat(item.debitAmount) || 0), 0);
    const totalCredit = validLineItems.reduce((sum, item) => sum + (parseFloat(item.creditAmount) || 0), 0);

    // Check if journal entry is balanced
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ 
        error: 'Journal entry is not balanced',
        totalDebit,
        totalCredit,
        difference: totalDebit - totalCredit
      });
    }

    // Generate entry number
    const entryCount = await JournalEntry.count({
      where: { companyId: req.user.companyId }
    });
    const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

    // Create journal entry with line items
    const journalEntry = await JournalEntry.create({
      companyId: req.user.companyId,
      entryNumber,
      entryDate,
      referenceNumber,
      description,
      totalDebit,
      totalCredit,
      status: 'draft',
      isBalanced: true,
      createdBy: req.user.userId,
    });

    // Create line items
    for (let i = 0; i < validLineItems.length; i++) {
      const item = validLineItems[i];
      await JournalLineItem.create({
        journalEntryId: journalEntry.id,
        accountId: item.accountId,
        description: item.description || description,
        debitAmount: parseFloat(item.debitAmount) || 0,
        creditAmount: parseFloat(item.creditAmount) || 0,
        lineNumber: i + 1,
        referenceType: item.referenceType,
        referenceId: item.referenceId,
      });
    }

    // Fetch the complete journal entry with line items
    const completeJournalEntry = await JournalEntry.findByPk(journalEntry.id, {
      include: [
        {
          model: JournalLineItem,
          as: 'lineItems',
          include: [
            {
              model: ChartOfAccounts,
              as: 'account',
              attributes: ['id', 'accountCode', 'accountName', 'accountType'],
            },
          ],
        },
      ],
    });

    res.status(201).json({ 
      message: 'Journal entry created successfully',
      journalEntry: completeJournalEntry 
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get journal entry by ID
router.get('/journal-entries/:id', authMiddleware, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: JournalLineItem,
          as: 'lineItems',
          include: [
            {
              model: ChartOfAccounts,
              as: 'account',
              attributes: ['id', 'accountCode', 'accountName', 'accountType'],
            },
          ],
          order: [['lineNumber', 'ASC']],
        },
      ],
    });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json({ journalEntry });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post journal entry
router.put('/journal-entries/:id/post', authMiddleware, roleMiddleware(['admin', 'accountant']), async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: JournalLineItem,
          as: 'lineItems',
          include: [
            {
              model: ChartOfAccounts,
              as: 'account',
            },
          ],
        },
      ],
    });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (journalEntry.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft journal entries can be posted' });
    }

    if (!journalEntry.isBalanced) {
      return res.status(400).json({ error: 'Cannot post unbalanced journal entry' });
    }

    // Update account balances
    for (const lineItem of journalEntry.lineItems) {
      const account = lineItem.account;
      const debitAmount = parseFloat(lineItem.debitAmount) || 0;
      const creditAmount = parseFloat(lineItem.creditAmount) || 0;
      
      // For asset and expense accounts: debit increases balance
      // For liability, equity, and revenue accounts: credit increases balance
      let balanceChange = 0;
      if (['asset', 'expense'].includes(account.accountType)) {
        balanceChange = debitAmount - creditAmount;
      } else {
        balanceChange = creditAmount - debitAmount;
      }

      await account.update({
        currentBalance: parseFloat(account.currentBalance) + balanceChange,
      });
    }

    // Update journal entry status
    await journalEntry.update({
      status: 'posted',
      postedBy: req.user.userId,
      postedAt: new Date(),
    });

    res.json({ message: 'Journal entry posted successfully' });
  } catch (error) {
    console.error('Post journal entry error:', error);
    res.status(500).json({ server error' });
 error: 'Internal  }
});

// Get trial balance
router.get('/trial-balance', authMiddleware, async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const targetDate = asOfDate ? new Date(asOfDate) : new Date();

    const accounts = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        isActive: true,
      },
      include: [
        {
          model: JournalLineItem,
          as: 'journalEntries',
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              where: {
                status: 'posted',
                entryDate: {
                  [Op.lte]: targetDate,
                },
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
    });

    // Calculate account balances
    const trialBalance = accounts.map(account => {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const journalEntry of account.journalEntries) {
        totalDebit += parseFloat(journalEntry.debitAmount) || 0;
        totalCredit += parseFloat(journalEntry.creditAmount) || 0;
      }

      let balance = 0;
      if (['asset', 'expense'].includes(account.accountType)) {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        accountId: account.id,
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        openingBalance: parseFloat(account.openingBalance) || 0,
        totalDebit,
        totalCredit,
        balance: parseFloat(account.currentBalance) || balance,
        debitBalance: balance > 0 && ['asset', 'expense'].includes(account.accountType) ? Math.abs(balance) : 0,
        creditBalance: balance > 0 && ['liability', 'equity', 'revenue'].includes(account.accountType) ? Math.abs(balance) : 0,
      };
    });

    // Calculate totals
    const totalDebits = trialBalance.reduce((sum, acc) => sum + acc.debitBalance, 0);
    const totalCredits = trialBalance.reduce((sum, acc) => sum + acc.creditBalance, 0);

    res.json({
      trialBalance,
      summary: {
        totalDebits,
        totalCredits,
        difference: totalDebits - totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        asOfDate: targetDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Get trial balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;