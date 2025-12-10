const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Import models
const RevenueRecognition = require('../src/models/RevenueRecognition');
const Contract = require('../src/models/Contract');
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
    permissions: ['revenue_recognition_read', 'revenue_recognition_write', 'revenue_recognition_approve']
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

describe('Revenue Recognition Management', () => {
  let testContract;
  let testRevenueRecognition;
  
  beforeEach(async () => {
    // Create test contract first
    testContract = await Contract.create({
      customerId: testCustomer._id,
      contractNumber: 'CONTRACT-2024-001',
      contractDate: new Date('2024-01-01'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 24000.00,
      currency: 'USD',
      status: 'active',
      contractType: 'service_agreement',
      paymentTerms: 'monthly',
      billingFrequency: 'monthly',
      createdBy: testUser._id
    });
    
    // Create test revenue recognition entry
    testRevenueRecognition = await RevenueRecognition.create({
      contractId: testContract._id,
      customerId: testCustomer._id,
      recognitionPeriod: '2024-01',
      recognitionDate: new Date('2024-01-31'),
      recognizedAmount: 2000.00,
      totalContractValue: 24000.00,
      recognitionMethod: 'straight_line',
      status: 'pending',
      serviceDescription: 'Monthly software subscription',
      performanceObligation: 'Software access and support',
      isPerformanceComplete: false,
      createdBy: testUser._id
    });
  });
  
  afterEach(async () => {
    await RevenueRecognition.deleteMany({});
    await Contract.deleteMany({});
    await GeneralLedger.deleteMany({});
  });

  // CRUD Operations Tests
  describe('CRUD Operations', () => {
    test('should create new revenue recognition entry', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-02',
        recognitionDate: new Date('2024-02-29'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Monthly software subscription - February',
        performanceObligation: 'Software access and support'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        recognitionPeriod: '2024-02',
        recognizedAmount: 2000.00,
        recognitionMethod: 'straight_line',
        status: 'pending',
        currency: 'USD'
      });
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    test('should get all revenue recognition entries with pagination', async () => {
      // Create additional revenue recognition entries
      await RevenueRecognition.create([
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-03',
          recognitionDate: new Date('2024-03-31'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'Monthly software subscription - March',
          performanceObligation: 'Software access and support',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-03-31')
        },
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-04',
          recognitionDate: new Date('2024-04-30'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'deferred',
          serviceDescription: 'Monthly software subscription - April',
          performanceObligation: 'Software access and support'
        }
      ]);
      
      const response = await request(app)
        .get('/api/revenue-recognition?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    test('should get revenue recognition by ID', async () => {
      const response = await request(app)
        .get(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        recognitionPeriod: '2024-01',
        recognizedAmount: 2000.00,
        recognitionMethod: 'straight_line',
        status: 'pending'
      });
    });

    test('should update revenue recognition entry', async () => {
      const updateData = {
        recognizedAmount: 2200.00,
        serviceDescription: 'Updated monthly software subscription',
        status: 'approved',
        notes: 'Amount adjusted for additional features'
      };
      
      const response = await request(app)
        .put(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toMatchObject({
        recognizedAmount: 2200.00,
        serviceDescription: 'Updated monthly software subscription',
        status: 'approved'
      });
    });

    test('should delete revenue recognition entry', async () => {
      await request(app)
        .delete(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify deletion
      const deleted = await RevenueRecognition.findById(testRevenueRecognition._id);
      expect(deleted).toBeNull();
    });

    test('should handle invalid revenue recognition ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/revenue-recognition/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // Business Logic Tests
  describe('Business Logic Validation', () => {
    test('should validate required fields', async () => {
      const invalidData = {
        serviceDescription: 'Missing required fields'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });

    test('should validate recognition amounts against contract value', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-05',
        recognitionDate: new Date('2024-05-31'),
        recognizedAmount: 5000.00, // Exceeds monthly allocation
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Monthly software subscription - May',
        performanceObligation: 'Software access and support'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(400);
      
      expect(response.body.message).toContain('exceeds');
    });

    test('should validate recognition period format', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: 'invalid-period', // Should be YYYY-MM format
        recognitionDate: new Date('2024-01-31'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Monthly software subscription',
        performanceObligation: 'Software access and support'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(400);
      
      expect(response.body.message).toContain('period');
    });

    test('should calculate recognition amounts based on method', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-06',
        recognitionDate: new Date('2024-06-30'),
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: new Date('2024-12-31'),
        serviceDescription: 'Monthly software subscription - June',
        performanceObligation: 'Software access and support'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(201);
      
      // Should calculate 24000/12 = 2000
      expect(response.body.recognizedAmount).toBe(2000.00);
    });

    test('should handle milestone-based recognition', async () => {
      const milestoneContract = await Contract.create({
        customerId: testCustomer._id,
        contractNumber: 'MILESTONE-2024-001',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        totalValue: 50000.00,
        currency: 'USD',
        status: 'active',
        contractType: 'project_contract',
        paymentTerms: 'milestone',
        billingFrequency: 'milestone',
        createdBy: testUser._id
      });
      
      const revenueData = {
        contractId: milestoneContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-03',
        recognitionDate: new Date('2024-03-15'),
        recognizedAmount: 25000.00,
        totalContractValue: 50000.00,
        recognitionMethod: 'milestone',
        milestoneDescription: 'Phase 1 completion',
        serviceDescription: 'Software development milestone payment',
        performanceObligation: 'Phase 1 deliverables'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(201);
      
      expect(response.body.recognitionMethod).toBe('milestone');
      expect(response.body.milestoneDescription).toBe('Phase 1 completion');
    });

    test('should validate performance obligation completion', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-07',
        recognitionDate: new Date('2024-07-31'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Monthly software subscription - July',
        performanceObligation: 'Software access and support',
        isPerformanceComplete: true,
        performanceEvidence: 'Service usage logs'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(201);
      
      expect(response.body.isPerformanceComplete).toBe(true);
      expect(response.body.performanceEvidence).toBe('Service usage logs');
    });
  });

  // Status Management Tests
  describe('Status Management', () => {
    test('should update status from pending to approved', async () => {
      const response = await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' })
        .expect(200);
      
      expect(response.body.status).toBe('approved');
      expect(response.body.approvedBy).toBeDefined();
      expect(response.body.approvedAt).toBeDefined();
    });

    test('should update status from approved to recognized', async () => {
      // First approve the revenue recognition
      await RevenueRecognition.findByIdAndUpdate(
        testRevenueRecognition._id,
        { status: 'approved', approvedBy: testUser._id, approvedAt: new Date() }
      );
      
      const response = await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'recognized',
          recognizedAt: new Date('2024-01-31'),
          glEntryReference: 'GL-2024-001'
        })
        .expect(200);
      
      expect(response.body.status).toBe('recognized');
      expect(response.body.recognizedAt).toBeDefined();
      expect(response.body.glEntryReference).toBe('GL-2024-001');
    });

    test('should handle deferred revenue status', async () => {
      const deferralData = {
        status: 'deferred',
        deferralReason: 'Performance obligation not yet satisfied',
        deferralDate: new Date('2024-01-31'),
        expectedRecognitionDate: new Date('2024-02-15')
      };
      
      const response = await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deferralData)
        .expect(200);
      
      expect(response.body.status).toBe('deferred');
      expect(response.body.deferralReason).toBe('Performance obligation not yet satisfied');
      expect(response.body.expectedRecognitionDate).toBeDefined();
    });

    test('should handle reversal of recognized revenue', async () => {
      // First recognize the revenue
      await RevenueRecognition.findByIdAndUpdate(
        testRevenueRecognition._id,
        { 
          status: 'recognized', 
          recognizedAt: new Date('2024-01-31'),
          glEntryReference: 'GL-2024-001'
        }
      );
      
      const reversalData = {
        status: 'reversed',
        reversalReason: 'Customer cancellation',
        reversalDate: new Date('2024-02-15'),
        reversalReference: 'REV-2024-001'
      };
      
      const response = await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reversalData)
        .expect(200);
      
      expect(response.body.status).toBe('reversed');
      expect(response.body.reversalReason).toBe('Customer cancellation');
      expect(response.body.reversalReference).toBe('REV-2024-001');
    });

    test('should not allow invalid status transitions', async () => {
      await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'recognized' }) // Cannot go directly from pending to recognized
        .expect(400);
    });
  });

  // Recognition Methods Tests
  describe('Recognition Methods', () => {
    test('should handle straight-line recognition', async () => {
      const contractData = {
        customerId: testCustomer._id,
        contractNumber: 'STRAIGHT-2024-001',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        totalValue: 12000.00,
        currency: 'USD',
        status: 'active',
        contractType: 'service_agreement',
        recognitionMethod: 'straight_line',
        createdBy: testUser._id
      };
      
      const contract = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(201);
      
      const response = await request(app)
        .post('/api/revenue-recognition/generate-schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: contract.body._id,
          recognitionMethod: 'straight_line'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('schedule');
      expect(response.body.schedule).toHaveLength(6); // 6 months
      expect(response.body.schedule[0].recognizedAmount).toBe(2000.00); // 12000/6
    });

    test('should handle milestone-based recognition', async () => {
      const milestoneContract = await Contract.create({
        customerId: testCustomer._id,
        contractNumber: 'MILESTONE-2024-002',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000.00,
        currency: 'USD',
        status: 'active',
        contractType: 'project_contract',
        recognitionMethod: 'milestone',
        milestones: [
          { description: 'Design completion', percentage: 25, amount: 25000.00 },
          { description: 'Development completion', percentage: 50, amount: 50000.00 },
          { description: 'Testing completion', percentage: 75, amount: 75000.00 },
          { description: 'Final delivery', percentage: 100, amount: 100000.00 }
        ],
        createdBy: testUser._id
      });
      
      const response = await request(app)
        .post('/api/revenue-recognition/milestone-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: milestoneContract._id,
          milestoneIndex: 1, // Development completion
          recognizedAmount: 50000.00
        })
        .expect(201);
      
      expect(response.body.recognitionMethod).toBe('milestone');
      expect(response.body.recognizedAmount).toBe(50000.00);
      expect(response.body.milestoneDescription).toBe('Development completion');
    });

    test('should handle percentage of completion recognition', async () => {
      const pocContract = await Contract.create({
        customerId: testCustomer._id,
        contractNumber: 'POC-2024-001',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-09-30'),
        totalValue: 90000.00,
        currency: 'USD',
        status: 'active',
        contractType: 'long_term_contract',
        recognitionMethod: 'percentage_of_completion',
        costEstimate: 60000.00,
        createdBy: testUser._id
      });
      
      const response = await request(app)
        .post('/api/revenue-recognition/poc-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: pocContract._id,
          periodCosts: 20000.00,
          totalEstimatedCosts: 60000.00,
          completionPercentage: 33.33 // 20000/60000
        })
        .expect(201);
      
      expect(response.body.recognitionMethod).toBe('percentage_of_completion');
      expect(response.body.completionPercentage).toBe(33.33);
      expect(response.body.recognizedAmount).toBe(30000.00); // 33.33% of 90000
    });

    test('should handle completed contract recognition', async () => {
      const completedContract = await Contract.create({
        customerId: testCustomer._id,
        contractNumber: 'COMPLETED-2024-001',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        totalValue: 30000.00,
        currency: 'USD',
        status: 'completed',
        contractType: 'fixed_price',
        recognitionMethod: 'completed_contract',
        completionDate: new Date('2024-03-31'),
        createdBy: testUser._id
      });
      
      const response = await request(app)
        .post('/api/revenue-recognition/completed-contract')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: completedContract._id,
          recognizedAmount: 30000.00,
          recognitionDate: new Date('2024-03-31')
        })
        .expect(201);
      
      expect(response.body.recognitionMethod).toBe('completed_contract');
      expect(response.body.recognizedAmount).toBe(30000.00);
    });
  });

  // Contract Integration Tests
  describe('Contract Integration', () => {
    test('should link revenue recognition to contract', async () => {
      const revenueData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-08',
        recognitionDate: new Date('2024-08-31'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Monthly software subscription - August',
        performanceObligation: 'Software access and support'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(201);
      
      expect(response.body.contractId).toBe(testContract._id.toString());
      
      // Verify contract is updated
      await testContract.reload();
      expect(testContract.recognizedRevenue).toBe(2000.00);
      expect(testContract.remainingRevenue).toBe(22000.00);
    });

    test('should calculate contract completion percentage', async () => {
      // Create multiple recognition entries for the same contract
      await RevenueRecognition.create([
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-01',
          recognitionDate: new Date('2024-01-31'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'January recognition',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-01-31')
        },
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-02',
          recognitionDate: new Date('2024-02-29'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'February recognition',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-02-29')
        }
      ]);
      
      const response = await request(app)
        .get(`/api/contracts/${testContract._id}/completion-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('totalRecognized');
      expect(response.body).toHaveProperty('completionPercentage');
      expect(response.body.completionPercentage).toBe(16.67); // 4000/24000 * 100
    });

    test('should prevent over-recognition against contract value', async () => {
      // Create recognition entries that exceed contract value
      await RevenueRecognition.create([
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-01',
          recognitionDate: new Date('2024-01-31'),
          recognizedAmount: 12000.00, // Half of contract value
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'Large recognition',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-01-31')
        },
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-02',
          recognitionDate: new Date('2024-02-29'),
          recognizedAmount: 15000.00, // Would exceed total
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'pending',
          serviceDescription: 'Excessive recognition',
          isPerformanceComplete: true
        }
      ]);
      
      const response = await request(app)
        .post('/api/revenue-recognition/validate-contract-limits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contractId: testContract._id })
        .expect(200);
      
      expect(response.body).toHaveProperty('validationResult');
      expect(response.body.validationResult).toHaveProperty('isValid');
      expect(response.body.validationResult.isValid).toBe(false);
      expect(response.body.validationResult).toHaveProperty('overRecognitionAmount');
      expect(response.body.validationResult.overRecognitionAmount).toBe(3000.00); // 27000 - 24000
    });
  });

  // Filtering and Search Tests
  describe('Filtering and Search', () => {
    beforeEach(async () => {
      // Create test data with various statuses and periods
      await RevenueRecognition.create([
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-01',
          recognitionDate: new Date('2024-01-31'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'January service',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-01-31')
        },
        {
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-02',
          recognitionDate: new Date('2024-02-29'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          status: 'pending',
          serviceDescription: 'February service',
          isPerformanceComplete: false
        }
      ]);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(rr => rr.status === 'pending')).toBe(true);
    });

    test('should filter by recognition period', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?period=2024-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(rr => rr.recognitionPeriod === '2024-01')).toBe(true);
    });

    test('should filter by recognition method', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?method=straight_line')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(rr => rr.recognitionMethod === 'straight_line')).toBe(true);
    });

    test('should filter by customer', async () => {
      const response = await request(app)
        .get(`/api/revenue-recognition?customer=${testCustomer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(rr => rr.customerId.toString() === testCustomer._id.toString())).toBe(true);
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(rr => {
        const recognitionDate = new Date(rr.recognitionDate);
        expect(recognitionDate).toBeGreaterThanOrEqual(new Date('2024-01-01'));
        expect(recognitionDate).toBeLessThanOrEqual(new Date('2024-01-31'));
      });
    });

    test('should filter by performance completion status', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?performanceComplete=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.every(rr => rr.isPerformanceComplete === true)).toBe(true);
    });

    test('should search by service description', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?search=January')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data.some(rr => rr.serviceDescription.toLowerCase().includes('january'))).toBe(true);
    });

    test('should filter by amount range', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition?minAmount=1500&maxAmount=2500')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.data.forEach(rr => {
        expect(rr.recognizedAmount).toBeGreaterThanOrEqual(1500);
        expect(rr.recognizedAmount).toBeLessThanOrEqual(2500);
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
      
      const contracts = await Contract.create([
        {
          customerId: customers[0]._id,
          contractNumber: 'ANALYTICS-CONTRACT-001',
          contractDate: new Date('2024-01-01'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          totalValue: 12000.00,
          currency: 'USD',
          status: 'active',
          contractType: 'service_agreement',
          createdBy: testUser._id
        },
        {
          customerId: customers[1]._id,
          contractNumber: 'ANALYTICS-CONTRACT-002',
          contractDate: new Date('2024-02-01'),
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-31'),
          totalValue: 18000.00,
          currency: 'USD',
          status: 'active',
          contractType: 'project_contract',
          createdBy: testUser._id
        }
      ]);
      
      await RevenueRecognition.create([
        {
          contractId: contracts[0]._id,
          customerId: customers[0]._id,
          recognitionPeriod: '2024-01',
          recognitionDate: new Date('2024-01-31'),
          recognizedAmount: 1000.00,
          totalContractValue: 12000.00,
          recognitionMethod: 'straight_line',
          status: 'recognized',
          serviceDescription: 'Q1 analytics service',
          isPerformanceComplete: true,
          recognizedAt: new Date('2024-01-31')
        },
        {
          contractId: contracts[1]._id,
          customerId: customers[1]._id,
          recognitionPeriod: '2024-03',
          recognitionDate: new Date('2024-03-31'),
          recognizedAmount: 3000.00,
          totalContractValue: 18000.00,
          recognitionMethod: 'milestone',
          status: 'pending',
          serviceDescription: 'Q2 analytics milestone',
          isPerformanceComplete: false
        }
      ]);
    });

    test('should generate revenue recognition summary', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalRecognized');
      expect(response.body.data).toHaveProperty('totalDeferred');
      expect(response.body.data).toHaveProperty('totalPending');
    });

    test('should generate recognition schedule report', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate contract performance analysis', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/contract-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should generate deferred revenue analysis', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/deferred-revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalDeferred');
      expect(response.body.data).toHaveProperty('byPeriod');
      expect(response.body.data).toHaveProperty('byMethod');
    });

    test('should generate performance obligation tracking', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/performance-obligations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('overdue');
    });

    test('should generate monthly revenue forecast', async () => {
      const response = await request(app)
        .get('/api/revenue-recognition/reports/monthly-forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Automation Tests
  describe('Automation and Scheduling', () => {
    test('should generate automatic recognition schedule', async () => {
      const response = await request(app)
        .post('/api/revenue-recognition/auto-generate-schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contractId: testContract._id,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          recognitionMethod: 'straight_line'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('generatedEntries');
      expect(response.body.generatedEntries).toBe(12); // 12 months
    });

    test('should auto-recognize completed performance obligations', async () => {
      // Create pending recognition with completed performance
      const pendingRR = await RevenueRecognition.create({
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-09',
        recognitionDate: new Date('2024-09-30'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        status: 'pending',
        serviceDescription: 'Auto-recognition test',
        isPerformanceComplete: true,
        performanceEvidence: 'Service delivery confirmation'
      });
      
      const response = await request(app)
        .post('/api/revenue-recognition/auto-recognize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          criteria: 'performanceComplete',
          date: '2024-09-30'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('processedEntries');
      expect(response.body.processedEntries).toBeGreaterThan(0);
    });

    test('should handle recurring recognition rules', async () => {
      const ruleData = {
        ruleName: 'Monthly Service Recognition',
        contractType: 'service_agreement',
        recognitionMethod: 'straight_line',
        frequency: 'monthly',
        amount: 2000.00,
        active: true
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition/recurring-rules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ruleData)
        .expect(201);
      
      expect(response.body.ruleName).toBe('Monthly Service Recognition');
      expect(response.body.active).toBe(true);
    });
  });

  // Integration Tests
  describe('Integration with Other Modules', () => {
    test('should integrate with General Ledger', async () => {
      // Create GL entry for revenue recognition
      const glEntry = await GeneralLedger.create({
        account: 'Deferred Revenue',
        description: 'Revenue recognition entry',
        debit: 0,
        credit: 2000.00,
        date: new Date('2024-01-31'),
        reference: testRevenueRecognition._id,
        transactionType: 'revenue_recognition'
      });
      
      expect(glEntry.reference.toString()).toBe(testRevenueRecognition._id.toString());
      expect(glEntry.credit).toBe(2000.00);
    });

    test('should update contract financial metrics', async () => {
      const initialRecognizedRevenue = testContract.recognizedRevenue || 0;
      
      await request(app)
        .patch(`/api/revenue-recognition/${testRevenueRecognition._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          status: 'recognized',
          recognizedAt: new Date('2024-01-31')
        })
        .expect(200);
      
      // Verify contract metrics were updated
      await testContract.reload();
      expect(testContract.recognizedRevenue).toBe(initialRecognizedRevenue + 2000.00);
    });

    test('should generate comprehensive audit trail', async () => {
      const response = await request(app)
        .get(`/api/revenue-recognition/${testRevenueRecognition._id}/audit-trail`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should integrate with billing system', async () => {
      const response = await request(app)
        .post(`/api/revenue-recognition/${testRevenueRecognition._id}/generate-invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('invoiceId');
      expect(response.body).toHaveProperty('invoiceNumber');
    });
  });

  // Performance Tests
  describe('Performance Tests', () => {
    test('should handle bulk recognition processing efficiently', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: `2024-${String(i + 1).padStart(2, '0')}`,
        recognitionDate: new Date(`2024-${String(i + 1).padStart(2, '0')}-28`),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        status: 'pending',
        serviceDescription: `Bulk recognition ${i}`,
        performanceObligation: 'Service delivery'
      }));
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/revenue-recognition/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recognitions: bulkData })
        .expect(201);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(response.body.created).toBe(100);
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should handle large contract analysis efficiently', async () => {
      // Create contract with many recognition entries
      const largeContract = await Contract.create({
        customerId: testCustomer._id,
        contractNumber: 'LARGE-2024-001',
        contractDate: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 240000.00, // Large contract
        currency: 'USD',
        status: 'active',
        contractType: 'enterprise_agreement',
        createdBy: testUser._id
      });
      
      const bulkRecognitions = Array.from({ length: 1000 }, (_, i) => ({
        contractId: largeContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
        recognitionDate: new Date(`2024-${String((i % 12) + 1).padStart(2, '0')}-28`),
        recognizedAmount: 2000.00,
        totalContractValue: 240000.00,
        recognitionMethod: 'straight_line',
        status: 'pending',
        serviceDescription: `Large contract recognition ${i}`,
        performanceObligation: 'Enterprise service delivery'
      }));
      
      await RevenueRecognition.insertMany(bulkRecognitions);
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/contracts/${largeContract._id}/analysis`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  // Security Tests
  describe('Security and Authorization', () => {
    test('should require authentication for all endpoints', async () => {
      await request(app)
        .get('/api/revenue-recognition')
        .expect(401);
      
      await request(app)
        .post('/api/revenue-recognition')
        .send({})
        .expect(401);
      
      await request(app)
        .put(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .send({})
        .expect(401);
      
      await request(app)
        .delete(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .expect(401);
    });

    test('should validate user permissions for different actions', async () => {
      // Create user with limited permissions
      const limitedUser = await User.create({
        username: 'limiteduser',
        email: 'limited@example.com',
        password: 'password123',
        role: 'viewer',
        permissions: ['revenue_recognition_read']
      });
      
      const limitedToken = jwt.sign(
        { userId: limitedUser._id, role: limitedUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      // Should allow read operations
      await request(app)
        .get('/api/revenue-recognition')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
      
      // Should deny write operations
      await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          contractId: testContract._id,
          customerId: testCustomer._id,
          recognitionPeriod: '2024-10',
          recognitionDate: new Date('2024-10-31'),
          recognizedAmount: 2000.00,
          totalContractValue: 24000.00,
          recognitionMethod: 'straight_line',
          serviceDescription: 'Security test',
          performanceObligation: 'Test service'
        })
        .expect(403);
    });

    test('should sanitize input data', async () => {
      const maliciousData = {
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '<script>alert("xss")</script>',
        serviceDescription: '<img src="x" onerror="alert(1)">',
        performanceObligation: 'Test obligation',
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line'
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData)
        .expect(400); // Should reject invalid period format
      
      expect(response.body.message).toContain('period');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Simulate database error by disconnecting
      await mongoose.disconnect();
      
      await request(app)
        .get('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
      
      // Reconnect for other tests
      await mongoose.connect(mongoServer.getUri());
    });

    test('should handle validation errors with proper messages', async () => {
      const invalidData = {
        contractId: 'invalid-contract-id',
        customerId: 'invalid-customer-id',
        recognitionPeriod: 'invalid-format',
        recognizedAmount: -1000,
        totalContractValue: -10000
      };
      
      const response = await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle contract not found errors', async () => {
      const invalidContractId = new mongoose.Types.ObjectId();
      
      const revenueData = {
        contractId: invalidContractId,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-11',
        recognitionDate: new Date('2024-11-30'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        serviceDescription: 'Contract not found test',
        performanceObligation: 'Test service'
      };
      
      await request(app)
        .post('/api/revenue-recognition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(revenueData)
        .expect(404);
    });

    test('should handle concurrent modifications', async () => {
      // Start two concurrent updates
      const update1 = request(app)
        .put(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recognizedAmount: 2100.00, serviceDescription: 'Update 1' });
      
      const update2 = request(app)
        .put(`/api/revenue-recognition/${testRevenueRecognition._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recognizedAmount: 2200.00, serviceDescription: 'Update 2' });
      
      const [response1, response2] = await Promise.all([update1, update2]);
      
      // One should succeed, one should fail with conflict
      expect([response1.status, response2.status]).toContain(200);
      expect([response1.status, response2.status]).toContain(409);
    });
  });
});

// Integration test for Revenue Recognition workflow
describe('Revenue Recognition Workflow Integration', () => {
  test('should complete full revenue recognition lifecycle', async () => {
    // 1. Create revenue recognition entry
    const createResponse = await request(app)
      .post('/api/revenue-recognition')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        contractId: testContract._id,
        customerId: testCustomer._id,
        recognitionPeriod: '2024-12',
        recognitionDate: new Date('2024-12-31'),
        recognizedAmount: 2000.00,
        totalContractValue: 24000.00,
        recognitionMethod: 'straight_line',
        status: 'pending',
        serviceDescription: 'December software subscription',
        performanceObligation: 'Software access and support',
        isPerformanceComplete: true,
        performanceEvidence: 'Service usage logs'
      })
      .expect(201);
    
    const revenueRecognitionId = createResponse.body._id;
    
    // 2. Approve revenue recognition
    await request(app)
      .patch(`/api/revenue-recognition/${revenueRecognitionId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'approved' })
      .expect(200);
    
    // 3. Recognize revenue
    await request(app)
      .patch(`/api/revenue-recognition/${revenueRecognitionId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'recognized',
        recognizedAt: new Date('2024-12-31'),
        glEntryReference: 'GL-2024-012'
      })
      .expect(200);
    
    // 4. Verify final status
    const finalResponse = await request(app)
      .get(`/api/revenue-recognition/${revenueRecognitionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(finalResponse.body.status).toBe('recognized');
    expect(finalResponse.body.glEntryReference).toBe('GL-2024-012');
    expect(finalResponse.body.recognizedAt).toBeDefined();
  });
});