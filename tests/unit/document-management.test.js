/**
 * Document Management System Test Suite
 * Compliance & Documents Category
 * Enterprise Document Storage, Version Control, and Compliance Tracking
 */

const request = require('supertest');
const mongoose = require('mongoose');

describe('Document Management System Engine', () => {
  let app;
  let testUser;
  let testDocument;
  let testFolder;
  let testTemplate;
  let testWorkflow;
  let authToken;
  
  beforeAll(async () => {
    // Setup test environment
    app = require('../src/app');
    
    // Create test user with document management permissions
    testUser = await User.create({
      username: 'doc_admin',
      email: 'docadmin@company.com',
      password: 'TestPassword123!',
      role: 'document_administrator',
      permissions: ['document.create', 'document.edit', 'document.view', 'document.delete', 'document.manage_workflows'],
      companyId: 'test_company_docs'
    });
    
    // Generate auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'doc_admin',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: 'docadmin@company.com' });
    await Document.deleteMany({});
    await DocumentFolder.deleteMany({});
    await DocumentTemplate.deleteMany({});
    await DocumentWorkflow.deleteMany({});
    await DocumentVersion.deleteMany({});
    await DocumentMetadata.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Document Storage & Organization', () => {
    test('should create document with comprehensive metadata', async () => {
      const documentData = {
        name: 'Q4_2025_Financial_Report.pdf',
        description: 'Comprehensive financial report for Q4 2025',
        category: 'financial_reports',
        subcategory: 'quarterly_reports',
        type: 'pdf',
        status: 'draft',
        confidentiality: 'internal',
        
        // File Information
        fileName: 'Q4_2025_Financial_Report.pdf',
        fileSize: 2048576, // 2MB
        mimeType: 'application/pdf',
        checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        
        // Classification
        classification: {
          sensitivity: 'confidential',
          retentionPeriod: 2555, // 7 years in days
          retentionCategory: 'financial_records',
          legalHold: false,
          regulatoryRequirements: ['SOX', 'GAAP']
        },
        
        // Author and Ownership
        author: testUser._id,
        owner: testUser._id,
        department: 'finance',
        project: 'Q4_2025_Reporting',
        
        // Date Information
        documentDate: '2025-12-31',
        effectiveDate: '2026-01-01',
        expiryDate: '2032-12-31',
        
        // Relationships
        parentDocumentId: null,
        relatedDocuments: [],
        
        // Tags and Keywords
        tags: ['financial', 'quarterly', '2025', 'q4', 'report'],
        keywords: ['revenue', 'expenses', 'profit', 'cash flow', 'balance sheet'],
        
        // Access Control
        accessControl: {
          permissions: {
            view: ['finance_team', 'executives', 'audit_team'],
            edit: ['finance_manager', 'cfo'],
            delete: ['cfo'],
            share: ['finance_team']
          },
          inheritance: 'folder',
          explicitPermissions: []
        },
        
        // Workflow and Approval
        workflow: {
          enabled: true,
          currentStage: 'draft',
          approvers: ['finance_manager', 'cfo'],
          requiredApprovals: 2
        },
        
        // Compliance and Audit
        compliance: {
          regulatoryRequirements: ['SOX_404', 'GAAP'],
          auditTrail: true,
          immutable: false,
          digitalSignature: true
        }
      };
      
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: documentData.name,
        category: documentData.category,
        type: documentData.type,
        status: documentData.status,
        confidentiality: documentData.confidentiality,
        author: testUser._id.toString(),
        department: documentData.department
      });
      
      testDocument = response.body;
    });
    
    test('should validate document classification and security levels', async () => {
      const securityTests = [
        {
          confidentiality: 'top_secret',
          expectedViolation: 'Invalid confidentiality level'
        },
        {
          classification: {
            sensitivity: 'restricted',
            retentionPeriod: -1 // Invalid negative period
          },
          expectedViolation: 'Invalid retention period'
        },
        {
          compliance: {
            regulatoryRequirements: ['INVALID_REGULATION']
          },
          expectedViolation: 'Unknown regulatory requirement'
        }
      ];
      
      for (const test of securityTests) {
        const invalidDocument = {
          name: 'Invalid Security Test Document',
          type: 'pdf',
          ...test
        };
        
        const response = await request(app)
          .post('/api/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidDocument)
          .expect(400);
        
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            message: expect.stringContaining(test.expectedViolation)
          })
        );
      }
    });
    
    test('should manage document folder hierarchy', async () => {
      const folderStructure = [
        {
          name: 'Finance Department',
          path: '/finance',
          description: 'Financial documents and reports',
          parentFolderId: null,
          defaultPermissions: {
            view: ['finance_team', 'executives'],
            edit: ['finance_manager'],
            create: ['finance_team']
          },
          retentionPolicy: '7_years',
          classificationLevel: 'confidential'
        },
        {
          name: 'Q4 2025 Reports',
          path: '/finance/reports/2025/Q4',
          description: 'Fourth quarter 2025 reports',
          parentFolderId: null, // Will be set after parent creation
          defaultPermissions: {
            view: ['finance_team', 'executives', 'audit_team'],
            edit: ['finance_manager'],
            create: ['finance_analyst']
          },
          autoIndexing: true,
          ocrEnabled: true
        },
        {
          name: 'Tax Documents',
          path: '/finance/tax',
          description: 'Tax related documents and filings',
          parentFolderId: null,
          defaultPermissions: {
            view: ['finance_team', 'tax_accountant'],
            edit: ['tax_manager'],
            create: ['tax_specialist']
          },
          encryptionRequired: true,
          regulatoryHold: ['IRS', 'SOX']
        }
      ];
      
      // Create root folders first
      const rootFolder = await DocumentFolder.create({
        name: 'Finance Department',
        path: '/finance',
        description: 'Financial documents and reports',
        parentFolderId: null,
        defaultPermissions: {
          view: ['finance_team', 'executives'],
          edit: ['finance_manager'],
          create: ['finance_team']
        },
        retentionPolicy: '7_years',
        classificationLevel: 'confidential'
      });
      
      // Create nested folders
      for (let i = 1; i < folderStructure.length; i++) {
        const folderData = folderStructure[i];
        folderData.parentFolderId = i === 1 ? rootFolder._id : null;
        
        const response = await request(app)
          .post('/api/documents/folders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(folderData)
          .expect(201);
        
        expect(response.body).toHaveProperty('path');
        expect(response.body.path).toBe(folderData.path);
        testFolder = response.body;
      }
    });
    
    test('should handle document search and indexing', async () => {
      // Create multiple test documents
      const searchDocuments = [
        {
          name: 'Contract_with_ABC_Corp.pdf',
          content: 'Service agreement between our company and ABC Corporation',
          tags: ['contract', 'abc', 'service_agreement'],
          keywords: ['services', 'agreement', 'corporation']
        },
        {
          name: 'Employee_Handbook_2025.docx',
          content: 'Comprehensive employee handbook and policies for 2025',
          tags: ['hr', 'handbook', 'employee'],
          keywords: ['employee', 'policies', 'handbook', '2025']
        },
        {
          name: 'Q3_Sales_Report.xlsx',
          content: 'Third quarter sales performance report and analysis',
          tags: ['sales', 'q3', 'report'],
          keywords: ['sales', 'performance', 'quarter', 'q3']
        }
      ];
      
      for (const doc of searchDocuments) {
        await request(app)
          .post('/api/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...doc,
            type: 'pdf',
            category: 'general',
            author: testUser._id
          });
      }
      
      // Test various search scenarios
      const searchTests = [
        {
          query: 'contract abc corporation',
          expectedResults: 1,
          searchType: 'fulltext'
        },
        {
          query: 'employee handbook',
          expectedResults: 1,
          searchType: 'metadata'
        },
        {
          filters: {
            category: 'general',
            tags: ['sales', 'q3']
          },
          expectedResults: 1,
          searchType: 'faceted'
        },
        {
          query: 'non_existent_document',
          expectedResults: 0,
          searchType: 'fulltext'
        }
      ];
      
      for (const searchTest of searchTests) {
        const searchRequest = {
          query: searchTest.query,
          searchType: searchTest.searchType,
          filters: searchTest.filters,
          limit: 50,
          offset: 0
        };
        
        const response = await request(app)
          .post('/api/documents/search')
          .set('Authorization', `Bearer ${authToken}`)
          .send(searchRequest)
          .expect(200);
        
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('totalCount');
        expect(response.body.totalCount).toBe(searchTest.expectedResults);
        expect(response.body.results).toHaveLength(searchTest.expectedResults);
      }
    });
  });
  
  describe('Version Control & Collaboration', () => {
    test('should manage document versions and history', async () => {
      const versionUpdates = [
        {
          version: 2,
          changeLog: 'Added executive summary section',
          changes: ['Added new section', 'Updated financial projections'],
          reviewedBy: testUser._id,
          status: 'pending_review'
        },
        {
          version: 3,
          changeLog: 'Incorporated CFO feedback and corrections',
          changes: ['Corrected revenue calculations', 'Updated risk assessment'],
          reviewedBy: testUser._id,
          status: 'approved'
        }
      ];
      
      for (const version of versionUpdates) {
        const response = await request(app)
          .post(`/api/documents/${testDocument._id}/versions`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...version,
            documentId: testDocument._id,
            createdBy: testUser._id
          })
          .expect(201);
        
        expect(response.body).toMatchObject({
          version: version.version,
          changeLog: version.changeLog,
          status: version.status
        });
      }
      
      // Retrieve version history
      const historyResponse = await request(app)
        .get(`/api/documents/${testDocument._id}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(historyResponse.body.versions).toHaveLength(2);
      expect(historyResponse.body.currentVersion).toBe(3);
      expect(historyResponse.body.versions.find(v => v.version === 3).status).toBe('approved');
    });
    
    test('should handle document collaboration and comments', async () => {
      const collaborationData = {
        documentId: testDocument._id,
        type: 'comment',
        content: 'The revenue projection in section 3.2 needs to be updated based on Q4 actuals.',
        page: 15,
        selection: {
          start: 1250,
          end: 1280,
          selectedText: 'revenue projection of $2.5M'
        },
        priority: 'high',
        tags: ['revenue', 'update_required', 'section_3.2']
      };
      
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/collaboration`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(collaborationData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        documentId: testDocument._id.toString(),
        type: collaborationData.type,
        content: collaborationData.content,
        priority: collaborationData.priority,
        author: testUser._id.toString(),
        status: 'open'
      });
      
      // Test comment resolution
      const resolutionResponse = await request(app)
        .put(`/api/documents/${testDocument._id}/collaboration/${response.body._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'resolved',
          resolution: 'Updated revenue projection based on Q4 actuals in version 4',
          resolvedBy: testUser._id
        })
        .expect(200);
      
      expect(resolutionResponse.body.status).toBe('resolved');
      expect(resolutionResponse.body.resolution).toBeDefined();
    });
    
    test('should manage document approvals and workflow', async () => {
      const approvalWorkflow = [
        {
          stage: 'draft',
          status: 'completed',
          approver: testUser._id,
          comments: 'Initial draft completed',
          timestamp: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          stage: 'review',
          status: 'in_progress',
          approver: 'finance_manager',
          dueDate: new Date(Date.now() + 86400000) // 1 day from now
        },
        {
          stage: 'approval',
          status: 'pending',
          approver: 'cfo',
          dueDate: new Date(Date.now() + 172800000) // 2 days from now
        }
      ];
      
      // Create workflow instance
      const workflowResponse = await request(app)
        .post(`/api/documents/${testDocument._id}/workflow`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workflowType: 'standard_approval',
          stages: approvalWorkflow,
          autoProgress: true,
          notificationEnabled: true
        })
        .expect(201);
      
      expect(workflowResponse.body).toHaveProperty('workflowId');
      expect(workflowResponse.body.currentStage).toBe('draft');
      expect(workflowResponse.body.status).toBe('active');
      
      // Progress through workflow stages
      for (let i = 1; i < approvalWorkflow.length; i++) {
        const stage = approvalWorkflow[i];
        const progressResponse = await request(app)
          .put(`/api/documents/${testDocument._id}/workflow/${workflowResponse.body.workflowId}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            stage: stage.stage,
            status: stage.status,
            approver: stage.approver,
            comments: `Moving to ${stage.stage} stage`,
            dueDate: stage.dueDate
          })
          .expect(200);
        
        expect(progressResponse.body.currentStage).toBe(stage.stage);
      }
    });
  });
  
  describe('Document Templates & Automation', () => {
    beforeEach(async () => {
      // Create test document template
      testTemplate = await DocumentTemplate.create({
        name: 'Standard Contract Template',
        description: 'Template for service agreements and contracts',
        category: 'contracts',
        type: 'word',
        fileName: 'contract_template.docx',
        content: `SERVICE AGREEMENT
        
        This Service Agreement ("Agreement") is entered into between {{company_name}} and {{client_name}} on {{effective_date}}.
        
        1. SERVICES
        {{services_description}}
        
        2. PAYMENT TERMS
        {{payment_terms}}
        
        3. TERM
        This agreement shall commence on {{start_date}} and continue until {{end_date}}.
        
        4. SIGNATURES
        {{company_signature}}
        {{client_signature}}`,
        variables: [
          {
            name: 'company_name',
            type: 'text',
            required: true,
            defaultValue: 'Your Company Name',
            validation: { minLength: 2, maxLength: 100 }
          },
          {
            name: 'client_name',
            type: 'text',
            required: true,
            validation: { minLength: 2, maxLength: 100 }
          },
          {
            name: 'effective_date',
            type: 'date',
            required: true,
            format: 'YYYY-MM-DD'
          },
          {
            name: 'services_description',
            type: 'textarea',
            required: true,
            validation: { minLength: 10 }
          },
          {
            name: 'payment_terms',
            type: 'select',
            required: true,
            options: ['NET_30', 'NET_60', 'NET_90', 'IMMEDIATE']
          },
          {
            name: 'start_date',
            type: 'date',
            required: true
          },
          {
            name: 'end_date',
            type: 'date',
            required: true,
            validation: { afterField: 'start_date' }
          },
          {
            name: 'company_signature',
            type: 'signature',
            required: true
          },
          {
            name: 'client_signature',
            type: 'signature',
            required: true
          }
        ],
        permissions: {
          view: ['legal_team', 'contract_manager'],
          edit: ['contract_manager'],
          use: ['sales_team', 'legal_team']
        },
        metadata: {
          version: '1.0',
          lastModified: new Date(),
          approvalStatus: 'approved',
          effectiveFrom: new Date()
        }
      });
    });
    
    test('should create documents from templates with variable substitution', async () => {
      const templateData = {
        templateId: testTemplate._id,
        variableValues: {
          company_name: 'Tech Solutions Inc.',
          client_name: 'ABC Manufacturing Co.',
          effective_date: '2025-12-15',
          services_description: 'Software development services including custom application development, system integration, and ongoing technical support.',
          payment_terms: 'NET_30',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          company_signature: 'John Doe, CEO',
          client_signature: 'Jane Smith, Procurement Manager'
        },
        documentProperties: {
          name: 'Service Agreement - ABC Manufacturing',
          category: 'contracts',
          confidentiality: 'confidential',
          retentionPeriod: 2555, // 7 years
          tags: ['contract', 'abc_manufacturing', '2026']
        }
      };
      
      const response = await request(app)
        .post('/api/documents/create-from-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        templateId: testTemplate._id.toString(),
        name: templateData.documentProperties.name,
        category: templateData.documentProperties.category,
        status: 'draft',
        createdFromTemplate: true
      });
      
      // Verify template variables were substituted
      expect(response.body.generatedContent).toContain('Tech Solutions Inc.');
      expect(response.body.generatedContent).toContain('ABC Manufacturing Co.');
      expect(response.body.generatedContent).toContain('NET_30');
      expect(response.body.generatedContent).toContain('2026-01-01');
    });
    
    test('should validate template variable data', async () => {
      const invalidVariableData = {
        templateId: testTemplate._id,
        variableValues: {
          company_name: '', // Empty required field
          client_name: 'A', // Too short
          effective_date: 'invalid-date', // Invalid date format
          start_date: '2026-01-01',
          end_date: '2025-12-31', // Before start date
          payment_terms: 'INVALID_OPTION' // Not in allowed options
        }
      };
      
      const response = await request(app)
        .post('/api/documents/create-from-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidVariableData)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'company_name',
          message: expect.stringContaining('required')
        })
      );
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'client_name',
          message: expect.stringContaining('minimum')
        })
      );
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'end_date',
          message: expect.stringContaining('after')
        })
      );
    });
    
    test('should manage template versioning and updates', async () => {
      // Update template with new version
      const templateUpdate = {
        name: 'Standard Contract Template v2.0',
        description: 'Updated template with new clauses and terms',
        version: '2.0',
        changes: [
          'Added data protection clause',
          'Updated payment terms section',
          'Added termination provisions'
        ],
        content: `SERVICE AGREEMENT v2.0
        
        This Service Agreement ("Agreement") is entered into between {{company_name}} and {{client_name}} on {{effective_date}}.
        
        1. DATA PROTECTION
        Both parties agree to comply with applicable data protection laws...
        
        2. SERVICES
        {{services_description}}
        
        3. PAYMENT TERMS
        {{payment_terms}}
        
        4. TERMINATION
        Either party may terminate this agreement with 30 days written notice...
        
        5. SIGNATURES
        {{company_signature}}
        {{client_signature}}`,
        newVariables: [
          {
            name: 'data_protection_compliance',
            type: 'checkbox',
            required: true,
            label: 'Confirm data protection compliance'
          }
        ]
      };
      
      const response = await request(app)
        .put(`/api/documents/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateUpdate)
        .expect(200);
      
      expect(response.body).toMatchObject({
        name: templateUpdate.name,
        version: templateUpdate.version,
        changes: templateUpdate.changes
      });
      
      // Verify template history
      const historyResponse = await request(app)
        .get(`/api/documents/templates/${testTemplate._id}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(historyResponse.body.versions).toHaveLength(2);
      expect(historyResponse.body.currentVersion).toBe('2.0');
    });
  });
  
  describe('Document Security & Compliance', () => {
    test('should enforce document security policies', async () => {
      const securityPolicy = {
        documentId: testDocument._id,
        policies: [
          {
            type: 'encryption',
            algorithm: 'AES-256',
            keyRotation: 90, // days
            mandatory: true
          },
          {
            type: 'watermark',
            content: 'CONFIDENTIAL - {{user_name}} - {{timestamp}}',
            position: 'diagonal',
            opacity: 0.3,
            mandatory: true
          },
          {
            type: 'digital_signature',
            algorithm: 'RSA-2048',
            certificateRequired: true,
            timestampRequired: true,
            mandatory: false
          },
          {
            type: 'access_logging',
            logLevel: 'detailed',
            includeIP: true,
            includeUserAgent: true,
            retention: 2555 // 7 years
          }
        ],
        complianceRequirements: ['SOX', 'GDPR', 'HIPAA']
      };
      
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/security-policies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(securityPolicy)
        .expect(201);
      
      expect(response.body).toMatchObject({
        documentId: testDocument._id.toString(),
        policies: securityPolicy.policies,
        complianceRequirements: securityPolicy.complianceRequirements,
        status: 'active'
      });
    });
    
    test('should handle document legal holds and litigation support', async () => {
      const legalHoldData = {
        documentId: testDocument._id,
        holdType: 'litigation',
        reason: 'Active lawsuit - Case #2025-CV-1234',
        initiatedBy: 'legal_team',
        initiatedDate: new Date(),
        effectiveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        estimatedDuration: 730, // 2 years in days
        holdScope: 'all_versions',
        notifications: {
          enabled: true,
          recipients: ['legal_team', 'compliance_officer'],
          frequency: 'weekly'
        },
        metadata: {
          caseNumber: '2025-CV-1234',
          court: 'Superior Court of California',
          parties: ['Our Company vs. XYZ Corp']
        }
      };
      
      const response = await request(app)
        .post('/api/documents/legal-holds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(legalHoldData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        documentId: testDocument._id.toString(),
        holdType: legalHoldData.holdType,
        reason: legalHoldData.reason,
        status: 'active',
        immutable: true
      });
      
      // Test legal hold restrictions
      const restrictedAction = await request(app)
        .delete(`/api/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(423); // Locked status
      
      expect(restrictedAction.body).toHaveProperty('error');
      expect(restrictedAction.body.error).toBe('Document under legal hold - action not permitted');
    });
    
    test('should generate compliance reports and audit trails', async () => {
      const auditTrailData = [
        {
          documentId: testDocument._id,
          action: 'created',
          userId: testUser._id,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          details: 'Document created with full metadata',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
          documentId: testDocument._id,
          action: 'viewed',
          userId: testUser._id,
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          details: 'Document viewed by author',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
          documentId: testDocument._id,
          action: 'edited',
          userId: testUser._id,
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          details: 'Updated document metadata',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      ];
      
      // Create audit trail entries
      for (const entry of auditTrailData) {
        await request(app)
          .post('/api/documents/audit-trail')
          .set('Authorization', `Bearer ${authToken}`)
          .send(entry);
      }
      
      // Generate compliance report
      const reportConfig = {
        reportType: 'compliance_audit',
        period: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          endDate: new Date()
        },
        filters: {
          documentIds: [testDocument._id],
          actions: ['created', 'viewed', 'edited', 'deleted'],
          users: [testUser._id]
        },
        metrics: [
          'total_documents',
          'access_patterns',
          'compliance_violations',
          'retention_compliance'
        ],
        format: 'detailed',
        includeCharts: true
      };
      
      const response = await request(app)
        .post('/api/documents/reports/compliance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        reportType: reportConfig.reportType,
        period: reportConfig.period,
        status: 'generating',
        generatedBy: testUser._id.toString()
      });
    });
  });
  
  describe('Document Processing & OCR', () => {
    test('should perform OCR on uploaded documents', async () => {
      const ocrConfig = {
        documentId: testDocument._id,
        ocrSettings: {
          language: 'en',
          engine: 'tesseract',
          confidence: 0.8,
          preserveFormatting: true,
          extractTables: true,
          extractMetadata: true
        },
        postProcessing: {
          spellCheck: true,
          autoCorrect: false,
          highlightUncertain: true
        }
      };
      
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/ocr`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ocrConfig)
        .expect(202);
      
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('processing');
      expect(response.body.estimatedCompletion).toBeDefined();
      
      // Simulate OCR completion
      const completionResponse = await request(app)
        .put(`/api/documents/${testDocument._id}/ocr/${response.body.jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          extractedText: 'Financial Report Q4 2025\nRevenue: $2,500,000\nExpenses: $1,800,000\nNet Income: $700,000',
          confidence: 0.92,
          processingTime: 15.3,
          wordCount: 1250,
          pagesProcessed: 25
        })
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.confidence).toBe(0.92);
      expect(completionResponse.body.extractedText).toBeDefined();
    });
    
    test('should handle document format conversion', async () => {
      const conversionRequest = {
        documentId: testDocument._id,
        targetFormat: 'pdf',
        conversionOptions: {
          preserveFormatting: true,
          compressImages: true,
          addWatermark: true,
          watermarkText: 'CONVERTED DOCUMENT'
        },
        qualitySettings: {
          imageQuality: 'high',
          textQuality: 'preserve',
          colorSpace: 'rgb'
        }
      };
      
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/convert`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(conversionRequest)
        .expect(202);
      
      expect(response.body).toHaveProperty('conversionId');
      expect(response.body.status).toBe('queued');
      expect(response.body.targetFormat).toBe('pdf');
      
      // Simulate conversion completion
      const completionResponse = await request(app)
        .put(`/api/documents/${testDocument._id}/convert/${response.body.conversionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          outputFile: {
            fileName: 'Q4_2025_Financial_Report_converted.pdf',
            fileSize: 1536000,
            mimeType: 'application/pdf'
          },
          conversionLog: 'Document successfully converted with preserved formatting',
          processingTime: 8.7
        })
        .expect(200);
      
      expect(completionResponse.body.status).toBe('completed');
      expect(completionResponse.body.outputFile).toBeDefined();
    });
    
    test('should extract and index document metadata', async () => {
      const metadataExtraction = {
        documentId: testDocument._id,
        extractionSettings: {
          extractProperties: true,
          extractXMP: true,
          extractEXIF: true,
          extractCustomProperties: true,
          validateIntegrity: true
        },
        customFields: [
          {
            name: 'contract_value',
            type: 'currency',
            pattern: 'Contract Value: \\$([0-9,]+)'
          },
          {
            name: 'contract_date',
            type: 'date',
            pattern: 'Effective Date: ([0-9]{2}/[0-9]{2}/[0-9]{4})'
          },
          {
            name: 'parties',
            type: 'array',
            pattern: 'between (.+?) and (.+?) on'
          }
        ]
      };
      
      const response = await request(app)
        .post(`/api/documents/${testDocument._id}/extract-metadata`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(metadataExtraction)
        .expect(200);
      
      expect(response.body).toHaveProperty('extractedMetadata');
      expect(response.body).toHaveProperty('customFields');
      expect(response.body.validationResults).toBeDefined();
      
      // Verify extracted metadata
      const documentResponse = await request(app)
        .get(`/api/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(documentResponse.body.extractedMetadata).toBeDefined();
      expect(documentResponse.body.customFields).toBeDefined();
    });
  });
  
  describe('Performance & Scalability', () => {
    test('should handle large document uploads with chunking', async () => {
      const uploadConfig = {
        maxFileSize: 500 * 1024 * 1024, // 500MB
        chunkSize: 1024 * 1024, // 1MB chunks
        allowedTypes: ['pdf', 'docx', 'xlsx', 'pptx'],
        virusScan: true,
        thumbnailGeneration: true,
        metadataExtraction: true
      };
      
      // Initiate upload
      const initResponse = await request(app)
        .post('/api/documents/upload/init')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileName: 'large_document.pdf',
          fileSize: 100000000, // 100MB
          fileType: 'application/pdf',
          uploadConfig: uploadConfig
        })
        .expect(200);
      
      expect(initResponse.body).toHaveProperty('uploadId');
      expect(initResponse.body).toHaveProperty('chunkSize');
      expect(initResponse.body).toHaveProperty('totalChunks');
      
      // Upload chunks (simulate first few chunks)
      const uploadId = initResponse.body.uploadId;
      const totalChunks = initResponse.body.totalChunks;
      
      for (let i = 0; i < Math.min(totalChunks, 10); i++) {
        const chunkData = {
          chunkIndex: i,
          chunkData: Buffer.from(`chunk_${i}_data`).toString('base64'),
          checksum: `checksum_${i}_${Date.now()}`
        };
        
        const chunkResponse = await request(app)
          .post(`/api/documents/upload/${uploadId}/chunk`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(chunkData)
          .expect(200);
        
        expect(chunkResponse.body.chunkUploaded).toBe(true);
        expect(chunkResponse.body.chunkIndex).toBe(i);
      }
      
      // Complete upload
      const completeResponse = await request(app)
        .post(`/api/documents/upload/${uploadId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          totalChunks: totalChunks,
          finalChecksum: `final_checksum_${Date.now()}`,
          fileName: 'large_document.pdf'
        })
        .expect(200);
      
      expect(completeResponse.body.uploadComplete).toBe(true);
      expect(completeResponse.body.documentId).toBeDefined();
      expect(completeResponse.body.processingStatus).toBe('queued');
    });
    
    test('should optimize storage with deduplication', async () => {
      // Create documents with identical content (same checksum)
      const duplicateDocuments = Array.from({ length: 5 }, (_, i) => ({
        name: `Duplicate Document ${i + 1}.pdf`,
        fileName: `duplicate_${i + 1}.pdf`,
        fileSize: 1024000, // 1MB
        checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // Same checksum
        contentHash: 'abc123def456', // Same content hash
        category: 'general',
        author: testUser._id
      }));
      
      const responses = await Promise.all(
        duplicateDocuments.map(doc =>
          request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${authToken}`)
            .send(doc)
            .expect(201)
        )
      );
      
      // Verify storage optimization
      const storageResponse = await request(app)
        .get('/api/documents/storage/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(storageResponse.body).toHaveProperty('totalDocuments');
      expect(storageResponse.body).toHaveProperty('totalSize');
      expect(storageResponse.body).toHaveProperty('deduplicationSavings');
      expect(storageResponse.body.deduplicationSavings.percentage).toBeGreaterThan(0);
      expect(storageResponse.body.duplicateFiles).toBe(4); // 4 duplicates (5 total - 1 unique)
    });
    
    test('should cache frequently accessed documents', async () => {
      // Simulate multiple accesses to the same document
      const accessCount = 10;
      const accessPromises = Array.from({ length: accessCount }, () =>
        request(app)
          .get(`/api/documents/${testDocument._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );
      
      await Promise.all(accessPromises);
      
      // Check cache status
      const cacheResponse = await request(app)
        .get(`/api/documents/${testDocument._id}/cache-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(cacheResponse.body).toHaveProperty('cached');
      expect(cacheResponse.body.cached).toBe(true);
      expect(cacheResponse.body.accessCount).toBe(accessCount);
      expect(cacheResponse.body.lastAccessed).toBeDefined();
    });
  });
  
  describe('Integration & API', () => {
    test('should provide comprehensive REST API', async () => {
      const apiEndpoints = [
        { method: 'GET', path: '/api/documents', expectedStatus: 200 },
        { method: 'POST', path: '/api/documents', expectedStatus: 201 },
        { method: 'GET', path: `/api/documents/${testDocument._id}`, expectedStatus: 200 },
        { method: 'PUT', path: `/api/documents/${testDocument._id}`, expectedStatus: 200 },
        { method: 'DELETE', path: `/api/documents/${testDocument._id}`, expectedStatus: 204 },
        { method: 'GET', path: `/api/documents/${testDocument._id}/versions`, expectedStatus: 200 },
        { method: 'GET', path: `/api/documents/${testDocument._id}/audit-trail`, expectedStatus: 200 },
        { method: 'GET', path: '/api/documents/search', expectedStatus: 200 },
        { method: 'GET', path: '/api/documents/folders', expectedStatus: 200 },
        { method: 'GET', path: '/api/documents/templates', expectedStatus: 200 }
      ];
      
      for (const endpoint of apiEndpoints) {
        const requestData = ['POST', 'PUT'].includes(endpoint.method) ? {
          name: 'API Test Document',
          category: 'test',
          type: 'pdf',
          author: testUser._id
        } : {};
        
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${authToken}`)
          .send(requestData);
        
        expect(response.status).toBe(endpoint.expectedStatus);
      }
    });
    
    test('should handle webhooks for document events', async () => {
      const webhookConfig = {
        name: 'Document Event Notifications',
        url: 'https://api.company.com/webhooks/documents',
        events: [
          'document.created',
          'document.updated',
          'document.deleted',
          'document.viewed',
          'document.shared',
          'workflow.completed'
        ],
        secret: 'webhook_secret_doc_123',
        active: true,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 5000,
          exponentialBackoff: true
        },
        filters: {
          documentTypes: ['pdf', 'docx'],
          categories: ['financial', 'contracts']
        }
      };
      
      const response = await request(app)
        .post('/api/documents/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(webhookConfig)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: webhookConfig.name,
        events: webhookConfig.events,
        active: webhookConfig.active
      });
      
      // Test webhook delivery simulation
      const webhookEvent = {
        event: 'document.created',
        documentId: testDocument._id.toString(),
        documentName: testDocument.name,
        createdBy: testUser._id.toString(),
        timestamp: new Date().toISOString(),
        metadata: {
          category: testDocument.category,
          type: testDocument.type
        }
      };
      
      const deliveryResponse = await request(app)
        .post(`/api/documents/webhooks/${response.body._id}/test`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(webhookEvent)
        .expect(200);
      
      expect(deliveryResponse.body.delivered).toBe(true);
      expect(deliveryResponse.body.responseStatus).toBe(200);
    });
  });
  
  describe('Error Handling & Edge Cases', () => {
    test('should handle missing documents gracefully', async () => {
      const invalidDocumentId = 'invalid_document_id';
      
      const response = await request(app)
        .get(`/api/documents/${invalidDocumentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Document not found');
    });
    
    test('should prevent unauthorized access to confidential documents', async () => {
      // Create restricted user
      const restrictedUser = await User.create({
        username: 'restricted_user',
        email: 'restricted@test.com',
        password: 'TestPassword123!',
        role: 'basic_user',
        permissions: ['document.view'],
        companyId: 'test_company_docs'
      });
      
      const restrictedLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'restricted_user',
          password: 'TestPassword123!'
        });
      
      const restrictedToken = restrictedLoginResponse.body.token;
      
      // Attempt to access confidential document
      const unauthorizedResponse = await request(app)
        .get(`/api/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${restrictedToken}`)
        .expect(403);
      
      expect(unauthorizedResponse.body).toHaveProperty('error');
      expect(unauthorizedResponse.body.error).toBe('Access denied - insufficient permissions');
    });
    
    test('should handle concurrent document updates', async () => {
      const update1 = { name: 'Updated Name 1', description: 'Updated by user 1' };
      const update2 = { name: 'Updated Name 2', description: 'Updated by user 2' };
      
      // Simulate concurrent updates
      const [response1, response2] = await Promise.all([
        request(app)
          .put(`/api/documents/${testDocument._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1),
        request(app)
          .put(`/api/documents/${testDocument._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
      ]);
      
      // Both updates should succeed, but last one wins
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Verify the final state
      const finalResponse = await request(app)
        .get(`/api/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(finalResponse.body.name).toBe(update2.name);
    });
    
    test('should handle storage quota exceeded', async () => {
      // Simulate storage quota check
      const quotaResponse = await request(app)
        .post('/api/documents/check-quota')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileSize: 1000 * 1024 * 1024, // 1GB file
          department: 'finance'
        })
        .expect(507); // Insufficient Storage
      
      expect(quotaResponse.body).toHaveProperty('error');
      expect(quotaResponse.body.error).toBe('Storage quota exceeded');
      expect(quotaResponse.body).toHaveProperty('currentUsage');
      expect(quotaResponse.body).toHaveProperty('quotaLimit');
      expect(quotaResponse.body.currentUsage).toBeGreaterThanOrEqual(quotaResponse.body.quotaLimit);
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

const Document = mongoose.model('Document', new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  subcategory: String,
  type: String,
  status: String,
  confidentiality: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  checksum: String,
  classification: mongoose.Schema.Types.Mixed,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: String,
  project: String,
  documentDate: Date,
  effectiveDate: Date,
  expiryDate: Date,
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  relatedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  tags: [String],
  keywords: [String],
  accessControl: mongoose.Schema.Types.Mixed,
  workflow: mongoose.Schema.Types.Mixed,
  compliance: mongoose.Schema.Types.Mixed,
  extractedText: String,
  extractedMetadata: mongoose.Schema.Types.Mixed,
  customFields: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const DocumentFolder = mongoose.model('DocumentFolder', new mongoose.Schema({
  name: String,
  path: String,
  description: String,
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentFolder' },
  defaultPermissions: mongoose.Schema.Types.Mixed,
  retentionPolicy: String,
  classificationLevel: String,
  autoIndexing: Boolean,
  ocrEnabled: Boolean,
  encryptionRequired: Boolean,
  regulatoryHold: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const DocumentTemplate = mongoose.model('DocumentTemplate', new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  type: String,
  fileName: String,
  content: String,
  variables: [mongoose.Schema.Types.Mixed],
  permissions: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  version: String,
  isActive: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const DocumentWorkflow = mongoose.model('DocumentWorkflow', new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  workflowType: String,
  stages: [mongoose.Schema.Types.Mixed],
  currentStage: String,
  status: String,
  autoProgress: Boolean,
  notificationEnabled: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}));

const DocumentVersion = mongoose.model('DocumentVersion', new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  version: Number,
  changeLog: String,
  changes: [String],
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}));

const DocumentMetadata = mongoose.model('DocumentMetadata', new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  extractedText: String,
  ocrConfidence: Number,
  processingTime: Number,
  wordCount: Number,
  pagesProcessed: Number,
  extractedFields: mongoose.Schema.Types.Mixed,
  validationResults: mongoose.Schema.Types.Mixed,
  processedAt: { type: Date, default: Date.now }
}));