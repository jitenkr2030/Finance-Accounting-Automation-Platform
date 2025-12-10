const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Import models
const Expense = require('../src/models/Expense');
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
    permissions: ['expense_read', 'expense_write', 'expense_approve']
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

describe('Expense Management', () => {
  let testExpense;
  
  beforeEach(async () => {
    // Create test expense
    testExpense = await Expense.create({
      vendorId: testVendor._id,
      expenseNumber: 'EXP-2024-001',
      expenseDate: new Date('2024-01-15'),
      description: 'Office supplies purchase',
      category: 'office_supplies',
      amount: 250.00,
      taxAmount: 20.00,
      totalAmount: 270.00,
      status: 'pending',
      paymentMethod: 'credit_card',
      receiptNumber: 'REC-2024-001',
      department: 'Administration',
      projectCode: 'ADM-2024',
      currency: 'USD',
      exchangeRate: 1.0,
      createdBy: testUser._id,
      attachments: []
    });
  });
  
  afterEach(async () => {
    await Expense.deleteMany({});
    await GeneralLedger.deleteMany({});
  });

  // CRUD Operations Tests
  describe('CRUD Operations', () => {
    test('should create new expense entry', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-2024-002',
        expenseDate: new Date('2024-01-20'),
        description: 'Marketing materials',
        category: 'marketing',
        amount: 500.00,
        taxAmount: 40.00,
        totalAmount: 540.00,
        paymentMethod: 'bank_transfer',
        department: 'Marketing',
        projectCode: 'MKT-2024',
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        expenseNumber: 'EXP-2024-002',
        totalAmount: 540.00,
        status: 'pending',
        category: 'marketing',
        currency: 'USD'
      });
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    test('should get all expenses with pagination', async () => {
      // Create additional expenses
      await Expense.create([
        {
          vendorId: testVendor._id,
          expenseNumber: 'EXP-2024-003',
          expenseDate: new Date('2024-01-25'),
          description: 'IT equipment',
          category: 'it_equipment',
          amount: 1500.00,
          taxAmount: 120.00,
          totalAmount: 1620.00,
          status: 'approved',
          paymentMethod: 'check',
          department: 'IT'
        },
        {
          vendorId: testVendor._id,
          expenseNumber: 'EXP-2024-004',
          expenseDate: new Date('2024-02-01'),
          description: 'Travel expenses',
          category: 'travel',
          amount: 800.00,
          taxAmount: 64.00,
          totalAmount: 864.00,
          status: 'reimbursed',
          paymentMethod: 'cash',
          department: 'Sales'
        }
      ]);
      
      const response = await request(app)
        .get('/api/expenses?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    test('should get expense by ID', async () => {
      const response = await request(app)
        .get(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        expenseNumber: 'EXP-2024-001',
        totalAmount: 270.00,
        status: 'pending',
        category: 'office_supplies'
      });
    });

    test('should update expense entry', async () => {
      const updateData = {
        description: 'Updated office supplies purchase',
        amount: 300.00,
        taxAmount: 24.00,
        totalAmount: 324.00,
        status: 'approved',
        receiptNumber: 'REC-2024-001-UPDATED'
      };
      
      const response = await request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toMatchObject({
        description: 'Updated office supplies purchase',
        totalAmount: 324.00,
        status: 'approved',
        receiptNumber: 'REC-2024-001-UPDATED'
      });
    });

    test('should delete expense entry', async () => {
      await request(app)
        .delete(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify deletion
      const deleted = await Expense.findById(testExpense._id);
      expect(deleted).toBeNull();
    });

    test('should handle invalid expense ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/expenses/${invalidId}`)
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
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });

    test('should validate amount calculations', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-2024-005',
        expenseDate: new Date('2024-01-15'),
        description: 'Calculation test',
        category: 'office_supplies',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00, // Should be 1080.00
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(response.body.totalAmount).toBe(1080.00);
    });

    test('should prevent duplicate expense numbers', async () => {
      const duplicateData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-2024-001', // Same as testExpense
        expenseDate: new Date('2024-01-20'),
        description: 'Duplicate expense',
        category: 'office_supplies',
        amount: 100.00,
        taxAmount: 8.00,
        totalAmount: 108.00
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(400);
      
      expect(response.body.message).toContain('duplicate');
    });

    test('should validate expense categories', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-CATEGORY-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Category validation test',
        category: 'invalid_category', // Should be from predefined list
        amount: 100.00,
        taxAmount: 8.00,
        totalAmount: 108.00
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(400);
      
      expect(response.body.message).toContain('category');
    });

    test('should handle different currencies', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-2024-006',
        expenseDate: new Date('2024-01-15'),
        description: 'Multi-currency test',
        category: 'office_supplies',
        amount: 1000.00,
        taxAmount: 80.00,
        totalAmount: 1080.00,
        currency: 'EUR',
        exchangeRate: 0.85
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(response.body.currency).toBe('EUR');
      expect(response.body.exchangeRate).toBe(0.85);
    });

    test('should validate receipt attachments', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'EXP-2024-007',
        expenseDate: new Date('2024-01-15'),
        description: 'Receipt validation test',
        category: 'office_supplies',
        amount: 200.00,
        taxAmount: 16.00,
        totalAmount: 216.00,
        receiptRequired: true,
        receiptNumber: 'REC-2024-007'
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(response.body.receiptRequired).toBe(true);
      expect(response.body.receiptNumber).toBe('REC-2024-007');
    });
  });

  // Status Management Tests
  describe('Status Management', () => {
    test('should update status from pending to approved', async () => {
      const response = await request(app)
        .patch(`/api/expenses/${testExpense._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' })
        .expect(200);
      
      expect(response.body.status).toBe('approved');
      expect(response.body.approvedBy).toBeDefined();
      expect(response.body.approvedAt).toBeDefined();
    });

    test('should update status from approved to reimbursed', async () => {
      // First approve the expense
      await Expense.findByIdAndUpdate(
        testExpense._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const response = await request(app)
        .patch(`/api/expenses/${testExpense._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'reimbursed',
          reimbursementDate: new Date('2024-02-10'),
          reimbursementMethod: 'bank_transfer',
          reimbursementReference: 'REF123789'
        })
        .expect(200);
      
      expect(response.body.status).toBe('reimbursed');
      expect(response.body.reimbursementDate).toBeDefined();
      expect(response.body.reimbursementMethod).toBe('bank_transfer');
    });

    test('should handle rejection workflow', async () => {
      const rejectionData = {
        status: 'rejected',
        rejectionReason: 'Insufficient documentation',
        rejectionNotes: 'Please provide proper receipts'
      };
      
      const response = await request(app)
        .patch(`/api/expenses/${testExpense._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(rejectionData)
        .expect(200);
      
      expect(response.body.status).toBe('rejected');
      expect(response.body.rejectionReason).toBe('Insufficient documentation');
      expect(response.body.rejectedBy).toBeDefined();
      expect(response.body.rejectedAt).toBeDefined();
    });

    test('should not allow invalid status transitions', async () => {
      await request(app)
        .patch(`/api/expenses/${testExpense._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'reimbursed' }) // Cannot go directly from pending to reimbursed
        .expect(400);
    });
  });

  // Approval Workflow Tests
  describe('Approval Workflow', () => {
    test('should route expenses through approval chain', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'APPROVAL-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Approval workflow test',
        category: 'it_equipment',
        amount: 5000.00, // High amount requiring manager approval
        taxAmount: 400.00,
        totalAmount: 5400.00,
        requiresManagerApproval: true
      };
      
      const createResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(createResponse.body.requiresManagerApproval).toBe(true);
      expect(createResponse.body.approvalLevel).toBe('manager');
    });

    test('should handle multi-level approvals', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'MULTI-LEVEL-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Multi-level approval test',
        category: 'capital_expense',
        amount: 25000.00, // Very high amount requiring executive approval
        taxAmount: 2000.00,
        totalAmount: 27000.00,
        requiresExecutiveApproval: true
      };
      
      const createResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(createResponse.body.requiresExecutiveApproval).toBe(true);
      expect(createResponse.body.approvalLevel).toBe('executive');
    });

    test('should track approval history', async () => {
      // Approve the expense
      await request(app)
        .patch(`/api/expenses/${testExpense._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' })
        .expect(200);
      
      const response = await request(app)
        .get(`/api/expenses/${testExpense._id}/approval-history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].action).toBe('approved');
      expect(response.body.data[0].approvedBy).toBe(testUser._id.toString());
    });
  });

  // Receipt Management Tests
  describe('Receipt Management', () => {
    test('should upload receipt attachments', async () => {
      const response = await request(app)
        .post(`/api/expenses/${testExpense._id}/receipts`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('receipt', Buffer.from('receipt content'), 'receipt.pdf')
        .expect(200);
      
      expect(response.body).toHaveProperty('attachments');
      expect(response.body.attachments).toHaveLength(1);
      expect(response.body.attachments[0]).toHaveProperty('filename');
    });

    test('should validate receipt requirements', async () => {
      // Create expense that requires receipt
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'RECEIPT-REQ-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Receipt required expense',
        category: 'travel',
        amount: 300.00,
        taxAmount: 24.00,
        totalAmount: 324.00,
        receiptRequired: true
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      expect(response.body.receiptRequired).toBe(true);
      expect(response.body.status).toBe('pending_receipt');
    });

    test('should extract receipt data using OCR', async () => {
      const response = await request(app)
        .post(`/api/expenses/${testExpense._id}/receipts/ocr`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ attachmentId: 'test-attachment-id' })
        .expect(200);
      
      expect(response.body).toHaveProperty('extractedData');
      expect(response.body.extractedData).toHaveProperty('amount');
      expect(response.body.extractedData).toHaveProperty('vendor');
      expect(response.body.extractedData).toHaveProperty('date');
    });
  });

  // Filtering and Search Tests
  describe('Filtering and Search', () => {
    beforeEach(async () => {
      // Create test data with various categories and vendors
      const vendors = await Vendor.create([
        {
          name: 'Expense Vendor A',
          email: 'vendorA@test.com',
          paymentTerms: 'NET30'
        },
        {
          name: 'Expense Vendor B',
          email: 'vendorB@test.com',
          paymentTerms: 'NET15'
        }
      ]);
      
      await Expense.create([
        {
          vendorId: vendors[0]._id,
          expenseNumber: 'FILTER-001',
          expenseDate: new Date('2024-01-15'),
          description: 'Office supplies',
          category: 'office_supplies',
          amount: 200.00,
          taxAmount: 16.00,
          totalAmount: 216.00,
          status: 'pending',
          department: 'Administration'
        },
        {
          vendorId: vendors[1]._id,
          expenseNumber: 'FILTER-002',
          expenseDate: new Date('2024-02-01'),
          description: 'Marketing expenses',
          category: 'marketing',
          amount: 1500.00,
          taxAmount: 120.00,
          totalAmount: 1620.00,
          status: 'approved',
          department: 'Marketing'
        }
      ]);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/expenses?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(expense => expense.status === 'pending')).toBe(true);
    });

    test('should filter by category', async () => {
      const response = await request(app)
        .get('/api/expenses?category=office_supplies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(expense => expense.category === 'office_supplies')).toBe(true);
    });

    test('should filter by department', async () => {
      const response = await request(app)
        .get('/api/expenses?department=Marketing')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(expense => expense.department === 'Marketing')).toBe(true);
    });

    test('should filter by vendor', async () => {
      const response = await request(app)
        .get(`/api/expenses?vendor=${testVendor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(expense => expense.vendorId.toString() === testVendor._id.toString())).toBe(true);
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/expenses?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expect(expenseDate).toBeGreaterThanOrEqual(new Date('2024-01-01'));
        expect(expenseDate).toBeLessThanOrEqual(new Date('2024-01-31'));
      });
    });

    test('should search by description', async () => {
      const response = await request(app)
        .get('/api/expenses?search=office')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.some(expense => expense.description.toLowerCase().includes('office'))).toBe(true);
    });

    test('should filter by amount range', async () => {
      const response = await request(app)
        .get('/api/expenses?minAmount=100&maxAmount=2000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(expense => {
        expect(expense.totalAmount).toBeGreaterThanOrEqual(100);
        expect(expense.totalAmount).toBeLessThanOrEqual(2000);
      });
    });

    test('should filter by payment method', async () => {
      const response = await request(app)
        .get('/api/expenses?paymentMethod=credit_card')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(expense => expense.paymentMethod === 'credit_card')).toBe(true);
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
      
      await Expense.create([
        {
          vendorId: vendors[0]._id,
          expenseNumber: 'ANALYTICS-001',
          expenseDate: new Date('2024-01-15'),
          description: 'Q1 expense analytics',
          category: 'office_supplies',
          amount: 500.00,
          taxAmount: 40.00,
          totalAmount: 540.00,
          status: 'reimbursed',
          department: 'Administration',
          reimbursementDate: new Date('2024-01-20')
        },
        {
          vendorId: vendors[1]._id,
          expenseNumber: 'ANALYTICS-002',
          expenseDate: new Date('2024-02-15'),
          description: 'Q2 expense analytics',
          category: 'marketing',
          amount: 1200.00,
          taxAmount: 96.00,
          totalAmount: 1296.00,
          status: 'pending',
          department: 'Marketing'
        }
      ]);
    });

    test('should generate expense summary by category', async () => {
      const response = await request(app)
        .get('/api/expenses/reports/category-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(category => {
        expect(category).toHaveProperty('category');
        expect(category).toHaveProperty('totalAmount');
        expect(category).toHaveProperty('count');
      });
    });

    test('should generate expense summary by department', async () => {
      const response = await request(app)
        .get('/api/expenses/reports/department-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate vendor expense analysis', async () => {
      const response = await request(app)
        .get('/api/expenses/reports/vendor-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate budget variance report', async () => {
      const response = await request(app)
        .get('/api/expenses/reports/budget-variance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('budgetedAmount');
      expect(response.body.data).toHaveProperty('actualAmount');
      expect(response.body.data).toHaveProperty('variance');
      expect(response.body.data).toHaveProperty('variancePercentage');
    });

    test('should generate cash flow impact analysis', async () => {
      const response = await request(app)
        .get('/api//cash-flow-impactexpenses/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalExpenses');
      expect(response.body.data).toHaveProperty('projectedCashOutflow');
      expect(response.body.data).toHaveProperty('analysisPeriod');
    });

    test('should generate reimbursement status report', async () => {
      const response = await request(app)
        .get('/api/expenses/reports/reimbursement-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pendingReimbursement');
      expect(response.body.data).toHaveProperty('reimbursedAmount');
      expect(response.body.data).toHaveProperty('averageReimbursementDays');
    });
  });

  // Bulk Operations Tests
  describe('Bulk Operations', () => {
    test('should handle bulk expense creation', async () => {
      const bulkData = Array.from({ length: 50 }, (_, i) => ({
        vendorId: testVendor._id,
        expenseNumber: `BULK-${String(i).padStart(3, '0')}`,
        expenseDate: new Date('2024-01-15'),
        description: `Bulk expense ${i}`,
        category: 'office_supplies',
        amount: 50 + i,
        taxAmount: 4 + i * 0.1,
        totalAmount: 54 + i * 1.1,
        status: 'pending',
        department: 'Administration'
      }));
      
      const response = await request(app)
        .post('/api/expenses/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ expenses: bulkData })
        .expect(201);
      
      expect(response.body.created).toBe(50);
      expect(response.body.failed).toBe(0);
    });

    test('should handle bulk status updates', async () => {
      // Create multiple expenses
      const expenses = await Expense.create([
        {
          vendorId: testVendor._id,
          expenseNumber: 'BULK-STATUS-001',
          expenseDate: new Date('2024-01-15'),
          description: 'Bulk status test 1',
          category: 'office_supplies',
          amount: 100.00,
          taxAmount: 8.00,
          totalAmount: 108.00,
          status: 'pending'
        },
        {
          vendorId: testVendor._id,
          expenseNumber: 'BULK-STATUS-002',
          expenseDate: new Date('2024-01-15'),
          description: 'Bulk status test 2',
          category: 'office_supplies',
          amount: 150.00,
          taxAmount: 12.00,
          totalAmount: 162.00,
          status: 'pending'
        }
      ]);
      
      const response = await request(app)
        .patch('/api/expenses/bulk-status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expenseIds: expenses.map(e => e._id),
          status: 'approved'
        })
        .expect(200);
      
      expect(response.body.updated).toBe(2);
    });

    test('should export expenses to CSV', async () => {
      const response = await request(app)
        .get('/api/expenses/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('should export expenses to Excel', async () => {
      const response = await request(app)
        .get('/api/expenses/export/excel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  // Integration Tests
  describe('Integration with Other Modules', () => {
    test('should integrate with General Ledger', async () => {
      // Create GL entry
      const glEntry = await GeneralLedger.create({
        account: 'Office Supplies Expense',
        description: 'Expense entry',
        debit: 270.00,
        credit: 0,
        date: new Date('2024-01-15'),
        reference: testExpense._id,
        transactionType: 'expense'
      });
      
      expect(glEntry.reference.toString()).toBe(testExpense._id.toString());
      expect(glEntry.debit).toBe(270.00);
    });

    test('should update vendor ledger on expense creation', async () => {
      const expenseData = {
        vendorId: testVendor._id,
        expenseNumber: 'LEDGER-001',
        expenseDate: new Date('2024-01-20'),
        description: 'Ledger integration test',
        category: 'office_supplies',
        amount: 400.00,
        taxAmount: 32.00,
        totalAmount: 432.00
      };
      
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
      
      // Verify vendor balance was updated
      await testVendor.reload();
      expect(testVendor.balance).toBe(-432.00); // Negative because it's an expense
    });

    test('should generate audit trail', async () => {
      const response = await request(app)
        .get(`/api/expenses/${testExpense._id}/audit-trail`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should integrate with budgeting system', async () => {
      const response = await request(app)
        .get(`/api/expenses/${testExpense._id}/budget-impact`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('budgetCategory');
      expect(response.body).toHaveProperty('allocatedAmount');
      expect(response.body).toHaveProperty('usedAmount');
      expect(response.body).toHaveProperty('remainingAmount');
    });
  });

  // Performance Tests
  describe('Performance Tests', () => {
    test('should handle large dataset queries efficiently', async () => {
      // Create 500 test entries
      const bulkData = Array.from({ length: 500 }, (_, i) => ({
        vendorId: testVendor._id,
        expenseNumber: `PERF-${String(i).padStart(3, '0')}`,
        expenseDate: new Date('2024-01-15'),
        description: `Performance test ${i}`,
        category: 'office_supplies',
        amount: 100 + i,
        taxAmount: 8 + i * 0.1,
        totalAmount: 108 + i * 1.1,
        status: i % 3 === 0 ? 'reimbursed' : i % 3 === 1 ? 'approved' : 'pending',
        department: 'Administration'
      }));
      
      await Expense.insertMany(bulkData);
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/expenses?page=1&limit=50&status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(response.body.data).toHaveLength(50);
      expect(queryTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    test('should handle complex filtering efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/expenses?category=office_supplies&department=Administration&minAmount=100&maxAmount=500&status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  // Security Tests
  describe('Security and Authorization', () => {
    test('should require authentication for all endpoints', async () => {
      await request(app)
        .get('/api/expenses')
        .expect(401);
      
      await request(app)
        .post('/api/expenses')
        .send({})
        .expect(401);
      
      await request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .send({})
        .expect(401);
      
      await request(app)
        .delete(`/api/expenses/${testExpense._id}`)
        .expect(401);
    });

    test('should validate user permissions for different actions', async () => {
      // Create user with limited permissions
      const limitedUser = await User.create({
        username: 'limiteduser',
        email: 'limited@example.com',
        password: 'password123',
        role: 'viewer',
        permissions: ['expense_read']
      });
      
      const limitedToken = jwt.sign(
        { userId: limitedUser._id, role: limitedUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      // Should allow read operations
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
      
      // Should deny write operations
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          vendorId: testVendor._id,
          expenseNumber: 'SEC-001',
          expenseDate: new Date('2024-01-15'),
          description: 'Security test',
          category: 'office_supplies',
          amount: 100.00,
          taxAmount: 8.00,
          totalAmount: 108.00
        })
        .expect(403);
    });

    test('should sanitize input data', async () => {
      const maliciousData = {
        vendorId: testVendor._id,
        expenseNumber: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">',
        category: 'office_supplies',
        amount: 100.00,
        taxAmount: 8.00,
        totalAmount: 108.00
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData)
        .expect(201);
      
      // Should escape/remove malicious content
      expect(response.body.expenseNumber).not.toContain('<script>');
      expect(response.body.description).not.toContain('<img');
    });

    test('should prevent unauthorized access to sensitive data', async () => {
      // Create expense with sensitive information
      const sensitiveExpense = await Expense.create({
        vendorId: testVendor._id,
        expenseNumber: 'SENSITIVE-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Sensitive expense',
        category: 'legal',
        amount: 5000.00,
        taxAmount: 400.00,
        totalAmount: 5400.00,
        status: 'pending',
        containsSensitiveInfo: true,
        confidentialNotes: 'Settlement details'
      });
      
      const response = await request(app)
        .get(`/api/expenses/${sensitiveExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Sensitive information should be filtered out for non-authorized users
      expect(response.body.confidentialNotes).toBeUndefined();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Simulate database error by disconnecting
      await mongoose.disconnect();
      
      await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
      
      // Reconnect for other tests
      await mongoose.connect(mongoServer.getUri());
    });

    test('should handle validation errors with proper messages', async () => {
      const invalidData = {
        vendorId: 'invalid-vendor-id',
        expenseNumber: '',
        category: 'invalid_category',
        amount: -100,
        totalAmount: -50
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle file upload errors', async () => {
      await request(app)
        .post(`/api/expenses/${testExpense._id}/receipts`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('receipt', Buffer.from(''), 'empty.txt') // Empty file
        .expect(400);
    });

    test('should handle concurrent modifications', async () => {
      // Start two concurrent updates
      const update1 = request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 1', amount: 250.00 });
      
      const update2 = request(app)
        .put(`/api/expenses/${testExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update 2', amount: 300.00 });
      
      const [response1, response2] = await Promise.all([update1, update2]);
      
      // One should succeed, one should fail with conflict
      expect([response1.status, response2.status]).toContain(200);
      expect([response1.status, response2.status]).toContain(409);
    });
  });
});

// Integration test for Expense Management workflow
describe('Expense Management Workflow Integration', () => {
  test('should complete full expense lifecycle', async () => {
    // 1. Create expense entry
    const createResponse = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vendorId: testVendor._id,
        expenseNumber: 'WORKFLOW-001',
        expenseDate: new Date('2024-01-15'),
        description: 'Complete workflow test',
        category: 'office_supplies',
        amount: 450.00,
        taxAmount: 36.00,
        totalAmount: 486.00,
        status: 'pending',
        paymentMethod: 'credit_card',
        department: 'Administration'
      })
      .expect(201);
    
    const expenseId = createResponse.body._id;
    
    // 2. Upload receipt
    await request(app)
      .post(`/api/expenses/${expenseId}/receipts`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('receipt', Buffer.from('receipt content'), 'receipt.pdf')
      .expect(200);
    
    // 3. Approve expense
    await request(app)
      .patch(`/api/expenses/${expenseId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'approved' })
      .expect(200);
    
    // 4. Process reimbursement
    await request(app)
      .patch(`/api/expenses/${expenseId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'reimbursed',
        reimbursementDate: new Date('2024-02-10'),
        reimbursementMethod: 'bank_transfer',
        reimbursementReference: 'WORKFLOW-REF'
      })
      .expect(200);
    
    // 5. Verify final status
    const finalResponse = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(finalResponse.body.status).toBe('reimbursed');
    expect(finalResponse.body.reimbursementReference).toBe('WORKFLOW-REF');
  });
});