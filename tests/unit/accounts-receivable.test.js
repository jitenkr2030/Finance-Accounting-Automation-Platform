const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Import models
const AccountsReceivable = require('../src/models/AccountsReceivable');
const Customer = require('../src/models/Customer');
const GeneralLedger = require('../src/models/GeneralLedger');
const User = require('../src/models/User');

let mongoServer;
let app;
let authToken;
let testUser;
let testCustomer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Initialize app (Express app)
  app = require('../src/app');
  
  // Create test user
  testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'accountant',
    permissions: ['accounts_receivable_read', 'accounts_receivable_write', 'accounts_receivable_approve']
  });
  
  // Create test customer
  testCustomer = await Customer.create({
    name: 'Test Customer Corp.',
    email: 'customer@test.com',
    phone: '+1987654321',
    address: {
      street: '456 Customer Ave',
      city: 'Customer City',
      state: 'CC',
      zipCode: '54321',
      country: 'US'
    },
    taxId: 'TAX987654321',
    paymentTerms: 'NET30',
    creditLimit: 10000.00,
    status: 'active'
  });
  
  // Generate auth token
  authToken = jwt.sign(
    { userId: testUser._id, role: testUser.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Accounts Receivable Management', () => {
  let testAR;
  
  beforeEach(async () => {
    // Create test AR entry
    testAR = await AccountsReceivable.create({
      customerId: testCustomer._id,
      invoiceNumber: 'AR-2024-001',
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-14'),
      description: 'Professional services rendered',
      amount: 2500.00,
      taxAmount: 200.00,
      totalAmount: 2700.00,
      status: 'pending',
      category: 'services',
      paymentTerms: 'NET30',
      currency: 'USD',
      exchangeRate: 1.0,
      createdBy: testUser._id,
      attachments: []
    });
  });
  
  afterEach(async () => {
    await AccountsReceivable.deleteMany({});
    await GeneralLedger.deleteMany({});
  });

  // CRUD Operations Tests
  describe('CRUD Operations', () => {
    test('should create new accounts receivable entry', async () => {
      const arData = {
        customerId: testCustomer._id,
        invoiceNumber: 'AR-2024-002',
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'Product sales',
        amount: 3500.00,
        taxAmount: 280.00,
        totalAmount: 3780.00,
        category: 'products',
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        invoiceNumber: 'AR-2024-002',
        totalAmount: 3780.00,
        status: 'pending',
        currency: 'USD'
      });
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    test('should get all accounts receivable entries with pagination', async () => {
      // Create additional AR entries
      await AccountsReceivable.create([
        {
          customerId: testCustomer._id,
          invoiceNumber: 'AR-2024-003',
          invoiceDate: new Date('2024-01-25'),
          dueDate: new Date('2024-02-24'),
          description: 'Consulting services',
          amount: 4000.00,
          taxAmount: 320.00,
          totalAmount: 4320.00,
          status: 'paid',
          category: 'consulting'
        },
        {
          customerId: testCustomer._id,
          invoiceNumber: 'AR-2024-004',
          invoiceDate: new Date('2024-02-01'),
          dueDate: new Date('2024-03-02'),
          description: 'Maintenance services',
          amount: 1800.00,
          taxAmount: 144.00,
          totalAmount: 1944.00,
          status: 'overdue',
          category: 'maintenance'
        }
      ]);
      
      const response = await request(app)
        .get('/api/accounts-receivable?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    test('should get accounts receivable by ID', async () => {
      const response = await request(app)
        .get(`/api/accounts-receivable/${testAR._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        invoiceNumber: 'AR-2024-001',
        totalAmount: 2700.00,
        status: 'pending'
      });
    });

    test('should update accounts receivable entry', async () => {
      const updateData = {
        description: 'Updated professional services',
        amount: 2800.00,
        taxAmount: 224.00,
        totalAmount: 3024.00,
        status: 'approved'
      };
      
      const response = await request(app)
        .put(`/api/accounts-receivable/${testAR._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toMatchObject({
        description: 'Updated professional services',
        totalAmount: 3024.00,
        status: 'approved'
      });
    });

    test('should delete accounts receivable entry', async () => {
      await request(app)
        .delete(`/api/accounts-receivable/${testAR._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify deletion
      const deleted = await AccountsReceivable.findById(testAR._id);
      expect(deleted).toBeNull();
    });

    test('should handle invalid AR ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/accounts-receivable/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // Business Logic Tests
  describe('Business Logic Validation', () => {
    test('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing required fields'
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });

    test('should validate amount calculations', async () => {
      const arData = {
        customerId: testCustomer._id,
        invoiceNumber: 'AR-2024-005',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Calculation test',
        amount: 2000.00,
        taxAmount: 160.00,
        totalAmount: 2160.00, // Should be 2160.00
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(201);
      
      expect(response.body.totalAmount).toBe(2160.00);
    });

    test('should prevent duplicate invoice numbers', async () => {
      const duplicateData = {
        customerId: testCustomer._id,
        invoiceNumber: 'AR-2024-001', // Same as testAR
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'Duplicate invoice',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(400);
      
      expect(response.body.message).toContain('duplicate');
    });

    test('should calculate due dates based on payment terms', async () => {
      const arData = {
        customerId: testCustomer._id,
        invoiceDate: new Date('2024-01-15'),
        paymentTerms: 'NET30',
        description: 'Terms calculation test',
        amount: 1500.00,
        taxAmount: 120.00,
        totalAmount: 1620.00
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(201);
      
      // Should calculate due date 30 days from invoice date
      const expectedDueDate = new Date('2024-02-14');
      expect(new Date(response.body.dueDate)).toEqual(expectedDueDate);
    });

    test('should handle credit limits', async () => {
      const arData = {
        customerId: testCustomer._id,
        invoiceNumber: 'AR-2024-006',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Credit limit test',
        amount: 15000.00, // Exceeds credit limit
        taxAmount: 1200.00,
        totalAmount: 16200.00,
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(400);
      
      expect(response.body.message).toContain('credit limit');
    });

    test('should handle different currencies', async () => {
      const arData = {
        customerId: testCustomer._id,
        invoiceNumber: 'AR-2024-007',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Multi-currency test',
        amount: 2000.00,
        taxAmount: 160.00,
        totalAmount: 2160.00,
        currency: 'EUR',
        exchangeRate: 0.85
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(201);
      
      expect(response.body.currency).toBe('EUR');
      expect(response.body.exchangeRate).toBe(0.85);
    });
  });

  // Status Management Tests
  describe('Status Management', () => {
    test('should update status from pending to approved', async () => {
      const response = await request(app)
        .patch(`/api/accounts-receivable/${testAR._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' })
        .expect(200);
      
      expect(response.body.status).toBe('approved');
      expect(response.body.approvedBy).toBeDefined();
      expect(response.body.approvedAt).toBeDefined();
    });

    test('should update status from approved to paid', async () => {
      // First approve the AR
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const response = await request(app)
        .patch(`/api/accounts-receivable/${testAR._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'paid',
          paymentDate: new Date('2024-02-10'),
          paymentMethod: 'bank_transfer',
          paymentReference: 'REF654321'
        })
        .expect(200);
      
      expect(response.body.status).toBe('paid');
      expect(response.body.paymentDate).toBeDefined();
      expect(response.body.paymentMethod).toBe('bank_transfer');
    });

    test('should handle partial payments', async () => {
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const partialPaymentData = {
        paymentAmount: 1500.00, // Partial payment
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'check',
        paymentReference: 'CHECK456'
      };
      
      const response = await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialPaymentData)
        .expect(200);
      
      expect(response.body.status).toBe('partially_paid');
      expect(response.body.paymentAmount).toBe(1500.00);
      expect(response.body.remainingAmount).toBe(1200.00); // 2700 - 1500
    });

    test('should handle overdue status automatically', async () => {
      const overdueAR = await AccountsReceivable.create({
        customerId: testCustomer._id,
        invoiceNumber: 'AR-OVERDUE-001',
        invoiceDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'), // Past due
        description: 'Overdue invoice',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00,
        status: 'pending'
      });
      
      // Check for overdue invoices
      const response = await request(app)
        .get(`/api/accounts-receivable/overdue`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data).toContainEqual(
        expect.objectContaining({
          _id: overdueAR._id.toString(),
          status: 'overdue'
        })
      );
    });
  });

  // Payment Collection Tests
  describe('Payment Collection', () => {
    test('should record payment and update status', async () => {
      // Approve AR first
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const paymentData = {
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer',
        paymentReference: 'REF789123',
        notes: 'Payment received via bank transfer'
      };
      
      const response = await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);
      
      expect(response.body.status).toBe('paid');
      expect(response.body.paymentDate).toBeDefined();
      expect(response.body.paymentMethod).toBe('bank_transfer');
    });

    test('should handle multiple partial payments', async () => {
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      // First partial payment
      await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentAmount: 1000.00,
          paymentDate: new Date('2024-02-05'),
          paymentMethod: 'check'
        })
        .expect(200);
      
      // Second partial payment
      const response = await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentAmount: 1700.00,
          paymentDate: new Date('2024-02-15'),
          paymentMethod: 'bank_transfer'
        })
        .expect(200);
      
      expect(response.body.status).toBe('paid'); // Should be fully paid now
      expect(response.body.remainingAmount).toBe(0);
    });

    test('should validate payment amounts', async () => {
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const overPaymentData = {
        paymentAmount: 3000.00, // More than total
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer'
      };
      
      await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(overPaymentData)
        .expect(400);
    });

    test('should apply payments to oldest invoices first (FIFO)', async () => {
      // Create multiple AR entries
      const ar2 = await AccountsReceivable.create({
        customerId: testCustomer._id,
        invoiceNumber: 'AR-FIFO-002',
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'FIFO test invoice 2',
        amount: 1500.00,
        taxAmount: 120.00,
        totalAmount: 1620.00,
        status: 'approved',
        approvedBy: testUser._id,
        approvedAt: new Date()
      });
      
      // Apply payment that covers both invoices
      const paymentData = {
        paymentAmount: 4320.00, // 2700 + 1620
        paymentDate: new Date('2024-02-15'),
        paymentMethod: 'bank_transfer'
      };
      
      const response = await request(app)
        .post(`/api/accounts-receivable/apply-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: testCustomer._id,
          ...paymentData
        })
        .expect(200);
      
      expect(response.body.paymentsApplied).toHaveLength(2);
    });
  });

  // Filtering and Search Tests
  describe('Filtering and Search', () => {
    beforeEach(async () => {
      // Create test data with various statuses and customers
      const customers = await Customer.create([
        {
          name: 'Customer A',
          email: 'customerA@test.com',
          paymentTerms: 'NET30'
        },
        {
          name: 'Customer B',
          email: 'customerB@test.com',
          paymentTerms: 'NET15'
        }
      ]);
      
      await AccountsReceivable.create([
        {
          customerId: customers[0]._id,
          invoiceNumber: 'FILTER-001',
          invoiceDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          description: 'Product sales',
          amount: 800.00,
          taxAmount: 64.00,
          totalAmount: 864.00,
          status: 'pending',
          category: 'products'
        },
        {
          customerId: customers[1]._id,
          invoiceNumber: 'FILTER-002',
          invoiceDate: new Date('2024-02-01'),
          dueDate: new Date('2024-02-16'),
          description: 'Service sales',
          amount: 2500.00,
          taxAmount: 200.00,
          totalAmount: 2700.00,
          status: 'paid',
          category: 'services'
        }
      ]);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(ar => ar.status === 'pending')).toBe(true);
    });

    test('should filter by customer', async () => {
      const response = await request(app)
        .get(`/api/accounts-receivable?customer=${testCustomer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(ar => ar.customerId.toString() === testCustomer._id.toString())).toBe(true);
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(ar => {
        const invoiceDate = new Date(ar.invoiceDate);
        expect(invoiceDate).toBeGreaterThanOrEqual(new Date('2024-01-01'));
        expect(invoiceDate).toBeLessThanOrEqual(new Date('2024-01-31'));
      });
    });

    test('should search by description', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable?search=professional')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.some(ar => ar.description.toLowerCase().includes('professional'))).toBe(true);
    });

    test('should filter by amount range', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable?minAmount=2000&maxAmount=5000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(ar => {
        expect(ar.totalAmount).toBeGreaterThanOrEqual(2000);
        expect(ar.totalAmount).toBeLessThanOrEqual(5000);
      });
    });

    test('should filter by overdue status', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable?overdue=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(ar => {
        const dueDate = new Date(ar.dueDate);
        expect(dueDate).toBeLessThan(new Date());
      });
    });
  });

  // Reports and Analytics Tests
  describe('Reports and Analytics', () => {
    beforeEach(async () => {
      // Create diverse test data for analytics
      const customers = await Customer.create([
        { name: 'Analytics Customer 1', email: 'analytics1@test.com', paymentTerms: 'NET30' },
        { name: 'Analytics Customer 2', email: 'analytics2@test.com', paymentTerms: 'NET15' }
      ]);
      
      await AccountsReceivable.create([
        {
          customerId: customers[0]._id,
          invoiceNumber: 'ANALYTICS-001',
          invoiceDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          description: 'Q1 sales analytics',
          amount: 2000.00,
          taxAmount: 160.00,
          totalAmount: 2160.00,
          status: 'paid',
          category: 'sales',
          paymentDate: new Date('2024-02-10')
        },
        {
          customerId: customers[1]._id,
          invoiceNumber: 'ANALYTICS-002',
          invoiceDate: new Date('2024-02-15'),
          dueDate: new Date('2024-03-01'),
          description: 'Q2 sales analytics',
          amount: 3000.00,
          taxAmount: 240.00,
          totalAmount: 3240.00,
          status: 'pending',
          category: 'sales'
        }
      ]);
    });

    test('should generate customer payment summary', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable/reports/customer-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate aging report', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable/reports/aging')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('current');
      expect(response.body.data).toHaveProperty('30days');
      expect(response.body.data).toHaveProperty('60days');
      expect(response.body.data).toHaveProperty('90days');
      expect(response.body.data).toHaveProperty('over90days');
    });

    test('should generate revenue forecast', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable/reports/revenue-forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get collection performance metrics', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable/reports/collection-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('averageCollectionDays');
      expect(response.body.data).toHaveProperty('collectionRate');
      expect(response.body.data).toHaveProperty('totalOutstanding');
    });

    test('should generate cash flow projection', async () => {
      const response = await request(app)
        .get('/api/accounts-receivable/reports/cash-flow-projection')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('projectedReceipts');
      expect(response.body.data).toHaveProperty('projectionPeriod');
    });
  });

  // Dunning and Collection Tests
  describe('Dunning and Collection', () => {
    test('should generate dunning notices', async () => {
      const overdueAR = await AccountsReceivable.create({
        customerId: testCustomer._id,
        invoiceNumber: 'DUNNING-001',
        invoiceDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        description: 'Overdue invoice for dunning',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00,
        status: 'overdue',
        dunningLevel: 1
      });
      
      const response = await request(app)
        .post('/api/accounts-receivable/dunning/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dunningLevel: 1 })
        .expect(200);
      
      expect(response.body).toHaveProperty('generatedNotices');
      expect(response.body.generatedNotices).toContainEqual(
        expect.objectContaining({
          customerId: testCustomer._id.toString(),
          invoiceId: overdueAR._id.toString()
        })
      );
    });

    test('should track dunning levels', async () => {
      await AccountsReceivable.findByIdAndUpdate(testAR._id, {
        status: 'overdue',
        dunningLevel: 1,
        dunningDate: new Date('2024-01-20')
      });
      
      const response = await request(app)
        .patch(`/api/accounts-receivable/${testAR._id}/dunning`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'escalate' })
        .expect(200);
      
      expect(response.body.dunningLevel).toBe(2);
      expect(response.body.dunningDate).toBeDefined();
    });

    test('should send collection reminders', async () => {
      const response = await request(app)
        .post('/api/accounts-receivable/collections/send-reminder')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceId: testAR._id,
          reminderType: 'first_notice',
          customMessage: 'Friendly reminder for payment'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('messageId');
      expect(response.body.status).toBe('sent');
    });
  });

  // Integration Tests
  describe('Integration with Other Modules', () => {
    test('should integrate with General Ledger', async () => {
      // Create GL entry
      const glEntry = await GeneralLedger.create({
        account: 'Accounts Receivable',
        description: 'AR invoice entry',
        debit: 2700.00,
        credit: 0,
        date: new Date('2024-01-15'),
        reference: testAR._id,
        transactionType: 'accounts_receivable'
      });
      
      expect(glEntry.reference.toString()).toBe(testAR._id.toString());
      expect(glEntry.debit).toBe(2700.00);
    });

    test('should update customer balance on invoice creation', async () => {
      const initialBalance = testCustomer.balance || 0;
      
      const arData = {
        customerId: testCustomer._id,
        invoiceNumber: 'BALANCE-001',
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'Balance test',
        amount: 1500.00,
        taxAmount: 120.00,
        totalAmount: 1620.00
      };
      
      await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(arData)
        .expect(201);
      
      // Verify customer balance was updated
      await testCustomer.reload();
      expect(testCustomer.balance).toBe(initialBalance + 1620.00);
    });

    test('should update customer balance on payment', async () => {
      await AccountsReceivable.findByIdAndUpdate(
        testAR._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const initialBalance = testCustomer.balance;
      
      await request(app)
        .post(`/api/accounts-receivable/${testAR._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentDate: new Date('2024-02-10'),
          paymentMethod: 'bank_transfer',
          paymentReference: 'BALANCE-REF'
        });
      
      // Verify customer balance was reduced
      await testCustomer.reload();
      expect(testCustomer.balance).toBe(initialBalance - 2700.00);
    });

    test('should generate audit trail', async () => {
      const response = await request(app)
        .get(`/api/accounts-receivable/${testAR._id}/audit-trail`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Performance Tests
  describe('Performance Tests', () => {
    test('should handle bulk operations efficiently', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        customerId: testCustomer._id,
        invoiceNumber: `BULK-${String(i).padStart(3, '0')}`,
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: `Bulk invoice ${i}`,
        amount: 200 + i,
        taxAmount: 16 + i * 0.1,
        totalAmount: 216 + i * 1.1,
        status: 'pending',
        category: 'bulk_test'
      }));
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/accounts-receivable/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entries: bulkData })
        .expect(201);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(response.body.created).toBe(100);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large dataset queries efficiently', async () => {
      // Create 1000 test entries
      const bulkData = Array.from({ length: 1000 }, (_, i) => ({
        customerId: testCustomer._id,
        invoiceNumber: `PERF-${String(i).padStart(4, '0')}`,
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: `Performance test ${i}`,
        amount: 100 + i,
        taxAmount: 8 + i * 0.1,
        totalAmount: 108 + i * 1.1,
        status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'approved' : 'pending'
      }));
      
      await AccountsReceivable.insertMany(bulkData);
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/accounts-receivable?page=1&limit=50&status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(response.body.data).toHaveLength(50);
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  // Security Tests
  describe('Security and Authorization', () => {
    test('should require authentication for all endpoints', async () => {
      await request(app)
        .get('/api/accounts-receivable')
        .expect(401);
      
      await request(app)
        .post('/api/accounts-receivable')
        .send({})
        .expect(401);
      
      await request(app)
        .put(`/api/accounts-receivable/${testAR._id}`)
        .send({})
        .expect(401);
      
      await request(app)
        .delete(`/api/accounts-receivable/${testAR._id}`)
        .expect(401);
    });

    test('should validate user permissions for different actions', async () => {
      // Create user with limited permissions
      const limitedUser = await User.create({
        username: 'limiteduser',
        email: 'limited@example.com',
        password: 'password123',
        role: 'viewer',
        permissions: ['accounts_receivable_read']
      });
      
      const limitedToken = jwt.sign(
        { userId: limitedUser._id, role: limitedUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      // Should allow read operations
      await request(app)
        .get('/api/accounts-receivable')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
      
      // Should deny write operations
      await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          customerId: testCustomer._id,
          invoiceNumber: 'SEC-001',
          invoiceDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          description: 'Security test',
          amount: 100.00,
          taxAmount: 8.00,
          totalAmount: 108.00
        })
        .expect(403);
    });

    test('should sanitize input data', async () => {
      const maliciousData = {
        customerId: testCustomer._id,
        invoiceNumber: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">',
        amount: 100.00,
        taxAmount: 8.00,
        totalAmount: 108.00
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData)
        .expect(201);
      
      // Should escape/remove malicious content
      expect(response.body.invoiceNumber).not.toContain('<script>');
      expect(response.body.description).not.toContain('<img');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Simulate database error by disconnecting
      await mongoose.disconnect();
      
      await request(app)
        .get('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
      
      // Reconnect for other tests
      await mongoose.connect(mongoServer.getUri());
    });

    test('should handle validation errors with proper messages', async () => {
      const invalidData = {
        customerId: 'invalid-customer-id',
        invoiceNumber: '',
        amount: -100,
        totalAmount: -50
      };
      
      const response = await request(app)
        .post('/api/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle concurrent modifications', async () => {
      // Start two concurrent updates
      const update1 = request(app)
        .put(`/api/accounts-receivable/${testAR._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 1', amount: 2200.00 });
      
      const update2 = request(app)
        .put(`/api/accounts-receivable/${testAR._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 2', amount: 2300.00 });
      
      const [response1, response2] = await Promise.all([update1, update2]);
      
      // One should succeed, one should fail with conflict
      expect([response1.status, response2.status]).toContain(200);
      expect([response1.status, response2.status]).toContain(409);
    });
  });
});

// Integration test for Accounts Receivable workflow
describe('Accounts Receivable Workflow Integration', () => {
  test('should complete full AR lifecycle', async () => {
    // 1. Create AR entry
    const createResponse = await request(app)
      .post('/api/accounts-receivable')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: testCustomer._id,
        invoiceNumber: 'WORKFLOW-001',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Complete workflow test',
        amount: 3000.00,
        taxAmount: 240.00,
        totalAmount: 3240.00,
        status: 'pending'
      })
      .expect(201);
    
    const arId = createResponse.body._id;
    
    // 2. Approve AR
    await request(app)
      .patch(`/api/accounts-receivable/${arId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'approved' })
      .expect(200);
    
    // 3. Process payment
    await request(app)
      .post(`/api/accounts-receivable/${arId}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer',
        paymentReference: 'WORKFLOW-REF'
      })
      .expect(200);
    
    // 4. Verify final status
    const finalResponse = await request(app)
      .get(`/api/accounts-receivable/${arId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(finalResponse.body.status).toBe('paid');
    expect(finalResponse.body.paymentReference).toBe('WORKFLOW-REF');
  });
});