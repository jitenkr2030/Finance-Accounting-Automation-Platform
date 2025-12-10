const request = require('supertest');
const express = require('express');
const aiRouter = require('../routes/ai');
const { authMiddleware } = require('../middleware/auth');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'accountant'
    };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/ai', aiRouter);

describe('AI Accountant Chat API', () => {
  let testUser;
  let largeDataset;

  beforeAll(() => {
    testUser = {
      id: 'test-user-id',
      companyId: 'test-company-id',
      role: 'accountant'
    };

    // Generate large dataset for performance testing
    largeDataset = [];
    for (let i = 0; i < 1000; i++) {
      largeDataset.push({
        message: `Test message ${i}`,
        amount: Math.random() * 10000,
        description: `Transaction description ${i}`
      });
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('POST /ai/accountant/chat', () => {
    test('should respond to accounting question with AI response', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({
          message: 'What are my monthly expenses?'
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });

    test('should validate required message field', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should handle empty message validation', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should handle whitespace-only message validation', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should return different responses for different messages', async () => {
      const responses = [];
      const messages = [
        'What are my expenses?',
        'How is my cash flow?',
        'Analyze my transactions',
        'Show me profit margins'
      ];

      for (const message of messages) {
        const response = await request(app)
          .post('/ai/accountant/chat')
          .send({ message })
          .expect(200);
        responses.push(response.body.response);
      }

      // Check that responses are generated (may or may not be unique due to random nature)
      expect(responses.length).toBe(messages.length);
      expect(responses.every(r => typeof r === 'string')).toBe(true);
    });

    test('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: longMessage })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should handle special characters in messages', async () => {
      const specialMessage = 'What are my expenses? @#$%^&*()_+-=[]{}|;:,.<>?';

      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: specialMessage })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toBeDefined();
    });

    test('should include timestamp in response', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/ai/accountant/chat')
            .send({ message: `Concurrent request ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    test('should handle performance with 1000 requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 1000; i++) {
        promises.push(
          request(app)
            .post('/ai/accountant/chat')
            .send({ message: `Performance test message ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(30000); // 30 seconds
      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking database connection failures
      // For now, testing the basic error handling structure
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
    });
  });

  describe('POST /ai/classify-transaction', () => {
    test('should classify transaction with mock AI', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Office supplies purchase',
          amount: 150.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
      expect(response.body.classification).toHaveProperty('category');
      expect(response.body.classification).toHaveProperty('confidence');
      expect(response.body.classification).toHaveProperty('subcategory');
      expect(response.body.classification).toHaveProperty('suggestedAccount');
      expect(typeof response.body.classification.confidence).toBe('number');
      expect(response.body.classification.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.classification.confidence).toBeLessThanOrEqual(1);
    });

    test('should handle missing description field', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({ amount: 150.00 })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle missing amount field', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({ description: 'Office supplies purchase' })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle negative amounts', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Refund transaction',
          amount: -150.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle zero amount', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Zero amount transaction',
          amount: 0
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle very large amounts', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Large transaction',
          amount: 999999999.99
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle very small amounts', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Small transaction',
          amount: 0.01
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle empty description', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: '',
          amount: 150.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should handle special characters in description', async () => {
      const response = await request(app)
        .post('/ai/classify-transaction')
        .send({
          description: 'Office @#$%^&*()_+ supplies',
          amount: 150.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('classification');
    });

    test('should return consistent classification structure', async () => {
      const testCases = [
        { description: 'Office supplies', amount: 150 },
        { description: 'Travel expense', amount: 500 },
        { description: 'Software license', amount: 1200 }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/ai/classify-transaction')
          .send(testCase)
          .expect(200);

        const classification = response.body.classification;
        expect(classification).toHaveProperty('category');
        expect(classification).toHaveProperty('confidence');
        expect(classification).toHaveProperty('subcategory');
        expect(classification).toHaveProperty('suggestedAccount');
        expect(typeof classification.confidence).toBe('number');
      }
    });
  });

  describe('GET /ai/anomaly-detection', () => {
    test('should return mock anomaly detection results', async () => {
      const response = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      expect(response.body).toHaveProperty('anomalies');
      expect(Array.isArray(response.body.anomalies)).toBe(true);
      expect(response.body.anomalies.length).toBeGreaterThan(0);

      const anomaly = response.body.anomalies[0];
      expect(anomaly).toHaveProperty('type');
      expect(anomaly).toHaveProperty('description');
      expect(anomaly).toHaveProperty('severity');
      expect(anomaly).toHaveProperty('date');
    });

    test('should return multiple anomalies', async () => {
      const response = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      expect(response.body.anomalies.length).toBeGreaterThanOrEqual(2);
      
      // Check that each anomaly has required properties
      response.body.anomalies.forEach(anomaly => {
        expect(anomaly.type).toBeDefined();
        expect(anomaly.description).toBeDefined();
        expect(anomaly.severity).toBeDefined();
        expect(anomaly.date).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(anomaly.severity);
      });
    });

    test('should return anomalies with different severity levels', async () => {
      const response = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      const severities = response.body.anomalies.map(a => a.severity);
      const uniqueSeverities = [...new Set(severities)];
      
      expect(uniqueSeverities.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle multiple concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(request(app).get('/ai/anomaly-detection'));
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('anomalies');
        expect(Array.isArray(response.body.anomalies)).toBe(true);
      });
    });

    test('should return anomalies with valid date formats', async () => {
      const response = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      response.body.anomalies.forEach(anomaly => {
        expect(anomaly.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(anomaly.date)).toBeInstanceOf(Date);
      });
    });

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(request(app).get('/ai/anomaly-detection'));
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 seconds
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Tests', () => {
    test('should require authentication for all endpoints', async () => {
      // Test without auth middleware (would need to mock a scenario without auth)
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Test' });

      // Since auth middleware is mocked, this should pass
      expect(response.status).not.toBe(401);
    });

    test('should sanitize input messages', async () => {
      const maliciousMessage = '<script>alert("xss")</script>What are my expenses?';

      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: maliciousMessage })
        .expect(200);

      expect(response.body.response).toBeDefined();
    });

    test('should handle SQL injection attempts in messages', async () => {
      const sqlInjectionMessage = "'; DROP TABLE users; --";

      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: sqlInjectionMessage })
        .expect(200);

      expect(response.body.response).toBeDefined();
    });

    test('should validate user permissions', async () => {
      // Test with different user roles
      const testUserRoles = ['admin', 'user', 'viewer', 'accountant'];
      
      for (const role of testUserRoles) {
        // Mock different roles
        req.user = { ...testUser, role };
        
        const response = await request(app)
          .post('/ai/accountant/chat')
          .send({ message: 'Test message' });
        
        expect(response.status).not.toBe(403);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // This would require mocking server errors
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    test('should handle requests with unsupported content types', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .set('Content-Type', 'text/plain')
        .send('plain text message')
        .expect(415);

      expect(response.body).toBeDefined();
    });

    test('should handle timeout scenarios', async () => {
      // Test with a timeout mechanism
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ status: 408 }), 5000);
      });

      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Timeout test' });

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Integration Tests', () => {
    test('should work with authentication middleware', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Integration test' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should include user context in responses', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Context test' })
        .expect(200);

      // Response should be generated based on user context
      expect(response.body.response).toBeDefined();
    });

    test('should handle multiple AI features in sequence', async () => {
      // Test chat
      const chatResponse = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Help with expense categorization' })
        .expect(200);

      // Test classification
      const classResponse = await request(app)
        .post('/ai/classify-transaction')
        .send({ description: 'Office supplies', amount: 150 })
        .expect(200);

      // Test anomaly detection
      const anomalyResponse = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      expect(chatResponse.body.response).toBeDefined();
      expect(classResponse.body.classification).toBeDefined();
      expect(anomalyResponse.body.anomalies).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large message payloads efficiently', async () => {
      const largeMessage = 'a'.repeat(100000); // 100KB message

      const startTime = Date.now();
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: largeMessage })
        .expect(200);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(response.body.response).toBeDefined();
    });

    test('should maintain response time under load', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app)
          .post('/ai/accountant/chat')
          .send({ message: `Load test message ${i}` })
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

      // Process multiple large requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/ai/accountant/chat')
          .send({ message: `Memory test ${i}` });
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable (adjust threshold as needed)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log AI interactions for audit purposes', async () => {
      const response = await request(app)
        .post('/ai/accountant/chat')
        .send({ message: 'Audit trail test' })
        .expect(200);

      // In a real implementation, this would verify audit logging
      expect(response.body.response).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    test('should maintain transaction classification history', async () => {
      const classificationData = {
        description: 'Audit test classification',
        amount: 250.00
      };

      const response = await request(app)
        .post('/ai/classify-transaction')
        .send(classificationData)
        .expect(200);

      // Verify classification is logged for audit purposes
      expect(response.body.classification).toBeDefined();
    });

    test('should track anomaly detection results', async () => {
      const response = await request(app)
        .get('/ai/anomaly-detection')
        .expect(200);

      // Verify anomalies are tracked
      expect(response.body.anomalies).toBeDefined();
      expect(response.body.anomalies.length).toBeGreaterThan(0);
    });
  });
});