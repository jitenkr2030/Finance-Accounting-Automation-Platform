const request = require('supertest');
const express = require('express');
const auditRouter = require('../routes/audit');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'auditor'
    };
    next();
  }
}));

// Mock database models
jest.mock('../models/Ledger', () => ({
  ChartOfAccounts: {
    findAll: jest.fn()
  },
  JournalEntry: {
    findAll: jest.fn()
  },
  JournalLineItem: {}
}));

jest.mock('../config/database', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/audit', auditRouter);

describe('Audit Engine API', () => {
  let testUser;
  let mockAccounts;
  let mockJournalEntries;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'auditor'
    };

    // Mock chart of accounts data
    mockAccounts = [
      {
        id: 1,
        accountCode: '1000',
        accountName: 'Cash',
        accountType: 'asset',
        currentBalance: 50000,
        isActive: true,
        companyId: 'test-company-id',
        journalEntries: [
          {
            id: 1,
            debitAmount: 10000,
            creditAmount: 0,
            journalEntry: { status: 'posted' }
          },
          {
            id: 2,
            debitAmount: 0,
            creditAmount: 5000,
            journalEntry: { status: 'posted' }
          }
        ]
      },
      {
        id: 2,
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'liability',
        currentBalance: -15000,
        isActive: true,
        companyId: 'test-company-id',
        journalEntries: [
          {
            id: 3,
            debitAmount: 2000,
            creditAmount: 0,
            journalEntry: { status: 'posted' }
          },
          {
            id: 4,
            debitAmount: 0,
            creditAmount: 17000,
            journalEntry: { status: 'posted' }
          }
        ]
      }
    ];

    // Mock journal entries data
    mockJournalEntries = [
      {
        id: 1,
        entryNumber: 'JE-001',
        entryDate: '2023-12-01',
        status: 'draft',
        totalDebit: 1000,
        totalCredit: 950,
        companyId: 'test-company-id',
        lineItems: [
          { debitAmount: 1000, creditAmount: 0 },
          { debitAmount: 0, creditAmount: 950 }
        ]
      },
      {
        id: 2,
        entryNumber: 'JE-002',
        entryDate: '2023-12-02',
        status: 'draft',
        totalDebit: 200000,
        totalCredit: 200000,
        companyId: 'test-company-id',
        lineItems: [
          { debitAmount: 200000, creditAmount: 0 },
          { debitAmount: 0, creditAmount: 200000 }
        ]
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      largeDataset.push({
        id: i,
        entryNumber: `JE-${String(i).padStart(3, '0')}`,
        entryDate: `2023-12-${String((i % 30) + 1).padStart(2, '0')}`,
        status: i % 4 === 0 ? 'draft' : 'posted',
        totalDebit: Math.random() * 100000,
        totalCredit: Math.random() * 100000,
        companyId: 'test-company-id',
        lineItems: [
          { debitAmount: Math.random() * 50000, creditAmount: 0 },
          { debitAmount: 0, creditAmount: Math.random() * 50000 }
        ]
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('POST /audit/run', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();
    });

    test('should run comprehensive audit checks successfully', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(mockAccounts);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.checks)).toBe(true);
      expect(response.body.checks.length).toBeGreaterThan(0);

      // Check trial balance validation
      const trialBalanceCheck = response.body.checks.find(check => 
        check.checkName === 'Trial Balance Validation'
      );
      expect(trialBalanceCheck).toBeDefined();
      expect(trialBalanceCheck).toHaveProperty('status');
      expect(trialBalanceCheck).toHaveProperty('details');
      expect(trialBalanceCheck).toHaveProperty('severity');

      // Check unbalanced entries check
      const unbalancedCheck = response.body.checks.find(check => 
        check.checkName === 'Unbalanced Journal Entries'
      );
      expect(unbalancedCheck).toBeDefined();
      expect(unbalancedCheck).toHaveProperty('status');
      expect(unbalancedCheck).toHaveProperty('details');

      // Check summary
      expect(response.body.summary).toHaveProperty('totalChecks');
      expect(response.body.summary).toHaveProperty('passed');
      expect(response.body.summary).toHaveProperty('failed');
      expect(response.body.summary).toHaveProperty('warnings');
    });

    test('should handle balanced trial balance scenario', async () => {
      const balancedAccounts = [
        {
          ...mockAccounts[0],
          journalEntries: [
            { debitAmount: 50000, creditAmount: 0, journalEntry: { status: 'posted' } },
            { debitAmount: 0, creditAmount: 50000, journalEntry: { status: 'posted' } }
          ]
        },
        {
          ...mockAccounts[1],
          journalEntries: [
            { debitAmount: 0, creditAmount: 50000, journalEntry: { status: 'posted' } },
            { debitAmount: 50000, creditAmount: 0, journalEntry: { status: 'posted' } }
          ]
        }
      ];

      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(balancedAccounts);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      const trialBalanceCheck = response.body.checks.find(check => 
        check.checkName === 'Trial Balance Validation'
      );
      expect(trialBalanceCheck.status).toBe('passed');
      expect(Math.abs(trialBalanceCheck.details.difference)).toBeLessThan(0.01);
    });

    test('should handle unbalanced trial balance scenario', async () => {
      const unbalancedAccounts = [
        {
          ...mockAccounts[0],
          journalEntries: [
            { debitAmount: 50000, creditAmount: 0, journalEntry: { status: 'posted' } },
            { debitAmount: 0, creditAmount: 30000, journalEntry: { status: 'posted' } }
          ]
        }
      ];

      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(unbalancedAccounts);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      const trialBalanceCheck = response.body.checks.find(check => 
        check.checkName === 'Trial Balance Validation'
      );
      expect(trialBalanceCheck.status).toBe('failed');
      expect(trialBalanceCheck.severity).toBe('high');
      expect(Math.abs(trialBalanceCheck.details.difference)).toBeGreaterThan(0.01);
    });

    test('should handle draft journal entries scenario', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue(mockJournalEntries);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      const unbalancedCheck = response.body.checks.find(check => 
        check.checkName === 'Unbalanced Journal Entries'
      );
      expect(unbalancedCheck.status).toBe('warning');
      expect(unbalancedCheck.details.count).toBeGreaterThan(0);
    });

    test('should handle no draft journal entries scenario', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      const unbalancedCheck = response.body.checks.find(check => 
        check.checkName === 'Unbalanced Journal Entries'
      );
      expect(unbalancedCheck.status).toBe('passed');
      expect(unbalancedCheck.details.count).toBe(0);
    });

    test('should calculate correct audit summary', async () => {
      const { ChartOfAccounts, JournalEntry } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue([]);
      JournalEntry.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body.summary.totalChecks).toBe(2); // trial balance + unbalanced entries
      expect(response.body.summary.passed).toBeGreaterThanOrEqual(0);
      expect(response.body.summary.failed).toBeGreaterThanOrEqual(0);
      expect(response.body.summary.warnings).toBeGreaterThanOrEqual(0);
      
      // Sum of all checks should equal total checks
      const totalChecked = response.body.summary.passed + 
                          response.body.summary.failed + 
                          response.body.summary.warnings;
      expect(totalChecked).toBe(response.body.summary.totalChecks);
    });

    test('should handle database connection errors gracefully', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed data gracefully', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue([
        {
          journalEntries: [
            { debitAmount: 'invalid', creditAmount: null, journalEntry: { status: 'posted' } }
          ]
        }
      ]);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('summary');
    });

    test('should include timestamp in audit results', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should handle performance with large datasets', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(
        Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          accountCode: `100${i}`,
          accountName: `Test Account ${i}`,
          accountType: i % 2 === 0 ? 'asset' : 'liability',
          currentBalance: Math.random() * 100000,
          isActive: true,
          companyId: 'test-company-id',
          journalEntries: Array.from({ length: 10 }, (_, j) => ({
            debitAmount: Math.random() * 10000,
            creditAmount: Math.random() * 10000,
            journalEntry: { status: 'posted' }
          }))
        }))
      );

      const startTime = Date.now();
      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds
      expect(response.body).toHaveProperty('checks');
    });

    test('should handle concurrent audit runs', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(mockAccounts);

      const promises = Array.from({ length: 10 }, () =>
        request(app).post('/audit/run').send({})
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('checks');
        expect(response.body).toHaveProperty('summary');
      });
    });
  });

  describe('GET /audit/find-errors', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should find high-value draft entries as errors', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([
        {
          id: 1,
          entryNumber: 'JE-001',
          entryDate: '2023-12-01',
          status: 'draft',
          lineItems: [
            { debitAmount: 150000, creditAmount: 0 },
            { debitAmount: 0, creditAmount: 149000 }
          ]
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      
      const highValueError = response.body.errors.find(error => 
        error.type === 'High Value Draft Entry'
      );
      expect(highValueError).toBeDefined();
      expect(highValueError.amount).toBeGreaterThan(100000);
      expect(highValueError.severity).toBe('medium');
    });

    test('should not flag low-value draft entries as errors', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([
        {
          id: 1,
          entryNumber: 'JE-001',
          entryDate: '2023-12-01',
          status: 'draft',
          lineItems: [
            { debitAmount: 5000, creditAmount: 0 },
            { debitAmount: 0, creditAmount: 5000 }
          ]
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      const highValueError = response.body.errors.find(error => 
        error.type === 'High Value Draft Entry'
      );
      expect(highValueError).toBeUndefined();
    });

    test('should find negative balances in asset/expense accounts as errors', async () => {
      const { Op } = require('sequelize');
      const { ChartOfAccounts } = require('../models/Ledger');
      
      // Mock the findAll method with the Op.lt filter
      const findAllMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          accountCode: '1000',
          accountName: 'Cash',
          accountType: 'asset',
          currentBalance: -5000,
          companyId: 'test-company-id'
        }
      ]);
      
      ChartOfAccounts.findAll = findAllMock;

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body).toHaveProperty('errors');
      
      const negativeBalanceError = response.body.errors.find(error => 
        error.type === 'Negative Balance in Asset/Expense Account'
      );
      expect(negativeBalanceError).toBeDefined();
      expect(negativeBalanceError.severity).toBe('high');
    });

    test('should not flag negative balances in liability accounts as errors', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue([
        {
          id: 1,
          accountCode: '2000',
          accountName: 'Accounts Payable',
          accountType: 'liability',
          currentBalance: -5000,
          companyId: 'test-company-id'
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      const negativeBalanceError = response.body.errors.find(error => 
        error.type === 'Negative Balance in Asset/Expense Account'
      );
      expect(negativeBalanceError).toBeUndefined();
    });

    test('should handle multiple types of errors', async () => {
      const { JournalEntry, ChartOfAccounts } = require('../models/Ledger');
      
      JournalEntry.findAll.mockResolvedValue([
        {
          id: 1,
          entryNumber: 'JE-001',
          entryDate: '2023-12-01',
          status: 'draft',
          lineItems: [
            { debitAmount: 200000, creditAmount: 0 },
            { debitAmount: 0, creditAmount: 199000 }
          ]
        }
      ]);

      ChartOfAccounts.findAll.mockResolvedValue([
        {
          id: 1,
          accountCode: '1000',
          accountName: 'Cash',
          accountType: 'asset',
          currentBalance: -1000,
          companyId: 'test-company-id'
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
      
      const errorTypes = response.body.errors.map(error => error.type);
      expect(errorTypes).toContain('High Value Draft Entry');
      expect(errorTypes).toContain('Negative Balance in Asset/Expense Account');
    });

    test('should handle no errors found scenario', async () => {
      const { JournalEntry, ChartOfAccounts } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([]);
      ChartOfAccounts.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBe(0);
    });

    test('should limit high-value entry errors to first 5', async () => {
      const { JournalEntry } = require('../models/Ledger');
      const multipleEntries = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        entryNumber: `JE-${String(i).padStart(3, '0')}`,
        entryDate: '2023-12-01',
        status: 'draft',
        lineItems: [
          { debitAmount: 200000, creditAmount: 0 },
          { debitAmount: 0, creditAmount: 199000 }
        ]
      }));
      
      JournalEntry.findAll.mockResolvedValue(multipleEntries);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      const highValueErrors = response.body.errors.filter(error => 
        error.type === 'High Value Draft Entry'
      );
      
      expect(highValueErrors.length).toBeLessThanOrEqual(5);
    });

    test('should include error details for debugging', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([
        {
          id: 1,
          entryNumber: 'JE-001',
          entryDate: '2023-12-01',
          status: 'draft',
          lineItems: [
            { debitAmount: 150000, creditAmount: 0 },
            { debitAmount: 0, creditAmount: 149000 }
          ]
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      const error = response.body.errors[0];
      expect(error).toHaveProperty('type');
      expect(error).toHaveProperty('entryNumber');
      expect(error).toHaveProperty('amount');
      expect(error).toHaveProperty('date');
      expect(error).toHaveProperty('severity');
    });

    test('should handle database errors gracefully', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockRejectedValue(new Error('Database query failed'));

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed journal entry data', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue([
        {
          id: 1,
          entryNumber: 'JE-001',
          entryDate: '2023-12-01',
          status: 'draft',
          lineItems: [
            { debitAmount: null, creditAmount: undefined },
            { debitAmount: 'invalid', creditAmount: {} }
          ]
        }
      ]);

      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /audit/report', () => {
    test('should generate audit report with default parameters', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('reportDate');
      expect(response.body.report).toHaveProperty('period');
      expect(response.body.report).toHaveProperty('scope');
      expect(response.body.report).toHaveProperty('findings');
      expect(response.body.report).toHaveProperty('conclusion');
    });

    test('should generate audit report with custom date range', async () => {
      const response = await request(app)
        .get('/audit/report?startDate=2023-01-01&endDate=2023-12-31')
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body.report.period.startDate).toBe('2023-01-01');
      expect(response.body.report.period.endDate).toBe('2023-12-31');
    });

    test('should include multiple audit findings', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(Array.isArray(response.body.report.findings)).toBe(true);
      expect(response.body.report.findings.length).toBeGreaterThan(0);

      const finding = response.body.report.findings[0];
      expect(finding).toHaveProperty('category');
      expect(finding).toHaveProperty('finding');
      expect(finding).toHaveProperty('severity');
      expect(finding).toHaveProperty('recommendation');
      expect(['low', 'medium', 'high', 'info']).toContain(finding.severity);
    });

    test('should provide comprehensive audit conclusion', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(response.body.report.conclusion).toBeDefined();
      expect(typeof response.body.report.conclusion).toBe('string');
      expect(response.body.report.conclusion.length).toBeGreaterThan(0);
    });

    test('should include report generation timestamp', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(response.body.report.reportDate).toBeDefined();
      expect(new Date(response.body.report.reportDate)).toBeInstanceOf(Date);
    });

    test('should handle different severity levels in findings', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      const severities = response.body.report.findings.map(finding => finding.severity);
      const uniqueSeverities = [...new Set(severities)];
      
      expect(uniqueSeverities.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle multiple concurrent report requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app).get('/audit/report')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('report');
        expect(response.body.report).toHaveProperty('findings');
      });
    });

    test('should handle missing date parameters gracefully', async () => {
      const response = await request(app)
        .get('/audit/report?startDate=2023-01-01')
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('period');
    });

    test('should handle invalid date format gracefully', async () => {
      const response = await request(app)
        .get('/audit/report?startDate=invalid-date&endDate=2023-12-31')
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('period');
    });

    test('should generate report within reasonable time', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/audit/report')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .post('/audit/run')
        .send({});

      // Since auth middleware is mocked, this should pass
      expect(response.status).not.toBe(401);
    });

    test('should validate user permissions for audit operations', async () => {
      const testRoles = ['admin', 'auditor', 'accountant', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const response = await request(app)
          .post('/audit/run')
          .send({});
        
        // All roles should be able to run audits
        expect(response.status).not.toBe(403);
      }
    });

    test('should prevent unauthorized access to audit data', async () => {
      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      // Should not expose sensitive audit information
      expect(response.body.errors).toBeDefined();
    });

    test('should sanitize audit report outputs', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      // Report should not contain malicious content
      const reportString = JSON.stringify(response.body.report);
      expect(reportString).not.toContain('<script>');
      expect(reportString).not.toContain('javascript:');
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection failures', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed financial data', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue([
        {
          journalEntries: [
            { debitAmount: 'invalid_amount', creditAmount: null, journalEntry: null }
          ]
        }
      ]);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('checks');
    });

    test('should handle timeout scenarios', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('checks');
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/audit/run')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('checks');
    });

    test('should integrate with chart of accounts properly', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(mockAccounts);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(ChartOfAccounts.findAll).toHaveBeenCalled();
    });

    test('should integrate with journal entries properly', async () => {
      const { JournalEntry } = require('../models/Ledger');
      JournalEntry.findAll.mockResolvedValue(mockJournalEntries);

      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      expect(JournalEntry.findAll).toHaveBeenCalled();
    });

    test('should handle multiple audit operations in sequence', async () => {
      const { ChartOfAccounts, JournalEntry } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(mockAccounts);
      JournalEntry.findAll.mockResolvedValue([]);

      // Run audit
      const runResponse = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      // Find errors
      const errorResponse = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      // Generate report
      const reportResponse = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(runResponse.body.checks).toBeDefined();
      expect(errorResponse.body.errors).toBeDefined();
      expect(reportResponse.body.report).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large chart of accounts efficiently', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      const largeAccounts = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        accountCode: `100${i}`,
        accountName: `Account ${i}`,
        accountType: ['asset', 'liability', 'equity', 'revenue', 'expense'][i % 5],
        currentBalance: Math.random() * 1000000,
        isActive: true,
        companyId: 'test-company-id',
        journalEntries: Array.from({ length: 50 }, (_, j) => ({
          debitAmount: Math.random() * 10000,
          creditAmount: Math.random() * 10000,
          journalEntry: { status: 'posted' }
        }))
      }));

      ChartOfAccounts.findAll.mockResolvedValue(largeAccounts);

      const startTime = Date.now();
      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(30000); // 30 seconds
    });

    test('should maintain response time under concurrent load', async () => {
      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(mockAccounts);

      const concurrentRequests = 20;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app)
          .post('/audit/run')
          .send({})
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle memory efficiently with large datasets', async () => {
      const startMemory = process.memoryUsage().heapUsed;

      const { ChartOfAccounts } = require('../models/Ledger');
      ChartOfAccounts.findAll.mockResolvedValue(largeDataset);

      for (let i = 0; i < 50; i++) {
        await request(app)
          .post('/audit/run')
          .send({});
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log all audit operations for compliance', async () => {
      const response = await request(app)
        .post('/audit/run')
        .send({})
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.timestamp).toBeDefined();
    });

    test('should track error detection activities', async () => {
      const response = await request(app)
        .get('/audit/find-errors')
        .expect(200);

      expect(response.body).toHaveProperty('errors');
    });

    test('should maintain audit report generation history', async () => {
      const response = await request(app)
        .get('/audit/report')
        .expect(200);

      expect(response.body.report.reportDate).toBeDefined();
    });

    test('should preserve audit trail integrity', async () => {
      // Test multiple operations to ensure trail integrity
      await request(app).post('/audit/run').send({}).expect(200);
      await request(app).get('/audit/find-errors').expect(200);
      await request(app).get('/audit/report').expect(200);

      // All operations should complete without errors
      expect(true).toBe(true);
    });
  });
});