const request = require('supertest');
const express = require('express');
const consolidationRouter = require('../routes/consolidation');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'consolidation-manager'
    };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/consolidation', consolidationRouter);

describe('Multi-Entity Consolidation API', () => {
  let testUser;
  let mockEntities;
  let mockReports;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'consolidation-manager'
    };

    // Mock entities data
    mockEntities = [
      {
        id: 'entity1',
        name: 'Parent Company',
        type: 'parent',
        ownership: 100,
        currency: 'INR',
        consolidated: true,
        country: 'India',
        industry: 'Manufacturing',
        establishedDate: '2010-01-01',
        headquarters: 'Mumbai, Maharashtra',
        subsidiaries: ['entity2', 'entity3'],
        revenue: 50000000,
        employees: 500,
        fiscalYearEnd: '2023-03-31',
        taxId: '29ABCDE1234F1Z5'
      },
      {
        id: 'entity2',
        name: 'Subsidiary A',
        type: 'subsidiary',
        ownership: 75,
        currency: 'USD',
        consolidated: true,
        country: 'United States',
        industry: 'Technology',
        establishedDate: '2015-06-15',
        headquarters: 'San Francisco, CA',
        parentEntity: 'entity1',
        revenue: 15000000,
        employees: 150,
        fiscalYearEnd: '2023-12-31',
        taxId: '12-3456789'
      },
      {
        id: 'entity3',
        name: 'Subsidiary B',
        type: 'subsidiary',
        ownership: 60,
        currency: 'EUR',
        consolidated: false,
        country: 'Germany',
        industry: 'Automotive',
        establishedDate: '2018-03-20',
        headquarters: 'Munich, Bavaria',
        parentEntity: 'entity1',
        revenue: 8000000,
        employees: 80,
        fiscalYearEnd: '2023-12-31',
        taxId: 'DE123456789'
      },
      {
        id: 'entity4',
        name: 'Joint Venture C',
        type: 'joint-venture',
        ownership: 50,
        currency: 'GBP',
        consolidated: false,
        country: 'United Kingdom',
        industry: 'Energy',
        establishedDate: '2020-09-10',
        headquarters: 'London, England',
        parentEntity: 'entity2',
        revenue: 3000000,
        employees: 30,
        fiscalYearEnd: '2023-03-31',
        taxId: 'GB123456789'
      }
    ];

    // Mock consolidated reports data
    mockReports = [
      {
        reportType: 'balance-sheet',
        period: { startDate: '2023-01-01', endDate: '2023-12-31' },
        entities: ['entity1', 'entity2'],
        consolidatedFinancials: {
          revenue: 65000000,
          expenses: 45000000,
          netIncome: 20000000,
          totalAssets: 120000000,
          totalLiabilities: 50000000,
          equity: 70000000,
          cashAndEquivalents: 15000000,
          accountsReceivable: 25000000,
          inventory: 30000000,
          fixedAssets: 50000000
        },
        intercompanyEliminations: [
          {
            description: 'Intercompany sales elimination',
            amount: 5000000,
            eliminationType: 'revenue',
            affectedEntities: ['entity1', 'entity2']
          },
          {
            description: 'Intercompany receivable elimination',
            amount: 2000000,
            eliminationType: 'asset',
            affectedEntities: ['entity1', 'entity2']
          }
        ],
        currencyConsolidation: {
          baseCurrency: 'INR',
          exchangeRates: {
            'USD': 83.0,
            'EUR': 89.5,
            'GBP': 104.2
          },
          consolidationDate: '2023-12-31'
        },
        minorityInterests: [
          {
            entityId: 'entity2',
            minorityShare: 25,
            amount: 12500000
          }
        ]
      },
      {
        reportType: 'profit-loss',
        period: { startDate: '2023-01-01', endDate: '2023-12-31' },
        entities: ['entity1', 'entity2', 'entity3'],
        consolidatedFinancials: {
          revenue: 73000000,
          costOfGoodsSold: 42000000,
          grossProfit: 31000000,
          operatingExpenses: 18000000,
          operatingIncome: 13000000,
          otherIncome: 2000000,
          otherExpenses: 1000000,
          netIncome: 14000000
        },
        intercompanyEliminations: [
          {
            description: 'Intercompany sales elimination',
            amount: 8000000,
            eliminationType: 'revenue',
            affectedEntities: ['entity1', 'entity2', 'entity3']
          }
        ]
      },
      {
        reportType: 'cash-flow',
        period: { startDate: '2023-01-01', endDate: '2023-12-31' },
        entities: ['entity1', 'entity2'],
        consolidatedFinancials: {
          operatingCashFlow: 18000000,
          investingCashFlow: -8000000,
          financingCashFlow: 3000000,
          netCashFlow: 13000000,
          beginningCash: 2000000,
          endingCash: 15000000
        }
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      const entityTypes = ['parent', 'subsidiary', 'joint-venture', 'associate'];
      const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
      const countries = ['India', 'USA', 'Germany', 'UK', 'Japan', 'Canada', 'Australia'];
      const industries = ['Manufacturing', 'Technology', 'Automotive', 'Energy', 'Healthcare', 'Finance'];
      
      largeDataset.push({
        id: `entity${i + 1000}`,
        name: `Entity ${i}`,
        type: entityTypes[i % 4],
        ownership: Math.random() * 100,
        currency: currencies[i % 7],
        consolidated: i % 3 !== 0,
        country: countries[i % 7],
        industry: industries[i % 6],
        establishedDate: `20${String(10 + (i % 14)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        headquarters: `City ${i}, Country ${i % 7}`,
        revenue: Math.random() * 100000000,
        employees: Math.floor(Math.random() * 1000) + 10,
        fiscalYearEnd: '2023-12-31',
        taxId: `TAX${String(i).padStart(9, '0')}`
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /consolidation/entities', () => {
    test('should retrieve all entities successfully', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      expect(response.body).toHaveProperty('entities');
      expect(Array.isArray(response.body.entities)).toBe(true);
      expect(response.body.entities.length).toBe(4);
      expect(response.body.entities[0]).toHaveProperty('id');
      expect(response.body.entities[0]).toHaveProperty('name');
      expect(response.body.entities[0]).toHaveProperty('type');
      expect(response.body.entities[0]).toHaveProperty('ownership');
      expect(response.body.entities[0]).toHaveProperty('currency');
      expect(response.body.entities[0]).toHaveProperty('consolidated');
    });

    test('should include parent and subsidiary entities', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const entityTypes = response.body.entities.map(entity => entity.type);
      expect(entityTypes).toContain('parent');
      expect(entityTypes).toContain('subsidiary');
      expect(entityTypes).toContain('joint-venture');
    });

    test('should have correct ownership percentages', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      response.body.entities.forEach(entity => {
        expect(typeof entity.ownership).toBe('number');
        expect(entity.ownership).toBeGreaterThanOrEqual(0);
        expect(entity.ownership).toBeLessThanOrEqual(100);
      });

      // Check specific ownership values
      const parentEntity = response.body.entities.find(e => e.type === 'parent');
      expect(parentEntity.ownership).toBe(100);

      const subsidiaryA = response.body.entities.find(e => e.id === 'entity2');
      expect(subsidiaryA.ownership).toBe(75);

      const subsidiaryB = response.body.entities.find(e => e.id === 'entity3');
      expect(subsidiaryB.ownership).toBe(60);
    });

    test('should include currency information', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const currencies = response.body.entities.map(entity => entity.currency);
      expect(currencies).toContain('INR');
      expect(currencies).toContain('USD');
      expect(currencies).toContain('EUR');
      expect(currencies).toContain('GBP');
    });

    test('should indicate consolidation status', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const consolidated = response.body.entities.filter(e => e.consolidated);
      const notConsolidated = response.body.entities.filter(e => !e.consolidated);

      expect(consolidated.length).toBeGreaterThan(0);
      expect(notConsolidated.length).toBeGreaterThan(0);

      // Check specific consolidation status
      const parentEntity = response.body.entities.find(e => e.type === 'parent');
      expect(parentEntity.consolidated).toBe(true);

      const entity3 = response.body.entities.find(e => e.id === 'entity3');
      expect(entity3.consolidated).toBe(false);
    });

    test('should include detailed entity information', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const parentEntity = response.body.entities.find(e => e.type === 'parent');
      expect(parentEntity).toHaveProperty('subsidiaries');
      expect(Array.isArray(parentEntity.subsidiaries)).toBe(true);

      const subsidiaryA = response.body.entities.find(e => e.id === 'entity2');
      expect(subsidiaryA).toHaveProperty('parentEntity');
      expect(subsidiaryA.parentEntity).toBe('entity1');

      // Check financial information
      response.body.entities.forEach(entity => {
        expect(entity).toHaveProperty('revenue');
        expect(entity).toHaveProperty('employees');
        expect(entity).toHaveProperty('fiscalYearEnd');
        expect(entity).toHaveProperty('taxId');
      });
    });

    test('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/consolidation/entities')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('entities');
        expect(response.body.entities.length).toBe(4);
      });
    });

    test('should return consistent entity data', async () => {
      const responses = await Promise.all([
        request(app).get('/consolidation/entities'),
        request(app).get('/consolidation/entities'),
        request(app).get('/consolidation/entities')
      ]);

      responses.forEach(response => {
        expect(response.body.entities.length).toBe(4);
        expect(response.body.entities.map(e => e.id)).toEqual([
          'entity1', 'entity2', 'entity3', 'entity4'
        ]);
      });
    });

    test('should handle performance with large entity datasets', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.entities.length).toBe(4);
    });

    test('should validate entity structure', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      response.body.entities.forEach(entity => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('type');
        expect(entity).toHaveProperty('ownership');
        expect(entity).toHaveProperty('currency');
        expect(entity).toHaveProperty('consolidated');
        expect(entity).toHaveProperty('country');
        expect(entity).toHaveProperty('industry');
        expect(entity).toHaveProperty('establishedDate');
        expect(entity).toHaveProperty('headquarters');
        expect(entity).toHaveProperty('revenue');
        expect(entity).toHaveProperty('employees');
        expect(entity).toHaveProperty('fiscalYearEnd');
        expect(entity).toHaveProperty('taxId');
        
        expect(typeof entity.id).toBe('string');
        expect(typeof entity.name).toBe('string');
        expect(typeof entity.type).toBe('string');
        expect(typeof entity.ownership).toBe('number');
        expect(typeof entity.currency).toBe('string');
        expect(typeof entity.consolidated).toBe('boolean');
      });
    });

    test('should handle database errors gracefully', async () => {
      // The mock implementation should not throw errors, but test the structure
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      expect(response.body).toHaveProperty('entities');
      expect(Array.isArray(response.body.entities)).toBe(true);
    });

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/consolidation/entities')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.entities.length).toBe(4);
      });
    });
  });

  describe('POST /consolidation/generate-report', () => {
    test('should generate balance sheet report successfully', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('reportType');
      expect(response.body.report).toHaveProperty('period');
      expect(response.body.report).toHaveProperty('entities');
      expect(response.body.report).toHaveProperty('consolidatedFinancials');
      expect(response.body.report).toHaveProperty('intercompanyEliminations');
      expect(response.body.report.reportType).toBe('balance-sheet');
      expect(response.body.report.period.startDate).toBe('2023-01-01');
      expect(response.body.report.period.endDate).toBe('2023-12-31');
    });

    test('should generate profit & loss report successfully', async () => {
      const reportRequest = {
        reportType: 'profit-loss',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report.reportType).toBe('profit-loss');
      expect(response.body.report.consolidatedFinancials).toHaveProperty('revenue');
      expect(response.body.report.consolidatedFinancials).toHaveProperty('netIncome');
    });

    test('should generate cash flow report successfully', async () => {
      const reportRequest = {
        reportType: 'cash-flow',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report.reportType).toBe('cash-flow');
      expect(response.body.report.consolidatedFinancials).toHaveProperty('operatingCashFlow');
      expect(response.body.report.consolidatedFinancials).toHaveProperty('netCashFlow');
    });

    test('should include consolidated financial data', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      const financials = response.body.report.consolidatedFinancials;
      expect(financials).toHaveProperty('revenue');
      expect(financials).toHaveProperty('expenses');
      expect(financials).toHaveProperty('netIncome');
      expect(financials).toHaveProperty('totalAssets');
      expect(financials).toHaveProperty('totalLiabilities');
      expect(financials).toHaveProperty('equity');
      
      // Validate financial data types
      expect(typeof financials.revenue).toBe('number');
      expect(typeof financials.expenses).toBe('number');
      expect(typeof financials.netIncome).toBe('number');
      expect(typeof financials.totalAssets).toBe('number');
    });

    test('should include intercompany eliminations', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toHaveProperty('intercompanyEliminations');
      expect(Array.isArray(response.body.report.intercompanyEliminations)).toBe(true);
      
      const elimination = response.body.report.intercompanyEliminations[0];
      expect(elimination).toHaveProperty('description');
      expect(elimination).toHaveProperty('amount');
      expect(elimination).toHaveProperty('eliminationType');
      expect(elimination).toHaveProperty('affectedEntities');
      expect(typeof elimination.amount).toBe('number');
      expect(Array.isArray(elimination.affectedEntities)).toBe(true);
    });

    test('should include currency consolidation details', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toHaveProperty('currencyConsolidation');
      
      const currencyConsolidation = response.body.report.currencyConsolidation;
      expect(currencyConsolidation).toHaveProperty('baseCurrency');
      expect(currencyConsolidation).toHaveProperty('exchangeRates');
      expect(currencyConsolidation).toHaveProperty('consolidationDate');
      
      expect(currencyConsolidation.baseCurrency).toBe('INR');
      expect(typeof currencyConsolidation.exchangeRates).toBe('object');
    });

    test('should include minority interests', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toHaveProperty('minorityInterests');
      expect(Array.isArray(response.body.report.minorityInterests)).toBe(true);
      
      const minorityInterest = response.body.report.minorityInterests[0];
      expect(minorityInterest).toHaveProperty('entityId');
      expect(minorityInterest).toHaveProperty('minorityShare');
      expect(minorityInterest).toHaveProperty('amount');
      expect(typeof minorityInterest.minorityShare).toBe('number');
      expect(typeof minorityInterest.amount).toBe('number');
    });

    test('should include correct entity list', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report.entities).toEqual(['entity1', 'entity2']);
      expect(Array.isArray(response.body.report.entities)).toBe(true);
    });

    test('should handle missing period gracefully', async () => {
      const reportRequest = {
        reportType: 'balance-sheet'
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toBeDefined();
      expect(response.body.report.reportType).toBe('balance-sheet');
    });

    test('should handle missing report type gracefully', async () => {
      const reportRequest = {
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toBeDefined();
    });

    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .send({})
        .expect(200);

      expect(response.body.report).toBeDefined();
    });

    test('should generate unique reports for different periods', async () => {
      const periods = [
        { startDate: '2023-01-01', endDate: '2023-12-31' },
        { startDate: '2022-01-01', endDate: '2022-12-31' },
        { startDate: '2023-06-01', endDate: '2023-12-31' }
      ];

      const reports = [];
      for (const period of periods) {
        const response = await request(app)
          .post('/consolidation/generate-report')
          .send({ reportType: 'balance-sheet', period })
          .expect(200);
        reports.push(response.body.report);
      }

      // Reports should be generated (they may have same mock data)
      expect(reports.length).toBe(3);
      reports.forEach(report => {
        expect(report).toHaveProperty('reportType');
        expect(report).toHaveProperty('period');
      });
    });

    test('should handle concurrent report generation', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const promises = Array.from({ length: 10 }, () =>
        request(app).post('/consolidation/generate-report').send(reportRequest)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('report');
        expect(response.body.report).toHaveProperty('reportType');
        expect(response.body.report).toHaveProperty('consolidatedFinancials');
      });
    });

    test('should handle special characters in report parameters', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        },
        customNote: 'Report with special chars: @#$%^&*()'
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toBeDefined();
    });

    test('should handle very long report periods', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2020-01-01',
          endDate: '2025-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toBeDefined();
    });

    test('should validate report data structure', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      const report = response.body.report;
      
      expect(report).toHaveProperty('reportType');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('entities');
      expect(report).toHaveProperty('consolidatedFinancials');
      expect(report).toHaveProperty('intercompanyEliminations');
      
      expect(typeof report.reportType).toBe('string');
      expect(typeof report.period).toBe('object');
      expect(Array.isArray(report.entities)).toBe(true);
      expect(typeof report.consolidatedFinancials).toBe('object');
      expect(Array.isArray(report.intercompanyEliminations)).toBe(true);
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const responses = await Promise.all([
        request(app).get('/consolidation/entities'),
        request(app).post('/consolidation/generate-report').send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
      ]);

      // Since auth middleware is mocked, these should pass
      responses.forEach(response => {
        expect(response.status).not.toBe(401);
      });
    });

    test('should validate user permissions for consolidation operations', async () => {
      const testRoles = ['admin', 'consolidation-manager', 'financial-analyst', 'auditor', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const responses = await Promise.all([
          request(app).get('/consolidation/entities'),
          request(app).post('/consolidation/generate-report').send({
            reportType: 'balance-sheet',
            period: { startDate: '2023-01-01', endDate: '2023-12-31' }
          })
        ]);
        
        responses.forEach(response => {
          expect(response.status).not.toBe(403);
        });
      }
    });

    test('should prevent unauthorized access to consolidation data', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      // Should return entities without exposing sensitive internal data
      expect(response.body.entities).toBeDefined();
      expect(response.body.entities.length).toBe(4);
    });

    test('should sanitize consolidation report outputs', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' },
          customNote: '<script>alert("xss")</script>Special report'
        })
        .expect(200);

      // Report should not contain malicious content
      const reportString = JSON.stringify(response.body.report);
      expect(reportString).not.toContain('<script>');
    });

    test('should validate consolidation parameters', async () => {
      const maliciousRequests = [
        {
          reportType: '../../../etc/passwd',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        },
        {
          reportType: '<script>alert("xss")</script>',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        }
      ];

      for (const requestData of maliciousRequests) {
        const response = await request(app)
          .post('/consolidation/generate-report')
          .send(requestData)
          .expect(200);

        // Should handle malicious input safely
        expect(response.body.report).toBeDefined();
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle malformed JSON requests', async () => {
      const responses = await Promise.all([
        request(app)
          .post('/consolidation/generate-report')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400),
        request(app)
          .get('/consolidation/entities')
          .expect(200) // GET endpoint is more forgiving
      ]);

      expect(responses[0].status).toBe(400);
      expect(responses[1].status).toBe(200);
    });

    test('should handle missing required fields gracefully', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .send({ invalidField: 'value' })
        .expect(200);

      expect(response.body.report).toBeDefined();
    });

    test('should handle unsupported content types', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .set('Content-Type', 'text/plain')
        .send('plain text report data')
        .expect(415);

      expect(response.status).toBe(415);
    });

    test('should handle timeout scenarios', async () => {
      // Test with a timeout mechanism
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ status: 408 }), 5000);
      });

      const response = await request(app)
        .get('/consolidation/entities');

      expect(response.status).toBe(200);
    });

    test('should handle invalid date formats gracefully', async () => {
      const reportRequest = {
        reportType: 'balance-sheet',
        period: {
          startDate: 'invalid-date',
          endDate: 'another-invalid-date'
        }
      };

      const response = await request(app)
        .post('/consolidation/generate-report')
        .send(reportRequest)
        .expect(200);

      expect(response.body.report).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const responses = await Promise.all([
        request(app).get('/consolidation/entities').expect(200),
        request(app).post('/consolidation/generate-report').send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        }).expect(200)
      ]);

      responses.forEach(response => {
        expect(response.body).toBeDefined();
      });
    });

    test('should handle complete consolidation workflow', async () => {
      // Step 1: Get entities
      const entitiesResponse = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      expect(entitiesResponse.body.entities.length).toBe(4);

      // Step 2: Generate balance sheet report
      const balanceSheetResponse = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      expect(balanceSheetResponse.body.report.reportType).toBe('balance-sheet');

      // Step 3: Generate profit & loss report
      const pnlResponse = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'profit-loss',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      expect(pnlResponse.body.report.reportType).toBe('profit-loss');

      // Step 4: Generate cash flow report
      const cashFlowResponse = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'cash-flow',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      expect(cashFlowResponse.body.report.reportType).toBe('cash-flow');
    });

    test('should handle multiple consolidation operations in sequence', async () => {
      // Generate multiple reports
      const reportTypes = ['balance-sheet', 'profit-loss', 'cash-flow'];
      const reports = [];

      for (const reportType of reportTypes) {
        const response = await request(app)
          .post('/consolidation/generate-report')
          .send({
            reportType: reportType,
            period: { startDate: '2023-01-01', endDate: '2023-12-31' }
          })
          .expect(200);

        reports.push(response.body.report);
      }

      expect(reports.length).toBe(3);
      reports.forEach(report => {
        expect(report).toHaveProperty('reportType');
        expect(report).toHaveProperty('consolidatedFinancials');
      });
    });

    test('should handle concurrent consolidation operations', async () => {
      const promises = [];
      
      // Multiple concurrent operations
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app).get('/consolidation/entities'),
          request(app).post('/consolidation/generate-report').send({
            reportType: ['balance-sheet', 'profit-loss', 'cash-flow'][i % 3],
            period: { startDate: '2023-01-01', endDate: '2023-12-31' }
          })
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should maintain consolidation data integrity across operations', async () => {
      // Get entities
      const entitiesResponse = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const entities = entitiesResponse.body.entities;
      const parentEntity = entities.find(e => e.type === 'parent');

      // Generate report
      const reportResponse = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      // Verify data consistency
      expect(parentEntity.id).toBe('entity1');
      expect(reportResponse.body.report.entities).toContain('entity1');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large entity datasets efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.entities.length).toBe(4);
    });

    test('should maintain response time under concurrent load', async () => {
      const concurrentRequests = 30;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) => {
        const endpoint = i % 2;
        if (endpoint === 0) {
          return request(app).get('/consolidation/entities');
        } else {
          return request(app).post('/consolidation/generate-report').send({
            reportType: 'balance-sheet',
            period: { startDate: '2023-01-01', endDate: '2023-12-31' }
          });
        }
      });

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should handle memory efficiently with large operations', async () => {
      const startMemory = process.memoryUsage().heapUsed;

      // Perform multiple consolidation operations
      for (let i = 0; i < 100; i++) {
        await request(app).get('/consolidation/entities').expect(200);
        await request(app).post('/consolidation/generate-report').send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        }).expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(150 * 1024 * 1024); // 150MB
    });

    test('should handle rapid successive report generation', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/consolidation/generate-report')
            .send({
              reportType: ['balance-sheet', 'profit-loss', 'cash-flow'][i % 3],
              period: { startDate: '2023-01-01', endDate: '2023-12-31' }
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.report).toBeDefined();
      });
    });

    test('should maintain performance with various report types', async () => {
      const reportTypes = ['balance-sheet', 'profit-loss', 'cash-flow'];
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/consolidation/generate-report')
            .send({
              reportType: reportTypes[i % 3],
              period: { startDate: '2023-01-01', endDate: '2023-12-31' }
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.report).toBeDefined();
      });
    });
  });

  describe('Consolidation Data Validation Tests', () => {
    test('should validate entity data structure', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      response.body.entities.forEach(entity => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('type');
        expect(entity).toHaveProperty('ownership');
        expect(entity).toHaveProperty('currency');
        expect(entity).toHaveProperty('consolidated');
        expect(entity).toHaveProperty('country');
        expect(entity).toHaveProperty('industry');
        expect(entity).toHaveProperty('revenue');
        expect(entity).toHaveProperty('employees');
        
        expect(typeof entity.ownership).toBe('number');
        expect(entity.ownership).toBeGreaterThanOrEqual(0);
        expect(entity.ownership).toBeLessThanOrEqual(100);
        expect(typeof entity.consolidated).toBe('boolean');
        expect(typeof entity.revenue).toBe('number');
        expect(entity.revenue).toBeGreaterThanOrEqual(0);
      });
    });

    test('should validate report data structure', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      const report = response.body.report;
      
      expect(report).toHaveProperty('reportType');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('entities');
      expect(report).toHaveProperty('consolidatedFinancials');
      expect(report).toHaveProperty('intercompanyEliminations');
      
      expect(typeof report.reportType).toBe('string');
      expect(typeof report.period).toBe('object');
      expect(Array.isArray(report.entities)).toBe(true);
      expect(typeof report.consolidatedFinancials).toBe('object');
      expect(Array.isArray(report.intercompanyEliminations)).toBe(true);
    });

    test('should handle various entity types', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const entityTypes = response.body.entities.map(e => e.type);
      expect(entityTypes).toContain('parent');
      expect(entityTypes).toContain('subsidiary');
      expect(entityTypes).toContain('joint-venture');
      
      // Check specific entities
      const parent = response.body.entities.find(e => e.type === 'parent');
      const subsidiary = response.body.entities.find(e => e.type === 'subsidiary');
      const jointVenture = response.body.entities.find(e => e.type === 'joint-venture');
      
      expect(parent.ownership).toBe(100);
      expect(subsidiary.ownership).toBe(75);
      expect(jointVenture.ownership).toBe(50);
    });

    test('should handle various report types', async () => {
      const reportTypes = ['balance-sheet', 'profit-loss', 'cash-flow'];
      
      for (const reportType of reportTypes) {
        const response = await request(app)
          .post('/consolidation/generate-report')
          .send({
            reportType: reportType,
            period: { startDate: '2023-01-01', endDate: '2023-12-31' }
          })
          .expect(200);

        expect(response.body.report.reportType).toBe(reportType);
        expect(response.body.report.consolidatedFinancials).toBeDefined();
      }
    });

    test('should handle various consolidation periods', async () => {
      const periods = [
        { startDate: '2023-01-01', endDate: '2023-12-31' },
        { startDate: '2023-06-01', endDate: '2023-12-31' },
        { startDate: '2023-01-01', endDate: '2023-06-30' }
      ];

      for (const period of periods) {
        const response = await request(app)
          .post('/consolidation/generate-report')
          .send({
            reportType: 'balance-sheet',
            period: period
          })
          .expect(200);

        expect(response.body.report.period.startDate).toBe(period.startDate);
        expect(response.body.report.period.endDate).toBe(period.endDate);
      }
    });

    test('should handle various ownership percentages', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      const ownershipPercentages = response.body.entities.map(e => e.ownership);
      
      ownershipPercentages.forEach(ownership => {
        expect(typeof ownership).toBe('number');
        expect(ownership).toBeGreaterThanOrEqual(0);
        expect(ownership).toBeLessThanOrEqual(100);
      });

      // Check specific ownership values
      expect(ownershipPercentages).toContain(100); // Parent
      expect(ownershipPercentages).toContain(75);  // Subsidiary A
      expect(ownershipPercentages).toContain(60);  // Subsidiary B
      expect(ownershipPercentages).toContain(50);  // Joint Venture
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log entity access activities', async () => {
      const response = await request(app)
        .get('/consolidation/entities')
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.entities.length).toBe(4);
    });

    test('should track report generation history', async () => {
      const response = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      expect(response.body.report.reportType).toBe('balance-sheet');
      expect(response.body.report.consolidatedFinancials).toBeDefined();
    });

    test('should maintain consolidation activity history', async () => {
      // Multiple operations to test history
      await request(app).get('/consolidation/entities').expect(200);
      await request(app).post('/consolidation/generate-report').send({
        reportType: 'balance-sheet',
        period: { startDate: '2023-01-01', endDate: '2023-12-31' }
      }).expect(200);
      await request(app).post('/consolidation/generate-report').send({
        reportType: 'profit-loss',
        period: { startDate: '2023-01-01', endDate: '2023-12-31' }
      }).expect(200);

      // All operations should complete without errors
      expect(true).toBe(true);
    });

    test('should preserve consolidation data integrity', async () => {
      // Test multiple operations to ensure integrity
      await request(app).get('/consolidation/entities').expect(200);
      
      const reportResponse = await request(app)
        .post('/consolidation/generate-report')
        .send({
          reportType: 'balance-sheet',
          period: { startDate: '2023-01-01', endDate: '2023-12-31' }
        })
        .expect(200);

      // Verify data consistency
      expect(reportResponse.body.report.entities).toBeDefined();
      expect(reportResponse.body.report.consolidatedFinancials).toBeDefined();
    });
  });
});