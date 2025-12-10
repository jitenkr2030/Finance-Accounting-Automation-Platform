const request = require('supertest');
const app = require('../server');
const { generateAuthToken } = require('./helpers/TestHelpers');
const Forecast = require('../models/Forecast');

describe('Financial Forecasting API Tests', () => {
  let authToken;
  let testForecast;
  let managerToken;

  beforeAll(async () => {
    authToken = await generateAuthToken('accountant');
    managerToken = await generateAuthToken('manager');
    
    // Create test forecast
    testForecast = await Forecast.create({
      name: 'Revenue Forecast 2024',
      type: 'revenue',
      period: '2024-01',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      data: [
        { period: '2024-01', predicted: 100000, actual: 95000, variance: -5000 },
        { period: '2024-02', predicted: 105000, actual: 110000, variance: 5000 },
        { period: '2024-03', predicted: 110000, actual: null, variance: null }
      ],
      confidence: 85,
      model: 'LSTM_Neural_Network',
      status: 'active'
    });
  });

  afterAll(async () => {
    if (testForecast) {
      await Forecast.findByIdAndDelete(testForecast._id);
    }
  });

  describe('POST /api/forecasting/create', () => {
    test('should create a new forecast', async () => {
      const forecastData = {
        name: 'Expense Forecast Q1 2024',
        type: 'expense',
        period: '2024-Q1',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        historicalData: {
          '2023-01': 80000,
          '2023-02': 85000,
          '2023-03': 90000,
          '2023-04': 87000,
          '2023-05': 92000,
          '2023-06': 88000
        },
        parameters: {
          seasonality: true,
          trendAnalysis: true,
          externalFactors: ['economic_indicators', 'market_conditions']
        }
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(forecastData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(forecastData.name);
      expect(response.body.data.type).toBe(forecastData.type);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.confidence).toBeDefined();
      expect(response.body.data.model).toBeDefined();
    });

    test('should create cash flow forecast', async () => {
      const cashFlowData = {
        name: 'Cash Flow Forecast 2024',
        type: 'cash_flow',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        historicalData: {
          inflows: {
            '2023-01': 500000, '2023-02': 520000, '2023-03': 480000,
            '2023-04': 550000, '2023-05': 530000, '2023-06': 510000
          },
          outflows: {
            '2023-01': 300000, '2023-02': 320000, '2023-03': 310000,
            '2023-04': 330000, '2023-05': 315000, '2023-06': 325000
          }
        },
        scenarios: ['optimistic', 'realistic', 'pessimistic']
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(cashFlowData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('cash_flow');
      expect(response.body.data.scenarios).toBeDefined();
      expect(response.body.data.predictedInflows).toBeDefined();
      expect(response.body.data.predictedOutflows).toBeDefined();
    });

    test('should validate required fields', async () => {
      const invalidData = {
        name: '', // Empty name
        type: '', // Empty type
        startDate: '2024-01-01',
        endDate: '2023-01-01' // End date before start date
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/forecasting', () => {
    test('should get all forecasts', async () => {
      const response = await request(app)
        .get('/api/forecasting')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter forecasts by type', async () => {
      const response = await request(app)
        .get('/api/forecasting?type=revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      });

    test('should filter forecasts by status', async () => {
      const response = await request(app)
        .get('/api/forecasting?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should search forecasts by name', async () => {
      const response = await request(app)
        .get('/api/forecasting?search=Revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/forecasting?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/forecasting/:id', () => {
    test('should get forecast by ID', async () => {
      const response = await request(app)
        .get(`/api/forecasting/${testForecast._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testForecast._id.toString());
      expect(response.body.data.name).toBe(testForecast.name);
      expect(response.body.data.type).toBe(testForecast.type);
      expect(response.body.data.data).toBeDefined();
    });

    test('should return 404 for non-existent forecast', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/forecasting/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/forecasting/:id', () => {
    test('should update forecast details', async () => {
      const updateData = {
        name: 'Updated Revenue Forecast 2024',
        confidence: 90,
        parameters: {
          seasonality: true,
          trendAnalysis: false,
          externalFactors: ['market_conditions', 'competitor_analysis']
        }
      };

      const response = await request(app)
        .put(`/api/forecasting/${testForecast._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.confidence).toBe(updateData.confidence);
    });

    test('should not update forecast type', async () => {
      const updateData = {
        type: 'expense', // Different from original 'revenue'
        name: 'Updated Name'
      };

      const response = await request(app)
        .put(`/api/forecasting/${testForecast._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/forecasting/:id/retrain', () => {
    test('should retrain forecast model with new data', async () => {
      const newData = {
        additionalData: {
          '2024-04': 115000,
          '2024-05': 120000,
          '2024-06': 125000
        },
        parameters: {
          modelType: 'ARIMA',
          confidenceLevel: 0.95,
          seasonalityPeriod: 12
        }
      };

      const response = await request(app)
        .post(`/api/forecasting/${testForecast._id}/retrain`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(newData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.confidence).toBeGreaterThan(testForecast.confidence);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    test('should handle insufficient data for retraining', async () => {
      const insufficientData = {
        additionalData: {
          '2024-04': 115000 // Only one data point
        }
      };

      const response = await request(app)
        .post(`/api/forecasting/${testForecast._id}/retrain`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(insufficientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient');
    });
  });

  describe('POST /api/forecasting/:id/scenario', () => {
    test('should create forecast scenario', async () => {
      const scenarioData = {
        scenarioName: 'Economic Downturn',
        scenarioType: 'pessimistic',
        adjustments: {
          revenue: -0.15, // 15% reduction
          expenses: 0.05, // 5% increase
          marketConditions: 'recession'
        },
        probability: 0.2 // 20% probability
      };

      const response = await request(app)
        .post(`/api/forecasting/${testForecast._id}/scenario`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(scenarioData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.scenarioName).toBe(scenarioData.scenarioName);
      expect(response.body.data.adjustments).toBeDefined();
      expect(response.body.data.predictedValues).toBeDefined();
    });

    test('should create multiple scenarios', async () => {
      const scenarios = [
        {
          scenarioName: 'Best Case',
          scenarioType: 'optimistic',
          adjustments: { revenue: 0.2, expenses: -0.1 },
          probability: 0.3
        },
        {
          scenarioName: 'Worst Case',
          scenarioType: 'pessimistic',
          adjustments: { revenue: -0.2, expenses: 0.15 },
          probability: 0.1
        }
      ];

      for (const scenario of scenarios) {
        const response = await request(app)
          .post(`/api/forecasting/${testForecast._id}/scenario`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send(scenario)
          .expect(201);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('GET /api/forecasting/:id/comparison', () => {
    test('should compare forecast with actual results', async () => {
      const response = await request(app)
        .get(`/api/forecasting/${testForecast._id}/comparison`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accuracy).toBeDefined();
      expect(response.body.data.meanAbsoluteError).toBeDefined();
      expect(response.body.data.meanAbsolutePercentageError).toBeDefined();
      expect(response.body.data.comparison).toBeDefined();
    });

    test('should calculate forecast accuracy metrics', async () => {
      const response = await request(app)
        .get(`/api/forecasting/${testForecast._id}/comparison?metrics=all`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accuracy).toBeGreaterThan(0);
      expect(response.body.data.accuracy).toBeLessThanOrEqual(100);
      expect(response.body.data.rSquared).toBeDefined();
      expect(response.body.data.rootMeanSquareError).toBeDefined();
    });
  });

  describe('GET /api/forecasting/reports/performance', () => {
    test('should get forecast performance report', async () => {
      const response = await request(app)
        .get('/api/forecasting/reports/performance?year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overallAccuracy).toBeDefined();
      expect(response.body.data.modelPerformance).toBeDefined();
      expect(response.body.data.accuracyByType).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });

    test('should filter performance by forecast type', async () => {
      const response = await request(app)
        .get('/api/forecasting/reports/performance?type=revenue&year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overallAccuracy).toBeDefined();
    });
  });

  describe('GET /api/forecasting/reports/trends', () => {
    test('should get trend analysis report', async () => {
      const response = await request(app)
        .get('/api/forecasting/reports/trends?startDate=2023-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trendAnalysis).toBeDefined();
      expect(response.body.data.seasonality).toBeDefined();
      expect(response.body.data.cyclicalPatterns).toBeDefined();
      expect(response.body.data.growthRates).toBeDefined();
    });

    test('should identify seasonal patterns', async () => {
      const response = await request(app)
        .get('/api/forecasting/reports/trends?analysis=seasonal&period=monthly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.seasonalIndices).toBeDefined();
      expect(response.body.data.seasonalStrength).toBeDefined();
    });
  });

  describe('POST /api/forecasting/:id/alerts', () => {
    test('should set forecast alerts', async () => {
      const alertData = {
        alertType: 'accuracy_threshold',
        threshold: 80, // Alert if accuracy drops below 80%
        conditions: {
          consecutiveMisses: 3,
          varianceThreshold: 0.15
        },
        recipients: ['manager@example.com', 'analyst@example.com']
      };

      const response = await request(app)
        .post(`/api/forecasting/${testForecast._id}/alerts`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(alertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.alertType).toBe(alertData.alertType);
      expect(response.body.data.threshold).toBe(alertData.threshold);
    });

    test('should configure variance alerts', async () => {
      const alertData = {
        alertType: 'variance_threshold',
        threshold: 0.2, // 20% variance
        conditions: {
          rollingPeriod: 3,
          absoluteVariance: 50000
        },
        enabled: true
      };

      const response = await request(app)
        .post(`/api/forecasting/${testForecast._id}/alerts`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(alertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.alertType).toBe('variance_threshold');
    });
  });

  describe('GET /api/forecasting/alerts', () => {
    test('should get active forecast alerts', async () => {
      const response = await request(app)
        .get('/api/forecasting/alerts?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter alerts by forecast', async () => {
      const response = await request(app)
        .get(`/api/forecasting/alerts?forecastId=${testForecast._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/forecasting/:id', () => {
    test('should delete forecast', async () => {
      const response = await request(app)
        .delete(`/api/forecasting/${testForecast._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    test('should not allow non-manager to delete forecast', async () => {
      const response = await request(app)
        .delete(`/api/forecasting/${testForecast._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/forecasting/batch-create', () => {
    test('should create multiple forecasts in batch', async () => {
      const batchData = {
        forecasts: [
          {
            name: 'Q1 Revenue Forecast',
            type: 'revenue',
            period: '2024-Q1',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            historicalData: { '2023-Q1': 300000, '2023-Q2': 320000 }
          },
          {
            name: 'Q1 Expense Forecast',
            type: 'expense',
            period: '2024-Q1',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            historicalData: { '2023-Q1': 180000, '2023-Q2': 190000 }
          }
        ],
        modelSettings: {
          confidenceLevel: 0.95,
          seasonality: true
        }
      };

      const response = await request(app)
        .post('/api/forecasting/batch-create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(2);
      expect(response.body.data.failed).toBe(0);
    });

    test('should handle batch creation with partial failures', async () => {
      const batchData = {
        forecasts: [
          {
            name: 'Valid Forecast',
            type: 'revenue',
            startDate: '2024-01-01',
            endDate: '2024-03-31'
          },
          {
            name: 'Invalid Forecast',
            type: 'invalid_type',
            startDate: '2024-01-01',
            endDate: '2024-03-31'
          }
        ]
      };

      const response = await request(app)
        .post('/api/forecasting/batch-create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(1);
      expect(response.body.data.failed).toBe(1);
      expect(response.body.data.errors).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with budget management', async () => {
      const forecastData = {
        name: 'Budget-Based Revenue Forecast',
        type: 'revenue',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        useBudgetData: true,
        budgetId: 'budget123'
      };

      const forecastResponse = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(forecastData)
        .expect(201);

      expect(forecastResponse.body.success).toBe(true);

      // Verify forecast uses budget data
      const forecastDetails = await request(app)
        .get(`/api/forecasting/${forecastResponse.body.data._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(forecastDetails.body.data.budgetData).toBeDefined();
    });

    test('should integrate with financial reporting', async () => {
      // Create forecast
      const forecastData = {
        name: 'Reporting Integration Forecast',
        type: 'profit',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        historicalData: { '2023-01': 50000, '2023-02': 55000 }
      };

      const forecastResponse = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(forecastData)
        .expect(201);

      expect(forecastResponse.body.success).toBe(true);

      // Get financial report that includes forecast data
      const reportResponse = await request(app)
        .get('/api/reports/financial?includeForecasts=true&forecastId=' + forecastResponse.body.data._id)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(reportResponse.body.success).toBe(true);
      expect(reportResponse.body.data.forecastData).toBeDefined();
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle insufficient historical data', async () => {
      const insufficientData = {
        name: 'Insufficient Data Forecast',
        type: 'revenue',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        historicalData: {
          '2023-01': 50000 // Only one data point
        }
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(insufficientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient');
    });

    test('should handle invalid forecast parameters', async () => {
      const invalidData = {
        name: 'Invalid Parameters Forecast',
        type: 'revenue',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        parameters: {
          confidenceLevel: 1.5, // Invalid confidence level
          seasonalityPeriod: -12 // Negative period
        }
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle model training errors', async () => {
      const corruptedData = {
        name: 'Corrupted Data Forecast',
        type: 'revenue',
        period: '2024-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        historicalData: {
          'invalid_date': 'invalid_value',
          '2023-01': null,
          '2023-02': 'not_a_number'
        }
      };

      const response = await request(app)
        .post('/api/forecasting/create')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(corruptedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});