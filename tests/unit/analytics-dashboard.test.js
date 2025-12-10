/**
 * Analytics Dashboard Test Suite
 * Management & Analytics Category
 * Business Intelligence Layer with Data Visualization, KPI Tracking, and Real-time Analytics
 */

const request = require('supertest');
const mongoose = require('mongoose');

describe('Analytics Dashboard Engine', () => {
  let app;
  let testUser;
  let testDashboard;
  let testKPI;
  let testDataSource;
  let testVisualization;
  let authToken;
  
  beforeAll(async () => {
    // Setup test environment
    app = require('../src/app');
    
    // Create test user with analytics permissions
    testUser = await User.create({
      username: 'analytics_test_user',
      email: 'analytics@test.com',
      password: 'TestPassword123!',
      role: 'financial_analyst',
      permissions: ['analytics.view', 'analytics.create', 'analytics.edit', 'analytics.delete'],
      companyId: 'test_company_analytics'
    });
    
    // Generate auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'analytics_test_user',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: 'analytics@test.com' });
    await Dashboard.deleteMany({});
    await KPIDefinition.deleteMany({});
    await DataSource.deleteMany({});
    await Visualization.deleteMany({});
    await Report.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Dashboard Management', () => {
    test('should create custom dashboard with layout configuration', async () => {
      const dashboardData = {
        name: 'Financial Performance Dashboard',
        description: 'Executive overview of key financial metrics',
        category: 'executive_summary',
        layout: {
          columns: 12,
          rows: [
            {
              id: 'revenue_chart',
              type: 'chart',
              position: { x: 0, y: 0, width: 6, height: 4 },
              widgetConfig: {
                chartType: 'line',
                dataSource: 'revenue_data',
                xField: 'month',
                yField: 'revenue',
                title: 'Monthly Revenue Trend'
              }
            },
            {
              id: 'kpi_cards',
              type: 'kpi_cards',
              position: { x: 6, y: 0, width: 6, height: 4 },
              widgetConfig: {
                kpis: ['total_revenue', 'gross_margin', 'net_profit', 'cash_flow']
              }
            },
            {
              id: 'expense_breakdown',
              type: 'pie_chart',
              position: { x: 0, y: 4, width: 6, height: 4 },
              widgetConfig: {
                chartType: 'pie',
                dataSource: 'expense_data',
                categoryField: 'category',
                valueField: 'amount',
                title: 'Expense Breakdown by Category'
              }
            },
            {
              id: 'cash_flow_table',
              type: 'data_table',
              position: { x: 6, y: 4, width: 6, height: 4 },
              widgetConfig: {
                dataSource: 'cash_flow_data',
                columns: ['date', 'description', 'inflow', 'outflow', 'balance'],
                sortable: true,
                filterable: true
              }
            }
          ]
        },
        permissions: {
          view: ['executives', 'financial_analysts'],
          edit: ['financial_analysts'],
          share: ['executives']
        },
        refreshInterval: 300000, // 5 minutes
        autoRefresh: true,
        tags: ['financial', 'executive', 'kpi']
      };
      
      const response = await request(app)
        .post('/api/analytics/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dashboardData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: dashboardData.name,
        description: dashboardData.description,
        category: dashboardData.category,
        layout: dashboardData.layout,
        permissions: dashboardData.permissions,
        refreshInterval: dashboardData.refreshInterval,
        autoRefresh: dashboardData.autoRefresh,
        tags: dashboardData.tags,
        owner: testUser._id.toString(),
        status: 'active'
      });
      
      testDashboard = response.body;
    });
    
    test('should validate dashboard layout configuration', async () => {
      const invalidLayoutData = {
        name: 'Invalid Dashboard',
        layout: {
          columns: 12,
          rows: [
            {
              id: 'chart1',
              position: { x: 0, y: 0, width: 13, height: 4 }, // Width exceeds columns
              widgetConfig: {
                chartType: 'line',
                dataSource: 'test_data'
              }
            }
          ]
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLayoutData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'layout.rows[0].position.width',
          message: 'Widget width cannot exceed total columns'
        })
      );
    });
    
    test('should update dashboard layout and configuration', async () => {
      const updateData = {
        name: 'Updated Financial Dashboard',
        layout: {
          columns: 12,
          rows: [
            {
              id: 'new_widget',
              type: 'gauge',
              position: { x: 0, y: 0, width: 4, height: 4 },
              widgetConfig: {
                chartType: 'gauge',
                dataSource: 'kpi_data',
                metric: 'revenue_growth',
                min: 0,
                max: 100,
                title: 'Revenue Growth %'
              }
            }
          ]
        },
        refreshInterval: 600000 // 10 minutes
      };
      
      const response = await request(app)
        .put(`/api/analytics/dashboards/${testDashboard._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.layout.rows).toHaveLength(1);
      expect(response.body.layout.rows[0].id).toBe('new_widget');
      expect(response.body.refreshInterval).toBe(updateData.refreshInterval);
      expect(response.body.updatedBy).toBe(testUser._id.toString());
      expect(response.body.updatedAt).toBeDefined();
    });
    
    test('should clone dashboard with new ownership', async () => {
      const cloneData = {
        name: 'Cloned Financial Dashboard',
        description: 'Clone for team analysis',
        owner: 'team_lead_123'
      };
      
      const response = await request(app)
        .post(`/api/analytics/dashboards/${testDashboard._id}/clone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cloneData)
        .expect(201);
      
      expect(response.body.name).toBe(cloneData.name);
      expect(response.body.description).toBe(cloneData.description);
      expect(response.body.layout).toEqual(testDashboard.layout);
      expect(response.body.owner).toBe(cloneData.owner);
      expect(response.body._id).not.toBe(testDashboard._id);
      expect(response.body.status).toBe('draft');
    });
    
    test('should share dashboard with specific users/roles', async () => {
      const shareData = {
        permissions: {
          view: ['executives', 'financial_analysts', 'accountants'],
          edit: ['financial_analysts'],
          comment: ['executives', 'financial_analysts']
        },
        expiryDate: new Date('2025-12-31'),
        password: 'dashboard123',
        watermark: true
      };
      
      const response = await request(app)
        .post(`/api/analytics/dashboards/${testDashboard._id}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(shareData)
        .expect(200);
      
      expect(response.body.permissions).toEqual(shareData.permissions);
      expect(response.body.shareSettings.expiryDate).toBeDefined();
      expect(response.body.shareSettings.password).toBe(true);
      expect(response.body.shareSettings.watermark).toBe(true);
    });
    
    test('should generate dashboard sharing link with access control', async () => {
      const shareLinkData = {
        type: 'public_link',
        permissions: ['view'],
        expiryHours: 24,
        maxViews: 100,
        allowDownload: true
      };
      
      const response = await request(app)
        .post(`/api/analytics/dashboards/${testDashboard._id}/share-link`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(shareLinkData)
        .expect(200);
      
      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body.shareUrl).toMatch(/^https?:\/\/.+\/shared\/[a-zA-Z0-9]+$/);
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.permissions).toEqual(['view']);
      expect(response.body.viewCount).toBe(0);
    });
  });
  
  describe('KPI Management', () => {
    beforeEach(async () => {
      // Create test KPI definition
      testKPI = await KPIDefinition.create({
        name: 'Monthly Revenue',
        code: 'REV_MTH',
        category: 'financial',
        description: 'Total revenue generated in the current month',
        formula: 'SUM(transactions.amount) WHERE transaction_date >= start_of_month AND transaction_date < start_of_next_month',
        dataSource: 'transactions',
        calculationFrequency: 'daily',
        unit: 'USD',
        precision: 2,
        thresholds: {
          warning: 100000,
          critical: 50000,
          target: 200000
        },
        displayFormat: 'currency',
        colorScheme: 'success',
        tags: ['revenue', 'monthly', 'primary']
      });
    });
    
    test('should create KPI with complex formula and validation', async () => {
      const kpiData = {
        name: 'Gross Profit Margin',
        code: 'GPM',
        category: 'profitability',
        description: 'Gross profit as percentage of revenue',
        formula: '(SUM(revenue) - SUM(cost_of_goods_sold)) / SUM(revenue) * 100',
        dataSource: 'financial_statements',
        calculationFrequency: 'real-time',
        unit: 'percentage',
        precision: 2,
        thresholds: {
          excellent: 40,
          good: 30,
          warning: 20,
          critical: 10,
          target: 35
        },
        displayFormat: 'percentage',
        colorScheme: 'gradient',
        benchmark: {
          industry: 'Technology',
          percentile: 75
        },
        drillDownConfig: {
          enabled: true,
          dimensions: ['product_category', 'region', 'customer_segment']
        },
        tags: ['profitability', 'margin', 'efficiency']
      };
      
      const response = await request(app)
        .post('/api/analytics/kpis')
        .set('Authorization', `Bearer ${authToken}`)
        .send(kpiData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: kpiData.name,
        code: kpiData.code,
        category: kpiData.category,
        formula: kpiData.formula,
        dataSource: kpiData.dataSource,
        calculationFrequency: kpiData.calculationFrequency,
        unit: kpiData.unit,
        thresholds: kpiData.thresholds,
        displayFormat: kpiData.displayFormat,
        benchmark: kpiData.benchmark,
        drillDownConfig: kpiData.drillDownConfig,
        tags: kpiData.tags
      });
    });
    
    test('should validate KPI formula syntax', async () => {
      const invalidKPI = {
        name: 'Invalid KPI',
        formula: 'INVALID_FUNCTION(field) + SYNTAX_ERROR',
        dataSource: 'test_data'
      };
      
      const response = await request(app)
        .post('/api/analytics/kpis')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidKPI)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'formula',
          message: expect.stringContaining('Invalid function')
        })
      );
    });
    
    test('should calculate KPI value with time-series data', async () => {
      // Insert test transaction data
      await Transaction.insertMany([
        { amount: 50000, transaction_date: new Date('2025-11-01'), type: 'revenue' },
        { amount: 75000, transaction_date: new Date('2025-11-15'), type: 'revenue' },
        { amount: 60000, transaction_date: new Date('2025-12-01'), type: 'revenue' }
      ]);
      
      const response = await request(app)
        .get(`/api/analytics/kpis/${testKPI._id}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          period: 'monthly',
          startDate: '2025-11-01',
          endDate: '2025-12-31'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('value');
      expect(response.body).toHaveProperty('period');
      expect(response.body).toHaveProperty('trend');
      expect(response.body.value).toBe(185000); // Sum of all transactions
      expect(response.body.period.startDate).toBe('2025-11-01');
      expect(response.body.period.endDate).toBe('2025-12-31');
    });
    
    test('should track KPI historical values and trends', async () => {
      const historicalData = [
        { period: '2025-08', value: 150000, variance: -10000 },
        { period: '2025-09', value: 165000, variance: 15000 },
        { period: '2025-10', value: 160000, variance: -5000 },
        { period: '2025-11', value: 175000, variance: 15000 }
      ];
      
      for (const data of historicalData) {
        await request(app)
          .post(`/api/analytics/kpis/${testKPI._id}/history`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(data);
      }
      
      const response = await request(app)
        .get(`/api/analytics/kpis/${testKPI._id}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ periods: 12 })
        .expect(200);
      
      expect(response.body.history).toHaveLength(4);
      expect(response.body.trend).toBe('positive');
      expect(response.body.averageGrowth).toBeGreaterThan(0);
    });
    
    test('should trigger alerts based on KPI thresholds', async () => {
      // Set KPI to critical threshold
      await KPIDefinition.findByIdAndUpdate(testKPI._id, {
        'thresholds.critical': 200000
      });
      
      // Insert data below critical threshold
      await Transaction.insertMany([
        { amount: 50000, transaction_date: new Date(), type: 'revenue' }
      ]);
      
      const response = await request(app)
        .get(`/api/analytics/kpis/${testKPI._id}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Alert should be triggered automatically
      expect(response.body.alerts).toContainEqual(
        expect.objectContaining({
          type: 'critical',
          message: expect.stringContaining('below critical threshold')
        })
      );
    });
  });
  
  describe('Data Visualization', () => {
    beforeEach(async () => {
      // Create test data source
      testDataSource = await DataSource.create({
        name: 'Sales Performance Data',
        type: 'database',
        connection: {
          database: 'test_db',
          collection: 'sales_data',
          fields: ['date', 'product', 'region', 'amount', 'quantity']
        },
        refreshSchedule: '0 6 * * *', // Daily at 6 AM
        dataQuality: {
          completeness: 95,
          accuracy: 98,
          timeliness: 92
        }
      });
    });
    
    test('should create chart visualization with data binding', async () => {
      const chartData = {
        name: 'Sales Trend Analysis',
        type: 'line_chart',
        dataSource: testDataSource._id,
        configuration: {
          xAxis: {
            field: 'date',
            type: 'date',
            format: 'YYYY-MM-DD',
            displayFormat: 'MMM YYYY'
          },
          yAxis: {
            field: 'amount',
            type: 'numeric',
            aggregation: 'SUM',
            format: 'currency'
          },
          series: [
            {
              field: 'region',
              aggregation: 'none',
              colorScheme: 'category10'
            }
          ],
          filters: [
            {
              field: 'date',
              operator: '>=',
              value: '2025-01-01'
            }
          ],
          options: {
            title: 'Sales Performance by Region',
            subtitle: 'Monthly trend analysis',
            legend: true,
            grid: true,
            tooltip: true,
            animation: true
          }
        },
        interactive: {
          zoom: true,
          pan: true,
          dataPointSelection: true,
          drillDown: true
        },
        exportFormats: ['png', 'pdf', 'svg', 'excel'],
        refreshInterval: 3600000 // 1 hour
      };
      
      const response = await request(app)
        .post('/api/analytics/visualizations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chartData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: chartData.name,
        type: chartData.type,
        dataSource: testDataSource._id.toString(),
        configuration: chartData.configuration,
        interactive: chartData.interactive,
        exportFormats: chartData.exportFormats
      });
      
      testVisualization = response.body;
    });
    
    test('should create dashboard widget from visualization', async () => {
      const widgetData = {
        name: 'Revenue Widget',
        visualization: testVisualization._id,
        dashboard: testDashboard._id,
        position: {
          x: 0,
          y: 0,
          width: 6,
          height: 4
        },
        settings: {
          autoRefresh: true,
          refreshInterval: 300000,
          showTitle: true,
          showLegend: true,
          enableExport: true
        },
        filters: {
          global: {
            dateRange: {
              start: '2025-01-01',
              end: '2025-12-31'
            }
          },
          local: {
            region: ['North America', 'Europe']
          }
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/widgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(widgetData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: widgetData.name,
        visualization: testVisualization._id.toString(),
        dashboard: testDashboard._id.toString(),
        position: widgetData.position,
        settings: widgetData.settings,
        filters: widgetData.filters
      });
    });
    
    test('should generate real-time data for visualization', async () => {
      // Insert real-time test data
      await SalesData.insertMany([
        { date: new Date(), product: 'Product A', region: 'North', amount: 1000, quantity: 10 },
        { date: new Date(), product: 'Product B', region: 'South', amount: 1500, quantity: 15 },
        { date: new Date(), product: 'Product C', region: 'North', amount: 800, quantity: 8 }
      ]);
      
      const response = await request(app)
        .get(`/api/analytics/visualizations/${testVisualization._id}/data`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          filters: JSON.stringify({
            dateRange: {
              start: new Date(Date.now() - 86400000).toISOString(), // Last 24 hours
              end: new Date().toISOString()
            }
          }),
          limit: 1000,
          sort: 'date:desc'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.metadata).toHaveProperty('totalRecords');
      expect(response.body.metadata).toHaveProperty('fields');
      expect(response.body.metadata).toHaveProperty('dataQuality');
    });
    
    test('should handle visualization data aggregation', async () => {
      const aggregationConfig = {
        groupBy: ['region', 'product'],
        aggregations: [
          { field: 'amount', operation: 'SUM', alias: 'total_amount' },
          { field: 'quantity', operation: 'AVG', alias: 'avg_quantity' },
          { field: 'amount', operation: 'COUNT', alias: 'transaction_count' }
        ],
        having: {
          condition: 'total_amount > 5000',
          logic: 'AND'
        },
        orderBy: [
          { field: 'total_amount', direction: 'desc' },
          { field: 'avg_quantity', direction: 'desc' }
        ]
      };
      
      const response = await request(app)
        .post(`/api/analytics/visualizations/${testVisualization._id}/aggregate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(aggregationConfig)
        .expect(200);
      
      expect(response.body).toHaveProperty('aggregatedData');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.aggregatedData[0]).toHaveProperty('total_amount');
      expect(response.body.aggregatedData[0]).toHaveProperty('avg_quantity');
      expect(response.body.aggregatedData[0]).toHaveProperty('transaction_count');
    });
    
    test('should export visualization in multiple formats', async () => {
      const formats = ['png', 'pdf', 'svg', 'excel'];
      
      for (const format of formats) {
        const response = await request(app)
          .get(`/api/analytics/visualizations/${testVisualization._id}/export`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({ format })
          .expect(200);
        
        expect(response.headers['content-type']).toMatch(
          format === 'png' ? /image\/png/ :
          format === 'pdf' ? /application\/pdf/ :
          format === 'svg' ? /image\/svg\+xml/ :
          /application\/vnd.ms-excel/
        );
      }
    });
  });
  
  describe('Report Generation', () => {
    test('should create scheduled report with multiple outputs', async () => {
      const reportData = {
        name: 'Monthly Financial Summary',
        description: 'Comprehensive monthly financial report',
        type: 'scheduled',
        template: 'financial_summary',
        schedule: {
          frequency: 'monthly',
          day: 1,
          time: '08:00',
          timezone: 'UTC'
        },
        recipients: [
          'ceo@company.com',
          'cfo@company.com',
          'finance-team@company.com'
        ],
        parameters: {
          period: 'previous_month',
          includeCharts: true,
          includeTables: true,
          includeKPIs: true,
          currency: 'USD',
          language: 'en'
        },
        outputFormats: ['pdf', 'excel', 'email'],
        retention: {
          keepForMonths: 12,
          archiveAfterMonths: 6
        },
        accessControl: {
          view: ['executives', 'finance_team'],
          edit: ['finance_analysts']
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: reportData.name,
        type: reportData.type,
        schedule: reportData.schedule,
        recipients: reportData.recipients,
        parameters: reportData.parameters,
        outputFormats: reportData.outputFormats
      });
    });
    
    test('should generate on-demand report with real-time data', async () => {
      const reportRequest = {
        template: 'executive_dashboard',
        parameters: {
          dateRange: {
            start: '2025-11-01',
            end: '2025-11-30'
          },
          departments: ['sales', 'marketing', 'operations'],
          currency: 'USD',
          includeComparisons: true,
          comparisonPeriod: 'previous_month'
        },
        outputFormat: 'pdf',
        options: {
          watermark: true,
          pageNumbers: true,
          header: true,
          footer: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportRequest)
        .expect(202);
      
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('processing');
      expect(response.body).toHaveProperty('estimatedCompletionTime');
    });
    
    test('should track report generation progress', async () => {
      const jobId = 'report_job_123';
      
      const response = await request(app)
        .get(`/api/analytics/reports/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('logs');
      expect(response.body.status).toMatch(/pending|processing|completed|failed/);
    });
    
    test('should handle report template customization', async () => {
      const templateData = {
        name: 'Custom Executive Report',
        description: 'Tailored executive summary template',
        sections: [
          {
            id: 'executive_summary',
            type: 'text',
            content: 'Executive summary text with {{company_name}} and {{report_period}}',
            order: 1
          },
          {
            id: 'financial_highlights',
            type: 'kpi_grid',
            config: {
              kpis: ['revenue', 'profit_margin', 'cash_flow'],
              layout: '3_column',
              showTrends: true
            },
            order: 2
          },
          {
            id: 'revenue_analysis',
            type: 'chart',
            config: {
              visualization: 'revenue_trend',
              chartType: 'line',
              showAnnotations: true
            },
            order: 3
          },
          {
            id: 'detailed_tables',
            type: 'table',
            config: {
              dataSource: 'financial_details',
              columns: ['account', 'current_period', 'previous_period', 'variance'],
              showTotals: true
            },
            order: 4
          }
        ],
        styling: {
          theme: 'corporate',
          colorScheme: 'blue',
          fonts: {
            header: 'Arial',
            body: 'Calibri'
          },
          logo: {
            position: 'top_right',
            size: 'small'
          }
        },
        variables: {
          company_name: { type: 'string', required: true },
          report_period: { type: 'date_range', required: true },
          fiscal_year: { type: 'number', required: false }
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/report-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: templateData.name,
        sections: templateData.sections,
        styling: templateData.styling,
        variables: templateData.variables
      });
    });
  });
  
  describe('Data Integration & Real-time Analytics', () => {
    test('should connect to external data sources', async () => {
      const dataSourceConfig = {
        name: 'External CRM Data',
        type: 'api',
        connection: {
          endpoint: 'https://api.crm.com/v1/data',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {{api_token}}',
            'Content-Type': 'application/json'
          },
          authentication: {
            type: 'oauth2',
            clientId: 'crm_client_123',
            clientSecret: 'crm_secret_456'
          },
          rateLimit: {
            requestsPerMinute: 100,
            retryAttempts: 3
          }
        },
        schema: {
          fields: [
            { name: 'customer_id', type: 'string', required: true },
            { name: 'revenue', type: 'number', required: true },
            { name: 'last_activity', type: 'date', required: false }
          ]
        },
        sync: {
          frequency: 'hourly',
          incremental: true,
          conflictResolution: 'latest_timestamp'
        },
        dataQuality: {
          validation: true,
          deduplication: true,
          outlierDetection: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/data-sources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dataSourceConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: dataSourceConfig.name,
        type: dataSourceConfig.type,
        connection: dataSourceConfig.connection,
        schema: dataSourceConfig.schema,
        sync: dataSourceConfig.sync
      });
    });
    
    test('should establish real-time data streaming', async () => {
      const streamConfig = {
        name: 'Real-time Transaction Feed',
        source: 'payment_gateway',
        protocol: 'websocket',
        configuration: {
          url: 'wss://payments.example.com/stream',
          topics: ['transactions', 'refunds', 'settlements'],
          filters: {
            amount: { min: 100 },
            currency: ['USD', 'EUR']
          },
          buffer: {
            size: 1000,
            flushInterval: 5000
          }
        },
        processing: {
          transformation: {
            map: {
              'transaction_id': 'id',
              'amount_usd': 'amount',
              'timestamp': 'created_at'
            }
          },
          enrichment: {
            geoLocation: true,
            customerInfo: true,
            riskScore: true
          },
          aggregation: {
            windowSize: '1m',
            functions: ['sum', 'count', 'avg']
          }
        },
        destinations: [
          {
            type: 'database',
            collection: 'real_time_transactions'
          },
          {
            type: 'cache',
            key: 'transaction_stream'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/analytics/data-streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: streamConfig.name,
        source: streamConfig.source,
        protocol: streamConfig.protocol,
        configuration: streamConfig.configuration,
        processing: streamConfig.processing
      });
    });
    
    test('should handle data pipeline orchestration', async () => {
      const pipelineConfig = {
        name: 'Financial Data ETL Pipeline',
        description: 'Extract, transform, and load financial data',
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC'
        },
        stages: [
          {
            id: 'extract',
            type: 'extract',
            source: 'multiple_databases',
            configuration: {
              connections: ['erp_db', 'crm_db', 'payment_db'],
              queryOptimization: true,
              parallel: true
            }
          },
          {
            id: 'validate',
            type: 'validate',
            configuration: {
              rules: [
                { field: 'amount', type: 'range', min: 0 },
                { field: 'date', type: 'date_format', format: 'YYYY-MM-DD' },
                { field: 'currency', type: 'enum', values: ['USD', 'EUR', 'GBP'] }
              ],
              failOnError: false
            }
          },
          {
            id: 'transform',
            type: 'transform',
            configuration: {
              operations: [
                { type: 'currency_conversion', from: 'EUR', to: 'USD', rate: 'latest' },
                { type: 'date_standardization', format: 'ISO8601' },
                { type: 'data_enrichment', source: 'customer_master' }
              ]
            }
          },
          {
            id: 'load',
            type: 'load',
            destination: 'data_warehouse',
            configuration: {
              table: 'financial_facts',
              mode: 'upsert',
              partitioning: 'by_date'
            }
          }
        ],
        errorHandling: {
          retryAttempts: 3,
          retryDelay: 300000,
          notifyOnFailure: true,
          fallback: 'skip_stage'
        },
        monitoring: {
          performance: true,
          dataQuality: true,
          alerts: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/data-pipelines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pipelineConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: pipelineConfig.name,
        schedule: pipelineConfig.schedule,
        stages: pipelineConfig.stages,
        errorHandling: pipelineConfig.errorHandling
      });
    });
    
    test('should monitor data quality and lineage', async () => {
      const qualityCheck = {
        dataset: 'financial_transactions',
        checks: [
          {
            name: 'Completeness Check',
            type: 'completeness',
            fields: ['transaction_id', 'amount', 'date', 'currency'],
            threshold: 0.95
          },
          {
            name: 'Validity Check',
            type: 'validity',
            rules: {
              amount: { min: 0, max: 1000000 },
              date: { format: 'YYYY-MM-DD', range: ['2020-01-01', '2030-12-31'] }
            }
          },
          {
            name: 'Uniqueness Check',
            type: 'uniqueness',
            fields: ['transaction_id'],
            threshold: 1.0
          },
          {
            name: 'Consistency Check',
            type: 'consistency',
            rules: {
              'amount_usd': 'amount_eur * exchange_rate_usd_eur'
            }
          }
        ],
        schedule: 'hourly',
        alerts: {
          email: ['data_quality@company.com'],
          threshold: 0.9
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/data-quality')
        .set('Authorization', `Bearer ${authToken}`)
        .send(qualityCheck)
        .expect(201);
      
      expect(response.body).toMatchObject({
        dataset: qualityCheck.dataset,
        checks: qualityCheck.checks,
        schedule: qualityCheck.schedule
      });
    });
  });
  
  describe('Performance & Security', () => {
    test('should handle dashboard performance with large datasets', async () => {
      // Generate large dataset (10,000 records)
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        date: new Date(2025, 10, i % 30 + 1),
        product: `Product ${i % 100}`,
        region: ['North', 'South', 'East', 'West'][i % 4],
        amount: Math.random() * 10000,
        quantity: Math.floor(Math.random() * 100)
      }));
      
      await SalesData.insertMany(largeDataset);
      
      const startTime = Date.now();
      const response = await request(app)
        .get(`/api/analytics/dashboards/${testDashboard._id}/data`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 10000,
          includeAggregations: true,
          cacheResults: true
        })
        .expect(200);
      const endTime = Date.now();
      
      expect(response.body.data).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(response.body.performance).toHaveProperty('queryTime');
      expect(response.body.performance).toHaveProperty('recordsProcessed');
    });
    
    test('should implement data caching and optimization', async () => {
      const cacheConfig = {
        dashboard: testDashboard._id,
        strategy: 'intelligent',
        ttl: 300000, // 5 minutes
        invalidation: {
          triggers: ['data_update', 'schema_change'],
          patterns: ['financial_transactions', 'sales_data']
        },
        optimization: {
          preAggregation: true,
          columnarStorage: true,
          compression: true
        }
      };
      
      const response = await request(app)
        .post('/api/analytics/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cacheConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        strategy: cacheConfig.strategy,
        ttl: cacheConfig.ttl,
        optimization: cacheConfig.optimization
      });
    });
    
    test('should enforce security and access control', async () => {
      // Test unauthorized access
      const unauthorizedResponse = await request(app)
        .get(`/api/analytics/dashboards/${testDashboard._id}`)
        .expect(401);
      
      expect(unauthorizedResponse.body).toHaveProperty('error');
      expect(unauthorizedResponse.body.error).toBe('Unauthorized');
      
      // Test role-based access control
      const restrictedUser = await User.create({
        username: 'restricted_user',
        email: 'restricted@test.com',
        password: 'TestPassword123!',
        role: 'data_entry',
        permissions: ['data.create', 'data.edit'],
        companyId: 'test_company_analytics'
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'restricted_user',
          password: 'TestPassword123!'
        });
      
      const restrictedToken = loginResponse.body.token;
      
      const forbiddenResponse = await request(app)
        .get(`/api/analytics/dashboards/${testDashboard._id}`)
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);
      
      expect(forbiddenResponse.body).toHaveProperty('error');
      expect(forbiddenResponse.body.error).toBe('Forbidden');
    });
    
    test('should sanitize user inputs and prevent injection', async () => {
      const maliciousInputs = [
        { name: '<script>alert("xss")</script>Dashboard' },
        { name: "'; DROP TABLE dashboards; --" },
        { name: '../../../../etc/passwd' },
        { name: '{{constructor.constructor(\'return process\')()}}' }
      ];
      
      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/analytics/dashboards')
          .set('Authorization', `Bearer ${authToken}`)
          .send(input)
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.stringContaining('Invalid')
            })
          ])
        );
      }
    });
    
    test('should handle concurrent dashboard updates', async () => {
      const update1 = { name: 'First Update', description: 'Updated by user 1' };
      const update2 = { name: 'Second Update', description: 'Updated by user 2' };
      
      // Simulate concurrent updates
      const [response1, response2] = await Promise.all([
        request(app)
          .put(`/api/analytics/dashboards/${testDashboard._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1),
        request(app)
          .put(`/api/analytics/dashboards/${testDashboard._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
      ]);
      
      // Both updates should succeed, but last one wins
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Verify the final state
      const finalResponse = await request(app)
        .get(`/api/analytics/dashboards/${testDashboard._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(finalResponse.body.name).toBe(update2.name);
    });
  });
  
  describe('Integration Testing', () => {
    test('should integrate with external BI tools', async () => {
      const integrationConfig = {
        tool: 'power_bi',
        connection: {
          type: 'api',
          endpoint: 'https://api.powerbi.com/v1.0/myorg/datasets',
          authentication: {
            type: 'service_principal',
            clientId: 'powerbi_client_123',
            clientSecret: 'powerbi_secret_456',
            tenantId: 'tenant_789'
          }
        },
        sync: {
          direction: 'push',
          frequency: 'real-time',
          conflictResolution: 'source_wins'
        },
        mappings: [
          {
            localField: 'financial_data.revenue',
            externalField: 'Revenue',
            transformation: 'currency_conversion'
          },
          {
            localField: 'financial_data.date',
            externalField: 'Date',
            transformation: 'date_format'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/analytics/integrations/power-bi')
        .set('Authorization', `Bearer ${authToken}`)
        .send(integrationConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        tool: integrationConfig.tool,
        connection: integrationConfig.connection,
        sync: integrationConfig.sync
      });
    });
    
    test('should export data to various formats', async () => {
      const exportFormats = [
        { format: 'csv', options: { delimiter: ',', encoding: 'utf8' } },
        { format: 'excel', options: { sheets: ['Summary', 'Details'] } },
        { format: 'json', options: { pretty: true, schema: true } },
        { format: 'xml', options: { rootElement: 'FinancialData' } }
      ];
      
      for (const exportConfig of exportFormats) {
        const response = await request(app)
          .post(`/api/analytics/dashboards/${testDashboard._id}/export`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(exportConfig)
          .expect(200);
        
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body.status).toBe('processing');
      }
    });
    
    test('should handle API rate limiting and throttling', async () => {
      const requests = Array.from({ length: 150 }, (_, i) => 
        request(app)
          .get(`/api/analytics/dashboards/${testDashboard._id}`)
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(requests);
      
      // First 100 requests should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(100);
      
      // Some requests should be rate limited
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
  
  describe('Error Handling & Edge Cases', () => {
    test('should handle missing data sources gracefully', async () => {
      const invalidDataSource = 'invalid_datasource_id';
      
      const response = await request(app)
        .get(`/api/analytics/visualizations/data/${invalidDataSource}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Data source not found');
    });
    
    test('should handle malformed dashboard configurations', async () => {
      const invalidConfig = {
        name: 'Invalid Config Dashboard',
        layout: null,
        widgets: 'invalid_widgets_type'
      };
      
      const response = await request(app)
        .post('/api/analytics/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfig)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
    
    test('should handle database connection failures', async () => {
      // Simulate database connection failure
      await mongoose.connection.close();
      
      const response = await request(app)
        .get('/api/analytics/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(503);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Service temporarily unavailable');
    });
    
    test('should handle memory exhaustion gracefully', async () => {
      // Attempt to process extremely large dataset
      const response = await request(app)
        .get('/api/analytics/visualizations/data')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          limit: 10000000, // 10 million records
          batchSize: 1000000
        })
        .expect(413);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Request entity too large');
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

const Dashboard = mongoose.model('Dashboard', new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  layout: mongoose.Schema.Types.Mixed,
  permissions: mongoose.Schema.Types.Mixed,
  refreshInterval: Number,
  autoRefresh: Boolean,
  tags: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shareSettings: mongoose.Schema.Types.Mixed
}));

const KPIDefinition = mongoose.model('KPIDefinition', new mongoose.Schema({
  name: String,
  code: String,
  category: String,
  description: String,
  formula: String,
  dataSource: String,
  calculationFrequency: String,
  unit: String,
  precision: Number,
  thresholds: mongoose.Schema.Types.Mixed,
  displayFormat: String,
  colorScheme: String,
  benchmark: mongoose.Schema.Types.Mixed,
  drillDownConfig: mongoose.Schema.Types.Mixed,
  tags: [String]
}));

const DataSource = mongoose.model('DataSource', new mongoose.Schema({
  name: String,
  type: String,
  connection: mongoose.Schema.Types.Mixed,
  refreshSchedule: String,
  dataQuality: mongoose.Schema.Types.Mixed
}));

const Visualization = mongoose.model('Visualization', new mongoose.Schema({
  name: String,
  type: String,
  dataSource: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource' },
  configuration: mongoose.Schema.Types.Mixed,
  interactive: mongoose.Schema.Types.Mixed,
  exportFormats: [String],
  refreshInterval: Number
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
  amount: Number,
  transaction_date: Date,
  type: String
}));

const SalesData = mongoose.model('SalesData', new mongoose.Schema({
  date: Date,
  product: String,
  region: String,
  amount: Number,
  quantity: Number
}));

const Report = mongoose.model('Report', new mongoose.Schema({
  name: String,
  type: String,
  schedule: mongoose.Schema.Types.Mixed,
  recipients: [String],
  parameters: mongoose.Schema.Types.Mixed,
  outputFormats: [String]
}));