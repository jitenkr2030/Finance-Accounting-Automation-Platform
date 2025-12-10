const request = require('supertest');
const app = require('../server');
const { generateAuthToken } = require('./helpers/TestHelpers');
const Asset = require('../models/Asset');

describe('Asset Management API Tests', () => {
  let authToken;
  let testAsset;
  let managerToken;

  beforeAll(async () => {
    authToken = await generateAuthToken('accountant');
    managerToken = await generateAuthToken('manager');
    
    // Create test asset
    testAsset = await Asset.create({
      assetCode: 'AST001',
      name: 'Office Building',
      category: 'building',
      purchaseDate: '2020-01-01',
      purchaseCost: 10000000,
      currentValue: 8000000,
      depreciationMethod: 'straight_line',
      usefulLife: 50,
      salvageValue: 1000000,
      location: 'Mumbai Office',
      status: 'active'
    });
  });

  afterAll(async () => {
    if (testAsset) {
      await Asset.findByIdAndDelete(testAsset._id);
    }
  });

  describe('POST /api/assets', () => {
    test('should create a new asset', async () => {
      const assetData = {
        assetCode: 'AST002',
        name: 'Manufacturing Equipment',
        category: 'machinery',
        purchaseDate: '2021-06-15',
        purchaseCost: 2500000,
        currentValue: 2000000,
        depreciationMethod: 'straight_line',
        usefulLife: 10,
        salvageValue: 250000,
        location: 'Production Floor A',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(assetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assetCode).toBe(assetData.assetCode);
      expect(response.body.data.name).toBe(assetData.name);
      expect(response.body.data.category).toBe(assetData.category);
      expect(response.body.data.purchaseCost).toBe(assetData.purchaseCost);
    });

    test('should not create asset with duplicate asset code', async () => {
      const assetData = {
        assetCode: 'AST001', // Existing asset code
        name: 'Duplicate Asset',
        category: 'equipment',
        purchaseDate: '2022-01-01',
        purchaseCost: 100000,
        depreciationMethod: 'straight_line',
        usefulLife: 5
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(assetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('duplicate');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        assetCode: '', // Empty asset code
        name: '', // Empty name
        category: '', // Empty category
        purchaseDate: '2025-01-01', // Future date
        purchaseCost: -1000, // Negative cost
        depreciationMethod: 'invalid_method',
        usefulLife: 0 // Zero useful life
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/assets', () => {
    test('should get all assets', async () => {
      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter assets by category', async () => {
      const response = await request(app)
        .get('/api/assets?category=building')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter assets by status', async () => {
      const response = await request(app)
        .get('/api/assets?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter assets by location', async () => {
      const response = await request(app)
        .get('/api/assets?location=Mumbai')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should search assets by name or code', async () => {
      const response = await request(app)
        .get('/api/assets?search=Office')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/assets?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/assets/:id', () => {
    test('should get asset by ID', async () => {
      const response = await request(app)
        .get(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testAsset._id.toString());
      expect(response.body.data.assetCode).toBe(testAsset.assetCode);
      expect(response.body.data.name).toBe(testAsset.name);
    });

    test('should return 404 for non-existent asset', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/assets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/assets/:id', () => {
    test('should update asset details', async () => {
      const updateData = {
        name: 'Updated Office Building',
        location: 'Updated Mumbai Location',
        currentValue: 8500000,
        status: 'under_maintenance'
      };

      const response = await request(app)
        .put(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.location).toBe(updateData.location);
      expect(response.body.data.currentValue).toBe(updateData.currentValue);
    });

    test('should not update asset code', async () => {
      const updateData = {
        assetCode: 'AST999', // Different asset code
        name: 'Updated Name'
      };

      const response = await request(app)
        .put(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/assets/:id/depreciation', () => {
    test('should calculate depreciation', async () => {
      const depreciationData = {
        method: 'straight_line',
        period: 'monthly', // monthly, quarterly, annually
        year: 2024,
        month: 1
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/depreciation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depreciationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.depreciationAmount).toBeDefined();
      expect(response.body.data.accumulatedDepreciation).toBeDefined();
      expect(response.body.data.bookValue).toBeDefined();
      expect(response.body.data.depreciationRate).toBeDefined();
    });

    test('should calculate depreciation using declining balance method', async () => {
      const depreciationData = {
        method: 'declining_balance',
        period: 'annually',
        year: 2024
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/depreciation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depreciationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.depreciationAmount).toBeDefined();
      expect(response.body.data.method).toBe('declining_balance');
    });
  });

  describe('POST /api/assets/:id/disposal', () => {
    test('should dispose asset', async () => {
      const disposalData = {
        disposalDate: '2024-12-31',
        disposalMethod: 'sale',
        disposalValue: 12000000,
        buyer: 'Real Estate Investor',
        reason: 'Strategic sale',
        documents: ['sale_agreement.pdf', 'valuation_report.pdf']
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/disposal`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(disposalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('disposed');
      expect(response.body.data.disposalDetails).toBeDefined();
      expect(response.body.data.gainLoss).toBeDefined();
    });

    test('should handle loss on disposal', async () => {
      const disposalData = {
        disposalDate: '2024-12-31',
        disposalMethod: 'sale',
        disposalValue: 7000000, // Less than current value
        buyer: 'Property Buyer',
        reason: 'Market conditions'
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/disposal`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(disposalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gainLoss).toBeLessThan(0);
      expect(response.body.data.lossAmount).toBeDefined();
    });
  });

  describe('GET /api/assets/reports/depreciation-schedule', () => {
    test('should get depreciation schedule report', async () => {
      const response = await request(app)
        .get('/api/assets/reports/depreciation-schedule?year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDepreciation).toBeDefined();
      expect(response.body.data.assetSchedule).toBeDefined();
      expect(Array.isArray(response.body.data.assetSchedule)).toBe(true);
    });

    test('should filter depreciation by category', async () => {
      const response = await request(app)
        .get('/api/assets/reports/depreciation-schedule?category=building&year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDepreciation).toBeDefined();
    });
  });

  describe('GET /api/assets/reports/asset-register', () => {
    test('should get complete asset register', async () => {
      const response = await request(app)
        .get('/api/assets/reports/asset-register')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAssets).toBeDefined();
      expect(response.body.data.totalCost).toBeDefined();
      expect(response.body.data.totalCurrentValue).toBeDefined();
      expect(response.body.data.totalAccumulatedDepreciation).toBeDefined();
      expect(response.body.data.assets).toBeDefined();
      expect(Array.isArray(response.body.data.assets)).toBe(true);
    });

    test('should filter register by location', async () => {
      const response = await request(app)
        .get('/api/assets/reports/asset-register?location=Mumbai')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAssets).toBeDefined();
    });
  });

  describe('GET /api/assets/reports/disposal-report', () => {
    test('should get asset disposal report', async () => {
      const response = await request(app)
        .get('/api/assets/reports/disposal-report?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDisposals).toBeDefined();
      expect(response.body.data.totalProceeds).toBeDefined();
      expect(response.body.data.totalGainLoss).toBeDefined();
      expect(response.body.data.disposals).toBeDefined();
    });

    test('should require date range for disposal report', async () => {
      const response = await request(app)
        .get('/api/assets/reports/disposal-report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/assets/:id/transfer', () => {
    test('should transfer asset to another location', async () => {
      const transferData = {
        fromLocation: 'Mumbai Office',
        toLocation: 'Delhi Office',
        transferDate: '2024-03-01',
        reason: 'Office relocation',
        transferredBy: 'admin123',
        documents: ['transfer_order.pdf']
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/transfer`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(transferData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toBe(transferData.toLocation);
      expect(response.body.data.transferHistory).toBeDefined();
      expect(response.body.data.transferHistory.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/assets/:id/maintenance', () => {
    test('should record maintenance activity', async () => {
      const maintenanceData = {
        maintenanceDate: '2024-01-15',
        type: 'repair',
        description: 'HVAC system repair',
        cost: 50000,
        vendor: 'HVAC Solutions Ltd',
        nextMaintenanceDate: '2024-07-15',
        status: 'completed'
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/maintenance`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(maintenanceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.maintenanceHistory).toBeDefined();
      expect(response.body.data.maintenanceHistory.length).toBeGreaterThan(0);
    });

    test('should track maintenance costs', async () => {
      // Add another maintenance record
      const maintenanceData2 = {
        maintenanceDate: '2024-02-01',
        type: 'preventive',
        description: 'Annual inspection',
        cost: 25000,
        vendor: 'Inspection Services',
        status: 'completed'
      };

      await request(app)
        .post(`/api/assets/${testAsset._id}/maintenance`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(maintenanceData2)
        .expect(201);

      // Check total maintenance cost
      const assetResponse = await request(app)
        .get(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(assetResponse.body.data.totalMaintenanceCost).toBe(75000); // 50000 + 25000
    });
  });

  describe('POST /api/assets/:id/assignment', () => {
    test('should assign asset to employee', async () => {
      const assignmentData = {
        assignedTo: 'employee123',
        assignedDate: '2024-01-01',
        expectedReturnDate: '2024-12-31',
        purpose: 'Office use',
        assignedBy: 'admin456',
        condition: 'good'
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/assignment`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(assignmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo).toBe(assignmentData.assignedTo);
      expect(response.body.data.assignmentHistory).toBeDefined();
    });

    test('should return assigned asset', async () => {
      const returnData = {
        returnDate: '2024-06-30',
        returnCondition: 'excellent',
        returnNotes: 'Asset returned in excellent condition',
        returnedBy: 'employee123'
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/return`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(returnData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo).toBeNull();
      expect(response.body.data.returnHistory).toBeDefined();
    });
  });

  describe('DELETE /api/assets/:id', () => {
    test('should soft delete asset', async () => {
      const response = await request(app)
        .delete(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    test('should not allow non-manager to delete asset', async () => {
      const response = await request(app)
        .delete(`/api/assets/${testAsset._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with general ledger for depreciation entries', async () => {
      const depreciationData = {
        method: 'straight_line',
        period: 'monthly',
        year: 2024,
        month: 1
      };

      const depreciationResponse = await request(app)
        .post(`/api/assets/${testAsset._id}/depreciation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depreciationData)
        .expect(200);

      expect(depreciationResponse.body.success).toBe(true);

      // Check if journal entries were created
      const journalResponse = await request(app)
        .get('/api/ledger/journal-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(journalResponse.body.success).toBe(true);
      
      // Should contain depreciation entries
      const depreciationEntries = journalResponse.body.data.filter(entry => 
        entry.description && entry.description.toLowerCase().includes('depreciation')
      );
      expect(depreciationEntries.length).toBeGreaterThan(0);
    });

    test('should integrate with expense management for maintenance', async () => {
      const maintenanceData = {
        maintenanceDate: '2024-03-01',
        type: 'repair',
        description: 'Equipment repair',
        cost: 15000,
        vendor: 'Repair Services Inc',
        status: 'completed'
      };

      const maintenanceResponse = await request(app)
        .post(`/api/assets/${testAsset._id}/maintenance`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(maintenanceData)
        .expect(201);

      expect(maintenanceResponse.body.success).toBe(true);

      // Check if expense was created
      const expenseResponse = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(expenseResponse.body.success).toBe(true);
      
      // Should contain maintenance expense
      const maintenanceExpenses = expenseResponse.body.data.filter(expense => 
        expense.description && expense.description.toLowerCase().includes('repair')
      );
      expect(maintenanceExpenses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid depreciation method', async () => {
      const invalidData = {
        method: 'invalid_method',
        period: 'monthly',
        year: 2024
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/depreciation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('method');
    });

    test('should handle disposal of non-existent asset', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const disposalData = {
        disposalDate: '2024-12-31',
        disposalMethod: 'sale',
        disposalValue: 100000
      };

      const response = await request(app)
        .post(`/api/assets/${fakeId}/disposal`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(disposalData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should validate disposal value', async () => {
      const invalidDisposalData = {
        disposalDate: '2024-12-31',
        disposalMethod: 'sale',
        disposalValue: -1000 // Negative value
      };

      const response = await request(app)
        .post(`/api/assets/${testAsset._id}/disposal`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidDisposalData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});