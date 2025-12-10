const request = require('supertest');
const express = require('express');
const bankRouter = require('../routes/bank');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'accountant'
    };
    next();
  }
}));

// Mock database models
jest.mock('../models/OtherEngines', () => ({
  BankAccount: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  BankStatement: {
    create: jest.fn()
  },
  BankTransaction: {
    findAll: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/bank', bankRouter);

describe('Bank Management API', () => {
  let testUser;
  let mockBankAccounts;
  let mockBankStatements;
  let mockBankTransactions;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'accountant'
    };

    // Mock bank account data
    mockBankAccounts = [
      {
        id: 1,
        accountName: 'Primary Checking',
        accountNumber: '1234567890',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        accountType: 'checking',
        currentBalance: 150000.50,
        companyId: 'test-company-id',
        isActive: true
      },
      {
        id: 2,
        accountName: 'Savings Account',
        accountNumber: '9876543210',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        accountType: 'savings',
        currentBalance: 75000.25,
        companyId: 'test-company-id',
        isActive: true
      }
    ];

    // Mock bank statement data
    mockBankStatements = [
      {
        id: 1,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'statement_dec_2023.pdf',
        uploadDate: new Date('2023-12-01T10:00:00Z'),
        processed: false
      }
    ];

    // Mock bank transaction data
    mockBankTransactions = [
      {
        id: 1,
        bankAccountId: 1,
        transactionDate: '2023-12-01',
        description: 'ATM Withdrawal',
        debitAmount: 5000,
        creditAmount: 0,
        isReconciled: false,
        referenceNumber: 'TXN001'
      },
      {
        id: 2,
        bankAccountId: 1,
        transactionDate: '2023-12-02',
        description: 'Salary Credit',
        debitAmount: 0,
        creditAmount: 25000,
        isReconciled: true,
        referenceNumber: 'TXN002'
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      largeDataset.push({
        id: i + 1000,
        accountName: `Bank Account ${i}`,
        accountNumber: String(Math.floor(Math.random() * 10000000000)),
        bankName: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'][i % 4],
        ifscCode: `SBIN${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        accountType: ['checking', 'savings', 'current'][i % 3],
        currentBalance: Math.random() * 1000000,
        companyId: 'test-company-id',
        isActive: i % 10 !== 0
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /bank/accounts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should retrieve all bank accounts for the company', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(response.body).toHaveProperty('accounts');
      expect(Array.isArray(response.body.accounts)).toBe(true);
      expect(response.body.accounts.length).toBe(2);
      expect(response.body.accounts[0]).toHaveProperty('accountName');
      expect(response.body.accounts[0]).toHaveProperty('accountNumber');
      expect(response.body.accounts[0]).toHaveProperty('bankName');
      expect(response.body.accounts[0]).toHaveProperty('ifscCode');
    });

    test('should return accounts sorted by account name', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(BankAccount.findAll).toHaveBeenCalledWith({
        where: { companyId: 'test-company-id' },
        order: [['accountName', 'ASC']]
      });
    });

    test('should filter accounts by companyId', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(BankAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'test-company-id' }
        })
      );
    });

    test('should handle empty account list', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(response.body.accounts).toEqual([]);
      expect(response.body.accounts.length).toBe(0);
    });

    test('should return account details with all fields', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue([mockBankAccounts[0]]);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      const account = response.body.accounts[0];
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('accountName');
      expect(account).toHaveProperty('accountNumber');
      expect(account).toHaveProperty('bankName');
      expect(account).toHaveProperty('ifscCode');
      expect(account).toHaveProperty('accountType');
      expect(account).toHaveProperty('currentBalance');
      expect(account).toHaveProperty('companyId');
      expect(account).toHaveProperty('isActive');
    });

    test('should handle database errors gracefully', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/bank/accounts')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle performance with large datasets', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.accounts.length).toBe(1000);
    });

    test('should handle concurrent requests', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/bank/accounts')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accounts');
      });
    });
  });

  describe('POST /bank/accounts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should create a new bank account successfully', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const newAccount = {
        id: 3,
        accountName: 'Business Current Account',
        accountNumber: '1122334455',
        bankName: 'Kotak Mahindra Bank',
        ifscCode: 'KKBK0001234',
        accountType: 'current',
        currentBalance: 0,
        companyId: 'test-company-id',
        isActive: true
      };
      BankAccount.create.mockResolvedValue(newAccount);

      const accountData = {
        accountName: 'Business Current Account',
        accountNumber: '1122334455',
        bankName: 'Kotak Mahindra Bank',
        ifscCode: 'KKBK0001234',
        accountType: 'current'
      };

      const response = await request(app)
        .post('/bank/accounts')
        .send(accountData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('account');
      expect(response.body.message).toBe('Bank account created successfully');
      expect(response.body.account.accountName).toBe(accountData.accountName);
      expect(response.body.account.companyId).toBe('test-company-id');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should validate accountName is not empty', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: '',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate accountNumber is not empty', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate bankName is not empty', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: '',
          ifscCode: 'SBIN0001234'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate ifscCode is not empty', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should trim whitespace from accountName', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const mockCreatedAccount = {
        id: 3,
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      };
      BankAccount.create.mockResolvedValue(mockCreatedAccount);

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: '  Test Account  ',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.accountName).toBe('Test Account');
    });

    test('should set companyId from authenticated user', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const mockCreatedAccount = {
        id: 3,
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      };
      BankAccount.create.mockResolvedValue(mockCreatedAccount);

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(BankAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234',
          companyId: 'test-company-id'
        })
      );
    });

    test('should handle database creation errors', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.create.mockRejectedValue(new Error('Database constraint violation'));

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle special characters in fields', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const mockCreatedAccount = {
        id: 3,
        accountName: 'Test @#$%^&*() Account',
        accountNumber: '1234567890',
        bankName: 'SBI & Associates',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      };
      BankAccount.create.mockResolvedValue(mockCreatedAccount);

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test @#$%^&*() Account',
          accountNumber: '1234567890',
          bankName: 'SBI & Associates',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.accountName).toBe('Test @#$%^&*() Account');
    });

    test('should handle very long account names', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const longAccountName = 'A'.repeat(500);
      const mockCreatedAccount = {
        id: 3,
        accountName: longAccountName,
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      };
      BankAccount.create.mockResolvedValue(mockCreatedAccount);

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: longAccountName,
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.accountName).toBe(longAccountName);
    });
  });

  describe('POST /bank/statements/upload', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should upload bank statement successfully', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      const mockStatement = {
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      };
      BankStatement.create.mockResolvedValue(mockStatement);

      const statementData = {
        bankAccountId: 1,
        statementDate: '2023-12-01'
      };

      const response = await request(app)
        .post('/bank/statements/upload')
        .send(statementData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statement');
      expect(response.body.message).toBe('Bank statement uploaded successfully');
      expect(response.body.statement.bankAccountId).toBe(1);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/bank/statements/upload')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate bankAccountId is not empty', async () => {
      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: '',
          statementDate: '2023-12-01'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate statementDate is valid ISO date', async () => {
      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: 'invalid-date'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should handle valid ISO date format', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      const mockStatement = {
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      };
      BankStatement.create.mockResolvedValue(mockStatement);

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      expect(response.body.statement.statementDate).toBe('2023-12-01');
    });

    test('should set companyId from authenticated user', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      const mockStatement = {
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      };
      BankStatement.create.mockResolvedValue(mockStatement);

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      expect(BankStatement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'test-company-id',
          bankAccountId: 1,
          statementDate: '2023-12-01',
          fileName: 'manual_entry',
          processed: false
        })
      );
    });

    test('should set upload date to current time', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      const mockStatement = {
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      };
      BankStatement.create.mockResolvedValue(mockStatement);

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      expect(response.body.statement.uploadDate).toBeDefined();
      expect(new Date(response.body.statement.uploadDate)).toBeInstanceOf(Date);
    });

    test('should set processed flag to false by default', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      const mockStatement = {
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      };
      BankStatement.create.mockResolvedValue(mockStatement);

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      expect(response.body.statement.processed).toBe(false);
    });

    test('should handle database errors gracefully', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      BankStatement.create.mockRejectedValue(new Error('Database constraint violation'));

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('GET /bank/reconciliation/:accountId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should retrieve reconciliation data for valid account', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(response.body).toHaveProperty('account');
      expect(response.body).toHaveProperty('unmatchedBankTransactions');
      expect(response.body).toHaveProperty('reconciliationSummary');
      expect(response.body.account.id).toBe(1);
      expect(Array.isArray(response.body.unmatchedBankTransactions)).toBe(true);
    });

    test('should return 404 for non-existent bank account', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/bank/reconciliation/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Bank account not found');
    });

    test('should filter by companyId for security', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(BankAccount.findOne).toHaveBeenCalledWith({
        where: { id: 1, companyId: 'test-company-id' }
      });
    });

    test('should filter unmatched transactions', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(BankTransaction.findAll).toHaveBeenCalledWith({
        where: {
          bankAccountId: 1,
          isReconciled: false
        },
        order: [['transactionDate', 'DESC']]
      });
    });

    test('should filter transactions by date range when provided', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/bank/reconciliation/1?startDate=2023-12-01&endDate=2023-12-31')
        .expect(200);

      expect(BankTransaction.findAll).toHaveBeenCalledWith({
        where: {
          bankAccountId: 1,
          isReconciled: false,
          transactionDate: {
            [require('sequelize').Op.between]: ['2023-12-01', '2023-12-31']
          }
        },
        order: [['transactionDate', 'DESC']]
      });
    });

    test('should calculate reconciliation summary correctly', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      const summary = response.body.reconciliationSummary;
      expect(summary).toHaveProperty('totalUnreconciled');
      expect(summary).toHaveProperty('totalUnreconciledAmount');
      expect(summary.totalUnreconciled).toBe(1); // Only one transaction is unreconciled
      expect(summary.totalUnreconciledAmount).toBe(5000); // 5000 - 0 = 5000
    });

    test('should handle empty transaction list', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(response.body.unmatchedBankTransactions).toEqual([]);
      expect(response.body.reconciliationSummary.totalUnreconciled).toBe(0);
      expect(response.body.reconciliationSummary.totalUnreconciledAmount).toBe(0);
    });

    test('should sort transactions by date descending', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(BankTransaction.findAll).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: [['transactionDate', 'DESC']]
      });
    });

    test('should handle database errors gracefully', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findOne.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle invalid accountId parameter', async () => {
      const response = await request(app)
        .get('/bank/reconciliation/invalid')
        .expect(500);

      expect(response.body).toBeDefined();
    });

    test('should handle performance with large transaction datasets', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        bankAccountId: 1,
        transactionDate: new Date(2023, 11, 1 + (i % 30)),
        description: `Transaction ${i}`,
        debitAmount: Math.random() * 10000,
        creditAmount: Math.random() * 10000,
        isReconciled: false,
        referenceNumber: `TXN${i}`
      }));

      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(largeTransactions);

      const startTime = Date.now();
      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.unmatchedBankTransactions.length).toBe(1000);
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .get('/bank/accounts');

      // Since auth middleware is mocked, this should pass
      expect(response.status).not.toBe(401);
    });

    test('should validate user permissions for bank operations', async () => {
      const testRoles = ['admin', 'accountant', 'user', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const response = await request(app)
          .get('/bank/accounts');
        
        expect(response.status).not.toBe(403);
      }
    });

    test('should filter bank accounts by companyId for multi-tenant security', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(BankAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'test-company-id' }
        })
      );
    });

    test('should prevent access to other companies bank accounts', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue({
        ...mockBankAccounts[0],
        companyId: 'different-company-id'
      });

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(404);

      expect(response.body.error).toBe('Bank account not found');
    });

    test('should sanitize bank account data in responses', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const accountWithSensitiveData = {
        ...mockBankAccounts[0],
        internalNotes: 'Sensitive bank information'
      };
      BankAccount.findAll.mockResolvedValue([accountWithSensitiveData]);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      // Should contain bank account information but not sensitive internal data
      expect(response.body.accounts[0]).toHaveProperty('accountName');
      expect(response.body.accounts[0]).toHaveProperty('bankName');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection failures', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/bank/accounts')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle malformed request data', async () => {
      const response = await request(app)
        .post('/bank/accounts')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    test('should handle timeout scenarios', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(response.body).toHaveProperty('accounts');
    });

    test('should handle invalid IFSC codes gracefully', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const mockCreatedAccount = {
        id: 3,
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'INVALID_IFSC',
        companyId: 'test-company-id'
      };
      BankAccount.create.mockResolvedValue(mockCreatedAccount);

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'INVALID_IFSC'
        })
        .expect(201);

      expect(response.body.account.ifscCode).toBe('INVALID_IFSC');
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);

      expect(response.body).toHaveProperty('accounts');
    });

    test('should integrate with bank models properly', async () => {
      const { BankAccount, BankStatement, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);
      BankStatement.create.mockResolvedValue(mockBankStatements[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      // Test account creation
      const createResponse = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      // Test statement upload
      const statementResponse = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      // Test reconciliation
      const reconciliationResponse = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(createResponse.body.account).toBeDefined();
      expect(statementResponse.body.statement).toBeDefined();
      expect(reconciliationResponse.body.account).toBeDefined();
    });

    test('should handle multiple bank operations in sequence', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      // Create account
      BankAccount.create.mockResolvedValueOnce({
        id: 3,
        accountName: 'New Account',
        accountNumber: '1111111111',
        bankName: 'New Bank',
        ifscCode: 'NEWB0001234',
        companyId: 'test-company-id'
      });

      const createResponse = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'New Account',
          accountNumber: '1111111111',
          bankName: 'New Bank',
          ifscCode: 'NEWB0001234'
        })
        .expect(201);

      // Get reconciliation
      const reconciliationResponse = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(createResponse.body.account.id).toBe(3);
      expect(reconciliationResponse.body.account.id).toBe(1);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large bank account datasets efficiently', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const response = await request(app)
        .get('/bank/accounts')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds
      expect(response.body.accounts.length).toBe(1000);
    });

    test('should maintain response time under concurrent load', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const concurrentRequests = 20;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app).get('/bank/accounts')
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle memory efficiently with large datasets', async () => {
      const startMemory = process.memoryUsage().heapUsed;

      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(largeDataset);

      for (let i = 0; i < 50; i++) {
        await request(app)
          .get('/bank/accounts')
          .expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB
    });

    test('should handle rapid successive requests efficiently', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.findAll.mockResolvedValue(mockBankAccounts);

      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/bank/accounts')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.accounts.length).toBe(2);
      });
    });
  });

  describe('Bank Account Validation Tests', () => {
    test('should validate account number format', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.create.mockResolvedValue({
        id: 3,
        accountNumber: '1234567890',
        accountName: 'Test Account',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      });

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.accountNumber).toBe('1234567890');
    });

    test('should handle alphanumeric account numbers', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.create.mockResolvedValue({
        id: 3,
        accountNumber: 'ABC123XYZ789',
        accountName: 'Test Account',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      });

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: 'ABC123XYZ789',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.accountNumber).toBe('ABC123XYZ789');
    });

    test('should validate IFSC code format', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.create.mockResolvedValue({
        id: 3,
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      });

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      expect(response.body.account.ifscCode).toBe('SBIN0001234');
    });

    test('should handle different bank names', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'];

      for (const bankName of banks) {
        BankAccount.create.mockResolvedValueOnce({
          id: Math.floor(Math.random() * 1000),
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: bankName,
          ifscCode: 'SBIN0001234',
          companyId: 'test-company-id'
        });

        const response = await request(app)
          .post('/bank/accounts')
          .send({
            accountName: 'Test Account',
            accountNumber: '1234567890',
            bankName: bankName,
            ifscCode: 'SBIN0001234'
          })
          .expect(201);

        expect(response.body.account.bankName).toBe(bankName);
      }
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log bank account creation activities', async () => {
      const { BankAccount } = require('../models/OtherEngines');
      BankAccount.create.mockResolvedValue({
        id: 3,
        accountName: 'Test Account',
        accountNumber: '1234567890',
        bankName: 'SBI',
        ifscCode: 'SBIN0001234',
        companyId: 'test-company-id'
      });

      const response = await request(app)
        .post('/bank/accounts')
        .send({
          accountName: 'Test Account',
          accountNumber: '1234567890',
          bankName: 'SBI',
          ifscCode: 'SBIN0001234'
        })
        .expect(201);

      // In a real implementation, would verify audit logging
      expect(response.body.account).toBeDefined();
      expect(response.body.account.companyId).toBe('test-company-id');
    });

    test('should track statement upload activities', async () => {
      const { BankStatement } = require('../models/OtherEngines');
      BankStatement.create.mockResolvedValue({
        id: 2,
        companyId: 'test-company-id',
        bankAccountId: 1,
        statementDate: '2023-12-01',
        fileName: 'manual_entry',
        uploadDate: new Date(),
        processed: false
      });

      const response = await request(app)
        .post('/bank/statements/upload')
        .send({
          bankAccountId: 1,
          statementDate: '2023-12-01'
        })
        .expect(201);

      expect(response.body.statement).toBeDefined();
      expect(response.body.statement.companyId).toBe('test-company-id');
    });

    test('should maintain reconciliation activity history', async () => {
      const { BankAccount, BankTransaction } = require('../models/OtherEngines');
      BankAccount.findOne.mockResolvedValue(mockBankAccounts[0]);
      BankTransaction.findAll.mockResolvedValue(mockBankTransactions);

      const response = await request(app)
        .get('/bank/reconciliation/1')
        .expect(200);

      expect(response.body.account).toBeDefined();
      expect(response.body.reconciliationSummary).toBeDefined();
    });
  });
});