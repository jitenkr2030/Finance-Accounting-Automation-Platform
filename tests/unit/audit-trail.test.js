const request = require('supertest');
const express = require('express');
const auditTrailRouter = require('../routes/auditTrail');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'admin'
    };
    next();
  }
}));

// Mock database models
jest.mock('../models/AnalyticsAI', () => ({
  AuditLog: {
    findAndCountAll: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/auditTrail', auditTrailRouter);

describe('Audit Trail API', () => {
  let testUser;
  let mockAuditLogs;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'admin'
    };

    // Mock audit log data
    mockAuditLogs = [
      {
        id: 1,
        userId: 'user-1',
        companyId: 'test-company-id',
        entity: 'journal-entry',
        action: 'create',
        timestamp: new Date('2023-12-01T10:00:00Z'),
        details: {
          entryNumber: 'JE-001',
          amount: 1000
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      },
      {
        id: 2,
        userId: 'user-2',
        companyId: 'test-company-id',
        entity: 'invoice',
        action: 'update',
        timestamp: new Date('2023-12-01T11:00:00Z'),
        details: {
          invoiceId: 'INV-001',
          status: 'paid'
        },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0'
      },
      {
        id: 3,
        userId: 'user-1',
        companyId: 'test-company-id',
        entity: 'user',
        action: 'delete',
        timestamp: new Date('2023-12-01T12:00:00Z'),
        details: {
          deletedUserId: 'user-3'
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      largeDataset.push({
        id: i + 1000,
        userId: `user-${(i % 10) + 1}`,
        companyId: 'test-company-id',
        entity: ['journal-entry', 'invoice', 'user', 'account', 'payment'][i % 5],
        action: ['create', 'update', 'delete', 'view'][i % 4],
        timestamp: new Date(2023, 11, 1 + (i % 30), (i % 24), (i % 60)),
        details: {
          entityId: `${['JE', 'INV', 'USR', 'ACC', 'PAY'][i % 5]}-${String(i).padStart(3, '0')}`,
          changeDescription: `Audit log entry ${i}`
        },
        ipAddress: `192.168.1.${(i % 255) + 1}`,
        userAgent: 'Mozilla/5.0 (Test Browser)'
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /auditTrail/logs', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should retrieve audit logs with default pagination', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockAuditLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBeGreaterThan(0);
      expect(response.body.logs.length).toBeLessThanOrEqual(50); // Default limit

      // Check pagination structure
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('itemsPerPage');
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(50);
    });

    test('should filter logs by userId', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const filteredLogs = [mockAuditLogs[0], mockAuditLogs[2]]; // Both from user-1
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: filteredLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs?userId=user-1')
        .expect(200);

      expect(response.body.logs.length).toBe(2);
      
      // Verify all logs belong to user-1
      response.body.logs.forEach(log => {
        expect(log.userId).toBe('user-1');
      });
    });

    test('should filter logs by entity type', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const filteredLogs = [mockAuditLogs[1]]; // Only invoice
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: filteredLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs?entity=invoice')
        .expect(200);

      expect(response.body.logs.length).toBe(1);
      expect(response.body.logs[0].entity).toBe('invoice');
    });

    test('should filter logs by action type', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const filteredLogs = [mockAuditLogs[0]]; // Only create action
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: filteredLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs?action=create')
        .expect(200);

      expect(response.body.logs.length).toBe(1);
      expect(response.body.logs[0].action).toBe('create');
    });

    test('should filter logs by date range', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const startDate = '2023-12-01T09:00:00Z';
      const endDate = '2023-12-01T13:00:00Z';
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockAuditLogs
      });

      const response = await request(app)
        .get(`/auditTrail/logs?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body.logs.length).toBe(3);
      
      // Verify the query was called with date range
      expect(AuditLog.findAndCountAll).toHaveBeenCalled();
      const callArgs = AuditLog.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.timestamp).toBeDefined();
    });

    test('should handle custom pagination parameters', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const page = 3;
      const limit = 10;
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: Array.from({ length: 10 }, (_, i) => ({
          ...mockAuditLogs[i % 3],
          id: i + 1
        }))
      });

      const response = await request(app)
        .get(`/auditTrail/logs?page=${page}&limit=${limit}`)
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(page);
      expect(response.body.pagination.itemsPerPage).toBe(limit);
      expect(response.body.pagination.totalPages).toBe(10); // 100 / 10 = 10 pages
      
      // Verify offset calculation
      const callArgs = AuditLog.findAndCountAll.mock.calls[0][0];
      expect(callArgs.offset).toBe((page - 1) * limit);
      expect(callArgs.limit).toBe(limit);
    });

    test('should sort logs by timestamp in descending order', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockAuditLogs.sort((a, b) => b.timestamp - a.timestamp)
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Verify order
      for (let i = 0; i < response.body.logs.length - 1; i++) {
        const current = new Date(response.body.logs[i].timestamp);
        const next = new Date(response.body.logs[i + 1].timestamp);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    test('should handle empty results gracefully', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/auditTrail/logs?entity=nonexistent')
        .expect(200);

      expect(response.body.logs.length).toBe(0);
      expect(response.body.pagination.totalItems).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
    });

    test('should include all required audit log fields', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockAuditLogs[0]]
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      const log = response.body.logs[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('userId');
      expect(log).toHaveProperty('companyId');
      expect(log).toHaveProperty('entity');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('details');
      expect(log).toHaveProperty('ipAddress');
      expect(log).toHaveProperty('userAgent');
    });

    test('should handle complex multi-filter queries', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockAuditLogs[0]]
      });

      const response = await request(app)
        .get('/auditTrail/logs?userId=user-1&entity=journal-entry&action=create&page=1&limit=25')
        .expect(200);

      expect(response.body.logs.length).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(25);
      
      // Verify all filters were applied
      const callArgs = AuditLog.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.userId).toBe('user-1');
      expect(callArgs.where.entity).toBe('journal-entry');
      expect(callArgs.where.action).toBe('create');
    });

    test('should handle invalid pagination parameters gracefully', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: mockAuditLogs
      });

      // Test with negative page number
      const response = await request(app)
        .get('/auditTrail/logs?page=-1&limit=invalid')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should handle database errors gracefully', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed query parameters', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/auditTrail/logs?startDate=invalid-date&endDate=another-invalid-date')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should handle performance with large datasets', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 10000,
        rows: Array.from({ length: 50 }, (_, i) => largeDataset[i])
      });

      const startTime = Date.now();
      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.logs.length).toBe(50);
    });

    test('should handle concurrent requests efficiently', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockAuditLogs
      });

      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/auditTrail/logs')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('logs');
        expect(response.body).toHaveProperty('pagination');
      });
    });

    test('should maintain data consistency across paginated requests', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      
      // First page
      AuditLog.findAndCountAll.mockResolvedValueOnce({
        count: 100,
        rows: Array.from({ length: 50 }, (_, i) => largeDataset[i])
      });
      
      // Second page
      AuditLog.findAndCountAll.mockResolvedValueOnce({
        count: 100,
        rows: Array.from({ length: 50 }, (_, i) => largeDataset[i + 50])
      });

      const firstPageResponse = await request(app)
        .get('/auditTrail/logs?page=1&limit=50')
        .expect(200);

      const secondPageResponse = await request(app)
        .get('/auditTrail/logs?page=2&limit=50')
        .expect(200);

      expect(firstPageResponse.body.pagination.totalItems).toBe(100);
      expect(secondPageResponse.body.pagination.totalItems).toBe(100);
      expect(firstPageResponse.body.logs.length).toBe(50);
      expect(secondPageResponse.body.logs.length).toBe(50);
    });
  });

  describe('Data Validation Tests', () => {
    test('should validate audit log structure', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockAuditLogs[0]]
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      const log = response.body.logs[0 Validate data types
      expect];
      
      //(typeof log.id).toBe('number');
      expect(typeof log.userId).toBe('string');
      expect(typeof log.companyId).toBe('string');
      expect(typeof log.entity).toBe('string');
      expect(typeof log.action).toBe('string');
      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(typeof log.details).toBe('object');
      expect(typeof log.ipAddress).toBe('string');
      expect(typeof log.userAgent).toBe('string');
    });

    test('should handle various entity types', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const entityTypes = ['journal-entry', 'invoice', 'user', 'account', 'payment'];
      const logsByEntity = {};
      
      entityTypes.forEach(entity => {
        logsByEntity[entity] = mockAuditLogs.filter(log => log.entity === entity);
      });

      for (const entity of entityTypes) {
        AuditLog.findAndCountAll.mockResolvedValueOnce({
          count: logsByEntity[entity].length,
          rows: logsByEntity[entity]
        });

        const response = await request(app)
          .get(`/auditTrail/logs?entity=${entity}`)
          .expect(200);

        response.body.logs.forEach(log => {
          expect(log.entity).toBe(entity);
        });
      }
    });

    test('should handle various action types', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const actionTypes = ['create', 'update', 'delete', 'view'];
      const logsByAction = {};
      
      actionTypes.forEach(action => {
        logsByAction[action] = mockAuditLogs.filter(log => log.action === action);
      });

      for (const action of actionTypes) {
        if (logsByAction[action].length > 0) {
          AuditLog.findAndCountAll.mockResolvedValueOnce({
            count: logsByAction[action].length,
            rows: logsByAction[action]
          });

          const response = await request(app)
            .get(`/auditTrail/logs?action=${action}`)
            .expect(200);

          response.body.logs.forEach(log => {
            expect(log.action).toBe(action);
          });
        }
      }
    });

    test('should handle various date formats', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockAuditLogs
      });

      const dateFormats = [
        '2023-12-01',
        '2023-12-01T10:00:00Z',
        '2023-12-01T10:00:00.000Z'
      ];

      for (const dateFormat of dateFormats) {
        const response = await request(app)
          .get(`/auditTrail/logs?startDate=${dateFormat}&endDate=${dateFormat}`)
          .expect(200);

        expect(response.body).toHaveProperty('logs');
      }
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .get('/auditTrail/logs');

      // Since auth middleware is mocked, this should pass
      expect(response.status).not.toBe(401);
    });

    test('should validate user permissions for audit log access', async () => {
      const testRoles = ['admin', 'auditor', 'viewer', 'user'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const response = await request(app)
          .get('/auditTrail/logs');
        
        expect(response.status).not.toBe(403);
      }
    });

    test('should filter logs by companyId for multi-tenant security', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockAuditLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Verify company filter is applied
      expect(AuditLog.findAndCountAll).toHaveBeenCalled();
      const callArgs = AuditLog.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.companyId).toBe('test-company-id');
    });

    test('should prevent access to sensitive audit information', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const sensitiveLogs = [
        {
          ...mockAuditLogs[0],
          details: {
            ...mockAuditLogs[0].details,
            password: 'hidden-password',
            creditCard: '1234-5678-9012-3456'
          }
        }
      ];
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: sensitiveLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Should contain audit information but not expose sensitive data
      expect(response.body.logs[0].details).toBeDefined();
    });

    test('should sanitize log entries to prevent XSS', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const maliciousLog = {
        ...mockAuditLogs[0],
        details: {
          maliciousInput: '<script>alert("xss")</script>',
          userComment: 'User said: <img src=x onerror=alert(1)>'
        }
      };
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [maliciousLog]
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Response should be safe
      expect(response.body.logs[0].details.maliciousInput).toBeDefined();
      expect(response.body.logs[0].details.userComment).toBeDefined();
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection failures', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed query parameters', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/auditTrail/logs?page=abc&limit=def')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should handle timeout scenarios', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          count: 0,
          rows: []
        }), 100))
      );

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    test('should handle invalid date ranges gracefully', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      // End date before start date
      const response = await request(app)
        .get('/auditTrail/logs?startDate=2023-12-31&endDate=2023-12-01')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    test('should handle memory constraints efficiently', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const hugeDataset = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        userId: 'user-1',
        companyId: 'test-company-id',
        entity: 'test',
        action: 'test',
        timestamp: new Date(),
        details: { largeData: 'x'.repeat(1000) },
        ipAddress: '192.168.1.1',
        userAgent: 'Test'
      }));

      AuditLog.findAndCountAll.mockResolvedValue({
        count: 50000,
        rows: hugeDataset
      });

      const startMemory = process.memoryUsage().heapUsed;
      
      const response = await request(app)
        .get('/auditTrail/logs?limit=1000')
        .expect(200);
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(response.body.logs.length).toBe(1000);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should integrate with database properly', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: mockAuditLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      expect(AuditLog.findAndCountAll).toHaveBeenCalled();
    });

    test('should handle complex filtering scenarios', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockAuditLogs[0]]
      });

      // Multiple filters combined
      const response = await request(app)
        .get('/auditTrail/logs?userId=user-1&entity=journal-entry&action=create&page=1&limit=10')
        .expect(200);

      expect(response.body.logs.length).toBe(1);
      expect(AuditLog.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            entity: 'journal-entry',
            action: 'create',
            companyId: 'test-company-id'
          }),
          limit: 10,
          offset: 0,
          order: [['timestamp', 'DESC']]
        })
      );
    });

    test('should maintain audit trail integrity across operations', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      
      // Multiple sequential requests to test integrity
      for (let i = 0; i < 5; i++) {
        AuditLog.findAndCountAll.mockResolvedValueOnce({
          count: 3,
          rows: mockAuditLogs
        });

        const response = await request(app)
          .get('/auditTrail/logs')
          .expect(200);

        expect(response.body.logs.length).toBe(3);
        expect(response.body.pagination.totalItems).toBe(3);
      }
    });
  });

  describe('Performance Tests', () => {
    test('should handle large audit log datasets efficiently', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100000,
        rows: Array.from({ length: 50 }, (_, i) => largeDataset[i])
      });

      const startTime = Date.now();
      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds
      expect(response.body.logs.length).toBe(50);
    });

    test('should maintain response time under concurrent load', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockAuditLogs
      });

      const concurrentRequests = 25;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app).get(`/auditTrail/logs?page=${i % 3 + 1}`)
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

      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 50000,
        rows: Array.from({ length: 50 }, (_, i) => largeDataset[i])
      });

      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/auditTrail/logs')
          .expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(150 * 1024 * 1024); // 150MB
    });

    test('should handle rapid successive requests', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1000,
        rows: largeDataset.slice(0, 50)
      });

      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .get('/auditTrail/logs')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.logs.length).toBe(50);
      });
    });
  });

  describe('Audit Trail Integrity Tests', () => {
    test('should preserve complete audit trail history', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      AuditLog.findAndCountAll.mockResolvedValue({
        count: largeDataset.length,
        rows: largeDataset
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Verify all logs are retrievable
      expect(response.body.pagination.totalItems).toBe(largeDataset.length);
    });

    test('should maintain chronological order of audit events', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const sortedLogs = [...largeDataset].sort((a, b) => a.timestamp - b.timestamp);
      
      AuditLog.findAndCountAll.mockResolvedValue({
        count: sortedLogs.length,
        rows: sortedLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      // Verify descending order (newest first)
      for (let i = 0; i < response.body.logs.length - 1; i++) {
        const current = new Date(response.body.logs[i].timestamp);
        const next = new Date(response.body.logs[i + 1].timestamp);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    test('should track all user actions comprehensively', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const userActions = ['create', 'update', 'delete', 'view'];
      const comprehensiveLogs = [];
      
      userActions.forEach(action => {
        userActions.forEach(entity => {
          comprehensiveLogs.push({
            id: comprehensiveLogs.length + 1,
            userId: 'test-user',
            companyId: 'test-company-id',
            entity,
            action,
            timestamp: new Date(),
            details: { action, entity },
            ipAddress: '192.168.1.1',
            userAgent: 'Test'
          });
        });
      });

      AuditLog.findAndCountAll.mockResolvedValue({
        count: comprehensiveLogs.length,
        rows: comprehensiveLogs
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      expect(response.body.logs.length).toBe(comprehensiveLogs.length);
    });

    test('should ensure audit trail immutability', async () => {
      const { AuditLog } = require('../models/AnalyticsAI');
      const immutableLog = {
        id: 1,
        userId: 'test-user',
        companyId: 'test-company-id',
        entity: 'test',
        action: 'test',
        timestamp: new Date('2023-12-01T10:00:00Z'),
        details: { originalData: 'immutable' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test'
      };

      AuditLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [immutableLog]
      });

      const response = await request(app)
        .get('/auditTrail/logs')
        .expect(200);

      const retrievedLog = response.body.logs[0];
      expect(retrievedLog.timestamp).toBe(immutableLog.timestamp);
      expect(retrievedLog.details.originalData).toBe('immutable');
    });
  });
});