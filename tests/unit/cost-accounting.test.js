const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CostAccounting = require('../models/CostAccounting');
const CostCenter = require('../models/CostCenter');
const CostAllocation = require('../models/CostAllocation');
const app = require('../app');

describe('Cost Accounting Engine', () => {
  let mongoServer;
  let authToken;
  let testData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup authentication
    authToken = 'Bearer test-token-cost-accounting';
    jest.spyOn(require('../middleware/auth'), 'authenticate')
      .mockImplementation((req, res, next) => {
        req.user = { id: 'test-user', role: 'admin' };
        next();
      });

    // Generate comprehensive test data
    testData = {
      costCenters: [
        {
          name: 'Manufacturing Unit A',
          code: 'MUA-001',
          department: 'Production',
          manager: 'John Smith',
          budget: 500000,
          parentCenter: null,
          isActive: true
        },
        {
          name: 'Research & Development',
          code: 'RD-001',
          department: 'Innovation',
          manager: 'Dr. Sarah Johnson',
          budget: 300000,
          parentCenter: null,
          isActive: true
        },
        {
          name: 'Quality Assurance',
          code: 'QA-001',
          department: 'Production',
          manager: 'Mike Wilson',
          budget: 150000,
          parentCenter: 'MUA-001',
          isActive: true
        }
      ],
      costAllocations: [
        {
          allocationMethod: 'direct',
          sourceCenter: 'MUA-001',
          targetCenter: 'QA-001',
          amount: 50000,
          period: '2025-01',
          description: 'Shared quality costs',
          isRecurring: true,
          recurrencePattern: 'monthly'
        },
        {
          allocationMethod: 'percentage',
          sourceCenter: 'RD-001',
          targetCenters: [
            { center: 'MUA-001', percentage: 60 },
            { center: 'QA-001', percentage: 40 }
          ],
          totalAmount: 120000,
          period: '2025-01',
          description: 'R&D overhead allocation',
          isRecurring: true,
          recurrencePattern: 'monthly'
        }
      ],
      costDrivers: [
        {
          name: 'Machine Hours',
          unit: 'hours',
          description: 'Total machine operating hours',
          category: 'Production',
          isActive: true
        },
        {
          name: 'Labor Hours',
          unit: 'hours',
          description: 'Direct labor hours worked',
          category: 'Labor',
          isActive: true
        },
        {
          name: 'Material Cost',
          unit: 'currency',
          description: 'Raw material costs',
          category: 'Materials',
          isActive: true
        }
      ],
      products: [
        {
          name: 'Widget A',
          code: 'WGT-A',
          category: 'Consumer Goods',
          standardCost: 45.50,
          actualCost: 47.25,
          costDrivers: [
            { driver: 'Machine Hours', quantity: 2.5 },
            { driver: 'Labor Hours', quantity: 1.8 },
            { driver: 'Material Cost', quantity: 25.00 }
          ]
        },
        {
          name: 'Gadget B',
          code: 'GDT-B',
          category: 'Industrial',
          standardCost: 125.75,
          actualCost: 128.90,
          costDrivers: [
            { driver: 'Machine Hours', quantity: 5.2 },
            { driver: 'Labor Hours', quantity: 3.1 },
            { driver: 'Material Cost', quantity: 85.50 }
          ]
        }
      ]
    };

    // Seed test data
    await CostCenter.insertMany(testData.costCenters);
    await CostAllocation.insertMany(testData.costAllocations);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean collections before each test
    await CostAccounting.deleteMany({});
  });

  describe('Cost Center Management', () => {
    describe('POST /api/cost-accounting/cost-centers', () => {
      it('should create a new cost center with valid data', async () => {
        const costCenterData = {
          name: 'Sales Division',
          code: 'SLD-001',
          department: 'Sales',
          manager: 'Alice Brown',
          budget: 200000,
          parentCenter: null,
          isActive: true
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-centers')
          .set('Authorization', authToken)
          .send(costCenterData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(costCenterData.name);
        expect(response.body.data.code).toBe(costCenterData.code);
        expect(response.body.data.budget).toBe(costCenterData.budget);
      });

      it('should validate required fields for cost center creation', async () => {
        const invalidData = {
          name: 'Invalid Center',
          // Missing required fields: code, department, manager, budget
          parentCenter: null
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-centers')
          .set('Authorization', authToken)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      it('should ensure unique cost center codes', async () => {
        const costCenterData = {
          name: 'Duplicate Code Center',
          code: 'MUA-001', // Existing code
          department: 'Operations',
          manager: 'Bob Wilson',
          budget: 100000
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-centers')
          .set('Authorization', authToken)
          .send(costCenterData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should validate parent center exists when provided', async () => {
        const costCenterData = {
          name: 'Child Center',
          code: 'CHD-001',
          department: 'Operations',
          manager: 'Carol Smith',
          budget: 75000,
          parentCenter: 'NON-EXISTENT-CODE'
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-centers')
          .set('Authorization', authToken)
          .send(costCenterData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('does not exist');
      });
    });

    describe('GET /api/cost-accounting/cost-centers', () => {
      beforeEach(async () => {
        // Create additional cost centers for testing
        const additionalCenters = [
          {
            name: 'Marketing Department',
            code: 'MKT-001',
            department: 'Marketing',
            manager: 'David Lee',
            budget: 180000,
            isActive: true
          },
          {
            name: 'IT Services',
            code: 'IT-001',
            department: 'Technology',
            manager: 'Emma Davis',
            budget: 220000,
            isActive: false
          }
        ];
        await CostCenter.insertMany(additionalCenters);
      });

      it('should retrieve all active cost centers', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/cost-centers?active=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        // All returned centers should be active
        const activeCenters = response.body.data.filter(center => center.isActive);
        expect(activeCenters.length).toBe(response.body.data.length);
      });

      it('should filter cost centers by department', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/cost-centers?department=Production')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned centers should be from Production department
        response.body.data.forEach(center => {
          expect(center.department).toBe('Production');
        });
      });

      it('should support hierarchical cost center queries', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/cost-centers?includeHierarchy=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Verify parent-child relationships are included
        const parentCenters = response.body.data.filter(center => !center.parentCenter);
        expect(parentCenters.length).toBeGreaterThan(0);
      });

      it('should provide cost center statistics', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/cost-centers?includeStats=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each center should have statistics
        response.body.data.forEach(center => {
          expect(center).toHaveProperty('totalCosts');
          expect(center).toHaveProperty('allocatedCosts');
          expect(center).toHaveProperty('remainingBudget');
        });
      });
    });

    describe('PUT /api/cost-accounting/cost-centers/:id', () => {
      let createdCostCenterId;

      beforeEach(async () => {
        const costCenter = new CostCenter({
          name: 'Test Center',
          code: 'TEST-001',
          department: 'Testing',
          manager: 'Test Manager',
          budget: 100000,
          isActive: true
        });
        const saved = await costCenter.save();
        createdCostCenterId = saved._id;
      });

      it('should update cost center with valid data', async () => {
        const updateData = {
          name: 'Updated Test Center',
          manager: 'Updated Manager',
          budget: 150000
        };

        const response = await request(app)
          .put(`/api/cost-accounting/cost-centers/${createdCostCenterId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.manager).toBe(updateData.manager);
        expect(response.body.data.budget).toBe(updateData.budget);
      });

      it('should prevent changing cost center code after creation', async () => {
        const updateData = {
          code: 'NEW-CODE-001'
        };

        const response = await request(app)
          .put(`/api/cost-accounting/cost-centers/${createdCostCenterId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be changed');
      });

      it('should validate parent center when updating', async () => {
        const updateData = {
          parentCenter: 'INVALID-CODE'
        };

        const response = await request(app)
          .put(`/api/cost-accounting/cost-centers/${createdCostCenterId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/cost-accounting/cost-centers/:id', () => {
      let costCenterToDelete;

      beforeEach(async () => {
        const costCenter = new CostCenter({
          name: 'Center to Delete',
          code: 'DEL-001',
          department: 'Deletion',
          manager: 'Delete Manager',
          budget: 50000,
          isActive: true
        });
        const saved = await costCenter.save();
        costCenterToDelete = saved._id;
      });

      it('should soft delete cost center by default', async () => {
        const response = await request(app)
          .delete(`/api/cost-accounting/cost-centers/${costCenterToDelete}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      });

      it('should hard delete when explicitly requested', async () => {
        const response = await request(app)
          .delete(`/api/cost-accounting/cost-centers/${costCenterToDelete}?hardDelete=true`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        // Verify it's completely removed
        const deleted = await CostCenter.findById(costCenterToDelete);
        expect(deleted).toBeNull();
      });

      it('should prevent deletion if cost center has active allocations', async () => {
        // Create a cost allocation first
        const allocation = new CostAllocation({
          sourceCenter: 'DEL-001',
          targetCenter: 'MUA-001',
          amount: 10000,
          period: '2025-01',
          description: 'Test allocation'
        });
        await allocation.save();

        const response = await request(app)
          .delete(`/api/cost-accounting/cost-centers/${costCenterToDelete}`)
          .set('Authorization', authToken)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('active allocations');
      });
    });
  });

  describe('Cost Allocation Management', () => {
    describe('POST /api/cost-accounting/allocations', () => {
      it('should create direct cost allocation', async () => {
        const allocationData = {
          allocationMethod: 'direct',
          sourceCenter: 'MUA-001',
          targetCenter: 'RD-001',
          amount: 75000,
          period: '2025-02',
          description: 'Manufacturing to R&D support',
          isRecurring: false
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(allocationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.allocationMethod).toBe(allocationData.allocationMethod);
        expect(response.body.data.amount).toBe(allocationData.amount);
      });

      it('should create percentage-based allocation', async () => {
        const allocationData = {
          allocationMethod: 'percentage',
          sourceCenter: 'MKT-001',
          targetCenters: [
            { center: 'MUA-001', percentage: 70 },
            { center: 'RD-001', percentage: 30 }
          ],
          totalAmount: 100000,
          period: '2025-02',
          description: 'Marketing overhead allocation',
          isRecurring: true,
          recurrencePattern: 'monthly'
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(allocationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.allocationMethod).toBe('percentage');
        expect(response.body.data.targetCenters).toHaveLength(2);
        expect(response.body.data.totalAmount).toBe(allocationData.totalAmount);
      });

      it('should create activity-based allocation', async () => {
        const allocationData = {
          allocationMethod: 'activity',
          sourceCenter: 'IT-001',
          targetCenters: [
            { center: 'MUA-001', driver: 'Machine Hours', quantity: 500 },
            { center: 'RD-001', driver: 'Labor Hours', quantity: 300 }
          ],
          totalAmount: 50000,
          period: '2025-02',
          description: 'IT support allocation by activity',
          isRecurring: true,
          recurrencePattern: 'monthly'
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(allocationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.allocationMethod).toBe('activity');
        expect(response.body.data.targetCenters).toHaveLength(2);
      });

      it('should validate allocation percentages sum to 100%', async () => {
        const invalidAllocation = {
          allocationMethod: 'percentage',
          sourceCenter: 'MKT-001',
          targetCenters: [
            { center: 'MUA-001', percentage: 60 },
            { center: 'RD-001', percentage: 30 } // Only 90%, should be 100%
          ],
          totalAmount: 100000,
          period: '2025-02'
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(invalidAllocation)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('must sum to 100%');
      });

      it('should validate activity-based allocation quantities', async () => {
        const invalidAllocation = {
          allocationMethod: 'activity',
          sourceCenter: 'IT-001',
          targetCenters: [
            { center: 'MUA-001', driver: 'Machine Hours', quantity: 0 }, // Invalid: 0
            { center: 'RD-001', driver: 'Labor Hours', quantity: 300 }
          ],
          totalAmount: 50000,
          period: '2025-02'
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(invalidAllocation)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('must be greater than 0');
      });
    });

    describe('GET /api/cost-accounting/allocations', () => {
      beforeEach(async () => {
        // Create additional allocations for testing
        const additionalAllocations = [
          {
            allocationMethod: 'direct',
            sourceCenter: 'QA-001',
            targetCenter: 'MUA-001',
            amount: 25000,
            period: '2025-02',
            description: 'QA support allocation',
            isRecurring: true,
            recurrencePattern: 'quarterly'
          },
          {
            allocationMethod: 'percentage',
            sourceCenter: 'HR-001', // Will be created
            targetCenters: [
              { center: 'MUA-001', percentage: 50 },
              { center: 'RD-001', percentage: 30 },
              { center: 'QA-001', percentage: 20 }
            ],
            totalAmount: 80000,
            period: '2025-02',
            description: 'HR overhead allocation',
            isRecurring: true,
            recurrencePattern: 'monthly'
          }
        ];

        // Create HR cost center first
        const hrCenter = new CostCenter({
          name: 'Human Resources',
          code: 'HR-001',
          department: 'Administration',
          manager: 'HR Manager',
          budget: 150000,
          isActive: true
        });
        await hrCenter.save();

        await CostAllocation.insertMany(additionalAllocations);
      });

      it('should retrieve allocations by period', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/allocations?period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned allocations should be for the specified period
        response.body.data.forEach(allocation => {
          expect(allocation.period).toBe('2025-01');
        });
      });

      it('should filter by source cost center', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/allocations?sourceCenter=MUA-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned allocations should have MUA-001 as source
        response.body.data.forEach(allocation => {
          expect(allocation.sourceCenter).toBe('MUA-001');
        });
      });

      it('should provide allocation summary by method', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/allocations?summaryBy=method')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary).toHaveProperty('direct');
        expect(response.body.summary).toHaveProperty('percentage');
        expect(response.body.summary).toHaveProperty('activity');
      });

      it('should include allocation impact analysis', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/allocations?includeImpact=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        // Each allocation should have impact data
        response.body.data.forEach(allocation => {
          expect(allocation).toHaveProperty('sourceImpact');
          expect(allocation).toHaveProperty('targetImpact');
          expect(allocation).toHaveProperty('budgetUtilization');
        });
      });
    });

    describe('PUT /api/cost-accounting/allocations/:id', () => {
      let createdAllocationId;

      beforeEach(async () => {
        const allocation = new CostAllocation({
          allocationMethod: 'direct',
          sourceCenter: 'MUA-001',
          targetCenter: 'RD-001',
          amount: 30000,
          period: '2025-02',
          description: 'Test allocation',
          isRecurring: false
        });
        const saved = await allocation.save();
        createdAllocationId = saved._id;
      });

      it('should update allocation amount and description', async () => {
        const updateData = {
          amount: 45000,
          description: 'Updated allocation description'
        };

        const response = await request(app)
          .put(`/api/cost-accounting/allocations/${createdAllocationId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.amount).toBe(updateData.amount);
        expect(response.body.data.description).toBe(updateData.description);
      });

      it('should prevent changing allocation method after creation', async () => {
        const updateData = {
          allocationMethod: 'percentage'
        };

        const response = await request(app)
          .put(`/api/cost-accounting/allocations/${createdAllocationId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be changed');
      });
    });
  });

  describe('Cost Driver Management', () => {
    describe('POST /api/cost-accounting/cost-drivers', () => {
      it('should create a new cost driver', async () => {
        const costDriverData = {
          name: 'Square Footage',
          unit: 'sqft',
          description: 'Floor space utilization',
          category: 'Facilities',
          isActive: true
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-drivers')
          .set('Authorization', authToken)
          .send(costDriverData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(costDriverData.name);
        expect(response.body.data.unit).toBe(costDriverData.unit);
      });

      it('should validate cost driver categories', async () => {
        const invalidData = {
          name: 'Invalid Category Driver',
          unit: 'units',
          description: 'Test',
          category: 'InvalidCategory'
        };

        const response = await request(app)
          .post('/api/cost-accounting/cost-drivers')
          .set('Authorization', authToken)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid category');
      });
    });

    describe('GET /api/cost-accounting/cost-drivers', () => {
      it('should retrieve cost drivers by category', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/cost-drivers?category=Production')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned drivers should be from Production category
        response.body.data.forEach(driver => {
          expect(driver.category).toBe('Production');
        });
      });
    });
  });

  describe('Product Costing', () => {
    describe('POST /api/cost-accounting/products', () => {
      it('should create product with standard costing', async () => {
        const productData = {
          name: 'Premium Widget',
          code: 'PWM-WGT',
          category: 'Premium',
          standardCost: 78.50,
          costDrivers: [
            { driver: 'Machine Hours', quantity: 3.2 },
            { driver: 'Labor Hours', quantity: 2.1 },
            { driver: 'Material Cost', quantity: 45.00 }
          ]
        };

        const response = await request(app)
          .post('/api/cost-accounting/products')
          .set('Authorization', authToken)
          .send(productData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.standardCost).toBe(productData.standardCost);
        expect(response.body.data.costDrivers).toHaveLength(3);
      });

      it('should calculate actual cost based on actual driver quantities', async () => {
        const productData = {
          name: 'Calculated Product',
          code: 'CAL-PROD',
          category: 'Standard',
          standardCost: 65.00,
          costDrivers: [
            { driver: 'Machine Hours', quantity: 2.5 },
            { driver: 'Labor Hours', quantity: 1.8 },
            { driver: 'Material Cost', quantity: 35.00 }
          ],
          actualDriverQuantities: [
            { driver: 'Machine Hours', quantity: 2.8 },
            { driver: 'Labor Hours', quantity: 1.9 },
            { driver: 'Material Cost', quantity: 37.50 }
          ]
        };

        const response = await request(app)
          .post('/api/cost-accounting/products')
          .set('Authorization', authToken)
          .send(productData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.actualCost).toBeDefined();
        expect(response.body.data.costVariance).toBeDefined();
        expect(response.body.data.costVariance.percentage).not.toBe(0);
      });
    });

    describe('PUT /api/cost-accounting/products/:id/recalculate', () => {
      let createdProductId;

      beforeEach(async () => {
        const product = new CostAccounting({
          name: 'Test Product',
          code: 'TEST-PROD',
          category: 'Testing',
          standardCost: 50.00,
          costDrivers: [
            { driver: 'Machine Hours', quantity: 2.0 },
            { driver: 'Labor Hours', quantity: 1.5 }
          ]
        });
        const saved = await product.save();
        createdProductId = saved._id;
      });

      it('should recalculate costs with updated driver rates', async () => {
        const rateUpdates = {
          driverRates: {
            'Machine Hours': 15.00, // New rate per hour
            'Labor Hours': 25.00    // New rate per hour
          }
        };

        const response = await request(app)
          .put(`/api/cost-accounting/products/${createdProductId}/recalculate`)
          .set('Authorization', authToken)
          .send(rateUpdates)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.recalculatedCost).toBeDefined();
        expect(response.body.data.costBreakdown).toBeDefined();
      });
    });
  });

  describe('Cost Analysis and Reporting', () => {
    describe('GET /api/cost-accounting/reports/cost-analysis', () => {
      beforeEach(async () => {
        // Create comprehensive test data for analysis
        const costRecords = [
          {
            costCenter: 'MUA-001',
            costCategory: 'Direct Materials',
            amount: 150000,
            period: '2025-01',
            product: 'WGT-A',
            driver: 'Material Cost'
          },
          {
            costCenter: 'MUA-001',
            costCategory: 'Direct Labor',
            amount: 80000,
            period: '2025-01',
            product: 'WGT-A',
            driver: 'Labor Hours'
          },
          {
            costCenter: 'MUA-001',
            costCategory: 'Manufacturing Overhead',
            amount: 45000,
            period: '2025-01',
            product: 'WGT-A',
            driver: 'Machine Hours'
          },
          {
            costCenter: 'RD-001',
            costCategory: 'Research & Development',
            amount: 120000,
            period: '2025-01',
            product: 'GDT-B',
            driver: 'Labor Hours'
          }
        ];

        await CostAccounting.insertMany(costRecords);
      });

      it('should generate cost center analysis report', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/cost-analysis?type=center&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('costCenters');
        expect(response.body.data).toHaveProperty('totalCosts');
        expect(response.body.data).toHaveProperty('costBreakdown');
      });

      it('should generate product profitability analysis', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/cost-analysis?type=product&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('products');
        expect(response.body.data).toHaveProperty('profitability');
        expect(response.body.data).toHaveProperty('costVariances');
      });

      it('should provide cost trend analysis', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/cost-analysis?type=trends&periods=2024-12,2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('trends');
        expect(response.body.data).toHaveProperty('varianceAnalysis');
        expect(response.body.data).toHaveProperty('predictions');
      });
    });

    describe('GET /api/cost-accounting/reports/budget-variance', () => {
      it('should generate budget vs actual variance report', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/budget-variance?period=2025-01&centers=MUA-001,RD-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        response.body.data.forEach(variance => {
          expect(variance).toHaveProperty('costCenter');
          expect(variance).toHaveProperty('budgetAmount');
          expect(variance).toHaveProperty('actualAmount');
          expect(variance).toHaveProperty('variance');
          expect(variance).toHaveProperty('variancePercentage');
        });
      });

      it('should highlight significant variances', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/budget-variance?period=2025-01&highlightVariance=true&threshold=10')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Variances above threshold should be highlighted
        response.body.data.forEach(variance => {
          if (Math.abs(variance.variancePercentage) > 10) {
            expect(variance.isHighlighted).toBe(true);
          }
        });
      });
    });

    describe('GET /api/cost-accounting/reports/activity-analysis', () => {
      it('should analyze activity-based costing effectiveness', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/activity-analysis?period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('activities');
        expect(response.body.data).toHaveProperty('costDriverAnalysis');
        expect(response.body.data).toHaveProperty('effectivenessMetrics');
      });

      it('should identify cost reduction opportunities', async () => {
        const response = await request(app)
          .get('/api/cost-accounting/reports/activity-analysis?opportunities=true&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('opportunities');
        expect(response.body.data.opportunities).toBeInstanceOf(Array);
        
        response.body.data.opportunities.forEach(opportunity => {
          expect(opportunity).toHaveProperty('category');
          expect(opportunity).toHaveProperty('potentialSavings');
          expect(opportunity).toHaveProperty('recommendation');
        });
      });
    });
  });

  describe('Workflow Integration', () => {
    describe('Cost Allocation Workflows', () => {
      it('should trigger allocation approval workflow', async () => {
        const allocationData = {
          allocationMethod: 'percentage',
          sourceCenter: 'MKT-001',
          targetCenters: [
            { center: 'MUA-001', percentage: 80 },
            { center: 'RD-001', percentage: 20 }
          ],
          totalAmount: 200000,
          period: '2025-02',
          description: 'Large marketing allocation',
          requiresApproval: true
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(allocationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('pending_approval');
        expect(response.body.data.approvalWorkflow).toBeDefined();
      });

      it('should process allocation approval/rejection', async () => {
        // First create a pending allocation
        const allocation = new CostAllocation({
          allocationMethod: 'direct',
          sourceCenter: 'MUA-001',
          targetCenter: 'RD-001',
          amount: 100000,
          period: '2025-02',
          description: 'Approval test allocation',
          requiresApproval: true,
          status: 'pending_approval'
        });
        const saved = await allocation.save();

        // Approve the allocation
        const approvalData = {
          action: 'approve',
          comments: 'Approved for Q1 2025',
          approver: 'finance-manager'
        };

        const response = await request(app)
          .put(`/api/cost-accounting/allocations/${saved._id}/approve`)
          .set('Authorization', authToken)
          .send(approvalData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('approved');
        expect(response.body.data.approvalDate).toBeDefined();
      });
    });

    describe('Budget Override Workflows', () => {
      it('should trigger budget override approval', async () => {
        const costCenterData = {
          name: 'Budget Override Test',
          code: 'BUD-OVR',
          department: 'Testing',
          manager: 'Test Manager',
          budget: 50000, // Low budget
          isActive: true
        };

        // Create cost center first
        await request(app)
          .post('/api/cost-accounting/cost-centers')
          .set('Authorization', authToken)
          .send(costCenterData);

        // Try to allocate more than budget
        const allocationData = {
          allocationMethod: 'direct',
          sourceCenter: 'BUD-OVR',
          targetCenter: 'MUA-001',
          amount: 75000, // Exceeds budget
          period: '2025-02',
          description: 'Budget exceeding allocation',
          requiresBudgetOverride: true
        };

        const response = await request(app)
          .post('/api/cost-accounting/allocations')
          .set('Authorization', authToken)
          .send(allocationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('pending_override_approval');
        expect(response.body.data.budgetExceeded).toBe(true);
      });
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      // Create large dataset for performance testing
      const costCenters = [];
      const allocations = [];

      for (let i = 0; i < 100; i++) {
        costCenters.push({
          name: `Performance Center ${i}`,
          code: `PERF-${i.toString().padStart(3, '0')}`,
          department: `Department ${Math.floor(i / 10)}`,
          manager: `Manager ${i}`,
          budget: 100000 + (i * 1000),
          isActive: true
        });

        allocations.push({
          allocationMethod: 'percentage',
          sourceCenter: `PERF-${i.toString().padStart(3, '0')}`,
          targetCenters: [
            { center: 'MUA-001', percentage: 60 },
            { center: 'RD-001', percentage: 40 }
          ],
          totalAmount: 50000 + (i * 500),
          period: '2025-01',
          description: `Performance test allocation ${i}`,
          isRecurring: true
        });
      }

      await CostCenter.insertMany(costCenters);
      await CostAllocation.insertMany(allocations);
    });

    it('should handle large number of cost centers efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/cost-accounting/cost-centers?limit=50&page=1')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(50);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should efficiently process bulk allocation queries', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/cost-accounting/allocations?sourceCenter=PERF-000&includeSummary=true')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should handle bulk queries within 2 seconds
    });

    it('should maintain performance with complex aggregations', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/cost-accounting/reports/cost-analysis?type=center&period=2025-01&includeVariance=true')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(3000); // Complex aggregations should complete within 3 seconds
    });
  });

  describe('Security and Authorization', () => {
    it('should require authentication for cost center operations', async () => {
      const costCenterData = {
        name: 'Unauthorized Center',
        code: 'UNAUTH-001',
        department: 'Testing',
        manager: 'Test Manager',
        budget: 100000
      };

      const response = await request(app)
        .post('/api/cost-accounting/cost-centers')
        .send(costCenterData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate user permissions for budget modifications', async () => {
      // Mock user with limited permissions
      jest.spyOn(require('../middleware/auth'), 'authenticate')
        .mockImplementation((req, res, next) => {
          req.user = { id: 'limited-user', role: 'viewer' };
          next();
        });

      const updateData = {
        budget: 200000,
        manager: 'New Manager'
      };

      const response = await request(app)
        .put('/api/cost-accounting/cost-centers/MUA-001')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should sanitize cost center data to prevent injection', async () => {
      const maliciousData = {
        name: 'Center <script>alert("xss")</script>',
        code: 'XSS-001',
        department: 'Test<script>alert("xss")</script>',
        manager: 'Manager<script>alert("xss")</script>',
        budget: 100000
      };

      const response = await request(app)
        .post('/api/cost-accounting/cost-centers')
        .set('Authorization', authToken)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify data is sanitized
      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.department).not.toContain('<script>');
      expect(response.body.data.manager).not.toContain('<script>');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing cost centers gracefully', async () => {
      const response = await request(app)
        .get('/api/cost-accounting/cost-centers?department=NonExistent')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle invalid allocation periods', async () => {
      const invalidAllocation = {
        allocationMethod: 'direct',
        sourceCenter: 'MUA-001',
        targetCenter: 'RD-001',
        amount: 10000,
        period: 'invalid-period',
        description: 'Invalid period test'
      };

      const response = await request(app)
        .post('/api/cost-accounting/allocations')
        .set('Authorization', authToken)
        .send(invalidAllocation)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('invalid period format');
    });

    it('should handle circular allocation references', async () => {
      const circularAllocation = {
        allocationMethod: 'percentage',
        sourceCenter: 'MUA-001',
        targetCenters: [
          { center: 'RD-001', percentage: 50 },
          { center: 'MUA-001', percentage: 50 } // Circular reference
        ],
        totalAmount: 50000,
        period: '2025-02',
        description: 'Circular allocation test'
      };

      const response = await request(app)
        .post('/api/cost-accounting/allocations')
        .set('Authorization', authToken)
        .send(circularAllocation)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('circular reference');
    });

    it('should validate cost center budget limits', async () => {
      const invalidData = {
        name: 'Invalid Budget Center',
        code: 'INV-BUD',
        department: 'Testing',
        manager: 'Test Manager',
        budget: -50000 // Negative budget
      };

      const response = await request(app)
        .post('/api/cost-accounting/cost-centers')
        .set('Authorization', authToken)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('budget must be positive');
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain referential integrity for cost allocations', async () => {
      // Create allocation referencing a cost center
      const allocation = new CostAllocation({
        allocationMethod: 'direct',
        sourceCenter: 'REF-TEST-001',
        targetCenter: 'MUA-001',
        amount: 10000,
        period: '2025-02',
        description: 'Referential integrity test'
      });
      await allocation.save();

      // Try to delete the referenced cost center
      const response = await request(app)
        .delete('/api/cost-accounting/cost-centers?code=REF-TEST-001&hardDelete=true')
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('referenced by allocations');
    });

    it('should validate allocation calculations', async () => {
      const allocation = {
        allocationMethod: 'percentage',
        sourceCenter: 'MKT-001',
        targetCenters: [
          { center: 'MUA-001', percentage: 33.33 },
          { center: 'RD-001', percentage: 33.33 },
          { center: 'QA-001', percentage: 33.34 } // Total: 100%
        ],
        totalAmount: 99900,
        period: '2025-02',
        description: 'Calculation validation test'
      };

      const response = await request(app)
        .post('/api/cost-accounting/allocations')
        .set('Authorization', authToken)
        .send(allocation)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.calculatedAmounts).toBeDefined();
      
      // Verify calculated amounts match expected values
      response.body.data.calculatedAmounts.forEach(calc => {
        expect(calc.calculatedAmount).toBeCloseTo(calc.percentage * allocation.totalAmount / 100, 2);
      });
    });

    it('should maintain audit trail for all cost accounting changes', async () => {
      const costCenterData = {
        name: 'Audit Trail Center',
        code: 'AUDIT-001',
        department: 'Testing',
        manager: 'Audit Manager',
        budget: 100000
      };

      const response = await request(app)
        .post('/api/cost-accounting/cost-centers')
        .set('Authorization', authToken)
        .send(costCenterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.auditTrail).toBeDefined();
      expect(response.body.data.auditTrail).toHaveLength(1);
      expect(response.body.data.auditTrail[0]).toHaveProperty('action', 'created');
      expect(response.body.data.auditTrail[0]).toHaveProperty('timestamp');
      expect(response.body.data.auditTrail[0]).toHaveProperty('userId');
    });
  });

  describe('Integration with External Systems', () => {
    it('should sync cost center data with ERP system', async () => {
      const syncData = {
        source: 'erp_system',
        syncType: 'cost_centers',
        data: [
          {
            name: 'ERP Synced Center',
            code: 'ERP-SYNC-001',
            department: 'Integration',
            manager: 'ERP Manager',
            budget: 150000
          }
        ]
      };

      const response = await request(app)
        .post('/api/cost-accounting/sync/erp')
        .set('Authorization', authToken)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.synced).toBe(1);
      expect(response.body.data.updated).toBe(0);
      expect(response.body.data.errors).toHaveLength(0);
    });

    it('should handle budget updates from financial planning system', async () => {
      const budgetUpdate = {
        source: 'financial_planning',
        updates: [
          {
            costCenter: 'MUA-001',
            newBudget: 750000,
            effectiveDate: '2025-02-01',
            reason: 'Annual budget adjustment'
          }
        ]
      };

      const response = await request(app)
        .put('/api/cost-accounting/budgets/bulk-update')
        .set('Authorization', authToken)
        .send(budgetUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updated).toBe(1);
      expect(response.body.data.history).toBeDefined();
    });

    it('should export cost data to business intelligence tools', async () => {
      const exportRequest = {
        format: 'json',
        includeDetails: true,
        period: '2025-01',
        dataTypes: ['cost_centers', 'allocations', 'variances']
      };

      const response = await request(app)
        .post('/api/cost-accounting/export/bi-tools')
        .set('Authorization', authToken)
        .send(exportRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('costCenters');
      expect(response.body.data).toHaveProperty('allocations');
      expect(response.body.data).toHaveProperty('variances');
      expect(response.body.data).toHaveProperty('exportTimestamp');
    });
  });
});