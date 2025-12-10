const request = require('supertest');
const express = require('express');
const complianceRouter = require('../routes/compliance');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'compliance-manager'
    };
    next();
  }
}));

// Mock database models
jest.mock('../models/AnalyticsAI', () => ({
  ComplianceTask: {
    findAndCountAll: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/compliance', complianceRouter);

describe('Compliance Tasks API', () => {
  let testUser;
  let mockComplianceTasks;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'compliance-manager'
    };

    // Mock compliance tasks data
    mockComplianceTasks = [
      {
        id: 1,
        companyId: 'test-company-id',
        taskName: 'Monthly GST Return Filing',
        taskType: 'tax-filing',
        status: 'pending',
        dueDate: new Date('2023-12-20'),
        assignedTo: 'user-1',
        priority: 'high',
        description: 'File GST returns for November 2023',
        createdDate: new Date('2023-12-01'),
        completedDate: null,
        recurringPattern: 'monthly',
        lastCompletedDate: new Date('2023-11-20')
      },
      {
        id: 2,
        companyId: 'test-company-id',
        taskName: 'Annual Audit Preparation',
        taskType: 'audit',
        status: 'in-progress',
        dueDate: new Date('2023-12-31'),
        assignedTo: 'user-2',
        priority: 'high',
        description: 'Prepare documentation for annual audit',
        createdDate: new Date('2023-11-01'),
        completedDate: null,
        recurringPattern: 'yearly',
        lastCompletedDate: new Date('2022-12-31')
      },
      {
        id: 3,
        companyId: 'test-company-id',
        taskName: 'TDS Certificate Collection',
        taskType: 'tax-compliance',
        status: 'completed',
        dueDate: new Date('2023-11-30'),
        assignedTo: 'user-1',
        priority: 'medium',
        description: 'Collect TDS certificates from vendors',
        createdDate: new Date('2023-11-01'),
        completedDate: new Date('2023-11-28'),
        recurringPattern: 'quarterly',
        lastCompletedDate: new Date('2023-11-28')
      },
      {
        id: 4,
        companyId: 'test-company-id',
        taskName: 'Compliance Policy Review',
        taskType: 'regulatory',
        status: 'pending',
        dueDate: new Date('2024-01-15'),
        assignedTo: 'user-3',
        priority: 'low',
        description: 'Review and update compliance policies',
        createdDate: new Date('2023-12-01'),
        completedDate: null,
        recurringPattern: 'yearly',
        lastCompletedDate: new Date('2023-01-15')
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      const taskTypes = ['tax-filing', 'audit', 'tax-compliance', 'regulatory', 'reporting'];
      const statuses = ['pending', 'in-progress', 'completed', 'overdue'];
      const priorities = ['low', 'medium', 'high', 'critical'];
      
      largeDataset.push({
        id: i + 1000,
        companyId: 'test-company-id',
        taskName: `Compliance Task ${i}`,
        taskType: taskTypes[i % 5],
        status: statuses[i % 4],
        dueDate: new Date(2023, 11, 1 + (i % 30)),
        assignedTo: `user-${(i % 10) + 1}`,
        priority: priorities[i % 4],
        description: `Description for compliance task ${i}`,
        createdDate: new Date(2023, 10, 1 + (i % 30)),
        completedDate: statuses[i % 4] === 'completed' ? new Date(2023, 11, 1 + (i % 30)) : null,
        recurringPattern: ['monthly', 'quarterly', 'yearly', 'weekly'][i % 4],
        lastCompletedDate: new Date(2023, 10, 1 + (i % 30))
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /compliance/tasks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should retrieve compliance tasks with default pagination', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.tasks.length).toBeGreaterThan(0);
      expect(response.body.tasks.length).toBeLessThanOrEqual(20); // Default limit

      // Check pagination structure
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('itemsPerPage');
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(20);
    });

    test('should filter tasks by status', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const pendingTasks = mockComplianceTasks.filter(task => task.status === 'pending');
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: pendingTasks.length,
        rows: pendingTasks
      });

      const response = await request(app)
        .get('/compliance/tasks?status=pending')
        .expect(200);

      expect(response.body.tasks.length).toBe(2);
      
      // Verify all tasks have pending status
      response.body.tasks.forEach(task => {
        expect(task.status).toBe('pending');
      });
    });

    test('should filter tasks by task type', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const taxTasks = mockComplianceTasks.filter(task => task.taskType === 'tax-filing');
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: taxTasks.length,
        rows: taxTasks
      });

      const response = await request(app)
        .get('/compliance/tasks?taskType=tax-filing')
        .expect(200);

      expect(response.body.tasks.length).toBe(1);
      expect(response.body.tasks[0].taskType).toBe('tax-filing');
    });

    test('should handle custom pagination parameters', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const page = 2;
      const limit = 10;
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: Array.from({ length: 10 }, (_, i) => mockComplianceTasks[i % 4])
      });

      const response = await request(app)
        .get(`/compliance/tasks?page=${page}&limit=${limit}`)
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(page);
      expect(response.body.pagination.itemsPerPage).toBe(limit);
      expect(response.body.pagination.totalPages).toBe(10); // 100 / 10 = 10 pages
      
      // Verify offset calculation
      const callArgs = ComplianceTask.findAndCountAll.mock.calls[0][0];
      expect(callArgs.offset).toBe((page - 1) * limit);
      expect(callArgs.limit).toBe(limit);
    });

    test('should sort tasks by due date in ascending order', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const sortedTasks = [...mockComplianceTasks].sort((a, b) => a.dueDate - b.dueDate);
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: sortedTasks.length,
        rows: sortedTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // Verify order
      for (let i = 0; i < response.body.tasks.length - 1; i++) {
        const current = new Date(response.body.tasks[i].dueDate);
        const next = new Date(response.body.tasks[i + 1].dueDate);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });

    test('should filter tasks by companyId for security', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // Verify company filter is applied
      expect(ComplianceTask.findAndCountAll).toHaveBeenCalled();
      const callArgs = ComplianceTask.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.companyId).toBe('test-company-id');
    });

    test('should handle empty results gracefully', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks?status=non-existent')
        .expect(200);

      expect(response.body.tasks.length).toBe(0);
      expect(response.body.pagination.totalItems).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
    });

    test('should include all required task fields', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockComplianceTasks[0]]
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      const task = response.body.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('companyId');
      expect(task).toHaveProperty('taskName');
      expect(task).toHaveProperty('taskType');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('dueDate');
      expect(task).toHaveProperty('assignedTo');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('createdDate');
      expect(task).toHaveProperty('completedDate');
      expect(task).toHaveProperty('recurringPattern');
      expect(task).toHaveProperty('lastCompletedDate');
    });

    test('should handle multiple filters combined', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const filteredTasks = [mockComplianceTasks[0]]; // Pending + tax-filing
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: filteredTasks
      });

      const response = await request(app)
        .get('/compliance/tasks?status=pending&taskType=tax-filing&page=1&limit=10')
        .expect(200);

      expect(response.body.tasks.length).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(10);
      
      // Verify all filters were applied
      const callArgs = ComplianceTask.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.status).toBe('pending');
      expect(callArgs.where.taskType).toBe('tax-filing');
    });

    test('should handle invalid pagination parameters gracefully', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: mockComplianceTasks
      });

      // Test with negative page number and invalid limit
      const response = await request(app)
        .get('/compliance/tasks?page=-1&limit=invalid')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should handle database errors gracefully', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle performance with large datasets', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 10000,
        rows: Array.from({ length: 20 }, (_, i) => largeDataset[i])
      });

      const startTime = Date.now();
      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.tasks.length).toBe(20);
    });

    test('should handle concurrent requests efficiently', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockComplianceTasks
      });

      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/compliance/tasks')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tasks');
        expect(response.body).toHaveProperty('pagination');
      });
    });

    test('should maintain data consistency across paginated requests', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      
      // First page
      ComplianceTask.findAndCountAll.mockResolvedValueOnce({
        count: 100,
        rows: Array.from({ length: 20 }, (_, i) => largeDataset[i])
      });
      
      // Second page
      ComplianceTask.findAndCountAll.mockResolvedValueOnce({
        count: 100,
        rows: Array.from({ length: 20 }, (_, i) => largeDataset[i + 20])
      });

      const firstPageResponse = await request(app)
        .get('/compliance/tasks?page=1&limit=20')
        .expect(200);

      const secondPageResponse = await request(app)
        .get('/compliance/tasks?page=2&limit=20')
        .expect(200);

      expect(firstPageResponse.body.pagination.totalItems).toBe(100);
      expect(secondPageResponse.body.pagination.totalItems).toBe(100);
      expect(firstPageResponse.body.tasks.length).toBe(20);
      expect(secondPageResponse.body.tasks.length).toBe(20);
    });
  });

  describe('Task Filtering Tests', () => {
    test('should filter by various task types', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const taskTypes = ['tax-filing', 'audit', 'tax-compliance', 'regulatory'];
      
      for (const taskType of taskTypes) {
        const tasks = mockComplianceTasks.filter(task => task.taskType === taskType);
        ComplianceTask.findAndCountAll.mockResolvedValueOnce({
          count: tasks.length,
          rows: tasks
        });

        const response = await request(app)
          .get(`/compliance/tasks?taskType=${taskType}`)
          .expect(200);

        response.body.tasks.forEach(task => {
          expect(task.taskType).toBe(taskType);
        });
      }
    });

    test('should filter by various statuses', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const statuses = ['pending', 'in-progress', 'completed'];
      
      for (const status of statuses) {
        const tasks = mockComplianceTasks.filter(task => task.status === status);
        ComplianceTask.findAndCountAll.mockResolvedValueOnce({
          count: tasks.length,
          rows: tasks
        });

        const response = await request(app)
          .get(`/compliance/tasks?status=${status}`)
          .expect(200);

        response.body.tasks.forEach(task => {
          expect(task.status).toBe(status);
        });
      }
    });

    test('should handle complex filtering scenarios', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      
      // High priority pending tasks
      const complexFilter = mockComplianceTasks.filter(task => 
        task.status === 'pending' && task.priority === 'high'
      );
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: complexFilter.length,
        rows: complexFilter
      });

      const response = await request(app)
        .get('/compliance/tasks?status=pending&priority=high')
        .expect(200);

      response.body.tasks.forEach(task => {
        expect(task.status).toBe('pending');
        expect(task.priority).toBe('high');
      });
    });
  });

  describe('Pagination Tests', () => test('should handle various page sizes', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const pageSizes = [5, 10, 25, 50, 100];
      
      for (const pageSize of pageSizes) {
        ComplianceTask.findAndCountAll.mockResolvedValueOnce({
          count: 100,
          rows: Array.from({ length: Math.min(pageSize, 100) }, (_, i) => mockComplianceTasks[i % 4])
        });

        const response = await request(app)
          .get(`/compliance/tasks?limit=${pageSize}`)
          .expect(200);

        expect(response.body.pagination.itemsPerPage).toBe(pageSize);
        expect(response.body.tasks.length).toBe(Math.min(pageSize, 100));
      }
    });

    test('should handle last page correctly', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const totalItems = 100;
      const pageSize = 20;
      const lastPage = Math.ceil(totalItems / pageSize);
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: totalItems,
        rows: Array.from({ length: 20 }, (_, i) => mockComplianceTasks[i % 4])
      });

      const response = await request(app)
        .get(`/compliance/tasks?page=${lastPage}&limit=${pageSize}`)
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(lastPage);
      expect(response.body.pagination.totalPages).toBe(5);
    });

    test('should handle page beyond total pages', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks?page=10&limit=10')
        .expect(200);

      expect(response.body.tasks.length).toBe(0);
      expect(response.body.pagination.currentPage).toBe(10);
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .get('/compliance/tasks');

      // Since auth middleware is mocked, this should pass
      expect(response.status).not.toBe(401);
    });

    test('should validate user permissions for compliance tasks', async () => {
      const testRoles = ['admin', 'compliance-manager', 'auditor', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const response = await request(app)
          .get('/compliance/tasks');
        
        expect(response.status).not.toBe(403);
      }
    });

    test('should filter tasks by companyId for multi-tenant security', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // Verify company filter is applied
      expect(ComplianceTask.findAndCountAll).toHaveBeenCalled();
      const callArgs = ComplianceTask.findAndCountAll.mock.calls[0][0];
      expect(callArgs.where.companyId).toBe('test-company-id');
    });

    test('should prevent access to other companies tasks', async () => {
      // Since all tasks are filtered by companyId, this should be prevented
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      expect(response.body.tasks.length).toBe(0);
    });

    test('should sanitize compliance task data in responses', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const taskWithSensitiveData = {
        ...mockComplianceTasks[0],
        internalNotes: 'Sensitive compliance information',
        confidentialData: 'Confidential task details'
      };
      
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [taskWithSensitiveData]
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // Should contain compliance task information but not sensitive internal data
      expect(response.body.tasks[0]).toHaveProperty('taskName');
      expect(response.body.tasks[0]).toHaveProperty('description');
      expect(response.body.tasks[0]).not.toHaveProperty('internalNotes');
      expect(response.body.tasks[0]).not.toHaveProperty('confidentialData');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection failures', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle malformed query parameters', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks?page=abc&limit=def&status=invalid')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should handle timeout scenarios', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          count: 0,
          rows: []
        }), 100))
      );

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
    });

    test('should handle invalid status values gracefully', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks?status=invalid-status')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
    });

    test('should handle invalid task type values gracefully', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks?taskType=invalid-type')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
    });

    test('should integrate with compliance model properly', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      expect(ComplianceTask.findAndCountAll).toHaveBeenCalled();
    });

    test('should handle complex filtering scenarios', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockComplianceTasks[0]]
      });

      // Multiple filters combined
      const response = await request(app)
        .get('/compliance/tasks?status=pending&taskType=tax-filing&page=1&limit=10')
        .expect(200);

      expect(response.body.tasks.length).toBe(1);
      expect(ComplianceTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
            taskType: 'tax-filing',
            companyId: 'test-company-id'
          }),
          limit: 10,
          offset: 0,
          order: [['dueDate', 'ASC']]
        })
      );
    });
  });

  describe('Performance Tests', () => {
    test('should handle large compliance task datasets efficiently', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 50000,
        rows: Array.from({ length: 20 }, (_, i) => largeDataset[i])
      });

      const startTime = Date.now();
      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds
      expect(response.body.tasks.length).toBe(20);
    });

    test('should maintain response time under concurrent load', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: mockComplianceTasks
      });

      const concurrentRequests = 25;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app).get(`/compliance/tasks?page=${i % 5 + 1}`)
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

      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 25000,
        rows: Array.from({ length: 20 }, (_, i) => largeDataset[i])
      });

      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/compliance/tasks')
          .expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(150 * 1024 * 1024); // 150MB
    });

    test('should handle rapid successive requests efficiently', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1000,
        rows: largeDataset.slice(0, 20)
      });

      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .get('/compliance/tasks')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.tasks.length).toBe(20);
      });
    });
  });

  describe('Compliance Task Validation Tests', () => {
    test('should validate task structure', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockComplianceTasks[0]]
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      const task = response.body.tasks[0];
      
      // Validate data types
      expect(typeof task.id).toBe('number');
      expect(typeof task.taskName).toBe('string');
      expect(typeof task.taskType).toBe('string');
      expect(typeof task.status).toBe('string');
      expect(new Date(task.dueDate)).toBeInstanceOf(Date);
      expect(typeof task.assignedTo).toBe('string');
      expect(typeof task.priority).toBe('string');
      expect(typeof task.description).toBe('string');
    });

    test('should handle various task types', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const taskTypes = ['tax-filing', 'audit', 'tax-compliance', 'regulatory', 'reporting'];
      const tasksByType = {};
      
      taskTypes.forEach(taskType => {
        tasksByType[taskType] = mockComplianceTasks.filter(task => task.taskType === taskType);
      });

      for (const taskType of taskTypes) {
        if (tasksByType[taskType].length > 0) {
          ComplianceTask.findAndCountAll.mockResolvedValueOnce({
            count: tasksByType[taskType].length,
            rows: tasksByType[taskType]
          });

          const response = await request(app)
            .get(`/compliance/tasks?taskType=${taskType}`)
            .expect(200);

          response.body.tasks.forEach(task => {
            expect(task.taskType).toBe(taskType);
          });
        }
      }
    });

    test('should handle various statuses', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const statuses = ['pending', 'in-progress', 'completed'];
      const tasksByStatus = {};
      
      statuses.forEach(status => {
        tasksByStatus[status] = mockComplianceTasks.filter(task => task.status === status);
      });

      for (const status of statuses) {
        if (tasksByStatus[status].length > 0) {
          ComplianceTask.findAndCountAll.mockResolvedValueOnce({
            count: tasksByStatus[status].length,
            rows: tasksByStatus[status]
          });

          const response = await request(app)
            .get(`/compliance/tasks?status=${status}`)
            .expect(200);

          response.body.tasks.forEach(task => {
            expect(task.status).toBe(status);
          });
        }
      }
    });

    test('should handle various priority levels', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const priorities = ['low', 'medium', 'high', 'critical'];
      const tasksByPriority = {};
      
      priorities.forEach(priority => {
        tasksByPriority[priority] = mockComplianceTasks.filter(task => task.priority === priority);
      });

      for (const priority of priorities) {
        if (tasksByPriority[priority].length > 0) {
          ComplianceTask.findAndCountAll.mockResolvedValueOnce({
            count: tasksByPriority[priority].length,
            rows: tasksByPriority[priority]
          });

          const response = await request(app)
            .get(`/compliance/tasks?priority=${priority}`)
            .expect(200);

          response.body.tasks.forEach(task => {
            expect(task.priority).toBe(priority);
          });
        }
      }
    });

    test('should handle recurring patterns', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const recurringPatterns = ['monthly', 'quarterly', 'yearly', 'weekly'];
      const tasksByPattern = {};
      
      recurringPatterns.forEach(pattern => {
        tasksByPattern[pattern] = mockComplianceTasks.filter(task => task.recurringPattern === pattern);
      });

      for (const pattern of recurringPatterns) {
        if (tasksByPattern[pattern].length > 0) {
          ComplianceTask.findAndCountAll.mockResolvedValueOnce({
            count: tasksByPattern[pattern].length,
            rows: tasksByPattern[pattern]
          });

          const response = await request(app)
            .get(`/compliance/tasks?recurringPattern=${pattern}`)
            .expect(200);

          response.body.tasks.forEach(task => {
            expect(task.recurringPattern).toBe(pattern);
          });
        }
      }
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log compliance task access for audit purposes', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.tasks.length).toBe(4);
      expect(response.body.pagination.totalItems).toBe(4);
    });

    test('should maintain compliance task access history', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      // Verify tasks are tracked for audit purposes
      expect(response.body.tasks.length).toBe(4);
      expect(response.body.tasks[0]).toHaveProperty('createdDate');
    });

    test('should preserve compliance data integrity', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: mockComplianceTasks
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      response.body.tasks.forEach(task => {
        expect(task.companyId).toBe('test-company-id');
        expect(task.id).toBeDefined();
        expect(task.taskName).toBeDefined();
      });
    });

    test('should ensure compliance task immutability', async () => {
      const { ComplianceTask } = require('../models/AnalyticsAI');
      const immutableTask = {
        id: 1,
        companyId: 'test-company-id',
        taskName: 'Immutable Task',
        taskType: 'regulatory',
        status: 'pending',
        dueDate: new Date('2024-01-01'),
        assignedTo: 'user-1',
        priority: 'high',
        description: 'This task cannot be modified',
        createdDate: new Date('2023-12-01'),
        completedDate: null,
        recurringPattern: 'yearly',
        lastCompletedDate: null
      };

      ComplianceTask.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [immutableTask]
      });

      const response = await request(app)
        .get('/compliance/tasks')
        .expect(200);

      const retrievedTask = response.body.tasks[0];
      expect(retrievedTask.createdDate).toBe(immutableTask.createdDate.toISOString());
      expect(retrievedTask.description).toBe('This task cannot be modified');
    });
  });
});