const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const CashFlow = require('../src/models/CashFlow');
const Account = require('../src/models/Account');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let userId;
let accountId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  const user = new User({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'admin'
  });
  await user.save();
  userId = user._id;

  // Create test account
  const account = new Account({
    name: 'Main Operating Account',
    accountNumber: '1234567890',
    bankName: 'Test Bank',
    accountType: 'checking',
    currency: 'USD',
    balance: 100000,
    isActive: true
  });
  await account.save();
  accountId = account._id;

  // Generate auth token
  authToken = jwt.sign(
    { userId: userId, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await CashFlow.deleteMany({});
});

describe('Cash Flow Management Tests', () => {
  describe('POST /api/cashflow', () => {
    test('should create a new cash flow entry successfully', async () => {
      const cashFlowData = {
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        subcategory: 'sales',
        description: 'Monthly sales revenue',
        accountId: accountId,
        reference: 'INV-2024-001',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        counterparty: 'ABC Company',
        metadata: {
          invoiceId: 'INV-001',
          customerId: 'CUST-001'
        }
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cashFlowData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(cashFlowData.amount);
      expect(response.body.data.type).toBe(cashFlowData.type);
      expect(response.body.data.category).toBe(cashFlowData.category);
      expect(response.body.data.description).toBe(cashFlowData.description);
      expect(response.body.data.accountId).toBe(accountId.toString());
    });

    test('should create outflow cash flow entry', async () => {
      const cashFlowData = {
        transactionDate: new Date('2024-01-16'),
        amount: 2500,
        type: 'outflow',
        category: 'expense',
        subcategory: 'operational',
        description: 'Office rent payment',
        accountId: accountId,
        reference: 'EXP-2024-001',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        counterparty: 'Property Management LLC',
        dueDate: new Date('2024-01-16')
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cashFlowData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('outflow');
      expect(response.body.data.amount).toBe(2500);
      expect(response.body.data.category).toBe('expense');
    });

    test('should validate required fields', async () => {
      const invalidCashFlow = {
        amount: -1000, // Negative amount
        type: 'invalid_type', // Invalid type
        category: '', // Empty category
        accountId: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCashFlow)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('Amount must be positive');
      expect(response.body.errors).toContain('Type must be either inflow or outflow');
      expect(response.body.errors).toContain('Category is required');
    });

    test('should validate date consistency', async () => {
      const cashFlowData = {
        transactionDate: new Date('2024-01-20'),
        dueDate: new Date('2024-01-15'), // Due before transaction
        amount: 1000,
        type: 'inflow',
        category: 'revenue',
        description: 'Test entry',
        accountId: accountId
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cashFlowData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Due date cannot be before transaction date');
    });

    test('should require authentication', async () => {
      const cashFlowData = {
        transactionDate: new Date('2024-01-15'),
        amount: 1000,
        type: 'inflow',
        category: 'revenue',
        description: 'Test entry',
        accountId: accountId
      };

      const response = await request(app)
        .post('/api/cashflow')
        .send(cashFlowData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/cashflow', () => {
    beforeEach(async () => {
      // Create test cash flow entries
      const cashFlows = [
        {
          transactionDate: new Date('2024-01-15'),
          amount: 5000,
          type: 'inflow',
          category: 'revenue',
          subcategory: 'sales',
          description: 'Monthly sales revenue',
          accountId: accountId,
          reference: 'INV-2024-001',
          status: 'completed',
          paymentMethod: 'bank_transfer'
        },
        {
          transactionDate: new Date('2024-01-16'),
          amount: 2500,
          type: 'outflow',
          category: 'expense',
          subcategory: 'operational',
          description: 'Office rent payment',
          accountId: accountId,
          reference: 'EXP-2024-001',
          status: 'completed',
          paymentMethod: 'bank_transfer'
        },
        {
          transactionDate: new Date('2024-01-17'),
          amount: 1500,
          type: 'inflow',
          category: 'investment',
          subcategory: 'dividends',
          description: 'Investment dividends',
          accountId: accountId,
          reference: 'DIV-2024-001',
          status: 'completed',
          paymentMethod: 'direct_deposit'
        }
      ];

      await CashFlow.insertMany(cashFlows);
    });

    test('should retrieve all cash flow entries', async () => {
      const response = await request(app)
        .get('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].amount).toBeDefined();
      expect(response.body.data[1].amount).toBeDefined();
      expect(response.body.data[2].amount).toBeDefined();
    });

    test('should filter cash flow by type', async () => {
      const response = await request(app)
        .get('/api/cashflow?type=inflow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Two inflow entries
      expect(response.body.data.every(entry => entry.type === 'inflow')).toBe(true);
    });

    test('should filter cash flow by category', async () => {
      const response = await request(app)
        .get('/api/cashflow?category=revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('revenue');
    });

    test('should filter cash flow by account', async () => {
      const response = await request(app)
        .get(`/api/cashflow?accountId=${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].accountId).toBe(accountId.toString());
    });

    test('should filter cash flow by date range', async () => {
      const startDate = '2024-01-16';
      const endDate = '2024-01-17';
      
      const response = await request(app)
        .get(`/api/cashflow?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Two entries in date range
    });

    test('should filter cash flow by status', async () => {
      const response = await request(app)
        .get('/api/cashflow?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every(entry => entry.status === 'completed')).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/cashflow?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should sort results by date', async () => {
      const response = await request(app)
        .get('/api/cashflow?sortBy=transactionDate&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].transactionDate).toBeGreaterThan(response.body.data[1].transactionDate);
    });
  });

  describe('GET /api/cashflow/:id', () => {
    let cashFlowId;

    beforeEach(async () => {
      const cashFlow = new CashFlow({
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        subcategory: 'sales',
        description: 'Monthly sales revenue',
        accountId: accountId,
        reference: 'INV-2024-001',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        metadata: {
          invoiceId: 'INV-001'
        }
      });
      const savedCashFlow = await cashFlow.save();
      cashFlowId = savedCashFlow._id;
    });

    test('should retrieve cash flow entry by id', async () => {
      const response = await request(app)
        .get(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(cashFlowId.toString());
      expect(response.body.data.description).toBe('Monthly sales revenue');
      expect(response.body.data.metadata.invoiceId).toBe('INV-001');
    });

    test('should return 404 for non-existent cash flow entry', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/cashflow/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cash flow entry not found');
    });

    test('should validate object id format', async () => {
      const response = await request(app)
        .get('/api/cashflow/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid cash flow ID format');
    });
  });

  describe('PUT /api/cashflow/:id', () => {
    let cashFlowId;

    beforeEach(async () => {
      const cashFlow = new CashFlow({
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        subcategory: 'sales',
        description: 'Original description',
        accountId: accountId,
        reference: 'INV-2024-001',
        status: 'pending',
        paymentMethod: 'bank_transfer'
      });
      const savedCashFlow = await cashFlow.save();
      cashFlowId = savedCashFlow._id;
    });

    test('should update cash flow entry successfully', async () => {
      const updateData = {
        description: 'Updated description',
        amount: 5500,
        status: 'completed',
        metadata: {
          updatedBy: 'system',
          reason: 'Amount adjustment'
        }
      };

      const response = await request(app)
        .put(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.amount).toBe(5500);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.metadata.updatedBy).toBe('system');
    });

    test('should prevent updating completed entries without permission', async () => {
      // First mark as completed
      await CashFlow.findByIdAndUpdate(cashFlowId, { status: 'completed' });

      const updateData = {
        amount: 6000
      };

      const response = await request(app)
        .put(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot modify completed cash flow entry');
    });

    test('should validate update data', async () => {
      const updateData = {
        amount: -1000 // Invalid negative amount
      };

      const response = await request(app)
        .put(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Amount must be positive');
    });
  });

  describe('DELETE /api/cashflow/:id', () => {
    let cashFlowId;

    beforeEach(async () => {
      const cashFlow = new CashFlow({
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        subcategory: 'sales',
        description: 'Test entry',
        accountId: accountId,
        reference: 'INV-2024-001',
        status: 'pending',
        paymentMethod: 'bank_transfer'
      });
      const savedCashFlow = await cashFlow.save();
      cashFlowId = savedCashFlow._id;
    });

    test('should delete cash flow entry successfully', async () => {
      const response = await request(app)
        .delete(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cash flow entry deleted successfully');

      // Verify entry is deleted
      const deletedEntry = await CashFlow.findById(cashFlowId);
      expect(deletedEntry).toBeNull();
    });

    test('should prevent deleting completed entries', async () => {
      // First mark as completed
      await CashFlow.findByIdAndUpdate(cashFlowId, { status: 'completed' });

      const response = await request(app)
        .delete(`/api/cashflow/${cashFlowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete completed cash flow entry');
    });

    test('should return 404 for non-existent entry', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/cashflow/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cash flow entry not found');
    });
  });

  describe('GET /api/cashflow/summary', () => {
    beforeEach(async () => {
      // Create diverse cash flow entries for summary
      const cashFlows = [
        // Inflows
        { transactionDate: new Date('2024-01-01'), amount: 10000, type: 'inflow', category: 'revenue', status: 'completed' },
        { transactionDate: new Date('2024-01-02'), amount: 5000, type: 'inflow', category: 'investment', status: 'completed' },
        { transactionDate: new Date('2024-01-03'), amount: 2000, type: 'inflow', category: 'other', status: 'completed' },
        // Outflows
        { transactionDate: new Date('2024-01-04'), amount: 3000, type: 'outflow', category: 'expense', status: 'completed' },
        { transactionDate: new Date('2024-01-05'), amount: 1500, type: 'outflow', category: 'investment', status: 'completed' },
        { transactionDate: new Date('2024-01-06'), amount: 800, type: 'outflow', category: 'expense', status: 'pending' }
      ];

      await CashFlow.insertMany(cashFlows.map(cf => ({ ...cf, accountId })));
    });

    test('should get cash flow summary', async () => {
      const response = await request(app)
        .get('/api/cashflow/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalInflow).toBe(17000); // 10000 + 5000 + 2000
      expect(response.body.data.totalOutflow).toBe(5300); // 3000 + 1500 + 800 (pending included)
      expect(response.body.data.netCashFlow).toBe(11700); // 17000 - 5300
      expect(response.body.data.pendingAmount).toBe(800);
    });

    test('should get summary by category', async () => {
      const response = await request(app)
        .get('/api/cashflow/summary?groupBy=category')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categoryBreakdown).toBeDefined();
      expect(response.body.data.categoryBreakdown.revenue).toBeDefined();
      expect(response.body.data.categoryBreakdown.expense).toBeDefined();
      expect(response.body.data.categoryBreakdown.investment).toBeDefined();
    });

    test('should get summary by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-03';
      
      const response = await request(app)
        .get(`/api/cashflow/summary?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalInflow).toBe(17000); // Only first 3 days (all inflows)
      expect(response.body.data.totalOutflow).toBe(0); // No outflows in range
    });
  });

  describe('GET /api/cashflow/forecast', () => {
    beforeEach(async () => {
      // Create historical cash flow data for forecasting
      const historicalData = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(2023, month, 15);
        historicalData.push(
          // Monthly inflow pattern
          { transactionDate: date, amount: 15000 + (month * 500), type: 'inflow', category: 'revenue', status: 'completed' },
          // Monthly outflow pattern
          { transactionDate: date, amount: 8000 + (month * 300), type: 'outflow', category: 'expense', status: 'completed' }
        );
      }
      await CashFlow.insertMany(historicalData.map(cf => ({ ...cf, accountId })));
    });

    test('should generate cash flow forecast', async () => {
      const forecastRequest = {
        periods: 3, // Forecast for 3 months
        method: 'linear_regression',
        includeConfidence: true
      };

      const response = await request(app)
        .post('/api/cashflow/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.forecasts).toHaveLength(3);
      expect(response.body.data.forecasts[0].period).toBeDefined();
      expect(response.body.data.forecasts[0].predictedInflow).toBeDefined();
      expect(response.body.data.forecasts[0].predictedOutflow).toBeDefined();
      expect(response.body.data.method).toBe('linear_regression');
    });

    test('should forecast with different methods', async () => {
      const forecastRequest = {
        periods: 2,
        method: 'moving_average',
        windowSize: 3
      };

      const response = await request(app)
        .post('/api/cashflow/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.method).toBe('moving_average');
      expect(response.body.data.windowSize).toBe(3);
    });

    test('should validate forecast parameters', async () => {
      const invalidRequest = {
        periods: -1, // Invalid negative periods
        method: 'invalid_method'
      };

      const response = await request(app)
        .post('/api/cashflow/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Periods must be a positive number');
      expect(response.body.errors).toContain('Invalid forecast method');
    });
  });

  describe('POST /api/cashflow/bulk-import', () => {
    test('should import cash flow entries from CSV-like data', async () => {
      const importData = {
        entries: [
          {
            transactionDate: '2024-01-15',
            amount: '5000',
            type: 'inflow',
            category: 'revenue',
            description: 'Bulk import entry 1',
            reference: 'BULK-001'
          },
          {
            transactionDate: '2024-01-16',
            amount: '2500',
            type: 'outflow',
            category: 'expense',
            description: 'Bulk import entry 2',
            reference: 'BULK-002'
          }
        ],
        validateOnly: false
      };

      const response = await request(app)
        .post('/api/cashflow/bulk-import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(2);
      expect(response.body.data.failed).toBe(0);
    });

    test('should validate bulk import data', async () => {
      const importData = {
        entries: [
          {
            transactionDate: '2024-01-15',
            amount: 'invalid_amount', // Invalid amount
            type: 'inflow',
            category: 'revenue',
            description: 'Invalid entry'
          }
        ],
        validateOnly: true
      };

      const response = await request(app)
        .post('/api/cashflow/bulk-import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(0);
      expect(response.body.data.invalid).toBe(1);
      expect(response.body.data.errors).toBeDefined();
    });

    test('should handle partial bulk import failures', async () => {
      const importData = {
        entries: [
          {
            transactionDate: '2024-01-15',
            amount: '5000',
            type: 'inflow',
            category: 'revenue',
            description: 'Valid entry',
            reference: 'VALID-001'
          },
          {
            transactionDate: 'invalid-date',
            amount: '2500',
            type: 'outflow',
            category: 'expense',
            description: 'Invalid date entry',
            reference: 'INVALID-001'
          }
        ],
        validateOnly: false
      };

      const response = await request(app)
        .post('/api/cashflow/bulk-import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(1);
      expect(response.body.data.failed).toBe(1);
      expect(response.body.data.errors).toHaveLength(1);
    });
  });

  describe('GET /api/cashflow/analytics/trends', () => {
    beforeEach(async () => {
      // Create time-series data for trend analysis
      const trendData = [];
      for (let day = 0; day < 30; day++) {
        const date = new Date(2024, 0, day + 1);
        // Create patterns: higher inflows on weekdays, consistent outflows
        const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
        const inflowAmount = isWeekday ? 2000 + Math.random() * 1000 : 500 + Math.random() * 500;
        const outflowAmount = 800 + Math.random() * 400;
        
        trendData.push(
          { transactionDate: date, amount: inflowAmount, type: 'inflow', category: 'revenue', status: 'completed' },
          { transactionDate: date, amount: outflowAmount, type: 'outflow', category: 'expense', status: 'completed' }
        );
      }
      await CashFlow.insertMany(trendData.map(cf => ({ ...cf, accountId })));
    });

    test('should analyze cash flow trends', async () => {
      const response = await request(app)
        .get('/api/cashflow/analytics/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trendAnalysis).toBeDefined();
      expect(response.body.data.weekdayPatterns).toBeDefined();
      expect(response.body.data.seasonalPatterns).toBeDefined();
      expect(response.body.data.volatility).toBeDefined();
    });

    test('should get trend analysis by period', async () => {
      const response = await request(app)
        .get('/api/cashflow/analytics/trends?period=weekly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weeklyTrends).toBeDefined();
      expect(response.body.data.weeklyTrends.length).toBeGreaterThan(0);
    });

    test('should compare periods for trends', async () => {
      const response = await request(app)
        .get('/api/cashflow/analytics/trends?compare=true&baseline=2023-12')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.growthRate).toBeDefined();
      expect(response.body.data.varianceAnalysis).toBeDefined();
    });
  });

  describe('POST /api/cashflow/reconcile', () => {
    let bankTransactionId;

    beforeEach(async () => {
      // Create a cash flow entry for reconciliation
      const cashFlow = new CashFlow({
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        description: 'Expected revenue',
        accountId: accountId,
        status: 'pending',
        externalReference: 'BANK-TXN-001'
      });
      await cashFlow.save();
      bankTransactionId = cashFlow._id;
    });

    test('should reconcile cash flow with bank transaction', async () => {
      const reconciliationData = {
        bankTransactionId: bankTransactionId,
        bankReference: 'BANK-TXN-001',
        actualAmount: 4950.50,
        actualDate: new Date('2024-01-16'),
        fees: 49.50,
        notes: 'Bank fees deducted'
      };

      const response = await request(app)
        .post('/api/cashflow/reconcile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reconciliationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reconciled');
      expect(response.body.data.actualAmount).toBe(4950.50);
      expect(response.body.data.reconciliationDate).toBeDefined();
      expect(response.body.data.reconciledBy).toBe(userId.toString());
    });

    test('should handle reconciliation discrepancies', async () => {
      const reconciliationData = {
        bankTransactionId: bankTransactionId,
        bankReference: 'BANK-TXN-001',
        actualAmount: 4500, // Different from expected 5000
        actualDate: new Date('2024-01-16'),
        discrepancy: -500,
        notes: 'Amount discrepancy - needs investigation'
      };

      const response = await request(app)
        .post('/api/cashflow/reconcile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reconciliationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reconciled_with_discrepancy');
      expect(response.body.data.discrepancy).toBe(-500);
      expect(response.body.data.needsReview).toBe(true);
    });

    test('should prevent reconciliation of completed entries', async () => {
      // First mark as completed
      await CashFlow.findByIdAndUpdate(bankTransactionId, { status: 'completed' });

      const reconciliationData = {
        bankTransactionId: bankTransactionId,
        bankReference: 'BANK-TXN-001',
        actualAmount: 5000,
        actualDate: new Date('2024-01-16')
      };

      const response = await request(app)
        .post('/api/cashflow/reconcile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reconciliationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot reconcile completed cash flow entry');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      // Mock database connection error
      jest.spyOn(CashFlow, 'find').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database operation failed');
    });

    test('should handle validation errors gracefully', async () => {
      const invalidCashFlow = {
        transactionDate: 'invalid-date',
        amount: 'not-a-number',
        type: 'invalid_type',
        category: '',
        accountId: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCashFlow)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle authorization errors', async () => {
      const invalidToken = 'invalid-token';
      
      const response = await request(app)
        .get('/api/cashflow')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large cash flow queries efficiently', async () => {
      // Create many cash flow entries
      const cashFlows = [];
      for (let i = 0; i < 5000; i++) {
        cashFlows.push({
          transactionDate: new Date(2024, 0, (i % 30) + 1),
          amount: Math.random() * 10000,
          type: i % 2 === 0 ? 'inflow' : 'outflow',
          category: ['revenue', 'expense', 'investment'][i % 3],
          description: `Cash flow entry ${i}`,
          accountId: accountId,
          status: 'completed'
        });
      }
      await CashFlow.insertMany(cashFlows);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/cashflow?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should paginate large result sets efficiently', async () => {
      const response = await request(app)
        .get('/api/cashflow?page=25&limit=50')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(25);
      expect(response.body.pagination.limit).toBe(50);
      expect(response.body.pagination.pages).toBeGreaterThan(25);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with account management', async () => {
      const cashFlowData = {
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        description: 'Account integration test',
        accountId: accountId
      };

      const response = await request(app)
        .post('/api/cashflow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cashFlowData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify account balance is updated
      const account = await Account.findById(accountId);
      expect(account.balance).toBe(105000); // Original 100000 + 5000
    });

    test('should integrate with user management for reconciliation', async () => {
      const cashFlow = new CashFlow({
        transactionDate: new Date('2024-01-15'),
        amount: 5000,
        type: 'inflow',
        category: 'revenue',
        description: 'User integration test',
        accountId: accountId,
        status: 'pending',
        externalReference: 'TEST-001'
      });
      await cashFlow.save();

      const reconciliationData = {
        bankTransactionId: cashFlow._id,
        bankReference: 'TEST-001',
        actualAmount: 5000,
        actualDate: new Date('2024-01-16')
      };

      const response = await request(app)
        .post('/api/cashflow/reconcile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reconciliationData)
        .expect(200);

      expect(response.body.data.reconciledBy).toBe(userId.toString());
      
      // Verify user activity is logged
      const user = await User.findById(userId);
      expect(user.activities).toContain(expect.stringContaining('reconciled cash flow'));
    });
  });
});