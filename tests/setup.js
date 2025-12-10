// Jest test setup file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/finance_platform_test';
process.env.LOG_LEVEL = 'error';

// Global test variables
let mongoServer;
let connection;

// Setup database connection
beforeAll(async () => {
  try {
    // Start in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('✅ Test database cleanup complete');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  }
});

// Global test utilities
global.testUtils = {
  // Create a test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultUser = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User',
      role: 'admin',
      companyId: 'test-company-id',
      isActive: true,
      ...userData
    };
    
    const user = new User(defaultUser);
    await user.save();
    return user;
  },
  
  // Create a test company
  createTestCompany: async (companyData = {}) => {
    const Company = require('../models/Company');
    const defaultCompany = {
      name: 'Test Company',
      email: 'test@company.com',
      phone: '+91-9876543210',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      tan: 'BLRM12345E',
      cin: 'U72200KA2020PTC123456',
      financialYearStart: '2024-04-01',
      baseCurrency: 'INR',
      timezone: 'Asia/Kolkata',
      isActive: true,
      ...companyData
    };
    
    const company = new Company(defaultCompany);
    await company.save();
    return company;
  },
  
  // Generate JWT token for testing
  generateAuthToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: user._id, 
        companyId: user.companyId, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  // Create test account
  createTestAccount: async (accountData = {}) => {
    const Ledger = require('../models/Ledger');
    const defaultAccount = {
      companyId: 'test-company-id',
      accountCode: `ACC${Date.now()}`,
      accountName: 'Test Account',
      accountType: 'Assets',
      accountGroup: 'Current Assets',
      parentAccount: null,
      isActive: true,
      isSystemAccount: false,
      description: 'Test account for unit testing',
      ...accountData
    };
    
    const account = new Ledger.Account(defaultAccount);
    await account.save();
    return account;
  },
  
  // Create test journal entry
  createTestJournalEntry: async (entryData = {}) => {
    const Ledger = require('../models/Ledger');
    const defaultEntry = {
      companyId: 'test-company-id',
      entryNumber: `JE${Date.now()}`,
      entryDate: new Date(),
      description: 'Test journal entry',
      reference: 'TEST-001',
      totalDebit: 1000,
      totalCredit: 1000,
      status: 'draft',
      createdBy: 'test-user-id',
      ...entryData
    };
    
    const entry = new Ledger.JournalEntry(defaultEntry);
    await entry.save();
    return entry;
  },
  
  // Create test invoice
  createTestInvoice: async (invoiceData = {}) => {
    const Billing = require('../models/Billing');
    const defaultInvoice = {
      companyId: 'test-company-id',
      invoiceNumber: `INV${Date.now()}`,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      customerId: 'test-customer-id',
      customerName: 'Test Customer',
      billingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      items: [
        {
          productId: 'test-product-id',
          productName: 'Test Product',
          description: 'Test product description',
          quantity: 1,
          rate: 1000,
          taxRate: 18,
          discount: 0
        }
      ],
      subtotal: 1000,
      taxAmount: 180,
      totalAmount: 1180,
      status: 'draft',
      ...invoiceData
    };
    
    const invoice = new Billing.Invoice(defaultInvoice);
    await invoice.save();
    return invoice;
  }
};

// Suppress console logs during tests unless in debug mode
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});