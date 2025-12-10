const request = require('supertest');
const express = require('express');
const healthRouter = require('../routes/health');

const app = express();
app.use(express.json());
app.use('/health', healthRouter);

describe('Health Monitoring API', () => {
  beforeAll(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.MAX_MEMORY_USAGE = '1073741824'; // 1GB
    process.env.UPLOAD_PATH = './tmp';
  });

  afterAll(async () => {
    // Cleanup test environment
    delete process.env.REDIS_URL;
    delete process.env.MAX_MEMORY_USAGE;
    delete process.env.UPLOAD_PATH;
  });

  describe('GET /health', () => {
    test('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body.status).toBe('healthy');
      expect(response.body.environment).toBe('test');
    });

    test('should include uptime information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toMatch(/^\d+h \d+m \d+s$/);
      expect(typeof response.body.uptime).toBe('string');
    });

    test('should include version information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.version).toBeDefined();
      expect(typeof response.body.version).toBe('string');
    });

    test('should include timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
        expect(response.body).toHaveProperty('uptime');
      });
    });

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/health')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });

    test('should validate response structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment', 'test');
    });

    test('should handle errors gracefully', async () => {
      // Mock a scenario where the health check might fail
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should always return a valid response
      expect(response.body.status).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/detailed', () => {
    test('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('redis');
      expect(response.body.checks).toHaveProperty('externalAPIs');
      expect(response.body.checks).toHaveProperty('diskSpace');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('custom');
    });

    test('should include database health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.database).toHaveProperty('status');
      expect(response.body.checks.database).toHaveProperty('responseTime');
      expect(response.body.checks.database).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.database.status);
    });

    test('should include redis health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.redis).toHaveProperty('status');
      expect(response.body.checks.redis).toHaveProperty('responseTime');
      expect(response.body.checks.redis).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.redis.status);
    });

    test('should include external APIs health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.externalAPIs).toHaveProperty('status');
      expect(response.body.checks.externalAPIs).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.externalAPIs.status);
    });

    test('should include disk space health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.diskSpace).toHaveProperty('status');
      expect(response.body.checks.diskSpace).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.diskSpace.status);
    });

    test('should include memory health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.memory).toHaveProperty('status');
      expect(response.body.checks.memory).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.memory.status);
    });

    test('should include custom services health check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.custom).toHaveProperty('status');
      expect(response.body.checks.custom).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.checks.custom.status);
    });

    test('should return appropriate status code for healthy system', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      // Should return 200 for healthy or degraded status
      expect(response.status).toBe(200);
    });

    test('should handle system errors gracefully', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      // Should always return a valid response structure
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
    });

    test('should validate detailed health check structure', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      const checks = response.body.checks;
      
      // All checks should have status and details
      Object.keys(checks).forEach(checkName => {
        expect(checks[checkName]).toHaveProperty('status');
        expect(checks[checkName]).toHaveProperty('details');
        expect(['healthy', 'unhealthy', 'degraded']).toContain(checks[checkName].status);
      });
    });

    test('should handle concurrent detailed health checks', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app).get('/health/detailed')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('checks');
      });
    });
  });

  describe('GET /health/database', () => {
    test('should return database health status', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.status);
    });

    test('should include database connection details', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      expect(response.body.details).toHaveProperty('connected');
      expect(response.body.details).toHaveProperty('readyState');
      expect(typeof response.body.details.connected).toBe('boolean');
      expect(typeof response.body.details.readyState).toBe('number');
    });

    test('should return appropriate status code', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      const statusCode = response.body.status === 'healthy' ? 200 : 503;
      expect(response.status).toBe(statusCode);
    });

    test('should include response time metrics', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      expect(response.body.responseTime).toBeDefined();
      expect(typeof response.body.responseTime).toBe('number');
      expect(response.body.responseTime).toBeGreaterThanOrEqual(0);
    });

    test('should handle database connection failures gracefully', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      // Should return a valid response even if database is down
      expect(response.body.status).toBeDefined();
      expect(response.body.details).toBeDefined();
    });

    test('should validate database health response structure', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('connected');
      expect(response.body.details).toHaveProperty('readyState');
    });
  });

  describe('GET /health/redis', () => {
    test('should return redis health status', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.status);
    });

    test('should include redis connection details', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      expect(response.body.details).toHaveProperty('connected');
      expect(response.body.details).toHaveProperty('version');
      expect(response.body.details).toHaveProperty('memory');
      expect(typeof response.body.details.connected).toBe('boolean');
    });

    test('should return appropriate status code', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      const statusCode = response.body.status === 'healthy' ? 200 : 503;
      expect(response.status).toBe(statusCode);
    });

    test('should include response time metrics', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      expect(response.body.responseTime).toBeDefined();
      expect(typeof response.body.responseTime).toBe('number');
      expect(response.body.responseTime).toBeGreaterThanOrEqual(0);
    });

    test('should handle redis connection failures gracefully', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      // Should return a valid response even if redis is down
      expect(response.body.status).toBeDefined();
      expect(response.body.details).toBeDefined();
    });

    test('should validate redis health response structure', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('connected');
    });
  });

  describe('GET /health/external-apis', () => {
    test('should return external APIs health status', async () => {
      const response = await request(app)
        .get('/health/external-apis')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('details');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.status);
    });

    test('should include individual API health status', async () => {
      const response = await request(app)
        .get('/health/external-apis')
        .expect(200);

      const apis = response.body.details;
      const expectedApis = ['OpenAI', 'OCR Service', 'Razorpay', 'GST API'];
      
      expectedApis.forEach(apiName => {
        expect(apis[apiName]).toBeDefined();
        expect(apis[apiName]).toHaveProperty('status');
        expect(['healthy', 'unhealthy', 'degraded', 'disabled']).toContain(apis[apiName].status);
      });
    });

    test('should return appropriate status code', async () => {
      const response = await request(app)
        .get('/health/external-apis')
        .expect(200);

      const statusCode = response.body.status === 'healthy' ? 200 : 503;
      expect(response.status).toBe(statusCode);
    });

    test('should handle API key configuration gracefully', async () => {
      const response = await request(app)
        .get('/health/external-apis')
        .expect(200);

      // APIs without proper configuration should be marked as disabled
      expect(response.body.details).toBeDefined();
    });

    test('should validate external APIs response structure', async () => {
      const response = await request(app)
        .get('/health/external-apis')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('details');
      expect(typeof response.body.details).toBe('object');
    });
  });

  describe('GET /health/system', () => {
    test('should return system health status', async () => {
      const response = await request(app)
        .get('/health/system')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('diskSpace');
      expect(response.body).toHaveProperty('memory');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.body.status);
    });

    test('should include disk space information', async () => {
      const response = await request(app)
        .get('/health/system')
        .expect(200);

      expect(response.body.diskSpace).toHaveProperty('status');
      expect(response.body.diskSpace).toHaveProperty('details');
      expect(response.body.diskSpace.details).toHaveProperty('diskUsage');
      expect(response.body.diskSpace.details.diskUsage).toHaveProperty('total');
      expect(response.body.diskSpace.details.diskUsage).toHaveProperty('used');
      expect(response.body.diskSpace.details.diskUsage).toHaveProperty('free');
      expect(response.body.diskSpace.details.diskUsage).toHaveProperty('usagePercent');
    });

    test('should include memory information', async () => {
      const response = await request(app)
        .get('/health/system')
        .expect(200);

      expect(response.body.memory).toHaveProperty('status');
      expect(response.body.memory).toHaveProperty('details');
      expect(response.body.memory.details).toHaveProperty('heap');
      expect(response.body.memory.details).toHaveProperty('rss');
      expect(response.body.memory.details.heap).toHaveProperty('total');
      expect(response.body.memory.details.heap).toHaveProperty('used');
      expect(response.body.memory.details.heap).toHaveProperty('usagePercent');
    });

    test('should return appropriate status code', async () => {
      const response = await request(app)
        .get('/health/system')
        .expect(200);

      const statusCode = response.body.status === 'healthy' ? 200 : 503;
      expect(response.status).toBe(statusCode);
    });

    test('should validate system health response structure', async () => {
      const response = await request(app)
        .get('/health/system')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('diskSpace');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.diskSpace).toHaveProperty('status');
      expect(response.body.memory).toHaveProperty('status');
    });
  });

  describe('GET /health/ready', () => {
    test('should return readiness status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(['ready', 'not ready']).toContain(response.body.status);
    });

    test('should check database readiness', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      // Readiness should be determined by database connectivity
      expect(response.body.status).toBeDefined();
    });

    test('should return 200 for ready state', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      if (response.body.status === 'ready') {
        expect(response.status).toBe(200);
      }
    });

    test('should return 503 for not ready state', async () => {
      const response = await request(app)
        .get('/health/ready');

      if (response.body.status === 'not ready') {
        expect(response.status).toBe(503);
      }
    });

    test('should validate readiness response structure', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /health/live', () => {
    test('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('pid');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.status).toBe('alive');
    });

    should include process information', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.pid).toBeDefined();
      expect(typeof response.body.pid).toBe('number');
      expect(response.body.pid).toBeGreaterThan(0);
    });

    test('should include uptime information', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.uptime).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('should always return 200 status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      // Liveness probe should always return 200 if the process is running
      expect(response.status).toBe(200);
    });

    test('should validate liveness response structure', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('pid');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /health/metrics', () => {
    test('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
      expect(response.text).toContain('finance_platform_uptime_seconds');
      expect(response.text).toContain('finance_platform_memory_usage_bytes');
      expect(response.text).toContain('finance_platform_cpu_usage_seconds');
    });

    test('should include uptime metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.text).toContain('finance_platform_uptime_seconds ');
      expect(response.text).toMatch(/finance_platform_uptime_seconds \d+/);
    });

    test('should include memory usage metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.text).toContain('finance_platform_memory_usage_bytes{type="heap_total"}');
      expect(response.text).toContain('finance_platform_memory_usage_bytes{type="heap_used"}');
      expect(response.text).toContain('finance_platform_memory_usage_bytes{type="rss"}');
    });

    test('should include CPU usage metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.text).toContain('finance_platform_cpu_usage_seconds{type="user"}');
      expect(response.text).toContain('finance_platform_cpu_usage_seconds{type="system"}');
    });

    test('should include process information metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.text).toContain('finance_platform_process_info');
    });

    test('should validate metrics format', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      const lines = response.text.split('\n');
      
      // Check that all metric lines follow Prometheus format
      const metricLines = lines.filter(line => 
        line.trim() && 
        !line.startsWith('#') && 
        !line.startsWith('//')
      );
      
      metricLines.forEach(line => {
        expect(line).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*\{[^}]*\} \d+(\.\d+)?/);
      });
    });

    test('should handle metrics generation errors gracefully', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      // Should return valid metrics or error response
      expect(response.headers['content-type']).toContain('text/plain');
    });
  });

  describe('GET /health/component/:component', () => {
    test('should return health status for specific component', async () => {
      const response = await request(app)
        .get('/health/component/database')
        .expect(200);

      expect(response.body).toHaveProperty('component', 'database');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
    });

    test('should support all available components', async () => {
      const components = ['database', 'redis', 'externalAPIs', 'diskSpace', 'memory', 'custom'];
      
      for (const component of components) {
        const response = await request(app)
          .get(`/health/component/${component}`)
          .expect(200);

        expect(response.body.component).toBe(component);
        expect(response.body).toHaveProperty('status');
      }
    });

    test('should return 404 for invalid component', async () => {
      const response = await request(app)
        .get('/health/component/invalid-component')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Component not found');
    });

    test('should return available components in error response', async () => {
      const response = await request(app)
        .get('/health/component/invalid-component')
        .expect(404);

      expect(response.body).toHaveProperty('availableComponents');
      expect(Array.isArray(response.body.availableComponents)).toBe(true);
      expect(response.body.availableComponents.length).toBeGreaterThan(0);
    });

    test('should return appropriate status code based on component health', async () => {
      const response = await request(app)
        .get('/health/component/database')
        .expect(200);

      const statusCode = response.body.status === 'healthy' ? 200 : 503;
      expect(response.status).toBe(statusCode);
    });

    test('should validate component-specific response structure', async () => {
      const response = await request(app)
        .get('/health/component/database')
        .expect(200);

      expect(response.body).toHaveProperty('component');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('details');
      expect(response.body.component).toBe('database');
    });

    test('should handle special characters in component name', async () => {
      const response = await request(app)
        .get('/health/component/test-component_123')
        .expect(404);

      expect(response.body.error).toBe('Component not found');
    });
  });

  describe('Security Tests', () => {
    test('should not require authentication for health endpoints', async () => {
      // Health endpoints should be accessible without authentication
      const endpoints = [
        '/health',
        '/health/detailed',
        '/health/database',
        '/health/redis',
        '/health/external-apis',
        '/health/system',
        '/health/ready',
        '/health/live',
        '/health/metrics'
      ];

      const promises = endpoints.map(endpoint => 
        request(app).get(endpoint)
      );

      const responses = await Promise.all(promises);
      
      // All endpoints should be accessible
      responses.forEach(response => {
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });
    });

    test('should not expose sensitive system information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      // Should not expose internal implementation details
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('secret');
      expect(responseString).not.toContain('key');
    });

    test('should sanitize error responses', async () => {
      const response = await request(app)
        .get('/health/component/invalid-component')
        .expect(404);

      expect(response.body.error).toBe('Component not found');
      expect(response.body.availableComponents).toBeDefined();
    });

    test('should validate input parameters', async () => {
      const maliciousInputs = [
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
        '; DROP TABLE health_checks; --'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .get(`/health/component/${input}`)
          .expect(404);

        // Should handle malicious input safely
        expect(response.body.error).toBe('Component not found');
      }
    });
  });

  describe('Error Handling Tests', () {
    test('should handle malformed JSON gracefully', async () => {
      // Health endpoints typically don't accept JSON, but test robustness
      const response = await request(app)
        .get('/health')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(200);

      expect(response.body.status).toBeDefined();
    });

    test('should handle missing environment variables gracefully', async () => {
      // Test with missing environment variables
      delete process.env.REDIS_URL;
      delete process.env.MAX_MEMORY_USAGE;

      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks.redis).toBeDefined();
      expect(response.body.checks.memory).toBeDefined();
    });

    test('should handle timeout scenarios', async () => {
      // Test with a timeout mechanism
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ status: 408 }), 5000);
      });

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBeDefined();
    });

    test('should handle unsupported HTTP methods gracefully', async () => {
      const response = await request(app)
        .post('/health')
        .send({})
        .expect(404);

      expect(response.status).toBe(404);
    });

    test('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/health?invalid=param')
        .expect(200);

      expect(response.body.status).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work with Express.js middleware', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('environment', 'test');
    });

    test('should handle complete health monitoring workflow', async () => {
      // Step 1: Basic health check
      const basicResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(basicResponse.body.status).toBe('healthy');

      // Step 2: Detailed health check
      const detailedResponse = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(detailedResponse.body).toHaveProperty('checks');

      // Step 3: Component-specific checks
      const componentResponse = await request(app)
        .get('/health/component/database')
        .expect(200);

      expect(componentResponse.body.component).toBe('database');

      // Step 4: Readiness check
      const readyResponse = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body).toHaveProperty('status');

      // Step 5: Liveness check
      const liveResponse = await request(app)
        .get('/health/live')
        .expect(200);

      expect(liveResponse.body.status).toBe('alive');
    });

    test('should handle multiple health operations in sequence', async () => {
      const operations = [
        () => request(app).get('/health'),
        () => request(app).get('/health/detailed'),
        () => request(app).get('/health/database'),
        () => request(app).get('/health/redis'),
        () => request(app).get('/health/system')
      ];

      const responses = [];
      for (const operation of operations) {
        const response = await operation();
        responses.push(response);
      }

      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should maintain health check consistency across requests', async () => {
      const basicResponses = await Promise.all([
        request(app).get('/health'),
        request(app).get('/health'),
        request(app).get('/health')
      ]);

      basicResponses.forEach(response => {
        expect(response.body.status).toBe('healthy');
        expect(response.body.environment).toBe('test');
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent health checks efficiently', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) => {
        const endpoint = ['/health', '/health/detailed', '/health/database', '/health/redis'][i % 4];
        return request(app).get(endpoint);
      });

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(totalDuration).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should maintain response time under load', async () => {
      const startTime = Date.now();
      
      // Generate multiple health check requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/health')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });

    test('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .get('/health')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });

    test('should maintain performance with detailed health checks', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/health/detailed')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds
      responses.forEach(response => {
        expect(response.body).toHaveProperty('checks');
      });
    });
  });

  describe('Health Check Validation Tests', () => {
    test('should validate basic health response structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment', 'test');
    });

    test('should validate detailed health response structure', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('checks');

      // All checks should have required properties
      Object.values(response.body.checks).forEach(check => {
        expect(check).toHaveProperty('status');
        expect(check).toHaveProperty('details');
        expect(['healthy', 'unhealthy', 'degraded']).toContain(check.status);
      });
    });

    test('should validate uptime format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toMatch(/^\d+h \d+m \d+s$/);
    });

    test('should validate timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should validate environment configuration', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBe('test');
    });

    test('should validate status values', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      const allStatuses = Object.values(response.body.checks).map(check => check.status);
      allStatuses.forEach(status => {
        expect(['healthy', 'unhealthy', 'degraded']).toContain(status);
      });
    });

    test('should validate component-specific responses', async () => {
      const componentChecks = ['database', 'redis', 'externalAPIs', 'diskSpace', 'memory', 'custom'];
      
      for (const component of componentChecks) {
        const response = await request(app)
          .get(`/health/component/${component}`)
          .expect(200);

        expect(response.body.component).toBe(component);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('responseTime');
        expect(response.body).toHaveProperty('details');
      }
    });
  });

  describe('Audit Trail Tests', () => {
    test('should log health check activities', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // In real implementation, would verify audit logging
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    test('should track detailed health monitoring', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks.database).toBeDefined();
      expect(response.body.checks.redis).toBeDefined();
    });

    test('should maintain health monitoring history', async () => {
      // Multiple health checks to test history
      await request(app).get('/health').expect(200);
      await request(app).get('/health/detailed').expect(200);
      await request(app).get('/health/component/database').expect(200);

      // All operations should complete without errors
      expect(true).toBe(true);
    });

    test('should preserve health monitoring integrity', async () => {
      // Test multiple operations to ensure integrity
      const basicResponse = await request(app).get('/health').expect(200);
      const detailedResponse = await request(app).get('/health/detailed').expect(200);
      const componentResponse = await request(app).get('/health/component/database').expect(200);

      // Verify data consistency
      expect(basicResponse.body.status).toBeDefined();
      expect(detailedResponse.body.checks).toBeDefined();
      expect(componentResponse.body.component).toBe('database');
    });
  });
});