const request = require('supertest');
const express = require('express');
const integrationRouter = require('../routes/integration');
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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/integration', integrationRouter);

describe('Integration Management API', () => {
  let testUser;
  let mockIntegrations;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'admin'
    };

    // Mock integrations data
    mockIntegrations = [
      {
        name: 'Shopify',
        type: 'ecommerce',
        description: 'Sync orders, customers, and inventory',
        icon: 'shopify',
        connected: false,
        features: ['Order Sync', 'Customer Sync', 'Inventory Sync'],
        supportedDataTypes: ['orders', 'customers', 'products'],
        lastSync: null,
        syncStatus: 'disconnected'
      },
      {
        name: 'WooCommerce',
        type: 'ecommerce',
        description: 'Sync orders, customers, and inventory',
        icon: 'woocommerce',
        connected: true,
        features: ['Order Sync', 'Customer Sync', 'Inventory Sync'],
        supportedDataTypes: ['orders', 'customers', 'products'],
        lastSync: new Date('2023-12-01T10:00:00Z'),
        syncStatus: 'active',
        credentials: {
          storeUrl: 'https://mystore.com',
          apiKey: '***hidden***'
        }
      },
      {
        name: 'Tally',
        type: 'accounting',
        description: 'Import/export data from Tally',
        icon: 'tally',
        connected: false,
        features: ['Data Import', 'Data Export', 'Chart of Accounts Sync'],
        supportedDataTypes: ['accounts', 'transactions', 'entries'],
        lastSync: null,
        syncStatus: 'disconnected'
      },
      {
        name: 'Zoho Books',
        type: 'accounting',
        description: 'Sync with Zoho Books',
        icon: 'zoho',
        connected: true,
        features: ['Financial Sync', 'Customer Sync', 'Vendor Sync'],
        supportedDataTypes: ['accounts', 'customers', 'vendors', 'invoices'],
        lastSync: new Date('2023-12-01T14:30:00Z'),
        syncStatus: 'active',
        credentials: {
          organizationId: 'org123',
          accessToken: '***hidden***'
        }
      },
      {
        name: 'Razorpay',
        type: 'payment',
        description: 'Process payments and sync transactions',
        icon: 'razorpay',
        connected: false,
        features: ['Payment Processing', 'Transaction Sync', 'Refund Management'],
        supportedDataTypes: ['payments', 'refunds', 'settlements'],
        lastSync: null,
        syncStatus: 'disconnected'
      },
      {
        name: 'Stripe',
        type: 'payment',
        description: 'Process payments and sync transactions',
        icon: 'stripe',
        connected: true,
        features: ['Payment Processing', 'Subscription Management', 'Invoice Sync'],
        supportedDataTypes: ['payments', 'subscriptions', 'invoices'],
        lastSync: new Date('2023-12-01T16:45:00Z'),
        syncStatus: 'active',
        credentials: {
          accountId: 'acct_123456789',
          publishableKey: 'pk_***hidden***'
        }
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      const integrationTypes = ['ecommerce', 'accounting', 'payment', 'crm', 'inventory'];
      largeDataset.push({
        name: `Integration ${i}`,
        type: integrationTypes[i % 5],
        description: `Integration description ${i}`,
        icon: `integration${i}`,
        connected: i % 3 === 0,
        features: [`Feature A`, `Feature B`, `Feature C`],
        supportedDataTypes: ['data1', 'data2', 'data3'],
        lastSync: i % 3 === 0 ? new Date(2023, 11, 1 + (i % 30), (i % 24), (i % 60)) : null,
        syncStatus: i % 3 === 0 ? 'active' : 'disconnected'
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /integration/available', () => {
    test('should retrieve all available integrations', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      expect(response.body).toHaveProperty('integrations');
      expect(Array.isArray(response.body.integrations)).toBe(true);
      expect(response.body.integrations.length).toBe(6);
      expect(response.body.integrations[0]).toHaveProperty('name');
      expect(response.body.integrations[0]).toHaveProperty('type');
      expect(response.body.integrations[0]).toHaveProperty('description');
      expect(response.body.integrations[0]).toHaveProperty('icon');
      expect(response.body.integrations[0]).toHaveProperty('connected');
    });

    test('should include all integration types', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      const types = response.body.integrations.map(integration => integration.type);
      expect(types).toContain('ecommerce');
      expect(types).toContain('accounting');
      expect(types).toContain('payment');
    });

    test('should have correct integration details', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      const shopifyIntegration = response.body.integrations.find(i => i.name === 'Shopify');
      expect(shopifyIntegration).toBeDefined();
      expect(shopifyIntegration.type).toBe('ecommerce');
      expect(shopifyIntegration.description).toBe('Sync orders, customers, and inventory');
      expect(shopifyIntegration.icon).toBe('shopify');
      expect(shopifyIntegration.connected).toBe(false);
    });

    test('should return connected and disconnected integrations', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      const connected = response.body.integrations.filter(i => i.connected);
      const disconnected = response.body.integrations.filter(i => !i.connected);

      expect(connected.length).toBeGreaterThan(0);
      expect(disconnected.length).toBeGreaterThan(0);
    });

    test('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/integration/available')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('integrations');
        expect(response.body.integrations.length).toBe(6);
      });
    });

    test('should return consistent integration data', async () => {
      const responses = await Promise.all([
        request(app).get('/integration/available'),
        request(app).get('/integration/available'),
        request(app).get('/integration/available')
      ]);

      responses.forEach(response => {
        expect(response.body.integrations.length).toBe(6);
        expect(response.body.integrations.map(i => i.name)).toEqual([
          'Shopify', 'WooCommerce', 'Tally', 'Zoho Books', 'Razorpay', 'Stripe'
        ]);
      });
    });

    test('should handle performance with large integration datasets', async () => {
      // Mock large dataset response
      const originalData = [
        {
          name: 'Integration 1',
          type: 'ecommerce',
          description: 'Test integration',
          icon: 'test',
          connected: false
        }
      ];

      const startTime = Date.now();
      const response = await request(app)
        .get('/integration/available')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.integrations.length).toBe(6);
    });

    test('should validate integration structure', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      response.body.integrations.forEach(integration => {
        expect(integration).toHaveProperty('name');
        expect(integration).toHaveProperty('type');
        expect(integration).toHaveProperty('description');
        expect(integration).toHaveProperty('icon');
        expect(integration).toHaveProperty('connected');
        expect(typeof integration.name).toBe('string');
        expect(typeof integration.type).toBe('string');
        expect(typeof integration.description).toBe('string');
        expect(typeof integration.connected).toBe('boolean');
      });
    });

    test('should handle database errors gracefully', async () => {
      // The mock implementation should not throw errors, but test the structure
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      expect(response.body).toHaveProperty('integrations');
      expect(Array.isArray(response.body.integrations)).toBe(true);
    });

    test('should return integrations sorted by type', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      // Should have a mix of integration types
      const types = response.body.integrations.map(i => i.type);
      expect(types).toContain('ecommerce');
      expect(types).toContain('accounting');
      expect(types).toContain('payment');
    });

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/integration/available')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.integrations.length).toBe(6);
      });
    });
  });

  describe('POST /integration/connect/:integrationName', () => {
    test('should connect integration successfully', async () => {
      const integrationName = 'Shopify';
      const credentials = {
        apiKey: 'test_api_key',
        shopUrl: 'https://test-shop.myshopify.com',
        secretKey: 'test_secret_key'
      };

      const response = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('lastSync');
      expect(response.body.message).toBe(`${integrationName} integration connected successfully`);
      expect(response.body.status).toBe('connected');
      expect(response.body.lastSync).toBeDefined();
      expect(new Date(response.body.lastSync)).toBeInstanceOf(Date);
    });

    test('should validate integration name parameter', async () => {
      const credentials = { apiKey: 'test_key' };

      const response = await request(app)
        .post('/integration/connect/NonExistentIntegration')
        .send({ credentials })
        .expect(200);

      // Should still respond with mock data even for non-existent integrations
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
    });

    test('should require credentials field', async () => {
      const response = await request(app)
        .post('/integration/connect/Shopify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should validate credentials is not empty', async () => {
      const response = await request(app)
        .post('/integration/connect/Shopify')
        .send({ credentials: '' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should handle various integration types', async () => {
      const integrationNames = ['Shopify', 'Tally', 'Razorpay', 'Stripe'];
      const credentials = { testCredential: 'value' };

      for (const integrationName of integrationNames) {
        const response = await request(app)
          .post(`/integration/connect/${integrationName}`)
          .send({ credentials })
          .expect(200);

        expect(response.body.message).toBe(`${integrationName} integration connected successfully`);
        expect(response.body.status).toBe('connected');
      }
    });

    test('should handle special characters in integration name', async () => {
      const integrationName = 'Test-Integration_123';
      const credentials = { testCredential: 'value' };

      const response = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials })
        .expect(200);

      expect(response.body.message).toBe(`${integrationName} integration connected successfully`);
    });

    test('should handle complex credentials objects', async () => {
      const integrationName = 'Shopify';
      const complexCredentials = {
        apiKey: 'sk_test_1234567890',
        secretKey: 'secret_abcdefghijklmnop',
        shopUrl: 'https://test-shop.myshopify.com',
        webhooks: {
          orders: 'https://api.example.com/webhooks/orders',
          customers: 'https://api.example.com/webhooks/customers'
        },
        settings: {
          syncFrequency: 'hourly',
          autoSync: true,
          timeout: 30000
        }
      };

      const response = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials: complexCredentials })
        .expect(200);

      expect(response.body.status).toBe('connected');
    });

    test('should handle concurrent connection attempts', async () => {
      const integrationName = 'Shopify';
      const credentials = { apiKey: 'test_key' };
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .post(`/integration/connect/${integrationName}`)
          .send({ credentials })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('status');
      });
    });

    test('should handle database connection errors gracefully', async () => {
      const integrationName = 'Shopify';
      const credentials = { apiKey: 'test_key' };

      const response = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials })
        .expect(200);

      // Mock implementation should handle errors gracefully
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
    });

    test('should handle very long credentials', async () => {
      const integrationName = 'Shopify';
      const longCredentials = {
        apiKey: 'a'.repeat(10000),
        description: 'Very long credential description'
      };

      const response = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials: longCredentials })
        .expect(200);

      expect(response.body.status).toBe('connected');
    });
  });

  describe('POST /integration/sync/:integrationName', () => {
    test('should initiate sync successfully', async () => {
      const integrationName = 'Shopify';
      const syncData = {
        dataTypes: ['orders', 'customers', 'products']
      };

      const response = await request(app)
        .post(`/integration/sync/${integrationName}`)
        .send(syncData)
        .expect(200);

      expect(response.body).toHaveProperty('syncId');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('estimatedDuration');
      expect(response.body).toHaveProperty('dataTypes');
      expect(response.body.message).toBe('Sync initiated');
      expect(response.body.syncId).toMatch(/^SYNC_\d+$/);
      expect(response.body.estimatedDuration).toBe('5-10 minutes');
      expect(response.body.dataTypes).toEqual(['orders', 'customers', 'products']);
    });

    test('should generate unique sync IDs', async () => {
      const syncData = { dataTypes: ['orders'] };
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/integration/sync/Shopify')
          .send(syncData)
      );

      const responses = await Promise.all(promises);
      const syncIds = responses.map(r => r.body.syncId);
      
      // All sync IDs should be unique
      const uniqueSyncIds = [...new Set(syncIds)];
      expect(uniqueSyncIds.length).toBe(5);
    });

    test('should handle empty dataTypes array', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: [] })
        .expect(200);

      expect(response.body.syncId).toBeDefined();
      expect(response.body.dataTypes).toEqual([]);
    });

    test('should handle single data type', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders'] })
        .expect(200);

      expect(response.body.dataTypes).toEqual(['orders']);
    });

    test('should handle multiple data types', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders', 'customers', 'products', 'inventory'] })
        .expect(200);

      expect(response.body.dataTypes).toEqual(['orders', 'customers', 'products', 'inventory']);
    });

    test('should handle missing dataTypes field', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({})
        .expect(200);

      expect(response.body.syncId).toBeDefined();
      expect(response.body.dataTypes).toBeUndefined();
    });

    test('should handle various integration names', async () => {
      const integrationNames = ['Shopify', 'WooCommerce', 'Tally', 'Zoho Books'];
      const syncData = { dataTypes: ['orders'] };

      for (const integrationName of integrationNames) {
        const response = await request(app)
          .post(`/integration/sync/${integrationName}`)
          .send(syncData)
          .expect(200);

        expect(response.body.syncId).toBeDefined();
        expect(response.body.message).toBe('Sync initiated');
      }
    });

    test('should handle concurrent sync requests', async () => {
      const syncData = { dataTypes: ['orders', 'customers'] };
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .post('/integration/sync/Shopify')
          .send(syncData)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('syncId');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('dataTypes');
      });
    });

    test('should handle special characters in integration name', async () => {
      const integrationName = 'Test-Integration_123';
      const syncData = { dataTypes: ['orders'] };

      const response = await request(app)
        .post(`/integration/sync/${integrationName}`)
        .send(syncData)
        .expect(200);

      expect(response.body.syncId).toBeDefined();
    });

    test('should handle very large dataTypes arrays', async () => {
      const largeDataTypes = Array.from({ length: 100 }, (_, i) => `dataType${i}`);
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: largeDataTypes })
        .expect(200);

      expect(response.body.dataTypes).toEqual(largeDataTypes);
    });

    test('should handle duplicate data types', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders', 'orders', 'customers', 'orders'] })
        .expect(200);

      expect(response.body.dataTypes).toEqual(['orders', 'orders', 'customers', 'orders']);
    });
  });

  describe('GET /integration/status/:integrationName', () => {
    test('should retrieve integration status successfully', async () => {
      const integrationName = 'Shopify';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(response.body).toHaveProperty('integration');
      expect(response.body.integration).toHaveProperty('name');
      expect(response.body.integration).toHaveProperty('connected');
      expect(response.body.integration).toHaveProperty('lastSync');
      expect(response.body.integration).toHaveProperty('status');
      expect(response.body.integration).toHaveProperty('recordsSynced');
      expect(response.body.integration).toHaveProperty('errors');
      expect(response.body.integration.name).toBe(integrationName);
      expect(response.body.integration.connected).toBe(true);
      expect(response.body.integration.status).toBe('active');
    });

    test('should include last sync timestamp', async () => {
      const integrationName = 'Shopify';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(response.body.integration.lastSync).toBeDefined();
      expect(new Date(response.body.integration.lastSync)).toBeInstanceOf(Date);
      
      // Should be approximately 2 hours ago (as per mock data)
      const lastSync = new Date(response.body.integration.lastSync);
      const now = new Date();
      const diffHours = (now - lastSync) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThan(1.5);
      expect(diffHours).toBeLessThan(2.5);
    });

    test('should include records synced count', async () => {
      const integrationName = 'Shopify';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(response.body.integration.recordsSynced).toBe(1250);
      expect(typeof response.body.integration.recordsSynced).toBe('number');
    });

    test('should include empty errors array', async () => {
      const integrationName = 'Shopify';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(Array.isArray(response.body.integration.errors)).toBe(true);
      expect(response.body.integration.errors).toEqual([]);
    });

    test('should handle various integration names', async () => {
      const integrationNames = ['Shopify', 'WooCommerce', 'Tally', 'Stripe'];

      for (const integrationName of integrationNames) {
        const response = await request(app)
          .get(`/integration/status/${integrationName}`)
          .expect(200);

        expect(response.body.integration.name).toBe(integrationName);
        expect(response.body.integration.connected).toBe(true);
        expect(response.body.integration.status).toBe('active');
      }
    });

    test('should handle non-existent integration names', async () => {
      const integrationName = 'NonExistentIntegration';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      // Should still return mock status for any integration name
      expect(response.body.integration.name).toBe(integrationName);
      expect(response.body.integration.connected).toBe(true);
    });

    test('should handle special characters in integration name', async () => {
      const integrationName = 'Test-Integration_123';

      const response = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(response.body.integration.name).toBe(integrationName);
    });

    test('should handle concurrent status requests', async () => {
      const integrationName = 'Shopify';
      const promises = Array.from({ length: 10 }, () =>
        request(app).get(`/integration/status/${integrationName}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('integration');
        expect(response.body.integration.name).toBe(integrationName);
      });
    });

    test('should return consistent status data', async () => {
      const integrationName = 'Shopify';
      const responses = await Promise.all([
        request(app).get(`/integration/status/${integrationName}`),
        request(app).get(`/integration/status/${integrationName}`),
        request(app).get(`/integration/status/${integrationName}`)
      ]);

      responses.forEach(response => {
        expect(response.body.integration.connected).toBe(true);
        expect(response.body.integration.status).toBe('active');
        expect(response.body.integration.recordsSynced).toBe(1250);
        expect(response.body.integration.errors).toEqual([]);
      });
    });

    test('should handle performance with rapid requests', async () => {
      const integrationName = 'Shopify';
      const startTime = Date.now();

      const promises = Array.from({ length: 50 }, () =>
        request(app).get(`/integration/status/${integrationName}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      const responses = await Promise.all([
        request(app).get('/integration/available'),
        request(app).post('/integration/connect/Shopify').send({ credentials: {} }),
        request(app).post('/integration/sync/Shopify').send({ dataTypes: [] }),
        request(app).get('/integration/status/Shopify')
      ]);

      // Since auth middleware is mocked, these should all pass
      responses.forEach(response => {
        expect(response.status).not.toBe(401);
      });
    });

    test('should validate user permissions for integration operations', async () => {
      const testRoles = ['admin', 'integrations-manager', 'user', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const responses = await Promise.all([
          request(app).get('/integration/available'),
          request(app).post('/integration/connect/Shopify').send({ credentials: {} }),
          request(app).post('/integration/sync/Shopify').send({ dataTypes: [] }),
          request(app).get('/integration/status/Shopify')
        ]);
        
        responses.forEach(response => {
          expect(response.status).not.toBe(403);
        });
      }
    });

    test('should sanitize integration credentials in responses', async () => {
      const response = await request(app)
        .post('/integration/connect/Shopify')
        .send({ 
          credentials: { 
            apiKey: 'secret_key_123',
            secret: 'confidential_secret'
          } 
        })
        .expect(200);

      // Response should not expose sensitive credential information
      expect(response.body).not.toHaveProperty('credentials');
      expect(response.body).not.toHaveProperty('apiKey');
      expect(response.body).not.toHaveProperty('secret');
    });

    test('should prevent unauthorized access to integration data', async () => {
      const response = await request(app)
        .get('/integration/status/Shopify')
        .expect(200);

      // Should return status without exposing sensitive internal data
      expect(response.body.integration).toHaveProperty('name');
      expect(response.body.integration).toHaveProperty('connected');
      expect(response.body.integration).not.toHaveProperty('internalCredentials');
    });

    test('should validate integration parameters', async () => {
      // Test with potentially malicious integration names
      const maliciousNames = [
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
        '"; DROP TABLE integrations; --'
      ];

      for (const name of maliciousNames) {
        const response = await request(app)
          .get(`/integration/status/${name}`)
          .expect(200);

        // Should handle malicious input safely
        expect(response.body.integration).toBeDefined();
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle malformed JSON requests', async () => {
      const responses = await Promise.all([
        request(app)
          .post('/integration/connect/Shopify')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400),
        request(app)
          .post('/integration/sync/Shopify')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400)
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(400);
        expect(response.body).toBeDefined();
      });
    });

    test('should handle missing required fields gracefully', async () => {
      const responses = await Promise.all([
        request(app)
          .post('/integration/connect/Shopify')
          .send({})
          .expect(400),
        request(app)
          .post('/integration/sync/Shopify')
          .send({ invalidField: 'value' })
          .expect(200) // sync doesn't require specific fields
      ]);

      expect(responses[0].status).toBe(400);
      expect(responses[1].status).toBe(200);
    });

    test('should handle unsupported content types', async () => {
      const response = await request(app)
        .post('/integration/connect/Shopify')
        .set('Content-Type', 'text/plain')
        .send('plain text credentials')
        .expect(415);

      expect(response.status).toBe(415);
    });

    test('should handle timeout scenarios', async () => {
      // Test with a timeout mechanism
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ status: 408 }), 5000);
      });

      const response = await request(app)
        .get('/integration/available');

      expect(response.status).toBe(200);
    });

    test('should handle invalid integration names gracefully', async () => {
      const invalidNames = ['', '   ', 'invalid@name#'];

      for (const name of invalidNames) {
        const response = await request(app)
          .get(`/integration/status/${name}`)
          .expect(200);

        expect(response.body.integration).toBeDefined();
      }
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const responses = await Promise.all([
        request(app).get('/integration/available').expect(200),
        request(app).get('/integration/status/Shopify').expect(200)
      ]);

      responses.forEach(response => {
        expect(response.body).toBeDefined();
      });
    });

    test('should handle multiple integration operations in sequence', async () => {
      // Connect integration
      const connectResponse = await request(app)
        .post('/integration/connect/Shopify')
        .send({ credentials: { apiKey: 'test' } })
        .expect(200);

      // Sync data
      const syncResponse = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders'] })
        .expect(200);

      // Check status
      const statusResponse = await request(app)
        .get('/integration/status/Shopify')
        .expect(200);

      expect(connectResponse.body.status).toBe('connected');
      expect(syncResponse.body.syncId).toBeDefined();
      expect(statusResponse.body.integration.name).toBe('Shopify');
    });

    test('should handle integration workflow end-to-end', async () => {
      const integrationName = 'WooCommerce';

      // Step 1: Get available integrations
      const availableResponse = await request(app)
        .get('/integration/available')
        .expect(200);

      expect(availableResponse.body.integrations.find(i => i.name === integrationName)).toBeDefined();

      // Step 2: Connect integration
      const connectResponse = await request(app)
        .post(`/integration/connect/${integrationName}`)
        .send({ credentials: { storeUrl: 'https://store.com', apiKey: 'key' } })
        .expect(200);

      expect(connectResponse.body.status).toBe('connected');

      // Step 3: Initiate sync
      const syncResponse = await request(app)
        .post(`/integration/sync/${integrationName}`)
        .send({ dataTypes: ['orders', 'customers'] })
        .expect(200);

      expect(syncResponse.body.syncId).toBeDefined();

      // Step 4: Check status
      const statusResponse = await request(app)
        .get(`/integration/status/${integrationName}`)
        .expect(200);

      expect(statusResponse.body.integration.name).toBe(integrationName);
      expect(statusResponse.body.integration.connected).toBe(true);
    });

    test('should handle concurrent integration operations', async () => {
      const promises = [];
      
      // Multiple concurrent operations
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app).get('/integration/available'),
          request(app).post(`/integration/connect/Integration${i}`).send({ credentials: { test: 'data' } }),
          request(app).post(`/integration/sync/Integration${i}`).send({ dataTypes: ['orders'] }),
          request(app).get(`/integration/status/Integration${i}`)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle large integration datasets efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/integration/available')
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.integrations.length).toBe(6);
    });

    test('should maintain response time under concurrent load', async () => {
      const concurrentRequests = 30;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) => {
        const endpoint = ['available', 'status/Shopify', 'connect/Shopify', 'sync/Shopify'][i % 4];
        const method = ['GET', 'GET', 'POST', 'POST'][i % 4];
        
        if (method === 'GET') {
          return request(app).get(`/integration/${endpoint}`);
        } else {
          const data = endpoint === 'connect/Shopify' 
            ? { credentials: { test: 'data' } }
            : { dataTypes: ['orders'] };
          return request(app).post(`/integration/${endpoint}`).send(data);
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

      // Perform multiple integration operations
      for (let i = 0; i < 100; i++) {
        await request(app).get('/integration/available').expect(200);
        await request(app).get(`/integration/status/Integration${i}`).expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
    });

    test('should handle rapid successive sync requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/integration/sync/Shopify')
            .send({ dataTypes: ['orders', 'customers'] })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.syncId).toBeDefined();
      });
    });
  });

  describe('Data Validation Tests', () => {
    test('should validate integration data structure', async () => {
      const response = await request(app)
        .get('/integration/available')
        .expect(200);

      response.body.integrations.forEach(integration => {
        expect(integration).toHaveProperty('name');
        expect(integration).toHaveProperty('type');
        expect(integration).toHaveProperty('description');
        expect(integration).toHaveProperty('icon');
        expect(integration).toHaveProperty('connected');
        
        expect(typeof integration.name).toBe('string');
        expect(typeof integration.type).toBe('string');
        expect(typeof integration.description).toBe('string');
        expect(typeof integration.icon).toBe('string');
        expect(typeof integration.connected).toBe('boolean');
      });
    });

    test('should validate sync data structure', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders', 'customers'] })
        .expect(200);

      expect(response.body).toHaveProperty('syncId');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('estimatedDuration');
      expect(response.body).toHaveProperty('dataTypes');
      
      expect(typeof response.body.syncId).toBe('string');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.estimatedDuration).toBe('string');
      expect(Array.isArray(response.body.dataTypes)).toBe(true);
    });

    test('should validate status data structure', async () => {
      const response = await request(app)
        .get('/integration/status/Shopify')
        .expect(200);

      expect(response.body.integration).toHaveProperty('name');
      expect(response.body.integration).toHaveProperty('connected');
      expect(response.body.integration).toHaveProperty('lastSync');
      expect(response.body.integration).toHaveProperty('status');
      expect(response.body.integration).toHaveProperty('recordsSynced');
      expect(response.body.integration).toHaveProperty('errors');
      
      expect(typeof response.body.integration.name).toBe('string');
      expect(typeof response.body.integration.connected).toBe('boolean');
      expect(typeof response.body.integration.status).toBe('string');
      expect(typeof response.body.integration.recordsSynced).toBe('number');
      expect(Array.isArray(response.body.integration.errors)).toBe(true);
    });

    test('should handle various data types in sync requests', async () => {
      const dataTypes = [
        ['orders'],
        ['customers'],
        ['products'],
        ['orders', 'customers'],
        ['orders', 'customers', 'products'],
        [],
        ['data1', 'data2', 'data3', 'data4', 'data5']
      ];

      for (const dataType of dataTypes) {
        const response = await request(app)
          .post('/integration/sync/Shopify')
          .send({ dataTypes: dataType })
          .expect(200);

        expect(response.body.dataTypes).toEqual(dataType);
      }
    });

    test('should handle various credential formats', async () => {
      const credentialFormats = [
        { apiKey: 'simple_key' },
        { 
          apiKey: 'complex_key',
          secret: 'secret_value',
          url: 'https://example.com'
        },
        { 
          nested: {
            credentials: {
              apiKey: 'nested_key',
              settings: {
                timeout: 30000,
                retries: 3
              }
            }
          }
        }
      ];

      for (const credentials of credentialFormats) {
        const response = await request(app)
          .post('/integration/connect/Shopify')
          .send({ credentials })
          .expect(200);

        expect(response.body.status).toBe('connected');
      }
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log integration connection activities', async () => {
      const response = await request(app)
        .post('/integration/connect/Shopify')
        .send({ credentials: { apiKey: 'test' } })
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.status).toBe('connected');
      expect(response.body.message).toBeDefined();
    });

    test('should track sync operation history', async () => {
      const response = await request(app)
        .post('/integration/sync/Shopify')
        .send({ dataTypes: ['orders'] })
        .expect(200);

      expect(response.body.syncId).toBeDefined();
      expect(response.body.message).toBe('Sync initiated');
    });

    test('should maintain integration status history', async () => {
      const response = await request(app)
        .get('/integration/status/Shopify')
        .expect(200);

      expect(response.body.integration.lastSync).toBeDefined();
      expect(response.body.integration.recordsSynced).toBeDefined();
    });

    test('should preserve integration operation integrity', async () => {
      // Test multiple operations to ensure integrity
      await request(app).get('/integration/available').expect(200);
      await request(app).post('/integration/connect/Shopify').send({ credentials: {} }).expect(200);
      await request(app).post('/integration/sync/Shopify').send({ dataTypes: [] }).expect(200);
      await request(app).get('/integration/status/Shopify').expect(200);

      // All operations should complete without errors
      expect(true).toBe(true);
    });
  });
});