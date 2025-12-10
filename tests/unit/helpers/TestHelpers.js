const request = require('supertest');
const jwt = require('jsonwebtoken');

class TestHelpers {
  constructor(app) {
    this.app = app;
  }

  // Create authenticated request
  async authenticatedRequest(method, url, user, data = {}) {
    const token = jwt.sign(
      { 
        userId: user._id, 
        companyId: user.companyId, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const req = request(this.app)[method](url)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    if (Object.keys(data).length > 0) {
      req.send(data);
    }

    return req;
  }

  // Helper to create test data
  async createTestData() {
    const testUtils = global.testUtils;
    
    const company = await testUtils.createTestCompany();
    const user = await testUtils.createTestUser({ companyId: company._id });
    
    return { company, user };
  }

  // Assert response structure
  assertResponseStructure(res, expectedFields = []) {
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body.success).toBe(true);
    
    if (expectedFields.length > 0) {
      expectedFields.forEach(field => {
        expect(res.body.data).toHaveProperty(field);
      });
    }
  }

  // Assert error response
  assertErrorResponse(res, expectedStatus, expectedMessage) {
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.status).toBe(expectedStatus);
    expect(res.body.error.message).toBe(expectedMessage);
  }

  // Wait for database operations
  async waitForDB() {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Clean up test data
  async cleanup() {
    const collections = require('mongoose').connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}

module.exports = TestHelpers;