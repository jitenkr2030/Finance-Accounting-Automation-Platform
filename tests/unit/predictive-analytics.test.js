/**
 * Predictive Analytics Test Suite
 * Management & Analytics Category
 * Machine Learning Models, Forecasting, and Predictive Business Intelligence
 */

const request = require('supertest');
const mongoose = require('mongoose');

describe('Predictive Analytics Engine', () => {
  let app;
  let testUser;
  let testModel;
  let testForecast;
  let testDataset;
  let authToken;
  
  beforeAll(async () => {
    // Setup test environment
    app = require('../src/app');
    
    // Create test user with analytics permissions
    testUser = await User.create({
      username: 'analytics_data_scientist',
      email: 'datascientist@company.com',
      password: 'TestPassword123!',
      role: 'data_scientist',
      permissions: ['analytics.create', 'analytics.edit', 'analytics.view', 'analytics.delete', 'model.create', 'forecast.generate'],
      companyId: 'test_company_analytics'
    });
    
    // Generate auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'analytics_data_scientist',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: 'datascientist@company.com' });
    await PredictiveModel.deleteMany({});
    await Forecast.deleteMany({});
    await AnalyticsDataset.deleteMany({});
    await ModelTraining.deleteMany({});
    await Prediction.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Predictive Model Management', () => {
    test('should create machine learning model with configuration', async () => {
      const modelData = {
        name: 'Revenue Forecasting Model',
        description: 'Predicts monthly revenue based on historical data and market trends',
        type: 'time_series_forecasting',
        algorithm: 'lstm',
        version: '1.0',
        
        // Model Configuration
        configuration: {
          architecture: {
            layers: [
              {
                type: 'lstm',
                units: 50,
                returnSequences: true,
                inputShape: [12, 10] // 12 months, 10 features
              },
              {
                type: 'dropout',
                rate: 0.2
              },
              {
                type: 'lstm',
                units: 50,
                returnSequences: false
              },
              {
                type: 'dense',
                units: 25,
                activation: 'relu'
              },
              {
                type: 'dense',
                units: 1,
                activation: 'linear'
              }
            ]
          },
          hyperparameters: {
            learningRate: 0.001,
            batchSize: 32,
            epochs: 100,
            validationSplit: 0.2,
            earlyStopping: {
              patience: 10,
              monitor: 'val_loss',
              mode: 'min'
            }
          },
          preprocessing: {
            normalization: 'minmax',
            featureScaling: true,
            outlierDetection: 'iqr',
            missingValueHandling: 'interpolation'
          }
        },
        
        // Training Data Configuration
        dataSource: {
          type: 'historical_financial_data',
          table: 'monthly_revenue',
          timeRange: {
            startDate: '2020-01-01',
            endDate: '2024-12-31'
          },
          features: [
            'monthly_revenue',
            'marketing_spend',
            'customer_acquisition',
            'seasonal_factor',
            'economic_indicator',
            'competitive_index',
            'product_launches',
            'price_changes',
            'employee_count',
            'market_share'
          ],
          targetVariable: 'monthly_revenue',
          timeColumn: 'month',
          frequency: 'monthly'
        },
        
        // Model Performance Requirements
        performance: {
          targetMetrics: {
            mae: 0.05, // Mean Absolute Error
            rmse: 0.08, // Root Mean Square Error
            mape: 0.10, // Mean Absolute Percentage Error
            r2: 0.85 // R-squared
          },
          validationStrategy: 'time_series_split',
          testSetSize: 0.2,
          crossValidationFolds: 5
        },
        
        // Deployment Configuration
        deployment: {
          environment: 'staging',
          autoRetraining: {
            enabled: true,
            frequency: 'monthly',
            triggerConditions: ['performance_degradation', 'data_drift']
          },
          monitoring: {
            enabled: true,
            alertThresholds: {
              accuracyDrop: 0.05,
              predictionInterval: 86400 // 24 hours
            }
          },
          apiEndpoint: '/api/models/revenue-forecast/v1',
          rateLimit: {
            requestsPerMinute: 100,
            burstLimit: 20
          }
        },
        
        // Compliance and Governance
        compliance: {
          explainability: 'required',
          interpretabilityLevel: 'high',
          biasTesting: true,
          fairnessConstraints: ['demographic_parity', 'equal_opportunity'],
          auditTrail: true,
          dataLineage: true,
          modelCard: {
            intendedUse: 'Revenue forecasting for business planning',
            limitations: 'Predictions are based on historical patterns and may not account for unprecedented events',
            ethicalConsiderations: 'Model should not be used for discriminatory pricing or resource allocation'
          }
        },
        
        // Access Control
        accessControl: {
          owner: testUser._id,
          viewers: ['finance_team', 'executives', 'data_scientists'],
          editors: ['data_scientists', 'finance_analysts'],
          approvers: ['chief_data_officer']
        },
        
        status: 'draft'
      };
      
      const response = await request(app)
        .post('/api/analytics/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: modelData.name,
        type: modelData.type,
        algorithm: modelData.algorithm,
        version: modelData.version,
        status: modelData.status,
        owner: testUser._id.toString()
      });
      
      testModel = response.body;
    });
    
    test('should validate model configuration and prevent invalid setups', async () => {
      const invalidConfigs = [
        {
          name: 'Invalid Architecture Model',
          algorithm: 'lstm',
          configuration: {
            architecture: {
              layers: [
                {
                  type: 'invalid_layer_type',
                  units: 50
                }
              ]
            }
          },
          expectedError: 'Invalid layer type'
        },
        {
          name: 'Invalid Performance Targets',
          algorithm: 'random_forest',
          performance: {
            targetMetrics: {
              mae: -0.05, // Negative MAE (invalid)
              rmse: 0.08,
              r2: 1.5 // R2 > 1 (invalid)
            }
          },
          expectedError: 'Invalid performance metric'
        },
        {
          name: 'Missing Required Features',
          dataSource: {
            features: ['only_one_feature'], // Too few features
            targetVariable: 'revenue'
          },
          expectedError: 'Insufficient features'
        }
      ];
      
      for (const config of invalidConfigs) {
        const response = await request(app)
          .post('/api/analytics/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send(config)
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            message: expect.stringContaining(config.expectedError)
          })
        );
      }
    });
    
    test('should manage model versioning and lifecycle', async () => {
      // Create model version 1.0
      const v1Model = {
        name: 'Churn Prediction Model',
        version: '1.0',
        type: 'classification',
        algorithm: 'gradient_boosting',
        configuration: {
          hyperparameters: {
            n_estimators: 100,
            learning_rate: 0.1,
            max_depth: 6
          }
        },
        status: 'production'
      };
      
      const v1Response = await request(app)
        .post('/api/analytics/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(v1Model)
        .expect(201);
      
      // Create version 1.1 with improvements
      const v11Model = {
        name: 'Churn Prediction Model',
        version: '1.1',
        type: 'classification',
        algorithm: 'gradient_boosting',
        parentVersion: v1Response.body._id,
        configuration: {
          hyperparameters: {
            n_estimators: 150,
            learning_rate: 0.08,
            max_depth: 8
          },
          improvements: [
            'Added feature engineering for customer interaction patterns',
            'Improved hyperparameter tuning',
            'Enhanced ensemble methodology'
          ]
        },
        status: 'staging'
      };
      
      const v11Response = await request(app)
        .post('/api/analytics/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(v11Model)
        .expect(201);
      
      expect(v11Response.body.parentVersion).toBe(v1Response.body._id.toString());
      expect(v11Response.body.version).toBe('1.1');
      
      // Promote version 1.1 to production
      const promotionResponse = await request(app)
        .put(`/api/analytics/models/${v11Response.body._id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Improved accuracy from 82% to 87%',
          approval: 'chief_data_officer',
          rollbackPlan: 'Can revert to version 1.0 within 30 days'
        })
        .expect(200);
      
      expect(promotionResponse.body.status).toBe('production');
      expect(promotionResponse.body.previousVersion).toBe(v1Response.body._id.toString());
      
      // Demote version 1.0
      const demotionResponse = await request(app)
        .put(`/api/analytics/models/${v1Response.body._id}/demote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Replaced by newer version',
          status: 'archived'
        })
        .expect(200);
      
      expect(demotionResponse.body.status).toBe('archived');
    });
    
    test('should handle model A/B testing and canary deployments', async () => {
      // Create A/B test configuration
      const abTestConfig = {
        name: 'Churn Prediction A/B Test',
        primaryModel: testModel._id,
        testModels: [
          {
            modelId: 'model_variant_a',
            weight: 0.3,
            description: 'Variant A with feature engineering'
          },
          {
            modelId: 'model_variant_b', 
            weight: 0.2,
            description: 'Variant B with different hyperparameters'
          }
        ],
        trafficAllocation: {
          control: 0.5,
          test: 0.5
        },
        successMetrics: ['accuracy', 'precision', 'recall', 'f1_score'],
        testDuration: 30, // days
        sampleSize: 10000,
        confidenceLevel: 0.95,
        power: 0.8,
        autoPromotion: {
          enabled: true,
          threshold: 0.02 // 2% improvement required
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/ab-testing')
        .set('Authorization', `Bearer ${authToken}`)
        .send(abTestConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: abTestConfig.name,
        status: 'running',
        trafficAllocation: abTestConfig.trafficAllocation,
        testDuration: abTestConfig.testDuration
      });
      
      // Simulate A/B test results
      const testResults = {
        testId: response.body._id,
        results: {
          control: {
            accuracy: 0.82,
            precision: 0.78,
            recall: 0.85,
            f1_score: 0.81,
            sampleSize: 5000
          },
          variant_a: {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.87,
            f1_score: 0.84,
            sampleSize: 3000
          },
          variant_b: {
            accuracy: 0.83,
            precision: 0.80,
            recall: 0.86,
            f1_score: 0.83,
            sampleSize: 2000
          }
        },
        statisticalSignificance: {
          control_vs_a: 0.95,
          control_vs_b: 0.78
        },
        recommendation: 'Promote variant A to primary model'
      };
      
      const resultsResponse = await request(app)
        .post(`/api/analytics/models/ab-testing/${response.body._id}/results`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testResults)
        .expect(200);
      
      expect(resultsResponse.body.recommendation).toBe('Promote variant A to primary model');
      expect(resultsResponse.body.autoPromotionTriggered).toBe(true);
    });
  });
  
  describe('Model Training & Validation', () => {
    test('should execute model training with data preprocessing', async () => {
      // Create training job configuration
      const trainingConfig = {
        modelId: testModel._id,
        trainingData: {
          source: 'historical_financial_data',
          timeRange: {
            startDate: '2020-01-01',
            endDate: '2024-06-30'
          },
          features: [
            'monthly_revenue',
            'marketing_spend',
            'customer_acquisition',
            'seasonal_factor'
          ],
          targetVariable: 'monthly_revenue',
          validationStrategy: 'time_series_split',
          testSetSize: 0.2
        },
        preprocessing: {
          dataCleaning: {
            removeOutliers: true,
            outlierMethod: 'iqr',
            handleMissing: 'interpolate',
            dataValidation: true
          },
          featureEngineering: {
            createLags: [1, 2, 3, 6, 12],
            rollingStatistics: {
              windows: [3, 6, 12],
              functions: ['mean', 'std', 'min', 'max']
            },
            seasonalDecomposition: true,
            normalization: 'minmax'
          }
        },
        training: {
          algorithm: 'lstm',
          hyperparameters: {
            epochs: 100,
            batchSize: 32,
            learningRate: 0.001,
            validationSplit: 0.2,
            earlyStopping: {
              patience: 10,
              monitor: 'val_loss'
            }
          },
          hardware: {
            gpuRequired: true,
            memory: '16GB',
            estimatedTime: '2-4 hours'
          }
        },
        validation: {
          crossValidation: true,
          folds: 5,
          metrics: ['mae', 'rmse', 'mape', 'r2'],
          baselineComparison: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/train')
        .set('Authorization', `Bearer ${authToken}`)
        .send(trainingConfig)
        .expect(202);
      
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('queued');
      expect(response.body).toHaveProperty('estimatedCompletionTime');
      
      // Simulate training progress updates
      const progressUpdates = [
        { stage: 'data_preparation', progress: 25, status: 'running' },
        { stage: 'feature_engineering', progress: 50, status: 'running' },
        { stage: 'model_training', progress: 75, status: 'running' },
        { stage: 'validation', progress: 90, status: 'running' },
        { stage: 'completed', progress: 100, status: 'completed' }
      ];
      
      for (const update of progressUpdates) {
        const progressResponse = await request(app)
          .put(`/api/analytics/models/training/${response.body.jobId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update)
          .expect(200);
        
        expect(progressResponse.body.progress).toBe(update.progress);
        expect(progressResponse.body.status).toBe(update.status);
      }
      
      // Simulate training completion with results
      const completionResults = {
        jobId: response.body.jobId,
        status: 'completed',
        results: {
          performance: {
            mae: 0.042,
            rmse: 0.065,
            mape: 0.087,
            r2: 0.89
          },
          trainingTime: 7200, // seconds
          dataPoints: 54000,
          features: 25,
          modelSize: '15.2MB',
          trainingLoss: 0.023,
          validationLoss: 0.031
        },
        artifacts: {
          modelFile: 'model_v1.0.pkl',
          preprocessingPipeline: 'preprocessing_v1.0.joblib',
          featureImportance: 'feature_importance_v1.0.json',
          validationPlots: 'validation_plots_v1.0.png'
        },
        recommendations: [
          'Model performance exceeds baseline requirements',
          'Consider collecting more data for recent time periods',
          'Monitor for concept drift in production'
        ]
      };
      
      const completionResponse = await request(app)
        .post(`/api/analytics/models/training/${response.body.jobId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionResults)
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.performance.r2).toBeGreaterThan(0.85);
    });
    
    test('should perform comprehensive model validation and testing', async () => {
      const validationConfig = {
        modelId: testModel._id,
        validationSuite: {
          performance: {
            metrics: ['accuracy', 'precision', 'recall', 'f1_score', 'auc_roc'],
            thresholds: {
              accuracy: 0.80,
              precision: 0.75,
              recall: 0.75,
              f1_score: 0.75,
              auc_roc: 0.85
            }
          },
          robustness: {
            noiseTesting: {
              enabled: true,
              noiseLevels: [0.01, 0.05, 0.1],
              tolerance: 0.02
            },
            adversarialTesting: {
              enabled: true,
              attackMethods: ['fgsm', 'pgd'],
              epsilon: 0.1
            }
          },
          fairness: {
            protectedAttributes: ['gender', 'age_group', 'income_level'],
            fairnessMetrics: ['demographic_parity', 'equalized_odds', 'calibration'],
            thresholds: {
              demographic_parity: 0.1,
              equalized_odds: 0.1
            }
          },
          interpretability: {
            featureImportance: true,
            lime: true,
            shap: true,
            partialDependence: true
          }
        },
        testData: {
          source: 'validation_dataset',
          split: 'holdout',
          size: 0.2,
          stratification: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validationConfig)
        .expect(202);
      
      expect(response.body).toHaveProperty('validationId');
      expect(response.body.status).toBe('running');
      
      // Simulate validation completion
      const validationResults = {
        validationId: response.body._id,
        status: 'completed',
        results: {
          performance: {
            accuracy: 0.87,
            precision: 0.84,
            recall: 0.89,
            f1_score: 0.86,
            auc_roc: 0.91
          },
          robustness: {
            noiseTesting: {
              '0.01': { accuracyDrop: 0.01 },
              '0.05': { accuracyDrop: 0.03 },
              '0.1': { accuracyDrop: 0.08 }
            },
            adversarialTesting: {
              fgsm: { successRate: 0.12 },
              pgd: { successRate: 0.08 }
            }
          },
          fairness: {
            demographic_parity: 0.06,
            equalized_odds: 0.08,
            calibration: 0.05
          },
          interpretability: {
            topFeatures: [
              { feature: 'marketing_spend', importance: 0.23 },
              { feature: 'customer_acquisition', importance: 0.19 },
              { feature: 'seasonal_factor', importance: 0.15 }
            ],
            limeExplanation: 'model_explanation_lime.json',
            shapValues: 'shap_values.json'
          }
        },
        recommendations: [
          'Model passes all performance thresholds',
          'Consider implementing fairness constraints for deployment',
          'Feature importance analysis shows marketing spend as key driver'
        ]
      };
      
      const resultsResponse = await request(app)
        .post(`/api/analytics/models/validation/${response.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validationResults)
        .expect(200);
      
      expect(resultsResponse.body.results.performance.accuracy).toBeGreaterThan(0.80);
      expect(resultsResponse.body.results.fairness.demographic_parity).toBeLessThan(0.1);
    });
  });
  
  describe('Forecasting & Predictions', () => {
    beforeEach(async () => {
      // Create test forecast configuration
      testForecast = await Forecast.create({
        name: 'Q1 2026 Revenue Forecast',
        modelId: testModel._id,
        forecastType: 'revenue_forecast',
        horizon: 90, // 90 days
        confidenceLevel: 0.95,
        granularity: 'daily',
        outputFormat: 'json',
        status: 'pending',
        parameters: {
          seasonality: true,
          trendAnalysis: true,
          externalFactors: ['economic_indicators', 'market_trends'],
          scenarioAnalysis: {
            scenarios: ['optimistic', 'pessimistic', 'most_likely'],
            probabilityWeights: [0.2, 0.3, 0.5]
          }
        }
      });
    });
    
    test('should generate time series forecasts with confidence intervals', async () => {
      const forecastRequest = {
        modelId: testModel._id,
        forecastConfig: {
          horizon: 12, // 12 months
          confidenceLevel: 0.95,
          granularity: 'monthly',
          includeSeasonality: true,
          includeTrends: true,
          includeExternalFactors: true,
          scenarioAnalysis: {
            enabled: true,
            scenarios: ['optimistic', 'realistic', 'pessimistic'],
            weights: [0.25, 0.5, 0.25]
          }
        },
        inputData: {
          historicalData: {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            frequency: 'monthly'
          },
          externalFactors: {
            economicIndicator: 'GDP_growth_rate',
            marketTrend: 'industry_growth_rate',
            seasonalFactors: true
          },
          constraints: {
            minRevenue: 1000000,
            maxRevenue: 10000000,
            businessRules: ['no_negative_revenue', 'minimum_growth_rate: 0.05']
          }
        },
        outputRequirements: {
          format: 'json',
          includeMetadata: true,
          includeVisualizations: true,
          includeExplanation: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/forecasts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastRequest)
        .expect(202);
      
      expect(response.body).toHaveProperty('forecastId');
      expect(response.body.status).toBe('processing');
      expect(response.body).toHaveProperty('estimatedCompletionTime');
      
      // Simulate forecast completion
      const forecastResults = {
        forecastId: response.body._id,
        status: 'completed',
        forecastData: [
          {
            date: '2025-01-01',
            predictedRevenue: 2150000,
            confidenceInterval: {
              lower: 1950000,
              upper: 2350000
            },
            scenario: 'realistic',
            probability: 0.5
          },
          {
            date: '2025-02-01',
            predictedRevenue: 2280000,
            confidenceInterval: {
              lower: 2050000,
              upper: 2510000
            },
            scenario: 'realistic',
            probability: 0.5
          }
        ],
        summary: {
          totalPredicted: 26400000,
          averageMonthly: 2200000,
          growthRate: 0.08,
          confidenceLevel: 0.95
        },
        modelQuality: {
          mape: 0.065,
          rmse: 145000,
          r2: 0.87
        },
        insights: [
          'Revenue expected to grow steadily over forecast period',
          'Seasonal patterns suggest Q4 peak performance',
          'External economic factors show positive correlation'
        ]
      };
      
      const completionResponse = await request(app)
        .post(`/api/analytics/forecasts/${response.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(forecastResults)
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.forecastData).toHaveLength(2);
      expect(completionResponse.body.summary.totalPredicted).toBeGreaterThan(0);
    });
    
    test('should handle scenario planning and what-if analysis', async () => {
      const scenarioConfig = {
        modelId: testModel._id,
        baseForecast: {
          horizon: 6,
          assumptions: {
            marketingSpend: 100000,
            customerAcquisitionRate: 0.15,
            economicGrowth: 0.03
          }
        },
        scenarios: [
          {
            name: 'Aggressive Growth',
            description: 'Increased marketing spend and customer acquisition',
            assumptions: {
              marketingSpend: 150000,
              customerAcquisitionRate: 0.25,
              economicGrowth: 0.05
            },
            probability: 0.3
          },
          {
            name: 'Conservative Approach',
            description: 'Reduced marketing spend and cautious growth',
            assumptions: {
              marketingSpend: 75000,
              customerAcquisitionRate: 0.10,
              economicGrowth: 0.01
            },
            probability: 0.2
          },
          {
            name: 'Market Disruption',
            description: 'Negative economic impact and reduced acquisition',
            assumptions: {
              marketingSpend: 50000,
              customerAcquisitionRate: 0.05,
              economicGrowth: -0.02
            },
            probability: 0.1
          }
        ],
        analysis: {
          sensitivityAnalysis: true,
          correlationAnalysis: true,
          riskAssessment: true,
          recommendationEngine: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/forecasts/scenario-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scenarioConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('scenarioId');
      expect(response.body.scenarios).toHaveLength(3);
      expect(response.body).toHaveProperty('probabilityDistribution');
      
      // Retrieve scenario analysis results
      const resultsResponse = await request(app)
        .get(`/api/analytics/forecasts/scenarios/${response.body.scenarioId}/results`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(resultsResponse.body).toHaveProperty('scenarioResults');
      expect(resultsResponse.body).toHaveProperty('sensitivityAnalysis');
      expect(resultsResponse.body).toHaveProperty('recommendations');
    });
    
    test('should provide real-time predictions and scoring', async () => {
      const predictionRequest = {
        modelId: testModel._id,
        inputFeatures: {
          marketing_spend: 125000,
          customer_acquisition: 0.18,
          seasonal_factor: 1.2,
          economic_indicator: 0.03,
          competitive_index: 0.85,
          product_launches: 2,
          price_changes: 0,
          employee_count: 150,
          market_share: 0.12,
          previous_revenue: 2100000
        },
        options: {
          includeConfidence: true,
          includeExplanation: true,
          includeFeatureImportance: true,
          returnProbabilities: true
        },
        batchMode: false,
        realTimeProcessing: true
      };
      
      const response = await request(app)
        .post('/api/analytics/models/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send(predictionRequest)
        .expect(200);
      
      expect(response.body).toHaveProperty('prediction');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('modelVersion');
      expect(response.body).toHaveProperty('processingTime');
      expect(response.body.prediction).toBeGreaterThan(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1.0);
      expect(response.body.confidence).toBeGreaterThanOrEqual(0.0);
      
      // Test batch prediction for multiple records
      const batchPredictionRequest = {
        modelId: testModel._id,
        inputBatch: [
          {
            marketing_spend: 100000,
            customer_acquisition: 0.15,
            seasonal_factor: 1.0,
            economic_indicator: 0.02
          },
          {
            marketing_spend: 150000,
            customer_acquisition: 0.20,
            seasonal_factor: 1.3,
            economic_indicator: 0.04
          },
          {
            marketing_spend: 80000,
            customer_acquisition: 0.12,
            seasonal_factor: 0.9,
            economic_indicator: 0.01
          }
        ],
        options: {
          includeConfidence: true,
          returnMetadata: true
        }
      };
      
      const batchResponse = await request(app)
        .post('/api/analytics/models/predict-batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send(batchPredictionRequest)
        .expect(200);
      
      expect(batchResponse.body).toHaveProperty('predictions');
      expect(batchResponse.body.predictions).toHaveLength(3);
      expect(batchResponse.body).toHaveProperty('processingSummary');
    });
  });
  
  describe('Model Monitoring & Maintenance', () => {
    test('should monitor model performance in production', async () => {
      const monitoringConfig = {
        modelId: testModel._id,
        monitoringPlan: {
          frequency: 'daily',
          metrics: [
            'accuracy',
            'precision',
            'recall',
            'f1_score',
            'prediction_latency',
            'data_drift_score',
            'concept_drift_score'
          ],
          thresholds: {
            accuracy: { min: 0.80 },
            precision: { min: 0.75 },
            recall: { min: 0.75 },
            f1_score: { min: 0.75 },
            prediction_latency: { max: 100 }, // milliseconds
            data_drift_score: { max: 0.1 },
            concept_drift_score: { max: 0.05 }
          },
          alerting: {
            email: ['datascientist@company.com', 'mlops@company.com'],
            slack: '#ml-monitoring',
            escalation: {
              enabled: true,
              levels: ['warning', 'critical'],
              autoRemediation: {
                enabled: true,
                actions: ['retrain_model', 'adjust_thresholds', 'alert_team']
              }
            }
          }
        },
        dataCollection: {
          predictionLogging: true,
          actualOutcomeTracking: true,
          featureDriftDetection: true,
          performanceMetricsCollection: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/monitoring')
        .set('Authorization', `Bearer ${authToken}`)
        .send(monitoringConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        modelId: testModel._id.toString(),
        frequency: monitoringConfig.monitoringPlan.frequency,
        status: 'active'
      });
      
      // Simulate monitoring data collection
      const monitoringData = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        metrics: {
          accuracy: 0.82 + Math.random() * 0.05,
          precision: 0.79 + Math.random() * 0.04,
          recall: 0.84 + Math.random() * 0.06,
          f1_score: 0.81 + Math.random() * 0.05,
          prediction_latency: 45 + Math.random() * 20,
          data_drift_score: Math.random() * 0.08,
          concept_drift_score: Math.random() * 0.03
        },
        sampleSize: 1000 + Math.floor(Math.random() * 500)
      }));
      
      for (const data of monitoringData) {
        await request(app)
          .post(`/api/analytics/models/monitoring/${response.body._id}/data`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(data);
      }
      
      // Generate monitoring report
      const reportResponse = await request(app)
        .get(`/api/analytics/models/monitoring/${response.body._id}/report`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(reportResponse.body).toHaveProperty('performanceTrend');
      expect(reportResponse.body).toHaveProperty('alerts');
      expect(reportResponse.body).toHaveProperty('recommendations');
    });
    
    test('should detect and handle model drift', async () => {
      const driftDetectionConfig = {
        modelId: testModel._id,
        detectionMethods: [
          {
            method: 'statistical_tests',
            tests: ['ks_test', 'chi_square', 'jensen_shannon_divergence'],
            significanceLevel: 0.05
          },
          {
            method: 'performance_monitoring',
            metrics: ['accuracy', 'precision', 'recall'],
            degradationThreshold: 0.05
          },
          {
            method: 'feature_drift',
            features: ['marketing_spend', 'customer_acquisition', 'seasonal_factor'],
            driftThreshold: 0.1
          }
        ],
        monitoringWindow: 30, // days
        baselinePeriod: 90, // days
        alertConfig: {
          triggerOnDetection: true,
          immediateAlert: true,
          gradualAlert: true,
          severityLevels: ['low', 'medium', 'high', 'critical']
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/drift-detection')
        .set('Authorization', `Bearer ${authToken}`)
        .send(driftDetectionConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('detectionId');
      expect(response.body.status).toBe('active');
      
      // Simulate drift detection results
      const driftResults = {
        detectionId: response.body._id,
        driftDetected: true,
        driftType: 'concept_drift',
        severity: 'medium',
        affectedFeatures: ['marketing_spend', 'customer_acquisition'],
        statisticalResults: {
          ks_test: { statistic: 0.12, p_value: 0.03 },
          jensen_shannon_divergence: 0.08,
          performance_degradation: {
            accuracy_drop: 0.06,
            precision_drop: 0.04,
            recall_drop: 0.05
          }
        },
        recommendations: [
          'Collect new training data from recent period',
          'Retrain model with updated data distribution',
          'Monitor feature importance changes',
          'Consider ensemble methods for robustness'
        ],
        automaticActions: [
          'increased_monitoring_frequency',
          'alert_ml_team',
          'schedule_retraining'
        ]
      };
      
      const resultsResponse = await request(app)
        .post(`/api/analytics/models/drift-detection/${response.body._id}/results`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(driftResults)
        .expect(200);
      
      expect(resultsResponse.body.driftDetected).toBe(true);
      expect(resultsResponse.body.severity).toBe('medium');
      expect(resultsResponse.body.automaticActions).toContain('alert_ml_team');
    });
    
    test('should automate model retraining', async () => {
      const retrainingConfig = {
        modelId: testModel._id,
        triggers: [
          {
            type: 'performance_degradation',
            condition: 'accuracy < 0.80',
            severity: 'high'
          },
          {
            type: 'concept_drift',
            condition: 'drift_score > 0.05',
            severity: 'medium'
          },
          {
            type: 'scheduled_retraining',
            frequency: 'monthly',
            lastRun: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
          }
        ],
        retrainingStrategy: {
          dataSelection: 'recent_data',
          trainingWindow: 365, // days
          validationStrategy: 'time_series_split',
          hyperparameters: {
            searchMethod: 'bayesian_optimization',
            maxTrials: 50,
            earlyStopping: true
          }
        },
        approvalWorkflow: {
          enabled: true,
          approvers: ['chief_data_officer', 'ml_engineer'],
          autoApproval: {
            enabled: true,
            conditions: ['improvement > 0.02', 'no_performance_regression']
          }
        },
        rollbackStrategy: {
          enabled: true,
          conditions: ['new_model_fails_validation', 'performance_regression > 0.01'],
          rollbackWindow: 7 // days
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/auto-retraining')
        .set('Authorization', `Bearer ${authToken}`)
        .send(retrainingConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('retrainingId');
      expect(response.body.status).toBe('configured');
      
      // Simulate retraining trigger
      const triggerResponse = await request(app)
        .post(`/api/analytics/models/auto-retraining/${response.body._id}/trigger`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          triggerType: 'scheduled_retraining',
          reason: 'Monthly scheduled retraining triggered',
          dataWindow: {
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          }
        })
        .expect(202);
      
      expect(triggerResponse.body.status).toBe('initiated');
      expect(triggerResponse.body).toHaveProperty('retrainingJobId');
    });
  });
  
  describe('Integration & API Management', () => {
    test('should provide model serving API', async () => {
      const apiConfig = {
        modelId: testModel._id,
        endpoint: '/api/v1/models/revenue-forecast',
        authentication: {
          required: true,
          methods: ['api_key', 'oauth2']
        },
        rateLimiting: {
          requestsPerMinute: 100,
          burstLimit: 20,
          quota: {
            daily: 10000,
            monthly: 300000
          }
        },
        responseFormat: {
          includeMetadata: true,
          includeConfidence: true,
          includeExplanation: false,
          includeFeatureImportance: false
        },
        monitoring: {
          enabled: true,
          logRequests: true,
          trackLatency: true,
          monitorAccuracy: true
        },
        caching: {
          enabled: true,
          ttl: 3600, // 1 hour
          cacheKey: 'feature_hash'
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/serve')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apiConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        modelId: testModel._id.toString(),
        endpoint: apiConfig.endpoint,
        status: 'active'
      });
      
      // Test API endpoint
      const predictionRequest = {
        features: {
          marketing_spend: 120000,
          customer_acquisition: 0.16,
          seasonal_factor: 1.1,
          economic_indicator: 0.03
        },
        options: {
          returnConfidence: true
        }
      };
      
      const apiResponse = await request(app)
        .post('/api/v1/models/revenue-forecast')
        .send(predictionRequest)
        .set('X-API-Key', 'test_api_key')
        .expect(200);
      
      expect(apiResponse.body).toHaveProperty('prediction');
      expect(apiResponse.body).toHaveProperty('confidence');
      expect(apiResponse.body).toHaveProperty('modelVersion');
      expect(apiResponse.body.prediction).toBeGreaterThan(0);
    });
    
    test('should integrate with MLOps pipeline', async () => {
      const mlopsConfig = {
        modelId: testModel._id,
        pipeline: {
          stages: [
            {
              name: 'data_ingestion',
              type: 'extract',
              source: 'database',
              schedule: '0 2 * * *', // Daily at 2 AM
              validation: {
                dataQuality: true,
                schemaValidation: true,
                completeness: 0.95
              }
            },
            {
              name: 'data_preprocessing',
              type: 'transform',
              dependencies: ['data_ingestion'],
              operations: [
                'clean_missing_values',
                'normalize_features',
                'create_engineered_features'
              ]
            },
            {
              name: 'model_training',
              type: 'train',
              dependencies: ['data_preprocessing'],
              algorithm: 'lstm',
              hyperparameters: 'optimized'
            },
            {
              name: 'model_validation',
              type: 'validate',
              dependencies: ['model_training'],
              tests: ['performance', 'robustness', 'fairness']
            },
            {
              name: 'model_deployment',
              type: 'deploy',
              dependencies: ['model_validation'],
              environment: 'production',
              rolloutStrategy: 'blue_green'
            }
          ]
        },
        orchestration: {
          workflowEngine: 'argo',
          monitoring: {
            enabled: true,
            alerts: ['pipeline_failure', 'performance_degradation']
          },
          errorHandling: {
            retryAttempts: 3,
            retryDelay: 300,
            failureNotification: true
          }
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/mlops/pipeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mlopsConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('pipelineId');
      expect(response.body.status).toBe('configured');
      expect(response.body.stages).toHaveLength(5);
      
      // Trigger pipeline execution
      const executionResponse = await request(app)
        .post(`/api/analytics/mlops/pipeline/${response.body._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parameters: {
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          }
        })
        .expect(202);
      
      expect(executionResponse.body).toHaveProperty('executionId');
      expect(executionResponse.body.status).toBe('running');
    });
    
    test('should generate comprehensive model documentation', async () => {
      const documentationConfig = {
        modelId: testModel._id,
        documentationType: 'comprehensive',
        sections: [
          {
            name: 'model_overview',
            content: 'detailed',
            includeMetrics: true,
            includeVisualizations: true
          },
          {
            name: 'technical_specifications',
            content: 'detailed',
            includeArchitecture: true,
            includeHyperparameters: true
          },
          {
            name: 'data_requirements',
            content: 'detailed',
            includeSchema: true,
            includeQualityRequirements: true
          },
          {
            name: 'performance_analysis',
            content: 'detailed',
            includeBenchmarking: true,
            includeLimitations: true
          },
          {
            name: 'usage_guidelines',
            content: 'detailed',
            includeBestPractices: true,
            includeCodeExamples: true
          },
          {
            name: 'compliance_and_governance',
            content: 'detailed',
            includeEthicalConsiderations: true,
            includeBiasAssessment: true
          }
        ],
        outputFormat: 'markdown',
        includeImages: true,
        generateInteractive: true
      };
      
      const response = await request(app)
        .post('/api/analytics/models/documentation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentationConfig)
        .expect(201);
      
      expect(response.body).toHaveProperty('documentationId');
      expect(response.body.status).toBe('generating');
      
      // Simulate documentation generation completion
      const completionResponse = await request(app)
        .post(`/api/analytics/models/documentation/${response.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          documentationUrl: '/api/models/documentation/revenue-forecast-v1.0.md',
          sections: documentationConfig.sections.map(s => s.name),
          totalPages: 25,
          wordCount: 8500,
          lastUpdated: new Date()
        })
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.totalPages).toBeGreaterThan(0);
    });
  });
  
  describe('Performance & Scalability', () => {
    test('should handle high-volume prediction requests', async () => {
      const batchSize = 1000;
      const concurrentRequests = 50;
      
      // Generate large batch of prediction requests
      const batchRequests = Array.from({ length: batchSize }, (_, i) => ({
        features: {
          marketing_spend: 100000 + Math.random() * 50000,
          customer_acquisition: 0.1 + Math.random() * 0.2,
          seasonal_factor: 0.8 + Math.random() * 0.6,
          economic_indicator: 0.01 + Math.random() * 0.04
        },
        requestId: `req_${i}`,
        timestamp: new Date()
      }));
      
      const startTime = Date.now();
      
      // Process requests in batches to simulate real scenario
      const batchPromises = [];
      for (let i = 0; i < batchRequests.length; i += 100) {
        const batch = batchRequests.slice(i, i + 100);
        const batchPromise = request(app)
          .post('/api/analytics/models/predict-batch')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelId: testModel._id,
            inputBatch: batch.map(req => req.features),
            options: { includeConfidence: false }
          });
        batchPromises.push(batchPromise);
      }
      
      const responses = await Promise.all(batchPromises);
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Verify all requests succeeded
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(batchPromises.length);
      
      // Verify performance requirements
      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(processingTime / 1000).toBeLessThan(batchSize / 10); // Should process >10 requests/second
    });
    
    test('should optimize model inference with caching and batching', async () => {
      // Test with identical requests to verify caching
      const identicalRequest = {
        features: {
          marketing_spend: 120000,
          customer_acquisition: 0.16,
          seasonal_factor: 1.1,
          economic_indicator: 0.03
        }
      };
      
      // Make multiple identical requests
      const identicalRequests = Array.from({ length: 10 }, () => identicalRequest);
      
      const startTime = Date.now();
      const response = await request(app)
        .post('/api/analytics/models/predict-batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id,
          inputBatch: identicalRequests,
          options: {
            enableCaching: true,
            cacheSimilarRequests: true,
            similarityThreshold: 0.95
          }
        })
        .expect(200);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      
      expect(response.body.predictions).toHaveLength(10);
      expect(processingTime).toBeLessThan(5000); // Should be fast due to caching
      expect(response.body.cachingStats).toBeDefined();
      expect(response.body.cachingStats.cacheHits).toBeGreaterThan(0);
    });
    
    test('should handle model versioning and A/B testing at scale', async () => {
      const trafficDistribution = {
        primaryModel: { weight: 0.7, modelId: testModel._id },
        testModelA: { weight: 0.2, modelId: 'model_variant_a' },
        testModelB: { weight: 0.1, modelId: 'model_variant_b' }
      };
      
      // Simulate traffic routing for A/B testing
      const numRequests = 10000;
      const routingResults = {
        primary: 0,
        testA: 0,
        testB: 0
      };
      
      for (let i = 0; i < numRequests; i++) {
        const random = Math.random();
        if (random < trafficDistribution.primaryModel.weight) {
          routingResults.primary++;
        } else if (random < trafficDistribution.primaryModel.weight + trafficDistribution.testModelA.weight) {
          routingResults.testA++;
        } else {
          routingResults.testB++;
        }
      }
      
      // Verify traffic distribution is approximately correct
      expect(routingResults.primary).toBeGreaterThan(6500); // ~70% with some tolerance
      expect(routingResults.testA).toBeGreaterThan(1800); // ~20% with some tolerance
      expect(routingResults.testB).toBeGreaterThan(800); // ~10% with some tolerance
      
      // Test performance impact of A/B testing
      const abTestStart = Date.now();
      const abTestRequests = Array.from({ length: 100 }, (_, i) => ({
        features: {
          marketing_spend: 100000 + Math.random() * 50000,
          customer_acquisition: 0.1 + Math.random() * 0.2,
          seasonal_factor: 0.8 + Math.random() * 0.6,
          economic_indicator: 0.01 + Math.random() * 0.04
        }
      }));
      
      const abTestResponse = await request(app)
        .post('/api/analytics/models/predict-batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id,
          inputBatch: abTestRequests,
          options: {
            enableABTesting: true,
            trafficDistribution: trafficDistribution
          }
        })
        .expect(200);
      const abTestEnd = Date.now();
      
      expect(abTestResponse.body.predictions).toHaveLength(100);
      expect(abTestResponse.body).toHaveProperty('routingStats');
      expect(abTestResponse.body.routingStats).toHaveProperty('primary');
      expect(abTestResponse.body.routingStats).toHaveProperty('testA');
      expect(abTestResponse.body.routingStats).toHaveProperty('testB');
    });
  });
  
  describe('Error Handling & Edge Cases', () => {
    test('should handle missing or invalid model configurations', async () => {
      const invalidConfigs = [
        {
          name: 'Missing Algorithm',
          configuration: {
            architecture: {
              layers: [{ type: 'dense', units: 10 }]
            }
          },
          expectedError: 'Algorithm not specified'
        },
        {
          name: 'Invalid Hyperparameters',
          algorithm: 'lstm',
          configuration: {
            hyperparameters: {
              epochs: -1, // Invalid negative value
              batchSize: 0 // Invalid zero value
            }
          },
          expectedError: 'Invalid hyperparameter values'
        },
        {
          name: 'Insufficient Training Data',
          dataSource: {
            features: ['feature1'],
            sampleSize: 10 // Too small
          },
          expectedError: 'Insufficient training data'
        }
      ];
      
      for (const config of invalidConfigs) {
        const response = await request(app)
          .post('/api/analytics/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send(config)
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            message: expect.stringContaining(config.expectedError)
          })
        );
      }
    });
    
    test('should handle model training failures gracefully', async () => {
      const trainingRequest = {
        modelId: testModel._id,
        trainingData: {
          source: 'invalid_data_source',
          corruptedData: true
        },
        configuration: {
          algorithm: 'lstm',
          hardware: {
            gpuRequired: true,
            unavailable: true
          }
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/models/train')
        .set('Authorization', `Bearer ${authToken}`)
        .send(trainingRequest)
        .expect(202);
      
      // Simulate training failure
      const failureResponse = await request(app)
        .post(`/api/analytics/models/training/${response.body.jobId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'failed',
          error: {
            type: 'data_corruption',
            message: 'Training data contains corrupted records',
            code: 'DATA_001',
            details: 'Missing values in critical features'
          },
          partialResults: {
            processedRecords: 5000,
            failedRecords: 1000
          },
          recommendations: [
            'Clean and validate training data before retry',
            'Implement data quality checks in pipeline',
            'Consider using data imputation techniques'
          ]
        })
        .expect(200);
      
      expect(failureResponse.body.status).toBe('failed');
      expect(failureResponse.body.error).toBeDefined();
      expect(failureResponse.body.recommendations).toHaveLength(3);
    });
    
    test('should handle prediction service outages', async () => {
      // Simulate service degradation
      const degradationResponse = await request(app)
        .post('/api/analytics/models/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id,
          features: {
            marketing_spend: 120000,
            customer_acquisition: 0.16,
            seasonal_factor: 1.1
          },
          priority: 'normal'
        })
        .expect(503);
      
      expect(degradationResponse.body).toHaveProperty('error');
      expect(degradationResponse.body.error).toBe('Service temporarily unavailable');
      expect(degradationResponse.body).toHaveProperty('retryAfter');
      
      // Test fallback prediction mechanism
      const fallbackResponse = await request(app)
        .post('/api/analytics/models/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelId: testModel._id,
          features: {
            marketing_spend: 120000,
            customer_acquisition: 0.16,
            seasonal_factor: 1.1
          },
          fallbackMode: true,
          allowApproximation: true
        })
        .expect(200);
      
      expect(fallbackResponse.body).toHaveProperty('prediction');
      expect(fallbackResponse.body).toHaveProperty('confidence');
      expect(fallbackResponse.body.prediction).toBeGreaterThan(0);
      expect(fallbackResponse.body.isApproximation).toBe(true);
    });
    
    test('should prevent unauthorized model access and modifications', async () => {
      // Create restricted user
      const restrictedUser = await User.create({
        username: 'restricted_user',
        email: 'restricted@test.com',
        password: 'TestPassword123!',
        role: 'basic_analyst',
        permissions: ['analytics.view'],
        companyId: 'test_company_analytics'
      });
      
      const restrictedLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'restricted_user',
          password: 'TestPassword123!'
        });
      
      const restrictedToken = restrictedLoginResponse.body.token;
      
      // Attempt to create model (should be denied)
      const unauthorizedCreateResponse = await request(app)
        .post('/api/analytics/models')
        .set('Authorization', `Bearer ${restrictedToken}`)
        .send({
          name: 'Unauthorized Model',
          algorithm: 'lstm',
          type: 'forecasting'
        })
        .expect(403);
      
      expect(unauthorizedCreateResponse.body).toHaveProperty('error');
      expect(unauthorizedCreateResponse.body.error).toBe('Insufficient permissions');
      
      // Attempt to view sensitive model information (should be denied)
      const unauthorizedViewResponse = await request(app)
        .get(`/api/analytics/models/${testModel._id}/details`)
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);
      
      expect(unauthorizedViewResponse.body).toHaveProperty('error');
      expect(unauthorizedViewResponse.body.error).toBe('Access denied to sensitive model information');
    });
  });
});

// Mock models for testing
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  companyId: String
}));

const PredictiveModel = mongoose.model('PredictiveModel', new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  algorithm: String,
  version: String,
  configuration: mongoose.Schema.Types.Mixed,
  dataSource: mongoose.Schema.Types.Mixed,
  performance: mongoose.Schema.Types.Mixed,
  deployment: mongoose.Schema.Types.Mixed,
  compliance: mongoose.Schema.Types.Mixed,
  accessControl: mongoose.Schema.Types.Mixed,
  status: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictiveModel' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const Forecast = mongoose.model('Forecast', new mongoose.Schema({
  name: String,
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictiveModel' },
  forecastType: String,
  horizon: Number,
  confidenceLevel: Number,
  granularity: String,
  outputFormat: String,
  status: String,
  parameters: mongoose.Schema.Types.Mixed,
  forecastData: [mongoose.Schema.Types.Mixed],
  summary: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));

const AnalyticsDataset = mongoose.model('AnalyticsDataset', new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  source: String,
  schema: mongoose.Schema.Types.Mixed,
  size: Number,
  recordCount: Number,
  lastUpdated: Date,
  qualityScore: Number,
  accessLevel: String,
  tags: [String]
}));

const ModelTraining = mongoose.model('ModelTraining', new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictiveModel' },
  jobId: String,
  status: String,
  progress: Number,
  stage: String,
  trainingData: mongoose.Schema.Types.Mixed,
  results: mongoose.Schema.Types.Mixed,
  artifacts: mongoose.Schema.Types.Mixed,
  error: mongoose.Schema.Types.Mixed,
  startedAt: Date,
  completedAt: Date
}));

const Prediction = mongoose.model('Prediction', new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictiveModel' },
  inputFeatures: mongoose.Schema.Types.Mixed,
  prediction: mongoose.Schema.Types.Mixed,
  confidence: Number,
  processingTime: Number,
  requestId: String,
  batchId: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));