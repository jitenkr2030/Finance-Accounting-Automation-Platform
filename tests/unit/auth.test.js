const request = require('supertest');
const bcrypt = require('bcryptjs');
const TestHelpers = require('../helpers/TestHelpers');

describe('Authentication API', () => {
  let testHelpers;
  let app;

  beforeAll(() => {
    app = require('../../server');
    testHelpers = new TestHelpers(app);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new company and admin user', async () => {
      const userData = {
        companyName: 'Test Company Ltd',
        companyEmail: 'admin@testcompany.com',
        companyPhone: '+91-9876543210',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@testcompany.com',
        password: 'SecurePassword123!',
        phone: '+91-9876543210'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('company');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.company.name).toBe(userData.companyName);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        companyName: 'Test Company 2',
        companyEmail: 'duplicate@test.com',
        companyPhone: '+91-9876543210',
        firstName: 'Admin',
        lastName: 'User',
        email: 'duplicate@test.com',
        password: 'SecurePassword123!',
        phone: '+91-9876543210'
      };

      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email should fail
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message).toContain('Email already registered');
    });

    it('should return 400 for invalid password', async () => {
      const userData = {
        companyName: 'Test Company 3',
        companyEmail: 'test3@test.com',
        companyPhone: '+91-9876543210',
        firstName: 'Admin',
        lastName: 'User',
        email: 'test3@test.com',
        password: 'weak', // Weak password
        phone: '+91-9876543210'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        companyName: 'Test Company 4'
        // Missing other required fields
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    let registeredUser;
    let testCompany;

    beforeEach(async () => {
      const testData = await testHelpers.createTestData();
      testCompany = testData.company;
      registeredUser = testData.user;
      
      // Hash the password
      registeredUser.password = await bcrypt.hash('TestPassword123!', 12);
      await registeredUser.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: registeredUser.email,
        password: 'TestPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'TestPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: registeredUser.email,
        password: 'WrongPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const { user } = await testHelpers.createTestData();
      
      const res = await testHelpers.authenticatedRequest('get', '/api/auth/profile', user)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', user.email);
      expect(res.body.data).toHaveProperty('name', user.name);
      expect(res.body.data).toHaveProperty('role', user.role);
    });

    it('should return 401 for missing token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const { user } = await testHelpers.createTestData();
      
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      };

      // Hash the current password
      user.password = await bcrypt.hash(passwordData.currentPassword, 12);
      await user.save();

      const res = await testHelpers.authenticatedRequest('put', '/api/auth/change-password', user, passwordData)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.message).toContain('Password changed successfully');

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: passwordData.newPassword
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty('success', true);
    });

    it('should return 400 for incorrect current password', async () => {
      const { user } = await testHelpers.createTestData();
      
      const passwordData = {
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      };

      user.password = await bcrypt.hash('CorrectPassword123!', 12);
      await user.save();

      const res = await testHelpers.authenticatedRequest('put', '/api/auth/change-password', user, passwordData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.message).toContain('Current password is incorrect');
    });

    it('should return 400 for password mismatch', async () => {
      const { user } = await testHelpers.createTestData();
      
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      };

      user.password = await bcrypt.hash(passwordData.currentPassword, 12);
      await user.save();

      const res = await testHelpers.authenticatedRequest('put', '/api/auth/change-password', user, passwordData)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.message).toContain('Passwords do not match');
    });
  });
});