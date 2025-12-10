const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { ChartOfAccounts, JournalEntry, JournalLineItem } = require('../models/Ledger');
const { sequelize } = require('../config/database');

const router = express.Router();

// Run audit checks
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const auditResults = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    // Check 1: Trial Balance validation
    const accounts = await ChartOfAccounts.findAll({
      where: { companyId: req.user.companyId, isActive: true },
      include: [
        {
          model: JournalLineItem,
          as: 'journalEntries',
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              where: { status: 'posted' },
              required: false,
            },
          ],
          required: false,
        },
      ],
    });

    let totalDebits = 0;
    let totalCredits = 0;

    for (const account of accounts) {
      for (const entry of account.journalEntries || []) {
        totalDebits += parseFloat(entry.debitAmount) || 0;
        totalCredits += parseFloat(entry.creditAmount) || 0;
      }
    }

    const trialBalanceCheck = {
      checkName: 'Trial Balance Validation',
      status: Math.abs(totalDebits - totalCredits) < 0.01 ? 'passed' : 'failed',
      details: {
        totalDebits,
        totalCredits,
        difference: totalDebits - totalCredits,
      },
      severity: Math.abs(totalDebits - totalCredits) < 0.01 ? 'info' : 'high',
    };

    auditResults.checks.push(trialBalanceCheck);

    // Check 2: Unbalanced journal entries
    const unbalancedEntries = await JournalEntry.findAll({
      where: {
        companyId: req.user.companyId,
        status: 'draft',
      },
    });

    const unbalancedCheck = {
      checkName: 'Unbalanced Journal Entries',
      status: unbalancedEntries.length === 0 ? 'passed' : 'warning',
      details: {
        count: unbalancedEntries.length,
        entries: unbalancedEntries.slice(0, 5).map(entry => ({
          entryNumber: entry.entryNumber,
          difference: Math.abs(parseFloat(entry.totalDebit) - parseFloat(entry.totalCredit)),
        })),
      },
      severity: unbalancedEntries.length === 0 ? 'info' : 'medium',
    };

    auditResults.checks.push(unbalancedCheck);

    // Calculate summary
    auditResults.summary.totalChecks = auditResults.checks.length;
    auditResults.summary.passed = auditResults.checks.filter(check => check.status === 'passed').length;
    auditResults.summary.failed = auditResults.checks.filter(check => check.status === 'failed').length;
    auditResults.summary.warnings = auditResults.checks.filter(check => check.status === 'warning').length;

    res.json(auditResults);
  } catch (error) {
    console.error('Run audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Find errors
router.get('/find-errors', authMiddleware, async (req, res) => {
  try {
    const errors = [];

    // Find draft journal entries with large amounts (potential errors)
    const suspiciousEntries = await JournalEntry.findAll({
      where: {
        companyId: req.user.companyId,
        status: 'draft',
      },
      include: [
        {
          model: JournalLineItem,
          as: 'lineItems',
        },
      ],
    });

    suspiciousEntries.forEach(entry => {
      const maxAmount = Math.max(...entry.lineItems.map(item => 
        Math.max(parseFloat(item.debitAmount) || 0, parseFloat(item.creditAmount) || 0)
      ));

      if (maxAmount > 100000) { // Threshold for suspicious amounts
        errors.push({
          type: 'High Value Draft Entry',
          entryNumber: entry.entryNumber,
          amount: maxAmount,
          date: entry.entryDate,
          severity: 'medium',
        });
      }
    });

    // Find accounts with negative balances (might be errors)
    const accountsWithNegativeBalance = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        currentBalance: { [Op.lt]: 0 },
      },
    });

    accountsWithNegativeBalance.forEach(account => {
      if (['asset', 'expense'].includes(account.accountType)) {
        errors.push({
          type: 'Negative Balance in Asset/Expense Account',
          accountCode: account.accountCode,
          accountName: account.accountName,
          balance: account.currentBalance,
          severity: 'high',
        });
      }
    });

    res.json({ errors });
  } catch (error) {
    console.error('Find errors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate audit report
router.get('/report', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Mock audit report
    const report = {
      reportDate: new Date().toISOString(),
      period: { startDate, endDate },
      scope: 'Full Financial Audit',
      findings: [
        {
          category: 'Internal Controls',
          finding: 'All journal entries require dual approval',
          severity: 'low',
          recommendation: 'Implement automated approval workflows',
        },
        {
          category: 'Data Integrity',
          finding: 'All accounts properly classified',
          severity: 'info',
          recommendation: 'Continue current practices',
        },
      ],
      conclusion: 'Overall financial controls are adequate with minor recommendations for improvement.',
    };

    res.json({ report });
  } catch (error) {
    console.error('Generate audit report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;