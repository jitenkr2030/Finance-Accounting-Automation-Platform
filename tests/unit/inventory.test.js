const request = require('supertest');
const app = require('../server');
const { generateAuthToken } = require('./helpers/TestHelpers');
const InventoryItem = require('../models/InventoryItem');

describe('Inventory Management API Tests', () => {
  let authToken;
  let testItem;
  let managerToken;

  beforeAll(async () => {
    authToken = await generateAuthToken('accountant');
    managerToken = await generateAuthToken('manager');
    
    // Create test inventory item
    testItem = await InventoryItem.create({
      sku: 'PROD001',
      name: 'Laptop Computer',
      description: 'High-performance laptop for business use',
      category: 'Electronics',
      unit: 'pieces',
      unitPrice: 75000,
      costPrice: 60000,
      quantity: 50,
      minStock: 10,
      maxStock: 100,
      location: 'Warehouse A',
      supplier: 'Tech Solutions Ltd'
    });
  });

  afterAll(async () => {
    if (testItem) {
      await InventoryItem.findByIdAndDelete(testItem._id);
    }
  });

  describe('POST /api/inventory/items', () => {
    test('should create a new inventory item', async () => {
      const itemData = {
        sku: 'PROD002',
        name: 'Desktop Computer',
        description: 'Business desktop computer',
        category: 'Electronics',
        unit: 'pieces',
        unitPrice: 45000,
        costPrice: 35000,
        quantity: 25,
        minStock: 5,
        maxStock: 50,
        location: 'Warehouse B',
        supplier: 'Computer World'
      };

      const response = await request(app)
        .post('/api/inventory/items')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sku).toBe(itemData.sku);
      expect(response.body.data.name).toBe(itemData.name);
      expect(response.body.data.quantity).toBe(itemData.quantity);
    });

    test('should not create item with duplicate SKU', async () => {
      const itemData = {
        sku: 'PROD001', // Existing SKU
        name: 'Duplicate Product',
        description: 'This should fail',
        unitPrice: 1000,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/inventory/items')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('duplicate');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        sku: '', // Empty SKU
        name: '', // Empty name
        unitPrice: -100 // Negative price
      };

      const response = await request(app)
        .post('/api/inventory/items')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/inventory/items', () => {
    test('should get all inventory items', async () => {
      const response = await request(app)
        .get('/api/inventory/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter items by category', async () => {
      const response = await request(app)
        .get('/api/inventory/items?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter items by low stock', async () => {
      const response = await request(app)
        .get('/api/inventory/items?lowStock=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should search items by name or SKU', async () => {
      const response = await request(app)
        .get('/api/inventory/items?search=Laptop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/inventory/items?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/inventory/items/:id', () => {
    test('should get item by ID', async () => {
      const response = await request(app)
        .get(`/api/inventory/items/${testItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testItem._id.toString());
      expect(response.body.data.sku).toBe(testItem.sku);
      expect(response.body.data.name).toBe(testItem.name);
    });

    test('should return 404 for non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/inventory/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/inventory/items/:id', () => {
    test('should update item details', async () => {
      const updateData = {
        name: 'Updated Laptop Computer',
        description: 'Updated description',
        unitPrice: 80000,
        quantity: 75,
        minStock: 15
      };

      const response = await request(app)
        .put(`/api/inventory/items/${testItem._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.unitPrice).toBe(updateData.unitPrice);
      expect(response.body.data.quantity).toBe(updateData.quantity);
    });

    test('should not update SKU', async () => {
      const updateData = {
        sku: 'PROD999', // Different SKU
        name: 'Updated Name'
      };

      const response = await request(app)
        .put(`/api/inventory/items/${testItem._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/inventory/items/:id/adjust-stock', () => {
    test('should adjust stock quantity', async () => {
      const adjustmentData = {
        type: 'add', // add, subtract, set
        quantity: 25,
        reason: 'Stock replenishment',
        reference: 'PO-2024-001'
      };

      const response = await request(app)
        .post(`/api/inventory/items/${testItem._id}/adjust-stock`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(adjustmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newQuantity).toBe(testItem.quantity + adjustmentData.quantity);
      expect(response.body.data.adjustmentHistory).toBeDefined();
    });

    test('should not allow negative stock', async () => {
      const adjustmentData = {
        type: 'subtract',
        quantity: 1000, // More than current stock
        reason: 'Testing negative stock'
      };

      const response = await request(app)
        .post(`/api/inventory/items/${testItem._id}/adjust-stock`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(adjustmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('negative');
    });
  });

  describe('GET /api/inventory/stock-alerts', () => {
    test('should get low stock alerts', async () => {
      const response = await request(app)
        .get('/api/inventory/stock-alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter alerts by severity', async () => {
      const response = await request(app)
        .get('/api/inventory/stock-alerts?severity=critical')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/inventory/reports/stock-valuation', () => {
    test('should get stock valuation report', async () => {
      const response = await request(app)
        .get('/api/inventory/reports/stock-valuation')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalValue).toBeDefined();
      expect(response.body.data.categoryBreakdown).toBeDefined();
      expect(response.body.data.items).toBeDefined();
    });

    test('should filter valuation by category', async () => {
      const response = await request(app)
        .get('/api/inventory/reports/stock-valuation?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalValue).toBeDefined();
    });
  });

  describe('GET /api/inventory/reports/movement', () => {
    test('should get stock movement report', async () => {
      const response = await request(app)
        .get('/api/inventory/reports/movement?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inwardMovements).toBeDefined();
      expect(response.body.data.outwardMovements).toBeDefined();
      expect(response.body.data.netMovement).toBeDefined();
    });

    test('should require date range for movement report', async () => {
      const response = await request(app)
        .get('/api/inventory/reports/movement')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/inventory/transactions', () => {
    test('should create stock transaction', async () => {
      const transactionData = {
        itemId: testItem._id,
        type: 'inward', // inward, outward, adjustment
        quantity: 10,
        unitPrice: 60000,
        totalValue: 600000,
        reference: 'GRN-2024-001',
        date: '2024-01-15',
        notes: 'Goods received note'
      };

      const response = await request(app)
        .post('/api/inventory/transactions')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.itemId).toBe(testItem._id.toString());
      expect(response.body.data.type).toBe(transactionData.type);
      expect(response.body.data.quantity).toBe(transactionData.quantity);
    });

    test('should validate transaction data', async () => {
      const invalidData = {
        itemId: testItem._id,
        type: 'invalid_type',
        quantity: -10, // Negative quantity
        unitPrice: -1000 // Negative price
      };

      const response = await request(app)
        .post('/api/inventory/transactions')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory/transactions', () => {
    test('should get stock transactions with pagination', async () => {
      const response = await request(app)
        .get('/api/inventory/transactions?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/inventory/transactions?type=inward')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter transactions by item', async () => {
      const response = await request(app)
        .get(`/api/inventory/transactions?itemId=${testItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/inventory/reorder-point', () => {
    test('should set reorder point for item', async () => {
      const reorderData = {
        reorderPoint: 20,
        reorderQuantity: 50,
        leadTime: 7, // days
        supplierId: 'supplier123'
      };

      const response = await request(app)
        .post(`/api/inventory/items/${testItem._id}/reorder-point`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(reorderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reorderPoint).toBe(reorderData.reorderPoint);
      expect(response.body.data.reorderQuantity).toBe(reorderData.reorderQuantity);
    });
  });

  describe('GET /api/inventory/reorder-alerts', () => {
    test('should get reorder point alerts', async () => {
      const response = await request(app)
        .get('/api/inventory/reorder-alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every(alert => alert.currentStock <= alert.reorderPoint)).toBe(true);
    });
  });

  describe('DELETE /api/inventory/items/:id', () => {
    test('should soft delete inventory item', async () => {
      const response = await request(app)
        .delete(`/api/inventory/items/${testItem._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    test('should not allow non-manager to delete item', async () => {
      const response = await request(app)
        .delete(`/api/inventory/items/${testItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with purchase orders', async () => {
      // Create purchase order
      const poData = {
        supplier: 'Tech Solutions Ltd',
        items: [{
          item: testItem._id,
          quantity: 20,
          rate: 60000,
          amount: 1200000
        }],
        total: 1200000
      };

      const poResponse = await request(app)
        .post('/api/procurement/purchase-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(poData)
        .expect(201);

      expect(poResponse.body.success).toBe(true);

      // Verify inventory is updated when PO is received
      const receiveResponse = await request(app)
        .post(`/api/procurement/purchase-orders/${poResponse.body.data._id}/receive`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ receivedQuantity: 20 })
        .expect(200);

      expect(receiveResponse.body.success).toBe(true);
    });

    test('should integrate with billing system', async () => {
      // Create invoice with inventory items
      const invoiceData = {
        customer: 'customer123',
        items: [{
          product: testItem._id,
          quantity: 2,
          rate: 75000,
          amount: 150000
        }],
        total: 150000
      };

      const invoiceResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(201);

      expect(invoiceResponse.body.success).toBe(true);

      // Verify inventory is reduced when invoice is created
      const updatedItem = await InventoryItem.findById(testItem._id);
      expect(updatedItem.quantity).toBe(testItem.quantity - 2);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database errors gracefully', async () => {
      // Test with invalid ObjectId
      const response = await request(app)
        .get('/api/inventory/items/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should handle concurrent stock updates', async () => {
      // Simulate concurrent stock updates
      const adjustment1 = {
        type: 'add',
        quantity: 10,
        reason: 'Concurrent test 1'
      };

      const adjustment2 = {
        type: 'add',
        quantity: 15,
        reason: 'Concurrent test 2'
      };

      const [response1, response2] = await Promise.all([
        request(app)
          .post(`/api/inventory/items/${testItem._id}/adjust-stock`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send(adjustment1),
        request(app)
          .post(`/api/inventory/items/${testItem._id}/adjust-stock`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send(adjustment2)
      ]);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      // Both updates should be processed
    });
  });
});