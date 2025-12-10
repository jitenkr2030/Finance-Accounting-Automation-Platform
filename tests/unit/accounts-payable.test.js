const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Import models
const AccountsPayable = require('../src/models/AccountsPayable');
const Vendor = require('../src/models/Vendor');
const GeneralLedger = require('../src/models/GeneralLedger');
const User = require('../src/models/User');

let mongoServer;
let app;
let authToken;
let testUser;
let testVendor;

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
    permissions: ['accounts_payable_read', 'accounts_payable_write', 'accounts_payable_approve']
  });
  
  // Create test vendor
  testVendor = await Vendor.create({
    name: 'Test Vendor Inc.',
    email: 'vendor@test.com',
    phone: '+1234567890',
    address: {
      street: '123 Business St',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'US'
    },
    taxId: 'TAX123456789',
    paymentTerms: 'NET30',
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

describe('Accounts Payable Management', () => {
  let testAP;
  
  beforeEach(async () => {
    // Create test AP entry
    testAP = await AccountsPayable.create({
      vendorId: testVendor._id,
      invoiceNumber: 'AP-2024-001',
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-14'),
      description: 'Office supplies and equipment',
      amount: 1500.00,
      taxAmount: 120.00,
      totalAmount: 1620.00,
      status: 'pending',
      category: 'office_expenses',
      paymentTerms: 'NET30',
      currency: 'USD',
      exchangeRate: 1.0,
      createdBy: testUser._id,
      attachments: []
    });
  });
  
  afterEach(async () => {
    await AccountsPayable.deleteMany({});
    await GeneralLedger.deleteMany({});
  });

  // CRUD Operations Tests
  describe('CRUD Operations', () => {
    test('should create new accounts payable entry', async () => {
      const apData = {
        vendorId: testVendor._id,
        invoiceNumber: 'AP-2024-002',
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'Marketing services',
        amount: 2500.00,
        taxAmount: 200.00,
        totalAmount: 2700.00,
        category: 'marketing',
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        invoiceNumber: 'AP-2024-002',
        totalAmount: 2700.00,
        status: 'pending',
        currency: 'USD'
      });
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    test('should get all accounts payable entries with pagination', async () => {
      // Create additional AP entries
      await AccountsPayable.create([
        {
          vendorId: testVendor._id,
          invoiceNumber: 'AP-2024-003',
          invoiceDate: new Date('2024-01-25'),
          dueDate: new Date('2024-02-24'),
          description: 'IT services',
          amount: 3000.00,
          taxAmount: 240.00,
          totalAmount: 3240.00,
          status: 'approved',
          category: 'it_services'
        },
        {
          vendorId: testVendor._id,
          invoiceNumber: 'AP-2024-004',
          invoiceDate: new Date('2024-02-01'),
          dueDate: new Date('2024-03-02'),
          description: 'Legal services',
          amount: 1800.00,
          taxAmount: 144.00,
          totalAmount: 1944.00,
          status: 'paid',
          category: 'legal'
        }
      ]);
      
      const response = await request(app)
        .get('/api/accounts-payable?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    test('should get accounts payable by ID', async () => {
      const response = await request(app)
        .get(`/api/accounts-payable/${testAP._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        invoiceNumber: 'AP-2024-001',
        totalAmount: 1620.00,
        status: 'pending'
      });
    });

    test('should update accounts payable entry', async () => {
      const updateData = {
        description: 'Updated office supplies',
        amount: 1800.00,
        taxAmount: 144.00,
        totalAmount: 1944.00,
        status: 'approved'
      };
      
      const response = await request(app)
        .put(`/api/accounts-payable/${testAP._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toMatchObject({
        description: 'Updated office supplies',
        totalAmount: 1944.00,
        status: 'approved'
      });
    });

    test('should delete accounts payable entry', async () => {
      await request(app)
        .delete(`/api/accounts-payable/${testAP._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify deletion
      const deleted = await AccountsPayable.findById(testAP._id);
      expect(deleted).toBeNull();
    });

    test('should handle invalid AP ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/accounts-payable/${invalidId}`)
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
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });

    test('should validate amount calculations', async () => {
      const apData = {
        vendorId: testVendor._id,
        invoiceNumber: 'AP-2024-005',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Test calculation',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00, // Should be 1080.00
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apData)
        .expect(201);
      
      expect(response.body.totalAmount).toBe(1080.00);
    });

    test('should prevent duplicate invoice numbers', async () => {
      const duplicateData = {
        vendorId: testVendor._id,
        invoiceNumber: 'AP-2024-001', // Same as testAP
        invoiceDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        description: 'Duplicate invoice',
        amount: 500.00,
        taxAmount: 40.00,
        totalAmount: 540.00
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(400);
      
      expect(response.body.message).toContain('duplicate');
    });

    test('should calculate due dates based on payment terms', async () => {
      const apData = {
        vendorId: testVendor._id,
        invoiceNumber: 'AP-2024-006',
        invoiceDate: new Date('2024-01-15'),
        paymentTerms: 'NET30',
        description: 'Terms calculation test',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apData)
        .expect(201);
      
      // Should calculate due date 30 days from invoice date
      const expectedDueDate = new Date('2024-02-14');
      expect(new Date(response.body.dueDate)).toEqual(expectedDueDate);
    });

    test('should handle different currencies', async () => {
      const apData = {
        vendorId: testVendor._id,
        invoiceNumber: 'AP-2024-007',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Multi-currency test',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00,
        currency: 'EUR',
        exchangeRate: 0.85
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apData)
        .expect(201);
      
      expect(response.body.currency).toBe('EUR');
      expect(response.body.exchangeRate).toBe(0.85);
    });
  });

  // Status Management Tests
  describe('Status Management', () => {
    test('should update status from pending to approved', async () => {
      const response = await request(app)
        .patch(`/api/accounts-payable/${testAP._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' })
        .expect(200);
      
      expect(response.body.status).toBe('approved');
      expect(response.body.approvedBy).toBeDefined();
      expect(response.body.approvedAt).toBeDefined();
    });

    test('should update status from approved to paid', async () => {
      // First approve the AP
      await AccountsPayable.findByIdAndUpdate(
        testAP._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const response = await request(app)
        .patch(`/api/accounts-payable/${testAP._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'paid',
          paymentDate: new Date('2024-02-10'),
          paymentMethod: 'bank_transfer',
          paymentReference: 'REF123456'
        })
        .expect(200);
      
      expect(response.body.status).toBe('paid');
      expect(response.body.paymentDate).toBeDefined();
      expect(response.body.paymentMethod).toBe('bank_transfer');
    });

    test('should not allow invalid status transitions', async () => {
      await request(app)
        .patch(`/api/accounts-payable/${testAP._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'paid' }) // Cannot go directly from pending to paid
        .expect(400);
    });

    test('should handle overdue status', async () => {
      const overdueAP = await AccountsPayable.create({
        vendorId: testVendor._id,
        invoiceNumber: 'AP-OVERDUE-001',
        invoiceDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'), // Past due
        description: 'Overdue invoice',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00,
        status: 'pending'
      });
      
      const response = await request(app)
        .get(`/api/accounts-payable/overdue`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data).toContainEqual(
        expect.objectContaining({
          _id: overdueAP._id.toString(),
          status: 'overdue'
        })
      );
    });
  });

  // Filtering and Search Tests
  describe('Filtering and Search', () => {
    beforeEach(async () => {
      // Create test data with various statuses and vendors
      const vendors = await Vendor.create([
        {
          name: 'Vendor A',
          email: 'vendorA@test.com',
          paymentTerms: 'NET30'
        },
        {
          name: 'Vendor B',
          email: 'vendorB@test.com',
          paymentTerms: 'NET15'
        }
      ]);
      
      await AccountsPayable.create([
        {
          vendorId: vendors[0]._id,
          invoiceNumber: 'FILTER-001',
          invoiceDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          description: 'Office supplies',
          amount: 500.00,
          taxAmount: 40.00,
          totalAmount: 540.00,
          status: 'pending',
          category: 'office_expenses'
        },
        {
          vendorId: vendors[1]._id,
          invoiceNumber: 'FILTER-002',
          invoiceDate: new Date('2024-02-01'),
          dueDate: new Date('2024-02-16'),
          description: 'IT services',
          amount: 2000.00,
          taxAmount: 160.00,
          totalAmount: 2160.00,
          status: 'approved',
          category: 'it_services'
        }
      ]);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/accounts-payable?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(ap => ap.status === 'pending')).toBe(true);
    });

    test('should filter by vendor', async () => {
      const response = await request(app)
        .get(`/api/accounts-payable?vendor=${testVendor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(ap => ap.vendorId.toString() === testVendor._id.toString())).toBe(true);
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/accounts-payable?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(ap => {
        const invoiceDate = new Date(ap.invoiceDate);
        expect(invoiceDate).toBeGreaterThanOrEqual(new Date('2024-01-01'));
        expect(invoiceDate).toBeLessThanOrEqual(new Date('2024-01-31'));
      });
    });

    test('should search by description', async () => {
      const response = await request(app)
        .get('/api/accounts-payable?search=office')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.some(ap => ap.description.toLowerCase().includes('office'))).toBe(true);
    });

    test('should filter by amount range', async () => {
      const response = await request(app)
        .get('/api/accounts-payable?minAmount=1000&maxAmount=3000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(ap => {
        expect(ap.totalAmount).toBeGreaterThanOrEqual(1000);
        expect(ap.totalAmount).toBeLessThanOrEqual(3000);
      });
    });
  });

  // Payment Processing Tests
  describe('Payment Processing', () => {
    test('should process payment and update status', async () => {
      // Approve AP first
      await AccountsPayable.findByIdAndUpdate(
        testAP._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const paymentData = {
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer',
        paymentReference: 'REF789012',
        notes: 'Payment processed via bank transfer'
      };
      
      const response = await request(app)
        .post(`/api/accounts-payable/${testAP._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);
      
      expect(response.body.status).toBe('paid');
      expect(response.body.paymentDate).toBeDefined();
      expect(response.body.paymentMethod).toBe('bank_transfer');
    });

    test('should handle partial payments', async () => {
      await AccountsPayable.findByIdAndUpdate(
        testAP._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const partialPaymentData = {
        paymentAmount: 800.00, // Partial payment
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'check',
        paymentReference: 'CHECK123'
      };
      
      const response = await request(app)
        .post(`/api/accounts-payable/${testAP._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialPaymentData)
        .expect(200);
      
      expect(response.body.status).toBe('partially_paid');
      expect(response.body.paymentAmount).toBe(800.00);
      expect(response.body.remainingAmount).toBe(820.00); // 1620 - 800
    });

    test('should validate payment amount against total', async () => {
      await AccountsPayable.findByIdAndUpdate(
        testAP._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const overPaymentData = {
        paymentAmount: 2000.00, // More than total
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer'
      };
      
      await request(app)
        .post(`/api/accounts-payable/${testAP._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(overPaymentData)
        .expect(400);
    });
  });

  // Reports and Analytics Tests
  describe('Reports and Analytics', () => {
    beforeEach(async () => {
      // Create diverse test data for analytics
      const vendors = await Vendor.create([
        { name: 'Analytics Vendor 1', email: 'analytics1@test.com', paymentTerms: 'NET30' },
        { name: 'Analytics Vendor 2', email: 'analytics2@test.com', paymentTerms: 'NET15' }
      ]);
      
      await AccountsPayable.create([
        {
          vendorId: vendors[0]._id,
          invoiceNumber: 'ANALYTICS-001',
          invoiceDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          description: 'Q1 analytics test',
          amount: 1000.00,
          taxAmount: 80.00,
          totalAmount: 1080.00,
          status: 'paid',
          category: 'analytics',
          paymentDate: new Date('2024-02-10')
        },
        {
          vendorId: vendors[1]._id,
          invoiceNumber: 'ANALYTICS-002',
          invoiceDate: new Date('2024-02-15'),
          dueDate: new Date('2024-03-01'),
          description: 'Q2 analytics test',
          amount: 1500.00,
          taxAmount: 120.00,
          totalAmount: 1620.00,
          status: 'pending',
          category: 'analytics'
        }
      ]);
    });

    test('should generate vendor payment summary', async () => {
      const response = await request(app)
        .get('/api/accounts-payable/reports/vendor-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate aging report', async () => {
      const response = await request(app)
        .get('/api/accounts-payable/reports/aging')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('current');
      expect(response.body.data).toHaveProperty('30days');
      expect(response.body.data).toHaveProperty('60days');
      expect(response.body.data).toHaveProperty('90days');
      expect(response.body.data).toHaveProperty('over90days');
    });

    test('should generate cash flow forecast', async () => {
      const response = await request(app)
        .get('/api/accounts-payable/reports/cash-flow-forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get payment performance metrics', async () => {
      const response = await request(app)
        .get('/api/accounts-payable/reports/payment-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('onTimePaymentRate');
      expect(response.body.data).toHaveProperty('averagePaymentDays');
      expect(response.body.data).toHaveProperty('totalPaidAmount');
    });
  });

  // Integration Tests
  describe('Integration with Other Modules', () => {
    test('should integrate with General Ledger', async () => {
      // Create GL entry
      const glEntry = await GeneralLedger.create({
        account: 'Accounts Payable',
        description: 'AP invoice entry',
        debit: 0,
        credit: 1620.00,
        date: new Date('2024-01-15'),
        reference: testAP._id,
        transactionType: 'accounts_payable'
      });
      
      expect(glEntry.reference.toString()).toBe(testAP._id.toString());
      expect(glEntry.credit).toBe(1620.00);
    });

    test('should update vendor balance on payment', async () => {
      const initialBalance = testVendor.balance || 0;
      
      await request(app)
        .post(`/api/accounts-payable/${testAP._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentDate: new Date('2024-02-10'),
          paymentMethod: 'bank_transfer',
          paymentReference: 'REF123456'
        });
      
      // Verify vendor balance was updated
      await testVendor.reload();
      expect(testVendor.balance).toBe(initialBalance + 1620.00);
    });

    test('should generate audit trail', async () => {
      const response = await request(app)
        .get(`/api/accounts-payable/${testAP._id}/audit-trail`)
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
        vendorId: testVendor._id,
        invoiceNumber: `BULK-${String(i).padStart(3, '0')}`,
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: `Bulk invoice ${i}`,
        amount: 100 + i,
        taxAmount: 8 + i * 0.1,
        totalAmount: 108 + i * 1.1,
        status: 'pending',
        category: 'bulk_test'
      }));
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/accounts-payable/bulk')
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
        vendorId: testVendor._id,
        invoiceNumber: `PERF-${String(i).padStart(4, '0')}`,
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: `Performance test ${i}`,
        amount: 100 + i,
        taxAmount: 8 + i * 0.1,
        totalAmount: 108 + i * 1.1,
        status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'approved' : 'pending'
      }));
      
      await AccountsPayable.insertMany(bulkData);
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/accounts-payable?page=1&limit=50&status=pending')
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
        .get('/api/accounts-payable')
        .expect(401);
      
      await request(app)
        .post('/api/accounts-payable')
        .send({})
        .expect(401);
      
      await request(app)
        .put(`/api/accounts-payable/${testAP._id}`)
        .send({})
        .expect(401);
      
      await request(app)
        .delete(`/api/accounts-payable/${testAP._id}`)
        .expect(401);
    });

    test('should validate user permissions for different actions', async () => {
      // Create user with limited permissions
      const limitedUser = await User.create({
        username: 'limiteduser',
        email: 'limited@example.com',
        password: 'password123',
        role: 'viewer',
        permissions: ['accounts_payable_read']
      });
      
      const limitedToken = jwt.sign(
        { userId: limitedUser._id, role: limitedUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      // Should allow read operations
      await request(app)
        .get('/api/accounts-payable')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
      
      // Should deny write operations
      await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          vendorId: testVendor._id,
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
        vendorId: testVendor._id,
        invoiceNumber: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">',
        amount: 100.00,
        taxAmount: 8.00,
        totalAmount: 108.00
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
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
        .get('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
      
      // Reconnect for other tests
      await mongoose.connect(mongoServer.getUri());
    });

    test('should handle validation errors with proper messages', async () => {
      const invalidData = {
        vendorId: 'invalid-vendor-id',
        invoiceNumber: '',
        amount: -100,
        totalAmount: -50
      };
      
      const response = await request(app)
        .post('/api/accounts-payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle concurrent modifications', async () => {
      // Start two concurrent updates
      const update1 = request(app)
        .put(`/api/accounts-payable/${testAP._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 1', amount: 1200.00 });
      
      const update2 = request(app)
        .put(`/api/accounts-payable/${testAP._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 2', amount: 1300.00 });
      
      const [response1, response2] = await Promise.all([update1, update2]);
      
      // One should succeed, one should fail with conflict
      expect([response1.status, response2.status]).toContain(200);
      expect([response1.status, response2.status]).toContain(409);
    });
  });
});

// Integration test for Accounts Payable workflow
describe('Accounts Payable Workflow Integration', () => {
  test('should complete full AP lifecycle', async () => {
    // 1. Create AP entry
    const createResponse = await request(app)
      .post('/api/accounts-payable')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vendorId: testVendor._id,
        invoiceNumber: 'WORKFLOW-001',
        invoiceDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        description: 'Complete workflow test',
        amount: 2000.00,
        taxAmount: 160.00,
        totalAmount: 2160.00,
        status: 'pending'
      })
      .expect(201);
    
    const apId = createResponse.body._id;
    
    // 2. Approve AP
    await request(app)
      .patch(`/api/accounts-payable/${apId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'approved' })
      .expect(200);
    
    // 3. Process payment
    await request(app)
      .post(`/api/accounts-payable/${apId}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        paymentDate: new Date('2024-02-10'),
        paymentMethod: 'bank_transfer',
        paymentReference: 'WORKFLOW-REF'
      })
      .expect(200);
    
    // 4. Verify final status
    const finalResponse = await request(app)
      .get(`/api/accounts-payable/${apId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(finalResponse.body.status).toBe('paid');
    expect(finalResponse.body.paymentReference).toBe('WORKFLOW-REF');
  });
});