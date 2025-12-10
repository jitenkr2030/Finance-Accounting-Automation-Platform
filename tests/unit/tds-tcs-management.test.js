const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const TDSTCS = require('../models/TDSTCS');
const TDSRate = require('../models/TDSRate');
const TCSRate = require('../models/TCSRate');
const TaxCertificate = require('../models/TaxCertificate');
const app = require('../app');

describe('TDS/TCS Management Engine', () => {
  let mongoServer;
  let authToken;
  let testData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup authentication
    authToken = 'Bearer test-token-tds-tcs';
    jest.spyOn(require('../middleware/auth'), 'authenticate')
      .mockImplementation((req, res, next) => {
        req.user = { id: 'test-user', role: 'admin' };
        next();
      });

    // Generate comprehensive test data for TDS/TCS operations
    testData = {
      tdsRates: [
        {
          section: '194C',
          natureOfPayment: 'Contract Payment',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 10000,
          panRequired: true,
          tanRequired: true,
          isActive: true
        },
        {
          section: '194O',
          natureOfPayment: 'E-commerce',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 500000,
          panRequired: true,
          tanRequired: false,
          isActive: true
        },
        {
          section: '194S',
          natureOfPayment: 'Crypto Assets',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 10000,
          panRequired: true,
          tanRequired: true,
          isActive: true
        },
        {
          section: '194N',
          natureOfPayment: 'Cash Withdrawal',
          rate: 2.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 10000000,
          panRequired: true,
          tanRequired: false,
          isActive: true
        },
        {
          section: '194Q',
          natureOfPayment: 'Goods Purchase',
          rate: 0.1,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 5000000,
          panRequired: true,
          tanRequired: false,
          isActive: true
        }
      ],
      tcsRates: [
        {
          section: '206C',
          natureOfSale: 'Tobacco Products',
          rate: 5.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 0,
          isActive: true
        },
        {
          section: '206C',
          natureOfSale: 'Timber',
          rate: 2.5,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 250000,
          isActive: true
        },
        {
          section: '206C',
          natureOfSale: 'Scrap',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 250000,
          isActive: true
        },
        {
          section: '206C',
          natureOfSale: 'Motor Vehicle',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 10000000,
          isActive: true
        },
        {
          section: '206C',
          natureOfSale: 'Alcoholic Liquor',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          thresholdLimit: 0,
          isActive: true
        }
      ],
      vendors: [
        {
          vendorId: 'VND-001',
          name: 'ABC Construction Ltd',
          panNumber: 'ABCDE1234F',
          tanNumber: 'MUMC12345A',
          address: {
            street: '123 Business Street',
            city: 'Mumbai',
            state: 'MH',
            pinCode: '400001',
            country: 'India'
          },
          category: 'Corporate',
          tdsApplicable: true,
          tcsApplicable: false,
          registrationDate: '2023-01-15',
          isActive: true
        },
        {
          vendorId: 'VND-002',
          name: 'XYZ Software Solutions',
          panNumber: 'XYZXY5678G',
          tanNumber: 'BLRC98765B',
          address: {
            street: '456 Tech Park',
            city: 'Bangalore',
            state: 'KA',
            pinCode: '560001',
            country: 'India'
          },
          category: 'Individual',
          tdsApplicable: true,
          tcsApplicable: false,
          registrationDate: '2023-02-20',
          isActive: true
        },
        {
          vendorId: 'VND-003',
          name: 'E-commerce Platform Pvt Ltd',
          panNumber: 'ECOM99999H',
          tanNumber: 'DLHC54321C',
          address: {
            street: '789 Digital Avenue',
            city: 'Delhi',
            state: 'DL',
            pinCode: '110001',
            country: 'India'
          },
          category: 'Corporate',
          tdsApplicable: true,
          tcsApplicable: true,
          registrationDate: '2023-03-10',
          isActive: true
        }
      ],
      transactions: [
        {
          transactionId: 'TXN-TDS-001',
          vendorId: 'VND-001',
          transactionType: 'Contract Payment',
          amount: 150000,
          tdsSection: '194C',
          tdsRate: 1.0,
          tdsAmount: 1500,
          transactionDate: '2025-01-15',
          dueDate: '2025-01-31',
          status: 'Pending',
          description: 'Construction contract payment'
        },
        {
          transactionId: 'TXN-TDS-002',
          vendorId: 'VND-002',
          transactionType: 'Professional Services',
          amount: 25000,
          tdsSection: '194J',
          tdsRate: 10.0,
          tdsAmount: 2500,
          transactionDate: '2025-01-20',
          dueDate: '2025-02-07',
          status: 'Pending',
          description: 'Software development services'
        },
        {
          transactionId: 'TXN-TCS-001',
          vendorId: 'VND-003',
          transactionType: 'E-commerce Sale',
          amount: 75000,
          tcsSection: '206C',
          tcsRate: 1.0,
          tcsAmount: 750,
          transactionDate: '2025-01-25',
          dueDate: '2025-02-15',
          status: 'Pending',
          description: 'E-commerce platform commission'
        }
      ],
      quarters: [
        {
          quarter: 'Q1-2025',
          startDate: '2025-04-01',
          endDate: '2025-06-30',
          filingDueDate: '2025-07-31',
          isActive: true
        },
        {
          quarter: 'Q4-2024',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          filingDueDate: '2024-05-31',
          isActive: false
        }
      ]
    };

    // Seed test data
    await TDSRate.insertMany(testData.tdsRates);
    await TCSRate.insertMany(testData.tcsRates);
    await TDSTCS.insertMany(testData.vendors);
    await TaxCertificate.insertMany(testData.transactions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean collections before each test
    await TDSTCS.deleteMany({});
    await TDSRate.deleteMany({});
    await TCSRate.deleteMany({});
    await TaxCertificate.deleteMany({});
  });

  describe('TDS Rate Management', () => {
    describe('POST /api/tds-tcs/tds-rates', () => {
      it('should create a new TDS rate', async () => {
        const tdsRateData = {
          section: '194J',
          natureOfPayment: 'Professional Services',
          rate: 10.0,
          surchargeRate: 10.0,
          educationCessRate: 4.0,
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          thresholdLimit: 30000,
          panRequired: true,
          tanRequired: true,
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(tdsRateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.section).toBe(tdsRateData.section);
        expect(response.body.data.rate).toBe(tdsRateData.rate);
        expect(response.body.data.thresholdLimit).toBe(tdsRateData.thresholdLimit);
      });

      it('should validate TDS rate percentage range', async () => {
        const invalidRateData = {
          section: '194C',
          natureOfPayment: 'Invalid Rate',
          rate: 150.0, // Invalid: too high
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(invalidRateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('rate must be between 0 and 100');
      });

      it('should validate date ranges for TDS rates', async () => {
        const invalidRateData = {
          section: '194C',
          natureOfPayment: 'Date Validation',
          rate: 1.0,
          validFrom: '2026-04-01', // Start after end
          validTo: '2025-03-31',
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(invalidRateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('validFrom must be before validTo');
      });

      it('should ensure unique section and validity period combinations', async () => {
        const duplicateRateData = {
          section: '194C',
          natureOfPayment: 'Duplicate Rate',
          rate: 1.0,
          validFrom: '2023-04-01',
          validTo: '2025-03-31',
          isActive: true
        };

        // Create first rate
        await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(duplicateRateData)
          .expect(201);

        // Try to create duplicate
        const response = await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(duplicateRateData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should calculate effective TDS rate with cess', async () => {
        const rateData = {
          section: '194C',
          natureOfPayment: 'Cess Calculation',
          rate: 1.0,
          surchargeRate: 5.0,
          educationCessRate: 4.0,
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tds-rates')
          .set('Authorization', authToken)
          .send(rateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.effectiveRate).toBeCloseTo(1.0908, 4); // 1.0 + (1.0 * 5/100) + ((1.0 + 1.0 * 5/100) * 4/100)
      });
    });

    describe('GET /api/tds-tcs/tds-rates', () => {
      beforeEach(async () => {
        // Create additional TDS rates for testing
        const additionalRates = [
          {
            section: '194H',
            natureOfPayment: 'Commission',
            rate: 5.0,
            surchargeRate: 0,
            educationCessRate: 4.0,
            validFrom: '2023-04-01',
            validTo: '2025-03-31',
            thresholdLimit: 15000,
            panRequired: true,
            tanRequired: true,
            isActive: true
          },
          {
            section: '194I',
            natureOfPayment: 'Rent',
            rate: 10.0,
            surchargeRate: 0,
            educationCessRate: 4.0,
            validFrom: '2023-04-01',
            validTo: '2025-03-31',
            thresholdLimit: 180000,
            panRequired: true,
            tanRequired: false,
            isActive: false
          }
        ];
        await TDSRate.insertMany(additionalRates);
      });

      it('should retrieve active TDS rates', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/tds-rates?active=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be active
        const activeRates = response.body.data.filter(rate => rate.isActive);
        expect(activeRates.length).toBe(response.body.data.length);
      });

      it('should filter by section code', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/tds-rates?section=194C')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be for section 194C
        response.body.data.forEach(rate => {
          expect(rate.section).toBe('194C');
        });
      });

      it('should get applicable rates for a given date', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/tds-rates?applicableDate=2025-01-15')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be applicable on the given date
        response.body.data.forEach(rate => {
          const applicableDate = new Date('2025-01-15');
          const validFrom = new Date(rate.validFrom);
          const validTo = new Date(rate.validTo);
          expect(applicableDate).toBeGreaterThanOrEqual(validFrom);
          expect(applicableDate).toBeLessThanOrEqual(validTo);
        });
      });

      it('should include calculation examples', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/tds-rates?includeExamples=true&amount=100000')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each rate should have calculation examples
        response.body.data.forEach(rate => {
          expect(rate).toHaveProperty('examples');
          expect(rate.examples).toHaveProperty('amount');
          expect(rate.examples).toHaveProperty('tdsAmount');
          expect(rate.examples).toHaveProperty('netAmount');
        });
      });
    });

    describe('PUT /api/tds-tcs/tds-rates/:id', () => {
      let createdTdsRateId;

      beforeEach(async () => {
        const tdsRate = new TDSRate({
          section: '194N',
          natureOfPayment: 'Cash Withdrawal Test',
          rate: 2.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          thresholdLimit: 10000000,
          panRequired: true,
          tanRequired: false,
          isActive: true
        });
        const saved = await tdsRate.save();
        createdTdsRateId = saved._id;
      });

      it('should update TDS rate properties', async () => {
        const updateData = {
          rate: 2.5,
          thresholdLimit: 15000000,
          description: 'Updated TDS rate'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/tds-rates/${createdTdsRateId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.rate).toBe(updateData.rate);
        expect(response.body.data.thresholdLimit).toBe(updateData.thresholdLimit);
      });

      it('should prevent changing section after creation', async () => {
        const updateData = {
          section: '194J'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/tds-rates/${createdTdsRateId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('section cannot be changed');
      });

      it('should validate rate changes against existing transactions', async () => {
        // Create a transaction using this rate first
        const transaction = new TaxCertificate({
          transactionId: 'RATE-CHANGE-TEST',
          vendorId: 'VND-001',
          amount: 50000,
          tdsSection: '194N',
          tdsRate: 2.0,
          tdsAmount: 1000,
          transactionDate: '2025-01-15',
          status: 'Completed'
        });
        await transaction.save();

        const updateData = {
          rate: 3.0
        };

        const response = await request(app)
          .put(`/api/tds-tcs/tds-rates/${createdTdsRateId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be modified due to existing transactions');
      });
    });
  });

  describe('TCS Rate Management', () => {
    describe('POST /api/tds-tcs/tcs-rates', () => {
      it('should create a new TCS rate', async () => {
        const tcsRateData = {
          section: '206C',
          natureOfSale: 'New Motor Vehicle',
          rate: 1.0,
          surchargeRate: 0,
          educationCessRate: 4.0,
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          thresholdLimit: 10000000,
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tcs-rates')
          .set('Authorization', authToken)
          .send(tcsRateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.section).toBe(tcsRateData.section);
        expect(response.body.data.natureOfSale).toBe(tcsRateData.natureOfSale);
        expect(response.body.data.rate).toBe(tcsRateData.rate);
      });

      it('should validate TCS rate categories', async () => {
        const invalidRateData = {
          section: '206C',
          natureOfSale: 'Invalid Category',
          rate: 1.0,
          validFrom: '2025-04-01',
          validTo: '2026-03-31',
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/tcs-rates')
          .set('Authorization', authToken)
          .send(invalidRateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('invalid nature of sale');
      });
    });

    describe('GET /api/tds-tcs/tcs-rates', () => {
      it('should retrieve TCS rates by nature of sale', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/tcs-rates?natureOfSale=Timber')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be for Timber
        response.body.data.forEach(rate => {
          expect(rate.natureOfSale).toBe('Timber');
        });
      });
    });
  });

  describe('Vendor TDS/TCS Management', () => {
    describe('POST /api/tds-tcs/vendors', () => {
      it('should create vendor with TDS/TCS settings', async () => {
        const vendorData = {
          vendorId: 'VND-NEW-001',
          name: 'New Vendor Pvt Ltd',
          panNumber: 'NEWVE1234K',
          tanNumber: 'MUMC11111D',
          address: {
            street: '100 New Street',
            city: 'Pune',
            state: 'MH',
            pinCode: '411001',
            country: 'India'
          },
          category: 'Corporate',
          tdsApplicable: true,
          tcsApplicable: false,
          registrationDate: '2025-01-01',
          isActive: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/vendors')
          .set('Authorization', authToken)
          .send(vendorData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.vendorId).toBe(vendorData.vendorId);
        expect(response.body.data.tdsApplicable).toBe(vendorData.tdsApplicable);
      });

      it('should validate PAN number format', async () => {
        const invalidVendorData = {
          vendorId: 'VND-INVALID',
          name: 'Invalid PAN Vendor',
          panNumber: 'INVALIDPAN', // Invalid format
          category: 'Individual',
          tdsApplicable: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/vendors')
          .set('Authorization', authToken)
          .send(invalidVendorData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('invalid PAN format');
      });

      it('should validate TAN number format', async () => {
        const invalidVendorData = {
          vendorId: 'VND-INVALID',
          name: 'Invalid TAN Vendor',
          panNumber: 'NEWVE1234K',
          tanNumber: 'INVALIDTAN', // Invalid format
          category: 'Corporate',
          tdsApplicable: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/vendors')
          .set('Authorization', authToken)
          .send(invalidVendorData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('invalid TAN format');
      });

      it('should ensure unique vendor IDs', async () => {
        const vendorData = {
          vendorId: 'VND-001', // Existing vendor ID
          name: 'Duplicate Vendor',
          panNumber: 'DUPLC1234M',
          category: 'Individual',
          tdsApplicable: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/vendors')
          .set('Authorization', authToken)
          .send(vendorData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });
    });

    describe('GET /api/tds-tcs/vendors', () => {
      beforeEach(async () => {
        // Create additional vendors for testing
        const additionalVendors = [
          {
            vendorId: 'VND-INDIV-001',
            name: 'Individual Consultant',
            panNumber: 'INDIV5678N',
            address: {
              city: 'Chennai',
              state: 'TN',
              pinCode: '600001',
              country: 'India'
            },
            category: 'Individual',
            tdsApplicable: true,
            tcsApplicable: false,
            isActive: true
          },
          {
            vendorId: 'VND-PARTNER-001',
            name: 'Partnership Firm',
            panNumber: 'PARTN9999P',
            tanNumber: 'CHEC22222E',
            address: {
              city: 'Kolkata',
              state: 'WB',
              pinCode: '700001',
              country: 'India'
            },
            category: 'Partnership',
            tdsApplicable: true,
            tcsApplicable: true,
            isActive: false
          }
        ];
        await TDSTCS.insertMany(additionalVendors);
      });

      it('should filter vendors by TDS applicability', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/vendors?tdsApplicable=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned vendors should have TDS applicable
        response.body.data.forEach(vendor => {
          expect(vendor.tdsApplicable).toBe(true);
        });
      });

      it('should filter vendors by category', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/vendors?category=Individual')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned vendors should be Individual category
        response.body.data.forEach(vendor => {
          expect(vendor.category).toBe('Individual');
        });
      });

      it('should provide vendor tax summary', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/vendors?includeTaxSummary=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each vendor should have tax summary
        response.body.data.forEach(vendor => {
          expect(vendor).toHaveProperty('taxSummary');
          expect(vendor.taxSummary).toHaveProperty('totalTDS');
          expect(vendor.taxSummary).toHaveProperty('totalTCS');
          expect(vendor.taxSummary).toHaveProperty('certificateCount');
        });
      });
    });

    describe('PUT /api/tds-tcs/vendors/:id', () => {
      let createdVendorId;

      beforeEach(async () => {
        const vendor = new TDSTCS({
          vendorId: 'UPDATE-TEST',
          name: 'Update Test Vendor',
          panNumber: 'UPDAT1234Q',
          category: 'Corporate',
          tdsApplicable: true,
          tcsApplicable: false,
          isActive: true
        });
        const saved = await vendor.save();
        createdVendorId = saved._id;
      });

      it('should update vendor tax settings', async () => {
        const updateData = {
          tdsApplicable: false,
          tcsApplicable: true,
          category: 'Partnership'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/vendors/${createdVendorId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tdsApplicable).toBe(updateData.tdsApplicable);
        expect(response.body.data.tcsApplicable).toBe(updateData.tcsApplicable);
        expect(response.body.data.category).toBe(updateData.category);
      });

      it('should prevent changing vendor ID after creation', async () => {
        const updateData = {
          vendorId: 'NEW-VENDOR-ID'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/vendors/${createdVendorId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('vendorId cannot be changed');
      });
    });
  });

  describe('TDS/TCS Transaction Processing', () => {
    describe('POST /api/tds-tcs/transactions', () => {
      it('should create TDS transaction with automatic calculation', async () => {
        const transactionData = {
          transactionId: 'AUTO-TDS-001',
          vendorId: 'VND-001',
          transactionType: 'Contract Payment',
          amount: 50000,
          transactionDate: '2025-01-30',
          description: 'Automatic TDS calculation test'
        };

        const response = await request(app)
          .post('/api/tds-tcs/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tdsSection).toBeDefined();
        expect(response.body.data.tdsRate).toBeDefined();
        expect(response.body.data.tdsAmount).toBeDefined();
        expect(response.body.data.tdsAmount).toBeCloseTo(500, 2); // 50000 * 1%
      });

      it('should create TCS transaction with calculation', async () => {
        const transactionData = {
          transactionId: 'AUTO-TCS-001',
          vendorId: 'VND-003',
          transactionType: 'E-commerce Sale',
          amount: 100000,
          transactionDate: '2025-01-30',
          description: 'Automatic TCS calculation test'
        };

        const response = await request(app)
          .post('/api/tds-tcs/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tcsSection).toBeDefined();
        expect(response.body.data.tcsRate).toBeDefined();
        expect(response.body.data.tcsAmount).toBeDefined();
        expect(response.body.data.tcsAmount).toBeCloseTo(1000, 2); // 100000 * 1%
      });

      it('should validate transaction amount against threshold limits', async () => {
        const transactionData = {
          transactionId: 'THRESHOLD-TEST',
          vendorId: 'VND-002',
          transactionType: 'Professional Services',
          amount: 25000, // Below threshold for 194J
          transactionDate: '2025-01-30',
          description: 'Below threshold test'
        };

        const response = await request(app)
          .post('/api/tds-tcs/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.tdsAmount).toBe(0); // No TDS for amount below threshold
        expect(response.body.data.isBelowThreshold).toBe(true);
      });

      it('should validate PAN requirements for TDS', async () => {
        const transactionData = {
          transactionId: 'PAN-VALIDATION',
          vendorId: 'VND-001',
          transactionType: 'Contract Payment',
          amount: 15000,
          transactionDate: '2025-01-30',
          vendorPanNumber: null, // Missing PAN
          description: 'PAN validation test'
        };

        const response = await request(app)
          .post('/api/tds-tcs/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('PAN number is required');
      });

      it('should handle advance payments with TDS', async () => {
        const transactionData = {
          transactionId: 'ADVANCE-TDS',
          vendorId: 'VND-001',
          transactionType: 'Contract Payment',
          amount: 75000,
          transactionDate: '2025-01-30',
          paymentType: 'advance',
          description: 'Advance payment with TDS'
        };

        const response = await request(app)
          .post('/api/tds-tcs/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.paymentType).toBe('advance');
        expect(response.body.data.tdsAmount).toBeGreaterThan(0);
      });
    });

    describe('GET /api/tds-tcs/transactions', () => {
      beforeEach(async () => {
        // Create additional transactions for testing
        const additionalTransactions = [
          {
            transactionId: 'TXN-TDS-003',
            vendorId: 'VND-001',
            transactionType: 'Rent Payment',
            amount: 45000,
            tdsSection: '194I',
            tdsRate: 10.0,
            tdsAmount: 4500,
            transactionDate: '2025-01-18',
            dueDate: '2025-02-07',
            status: 'Completed',
            description: 'Office rent payment'
          },
          {
            transactionId: 'TXN-TCS-002',
            vendorId: 'VND-003',
            transactionType: 'Scrap Sale',
            amount: 150000,
            tcsSection: '206C',
            tcsRate: 1.0,
            tcsAmount: 1500,
            transactionDate: '2025-01-22',
            dueDate: '2025-02-15',
            status: 'Pending',
            description: 'Industrial scrap sale'
          }
        ];
        await TaxCertificate.insertMany(additionalTransactions);
      });

      it('should filter transactions by vendor', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/transactions?vendorId=VND-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned transactions should be for VND-001
        response.body.data.forEach(transaction => {
          expect(transaction.vendorId).toBe('VND-001');
        });
      });

      it('should filter by transaction type', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/transactions?transactionType=Contract Payment')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned transactions should be Contract Payments
        response.body.data.forEach(transaction => {
          expect(transaction.transactionType).toBe('Contract Payment');
        });
      });

      it('should provide transaction summary by section', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/transactions?summaryBy=section')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary).toHaveProperty('bySection');
        expect(response.body.summary.bySection).toBeInstanceOf(Object);
      });

      it('should include calculation details', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/transactions?includeCalculations=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each transaction should have calculation details
        response.body.data.forEach(transaction => {
          expect(transaction).toHaveProperty('calculationBreakdown');
          expect(transaction.calculationBreakdown).toHaveProperty('baseAmount');
          expect(transaction.calculationBreakdown).toHaveProperty('rate');
          expect(transaction.calculationBreakdown).toHaveProperty('cessAmount');
        });
      });
    });

    describe('PUT /api/tds-tcs/transactions/:id', () => {
      let createdTransactionId;

      beforeEach(async () => {
        const transaction = new TaxCertificate({
          transactionId: 'UPDATE-TXN',
          vendorId: 'VND-002',
          transactionType: 'Professional Services',
          amount: 30000,
          tdsSection: '194J',
          tdsRate: 10.0,
          tdsAmount: 3000,
          transactionDate: '2025-01-15',
          dueDate: '2025-02-07',
          status: 'Pending',
          description: 'Update test transaction'
        });
        const saved = await transaction.save();
        createdTransactionId = saved._id;
      });

      it('should update transaction amount and recalculate TDS', async () => {
        const updateData = {
          amount: 40000,
          description: 'Updated transaction amount'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/transactions/${createdTransactionId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.amount).toBe(updateData.amount);
        expect(response.body.data.tdsAmount).toBe(4000); // 40000 * 10%
        expect(response.body.data.description).toBe(updateData.description);
      });

      it('should prevent changing vendor after transaction creation', async () => {
        const updateData = {
          vendorId: 'VND-003'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/transactions/${createdTransactionId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('vendor cannot be changed');
      });

      it('should handle transaction status changes', async () => {
        const updateData = {
          status: 'Completed',
          completedDate: '2025-01-25'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/transactions/${createdTransactionId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(updateData.status);
        expect(response.body.data.completedDate).toBe(updateData.completedDate);
      });
    });
  });

  describe('TDS/TCS Certificate Generation', () => {
    describe('POST /api/tds-tcs/certificates/generate', () => {
      it('should generate TDS certificate for a vendor', async () => {
        const certificateRequest = {
          vendorId: 'VND-001',
          certificateType: 'TDS',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31',
          quarter: 'Q4-2024'
        };

        const response = await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('certificateNumber');
        expect(response.body.data).toHaveProperty('certificateUrl');
        expect(response.body.data).toHaveProperty('totalTDS');
        expect(response.body.data).toHaveProperty('transactionCount');
      });

      it('should generate TCS certificate for a vendor', async () => {
        const certificateRequest = {
          vendorId: 'VND-003',
          certificateType: 'TCS',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31',
          quarter: 'Q4-2024'
        };

        const response = await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.certificateType).toBe('TCS');
        expect(response.body.data.totalTCS).toBeDefined();
      });

      it('should validate certificate generation requirements', async () => {
        const certificateRequest = {
          vendorId: 'VND-INVALID',
          certificateType: 'TDS',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31'
        };

        const response = await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('vendor not found');
      });

      it('should prevent duplicate certificate generation', async () => {
        const certificateRequest = {
          vendorId: 'VND-001',
          certificateType: 'TDS',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31',
          quarter: 'Q4-2024'
        };

        // Generate first certificate
        await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(201);

        // Try to generate duplicate
        const response = await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('certificate already exists');
      });

      it('should generate consolidated certificate', async () => {
        const certificateRequest = {
          certificateType: 'Consolidated',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31',
          quarter: 'Q4-2024',
          includeAllVendors: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/certificates/generate')
          .set('Authorization', authToken)
          .send(certificateRequest)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.certificateType).toBe('Consolidated');
        expect(response.body.data.vendorCount).toBeGreaterThan(1);
      });
    });

    describe('GET /api/tds-tcs/certificates', () => {
      beforeEach(async () => {
        // Create sample certificates for testing
        const certificates = [
          {
            certificateNumber: 'TDS-Q4-2024-VND-001',
            vendorId: 'VND-001',
            certificateType: 'TDS',
            quarter: 'Q4-2024',
            periodStart: '2024-10-01',
            periodEnd: '2024-12-31',
            totalTDS: 5000,
            transactionCount: 3,
            certificateUrl: '/certificates/TDS-Q4-2024-VND-001.pdf',
            generatedDate: '2025-01-15',
            isActive: true
          },
          {
            certificateNumber: 'TCS-Q4-2024-VND-003',
            vendorId: 'VND-003',
            certificateType: 'TCS',
            quarter: 'Q4-2024',
            periodStart: '2024-10-01',
            periodEnd: '2024-12-31',
            totalTCS: 2500,
            transactionCount: 2,
            certificateUrl: '/certificates/TCS-Q4-2024-VND-003.pdf',
            generatedDate: '2025-01-16',
            isActive: true
          }
        ];
        await TaxCertificate.insertMany(certificates);
      });

      it('should retrieve certificates by vendor', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/certificates?vendorId=VND-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned certificates should be for VND-001
        response.body.data.forEach(cert => {
          expect(cert.vendorId).toBe('VND-001');
        });
      });

      it('should filter by certificate type', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/certificates?certificateType=TDS')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned certificates should be TDS type
        response.body.data.forEach(cert => {
          expect(cert.certificateType).toBe('TDS');
        });
      });

      it('should filter by quarter', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/certificates?quarter=Q4-2024')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned certificates should be for Q4-2024
        response.body.data.forEach(cert => {
          expect(cert.quarter).toBe('Q4-2024');
        });
      });

      it('should provide certificate download links', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/certificates?includeDownload=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each certificate should have download information
        response.body.data.forEach(cert => {
          expect(cert).toHaveProperty('downloadUrl');
          expect(cert).toHaveProperty('fileSize');
          expect(cert).toHaveProperty('expiryDate');
        });
      });
    });

    describe('PUT /api/tds-tcs/certificates/:id/status', () => {
      let createdCertificateId;

      beforeEach(async () => {
        const certificate = new TaxCertificate({
          certificateNumber: 'STATUS-TEST-001',
          vendorId: 'VND-002',
          certificateType: 'TDS',
          quarter: 'Q1-2025',
          totalTDS: 3000,
          transactionCount: 2,
          generatedDate: '2025-01-20',
          isActive: true
        });
        const saved = await certificate.save();
        createdCertificateId = saved._id;
      });

      it('should update certificate status', async () => {
        const statusUpdate = {
          status: 'Delivered',
          deliveredDate: '2025-01-25',
          deliveryMethod: 'Email'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/certificates/${createdCertificateId}/status`)
          .set('Authorization', authToken)
          .send(statusUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(statusUpdate.status);
        expect(response.body.data.deliveredDate).toBe(statusUpdate.deliveredDate);
      });

      it('should revoke certificate if needed', async () => {
        const statusUpdate = {
          status: 'Revoked',
          revocationReason: 'Incorrect calculation',
          revokedDate: '2025-01-30'
        };

        const response = await request(app)
          .put(`/api/tds-tcs/certificates/${createdCertificateId}/status`)
          .set('Authorization', authToken)
          .send(statusUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(statusUpdate.status);
        expect(response.body.data.isActive).toBe(false);
        expect(response.body.data.revocationReason).toBe(statusUpdate.revocationReason);
      });
    });
  });

  describe('Regulatory Reporting', () => {
    describe('GET /api/tds-tcs/reports/tds-summary', () => {
      it('should generate TDS summary report for a quarter', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/tds-summary?quarter=Q4-2024&format=detailed')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('quarter');
        expect(response.body.data).toHaveProperty('totalTDS');
        expect(response.body.data).toHaveProperty('vendorSummary');
        expect(response.body.data).toHaveProperty('sectionWiseBreakdown');
        expect(response.body.data).toHaveProperty('monthlyBreakdown');
      });

      it('should provide TDS deduction analysis', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/tds-summary?analysis=deduction&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('deductionAnalysis');
        expect(response.body.data.deductionAnalysis).toHaveProperty('averageDeductionRate');
        expect(response.body.data.deductionAnalysis).toHaveProperty('thresholdAnalysis');
        expect(response.body.data.deductionAnalysis).toHaveProperty('vendorCompliance');
      });

      it('should generate e-TDS file format data', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/tds-summary?format=etds&quarter=Q4-2024')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('etdsFormat');
        expect(response.body.data.etdsFormat).toHaveProperty('header');
        expect(response.body.data.etdsFormat).toHaveProperty('deductorDetails');
        expect(response.body.data.etdsFormat).toHaveProperty('challanDetails');
        expect(response.body.data.etdsFormat).toHaveProperty('deducteeDetails');
      });
    });

    describe('GET /api/tds-tcs/reports/tcs-summary', () => {
      it('should generate TCS collection report', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/tcs-summary?quarter=Q4-2024')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('quarter');
        expect(response.body.data).toHaveProperty('totalTCS');
        expect(response.body.data).toHaveProperty('natureOfSaleBreakdown');
        expect(response.body.data).toHaveProperty('stateWiseCollection');
        expect(response.body.data).toHaveProperty('collectionTrends');
      });

      it('should provide TCS compliance tracking', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/tcs-summary?compliance=true&quarter=Q4-2024')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('complianceMetrics');
        expect(response.body.data.complianceMetrics).toHaveProperty('collectionRate');
        expect(response.body.data.complianceMetrics).toHaveProperty('depositTimeliness');
        expect(response.body.data.complianceMetrics).toHaveProperty('filingCompliance');
      });
    });

    describe('GET /api/tds-tcs/reports/compliance-status', () => {
      it('should track overall TDS/TCS compliance status', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/compliance-status?asOfDate=2025-01-31')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('overallCompliance');
        expect(response.body.data).toHaveProperty('pendingActions');
        expect(response.body.data).toHaveProperty('upcomingDeadlines');
        expect(response.body.data).toHaveProperty('riskIndicators');
      });

      it('should identify compliance risks and alerts', async () => {
        const response = await request(app)
          .get('/api/tds-tcs/reports/compliance-status?risks=true&alerts=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('riskAssessment');
        expect(response.body.data).toHaveProperty('alerts');
        expect(response.body.data.alerts).toBeInstanceOf(Array);
        
        response.body.data.alerts.forEach(alert => {
          expect(alert).toHaveProperty('type');
          expect(alert).toHaveProperty('severity');
          expect(alert).toHaveProperty('description');
        });
      });
    });

    describe('POST /api/tds-tcs/reports/quarterly-filing', () => {
      it('should prepare quarterly TDS filing data', async () => {
        const filingRequest = {
          quarter: 'Q4-2024',
          filingType: 'TDS',
          includeDetails: true,
          validateData: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/reports/quarterly-filing')
          .set('Authorization', authToken)
          .send(filingRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('filingData');
        expect(response.body.data).toHaveProperty('validationResults');
        expect(response.body.data).toHaveProperty('summary');
        expect(response.body.data.filingData).toHaveProperty('challanDetails');
        expect(response.body.data.filingData).toHaveProperty('deducteeDetails');
      });

      it('should validate filing data before preparation', async () => {
        const filingRequest = {
          quarter: 'Q4-2024',
          filingType: 'TDS',
          validateData: true,
          strictValidation: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/reports/quarterly-filing')
          .set('Authorization', authToken)
          .send(filingRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.validationResults).toHaveProperty('errors');
        expect(response.body.data.validationResults).toHaveProperty('warnings');
        expect(response.body.data.validationResults).toHaveProperty('isValid');
      });
    });
  });

  describe('Integration and Workflow', () => {
    describe('Automated TDS Calculation Workflow', () => {
      it('should trigger automatic TDS calculation on invoice processing', async () => {
        const invoiceData = {
          invoiceId: 'INV-AUTO-TDS',
          vendorId: 'VND-001',
          invoiceAmount: 80000,
          invoiceDate: '2025-01-30',
          dueDate: '2025-02-15',
          description: 'Auto TDS calculation workflow test',
          autoCalculateTDS: true,
          paymentTerms: 'Net 30'
        };

        const response = await request(app)
          .post('/api/tds-tcs/workflow/invoice-processing')
          .set('Authorization', authToken)
          .send(invoiceData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('invoice');
        expect(response.body.data).toHaveProperty('tdsCalculation');
        expect(response.body.data.tdsCalculation).toHaveProperty('tdsAmount');
        expect(response.body.data.tdsCalculation).toHaveProperty('netAmount');
      });

      it('should handle TDS rate changes with automatic recalculation', async () => {
        const rateChangeWorkflow = {
          oldSection: '194C',
          newSection: '194C',
          effectiveDate: '2025-02-01',
          newRate: 2.0,
          recalculatePending: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/workflow/rate-change')
          .set('Authorization', authToken)
          .send(rateChangeWorkflow)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('affectedTransactions');
        expect(response.body.data).toHaveProperty('recalculationResults');
        expect(response.body.data.affectedTransactions).toBeGreaterThan(0);
      });
    });

    describe('Compliance Alert System', () => {
      it('should generate alerts for upcoming filing deadlines', async () => {
        const alertRequest = {
          alertType: 'filing_deadline',
          daysAhead: 7,
          includeReminders: true
        };

        const response = await request(app)
          .post('/api/tds-tcs/alerts/generate')
          .set('Authorization', authToken)
          .send(alertRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('alerts');
        expect(response.body.data).toHaveProperty('summary');
        expect(response.body.data.alerts).toBeInstanceOf(Array);
        
        response.body.data.alerts.forEach(alert => {
          expect(alert).toHaveProperty('type', 'filing_deadline');
          expect(alert).toHaveProperty('dueDate');
          expect(alert).toHaveProperty('priority');
        });
      });

      it('should notify about missing PAN/TAN information', async () => {
        const alertRequest = {
          alertType: 'missing_documents',
          documentTypes: ['PAN', 'TAN']
        };

        const response = await request(app)
          .post('/api/tds-tcs/alerts/generate')
          .set('Authorization', authToken)
          .send(alertRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('alerts');
        expect(response.body.data).toHaveProperty('affectedVendors');
        expect(response.body.data.alerts).toBeInstanceOf(Array);
      });
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      // Create large dataset for performance testing
      const vendors = [];
      const transactions = [];

      for (let i = 0; i < 500; i++) {
        vendors.push({
          vendorId: `PERF-VND-${i.toString().padStart(3, '0')}`,
          name: `Performance Vendor ${i}`,
          panNumber: `PERF${i.toString().padStart(5, '0')}Z`,
          category: ['Individual', 'Corporate', 'Partnership'][i % 3],
          tdsApplicable: true,
          tcsApplicable: i % 4 === 0,
          isActive: true
        });

        transactions.push({
          transactionId: `PERF-TXN-${i.toString().padStart(4, '0')}`,
          vendorId: `PERF-VND-${i.toString().padStart(3, '0')}`,
          transactionType: ['Contract Payment', 'Professional Services', 'Rent'][i % 3],
          amount: 10000 + (i * 100),
          tdsSection: ['194C', '194J', '194I'][i % 3],
          tdsRate: [1.0, 10.0, 10.0][i % 3],
          tdsAmount: (10000 + (i * 100)) * ([1.0, 10.0, 10.0][i % 3] / 100),
          transactionDate: `2025-01-${(i % 30) + 1}`,
          dueDate: `2025-02-${((i % 30) + 15)}`,
          status: ['Pending', 'Completed'][i % 2],
          description: `Performance test transaction ${i}`
        });
      }

      await TDSTCS.insertMany(vendors);
      await TaxCertificate.insertMany(transactions);
    });

    it('should handle large volume of TDS transactions efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tds-tcs/transactions?limit=100&page=1&includeSummary=true')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(100);
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    });

    it('should efficiently process bulk TDS calculations', async () => {
      const startTime = Date.now();
      
      const bulkCalculationRequest = {
        transactions: Array.from({length: 200}, (_, i) => ({
          vendorId: `PERF-VND-${i.toString().padStart(3, '0')}`,
          amount: 50000 + (i * 1000),
          transactionType: ['Contract Payment', 'Professional Services'][i % 2]
        })),
        calculateInBatch: true
      };

      const response = await request(app)
        .post('/api/tds-tcs/transactions/bulk-calculate')
        .set('Authorization', authToken)
        .send(bulkCalculationRequest)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(200);
      expect(responseTime).toBeLessThan(10000); // Should handle 200 calculations within 10 seconds
    });

    it('should maintain performance with complex reporting queries', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tds-tcs/reports/tds-summary?quarter=Q4-2024&includeDetails=true&analysis=comprehensive')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(15000); // Complex reports should complete within 15 seconds
    });
  });

  describe('Security and Authorization', () => {
    it('should require authentication for TDS operations', async () => {
      const vendorData = {
        vendorId: 'SEC-TEST',
        name: 'Security Test Vendor',
        panNumber: 'SECTE1234R',
        category: 'Individual',
        tdsApplicable: true
      };

      const response = await request(app)
        .post('/api/tds-tcs/vendors')
        .send(vendorData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate user permissions for rate modifications', async () => {
      // Mock user with limited permissions
      jest.spyOn(require('../middleware/auth'), 'authenticate')
        .mockImplementation((req, res, next) => {
          req.user = { id: 'limited-user', role: 'viewer' };
          next();
        });

      const rateData = {
        section: '194C',
        natureOfPayment: 'Permission Test',
        rate: 2.0,
        validFrom: '2025-04-01',
        validTo: '2026-03-31',
        isActive: true
      };

      const response = await request(app)
        .post('/api/tds-tcs/tds-rates')
        .set('Authorization', authToken)
        .send(rateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should sanitize vendor data to prevent injection', async () => {
      const maliciousData = {
        vendorId: 'MALICIOUS<script>alert("xss")</script>',
        name: 'Vendor<script>alert("xss")</script>',
        panNumber: 'MALIC<script>alert("xss")</script>1234S',
        address: {
          city: 'City<script>alert("xss")</script>',
          state: 'MH'
        }
      };

      const response = await request(app)
        .post('/api/tds-tcs/vendors')
        .set('Authorization', authToken)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify data is sanitized
      expect(response.body.data.vendorId).not.toContain('<script>');
      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.panNumber).not.toContain('<script>');
      expect(response.body.data.address.city).not.toContain('<script>');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing vendors gracefully', async () => {
      const transactionData = {
        transactionId: 'MISSING-VENDOR',
        vendorId: 'NON-EXISTENT-VENDOR',
        transactionType: 'Contract Payment',
        amount: 10000,
        transactionDate: '2025-01-30'
      };

      const response = await request(app)
        .post('/api/tds-tcs/transactions')
        .set('Authorization', authToken)
        .send(transactionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('vendor not found');
    });

    it('should handle invalid TDS sections', async () => {
      const transactionData = {
        transactionId: 'INVALID-SECTION',
        vendorId: 'VND-001',
        transactionType: 'Invalid Section',
        amount: 10000,
        tdsSection: '999Z', // Invalid section
        transactionDate: '2025-01-30'
      };

      const response = await request(app)
        .post('/api/tds-tcs/transactions')
        .set('Authorization', authToken)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('invalid TDS section');
    });

    it('should handle rate calculation edge cases', async () => {
      const transactionData = {
        transactionId: 'ZERO-AMOUNT',
        vendorId: 'VND-001',
        transactionType: 'Contract Payment',
        amount: 0, // Zero amount
        transactionDate: '2025-01-30'
      };

      const response = await request(app)
        .post('/api/tds-tcs/transactions')
        .set('Authorization', authToken)
        .send(transactionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tdsAmount).toBe(0); // Zero TDS for zero amount
    });

    it('should validate date ranges for certificate generation', async () => {
      const certificateRequest = {
        vendorId: 'VND-001',
        certificateType: 'TDS',
        periodStart: '2025-01-31', // Start after end
        periodEnd: '2025-01-01',
        quarter: 'Q4-2024'
      };

      const response = await request(app)
        .post('/api/tds-tcs/certificates/generate')
        .set('Authorization', authToken)
        .send(certificateRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('start date must be before end date');
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain referential integrity for transactions', async () => {
      // Create transaction referencing a vendor
      const transaction = new TaxCertificate({
        transactionId: 'REF-TEST',
        vendorId: 'REF-VENDOR-001',
        transactionType: 'Contract Payment',
        amount: 25000,
        tdsSection: '194C',
        tdsRate: 1.0,
        tdsAmount: 250,
        transactionDate: '2025-01-30',
        status: 'Pending'
      });
      await transaction.save();

      // Try to delete the referenced vendor
      const response = await request(app)
        .delete('/api/tds-tcs/vendors/REF-VENDOR-001?hardDelete=true')
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('referenced by transactions');
    });

    it('should validate calculation accuracy', async () => {
      const transactionData = {
        transactionId: 'CALC-TEST',
        vendorId: 'VND-001',
        transactionType: 'Contract Payment',
        amount: 100000,
        transactionDate: '2025-01-30',
        description: 'Calculation accuracy test'
      };

      const response = await request(app)
        .post('/api/tds-tcs/transactions')
        .set('Authorization', authToken)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tdsAmount).toBeCloseTo(1000, 2); // 100000 * 1%
      expect(response.body.data.calculationBreakdown.baseAmount).toBe(100000);
      expect(response.body.data.calculationBreakdown.rate).toBe(1.0);
      expect(response.body.data.calculationBreakdown.tdsAmount).toBeCloseTo(1000, 2);
    });

    it('should maintain audit trail for all TDS operations', async () => {
      const vendorData = {
        vendorId: 'AUDIT-TEST',
        name: 'Audit Trail Test Vendor',
        panNumber: 'AUDIT1234T',
        category: 'Individual',
        tdsApplicable: true
      };

      const response = await request(app)
        .post('/api/tds-tcs/vendors')
        .set('Authorization', authToken)
        .send(vendorData)
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
    it('should sync with income tax portal', async () => {
      const syncData = {
        source: 'income_tax_portal',
        syncType: 'tds_returns',
        period: 'Q4-2024',
        includeDetails: true
      };

      const response = await request(app)
        .post('/api/tds-tcs/sync/income-tax-portal')
        .set('Authorization', authToken)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('syncedReturns');
      expect(response.body.data).toHaveProperty('conflicts');
      expect(response.body.data).toHaveProperty('lastSyncDate');
    });

    it('should integrate with accounting systems for automatic postings', async () => {
      const integrationData = {
        system: 'accounting_software',
        integrationType: 'automatic_postings',
        data: [
          {
            transactionId: 'INT-TXN-001',
            accountCode: '2101001',
            amount: 1500,
            entryType: 'credit',
            description: 'TDS payable'
          },
          {
            transactionId: 'INT-TXN-001',
            accountCode: '6101001',
            amount: 1500,
            entryType: 'debit',
            description: 'TDS expense'
          }
        ]
      };

      const response = await request(app)
        .post('/api/tds-tcs/integrations/accounting')
        .set('Authorization', authToken)
        .send(integrationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrated).toBe(2);
      expect(response.body.data.journalEntries).toBeDefined();
    });

    it('should export data for compliance reporting', async () => {
      const exportRequest = {
        format: 'excel',
        reportType: 'tds_summary',
        period: 'Q4-2024',
        includeCharts: true,
        sections: ['194C', '194J', '194I']
      };

      const response = await request(app)
        .post('/api/tds-tcs/export/compliance')
        .set('Authorization', authToken)
        .send(exportRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fileName');
      expect(response.body.data).toHaveProperty('downloadUrl');
      expect(response.body.data).toHaveProperty('fileSize');
    });
  });
});