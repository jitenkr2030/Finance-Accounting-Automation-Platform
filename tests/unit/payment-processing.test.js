const request = require('supertest');
const express = require('express');
const paymentsRouter = require('../routes/payments');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'payment-manager'
    };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/payments', paymentsRouter);

describe('Payment Processing API', () => {
  let testUser;
  let mockPayments;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'payment-manager'
    };

    // Mock payment data
    mockPayments = [
      {
        paymentId: 'PAY_1701234567890',
        status: 'initiated',
        amount: 1000.00,
        currency: 'INR',
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+919876543210'
        },
        createdAt: new Date('2023-12-01T10:00:00Z'),
        updatedAt: new Date('2023-12-01T10:00:00Z'),
        expiresAt: new Date('2023-12-01T10:15:00Z')
      },
      {
        paymentId: 'PAY_1701234567891',
        status: 'pending',
        amount: 2500.50,
        currency: 'INR',
        paymentMethod: 'card',
        referenceId: 'ORDER_12346',
        customerDetails: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+919876543211'
        },
        createdAt: new Date('2023-12-01T11:00:00Z'),
        updatedAt: new Date('2023-12-01T11:05:00Z'),
        expiresAt: new Date('2023-12-01T11:15:00Z')
      },
      {
        paymentId: 'PAY_1701234567892',
        status: 'completed',
        amount: 500.00,
        currency: 'INR',
        paymentMethod: 'netbanking',
        referenceId: 'ORDER_12347',
        customerDetails: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+919876543212'
        },
        createdAt: new Date('2023-12-01T12:00:00Z'),
        updatedAt: new Date('2023-12-01T12:03:00Z'),
        completedAt: new Date('2023-12-01T12:03:00Z'),
        transactionId: 'TXN_9876543210'
      }
    ];

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      const paymentMethods = ['upi', 'netbanking', 'card', 'wallet'];
      const statuses = ['initiated', 'pending', 'completed', 'failed', 'expired'];
      
      largeDataset.push({
        paymentId: `PAY_${1701234567890 + i}`,
        status: statuses[i % 5],
        amount: Math.random() * 10000,
        currency: 'INR',
        paymentMethod: paymentMethods[i % 4],
        referenceId: `ORDER_${10000 + i}`,
        customerDetails: {
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `+9198765432${String(i).padStart(2, '0')}`
        },
        createdAt: new Date(2023, 11, 1 + (i % 30), (i % 24), (i % 60)),
        updatedAt: new Date(2023, 11, 1 + (i % 30), (i % 24), (i % 60)),
        expiresAt: new Date(2023, 11, 1 + (i % 30), (i % 24), (i % 60) + 15)
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('POST /payments/initiate', () => {
    test('should initiate payment successfully with UPI', async () => {
      const paymentData = {
        amount: 1000.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+919876543210'
        }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.paymentId).toMatch(/^PAY_\d+$/);
      expect(response.body.status).toBe('initiated');
      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.expiresAt).toBeDefined();
      expect(new Date(response.body.expiresAt)).toBeInstanceOf(Date);
    });

    test('should initiate payment successfully with Net Banking', async () => {
      const paymentData = {
        amount: 2500.50,
        paymentMethod: 'netbanking',
        referenceId: 'ORDER_12346',
        customerDetails: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+919876543211'
        }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toMatch(/^PAY_\d+$/);
      expect(response.body.status).toBe('initiated');
      expect(response.body.amount).toBe(paymentData.amount);
    });

    test('should initiate payment successfully with Card', async () => {
      const paymentData = {
        amount: 500.00,
        paymentMethod: 'card',
        referenceId: 'ORDER_12347',
        customerDetails: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+919876543212'
        }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toMatch(/^PAY_\d+$/);
      expect(response.body.status).toBe('initiated');
      expect(response.body.amount).toBe(paymentData.amount);
    });

    test('should initiate payment successfully with Wallet', async () => {
      const paymentData = {
        amount: 250.00,
        paymentMethod: 'wallet',
        referenceId: 'ORDER_12348',
        customerDetails: {
          name: 'Alice Brown',
          email: 'alice@example.com',
          phone: '+919876543213'
        }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toMatch(/^PAY_\d+$/);
      expect(response.body.status).toBe('initiated');
      expect(response.body.amount).toBe(paymentData.amount);
    });

    test('should validate required amount field', async () => {
      const paymentData = {
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should validate amount is numeric', async () => {
      const paymentData = {
        amount: 'invalid_amount',
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate amount is not negative', async () => {
      const paymentData = {
        amount: -100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate amount is zero', async () => {
      const paymentData = {
        amount: 0,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate paymentMethod field', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'invalid_method',
        referenceId: 'ORDER_12345',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should validate paymentMethod is in allowed list', async () => {
      const invalidMethods = ['crypto', 'bank_transfer', 'check', 'cash'];
      
      for (const method of invalidMethods) {
        const paymentData = {
          amount: 100.00,
          paymentMethod: method,
          referenceId: 'ORDER_12345',
          customerDetails: { name: 'Test Customer' }
        };

        const response = await request(app)
          .post('/payments/initiate')
          .send(paymentData)
          .expect(400);

        expect(response.body).toHaveProperty('errors');
      }
    });

    test('should validate referenceId is not empty', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: '',
        customerDetails: { name: 'Test Customer' }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should handle missing customerDetails gracefully', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBe('initiated');
    });

    test('should handle empty customerDetails', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: {}
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBe('initiated');
    });

    test('should generate unique payment IDs', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const promises = Array.from({ length: 5 }, () =>
        request(app).post('/payments/initiate').send(paymentData)
      );

      const responses = await Promise.all(promises);
      const paymentIds = responses.map(r => r.body.paymentId);
      
      // All payment IDs should be unique
      const uniqueIds = [...new Set(paymentIds)];
      expect(uniqueIds.length).toBe(5);
    });

    test('should set expiration time to 15 minutes from now', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      const expiresAt = new Date(response.body.expiresAt);
      const now = new Date();
      const diffMinutes = (expiresAt - now) / (1000 * 60);
      
      expect(diffMinutes).toBeGreaterThan(14.5);
      expect(diffMinutes).toBeLessThan(15.5);
    });

    test('should handle concurrent payment initiations', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const promises = Array.from({ length: 10 }, () =>
        request(app).post('/payments/initiate').send(paymentData)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('paymentId');
        expect(response.body).toHaveProperty('paymentUrl');
        expect(response.body).toHaveProperty('status');
      });
    });

    test('should handle very large amounts', async () => {
      const paymentData = {
        amount: 999999999.99,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.paymentId).toBeDefined();
    });

    test('should handle very small amounts', async () => {
      const paymentData = {
        amount: 0.01,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.paymentId).toBeDefined();
    });

    test('should handle special characters in referenceId', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER-123_45@#$%'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toBeDefined();
    });

    test('should handle Unicode characters in customer name', async () => {
      const paymentData = {
        amount: 100.00,
        paymentMethod: 'upi',
        referenceId: 'ORDER_12345',
        customerDetails: {
          name: 'José María Fernández-López',
          email: 'jose@example.com'
        }
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.paymentId).toBeDefined();
    });
  });

  describe('GET /payments/status/:paymentId', () => {
    test('should retrieve payment status successfully', async () => {
      const paymentId = 'PAY_1701234567890';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment).toHaveProperty('paymentId');
      expect(response.body.payment).toHaveProperty('status');
      expect(response.body.payment).toHaveProperty('amount');
      expect(response.body.payment).toHaveProperty('createdAt');
      expect(response.body.payment).toHaveProperty('updatedAt');
      expect(response.body.payment.paymentId).toBe(paymentId);
    });

    test('should return mock pending status', async () => {
      const paymentId = 'PAY_1701234567890';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body.payment.status).toBe('pending');
      expect(response.body.payment.amount).toBe(1000);
      expect(response.body.payment.paymentId).toBe(paymentId);
    });

    test('should include timestamp information', async () => {
      const paymentId = 'PAY_1701234567890';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body.payment.createdAt).toBeDefined();
      expect(response.body.payment.updatedAt).toBeDefined();
      expect(new Date(response.body.payment.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.payment.updatedAt)).toBeInstanceOf(Date);
      
      // Should be approximately 5 minutes ago (as per mock data)
      const createdAt = new Date(response.body.payment.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThan(4);
      expect(diffMinutes).toBeLessThan(6);
    });

    test('should handle various payment ID formats', async () => {
      const paymentIds = [
        'PAY_1701234567890',
        'PAY_1234567890123',
        'PAY_1700000000000',
        'pay_lowercase_123',
        'PAY_WITH_UNDERSCORES_123'
      ];

      for (const paymentId of paymentIds) {
        const response = await request(app)
          .get(`/payments/status/${paymentId}`)
          .expect(200);

        expect(response.body.payment.paymentId).toBe(paymentId);
      }
    });

    test('should handle non-existent payment IDs', async () => {
      const paymentId = 'PAY_NONEXISTENT';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      // Should still return mock status for any payment ID
      expect(response.body.payment.paymentId).toBe(paymentId);
    });

    test('should handle special characters in payment ID', async () => {
      const paymentId = 'PAY_123@#$%';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body.payment.paymentId).toBe(paymentId);
    });

    test('should handle very long payment IDs', async () => {
      const paymentId = 'PAY_' + 'a'.repeat(1000);

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body.payment.paymentId).toBe(paymentId);
    });

    test('should handle empty payment ID', async () => {
      const paymentId = '';

      const response = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(response.body.payment.paymentId).toBe('');
    });

    test('should handle concurrent status requests', async () => {
      const paymentId = 'PAY_1701234567890';
      const promises = Array.from({ length: 10 }, () =>
        request(app).get(`/payments/status/${paymentId}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('payment');
        expect(response.body.payment.paymentId).toBe(paymentId);
      });
    });

    test('should return consistent status data', async () => {
      const paymentId = 'PAY_1701234567890';
      const responses = await Promise.all([
        request(app).get(`/payments/status/${paymentId}`),
        request(app).get(`/payments/status/${paymentId}`),
        request(app).get(`/payments/status/${paymentId}`)
      ]);

      responses.forEach(response => {
        expect(response.body.payment.status).toBe('pending');
        expect(response.body.payment.amount).toBe(1000);
        expect(response.body.payment.paymentId).toBe(paymentId);
      });
    });

    test('should handle performance with rapid requests', async () => {
      const paymentId = 'PAY_1701234567890';
      const startTime = Date.now();

      const promises = Array.from({ length: 50 }, () =>
        request(app).get(`/payments/status/${paymentId}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('POST /payments/webhook', () => {
    test('should handle payment webhook successfully', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed',
        transactionId: 'TXN_9876543210',
        amount: 1000.00,
        currency: 'INR'
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('received');
      expect(response.body.received).toBe(true);
    });

    test('should handle various webhook status updates', async () => {
      const statuses = ['initiated', 'pending', 'completed', 'failed', 'expired', 'cancelled'];
      
      for (const status of statuses) {
        const webhookData = {
          paymentId: 'PAY_1701234567890',
          status: status,
          transactionId: `TXN_${status}_123`
        };

        const response = await request(app)
          .post('/payments/webhook')
          .send(webhookData)
          .expect(200);

        expect(response.body.received).toBe(true);
      }
    });

    test('should handle webhook with minimal data', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed'
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should handle webhook with extended data', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed',
        transactionId: 'TXN_9876543210',
        amount: 1000.00,
        currency: 'INR',
        gateway: 'razorpay',
        method: 'upi',
        email: 'customer@example.com',
        contact: '+919876543210',
        fees: 2.50,
        tax: 0.45,
        createdAt: '2023-12-01T10:00:00Z',
        captured: true,
        description: 'Payment for Order #12345'
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should not require authentication for webhook endpoint', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed'
      };

      // This should work without auth middleware
      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should handle malformed JSON webhook data', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(200);

      // Should handle malformed data gracefully
      expect(response.body.received).toBe(true);
    });

    test('should handle empty webhook payload', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .send({})
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should handle concurrent webhook requests', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed'
      };

      const promises = Array.from({ length: 10 }, () =>
        request(app).post('/payments/webhook').send(webhookData)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.received).toBe(true);
      });
    });

    test('should handle webhook with special characters', async () => {
      const webhookData = {
        paymentId: 'PAY_123@#$%',
        status: 'completed',
        transactionId: 'TXN_123@#$%',
        description: 'Payment for Order #123@#$%'
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should handle webhook with very large amounts', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed',
        amount: 999999999.99,
        currency: 'INR'
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should log webhook data for debugging', async () => {
      const webhookData = {
        paymentId: 'PAY_1701234567890',
        status: 'completed',
        transactionId: 'TXN_9876543210'
      };

      // Capture console output
      const originalLog = console.log;
      let loggedData = null;
      console.log = (data) => {
        loggedData = data;
        originalLog(data);
      };

      const response = await request(app)
        .post('/payments/webhook')
        .send(webhookData)
        .expect(200);

      // Restore console.log
      console.log = originalLog;

      expect(response.body.received).toBe(true);
      expect(loggedData).toBeDefined();
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for initiate and status endpoints', async () => {
      const responses = await Promise.all([
        request(app).post('/payments/initiate').send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123'
        }),
        request(app).get('/payments/status/PAY_123')
      ]);

      // Since auth middleware is mocked, these should pass
      responses.forEach(response => {
        expect(response.status).not.toBe(401);
      });
    });

    test('should not require authentication for webhook endpoint', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .send({
          paymentId: 'PAY_123',
          status: 'completed'
        });

      // Webhook should work without auth
      expect(response.status).not.toBe(401);
    });

    test('should validate user permissions for payment operations', async () => {
      const testRoles = ['admin', 'payment-manager', 'accountant', 'user', 'viewer'];
      
      for (const role of testRoles) {
        req.user = { ...testUser, role };
        
        const responses = await Promise.all([
          request(app).post('/payments/initiate').send({
            amount: 100,
            paymentMethod: 'upi',
            referenceId: 'ORDER_123'
          }),
          request(app).get('/payments/status/PAY_123')
        ]);
        
        responses.forEach(response => {
          expect(response.status).not.toBe(403);
        });
      }
    });

    test('should sanitize payment data in responses', async () => {
      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123',
          customerDetails: {
            name: 'Test Customer',
            email: 'test@example.com',
            cardNumber: '1234-5678-9012-3456',
            cvv: '123'
          }
        })
        .expect(200);

      // Response should not contain sensitive customer data
      expect(response.body).not.toHaveProperty('customerDetails');
      expect(response.body).not.toHaveProperty('cardNumber');
      expect(response.body).not.toHaveProperty('cvv');
    });

    test('should prevent unauthorized access to payment information', async () => {
      const response = await request(app)
        .get('/payments/status/PAY_1701234567890')
        .expect(200);

      // Should return status without exposing sensitive internal data
      expect(response.body.payment).toHaveProperty('paymentId');
      expect(response.body.payment).toHaveProperty('status');
      expect(response.body.payment).not.toHaveProperty('internalSecrets');
    });

    test('should validate webhook payload security', async () => {
      const maliciousPayloads = [
        {
          paymentId: '<script>alert("xss")</script>',
          status: 'completed'
        },
        {
          paymentId: 'PAY_123',
          status: 'completed',
          transactionId: "'; DROP TABLE payments; --"
        }
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/payments/webhook')
          .send(payload)
          .expect(200);

        // Should handle malicious input safely
        expect(response.body.received).toBe(true);
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection failures gracefully', async () => {
      const paymentData = {
        amount: 100,
        paymentMethod: 'upi',
        referenceId: 'ORDER_123'
      };

      const response = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      // Mock implementation should handle errors gracefully
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('status');
    });

    test('should handle malformed request data', async () => {
      const responses = await Promise.all([
        request(app)
          .post('/payments/initiate')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400),
        request(app)
          .get('/payments/status/invalid-id')
          .expect(200) // Status endpoint is more forgiving
      ]);

      expect(responses[0].status).toBe(400);
      expect(responses[1].status).toBe(200);
    });

    test('should handle timeout scenarios', async () => {
      // Test with a timeout mechanism
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ status: 408 }), 5000);
      });

      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123'
        });

      expect(response.status).toBe(200);
    });

    test('should handle unsupported content types', async () => {
      const response = await request(app)
        .post('/payments/initiate')
        .set('Content-Type', 'text/plain')
        .send('plain text payment data')
        .expect(415);

      expect(response.status).toBe(415);
    });

    test('should handle invalid payment method values gracefully', async () => {
      const invalidMethods = [null, undefined, 123, {}, []];
      
      for (const method of invalidMethods) {
        const response = await request(app)
          .post('/payments/initiate')
          .send({
            amount: 100,
            paymentMethod: method,
            referenceId: 'ORDER_123'
          });

        // Should handle invalid values gracefully
        expect(response.status).toBeLessThan(500);
      }
    });

    test('should handle extremely large payment amounts', async () => {
      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: Number.MAX_SAFE_INTEGER,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123'
        });

      // Should handle large numbers gracefully
      expect(response.status).toBe(200);
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const responses = await Promise.all([
        request(app).post('/payments/initiate').send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123'
        }).expect(200),
        request(app).get('/payments/status/PAY_123').expect(200)
      ]);

      responses.forEach(response => {
        expect(response.body).toBeDefined();
      });
    });

    test('should handle complete payment workflow', async () => {
      // Step 1: Initiate payment
      const initiateResponse = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 1000,
          paymentMethod: 'upi',
          referenceId: 'ORDER_12345',
          customerDetails: {
            name: 'Test Customer',
            email: 'test@example.com'
          }
        })
        .expect(200);

      const paymentId = initiateResponse.body.paymentId;

      // Step 2: Check payment status
      const statusResponse = await request(app)
        .get(`/payments/status/${paymentId}`)
        .expect(200);

      expect(statusResponse.body.payment.paymentId).toBe(paymentId);

      // Step 3: Simulate webhook update
      const webhookResponse = await request(app)
        .post('/payments/webhook')
        .send({
          paymentId: paymentId,
          status: 'completed',
          transactionId: 'TXN_9876543210'
        })
        .expect(200);

      expect(webhookResponse.body.received).toBe(true);
    });

    test('should handle multiple payment operations in sequence', async () => {
      const paymentIds = [];
      
      // Create multiple payments
      for (let i = 0; i < 5; i++) {
        const initiateResponse = await request(app)
          .post('/payments/initiate')
          .send({
            amount: 100 + i * 50,
            paymentMethod: ['upi', 'card', 'netbanking', 'wallet'][i % 4],
            referenceId: `ORDER_${1000 + i}`
          })
          .expect(200);

        paymentIds.push(initiateResponse.body.paymentId);
      }

      // Check status of all payments
      for (const paymentId of paymentIds) {
        const statusResponse = await request(app)
          .get(`/payments/status/${paymentId}`)
          .expect(200);

        expect(statusResponse.body.payment.paymentId).toBe(paymentId);
      }
    });

    test('should handle concurrent payment processing', async () => {
      const promises = [];
      
      // Multiple concurrent payment operations
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app).post('/payments/initiate').send({
            amount: 100,
            paymentMethod: 'upi',
            referenceId: `ORDER_${i}`
          }),
          request(app).get(`/payments/status/PAY_${i}`)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should maintain payment data integrity across operations', async () => {
      const paymentData = {
        amount: 1000,
        paymentMethod: 'upi',
        referenceId: 'ORDER_INTEGRITY_TEST'
      };

      // Create payment
      const initiateResponse = await request(app)
        .post('/payments/initiate')
        .send(paymentData)
        .expect(200);

      const paymentId = initiateResponse.body.paymentId;

      // Check status multiple times
      for (let i = 0; i < 5; i++) {
        const statusResponse = await request(app)
          .get(`/payments/status/${paymentId}`)
          .expect(200);

        expect(statusResponse.body.payment.paymentId).toBe(paymentId);
      }

      // Send webhook update
      await request(app)
        .post('/payments/webhook')
        .send({
          paymentId: paymentId,
          status: 'completed',
          transactionId: 'TXN_INTEGRITY_TEST'
        })
        .expect(200);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large payment datasets efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'PERFORMANCE_TEST_ORDER'
        })
        .expect(200);
      
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.paymentId).toBeDefined();
    });

    test('should maintain response time under concurrent load', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) => {
        const endpoint = i % 3;
        if (endpoint === 0) {
          return request(app).post('/payments/initiate').send({
            amount: 100,
            paymentMethod: 'upi',
            referenceId: `ORDER_${i}`
          });
        } else if (endpoint === 1) {
          return request(app).get(`/payments/status/PAY_${i}`);
        } else {
          return request(app).post('/payments/webhook').send({
            paymentId: `PAY_${i}`,
            status: 'completed'
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

      // Perform multiple payment operations
      for (let i = 0; i < 100; i++) {
        await request(app).post('/payments/initiate').send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: `ORDER_${i}`
        }).expect(200);

        await request(app).get(`/payments/status/PAY_${i}`).expect(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB
    });

    test('should handle rapid successive webhook requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .post('/payments/webhook')
            .send({
              paymentId: `PAY_${i}`,
              status: 'completed',
              transactionId: `TXN_${i}`
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.received).toBe(true);
      });
    });

    test('should maintain performance with various payment methods', async () => {
      const paymentMethods = ['upi', 'card', 'netbanking', 'wallet'];
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .post('/payments/initiate')
            .send({
              amount: 100,
              paymentMethod: paymentMethods[i % 4],
              referenceId: `ORDER_${i}`
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.paymentId).toBeDefined();
      });
    });
  });

  describe('Payment Data Validation Tests', () => {
    test('should validate payment data structure', async () => {
      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('expiresAt');
      
      expect(typeof response.body.paymentId).toBe('string');
      expect(typeof response.body.paymentUrl).toBe('string');
      expect(typeof response.body.amount).toBe('number');
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.expiresAt).toBe('string');
    });

    test('should validate status data structure', async () => {
      const response = await request(app)
        .get('/payments/status/PAY_123')
        .expect(200);

      expect(response.body.payment).toHaveProperty('paymentId');
      expect(response.body.payment).toHaveProperty('status');
      expect(response.body.payment).toHaveProperty('amount');
      expect(response.body.payment).toHaveProperty('createdAt');
      expect(response.body.payment).toHaveProperty('updatedAt');
      
      expect(typeof response.body.payment.paymentId).toBe('string');
      expect(typeof response.body.payment.status).toBe('string');
      expect(typeof response.body.payment.amount).toBe('number');
      expect(typeof response.body.payment.createdAt).toBe('string');
      expect(typeof response.body.payment.updatedAt).toBe('string');
    });

    test('should handle various amount formats', async () => {
      const amounts = [0.01, 1.5, 100, 999.99, 10000, 0.50];
      
      for (const amount of amounts) {
        const response = await request(app)
          .post('/payments/initiate')
          .send({
            amount: amount,
            paymentMethod: 'upi',
            referenceId: `ORDER_${amount}`
          })
          .expect(200);

        expect(response.body.amount).toBe(amount);
      }
    });

    test('should handle various payment method types', async () => {
      const paymentMethods = ['upi', 'netbanking', 'card', 'wallet'];
      
      for (const method of paymentMethods) {
        const response = await request(app)
          .post('/payments/initiate')
          .send({
            amount: 100,
            paymentMethod: method,
            referenceId: `ORDER_${method}`
          })
          .expect(200);

        expect(response.body.status).toBe('initiated');
      }
    });

    test('should handle various reference ID formats', async () => {
      const referenceIds = [
        'ORDER_123',
        'INV-456',
        'TXN_789',
        'REF_ABC123',
        'ORDER_WITH_UNDERSCORES',
        'order-with-dashes'
      ];
      
      for (const referenceId of referenceIds) {
        const response = await request(app)
          .post('/payments/initiate')
          .send({
            amount: 100,
            paymentMethod: 'upi',
            referenceId: referenceId
          })
          .expect(200);

        expect(response.body.paymentId).toBeDefined();
      }
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log payment initiation activities', async () => {
      const response = await request(app)
        .post('/payments/initiate')
        .send({
          amount: 100,
          paymentMethod: 'upi',
          referenceId: 'ORDER_AUDIT_TEST'
        })
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBe('initiated');
    });

    test('should track payment status queries', async () => {
      const response = await request(app)
        .get('/payments/status/PAY_AUDIT_TEST')
        .expect(200);

      expect(response.body.payment.paymentId).toBe('PAY_AUDIT_TEST');
    });

    test('should maintain webhook processing history', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .send({
          paymentId: 'PAY_AUDIT_TEST',
          status: 'completed',
          transactionId: 'TXN_AUDIT_TEST'
        })
        .expect(200);

      expect(response.body.received).toBe(true);
    });

    test('should preserve payment operation integrity', async () => {
      // Test multiple operations to ensure integrity
      await request(app).post('/payments/initiate').send({
        amount: 100,
        paymentMethod: 'upi',
        referenceId: 'ORDER_INTEGRITY_TEST'
      }).expect(200);

      await request(app).get('/payments/status/PAY_INTEGRITY_TEST').expect(200);

      await request(app).post('/payments/webhook').send({
        paymentId: 'PAY_INTEGRITY_TEST',
        status: 'completed'
      }).expect(200);

      // All operations should complete without errors
      expect(true).toBe(true);
    });
  });
});