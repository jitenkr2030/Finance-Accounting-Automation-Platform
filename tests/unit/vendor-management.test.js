/**
 * Vendor Management Test Suite
 * Compliance & Documents Category
 * Vendor Onboarding, Compliance Verification, and Document Management
 */

const request = require('supertest');
const mongoose = require('mongoose');

describe('Vendor Management Engine', () => {
  let app;
  let testUser;
  let testVendor;
  let testDocument;
  let testComplianceCheck;
  let authToken;
  
  beforeAll(async () => {
    // Setup test environment
    app = require('../src/app');
    
    // Create test user with vendor management permissions
    testUser = await User.create({
      username: 'vendor_test_user',
      email: 'vendor@test.com',
      password: 'TestPassword123!',
      role: 'procurement_manager',
      permissions: ['vendor.create', 'vendor.edit', 'vendor.view', 'vendor.delete', 'vendor.compliance'],
      companyId: 'test_company_vendor'
    });
    
    // Generate auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'vendor_test_user',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: 'vendor@test.com' });
    await Vendor.deleteMany({});
    await VendorDocument.deleteMany({});
    await ComplianceCheck.deleteMany({});
    await VendorEvaluation.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Vendor Registration & Onboarding', () => {
    test('should create new vendor with complete registration', async () => {
      const vendorData = {
        name: 'Global Tech Solutions Ltd',
        legalName: 'Global Tech Solutions Private Limited',
        type: 'corporate',
        category: 'IT_SERVICES',
        taxId: '29ABCDE1234F1Z5',
        registrationNumber: 'CIN123456789',
        yearEstablished: 2015,
        website: 'https://globaltech.com',
        
        // Contact Information
        primaryContact: {
          name: 'John Smith',
          title: 'Business Development Manager',
          email: 'john.smith@globaltech.com',
          phone: '+1-555-0123',
          mobile: '+1-555-0124'
        },
        
        // Address Information
        registeredAddress: {
          street: '123 Business Avenue',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
          isDefault: true
        },
        
        // Business Details
        businessDetails: {
          employeeCount: 250,
          annualRevenue: 50000000,
          businessType: 'Service Provider',
          industries: ['Technology', 'Consulting', 'Software Development'],
          certifications: ['ISO 9001', 'SOC 2', 'GDPR Compliant'],
          capabilities: [
            'Software Development',
            'Cloud Solutions',
            'Data Analytics',
            'Cybersecurity'
          ]
        },
        
        // Banking Information
        bankingDetails: {
          accountHolderName: 'Global Tech Solutions Ltd',
          bankName: 'Bank of America',
          accountNumber: '1234567890',
          routingNumber: '021000021',
          swiftCode: 'BOFAUS3N',
          currency: 'USD',
          iban: null,
          bankAddress: {
            street: '100 Main Street',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            postalCode: '94105'
          }
        },
        
        // Compliance Requirements
        complianceRequirements: {
          w9Required: true,
          insuranceRequired: true,
          backgroundCheckRequired: true,
          ndaRequired: true,
          securityClearanceRequired: false,
          industrySpecificCerts: ['ISO 27001', 'PCI DSS']
        },
        
        // Preferences
        preferences: {
          communicationMethod: 'email',
          preferredCurrency: 'USD',
          paymentTerms: 'NET_30',
          invoiceFormat: 'pdf',
          language: 'en',
          timezone: 'America/Los_Angeles'
        },
        
        // Status
        status: 'pending_review',
        onboardingStage: 'registration',
        tags: ['technology', 'preferred', 'strategic_partner']
      };
      
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vendorData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: vendorData.name,
        legalName: vendorData.legalName,
        type: vendorData.type,
        category: vendorData.category,
        taxId: vendorData.taxId,
        status: vendorData.status,
        onboardingStage: vendorData.onboardingStage,
        owner: testUser._id.toString()
      });
      
      testVendor = response.body;
    });
    
    test('should validate vendor tax identification numbers', async () => {
      const invalidTaxIds = [
        { taxId: 'INVALID_TAX_ID', country: 'USA' },
        { taxId: '29AAAAA1234F1Z5', country: 'IND' }, // Invalid format
        { taxId: '123456789', country: 'CAN' }, // Too short
        { taxId: 'ABCDEFGHIJKLMNOP', country: 'GBR' } // Too long
      ];
      
      for (const testCase of invalidTaxIds) {
        const response = await request(app)
          .post('/api/vendors')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Invalid Tax Test Vendor',
            taxId: testCase.taxId,
            country: testCase.country
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            field: 'taxId',
            message: expect.stringContaining('Invalid tax ID format')
          })
        );
      }
    });
    
    test('should handle vendor registration workflow stages', async () => {
      const workflowStages = [
        { stage: 'registration', status: 'completed', completedBy: testUser._id },
        { stage: 'document_submission', status: 'completed', completedBy: testUser._id },
        { stage: 'compliance_check', status: 'in_progress' },
        { stage: 'approval', status: 'pending' },
        { stage: 'onboarding', status: 'pending' }
      ];
      
      for (const stage of workflowStages) {
        const response = await request(app)
          .put(`/api/vendors/${testVendor._id}/onboarding`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            stage: stage.stage,
            status: stage.status,
            notes: `Stage ${stage.stage} ${stage.status}`,
            completedBy: stage.completedBy
          })
          .expect(200);
        
        expect(response.body.onboardingStage).toBe(stage.status === 'completed' ? 'next_stage' : stage.status);
      }
    });
    
    test('should manage vendor hierarchies and relationships', async () => {
      // Create parent vendor
      const parentVendor = await Vendor.create({
        name: 'Parent Corporation Inc',
        type: 'holding_company',
        category: 'CORPORATE',
        status: 'approved'
      });
      
      // Create subsidiary vendor
      const subsidiaryData = {
        name: 'Subsidiary LLC',
        type: 'subsidiary',
        category: 'SERVICE_PROVIDER',
        parentVendorId: parentVendor._id,
        relationshipType: 'subsidiary',
        ownershipPercentage: 100,
        relationshipStartDate: new Date('2020-01-01')
      };
      
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subsidiaryData)
        .expect(201);
      
      expect(response.body.parentVendorId).toBe(parentVendor._id.toString());
      expect(response.body.relationshipType).toBe('subsidiary');
      expect(response.body.ownershipPercentage).toBe(100);
      
      // Test vendor relationship validation
      const circularRelationshipData = {
        name: 'Circular Test Vendor',
        parentVendorId: response.body._id // This would create a circular reference
      };
      
      const circularResponse = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(circularRelationshipData)
        .expect(400);
      
      expect(circularResponse.body).toHaveProperty('errors');
      expect(circularResponse.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'parentVendorId',
          message: expect.stringContaining('circular reference')
        })
      );
    });
  });
  
  describe('Document Management', () => {
    beforeEach(async () => {
      // Create test vendor document
      testDocument = await VendorDocument.create({
        vendorId: testVendor._id,
        documentType: 'TAX_CERTIFICATE',
        name: 'W-9 Tax Form',
        fileName: 'W9_GlobalTech_2025.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        uploadDate: new Date(),
        expiryDate: new Date('2026-12-31'),
        status: 'active',
        uploadedBy: testUser._id,
        version: 1,
        isLatest: true,
        tags: ['tax', 'compliance', '2025'],
        metadata: {
          pages: 2,
          digitalSignature: true,
          encrypted: true
        }
      });
    });
    
    test('should upload and manage vendor documents', async () => {
      const documentData = {
        vendorId: testVendor._id,
        documentType: 'BUSINESS_LICENSE',
        name: 'Business License 2025',
        description: 'Annual business license renewal',
        expiryDate: new Date('2025-12-31'),
        tags: ['license', 'renewal', '2025'],
        isConfidential: true,
        requiredForCompliance: true
      };
      
      const response = await request(app)
        .post('/api/vendors/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        documentType: documentData.documentType,
        name: documentData.name,
        status: 'pending_review',
        uploadedBy: testUser._id.toString(),
        isLatest: true
      });
    });
    
    test('should handle document version control', async () => {
      // Upload new version of existing document
      const newVersionData = {
        vendorId: testVendor._id,
        documentType: 'TAX_CERTIFICATE',
        name: 'W-9 Tax Form (Updated)',
        version: 2,
        isNewVersion: true,
        originalDocumentId: testDocument._id,
        changeLog: 'Updated tax information for 2025'
      };
      
      const response = await request(app)
        .post('/api/vendors/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVersionData)
        .expect(201);
      
      expect(response.body.version).toBe(2);
      expect(response.body.originalDocumentId).toBe(testDocument._id.toString());
      expect(response.body.isLatest).toBe(true);
      
      // Verify old version is no longer latest
      const oldVersionResponse = await request(app)
        .get(`/api/vendors/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(oldVersionResponse.body.isLatest).toBe(false);
    });
    
    test('should validate document formats and size limits', async () => {
      const invalidDocuments = [
        {
          documentType: 'CONTRACT',
          fileName: 'contract.exe', // Invalid extension
          fileSize: 52428801 // 50MB+ (exceeds limit)
        },
        {
          documentType: 'CERTIFICATE',
          fileName: 'certificate.doc', // Unsupported format
          mimeType: 'application/msword'
        }
      ];
      
      for (const doc of invalidDocuments) {
        const response = await request(app)
          .post('/api/vendors/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            vendorId: testVendor._id,
            ...doc
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });
    
    test('should track document approval workflow', async () => {
      const approvalWorkflow = [
        {
          status: 'pending_review',
          reviewer: 'compliance_officer',
          dueDate: new Date(Date.now() + 86400000) // 1 day
        },
        {
          status: 'under_review',
          reviewer: 'legal_team',
          notes: 'Initial review completed'
        },
        {
          status: 'approved',
          reviewer: 'procurement_manager',
          notes: 'Document approved for use',
          approvedBy: testUser._id
        }
      ];
      
      for (const step of approvalWorkflow) {
        const response = await request(app)
          .put(`/api/vendors/documents/${testDocument._id}/review`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(step)
          .expect(200);
        
        expect(response.body.status).toBe(step.status);
        expect(response.body.reviewHistory).toHaveLength(step.reviewer ? 1 : 0);
      }
    });
    
    test('should handle document expiration and renewal alerts', async () => {
      // Set document to expire in 30 days
      await VendorDocument.findByIdAndUpdate(testDocument._id, {
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      const response = await request(app)
        .get(`/api/vendors/${testVendor._id}/documents/expiring`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ days: 60 })
        .expect(200);
      
      expect(response.body).toHaveProperty('expiringDocuments');
      expect(response.body.expiringDocuments).toContainEqual(
        expect.objectContaining({
          documentId: testDocument._id.toString(),
          daysUntilExpiry: expect.any(Number)
        })
      );
    });
  });
  
  describe('Compliance & Risk Management', () => {
    beforeEach(async () => {
      // Create compliance check
      testComplianceCheck = await ComplianceCheck.create({
        vendorId: testVendor._id,
        checkType: 'COMPREHENSIVE',
        status: 'pending',
        requiredDocuments: [
          'TAX_CERTIFICATE',
          'BUSINESS_LICENSE',
          'INSURANCE_CERTIFICATE',
          'BANK_DETAILS'
        ],
        complianceRules: [
          {
            rule: 'VALID_TAX_ID',
            description: 'Tax identification number must be valid',
            required: true,
            status: 'pending'
          },
          {
            rule: 'ACTIVE_BUSINESS_LICENSE',
            description: 'Business license must be current',
            required: true,
            status: 'pending'
          }
        ],
        riskAssessment: {
          overall: 'medium',
          factors: [
            {
              factor: 'industry_risk',
              score: 6,
              description: 'Technology sector with moderate risk'
            },
            {
              factor: 'financial_stability',
              score: 8,
              description: 'Strong financial position'
            }
          ]
        },
        createdBy: testUser._id,
        assignedTo: 'compliance_team',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });
    
    test('should perform comprehensive compliance checks', async () => {
      const complianceCheckData = {
        vendorId: testVendor._id,
        checkType: 'ONBOARDING',
        scope: ['financial', 'legal', 'operational', 'security'],
        requiredDocuments: [
          'FINANCIAL_STATEMENTS',
          'BANK_REFERENCES',
          'INSURANCE_CERTIFICATES',
          'SECURITY_CERTIFICATIONS'
        ],
        complianceFrameworks: ['SOX', 'GDPR', 'ISO_27001'],
        riskTolerance: 'medium',
        geographicScope: ['USA', 'CAN', 'GBR']
      };
      
      const response = await request(app)
        .post('/api/vendors/compliance-checks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(complianceCheckData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        checkType: complianceCheckData.checkType,
        scope: complianceCheckData.scope,
        status: 'initiated',
        riskScore: expect.any(Number)
      });
    });
    
    test('should evaluate vendor risk scores', async () => {
      const riskEvaluation = {
        vendorId: testVendor._id,
        evaluationType: 'ANNUAL',
        factors: [
          {
            category: 'financial',
            weight: 0.3,
            score: 8,
            evidence: 'Strong revenue growth and profitability',
            lastUpdated: new Date()
          },
          {
            category: 'operational',
            weight: 0.25,
            score: 7,
            evidence: 'Good operational metrics and processes',
            lastUpdated: new Date()
          },
          {
            category: 'compliance',
            weight: 0.25,
            score: 9,
            evidence: 'No compliance violations found',
            lastUpdated: new Date()
          },
          {
            category: 'reputation',
            weight: 0.2,
            score: 8,
            evidence: 'Positive industry reputation and references',
            lastUpdated: new Date()
          }
        ],
        overallRiskScore: 8.0,
        riskLevel: 'LOW',
        recommendations: [
          'Continue monitoring financial performance',
          'Maintain current compliance monitoring'
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/risk-evaluation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(riskEvaluation)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        evaluationType: riskEvaluation.evaluationType,
        overallRiskScore: riskEvaluation.overallRiskScore,
        riskLevel: riskEvaluation.riskLevel
      });
      
      // Verify weighted score calculation
      const expectedScore = riskEvaluation.factors.reduce((total, factor) => 
        total + (factor.score * factor.weight), 0
      );
      expect(response.body.overallRiskScore).toBeCloseTo(expectedScore, 1);
    });
    
    test('should handle compliance violations and remediation', async () => {
      const violationData = {
        vendorId: testVendor._id,
        violationType: 'MISSING_DOCUMENT',
        severity: 'high',
        description: 'Required insurance certificate is missing',
        complianceRule: 'INSURANCE_REQUIRED',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        remediationPlan: {
          steps: [
            'Request updated insurance certificate',
            'Verify coverage amounts meet requirements',
            'Update vendor records upon approval'
          ],
          responsibleParty: 'vendor',
          estimatedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        },
        escalationRules: [
          {
            trigger: 'due_date_passed',
            action: 'suspend_purchase_orders',
            notification: ['procurement_manager', 'legal_team']
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/compliance-violations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(violationData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        violationType: violationData.violationType,
        severity: violationData.severity,
        status: 'open',
        dueDate: expect.any(Date)
      });
      
      // Test violation tracking and status updates
      const statusUpdate = {
        status: 'in_remediation',
        notes: 'Vendor has submitted requested documents',
        updatedBy: testUser._id
      };
      
      const updateResponse = await request(app)
        .put(`/api/vendors/compliance-violations/${response.body._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate)
        .expect(200);
      
      expect(updateResponse.body.status).toBe(statusUpdate.status);
    });
    
    test('should generate compliance reports', async () => {
      const reportConfig = {
        reportType: 'COMPLIANCE_SUMMARY',
        period: {
          startDate: '2025-01-01',
          endDate: '2025-12-31'
        },
        filters: {
          vendorCategories: ['IT_SERVICES', 'CONSULTING'],
          complianceStatus: ['compliant', 'non_compliant'],
          riskLevels: ['low', 'medium', 'high']
        },
        metrics: [
          'total_vendors',
          'compliance_rate',
          'violations_count',
          'average_risk_score'
        ],
        format: 'detailed',
        includeCharts: true
      };
      
      const response = await request(app)
        .post('/api/vendors/reports/compliance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        reportType: reportConfig.reportType,
        period: reportConfig.period,
        status: 'generating',
        generatedBy: testUser._id.toString()
      });
      
      expect(response.body).toHaveProperty('reportId');
    });
  });
  
  describe('Vendor Performance & Evaluation', () => {
    test('should track vendor performance metrics', async () => {
      const performanceData = {
        vendorId: testVendor._id,
        evaluationPeriod: {
          startDate: '2025-01-01',
          endDate: '2025-03-31'
        },
        metrics: [
          {
            category: 'quality',
            metric: 'defect_rate',
            value: 0.02,
            target: 0.01,
            unit: 'percentage',
            weight: 0.25
          },
          {
            category: 'delivery',
            metric: 'on_time_delivery',
            value: 0.95,
            target: 0.98,
            unit: 'percentage',
            weight: 0.25
          },
          {
            category: 'cost',
            metric: 'cost_variance',
            value: -0.03,
            target: 0,
            unit: 'percentage',
            weight: 0.25
          },
          {
            category: 'service',
            metric: 'customer_satisfaction',
            value: 4.2,
            target: 4.5,
            unit: 'rating',
            weight: 0.25
          }
        ],
        overallScore: 3.88,
        performanceLevel: 'satisfactory',
        improvementAreas: [
          'Quality control processes',
          'Delivery scheduling optimization'
        ],
        strengths: [
          'Cost competitiveness',
          'Responsive customer service'
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/performance-evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(performanceData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        evaluationPeriod: performanceData.evaluationPeriod,
        overallScore: performanceData.overallScore,
        performanceLevel: performanceData.performanceLevel
      });
      
      // Verify weighted score calculation
      const expectedScore = performanceData.metrics.reduce((total, metric) => 
        total + (metric.value * metric.weight), 0
      );
      expect(response.body.overallScore).toBeCloseTo(expectedScore, 2);
    });
    
    test('should manage vendor scorecards', async () => {
      const scorecardTemplate = {
        name: 'IT Services Vendor Scorecard',
        description: 'Comprehensive scorecard for IT service providers',
        categories: [
          {
            name: 'Technical Capabilities',
            weight: 0.3,
            criteria: [
              {
                name: 'Technical Expertise',
                weight: 0.4,
                scale: { min: 1, max: 5 },
                description: 'Depth of technical knowledge and expertise'
              },
              {
                name: 'Innovation',
                weight: 0.3,
                scale: { min: 1, max: 5 },
                description: 'Ability to provide innovative solutions'
              },
              {
                name: 'Scalability',
                weight: 0.3,
                scale: { min: 1, max: 5 },
                description: 'Ability to scale services as needed'
              }
            ]
          },
          {
            name: 'Service Quality',
            weight: 0.25,
            criteria: [
              {
                name: 'Response Time',
                weight: 0.35,
                scale: { min: 1, max: 5 },
                description: 'Speed of response to requests'
              },
              {
                name: 'Issue Resolution',
                weight: 0.35,
                scale: { min: 1, max: 5 },
                description: 'Effectiveness of issue resolution'
              },
              {
                name: 'Communication',
                weight: 0.3,
                scale: { min: 1, max: 5 },
                description: 'Quality of communication and updates'
              }
            ]
          },
          {
            name: 'Business Terms',
            weight: 0.25,
            criteria: [
              {
                name: 'Cost Competitiveness',
                weight: 0.4,
                scale: { min: 1, max: 5 },
                description: 'Competitiveness of pricing'
              },
              {
                name: 'Contract Terms',
                weight: 0.3,
                scale: { min: 1, max: 5 },
                description: 'Flexibility and fairness of terms'
              },
              {
                name: 'Payment Terms',
                weight: 0.3,
                scale: { min: 1, max: 5 },
                description: 'Acceptability of payment terms'
              }
            ]
          },
          {
            name: 'Compliance',
            weight: 0.2,
            criteria: [
              {
                name: 'Regulatory Compliance',
                weight: 0.4,
                scale: { min: 1, max: 5 },
                description: 'Adherence to regulations'
              },
              {
                name: 'Security Standards',
                weight: 0.35,
                scale: { min: 1, max: 5 },
                description: 'Security practices and certifications'
              },
              {
                name: 'Data Protection',
                weight: 0.25,
                scale: { min: 1, max: 5 },
                description: 'Data handling and privacy practices'
              }
            ]
          }
        ],
        scoringMethod: 'weighted_average',
        ratingScale: { min: 1, max: 5 },
        performanceLevels: [
          { name: 'excellent', minScore: 4.5, maxScore: 5.0 },
          { name: 'good', minScore: 3.5, maxScore: 4.49 },
          { name: 'satisfactory', minScore: 2.5, maxScore: 3.49 },
          { name: 'needs_improvement', minScore: 1.5, maxScore: 2.49 },
          { name: 'unsatisfactory', minScore: 1.0, maxScore: 1.49 }
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/scorecard-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scorecardTemplate)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: scorecardTemplate.name,
        categories: scorecardTemplate.categories,
        scoringMethod: scorecardTemplate.scoringMethod,
        ratingScale: scorecardTemplate.ratingScale
      });
      
      // Test scorecard application
      const evaluationData = {
        templateId: response.body._id,
        vendorId: testVendor._id,
        evaluations: [
          {
            category: 'Technical Capabilities',
            criteria: [
              { name: 'Technical Expertise', score: 4 },
              { name: 'Innovation', score: 4 },
              { name: 'Scalability', score: 5 }
            ]
          }
        ]
      };
      
      const evaluationResponse = await request(app)
        .post('/api/vendors/scorecard-evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(evaluationData)
        .expect(201);
      
      expect(evaluationResponse.body).toHaveProperty('overallScore');
      expect(evaluationResponse.body.performanceLevel).toBeDefined();
    });
  });
  
  describe('Procurement Integration', () => {
    test('should integrate with purchase order management', async () => {
      const purchaseOrderData = {
        vendorId: testVendor._id,
        poNumber: 'PO-2025-001',
        orderDate: new Date(),
        requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            itemCode: 'LAPTOP-001',
            description: 'Business Laptop - Dell Latitude 7420',
            quantity: 10,
            unitPrice: 1200,
            totalPrice: 12000,
            deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            specifications: {
              cpu: 'Intel Core i7-1165G7',
              ram: '16GB',
              storage: '512GB SSD',
              warranty: '3 years'
            }
          }
        ],
        totalAmount: 12000,
        currency: 'USD',
        paymentTerms: 'NET_30',
        shippingAddress: {
          name: 'Main Office',
          street: '456 Corporate Blvd',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001'
        },
        specialInstructions: 'Handle with care - electronic equipment',
        approvalStatus: 'pending_approval',
        createdBy: testUser._id
      };
      
      const response = await request(app)
        .post('/api/vendors/purchase-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseOrderData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        poNumber: purchaseOrderData.poNumber,
        totalAmount: purchaseOrderData.totalAmount,
        currency: purchaseOrderData.currency,
        status: 'pending_approval',
        createdBy: testUser._id.toString()
      });
      
      // Test vendor PO history
      const historyResponse = await request(app)
        .get(`/api/vendors/${testVendor._id}/purchase-orders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(historyResponse.body.orders).toContainEqual(
        expect.objectContaining({
          poNumber: purchaseOrderData.poNumber
        })
      );
    });
    
    test('should track vendor transaction history', async () => {
      const transactionData = {
        vendorId: testVendor._id,
        transactionType: 'purchase_order',
        referenceNumber: 'PO-2025-001',
        amount: 12000,
        currency: 'USD',
        transactionDate: new Date(),
        status: 'completed',
        description: 'Laptop procurement',
        lineItems: [
          {
            description: 'Dell Latitude 7420',
            quantity: 10,
            unitPrice: 1200,
            total: 12000
          }
        ],
        paymentInfo: {
          invoiceNumber: 'INV-2025-001',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        },
        documents: [
          {
            type: 'invoice',
            documentId: 'inv_doc_123',
            name: 'Invoice INV-2025-001.pdf'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        transactionType: transactionData.transactionType,
        amount: transactionData.amount,
        status: transactionData.status
      });
      
      // Test transaction analytics
      const analyticsResponse = await request(app)
        .get(`/api/vendors/${testVendor._id}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(analyticsResponse.body).toHaveProperty('totalSpend');
      expect(analyticsResponse.body).toHaveProperty('transactionCount');
      expect(analyticsResponse.body).toHaveProperty('averageOrderValue');
    });
  });
  
  describe('Security & Performance', () => {
    test('should enforce data security for sensitive vendor information', async () => {
      // Test unauthorized access to vendor banking details
      const restrictedUser = await User.create({
        username: 'restricted_user',
        email: 'restricted@test.com',
        password: 'TestPassword123!',
        role: 'data_entry',
        permissions: ['data.create', 'data.edit'],
        companyId: 'test_company_vendor'
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'restricted_user',
          password: 'TestPassword123!'
        });
      
      const restrictedToken = loginResponse.body.token;
      
      const unauthorizedResponse = await request(app)
        .get(`/api/vendors/${testVendor._id}/banking-details`)
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);
      
      expect(unauthorizedResponse.body).toHaveProperty('error');
      expect(unauthorizedResponse.body.error).toBe('Insufficient permissions');
    });
    
    test('should handle large vendor datasets efficiently', async () => {
      // Create 1000+ test vendors
      const testVendors = Array.from({ length: 1000 }, (_, i) => ({
        name: `Test Vendor ${i}`,
        type: 'individual',
        category: 'SERVICE_PROVIDER',
        status: 'active',
        taxId: `TAX${String(i).padStart(9, '0')}`,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
      
      await Vendor.insertMany(testVendors);
      
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 100,
          sort: 'createdAt:desc',
          filter: 'status:active'
        })
        .expect(200);
      const endTime = Date.now();
      
      expect(response.body).toHaveProperty('vendors');
      expect(response.body.vendors).toHaveLength(100);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination.total).toBeGreaterThan(1000);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
    
    test('should sanitize user inputs and prevent injection attacks', async () => {
      const maliciousInputs = [
        { name: '<script>alert("xss")</script>Vendor' },
        { description: "'; DROP TABLE vendors; --" },
        { email: 'vendor@test.com<script>alert("xss")</script>' },
        { website: 'javascript:alert("xss")' }
      ];
      
      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/vendors')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Vendor',
            type: 'individual',
            category: 'SERVICE_PROVIDER',
            ...input
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });
    
    test('should handle concurrent vendor updates gracefully', async () => {
      const update1 = { name: 'Updated Vendor Name 1', description: 'Updated by user 1' };
      const update2 = { name: 'Updated Vendor Name 2', description: 'Updated by user 2' };
      
      // Simulate concurrent updates
      const [response1, response2] = await Promise.all([
        request(app)
          .put(`/api/vendors/${testVendor._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1),
        request(app)
          .put(`/api/vendors/${testVendor._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
      ]);
      
      // Both updates should succeed, but last one wins
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Verify the final state
      const finalResponse = await request(app)
        .get(`/api/vendors/${testVendor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(finalResponse.body.name).toBe(update2.name);
    });
  });
  
  describe('Integration & Workflow', () => {
    test('should integrate with external vendor verification services', async () => {
      const verificationConfig = {
        vendorId: testVendor._id,
        services: [
          {
            name: 'duns_bradstreet',
            apiKey: 'db_api_key_123',
            endpoint: 'https://api.dnb.com/v1/data/duns',
            enabled: true
          },
          {
            name: 'business_registries',
            apiKey: 'registry_api_key_456',
            endpoint: 'https://api.businessregistry.com/v1/verify',
            enabled: true
          }
        ],
        verificationLevel: 'comprehensive',
        autoUpdate: true,
        frequency: 'quarterly'
      };
      
      const response = await request(app)
        .post('/api/vendors/external-verification')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verificationConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        vendorId: testVendor._id.toString(),
        verificationLevel: verificationConfig.verificationLevel,
        autoUpdate: verificationConfig.autoUpdate,
        status: 'configured'
      });
    });
    
    test('should automate vendor onboarding workflows', async () => {
      const workflowConfig = {
        name: 'Standard IT Vendor Onboarding',
        description: 'Automated workflow for IT service provider onboarding',
        trigger: 'vendor_registration',
        stages: [
          {
            id: 'initial_review',
            name: 'Initial Documentation Review',
            assignee: 'procurement_team',
            duration: 2, // days
            actions: [
              'validate_basic_information',
              'check_required_documents',
              'initial_risk_assessment'
            ],
            conditions: [
              {
                field: 'document_count',
                operator: '>=',
                value: 5
              }
            ]
          },
          {
            id: 'compliance_check',
            name: 'Compliance Verification',
            assignee: 'compliance_team',
            duration: 5, // days
            actions: [
              'verify_tax_information',
              'check_business_licenses',
              'insurance_verification',
              'background_check'
            ],
            dependencies: ['initial_review']
          },
          {
            id: 'financial_review',
            name: 'Financial Assessment',
            assignee: 'finance_team',
            duration: 3, // days
            actions: [
              'review_financial_statements',
              'bank_reference_check',
              'credit_assessment'
            ],
            dependencies: ['compliance_check']
          },
          {
            id: 'approval',
            name: 'Final Approval',
            assignee: 'procurement_manager',
            duration: 1, // days
            actions: [
              'review_all_assessments',
              'final_decision',
              'vendor_activation'
            ],
            dependencies: ['financial_review']
          }
        ],
        escalationRules: [
          {
            trigger: 'stage_overdue',
            action: 'escalate_to_manager',
            notification: ['stage_owner', 'procurement_manager']
          }
        ],
        notifications: [
          {
            event: 'stage_completed',
            recipients: ['vendor', 'procurement_team'],
            template: 'onboarding_stage_completed'
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/vendors/onboarding-workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workflowConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: workflowConfig.name,
        trigger: workflowConfig.trigger,
        stages: workflowConfig.stages,
        status: 'active'
      });
      
      // Test workflow execution
      const workflowInstance = {
        workflowId: response.body._id,
        vendorId: testVendor._id,
        initiatedBy: testUser._id,
        priority: 'normal'
      };
      
      const instanceResponse = await request(app)
        .post('/api/vendors/onboarding-instances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workflowInstance)
        .expect(201);
      
      expect(instanceResponse.body).toHaveProperty('currentStage');
      expect(instanceResponse.body.status).toBe('in_progress');
    });
    
    test('should generate vendor management reports', async () => {
      const reportConfig = {
        reportType: 'VENDOR_PORTFOLIO_ANALYSIS',
        period: {
          startDate: '2025-01-01',
          endDate: '2025-12-31'
        },
        filters: {
          vendorTypes: ['corporate', 'individual'],
          categories: ['IT_SERVICES', 'CONSULTING'],
          status: ['active', 'pending_review']
        },
        metrics: [
          'total_vendors',
          'new_vendors',
          'vendor_spend',
          'compliance_rate',
          'average_risk_score',
          'performance_scores'
        ],
        grouping: ['category', 'risk_level', 'status'],
        format: 'executive_summary',
        includeRecommendations: true
      };
      
      const response = await request(app)
        .post('/api/vendors/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        reportType: reportConfig.reportType,
        period: reportConfig.period,
        status: 'generating',
        generatedBy: testUser._id.toString()
      });
      
      expect(response.body).toHaveProperty('reportId');
    });
  });
  
  describe('Error Handling & Edge Cases', () => {
    test('should handle missing vendor data gracefully', async () => {
      const invalidVendorId = 'invalid_vendor_id';
      
      const response = await request(app)
        .get(`/api/vendors/${invalidVendorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Vendor not found');
    });
    
    test('should handle duplicate vendor prevention', async () => {
      const duplicateData = {
        name: testVendor.name, // Same name as existing vendor
        legalName: testVendor.legalName,
        taxId: testVendor.taxId // Same tax ID
      };
      
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(409);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Vendor with similar details already exists');
      expect(response.body).toHaveProperty('duplicateOf');
      expect(response.body.duplicateOf).toBe(testVendor._id.toString());
    });
    
    test('should handle database connection failures', async () => {
      // Simulate database connection failure
      await mongoose.connection.close();
      
      const response = await request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(503);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Service temporarily unavailable');
    });
    
    test('should handle file upload failures for documents', async () => {
      const documentData = {
        vendorId: testVendor._id,
        documentType: 'CONTRACT',
        name: 'Test Document',
        fileSize: 0, // Empty file
        uploadFailed: true
      };
      
      const response = await request(app)
        .post('/api/vendors/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'fileSize',
          message: expect.stringContaining('empty or invalid')
        })
      );
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

const Vendor = mongoose.model('Vendor', new mongoose.Schema({
  name: String,
  legalName: String,
  type: String,
  category: String,
  taxId: String,
  registrationNumber: String,
  yearEstablished: Number,
  website: String,
  primaryContact: mongoose.Schema.Types.Mixed,
  registeredAddress: mongoose.Schema.Types.Mixed,
  businessDetails: mongoose.Schema.Types.Mixed,
  bankingDetails: mongoose.Schema.Types.Mixed,
  complianceRequirements: mongoose.Schema.Types.Mixed,
  preferences: mongoose.Schema.Types.Mixed,
  status: String,
  onboardingStage: String,
  tags: [String],
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  relationshipType: String,
  ownershipPercentage: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const VendorDocument = mongoose.model('VendorDocument', new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  documentType: String,
  name: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  uploadDate: Date,
  expiryDate: Date,
  status: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: Number,
  isLatest: Boolean,
  originalDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorDocument' },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
  reviewHistory: [mongoose.Schema.Types.Mixed]
}));

const ComplianceCheck = mongoose.model('ComplianceCheck', new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  checkType: String,
  status: String,
  requiredDocuments: [String],
  complianceRules: [mongoose.Schema.Types.Mixed],
  riskAssessment: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: String,
  dueDate: Date,
  completedDate: Date
}));

const VendorEvaluation = mongoose.model('VendorEvaluation', new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  evaluationType: String,
  evaluationPeriod: mongoose.Schema.Types.Mixed,
  metrics: [mongoose.Schema.Types.Mixed],
  overallScore: Number,
  performanceLevel: String,
  improvementAreas: [String],
  strengths: [String],
  evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  evaluationDate: { type: Date, default: Date.now }
}));

const PurchaseOrder = mongoose.model('PurchaseOrder', new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  poNumber: String,
  orderDate: Date,
  requiredDate: Date,
  items: [mongoose.Schema.Types.Mixed],
  totalAmount: Number,
  currency: String,
  paymentTerms: String,
  shippingAddress: mongoose.Schema.Types.Mixed,
  specialInstructions: String,
  approvalStatus: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  createdAt: { type: Date, default: Date.now }
}));