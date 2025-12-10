const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { ChartOfAccounts, JournalEntry, Invoice, Payment } = require('../models/Ledger');
const { Customer, Vendor } = require('../models/CustomerVendor');
const { sequelize } = require('../config/database');

const router = express.Router();

// Trial Balance
router.get('/trial-balance', authMiddleware, async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const targetDate = asOfDate ? new Date(asOfDate) : new Date();

    const accounts = await ChartOfAccounts.findAll({
      where: { companyId: req.user.companyId, isActive: true },
      include: [
        {
          model: require('../models/Ledger').JournalLineItem,
          as: 'journalEntries',
          include: [
            {
              model: require('../models/Ledger').JournalEntry,
              as: 'journalEntry',
              where: {
                status: 'posted',
                entryDate: { [Op.lte]: targetDate },
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
    });

    const trialBalance = accounts.map(account => {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const entry of account.journalEntries || []) {
        totalDebit += parseFloat(entry.debitAmount) || 0;
        totalCredit += parseFloat(entry.creditAmount) || 0;
      }

      let balance = 0;
      if (['asset', 'expense'].includes(account.accountType)) {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance: balance > 0 && ['asset', 'expense'].includes(account.accountType) ? Math.abs(balance) : 0,
        creditBalance: balance > 0 && ['liability', 'equity', 'revenue'].includes(account.accountType) ? Math.abs(balance) : 0,
      };
    });

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

// Balance Sheet
router.get('/balance-sheet', authMiddleware, async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const targetDate = asOfDate ? new Date(asOfDate) : new Date();

    const accounts = await ChartOfAccounts.findAll({
      where: { companyId: req.user.companyId, isActive: true },
      order: [['accountType', 'ASC'], ['accountCode', 'ASC']],
    });

    const balanceSheet = {
      assets: [],
      liabilities: [],
      equity: [],
    };

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    for (const account of accounts) {
      const balance = parseFloat(account.currentBalance) || 0;
      
      if (account.accountType === 'asset') {
        balanceSheet.assets.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          balance: Math.abs(balance),
        });
        totalAssets += Math.abs(balance);
      } else if (account.accountType === 'liability') {
        balanceSheet.liabilities.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          balance: Math.abs(balance),
        });
        totalLiabilities += Math.abs(balance);
      } else if (account.accountType === 'equity') {
        balanceSheet.equity.push({
          accountCode: account.accountCode,
          accountName: account.accountName,
          balance: Math.abs(balance),
        });
        totalEquity += Math.abs(balance);
      }
    }

    res.json({
      balanceSheet,
      summary: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        asOfDate: targetDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Get balance sheet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profit & Loss Statement
router.get('/profit-loss', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const revenueAccounts = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        accountType: 'revenue',
        isActive: true,
      },
    });

    const expenseAccounts = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        accountType: 'expense',
        isActive: true,
      },
    });

    const revenue = revenueAccounts.reduce((sum, account) => sum + Math.abs(parseFloat(account.currentBalance) || 0), 0);
    const expenses = expenseAccounts.reduce((sum, account) => sum + Math.abs(parseFloat(account.currentBalance) || 0), 0);
    const netProfit = revenue - expenses;

    res.json({
      profitLoss: {
        revenue: revenueAccounts.map(acc => ({
          accountCode: acc.accountCode,
          accountName: acc.accountName,
          amount: Math.abs(parseFloat(acc.currentBalance) || 0),
        })),
        expenses: expenseAccounts.map(acc => ({
          accountCode: acc.accountCode,
          accountName: acc.accountName,
          amount: Math.abs(parseFloat(acc.currentBalance) || 0),
        })),
      },
      summary: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0,
        period: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error('Get P&L error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cash Flow Statement
router.get('/cash-flow', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Simplified cash flow calculation
    const cashAccounts = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        accountCode: { [Op.like]: 'cash%' },
        isActive: true,
      },
    });

    const bankAccounts = await ChartOfAccounts.findAll({
      where: {
        companyId: req.user.companyId,
        accountCode: { [Op.like]: 'bank%' },
        isActive: true,
      },
    });

    const totalCash = cashAccounts.reduce((sum, acc) => sum + Math.abs(parseFloat(acc.currentBalance) || 0), 0);
    const totalBank = bankAccounts.reduce((sum, acc) => sum + Math.abs(parseFloat(acc.currentBalance) || 0), 0);

    res.json({
      cashFlow: {
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
      },
      summary: {
        beginningCash: 0, // Would need historical data
        netCashFlow: 0, // Would need to calculate from transactions
        endingCash: totalCash + totalBank,
        totalCash,
        totalBank,
      },
    });
  } catch (error) {
    console.error('Get cash flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Aging Report (Accounts Receivable)
router.get('/aging-receivable', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: {
        companyId: req.user.companyId,
        status: { [Op.in]: ['sent', 'partial'] },
      },
      order: [['dueDate', 'ASC']],
    });

    const today = new Date();
    const aging = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
      total: 0,
    };

    invoices.forEach(invoice => {
      const amountDue = parseFloat(invoice.amountDue) || 0;
      const dueDate = new Date(invoice.dueDate);
      const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      aging.total += amountDue;

      if (daysPastDue <= 0) {
        aging.current += amountDue;
      } else if (daysPastDue <= 30) {
        aging['1-30'] += amountDue;
      } else if (daysPastDue <= 60) {
        aging['31-60'] += amountDue;
      } else if (daysPastDue <= 90) {
        aging['61-90'] += amountDue;
      } else {
        aging['90+'] += amountDue;
      }
    });

    res.json({ aging, invoices: invoices.slice(0, 50) }); // Limit to 50 for performance
  } catch (error) {
    console.error('Get aging report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;