const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Budget = require('../src/models/Budget');
const Department = require('../src/models/Department');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let userId;
let departmentId;

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

  // Create test department
  const department = new Department({
    name: 'Finance Department',
    code: 'FIN',
    manager: userId,
    budget: 1000000
  });
  await department.save();
  departmentId = department._id;

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
  await Budget.deleteMany({});
});

describe('Budget Management Tests', () => {
  describe('POST /api/budgets', () => {
    test('should create a new budget successfully', async () => {
      const budgetData = {
        name: 'Annual Budget 2024',
        period: '2024',
        type: 'annual',
        totalAmount: 500000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Personnel Costs',
            code: 'PER',
            allocatedAmount: 300000,
            description: 'Employee salaries and benefits'
          },
          {
            name: 'Operations',
            code: 'OPS',
            allocatedAmount: 150000,
            description: 'Operational expenses'
          },
          {
            name: 'Marketing',
            code: 'MKT',
            allocatedAmount: 50000,
            description: 'Marketing and advertising'
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(budgetData.name);
      expect(response.body.data.period).toBe(budgetData.period);
      expect(response.body.data.totalAmount).toBe(budgetData.totalAmount);
      expect(response.body.data.categories).toHaveLength(3);
      expect(response.body.data.categories[0].name).toBe('Personnel Costs');
      expect(response.body.data.categories[0].allocatedAmount).toBe(300000);
    });

    test('should validate required fields', async () => {
      const invalidBudget = {
        name: '', // Empty name
        totalAmount: -1000, // Negative amount
        categories: [] // Empty categories
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBudget)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('Budget name is required');
      expect(response.body.errors).toContain('Total amount must be positive');
    });

    test('should validate budget categories allocation', async () => {
      const budgetData = {
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Category 1',
            allocatedAmount: 60000
          },
          {
            name: 'Category 2',
            allocatedAmount: 50000 // Total would be 110000 > 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Category allocations exceed total budget');
    });

    test('should require authentication', async () => {
      const budgetData = {
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Category 1',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(budgetData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/budgets', () => {
    beforeEach(async () => {
      // Create test budgets
      const budgets = [
        {
          name: 'Annual Budget 2024',
          period: '2024',
          type: 'annual',
          totalAmount: 500000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Personnel Costs',
              allocatedAmount: 300000
            }
          ],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active'
        },
        {
          name: 'Quarterly Budget Q1 2024',
          period: '2024-Q1',
          type: 'quarterly',
          totalAmount: 125000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Operations',
              allocatedAmount: 125000
            }
          ],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'draft'
        }
      ];

      await Budget.insertMany(budgets);
    });

    test('should retrieve all budgets', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[1].name).toBeDefined();
    });

    test('should filter budgets by department', async () => {
      const response = await request(app)
        .get(`/api/budgets?departmentId=${departmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].departmentId).toBe(departmentId.toString());
    });

    test('should filter budgets by status', async () => {
      const response = await request(app)
        .get('/api/budgets?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    test('should filter budgets by period', async () => {
      const response = await request(app)
        .get('/api/budgets?period=2024-Q1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].period).toBe('2024-Q1');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/budgets?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/budgets/:id', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Test Category',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should retrieve budget by id', async () => {
      const response = await request(app)
        .get(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(budgetId.toString());
      expect(response.body.data.name).toBe('Test Budget');
    });

    test('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Budget not found');
    });

    test('should validate object id format', async () => {
      const response = await request(app)
        .get('/api/budgets/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid budget ID format');
    });
  });

  describe('PUT /api/budgets/:id', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Test Category',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should update budget successfully', async () => {
      const updateData = {
        name: 'Updated Budget',
        totalAmount: 150000,
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Budget');
      expect(response.body.data.totalAmount).toBe(150000);
      expect(response.body.data.status).toBe('active');
    });

    test('should update budget categories', async () => {
      const updateData = {
        categories: [
          {
            name: 'Updated Category',
            allocatedAmount: 150000
          }
        ]
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].name).toBe('Updated Category');
      expect(response.body.data.categories[0].allocatedAmount).toBe(150000);
    });

    test('should prevent updating approved budget without permission', async () => {
      // First approve the budget
      await Budget.findByIdAndUpdate(budgetId, { status: 'approved' });

      const updateData = {
        name: 'Unauthorized Update',
        totalAmount: 200000
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot modify approved budget');
    });

    test('should validate update data', async () => {
      const updateData = {
        totalAmount: -50000 // Invalid negative amount
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Total amount must be positive');
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Test Category',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should delete budget successfully', async () => {
      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Budget deleted successfully');

      // Verify budget is deleted
      const deletedBudget = await Budget.findById(budgetId);
      expect(deletedBudget).toBeNull();
    });

    test('should prevent deleting approved budget', async () => {
      // First approve the budget
      await Budget.findByIdAndUpdate(budgetId, { status: 'approved' });

      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete approved budget');
    });

    test('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Budget not found');
    });
  });

  describe('POST /api/budgets/:id/approve', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Test Category',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should approve budget successfully', async () => {
      const response = await request(app)
        .post(`/api/budgets/${budgetId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.approvedBy).toBe(userId.toString());
      expect(response.body.data.approvedAt).toBeDefined();
    });

    test('should prevent approving already approved budget', async () => {
      // First approve the budget
      await Budget.findByIdAndUpdate(budgetId, { status: 'approved' });

      const response = await request(app)
        .post(`/api/budgets/${budgetId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Budget is already approved');
    });

    test('should require admin role for approval', async () => {
      // Create non-admin user
      const regularUser = new User({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'password123',
        role: 'user'
      });
      await regularUser.save();

      const regularToken = jwt.sign(
        { userId: regularUser._id, email: regularUser.email, role: regularUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/budgets/${budgetId}/approve`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions to approve budget');
    });
  });

  describe('GET /api/budgets/:id/utilization', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Personnel',
            allocatedAmount: 60000,
            code: 'PER'
          },
          {
            name: 'Operations',
            allocatedAmount: 40000,
            code: 'OPS'
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should get budget utilization report', async () => {
      // Mock some actual spending
      await Budget.findByIdAndUpdate(budgetId, {
        'categories.0.actualAmount': 45000, // 75% utilization
        'categories.1.actualAmount': 20000  // 50% utilization
      });

      const response = await request(app)
        .get(`/api/budgets/${budgetId}/utilization`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAllocated).toBe(100000);
      expect(response.body.data.totalSpent).toBe(65000);
      expect(response.body.data.overallUtilization).toBe(65);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.categories[0].utilization).toBe(75);
      expect(response.body.data.categories[1].utilization).toBe(50);
    });

    test('should calculate remaining budget correctly', async () => {
      await Budget.findByIdAndUpdate(budgetId, {
        'categories.0.actualAmount': 60000, // Full utilization
        'categories.1.actualAmount': 30000  // Under budget
      });

      const response = await request(app)
        .get(`/api/budgets/${budgetId}/utilization`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSpent).toBe(90000);
      expect(response.body.data.remainingBudget).toBe(10000);
      expect(response.body.data.categories[1].remaining).toBe(10000);
    });

    test('should detect over-budget categories', async () => {
      await Budget.findByIdAndUpdate(budgetId, {
        'categories.0.actualAmount': 70000, // Over budget by 10000
        'categories.1.actualAmount': 30000
      });

      const response = await request(app)
        .get(`/api/budgets/${budgetId}/utilization`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overBudgetCategories).toHaveLength(1);
      expect(response.body.data.overBudgetCategories[0].name).toBe('Personnel');
      expect(response.body.data.overBudgetCategories[0].overspend).toBe(10000);
    });
  });

  describe('GET /api/budgets/analytics/summary', () => {
    beforeEach(async () => {
      // Create multiple budgets for analytics
      const budgets = [
        {
          name: '2023 Budget',
          period: '2023',
          type: 'annual',
          totalAmount: 500000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Personnel',
              allocatedAmount: 300000,
              actualAmount: 280000
            },
            {
              name: 'Operations',
              allocatedAmount: 200000,
              actualAmount: 180000
            }
          ],
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: 'completed'
        },
        {
          name: '2024 Budget',
          period: '2024',
          type: 'annual',
          totalAmount: 550000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Personnel',
              allocatedAmount: 330000,
              actualAmount: 200000 // Currently at 60%
            },
            {
              name: 'Operations',
              allocatedAmount: 220000,
              actualAmount: 100000 // Currently at 45%
            }
          ],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active'
        }
      ];

      await Budget.insertMany(budgets);
    });

    test('should get budget analytics summary', async () => {
      const response = await request(app)
        .get('/api/budgets/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBudgets).toBe(2);
      expect(response.body.data.totalAllocated).toBe(1050000); // 500000 + 550000
      expect(response.body.data.averageUtilization).toBeDefined();
      expect(response.body.data.utilizationBreakdown).toBeDefined();
      expect(response.body.data.departmentBreakdown).toBeDefined();
    });

    test('should get budget trends over time', async () => {
      const response = await request(app)
        .get('/api/budgets/analytics/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBeDefined();
      expect(response.body.data.budgetGrowth).toBeDefined();
      expect(response.body.data.utilizationTrends).toBeDefined();
    });

    test('should get department budget comparison', async () => {
      const response = await request(app)
        .get('/api/budgets/analytics/department-comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.departments).toBeDefined();
      expect(response.body.data.comparisons).toBeDefined();
    });
  });

  describe('POST /api/budgets/:id/revisions', () => {
    let budgetId;

    beforeEach(async () => {
      const budget = new Budget({
        name: 'Original Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Category 1',
            allocatedAmount: 60000
          },
          {
            name: 'Category 2',
            allocatedAmount: 40000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      });
      const savedBudget = await budget.save();
      budgetId = savedBudget._id;
    });

    test('should create budget revision', async () => {
      const revisionData = {
        reason: 'Increased operational costs',
        changes: [
          {
            categoryCode: 'OPS',
            oldAmount: 40000,
            newAmount: 60000
          }
        ],
        newTotalAmount: 120000
      };

      const response = await request(app)
        .post(`/api/budgets/${budgetId}/revisions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(revisionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revisionNumber).toBe(1);
      expect(response.body.data.reason).toBe(revisionData.reason);
      expect(response.body.data.changes).toHaveLength(1);
    });

    test('should track revision history', async () => {
      const revisionData = {
        reason: 'First revision',
        changes: [],
        newTotalAmount: 110000
      };

      await request(app)
        .post(`/api/budgets/${budgetId}/revisions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(revisionData);

      // Create second revision
      const revisionData2 = {
        reason: 'Second revision',
        changes: [],
        newTotalAmount: 115000
      };

      await request(app)
        .post(`/api/budgets/${budgetId}/revisions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(revisionData2);

      // Get revision history
      const response = await request(app)
        .get(`/api/budgets/${budgetId}/revisions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].revisionNumber).toBe(2);
      expect(response.body.data[1].revisionNumber).toBe(1);
    });

    test('should validate revision changes', async () => {
      const invalidRevision = {
        reason: 'Test revision',
        changes: [
          {
            categoryCode: 'INVALID',
            oldAmount: 50000,
            newAmount: 60000
          }
        ],
        newTotalAmount: 110000
      };

      const response = await request(app)
        .post(`/api/budgets/${budgetId}/revisions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRevision)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid category code in changes');
    });
  });

  describe('GET /api/budgets/forecasts', () => {
    beforeEach(async () => {
      // Create historical budgets for forecasting
      const historicalBudgets = [];
      for (let year = 2020; year <= 2023; year++) {
        historicalBudgets.push({
          name: `Budget ${year}`,
          period: year.toString(),
          type: 'annual',
          totalAmount: 100000 + (year - 2020) * 50000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Personnel',
              allocatedAmount: 60000 + (year - 2020) * 30000
            },
            {
              name: 'Operations',
              allocatedAmount: 40000 + (year - 2020) * 20000
            }
          ],
          startDate: new Date(`${year}-01-01`),
          endDate: new Date(`${year}-12-31`),
          status: 'completed'
        });
      }
      await Budget.insertMany(historicalBudgets);
    });

    test('should generate budget forecast', async () => {
      const forecastRequest = {
        periods: 2, // Forecast for 2024 and 2025
        method: 'linear_regression',
        includeConfidence: true
      };

      const response = await request(app)
        .post('/api/budgets/forecasts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.forecasts).toHaveLength(2);
      expect(response.body.data.forecasts[0].period).toBe('2024');
      expect(response.body.data.forecasts[1].period).toBe('2025');
      expect(response.body.data.method).toBe('linear_regression');
      expect(response.body.data.confidence).toBeDefined();
    });

    test('should forecast by category', async () => {
      const forecastRequest = {
        periods: 1,
        method: 'moving_average',
        breakdown: 'category'
      };

      const response = await request(app)
        .post('/api/budgets/forecasts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categoryForecasts).toBeDefined();
      expect(response.body.data.categoryForecasts.Personnel).toBeDefined();
      expect(response.body.data.categoryForecasts.Operations).toBeDefined();
    });

    test('should validate forecast parameters', async () => {
      const invalidRequest = {
        periods: -1, // Invalid negative periods
        method: 'invalid_method'
      };

      const response = await request(app)
        .post('/api/budgets/forecasts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Periods must be a positive number');
      expect(response.body.errors).toContain('Invalid forecast method');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      // Mock database connection error
      jest.spyOn(Budget, 'find').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database operation failed');
    });

    test('should handle validation errors gracefully', async () => {
      const invalidBudget = {
        name: 'Test',
        period: 'invalid-period',
        totalAmount: 'not-a-number',
        departmentId: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBudget)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle authorization errors', async () => {
      const invalidToken = 'invalid-token';
      
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large budget queries efficiently', async () => {
      // Create many budgets
      const budgets = [];
      for (let i = 0; i < 1000; i++) {
        budgets.push({
          name: `Budget ${i}`,
          period: `2024-${i}`,
          type: 'annual',
          totalAmount: 100000,
          departmentId: departmentId,
          categories: [
            {
              name: 'Category',
              allocatedAmount: 100000
            }
          ],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active'
        });
      }
      await Budget.insertMany(budgets);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/budgets?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should paginate large result sets', async () => {
      const response = await request(app)
        .get('/api/budgets?page=5&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(5);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.pages).toBeGreaterThan(5);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with department management', async () => {
      const budgetData = {
        name: 'Department Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 200000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Operations',
            allocatedAmount: 200000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify department budget is updated
      const department = await Department.findById(departmentId);
      expect(department.currentBudget).toBe(200000);
    });

    test('should integrate with user management for approvals', async () => {
      const budget = new Budget({
        name: 'Test Budget',
        period: '2024',
        type: 'annual',
        totalAmount: 100000,
        departmentId: departmentId,
        categories: [
          {
            name: 'Category',
            allocatedAmount: 100000
          }
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft'
      });
      await budget.save();

      // Approve budget
      const approveResponse = await request(app)
        .post(`/api/budgets/${budget._id}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(approveResponse.body.data.approvedBy).toBe(userId.toString());
      
      // Verify user has approval activity
      const user = await User.findById(userId);
      expect(user.activities).toContain(expect.stringContaining('approved budget'));
    });
  });
});