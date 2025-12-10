const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MultiCurrency = require('../models/MultiCurrency');
const CurrencyRate = require('../models/CurrencyRate');
const CurrencyExchange = require('../models/CurrencyExchange');
const app = require('../app');

describe('Multi-Currency Support Engine', () => {
  let mongoServer;
  let authToken;
  let testData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup authentication
    authToken = 'Bearer test-token-multi-currency';
    jest.spyOn(require('../middleware/auth'), 'authenticate')
      .mockImplementation((req, res, next) => {
        req.user = { id: 'test-user', role: 'admin' };
        next();
      });

    // Generate comprehensive test data for multi-currency operations
    testData = {
      currencies: [
        {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          decimalPlaces: 2,
          isBaseCurrency: true,
          isActive: true,
          countries: ['United States', 'Ecuador', 'El Salvador']
        },
        {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands']
        },
        {
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['United Kingdom']
        },
        {
          code: 'JPY',
          name: 'Japanese Yen',
          symbol: '¥',
          decimalPlaces: 0,
          isBaseCurrency: false,
          isActive: true,
          countries: ['Japan']
        },
        {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['India']
        },
        {
          code: 'CNY',
          name: 'Chinese Yuan',
          symbol: '¥',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['China']
        }
      ],
      exchangeRates: [
        {
          fromCurrency: 'EUR',
          toCurrency: 'USD',
          rate: 1.0850,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'ECB',
          isActive: true
        },
        {
          fromCurrency: 'GBP',
          toCurrency: 'USD',
          rate: 1.2650,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'Bank of England',
          isActive: true
        },
        {
          fromCurrency: 'JPY',
          toCurrency: 'USD',
          rate: 0.0068,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'Bank of Japan',
          isActive: true
        },
        {
          fromCurrency: 'INR',
          toCurrency: 'USD',
          rate: 0.0120,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'RBI',
          isActive: true
        },
        {
          fromCurrency: 'CNY',
          toCurrency: 'USD',
          rate: 0.1380,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'PBOC',
          isActive: true
        },
        {
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0.9210,
          rateDate: '2025-01-01',
          rateType: 'forward',
          source: 'Calculated',
          validUntil: '2025-01-31',
          isActive: true
        }
      ],
      transactions: [
        {
          transactionId: 'TXN-001',
          description: 'European equipment purchase',
          amount: 15000,
          currency: 'EUR',
          amountInBase: 16275,
          baseCurrency: 'USD',
          transactionDate: '2025-01-15',
          exchangeRate: 1.0850,
          exchangeRateId: null,
          category: 'Capital Expenditure',
          department: 'Manufacturing'
        },
        {
          transactionId: 'TXN-002',
          description: 'UK consulting services',
          amount: 8000,
          currency: 'GBP',
          amountInBase: 10120,
          baseCurrency: 'USD',
          transactionDate: '2025-01-20',
          exchangeRate: 1.2650,
          exchangeRateId: null,
          category: 'Professional Services',
          department: 'R&D'
        },
        {
          transactionId: 'TXN-003',
          description: 'Japanese component purchase',
          amount: 2500000,
          currency: 'JPY',
          amountInBase: 17000,
          baseCurrency: 'USD',
          transactionDate: '2025-01-25',
          exchangeRate: 0.0068,
          exchangeRateId: null,
          category: 'Raw Materials',
          department: 'Manufacturing'
        }
      ],
      fiscalYears: [
        {
          year: 2025,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          baseCurrency: 'USD',
          isActive: true,
          reportingCurrencies: ['EUR', 'GBP', 'JPY']
        }
      ]
    };

    // Seed test data
    await MultiCurrency.insertMany(testData.currencies);
    await CurrencyRate.insertMany(testData.exchangeRates);
    await CurrencyExchange.insertMany(testData.transactions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean collections before each test
    await MultiCurrency.deleteMany({});
    await CurrencyRate.deleteMany({});
    await CurrencyExchange.deleteMany({});
  });

  describe('Currency Management', () => {
    describe('POST /api/multi-currency/currencies', () => {
      it('should create a new currency with valid data', async () => {
        const currencyData = {
          code: 'CAD',
          name: 'Canadian Dollar',
          symbol: 'C$',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['Canada']
        };

        const response = await request(app)
          .post('/api/multi-currency/currencies')
          .set('Authorization', authToken)
          .send(currencyData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.code).toBe(currencyData.code);
        expect(response.body.data.name).toBe(currencyData.name);
        expect(response.body.data.decimalPlaces).toBe(currencyData.decimalPlaces);
      });

      it('should validate currency code format', async () => {
        const invalidData = {
          code: 'INVALIDCODE', // Too long
          name: 'Invalid Currency',
          decimalPlaces: 2
        };

        const response = await request(app)
          .post('/api/multi-currency/currencies')
          .set('Authorization', authToken)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('currency code must be 3 characters');
      });

      it('should ensure only one base currency exists', async () => {
        const baseCurrencyData = {
          code: 'CAD',
          name: 'Canadian Dollar',
          symbol: 'C$',
          decimalPlaces: 2,
          isBaseCurrency: true,
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/currencies')
          .set('Authorization', authToken)
          .send(baseCurrencyData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('base currency already exists');
      });

      it('should validate decimal places range', async () => {
        const invalidData = {
          code: 'TEST',
          name: 'Test Currency',
          decimalPlaces: 5 // Invalid: too many decimal places
        };

        const response = await request(app)
          .post('/api/multi-currency/currencies')
          .set('Authorization', authToken)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('decimal places must be between 0 and 4');
      });

      it('should prevent deactivation of base currency', async () => {
        const updateData = {
          isActive: false
        };

        const response = await request(app)
          .put('/api/multi-currency/currencies/USD')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be deactivated');
      });
    });

    describe('GET /api/multi-currency/currencies', () => {
      beforeEach(async () => {
        // Create additional currencies for testing
        const additionalCurrencies = [
          {
            code: 'AUD',
            name: 'Australian Dollar',
            symbol: 'A$',
            decimalPlaces: 2,
            isBaseCurrency: false,
            isActive: true,
            countries: ['Australia', 'Kiribati', 'Nauru', 'Tuvalu']
          },
          {
            code: 'CHF',
            name: 'Swiss Franc',
            symbol: 'Fr',
            decimalPlaces: 2,
            isBaseCurrency: false,
            isActive: false,
            countries: ['Switzerland', 'Liechtenstein']
          }
        ];
        await MultiCurrency.insertMany(additionalCurrencies);
      });

      it('should retrieve all active currencies', async () => {
        const response = await request(app)
          .get('/api/multi-currency/currencies?active=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned currencies should be active
        const activeCurrencies = response.body.data.filter(curr => curr.isActive);
        expect(activeCurrencies.length).toBe(response.body.data.length);
      });

      it('should filter currencies by symbol', async () => {
        const response = await request(app)
          .get('/api/multi-currency/currencies?symbol=$')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned currencies should have $ symbol
        response.body.data.forEach(currency => {
          expect(currency.symbol).toContain('$');
        });
      });

      it('should include currency statistics', async () => {
        const response = await request(app)
          .get('/api/multi-currency/currencies?includeStats=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each currency should have statistics
        response.body.data.forEach(currency => {
          expect(currency).toHaveProperty('transactionCount');
          expect(currency).toHaveProperty('totalVolume');
          expect(currency).toHaveProperty('lastUsedDate');
        });
      });

      it('should provide country mapping for currencies', async () => {
        const response = await request(app)
          .get('/api/multi-currency/currencies?includeCountries=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        response.body.data.forEach(currency => {
          expect(currency).toHaveProperty('countries');
          expect(Array.isArray(currency.countries)).toBe(true);
        });
      });
    });

    describe('PUT /api/multi-currency/currencies/:code', () => {
      let createdCurrencyId;

      beforeEach(async () => {
        const currency = new MultiCurrency({
          code: 'SEK',
          name: 'Swedish Krona',
          symbol: 'kr',
          decimalPlaces: 2,
          isBaseCurrency: false,
          isActive: true,
          countries: ['Sweden']
        });
        const saved = await currency.save();
        createdCurrencyId = saved._id;
      });

      it('should update currency properties', async () => {
        const updateData = {
          name: 'Updated Swedish Krona',
          symbol: 'SEK',
          countries: ['Sweden', 'Åland Islands']
        };

        const response = await request(app)
          .put(`/api/multi-currency/currencies/SEK`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.symbol).toBe(updateData.symbol);
        expect(response.body.data.countries).toHaveLength(2);
      });

      it('should prevent changing currency code after creation', async () => {
        const updateData = {
          code: 'NEW-SEK'
        };

        const response = await request(app)
          .put('/api/multi-currency/currencies/SEK')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be changed');
      });

      it('should validate country codes when updating', async () => {
        const updateData = {
          countries: ['Sweden', 'INVALID-COUNTRY']
        };

        const response = await request(app)
          .put('/api/multi-currency/currencies/SEK')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('invalid country code');
      });
    });
  });

  describe('Exchange Rate Management', () => {
    describe('POST /api/multi-currency/exchange-rates', () => {
      it('should create a new exchange rate', async () => {
        const rateData = {
          fromCurrency: 'AUD',
          toCurrency: 'USD',
          rate: 0.6750,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'RBA',
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates')
          .set('Authorization', authToken)
          .send(rateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.fromCurrency).toBe(rateData.fromCurrency);
        expect(response.body.data.toCurrency).toBe(rateData.toCurrency);
        expect(response.body.data.rate).toBe(rateData.rate);
      });

      it('should calculate reciprocal rate automatically', async () => {
        const rateData = {
          fromCurrency: 'EUR',
          toCurrency: 'USD',
          rate: 1.0850,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'ECB',
          calculateReciprocal: true,
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates')
          .set('Authorization', authToken)
          .send(rateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reciprocalRate).toBeCloseTo(0.9216, 4); // 1/1.0850
      });

      it('should create forward rate with expiry', async () => {
        const rateData = {
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0.9250,
          rateDate: '2025-01-01',
          rateType: 'forward',
          source: 'Bank Calculation',
          validUntil: '2025-03-31',
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates')
          .set('Authorization', authToken)
          .send(rateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.rateType).toBe('forward');
        expect(response.body.data.validUntil).toBe(rateData.validUntil);
      });

      it('should validate exchange rate relationships', async () => {
        const rateData = {
          fromCurrency: 'USD',
          toCurrency: 'USD', // Same currency
          rate: 1.0000,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'System',
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates')
          .set('Authorization', authToken)
          .send(rateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('currencies must be different');
      });

      it('should prevent negative or zero exchange rates', async () => {
        const invalidRateData = {
          fromCurrency: 'EUR',
          toCurrency: 'USD',
          rate: 0, // Invalid: zero rate
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'Test',
          isActive: true
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates')
          .set('Authorization', authToken)
          .send(invalidRateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('rate must be greater than 0');
      });
    });

    describe('GET /api/multi-currency/exchange-rates', () => {
      beforeEach(async () => {
        // Create additional exchange rates for testing
        const additionalRates = [
          {
            fromCurrency: 'CAD',
            toCurrency: 'USD',
            rate: 0.7400,
            rateDate: '2025-01-01',
            rateType: 'spot',
            source: 'Bank of Canada',
            isActive: true
          },
          {
            fromCurrency: 'CHF',
            toCurrency: 'USD',
            rate: 1.1250,
            rateDate: '2025-01-01',
            rateType: 'spot',
            source: 'SNB',
            isActive: false
          },
          {
            fromCurrency: 'USD',
            toCurrency: 'GBP',
            rate: 0.7900,
            rateDate: '2025-01-01',
            rateType: 'forward',
            source: 'Calculated',
            validUntil: '2025-02-28',
            isActive: true
          }
        ];
        await CurrencyRate.insertMany(additionalRates);
      });

      it('should retrieve exchange rates by currency pair', async () => {
        const response = await request(app)
          .get('/api/multi-currency/exchange-rates?from=EUR&to=USD')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be for EUR to USD
        response.body.data.forEach(rate => {
          expect(rate.fromCurrency).toBe('EUR');
          expect(rate.toCurrency).toBe('USD');
        });
      });

      it('should filter by rate type', async () => {
        const response = await request(app)
          .get('/api/multi-currency/exchange-rates?rateType=spot')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned rates should be spot rates
        response.body.data.forEach(rate => {
          expect(rate.rateType).toBe('spot');
        });
      });

      it('should get latest rates for all currency pairs', async () => {
        const response = await request(app)
          .get('/api/multi-currency/exchange-rates/latest')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Should have one rate per currency pair (latest)
        const uniquePairs = new Set(
          response.body.data.map(rate => `${rate.fromCurrency}-${rate.toCurrency}`)
        );
        expect(uniquePairs.size).toBe(response.body.data.length);
      });

      it('should provide rate history for a currency pair', async () => {
        const response = await request(app)
          .get('/api/multi-currency/exchange-rates/history?from=EUR&to=USD&period=30days')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('rates');
        expect(response.body.data).toHaveProperty('statistics');
        expect(response.body.data.statistics).toHaveProperty('average');
        expect(response.body.data.statistics).toHaveProperty('high');
        expect(response.body.data.statistics).toHaveProperty('low');
        expect(response.body.data.statistics).toHaveProperty('volatility');
      });

      it('should calculate cross rates when direct rate not available', async () => {
        const response = await request(app)
          .get('/api/multi-currency/exchange-rates/cross-rate?from=JPY&to=GBP')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('rate');
        expect(response.body.data).toHaveProperty('method', 'calculated');
        expect(response.body.data.rate).toBeGreaterThan(0);
      });
    });

    describe('PUT /api/multi-currency/exchange-rates/:id', () => {
      let createdRateId;

      beforeEach(async () => {
        const rate = new CurrencyRate({
          fromCurrency: 'NOK',
          toCurrency: 'USD',
          rate: 0.0950,
          rateDate: '2025-01-01',
          rateType: 'spot',
          source: 'Norges Bank',
          isActive: true
        });
        const saved = await rate.save();
        createdRateId = saved._id;
      });

      it('should update exchange rate', async () => {
        const updateData = {
          rate: 0.0985,
          source: 'Updated Source'
        };

        const response = await request(app)
          .put(`/api/multi-currency/exchange-rates/${createdRateId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.rate).toBe(updateData.rate);
        expect(response.body.data.source).toBe(updateData.source);
      });

      it('should prevent updating expired rates', async () => {
        // Create an expired rate
        const expiredRate = new CurrencyRate({
          fromCurrency: 'DKK',
          toCurrency: 'USD',
          rate: 0.1450,
          rateDate: '2024-12-01',
          rateType: 'forward',
          source: 'Danmarks Nationalbank',
          validUntil: '2024-12-31',
          isActive: true
        });
        const saved = await expiredRate.save();

        const updateData = {
          rate: 0.1500
        };

        const response = await request(app)
          .put(`/api/multi-currency/exchange-rates/${saved._id}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('expired');
      });
    });

    describe('POST /api/multi-currency/exchange-rates/bulk-update', () => {
      it('should bulk update exchange rates from external source', async () => {
        const bulkUpdateData = {
          source: 'European Central Bank',
          updateType: 'daily_rates',
          rates: [
            {
              fromCurrency: 'EUR',
              toCurrency: 'USD',
              rate: 1.0875,
              rateDate: '2025-01-02'
            },
            {
              fromCurrency: 'EUR',
              toCurrency: 'GBP',
              rate: 0.8600,
              rateDate: '2025-01-02'
            },
            {
              fromCurrency: 'EUR',
              toCurrency: 'JPY',
              rate: 159.50,
              rateDate: '2025-01-02'
            }
          ]
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates/bulk-update')
          .set('Authorization', authToken)
          .send(bulkUpdateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.updated).toBe(3);
        expect(response.body.data.errors).toHaveLength(0);
      });

      it('should handle bulk update with partial failures', async () => {
        const bulkUpdateData = {
          source: 'Test Source',
          updateType: 'test_rates',
          rates: [
            {
              fromCurrency: 'EUR',
              toCurrency: 'USD',
              rate: 1.0900,
              rateDate: '2025-01-02'
            },
            {
              fromCurrency: 'INVALID',
              toCurrency: 'USD', // Invalid currency
              rate: 1.0000,
              rateDate: '2025-01-02'
            },
            {
              fromCurrency: 'GBP',
              toCurrency: 'USD',
              rate: -1.0000, // Invalid rate
              rateDate: '2025-01-02'
            }
          ]
        };

        const response = await request(app)
          .post('/api/multi-currency/exchange-rates/bulk-update')
          .set('Authorization', authToken)
          .send(bulkUpdateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.updated).toBe(1);
        expect(response.body.data.errors).toHaveLength(2);
      });
    });
  });

  describe('Currency Conversion', () {
    describe('POST /api/multi-currency/convert', () => {
      it('should convert amount between two currencies', async () => {
        const conversionRequest = {
          amount: 1000,
          fromCurrency: 'EUR',
          toCurrency: 'USD',
          rateDate: '2025-01-01',
          conversionType: 'spot'
        };

        const response = await request(app)
          .post('/api/multi-currency/convert')
          .set('Authorization', authToken)
          .send(conversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.convertedAmount).toBeCloseTo(1085, 2); // 1000 * 1.085
        expect(response.body.data.exchangeRate).toBe(1.085);
        expect(response.body.data.rateDate).toBe(conversionRequest.rateDate);
      });

      it('should handle cross currency conversion', async () => {
        const conversionRequest = {
          amount: 500,
          fromCurrency: 'GBP',
          toCurrency: 'JPY',
          rateDate: '2025-01-01',
          conversionType: 'spot'
        };

        const response = await request(app)
          .post('/api/multi-currency/convert')
          .set('Authorization', authToken)
          .send(conversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.convertedAmount).toBeGreaterThan(0);
        expect(response.body.data.method).toBe('cross_rate');
      });

      it('should use forward rates when specified', async () => {
        const conversionRequest = {
          amount: 2000,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rateDate: '2025-01-15',
          conversionType: 'forward',
          forwardDate: '2025-03-31'
        };

        const response = await request(app)
          .post('/api/multi-currency/convert')
          .set('Authorization', authToken)
          .send(conversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.rateType).toBe('forward');
        expect(response.body.data.forwardRate).toBeDefined();
      });

      it('should validate conversion parameters', async () => {
        const invalidRequest = {
          amount: -100, // Invalid: negative amount
          fromCurrency: 'EUR',
          toCurrency: 'USD'
        };

        const response = await request(app)
          .post('/api/multi-currency/convert')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('amount must be positive');
      });

      it('should handle currency with different decimal places', async () => {
        const conversionRequest = {
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'JPY',
          rateDate: '2025-01-01'
        };

        const response = await request(app)
          .post('/api/multi-currency/convert')
          .set('Authorization', authToken)
          .send(conversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.convertedAmount).toBeCloseTo(14706, 0); // JPY has 0 decimal places
        expect(response.body.data.precision).toBe(0);
      });
    });

    describe('POST /api/multi-currency/bulk-convert', () => {
      it('should convert multiple amounts in one request', async () => {
        const bulkConversionRequest = {
          conversions: [
            {
              amount: 1000,
              fromCurrency: 'EUR',
              toCurrency: 'USD',
              transactionId: 'TXN-001'
            },
            {
              amount: 500,
              fromCurrency: 'GBP',
              toCurrency: 'USD',
              transactionId: 'TXN-002'
            },
            {
              amount: 10000,
              fromCurrency: 'JPY',
              toCurrency: 'USD',
              transactionId: 'TXN-003'
            }
          ],
          rateDate: '2025-01-01'
        };

        const response = await request(app)
          .post('/api/multi-currency/bulk-convert')
          .set('Authorization', authToken)
          .send(bulkConversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3);
        expect(response.body.data[0].convertedAmount).toBeCloseTo(1085, 2);
        expect(response.body.data[1].convertedAmount).toBeCloseTo(632.5, 2);
        expect(response.body.data[2].convertedAmount).toBeCloseTo(68, 2);
      });

      it('should handle partial failures in bulk conversion', async () => {
        const bulkConversionRequest = {
          conversions: [
            {
              amount: 1000,
              fromCurrency: 'EUR',
              toCurrency: 'USD',
              transactionId: 'TXN-001'
            },
            {
              amount: 500,
              fromCurrency: 'INVALID',
              toCurrency: 'USD',
              transactionId: 'TXN-002'
            }
          ],
          rateDate: '2025-01-01'
        };

        const response = await request(app)
          .post('/api/multi-currency/bulk-convert')
          .set('Authorization', authToken)
          .send(bulkConversionRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].success).toBe(true);
        expect(response.body.data[1].success).toBe(false);
        expect(response.body.data[1].error).toBeDefined();
      });
    });
  });

  describe('Multi-Currency Transaction Processing', () => {
    describe('POST /api/multi-currency/transactions', () => {
      it('should create multi-currency transaction with conversion', async () => {
        const transactionData = {
          description: 'Equipment purchase from Germany',
          amount: 25000,
          currency: 'EUR',
          baseCurrency: 'USD',
          transactionDate: '2025-01-30',
          category: 'Capital Expenditure',
          department: 'Manufacturing',
          autoConvert: true,
          conversionType: 'spot'
        };

        const response = await request(app)
          .post('/api/multi-currency/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.amount).toBe(transactionData.amount);
        expect(response.body.data.currency).toBe(transactionData.currency);
        expect(response.body.data.amountInBase).toBeGreaterThan(0);
        expect(response.body.data.exchangeRate).toBeDefined();
      });

      it('should create transaction with manual exchange rate', async () => {
        const transactionData = {
          description: 'Consulting services',
          amount: 15000,
          currency: 'GBP',
          baseCurrency: 'USD',
          transactionDate: '2025-01-30',
          exchangeRate: 1.2700, // Manual rate
          category: 'Professional Services',
          department: 'R&D'
        };

        const response = await request(app)
          .post('/api/multi-currency/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.exchangeRate).toBe(1.2700);
        expect(response.body.data.amountInBase).toBeCloseTo(19050, 2); // 15000 * 1.2700
      });

      it('should validate transaction dates and rates', async () => {
        const transactionData = {
          description: 'Future dated transaction',
          amount: 1000,
          currency: 'EUR',
          baseCurrency: 'USD',
          transactionDate: '2025-12-31', // Future date
          exchangeRate: 1.0850,
          category: 'Test',
          department: 'Testing'
        };

        const response = await request(app)
          .post('/api/multi-currency/transactions')
          .set('Authorization', authToken)
          .send(transactionData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('future date');
      });
    });

    describe('GET /api/multi-currency/transactions', () => {
      beforeEach(async () => {
        // Create additional transactions for testing
        const additionalTransactions = [
          {
            transactionId: 'TXN-004',
            description: 'Indian software licensing',
            amount: 500000,
            currency: 'INR',
            amountInBase: 6000,
            baseCurrency: 'USD',
            transactionDate: '2025-01-15',
            exchangeRate: 0.0120,
            category: 'Software',
            department: 'IT'
          },
          {
            transactionId: 'TXN-005',
            description: 'Chinese component manufacturing',
            amount: 100000,
            currency: 'CNY',
            amountInBase: 13800,
            baseCurrency: 'USD',
            transactionDate: '2025-01-20',
            exchangeRate: 0.1380,
            category: 'Raw Materials',
            department: 'Manufacturing'
          }
        ];
        await CurrencyExchange.insertMany(additionalTransactions);
      });

      it('should retrieve transactions by currency', async () => {
        const response = await request(app)
          .get('/api/multi-currency/transactions?currency=EUR')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned transactions should be in EUR
        response.body.data.forEach(transaction => {
          expect(transaction.currency).toBe('EUR');
        });
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .get('/api/multi-currency/transactions?startDate=2025-01-15&endDate=2025-01-25')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All transactions should be within date range
        response.body.data.forEach(transaction => {
          const transactionDate = new Date(transaction.transactionDate);
          expect(transactionDate).toBeGreaterThanOrEqual(new Date('2025-01-15'));
          expect(transactionDate).toBeLessThanOrEqual(new Date('2025-01-25'));
        });
      });

      it('should provide multi-currency summary', async () => {
        const response = await request(app)
          .get('/api/multi-currency/transactions?summary=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary).toHaveProperty('byCurrency');
        expect(response.body.summary).toHaveProperty('totalInBase');
        expect(response.body.summary).toHaveProperty('exchangeRateStats');
      });

      it('should calculate unrealized currency gains/losses', async () => {
        const response = await request(app)
          .get('/api/multi-currency/transactions?includeUnrealized=true&asOfDate=2025-02-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        // Each transaction should have unrealized P&L
        response.body.data.forEach(transaction => {
          expect(transaction).toHaveProperty('unrealizedGainLoss');
          expect(transaction).toHaveProperty('currentValue');
          expect(transaction).toHaveProperty('originalValue');
        });
      });
    });

    describe('PUT /api/multi-currency/transactions/:id', () => {
      let createdTransactionId;

      beforeEach(async () => {
        const transaction = new CurrencyExchange({
          transactionId: 'UPDATE-TEST',
          description: 'Test transaction for update',
          amount: 5000,
          currency: 'EUR',
          amountInBase: 5425,
          baseCurrency: 'USD',
          transactionDate: '2025-01-15',
          exchangeRate: 1.085,
          category: 'Test',
          department: 'Testing'
        });
        const saved = await transaction.save();
        createdTransactionId = saved._id;
      });

      it('should update transaction with new exchange rate', async () => {
        const updateData = {
          exchangeRate: 1.0950, // New rate
          description: 'Updated transaction description'
        };

        const response = await request(app)
          .put(`/api/multi-currency/transactions/${createdTransactionId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.exchangeRate).toBe(updateData.exchangeRate);
        expect(response.body.data.description).toBe(updateData.description);
        expect(response.body.data.amountInBase).toBeCloseTo(5475, 2); // 5000 * 1.095
      });

      it('should prevent changing currency after transaction creation', async () => {
        const updateData = {
          currency: 'GBP' // Attempt to change currency
        };

        const response = await request(app)
          .put(`/api/multi-currency/transactions/${createdTransactionId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('currency cannot be changed');
      });
    });
  });

  describe('Multi-Currency Reporting', () => {
    describe('GET /api/multi-currency/reports/currency-summary', () => {
      it('should generate currency exposure report', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/currency-summary?asOfDate=2025-01-31')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('exposureByCurrency');
        expect(response.body.data).toHaveProperty('totalExposure');
        expect(response.body.data).toHaveProperty('riskMetrics');
        expect(response.body.data.exposureByCurrency).toBeInstanceOf(Array);
      });

      it('should provide transaction volume analysis', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/currency-summary?analysis=volume&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('volumeAnalysis');
        expect(response.body.data).toHaveProperty('topCurrencies');
        expect(response.body.data).toHaveProperty('trends');
      });

      it('should calculate currency diversification metrics', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/currency-summary?includeDiversification=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('diversificationMetrics');
        expect(response.body.data.diversificationMetrics).toHaveProperty('herfindahlIndex');
        expect(response.body.data.diversificationMetrics).toHaveProperty('top3Concentration');
      });
    });

    describe('GET /api/multi-currency/reports/gain-loss', () => {
      it('should calculate realized currency gains and losses', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/gain-loss?type=realized&period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        response.body.data.forEach(entry => {
          expect(entry).toHaveProperty('currency');
          expect(entry).toHaveProperty('realizedGainLoss');
          expect(entry).toHaveProperty('transactionCount');
        });
      });

      it('should calculate unrealized currency gains and losses', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/gain-loss?type=unrealized&asOfDate=2025-02-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        response.body.data.forEach(entry => {
          expect(entry).toHaveProperty('unrealizedGainLoss');
          expect(entry).toHaveProperty('currentRate');
          expect(entry).toHaveProperty('originalRate');
        });
      });
    });

    describe('GET /api/multi-currency/reports/hedging-analysis', () => {
      it('should analyze currency hedging effectiveness', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/hedging-analysis?period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('hedgedExposure');
        expect(response.body.data).toHaveProperty('unhedgedExposure');
        expect(response.body.data).toHaveProperty('hedgingEffectiveness');
        expect(response.body.data).toHaveProperty('costBenefitAnalysis');
      });

      it('should recommend hedging strategies', async () => {
        const response = await request(app)
          .get('/api/multi-currency/reports/hedging-analysis?recommendations=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('recommendations');
        expect(response.body.data.recommendations).toBeInstanceOf(Array);
        
        response.body.data.recommendations.forEach(rec => {
          expect(rec).toHaveProperty('currency');
          expect(rec).toHaveProperty('recommendedAction');
          expect(rec).toHaveProperty('potentialBenefit');
        });
      });
    });
  });

  describe('Foreign Exchange Risk Management', () => {
    describe('POST /api/multi-currency/risk-assessment', () => {
      it('should perform currency risk assessment', async () => {
        const riskAssessment = {
          assessmentDate: '2025-01-31',
          timeHorizon: '3months',
          confidenceLevel: 95,
          currencies: ['EUR', 'GBP', 'JPY'],
          includeCorrelations: true
        };

        const response = await request(app)
          .post('/api/multi-currency/risk-assessment')
          .set('Authorization', authToken)
          .send(riskAssessment)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('varAnalysis');
        expect(response.body.data).toHaveProperty('stressTests');
        expect(response.body.data).toHaveProperty('correlations');
        expect(response.body.data.varAnalysis).toHaveProperty('dailyVaR');
        expect(response.body.data.varAnalysis).toHaveProperty('monthlyVaR');
      });

      it('should generate stress test scenarios', async () => {
        const riskAssessment = {
          assessmentDate: '2025-01-31',
          stressScenarios: [
            {
              name: 'Euro Crisis',
              description: 'EUR/USD drops 15%',
              currencyChanges: { EUR: -0.15 }
            },
            {
              name: 'Global Risk Off',
              description: 'All currencies vs USD strengthen',
              currencyChanges: { EUR: 0.10, GBP: 0.12, JPY: 0.08 }
            }
          ]
        };

        const response = await request(app)
          .post('/api/multi-currency/risk-assessment')
          .set('Authorization', authToken)
          .send(riskAssessment)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.stressTests).toHaveLength(2);
        expect(response.body.data.stressTests[0]).toHaveProperty('impact');
        expect(response.body.data.stressTests[0]).toHaveProperty('probability');
      });
    });

    describe('GET /api/multi-currency/risk-monitoring', () => {
      it('should monitor real-time currency exposure', async () => {
        const response = await request(app)
          .get('/api/multi-currency/risk-monitoring?realTime=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('currentExposure');
        expect(response.body.data).toHaveProperty('limits');
        expect(response.body.data).toHaveProperty('breaches');
        expect(response.body.data).toHaveProperty('alerts');
      });

      it('should track exposure limits and breaches', async () => {
        const response = await request(app)
          .get('/api/multi-currency/risk-monitoring?includeLimits=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.limits).toBeInstanceOf(Array);
        expect(response.body.data.breaches).toBeInstanceOf(Array);
        
        response.body.data.limits.forEach(limit => {
          expect(limit).toHaveProperty('currency');
          expect(limit).toHaveProperty('limitAmount');
          expect(limit).toHaveProperty('limitType');
        });
      });
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      // Create large dataset for performance testing
      const transactions = [];
      const rates = [];

      for (let i = 0; i < 1000; i++) {
        transactions.push({
          transactionId: `PERF-TXN-${i.toString().padStart(4, '0')}`,
          description: `Performance test transaction ${i}`,
          amount: 1000 + (i * 10),
          currency: ['USD', 'EUR', 'GBP', 'JPY'][i % 4],
          amountInBase: 1000 + (i * 10),
          baseCurrency: 'USD',
          transactionDate: `2025-01-${(i % 30) + 1}`,
          exchangeRate: 1.0 + (i * 0.001),
          category: `Category ${Math.floor(i / 100)}`,
          department: `Department ${Math.floor(i / 250)}`
        });

        rates.push({
          fromCurrency: ['USD', 'EUR', 'GBP'][i % 3],
          toCurrency: ['EUR', 'GBP', 'USD'][i % 3],
          rate: 1.0 + (i * 0.0001),
          rateDate: `2025-01-${(i % 30) + 1}`,
          rateType: 'spot',
          source: 'Performance Test',
          isActive: true
        });
      }

      await CurrencyExchange.insertMany(transactions);
      await CurrencyRate.insertMany(rates);
    });

    it('should handle large volume of currency conversions efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/multi-currency/bulk-convert')
        .set('Authorization', authToken)
        .send({
          conversions: Array.from({length: 100}, (_, i) => ({
            amount: 1000 + i,
            fromCurrency: ['USD', 'EUR', 'GBP'][i % 3],
            toCurrency: ['EUR', 'GBP', 'USD'][i % 3],
            transactionId: `PERF-CONV-${i}`
          })),
          rateDate: '2025-01-01'
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(5000); // Should handle 100 conversions within 5 seconds
    });

    it('should efficiently query large transaction datasets', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/multi-currency/transactions?limit=100&page=1&currency=EUR')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(100);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should maintain performance with complex aggregations', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/multi-currency/reports/currency-summary?analysis=detailed')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(10000); // Complex aggregations should complete within 10 seconds
    });
  });

  describe('Security and Authorization', () => {
    it('should require authentication for currency operations', async () => {
      const currencyData = {
        code: 'TEST',
        name: 'Test Currency',
        decimalPlaces: 2
      };

      const response = await request(app)
        .post('/api/multi-currency/currencies')
        .send(currencyData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate user permissions for rate updates', async () => {
      // Mock user with limited permissions
      jest.spyOn(require('../middleware/auth'), 'authenticate')
        .mockImplementation((req, res, next) => {
          req.user = { id: 'limited-user', role: 'viewer' };
          next();
        });

      const rateData = {
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        rate: 1.0900,
        rateDate: '2025-01-02',
        rateType: 'spot',
        source: 'Test'
      };

      const response = await request(app)
        .post('/api/multi-currency/exchange-rates')
        .set('Authorization', authToken)
        .send(rateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should sanitize currency data to prevent injection', async () => {
      const maliciousData = {
        code: 'USD<script>alert("xss")</script>',
        name: 'US Dollar<script>alert("xss")</script>',
        countries: ['USA<script>alert("xss")</script>']
      };

      const response = await request(app)
        .post('/api/multi-currency/currencies')
        .set('Authorization', authToken)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify data is sanitized
      expect(response.body.data.code).not.toContain('<script>');
      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.countries[0]).not.toContain('<script>');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing exchange rates gracefully', async () => {
      const conversionRequest = {
        amount: 1000,
        fromCurrency: 'UNKNOWN',
        toCurrency: 'USD',
        rateDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/multi-currency/convert')
        .set('Authorization', authToken)
        .send(conversionRequest)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exchange rate not found');
    });

    it('should handle expired exchange rates', async () => {
      const conversionRequest = {
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rateDate: '2025-04-01', // Date after forward rate expiry
        conversionType: 'forward'
      };

      const response = await request(app)
        .post('/api/multi-currency/convert')
        .set('Authorization', authToken)
        .send(conversionRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });

    it('should validate decimal precision for different currencies', async () => {
      const transactionData = {
        description: 'Precision test',
        amount: 100.123456, // Too many decimal places for most currencies
        currency: 'USD',
        baseCurrency: 'USD',
        transactionDate: '2025-01-30',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/multi-currency/transactions')
        .set('Authorization', authToken)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exceeds decimal precision');
    });

    it('should handle circular currency conversion references', async () => {
      // This would be an edge case where A->B, B->C, C->A rates exist
      // but we try to convert A->A through the chain
      const conversionRequest = {
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'USD', // Same currency, but might trigger chain logic
        rateDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/multi-currency/convert')
        .set('Authorization', authToken)
        .send(conversionRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedAmount).toBe(1000); // Should be 1:1 for same currency
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain referential integrity for exchange rates', async () => {
      // Create transaction with specific exchange rate
      const transaction = new CurrencyExchange({
        transactionId: 'REF-TEST',
        description: 'Referential integrity test',
        amount: 1000,
        currency: 'EUR',
        amountInBase: 1085,
        baseCurrency: 'USD',
        transactionDate: '2025-01-15',
        exchangeRate: 1.085,
        category: 'Test',
        department: 'Testing'
      });
      await transaction.save();

      // Try to delete the currency used in transaction
      const response = await request(app)
        .delete('/api/multi-currency/currencies/EUR?hardDelete=true')
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('referenced by transactions');
    });

    it('should validate exchange rate consistency', async () => {
      // Create reciprocal rates that should be consistent
      const rate1 = {
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        rate: 1.0850,
        rateDate: '2025-01-01',
        rateType: 'spot',
        source: 'Test'
      };

      const rate2 = {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.9210, // Should be 1/1.0850 = 0.9216 approximately
        rateDate: '2025-01-01',
        rateType: 'spot',
        source: 'Test'
      };

      const response1 = await request(app)
        .post('/api/multi-currency/exchange-rates')
        .set('Authorization', authToken)
        .send(rate1)
        .expect(201);

      expect(response1.body.success).toBe(true);

      const response2 = await request(app)
        .post('/api/multi-currency/exchange-rates')
        .set('Authorization', authToken)
        .send(rate2)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.consistencyWarning).toBeDefined();
    });

    it('should maintain audit trail for all currency operations', async () => {
      const currencyData = {
        code: 'AUDIT',
        name: 'Audit Trail Currency',
        symbol: 'A$',
        decimalPlaces: 2,
        isActive: true
      };

      const response = await request(app)
        .post('/api/multi-currency/currencies')
        .set('Authorization', authToken)
        .send(currencyData)
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
    it('should sync exchange rates from multiple central banks', async () => {
      const syncData = {
        sources: [
          {
            source: 'ECB',
            endpoint: 'https://api.ecb.europa.eu/eurofxref',
            currencies: ['EUR', 'USD', 'GBP', 'JPY']
          },
          {
            source: 'Federal Reserve',
            endpoint: 'https://api.federalreserve.gov',
            currencies: ['USD', 'EUR', 'GBP']
          }
        ],
        syncDate: '2025-01-02'
      };

      const response = await request(app)
        .post('/api/multi-currency/sync/external-rates')
        .set('Authorization', authToken)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sources');
      expect(response.body.data).toHaveProperty('totalRates');
      expect(response.body.data).toHaveProperty('conflicts');
    });

    it('should integrate with treasury management systems', async () => {
      const treasuryData = {
        system: 'treasury_management',
        dataType: 'hedging_positions',
        data: [
          {
            currency: 'EUR',
            exposure: 500000,
            hedgeAmount: 400000,
            hedgeType: 'forward',
            hedgeRate: 1.0900,
            maturityDate: '2025-06-30'
          },
          {
            currency: 'GBP',
            exposure: 300000,
            hedgeAmount: 250000,
            hedgeType: 'option',
            hedgeRate: 1.2700,
            maturityDate: '2025-09-30'
          }
        ]
      };

      const response = await request(app)
        .post('/api/multi-currency/integrations/treasury')
        .set('Authorization', authToken)
        .send(treasuryData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrated).toBe(2);
      expect(response.body.data.hedgeAnalysis).toBeDefined();
    });

    it('should export data for business intelligence tools', async () => {
      const exportRequest = {
        format: 'csv',
        dataTypes: ['transactions', 'rates', 'exposures'],
        dateRange: {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        },
        includeCalculations: true
      };

      const response = await request(app)
        .post('/api/multi-currency/export/bi-tools')
        .set('Authorization', authToken)
        .send(exportRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fileName');
      expect(response.body.data).toHaveProperty('fileSize');
      expect(response.body.data).toHaveProperty('downloadUrl');
    });
  });
});