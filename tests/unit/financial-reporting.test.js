const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const FinancialReport = require('../src/models/FinancialReport');
const ReportTemplate = require('../src/models/ReportTemplate');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let userId;
let companyId;
let reportTemplateId;

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
    fiscalYearEnd: new Date('2024-12-31'),
    currency: 'USD'
  });
  await company.save();
  companyId = company._id;

  // Create test report template
  const template = new ReportTemplate({
    name: 'Standard Income Statement',
    type: 'income_statement',
    description: 'Standard income statement template',
    structure: {
      sections: [
        {
          name: 'Revenue',
          lineItems: [
            { name: 'Sales Revenue', code: '4000', type: 'revenue' },
            { name: 'Service Revenue', code: '4100', type: 'revenue' },
            { name: 'Other Income', code: '4900', type: 'revenue' }
          ]
        },
        {
          name: 'Expenses',
          lineItems: [
            { name: 'Cost of Goods Sold', code: '5000', type: 'expense' },
            { name: 'Operating Expenses', code: '6000', type: 'expense' },
            { name: 'Interest Expense', code: '7000', type: 'expense' }
          ]
        }
      ]
    },
    calculations: {
      grossProfit: 'revenue - cost_of_goods_sold',
      operatingIncome: 'gross_profit - operating_expenses',
      netIncome: 'operating_income - interest_expense'
    },
    formatting: {
      currency: 'USD',
      decimalPlaces: 2,
      showPercentages: true,
      showVariances: true
    }
  });
  await template.save();
  reportTemplateId = template._id;

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
  await FinancialReport.deleteMany({});
});

describe('Financial Reporting Tests', () => {
  describe('POST /api/reports', () => {
    test('should create a new financial report successfully', async () => {
      const reportData = {
        reportName: 'Q4 2024 Income Statement',
        reportType: 'income_statement',
        templateId: reportTemplateId,
        companyId: companyId,
        reportingPeriod: {
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-12-31'),
          periodType: 'quarterly',
          fiscalYear: 2024
        },
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                {
                  name: 'Sales Revenue',
                  code: '4000',
                  currentPeriod: 250000,
                  previousPeriod: 200000,
                  type: 'revenue'
                },
                {
                  name: 'Service Revenue',
                  code: '4100',
                  currentPeriod: 75000,
                  previousPeriod: 60000,
                  type: 'revenue'
                }
              ]
            },
            {
              name: 'Expenses',
              lineItems: [
                {
                  name: 'Cost of Goods Sold',
                  code: '5000',
                  currentPeriod: 150000,
                  previousPeriod: 120000,
                  type: 'expense'
                },
                {
                  name: 'Operating Expenses',
                  code: '6000',
                  currentPeriod: 80000,
                  previousPeriod: 70000,
                  type: 'expense'
                }
              ]
            }
          ]
        },
        calculatedMetrics: {
          totalRevenue: 325000,
          grossProfit: 175000,
          operatingIncome: 95000,
          netIncome: 95000
        },
        status: 'draft',
        generatedBy: userId,
        notes: 'Q4 2024 quarterly financial report'
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportName).toBe(reportData.reportName);
      expect(response.body.data.reportType).toBe(reportData.reportType);
      expect(response.body.data.companyId).toBe(companyId.toString());
      expect(response.body.data.data.sections).toHaveLength(2);
      expect(response.body.data.calculatedMetrics.totalRevenue).toBe(325000);
      expect(response.body.data.status).toBe('draft');
    });

    test('should create balance sheet report', async () => {
      const reportData = {
        reportName: 'December 2024 Balance Sheet',
        reportType: 'balance_sheet',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly',
          fiscalYear: 2024
        },
        data: {
          sections: [
            {
              name: 'Assets',
              lineItems: [
                {
                  name: 'Cash and Cash Equivalents',
                  code: '1000',
                  currentPeriod: 150000,
                  type: 'asset'
                },
                {
                  name: 'Accounts Receivable',
                  code: '1100',
                  currentPeriod: 85000,
                  type: 'asset'
                },
                {
                  name: 'Property, Plant & Equipment',
                  code: '1500',
                  currentPeriod: 300000,
                  type: 'asset'
                }
              ]
            },
            {
              name: 'Liabilities',
              lineItems: [
                {
                  name: 'Accounts Payable',
                  code: '2000',
                  currentPeriod: 45000,
                  type: 'liability'
                },
                {
                  name: 'Long-term Debt',
                  code: '2100',
                  currentPeriod: 200000,
                  type: 'liability'
                }
              ]
            },
            {
              name: 'Equity',
              lineItems: [
                {
                  name: 'Common Stock',
                  code: '3000',
                  currentPeriod: 100000,
                  type: 'equity'
                },
                {
                  name: 'Retained Earnings',
                  code: '3100',
                  currentPeriod: 190000,
                  type: 'equity'
                }
              ]
            }
          ]
        },
        calculatedMetrics: {
          totalAssets: 535000,
          totalLiabilities: 245000,
          totalEquity: 290000,
          debtToEquity: 0.84
        },
        status: 'draft',
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportType).toBe('balance_sheet');
      expect(response.body.data.calculatedMetrics.totalAssets).toBe(535000);
      expect(response.body.data.calculatedMetrics.totalLiabilities).toBe(245000);
      expect(response.body.data.calculatedMetrics.totalEquity).toBe(290000);
      expect(response.body.data.calculatedMetrics.debtToEquity).toBe(0.84);
    });

    test('should validate required fields', async () => {
      const invalidReport = {
        reportName: '', // Empty name
        reportType: 'invalid_type', // Invalid type
        companyId: 'invalid-id',
        reportingPeriod: {
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        }
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('Report name is required');
      expect(response.body.errors).toContain('Report type must be valid');
    });

    test('should validate date consistency', async () => {
      const reportData = {
        reportName: 'Invalid Date Report',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          startDate: new Date('2024-12-31'), // End date before start date
          endDate: new Date('2024-01-01'),
          periodType: 'monthly'
        },
        data: {
          sections: []
        },
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('End date must be after start date');
    });

    test('should validate balance sheet equation', async () => {
      const reportData = {
        reportName: 'Unbalanced Balance Sheet',
        reportType: 'balance_sheet',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: {
          sections: [
            {
              name: 'Assets',
              lineItems: [
                { name: 'Cash', code: '1000', currentPeriod: 100000, type: 'asset' }
              ]
            },
            {
              name: 'Liabilities',
              lineItems: [
                { name: 'Accounts Payable', code: '2000', currentPeriod: 60000, type: 'liability' }
              ]
            },
            {
              name: 'Equity',
              lineItems: [
                { name: 'Common Stock', code: '3000', currentPeriod: 30000, type: 'equity' }
              ]
            }
          ]
        },
        calculatedMetrics: {
          totalAssets: 100000,
          totalLiabilities: 60000,
          totalEquity: 30000
        },
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Assets must equal Liabilities + Equity');
    });

    test('should require authentication', async () => {
      const reportData = {
        reportName: 'Test Report',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: { sections: [] },
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .send(reportData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/reports', () => {
    beforeEach(async () => {
      // Create test financial reports
      const reports = [
        {
          reportName: 'Q4 2024 Income Statement',
          reportType: 'income_statement',
          companyId: companyId,
          reportingPeriod: {
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-12-31'),
            periodType: 'quarterly',
            fiscalYear: 2024
          },
          data: {
            sections: [
              {
                name: 'Revenue',
                lineItems: [
                  { name: 'Sales', code: '4000', currentPeriod: 250000, type: 'revenue' }
                ]
              }
            ]
          },
          calculatedMetrics: { totalRevenue: 250000 },
          status: 'published',
          generatedBy: userId
        },
        {
          reportName: 'December 2024 Balance Sheet',
          reportType: 'balance_sheet',
          companyId: companyId,
          reportingPeriod: {
            endDate: new Date('2024-12-31'),
            periodType: 'monthly',
            fiscalYear: 2024
          },
          data: {
            sections: [
              {
                name: 'Assets',
                lineItems: [
                  { name: 'Cash', code: '1000', currentPeriod: 150000, type: 'asset' }
                ]
              }
            ]
          },
          calculatedMetrics: { totalAssets: 150000 },
          status: 'draft',
          generatedBy: userId
        },
        {
          reportName: '2024 Annual Report',
          reportType: 'comprehensive',
          companyId: companyId,
          reportingPeriod: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            periodType: 'annual',
            fiscalYear: 2024
          },
          data: { sections: [] },
          calculatedMetrics: {},
          status: 'published',
          generatedBy: userId
        }
      ];

      await FinancialReport.insertMany(reports);
    });

    test('should retrieve all financial reports', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].reportName).toBeDefined();
      expect(response.body.data[1].reportName).toBeDefined();
      expect(response.body.data[2].reportName).toBeDefined();
    });

    test('should filter reports by type', async () => {
      const response = await request(app)
        .get('/api/reports?reportType=income_statement')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].reportType).toBe('income_statement');
    });

    test('should filter reports by company', async () => {
      const response = await request(app)
        .get(`/api/reports?companyId=${companyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].companyId).toBe(companyId.toString());
    });

    test('should filter reports by status', async () => {
      const response = await request(app)
        .get('/api/reports?status=published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(report => report.status === 'published')).toBe(true);
    });

    test('should filter reports by reporting period', async () => {
      const response = await request(app)
        .get('/api/reports?periodType=quarterly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].reportingPeriod.periodType).toBe('quarterly');
    });

    test('should filter reports by date range', async () => {
      const startDate = '2024-10-01';
      const endDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/reports?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Q4 Income Statement + December Balance Sheet
    });

    test('should search reports by name', async () => {
      const response = await request(app)
        .get('/api/reports?search=Q4')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].reportName).toContain('Q4');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/reports?page=1&limit=2')
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
        .get('/api/reports?sortBy=reportingPeriod.endDate&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(new Date(response.body.data[0].reportingPeriod.endDate)).toBeGreaterThanOrEqual(
        new Date(response.body.data[1].reportingPeriod.endDate)
      );
    });
  });

  describe('GET /api/reports/:id', () => {
    let reportId;

    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Test Financial Report',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly',
          fiscalYear: 2024
        },
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                { name: 'Sales', code: '4000', currentPeriod: 100000, previousPeriod: 80000, type: 'revenue' }
              ]
            }
          ]
        },
        calculatedMetrics: {
          totalRevenue: 100000,
          growthRate: 25
        },
        status: 'published',
        generatedBy: userId,
        publishedDate: new Date(),
        metadata: {
          version: '1.0',
          generatedAt: new Date(),
          dataSource: 'general_ledger'
        }
      });
      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    test('should retrieve financial report by id', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(reportId.toString());
      expect(response.body.data.reportName).toBe('Test Financial Report');
      expect(response.body.data.reportType).toBe('income_statement');
      expect(response.body.data.metadata.version).toBe('1.0');
      expect(response.body.data.calculatedMetrics.totalRevenue).toBe(100000);
    });

    test('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/reports/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Financial report not found');
    });

    test('should validate object id format', async () => {
      const response = await request(app)
        .get('/api/reports/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid report ID format');
    });
  });

  describe('PUT /api/reports/:id', () => {
    let reportId;

    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Original Report Name',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                { name: 'Sales', code: '4000', currentPeriod: 100000, type: 'revenue' }
              ]
            }
          ]
        },
        calculatedMetrics: { totalRevenue: 100000 },
        status: 'draft',
        generatedBy: userId
      });
      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    test('should update financial report successfully', async () => {
      const updateData = {
        reportName: 'Updated Report Name',
        status: 'under_review',
        notes: 'Updated for additional review',
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                { name: 'Sales', code: '4000', currentPeriod: 120000, type: 'revenue' }
              ]
            }
          ]
        },
        calculatedMetrics: { totalRevenue: 120000 }
      };

      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportName).toBe('Updated Report Name');
      expect(response.body.data.status).toBe('under_review');
      expect(response.body.data.calculatedMetrics.totalRevenue).toBe(120000);
      expect(response.body.data.notes).toBe('Updated for additional review');
    });

    test('should prevent updating published reports without permission', async () => {
      // First publish the report
      await FinancialReport.findByIdAndUpdate(reportId, { 
        status: 'published',
        publishedDate: new Date()
      });

      const updateData = {
        reportName: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot modify published report');
    });

    test('should validate update data', async () => {
      const updateData = {
        reportName: '', // Empty name
        status: 'invalid_status',
        calculatedMetrics: {
          totalRevenue: -50000 // Invalid negative amount
        }
      };

      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Report name is required');
      expect(response.body.errors).toContain('Status must be valid');
    });
  });

  describe('DELETE /api/reports/:id', () => {
    let reportId;

    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Test Report for Deletion',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: { sections: [] },
        calculatedMetrics: {},
        status: 'draft',
        generatedBy: userId
      });
      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    test('should delete financial report successfully', async () => {
      const response = await request(app)
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Financial report deleted successfully');

      // Verify report is deleted
      const deletedReport = await FinancialReport.findById(reportId);
      expect(deletedReport).toBeNull();
    });

    test('should prevent deleting published reports', async () => {
      // First publish the report
      await FinancialReport.findByIdAndUpdate(reportId, { 
        status: 'published',
        publishedDate: new Date()
      });

      const response = await request(app)
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete published report');
    });

    test('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/reports/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Financial report not found');
    });
  });

  describe('POST /api/reports/:id/publish', () => {
    let reportId;

    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Draft Report for Publishing',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                { name: 'Sales', code: '4000', currentPeriod: 100000, type: 'revenue' }
              ]
            }
          ]
        },
        calculatedMetrics: { totalRevenue: 100000 },
        status: 'approved',
        approvedBy: userId,
        approvedDate: new Date(),
        generatedBy: userId
      });
      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    test('should publish financial report successfully', async () => {
      const publishData = {
        publicationNotes: 'Final review completed - approved for publication',
        distributionList: ['ceo@testcompany.com', 'cfo@testcompany.com'],
        accessLevel: 'internal',
        expiryDate: new Date('2025-12-31')
      };

      const response = await request(app)
        .post(`/api/reports/${reportId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(publishData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
      expect(response.body.data.publishedDate).toBeDefined();
      expect(response.body.data.publishedBy).toBe(userId.toString());
      expect(response.body.data.publicationNotes).toBe(publishData.publicationNotes);
    });

    test('should validate publication requirements', async () => {
      const invalidPublishData = {
        publicationNotes: '', // Required notes
        accessLevel: 'invalid_level'
      };

      const response = await request(app)
        .post(`/api/reports/${reportId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPublishData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Publication notes are required');
      expect(response.body.errors).toContain('Access level must be valid');
    });

    test('should prevent publishing unapproved reports', async () => {
      // First change status to draft
      await FinancialReport.findByIdAndUpdate(reportId, { status: 'draft' });

      const publishData = {
        publicationNotes: 'Attempting to publish unapproved report'
      };

      const response = await request(app)
        .post(`/api/reports/${reportId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(publishData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Report must be approved before publishing');
    });
  });

  describe('POST /api/reports/:id/approve', () => {
    let reportId;

    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Draft Report for Approval',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: { sections: [] },
        calculatedMetrics: {},
        status: 'under_review',
        generatedBy: userId
      });
      const savedReport = await report.save();
      reportId = savedReport._id;
    });

    test('should approve financial report successfully', async () => {
      const approvalData = {
        approvalNotes: 'Report reviewed and approved for publication',
        approvalLevel: 'finance_director',
        validationChecks: {
          dataAccuracy: true,
          calculationsVerified: true,
          complianceChecked: true,
          managementReviewed: true
        }
      };

      const response = await request(app)
        .post(`/api/reports/${reportId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(approvalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.approvedDate).toBeDefined();
      expect(response.body.data.approvedBy).toBe(userId.toString());
      expect(response.body.data.approvalNotes).toBe(approvalData.approvalNotes);
      expect(response.body.data.approvalLevel).toBe(approvalData.approvalLevel);
    });

    test('should require validation checks for approval', async () => {
      const invalidApprovalData = {
        approvalNotes: 'Insufficient validation',
        validationChecks: {
          dataAccuracy: false, // Must be true
          calculationsVerified: true,
          complianceChecked: true,
          managementReviewed: true
        }
      };

      const response = await request(app)
        .post(`/api/reports/${reportId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidApprovalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('All validation checks must be completed before approval');
    });
  });

  describe('GET /api/reports/analytics/summary', () => {
    beforeEach(async () => {
      // Create diverse reports for analytics
      const reports = [
        {
          reportName: 'Q1 2024 Income Statement',
          reportType: 'income_statement',
          companyId: companyId,
          reportingPeriod: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-31'),
            periodType: 'quarterly',
            fiscalYear: 2024
          },
          data: {
            sections: [
              {
                name: 'Revenue',
                lineItems: [
                  { name: 'Sales', code: '4000', currentPeriod: 200000, type: 'revenue' }
                ]
              },
              {
                name: 'Expenses',
                lineItems: [
                  { name: 'COGS', code: '5000', currentPeriod: 120000, type: 'expense' }
                ]
              }
            ]
          },
          calculatedMetrics: {
            totalRevenue: 200000,
            grossProfit: 80000,
            netIncome: 80000
          },
          status: 'published',
          generatedBy: userId,
          publishedDate: new Date('2024-04-15')
        },
        {
          reportName: 'Q2 2024 Income Statement',
          reportType: 'income_statement',
          companyId: companyId,
          reportingPeriod: {
            startDate: new Date('2024-04-01'),
            endDate: new Date('2024-06-30'),
            periodType: 'quarterly',
            fiscalYear: 2024
          },
          data: {
            sections: [
              {
                name: 'Revenue',
                lineItems: [
                  { name: 'Sales', code: '4000', currentPeriod: 250000, type: 'revenue' }
                ]
              },
              {
                name: 'Expenses',
                lineItems: [
                  { name: 'COGS', code: '5000', currentPeriod: 150000, type: 'expense' }
                ]
              }
            ]
          },
          calculatedMetrics: {
            totalRevenue: 250000,
            grossProfit: 100000,
            netIncome: 100000
          },
          status: 'published',
          generatedBy: userId,
          publishedDate: new Date('2024-07-15')
        },
        {
          reportName: 'June 2024 Balance Sheet',
          reportType: 'balance_sheet',
          companyId: companyId,
          reportingPeriod: {
            endDate: new Date('2024-06-30'),
            periodType: 'monthly',
            fiscalYear: 2024
          },
          data: {
            sections: [
              {
                name: 'Assets',
                lineItems: [
                  { name: 'Cash', code: '1000', currentPeriod: 180000, type: 'asset' }
                ]
              }
            ]
          },
          calculatedMetrics: {
            totalAssets: 180000,
            totalLiabilities: 80000,
            totalEquity: 100000
          },
          status: 'published',
          generatedBy: userId,
          publishedDate: new Date('2024-07-01')
        }
      ];

      await FinancialReport.insertMany(reports);
    });

    test('should get report analytics summary', async () => {
      const response = await request(app)
        .get('/api/reports/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalReports).toBe(3);
      expect(response.body.data.publishedCount).toBe(3);
      expect(response.body.data.reportTypeBreakdown).toBeDefined();
      expect(response.body.data.averageGenerationTime).toBeDefined();
      expect(response.body.data.complianceRate).toBe(100);
    });

    test('should get performance metrics', async () => {
      const response = await request(app)
        .get('/api/reports/analytics/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.generationMetrics).toBeDefined();
      expect(response.body.data.approvalMetrics).toBeDefined();
      expect(response.body.data.publicationMetrics).toBeDefined();
    });

    test('should get usage analytics', async () => {
      const response = await request(app)
        .get('/api/reports/analytics/usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportAccess).toBeDefined();
      expect(response.body.data.userActivity).toBeDefined();
      expect(response.body.data.popularReports).toBeDefined();
    });
  });

  describe('POST /api/reports/generate', () => {
    test('should generate report from template', async () => {
      const generationRequest = {
        templateId: reportTemplateId,
        reportName: 'Generated Q3 2024 Report',
        companyId: companyId,
        reportingPeriod: {
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-09-30'),
          periodType: 'quarterly',
          fiscalYear: 2024
        },
        dataSource: 'general_ledger',
        parameters: {
          includeComparisons: true,
          includeVariances: true,
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generationRequest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportName).toBe(generationRequest.reportName);
      expect(response.body.data.reportType).toBe('income_statement');
      expect(response.body.data.generatedBy).toBe(userId.toString());
      expect(response.body.data.generationDate).toBeDefined();
    });

    test('should generate multiple reports in batch', async () => {
      const batchRequest = {
        reports: [
          {
            templateId: reportTemplateId,
            reportName: 'Q3 2024 Income Statement',
            companyId: companyId,
            reportingPeriod: {
              startDate: new Date('2024-07-01'),
              endDate: new Date('2024-09-30'),
              periodType: 'quarterly'
            }
          },
          {
            reportName: 'September 2024 Balance Sheet',
            reportType: 'balance_sheet',
            companyId: companyId,
            reportingPeriod: {
              endDate: new Date('2024-09-30'),
              periodType: 'monthly'
            }
          }
        ]
      };

      const response = await request(app)
        .post('/api/reports/generate/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send(batchRequest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.generated).toBe(2);
      expect(response.body.data.failed).toBe(0);
    });

    test('should validate generation parameters', async () => {
      const invalidRequest = {
        templateId: 'invalid-template-id',
        reportName: '',
        companyId: 'invalid-company-id',
        reportingPeriod: {
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        }
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Valid template ID is required');
      expect(response.body.errors).toContain('Report name is required');
    });
  });

  describe('GET /api/reports/export', () => {
    beforeEach(async () => {
      const report = new FinancialReport({
        reportName: 'Export Test Report',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: {
          sections: [
            {
              name: 'Revenue',
              lineItems: [
                { name: 'Sales', code: '4000', currentPeriod: 100000, type: 'revenue' }
              ]
            }
          ]
        },
        calculatedMetrics: { totalRevenue: 100000 },
        status: 'published',
        generatedBy: userId,
        publishedDate: new Date()
      });
      await report.save();
    });

    test('should export report as PDF', async () => {
      const response = await request(app)
        .get('/api/reports/export?reportId=&format=pdf&includeCharts=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.format).toBe('pdf');
      expect(response.body.data.downloadUrl).toBeDefined();
      expect(response.body.data.expiresAt).toBeDefined();
    });

    test('should export report as Excel', async () => {
      const response = await request(app)
        .get('/api/reports/export?format=excel&includeRawData=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.format).toBe('excel');
      expect(response.body.data.downloadUrl).toBeDefined();
    });

    test('should validate export parameters', async () => {
      const response = await request(app)
        .get('/api/reports/export?format=invalid_format')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid export format');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      // Mock database connection error
      jest.spyOn(FinancialReport, 'find').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database operation failed');
    });

    test('should handle validation errors gracefully', async () => {
      const invalidReport = {
        reportName: 'Test',
        reportType: 'invalid-type',
        companyId: 'invalid-id',
        reportingPeriod: {
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        }
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle authorization errors', async () => {
      const invalidToken = 'invalid-token';
      
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large report queries efficiently', async () => {
      // Create many reports
      const reports = [];
      for (let i = 0; i < 500; i++) {
        reports.push({
          reportName: `Generated Report ${i}`,
          reportType: ['income_statement', 'balance_sheet', 'cash_flow'][i % 3],
          companyId: companyId,
          reportingPeriod: {
            endDate: new Date(2024, (i % 12), 28),
            periodType: 'monthly'
          },
          data: { sections: [] },
          calculatedMetrics: {},
          status: ['draft', 'published'][i % 2],
          generatedBy: userId
        });
      }
      await FinancialReport.insertMany(reports);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/reports?limit=50')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should paginate large result sets efficiently', async () => {
      const response = await request(app)
        .get('/api/reports?page=5&limit=25')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(5);
      expect(response.body.pagination.limit).toBe(25);
      expect(response.body.pagination.pages).toBeGreaterThan(5);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with company management', async () => {
      const reportData = {
        reportName: 'Company Integration Test',
        reportType: 'income_statement',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'annual'
        },
        data: { sections: [] },
        calculatedMetrics: {},
        status: 'published',
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify company reporting metrics are updated
      const company = await Company.findById(companyId);
      expect(company.lastReportDate).toBeDefined();
      expect(company.reportCount).toBeGreaterThan(0);
    });

    test('should integrate with user management for activities', async () => {
      const report = new FinancialReport({
        reportName: 'User Integration Test',
        reportType: 'balance_sheet',
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: { sections: [] },
        calculatedMetrics: {},
        status: 'under_review',
        generatedBy: userId
      });
      await report.save();

      // Approve the report
      const approvalData = {
        approvalNotes: 'Integration test approval',
        approvalLevel: 'finance_manager',
        validationChecks: {
          dataAccuracy: true,
          calculationsVerified: true,
          complianceChecked: true,
          managementReviewed: true
        }
      };

      await request(app)
        .post(`/api/reports/${report._id}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(approvalData);

      // Verify user activity is logged
      const user = await User.findById(userId);
      expect(user.activities).toContain(expect.stringContaining('approved financial report'));
    });

    test('should integrate with report templates', async () => {
      const reportData = {
        reportName: 'Template Integration Test',
        reportType: 'income_statement',
        templateId: reportTemplateId,
        companyId: companyId,
        reportingPeriod: {
          endDate: new Date('2024-12-31'),
          periodType: 'monthly'
        },
        data: { sections: [] },
        calculatedMetrics: {},
        generatedBy: userId
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.templateId).toBe(reportTemplateId.toString());
      
      // Verify template usage is tracked
      const template = await ReportTemplate.findById(reportTemplateId);
      expect(template.usageCount).toBeGreaterThan(0);
      expect(template.lastUsed).toBeDefined();
    });
  });
});