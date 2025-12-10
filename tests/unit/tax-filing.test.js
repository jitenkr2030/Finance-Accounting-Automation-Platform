const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const TaxFiling = require('../src/models/TaxFiling');
const TaxDocument = require('../src/models/TaxDocument');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let userId;
let companyId;

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

  // Create test company
  const company = new Company({
    name: 'Test Company Inc.',
    taxId: '12-3456789',
    businessType: 'corporation',
    incorporationDate: new Date('2020-01-01'),
    address: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US'
    },
    contactInfo: {
      email: 'contact@testcompany.com',
      phone: '555-0123'
    },
    fiscalYearEnd: new Date('2024-12-31'),
    taxJurisdiction: 'US-FEDERAL'
  });
  await company.save();
  companyId = company._id;

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
  await TaxFiling.deleteMany({});
  await TaxDocument.deleteMany({});
});

describe('Tax Filing Tests', () => {
  describe('POST /api/tax-filings', () => {
    test('should create a new tax filing successfully', async () => {
      const taxFilingData = {
        filingType: 'annual',
        taxYear: 2024,
        quarter: null,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          },
          {
            category: 'payroll_tax',
            taxableWages: 200000,
            taxLiability: 15300,
            deductions: 0
          }
        ],
        estimatedPayments: [
          {
            quarter: 'Q1',
            dueDate: new Date('2024-04-15'),
            amount: 25000,
            paidDate: new Date('2024-04-10'),
            confirmationNumber: 'EP-2024-Q1-001'
          }
        ],
        extensions: {
          filed: false,
          reason: null
        },
        notes: 'Annual tax filing for 2024'
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taxFilingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.filingType).toBe(taxFilingData.filingType);
      expect(response.body.data.taxYear).toBe(taxFilingData.taxYear);
      expect(response.body.data.companyId).toBe(companyId.toString());
      expect(response.body.data.taxCategories).toHaveLength(2);
      expect(response.body.data.estimatedPayments).toHaveLength(1);
    });

    test('should create quarterly tax filing', async () => {
      const taxFilingData = {
        filingType: 'quarterly',
        taxYear: 2024,
        quarter: 'Q1',
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'quarterly_income_tax',
            taxableIncome: 125000,
            taxLiability: 26250,
            deductions: 12500
          }
        ],
        notes: 'Q1 2024 tax filing'
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taxFilingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.filingType).toBe('quarterly');
      expect(response.body.data.quarter).toBe('Q1');
      expect(response.body.data.taxCategories[0].category).toBe('quarterly_income_tax');
    });

    test('should validate required fields', async () => {
      const invalidFiling = {
        filingType: '', // Empty type
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'invalid_status',
        companyId: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFiling)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('Filing type is required');
      expect(response.body.errors).toContain('Filing status must be valid');
    });

    test('should validate tax calculation consistency', async () => {
      const taxFilingData = {
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 100000,
            taxLiability: 30000, // 30% rate - should be validated
            deductions: 80000 // Deductions exceed income
          }
        ]
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taxFilingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Deductions cannot exceed taxable income');
    });

    test('should require authentication', async () => {
      const taxFilingData = {
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .send(taxFilingData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/tax-filings', () => {
    beforeEach(async () => {
      // Create test tax filings
      const taxFilings = [
        {
          filingType: 'annual',
          taxYear: 2024,
          dueDate: new Date('2024-04-15'),
          filingStatus: 'filed',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'income_tax',
              taxableIncome: 500000,
              taxLiability: 105000,
              deductions: 50000
            }
          ],
          confirmationNumber: 'TC-2024-001'
        },
        {
          filingType: 'quarterly',
          taxYear: 2024,
          quarter: 'Q1',
          dueDate: new Date('2024-04-15'),
          filingStatus: 'pending',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'quarterly_income_tax',
              taxableIncome: 125000,
              taxLiability: 26250,
              deductions: 12500
            }
          ]
        },
        {
          filingType: 'annual',
          taxYear: 2023,
          dueDate: new Date('2023-04-15'),
          filingStatus: 'draft',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'income_tax',
              taxableIncome: 450000,
              taxLiability: 94500,
              deductions: 45000
            }
          ]
        }
      ];

      await TaxFiling.insertMany(taxFilings);
    });

    test('should retrieve all tax filings', async () => {
      const response = await request(app)
        .get('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].filingType).toBeDefined();
      expect(response.body.data[1].filingType).toBeDefined();
      expect(response.body.data[2].filingType).toBeDefined();
    });

    test('should filter tax filings by year', async () => {
      const response = await request(app)
        .get('/api/tax-filings?taxYear=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Annual 2024 + Q1 2024
      expect(response.body.data.every(filing => filing.taxYear === 2024)).toBe(true);
    });

    test('should filter tax filings by type', async () => {
      const response = await request(app)
        .get('/api/tax-filings?filingType=annual')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // 2024 annual + 2023 annual
      expect(response.body.data.every(filing => filing.filingType === 'annual')).toBe(true);
    });

    test('should filter tax filings by status', async () => {
      const response = await request(app)
        .get('/api/tax-filings?filingStatus=filed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].filingStatus).toBe('filed');
    });

    test('should filter tax filings by company', async () => {
      const response = await request(app)
        .get(`/api/tax-filings?companyId=${companyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].companyId).toBe(companyId.toString());
    });

    test('should filter by due date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';
      
      const response = await request(app)
        .get(`/api/tax-filings?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // 2024 annual + Q1 2024
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/tax-filings?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });
  });

  describe('GET /api/tax-filings/:id', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'pending',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ],
        estimatedPayments: [
          {
            quarter: 'Q1',
            dueDate: new Date('2024-04-15'),
            amount: 25000,
            paidDate: new Date('2024-04-10'),
            confirmationNumber: 'EP-2024-Q1-001'
          }
        ],
        notes: 'Annual tax filing for testing'
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should retrieve tax filing by id', async () => {
      const response = await request(app)
        .get(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(taxFilingId.toString());
      expect(response.body.data.filingType).toBe('annual');
      expect(response.body.data.taxYear).toBe(2024);
      expect(response.body.data.estimatedPayments).toHaveLength(1);
    });

    test('should return 404 for non-existent tax filing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/tax-filings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tax filing not found');
    });

    test('should validate object id format', async () => {
      const response = await request(app)
        .get('/api/tax-filings/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid tax filing ID format');
    });
  });

  describe('PUT /api/tax-filings/:id', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ],
        notes: 'Original filing notes'
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should update tax filing successfully', async () => {
      const updateData = {
        filingStatus: 'pending_review',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 550000,
            taxLiability: 115500,
            deductions: 55000
          }
        ],
        notes: 'Updated filing notes - under review',
        extensions: {
          filed: true,
          reason: 'Need additional documentation',
          extensionDate: new Date('2024-06-15')
        }
      };

      const response = await request(app)
        .put(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.filingStatus).toBe('pending_review');
      expect(response.body.data.taxCategories[0].taxableIncome).toBe(550000);
      expect(response.body.data.notes).toBe('Updated filing notes - under review');
      expect(response.body.data.extensions.filed).toBe(true);
    });

    test('should add estimated payment', async () => {
      const updateData = {
        estimatedPayments: [
          {
            quarter: 'Q2',
            dueDate: new Date('2024-06-15'),
            amount: 27500,
            paidDate: new Date('2024-06-10'),
            confirmationNumber: 'EP-2024-Q2-001'
          }
        ]
      };

      const response = await request(app)
        .put(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.estimatedPayments).toHaveLength(1);
      expect(response.body.data.estimatedPayments[0].quarter).toBe('Q2');
    });

    test('should prevent updating filed returns without permission', async () => {
      // First mark as filed
      await TaxFiling.findByIdAndUpdate(taxFilingId, { filingStatus: 'filed', confirmationNumber: 'TC-2024-001' });

      const updateData = {
        filingStatus: 'draft',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 600000,
            taxLiability: 126000,
            deductions: 60000
          }
        ]
      };

      const response = await request(app)
        .put(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot modify filed tax return');
    });

    test('should validate update data', async () => {
      const updateData = {
        filingStatus: 'invalid_status',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: -100000, // Invalid negative amount
            taxLiability: 21000,
            deductions: 100000
          }
        ]
      };

      const response = await request(app)
        .put(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Filing status must be valid');
      expect(response.body.errors).toContain('Taxable income must be positive');
    });
  });

  describe('DELETE /api/tax-filings/:id', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ],
        notes: 'Test filing for deletion'
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should delete tax filing successfully', async () => {
      const response = await request(app)
        .delete(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tax filing deleted successfully');

      // Verify filing is deleted
      const deletedFiling = await TaxFiling.findById(taxFilingId);
      expect(deletedFiling).toBeNull();
    });

    test('should prevent deleting filed returns', async () => {
      // First mark as filed
      await TaxFiling.findByIdAndUpdate(taxFilingId, { filingStatus: 'filed', confirmationNumber: 'TC-2024-001' });

      const response = await request(app)
        .delete(`/api/tax-filings/${taxFilingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete filed tax return');
    });

    test('should return 404 for non-existent filing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/tax-filings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tax filing not found');
    });
  });

  describe('POST /api/tax-filings/:id/submit', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'pending_review',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ],
        notes: 'Ready for submission'
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should submit tax filing successfully', async () => {
      const submissionData = {
        submissionMethod: 'electronic',
        preparerInfo: {
          name: 'Tax Preparer Name',
          licenseNumber: 'TP-12345',
          firmName: 'Tax Prep Firm LLC'
        },
        authorization: true,
        digitalSignature: 'signed-hash-12345'
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.filingStatus).toBe('filed');
      expect(response.body.data.submissionDate).toBeDefined();
      expect(response.body.data.confirmationNumber).toBeDefined();
      expect(response.body.data.submissionMethod).toBe('electronic');
    });

    test('should validate submission requirements', async () => {
      const invalidSubmission = {
        submissionMethod: 'electronic',
        authorization: false, // Must be authorized
        digitalSignature: null // Required for electronic filing
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Digital signature is required for electronic filing');
      expect(response.body.errors).toContain('Authorization must be provided');
    });

    test('should prevent submitting already filed returns', async () => {
      // First submit the filing
      await TaxFiling.findByIdAndUpdate(taxFilingId, { 
        filingStatus: 'filed', 
        confirmationNumber: 'TC-2024-001',
        submissionDate: new Date()
      });

      const submissionData = {
        submissionMethod: 'electronic',
        authorization: true,
        digitalSignature: 'new-signature'
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tax filing has already been submitted');
    });
  });

  describe('POST /api/tax-filings/:id/extension', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ]
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should file tax extension successfully', async () => {
      const extensionData = {
        extensionReason: 'Need additional time to gather documentation',
        requestedExtensionDate: new Date('2024-10-15'),
        extensionMethod: 'electronic',
        estimatedTaxLiability: 100000,
        paymentAmount: 50000,
        paymentDate: new Date('2024-04-10'),
        paymentConfirmation: 'EXT-PAY-001'
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/extension`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(extensionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.extensions.filed).toBe(true);
      expect(response.body.data.extensions.reason).toBe(extensionData.extensionReason);
      expect(response.body.data.extensions.extensionDate).toBeDefined();
      expect(response.body.data.extensions.requestConfirmation).toBeDefined();
    });

    test('should validate extension requirements', async () => {
      const invalidExtension = {
        extensionReason: '', // Required reason
        requestedExtensionDate: new Date('2024-02-01'), // Cannot extend to before original due date
        extensionMethod: 'invalid_method'
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/extension`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExtension)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Extension reason is required');
      expect(response.body.errors).toContain('Extension date must be after original due date');
    });
  });

  describe('GET /api/tax-filings/analytics/summary', () => {
    beforeEach(async () => {
      // Create diverse tax filings for analytics
      const taxFilings = [
        {
          filingType: 'annual',
          taxYear: 2023,
          dueDate: new Date('2023-04-15'),
          filingStatus: 'filed',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'income_tax',
              taxableIncome: 450000,
              taxLiability: 94500,
              deductions: 45000
            }
          ],
          confirmationNumber: 'TC-2023-001',
          submissionDate: new Date('2023-04-10')
        },
        {
          filingType: 'annual',
          taxYear: 2024,
          dueDate: new Date('2024-04-15'),
          filingStatus: 'pending',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'income_tax',
              taxableIncome: 500000,
              taxLiability: 105000,
              deductions: 50000
            }
          ]
        },
        {
          filingType: 'quarterly',
          taxYear: 2024,
          quarter: 'Q1',
          dueDate: new Date('2024-04-15'),
          filingStatus: 'filed',
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'quarterly_income_tax',
              taxableIncome: 125000,
              taxLiability: 26250,
              deductions: 12500
            }
          ],
          confirmationNumber: 'TC-2024-Q1-001',
          submissionDate: new Date('2024-04-12')
        }
      ];

      await TaxFiling.insertMany(taxFilings);
    });

    test('should get tax filing analytics summary', async () => {
      const response = await request(app)
        .get('/api/tax-filings/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFilings).toBe(3);
      expect(response.body.data.filedCount).toBe(2);
      expect(response.body.data.pendingCount).toBe(1);
      expect(response.body.data.totalTaxLiability).toBe(225750); // 94500 + 105000 + 26250
      expect(response.body.data.averageTaxRate).toBeDefined();
    });

    test('should get filing status breakdown', async () => {
      const response = await request(app)
        .get('/api/tax-filings/analytics/status-breakdown')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statusBreakdown).toBeDefined();
      expect(response.body.data.statusBreakdown.filed).toBe(2);
      expect(response.body.data.statusBreakdown.pending).toBe(1);
      expect(response.body.data.complianceRate).toBeDefined();
    });

    test('should get year-over-year comparison', async () => {
      const response = await request(app)
        .get('/api/tax-filings/analytics/year-over-year')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.taxGrowth).toBeDefined();
      expect(response.body.data.incomeGrowth).toBeDefined();
      expect(response.body.data.rateChanges).toBeDefined();
    });
  });

  describe('POST /api/tax-filings/:id/documents', () => {
    let taxFilingId;

    beforeEach(async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ]
      });
      const savedFiling = await taxFiling.save();
      taxFilingId = savedFiling._id;
    });

    test('should attach tax document to filing', async () => {
      const documentData = {
        documentType: 'financial_statement',
        documentName: 'Audited Financial Statements 2024',
        documentUrl: '/documents/financial-statement-2024.pdf',
        uploadDate: new Date(),
        fileSize: 2048576, // 2MB
        checksum: 'sha256-hash-12345',
        metadata: {
          preparedBy: 'External Auditor',
          auditDate: new Date('2024-01-31'),
          pages: 25
        }
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documentType).toBe(documentData.documentType);
      expect(response.body.data.documentName).toBe(documentData.documentName);
      expect(response.body.data.taxFilingId).toBe(taxFilingId.toString());
    });

    test('should validate document requirements', async () => {
      const invalidDocument = {
        documentType: '', // Required
        documentName: '', // Required
        documentUrl: 'invalid-url',
        fileSize: -1000 // Invalid negative size
      };

      const response = await request(app)
        .post(`/api/tax-filings/${taxFilingId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDocument)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Document type is required');
      expect(response.body.errors).toContain('Document name is required');
      expect(response.body.errors).toContain('File size must be positive');
    });

    test('should list documents for filing', async () => {
      // First attach some documents
      const documents = [
        {
          documentType: 'financial_statement',
          documentName: 'Financial Statement 2024',
          documentUrl: '/documents/fs-2024.pdf',
          uploadDate: new Date(),
          taxFilingId: taxFilingId
        },
        {
          documentType: 'supporting_documentation',
          documentName: 'Receipts and Invoices',
          documentUrl: '/documents/receipts-2024.pdf',
          uploadDate: new Date(),
          taxFilingId: taxFilingId
        }
      ];

      await TaxDocument.insertMany(documents);

      const response = await request(app)
        .get(`/api/tax-filings/${taxFilingId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].taxFilingId).toBe(taxFilingId.toString());
    });
  });

  describe('GET /api/tax-filings/calculation/validate', () => {
    test('should validate tax calculations', async () => {
      const calculationData = {
        filingType: 'annual',
        taxYear: 2024,
        jurisdiction: 'US-FEDERAL',
        taxableIncome: 500000,
        deductions: 50000,
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            deductions: 50000,
            taxLiability: 105000
          }
        ]
      };

      const response = await request(app)
        .post('/api/tax-filings/calculation/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBeDefined();
      expect(response.body.data.taxRate).toBeDefined();
      expect(response.body.data.effectiveRate).toBeDefined();
      expect(response.body.data.calculations).toBeDefined();
    });

    test('should detect calculation errors', async () => {
      const invalidCalculation = {
        filingType: 'annual',
        taxYear: 2024,
        jurisdiction: 'US-FEDERAL',
        taxableIncome: 100000,
        deductions: 120000, // Deductions exceed income
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 100000,
            deductions: 120000,
            taxLiability: 30000 // Inconsistent calculation
          }
        ]
      };

      const response = await request(app)
        .post('/api/tax-filings/calculation/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCalculation)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.errors).toContain('Deductions cannot exceed taxable income');
      expect(response.body.data.errors).toContain('Tax liability calculation mismatch');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      // Mock database connection error
      jest.spyOn(TaxFiling, 'find').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database operation failed');
    });

    test('should handle validation errors gracefully', async () => {
      const invalidFiling = {
        filingType: 'invalid-type',
        taxYear: 'not-a-number',
        dueDate: 'invalid-date',
        filingStatus: 'invalid-status',
        companyId: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFiling)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle authorization errors', async () => {
      const invalidToken = 'invalid-token';
      
      const response = await request(app)
        .get('/api/tax-filings')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large tax filing queries efficiently', async () => {
      // Create many tax filings
      const taxFilings = [];
      for (let i = 0; i < 1000; i++) {
        taxFilings.push({
          filingType: i % 2 === 0 ? 'annual' : 'quarterly',
          taxYear: 2020 + (i % 5),
          quarter: i % 2 === 0 ? null : `Q${(i % 4) + 1}`,
          dueDate: new Date(2020 + (i % 5), 3, 15),
          filingStatus: ['draft', 'pending', 'filed'][i % 3],
          companyId: companyId,
          jurisdiction: 'US-FEDERAL',
          taxCategories: [
            {
              category: 'income_tax',
              taxableIncome: 100000 + (i * 1000),
              taxLiability: 21000 + (i * 200),
              deductions: 10000 + (i * 100)
            }
          ]
        });
      }
      await TaxFiling.insertMany(taxFilings);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/tax-filings?limit=50')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should paginate large result sets efficiently', async () => {
      const response = await request(app)
        .get('/api/tax-filings?page=10&limit=25')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(10);
      expect(response.body.pagination.limit).toBe(25);
      expect(response.body.pagination.pages).toBeGreaterThan(10);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with company management', async () => {
      const taxFilingData = {
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'draft',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ]
      };

      const response = await request(app)
        .post('/api/tax-filings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taxFilingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify company tax filing history is updated
      const company = await Company.findById(companyId);
      expect(company.lastTaxFilingDate).toBeDefined();
      expect(company.taxComplianceStatus).toBe('current');
    });

    test('should integrate with user management for activities', async () => {
      const taxFiling = new TaxFiling({
        filingType: 'annual',
        taxYear: 2024,
        dueDate: new Date('2024-04-15'),
        filingStatus: 'pending_review',
        companyId: companyId,
        jurisdiction: 'US-FEDERAL',
        taxCategories: [
          {
            category: 'income_tax',
            taxableIncome: 500000,
            taxLiability: 105000,
            deductions: 50000
          }
        ]
      });
      await taxFiling.save();

      // Submit the filing
      const submissionData = {
        submissionMethod: 'electronic',
        authorization: true,
        digitalSignature: 'signed-hash-12345'
      };

      await request(app)
        .post(`/api/tax-filings/${taxFiling._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData);

      // Verify user activity is logged
      const user = await User.findById(userId);
      expect(user.activities).toContain(expect.stringContaining('submitted tax filing'));
    });
  });
});