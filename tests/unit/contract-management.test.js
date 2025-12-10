const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Contract = require('../models/Contract');
const ContractAmendment = require('../models/ContractAmendment');
const Milestone = require('../models/Milestone');
const BillingSchedule = require('../models/BillingSchedule');
const app = require('../app');

describe('Contract Management Engine', () => {
  let mongoServer;
  let authToken;
  let testData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup authentication
    authToken = 'Bearer test-token-contract';
    jest.spyOn(require('../middleware/auth'), 'authenticate')
      .mockImplementation((req, res, next) => {
        req.user = { id: 'test-user', role: 'admin' };
        next();
      });

    // Generate comprehensive test data for contract management
    testData = {
      contracts: [
        {
          contractId: 'CNT-001',
          contractNumber: 'CTR-2025-001',
          title: 'Software Development Contract',
          clientId: 'CLT-001',
          clientName: 'Tech Solutions Inc.',
          contractType: 'Fixed Price',
          status: 'Active',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          totalValue: 500000,
          currency: 'USD',
          paymentTerms: 'Net 30',
          terms: {
            scope: 'Complete software development lifecycle',
            deliverables: ['Requirement analysis', 'System design', 'Development', 'Testing', 'Deployment'],
            acceptanceCriteria: 'Client approval on all deliverables',
            warranty: '12 months from deployment'
          },
          riskLevel: 'Medium',
          priority: 'High',
          assignedTo: 'Project Manager A',
          department: 'Development',
          isActive: true,
          autoRenew: false
        },
        {
          contractId: 'CNT-002',
          contractNumber: 'CTR-2025-002',
          title: 'Consulting Services Agreement',
          clientId: 'CLT-002',
          clientName: 'Global Enterprises Ltd',
          contractType: 'Time & Materials',
          status: 'Active',
          startDate: '2025-01-15',
          endDate: '2025-06-30',
          totalValue: 200000,
          currency: 'USD',
          paymentTerms: 'Net 15',
          terms: {
            scope: 'Strategic consulting services',
            deliverables: ['Monthly reports', 'Quarterly presentations', 'Implementation support'],
            acceptanceCriteria: 'Client satisfaction surveys',
            warranty: 'N/A'
          },
          riskLevel: 'Low',
          priority: 'Medium',
          assignedTo: 'Consultant B',
          department: 'Consulting',
          isActive: true,
          autoRenew: true
        },
        {
          contractId: 'CNT-003',
          contractNumber: 'CTR-2025-003',
          title: 'Maintenance Support Contract',
          clientId: 'CLT-003',
          clientName: 'Manufacturing Corp',
          contractType: 'Recurring',
          status: 'Pending',
          startDate: '2025-02-01',
          endDate: '2026-01-31',
          totalValue: 120000,
          currency: 'USD',
          paymentTerms: 'Monthly in advance',
          terms: {
            scope: '24/7 system maintenance and support',
            deliverables: ['Monthly maintenance', '24/7 support', 'Quarterly reviews'],
            acceptanceCriteria: '99.9% uptime SLA',
            warranty: 'N/A'
          },
          riskLevel: 'High',
          priority: 'Critical',
          assignedTo: 'Support Manager C',
          department: 'Support',
          isActive: true,
          autoRenew: false
        }
      ],
      contractAmendments: [
        {
          contractId: 'CNT-001',
          amendmentNumber: 'AMD-001',
          amendmentDate: '2025-01-15',
          type: 'Scope Change',
          description: 'Addition of mobile application development',
          impactAnalysis: {
            valueChange: 75000,
            timelineChange: '2 months extension',
            resourceChange: '2 additional developers'
          },
          approvedBy: 'Legal Manager',
          approvalDate: '2025-01-20',
          status: 'Approved',
          isActive: true
        },
        {
          contractId: 'CNT-002',
          amendmentNumber: 'AMD-002',
          amendmentDate: '2025-01-25',
          type: 'Price Adjustment',
          description: 'Rate increase due to market conditions',
          impactAnalysis: {
            valueChange: 15000,
            timelineChange: 'No change',
            resourceChange: 'No change'
          },
          approvedBy: 'Finance Manager',
          approvalDate: '2025-01-28',
          status: 'Pending',
          isActive: true
        }
      ],
      milestones: [
        {
          contractId: 'CNT-001',
          milestoneId: 'MS-001',
          title: 'Requirements Analysis Complete',
          description: 'All requirements documented and approved',
          targetDate: '2025-02-28',
          completionDate: null,
          value: 50000,
          percentage: 10,
          status: 'In Progress',
          deliverables: ['Requirements document', 'Use case diagrams', 'User stories'],
          acceptanceCriteria: 'Client sign-off on requirements',
          dependencies: [],
          isBillable: true,
          isActive: true
        },
        {
          contractId: 'CNT-001',
          milestoneId: 'MS-002',
          title: 'System Design Complete',
          description: 'Complete system architecture and design',
          targetDate: '2025-04-30',
          completionDate: null,
          value: 100000,
          percentage: 20,
          status: 'Not Started',
          deliverables: ['Architecture document', 'Database design', 'API specifications'],
          acceptanceCriteria: 'Technical review approval',
          dependencies: ['MS-001'],
          isBillable: true,
          isActive: true
        },
        {
          contractId: 'CNT-002',
          milestoneId: 'MS-003',
          title: 'Q1 Strategic Review',
          description: 'First quarter strategic assessment',
          targetDate: '2025-04-15',
          completionDate: null,
          value: 40000,
          percentage: 20,
          status: 'Not Started',
          deliverables: ['Strategic report', 'Recommendations', 'Action plan'],
          acceptanceCriteria: 'Client presentation and approval',
          dependencies: [],
          isBillable: true,
          isActive: true
        }
      ],
      billingSchedules: [
        {
          contractId: 'CNT-001',
          scheduleId: 'BIL-001',
          billingDate: '2025-02-28',
          milestoneId: 'MS-001',
          amount: 50000,
          currency: 'USD',
          description: 'Requirements analysis milestone billing',
          status: 'Pending',
          invoiceNumber: null,
          dueDate: '2025-03-30',
          paymentTerms: 'Net 30',
          taxApplicable: true,
          taxRate: 8.25,
          isActive: true
        },
        {
          contractId: 'CNT-001',
          scheduleId: 'BIL-002',
          billingDate: '2025-04-30',
          milestoneId: 'MS-002',
          amount: 100000,
          currency: 'USD',
          description: 'System design milestone billing',
          status: 'Scheduled',
          invoiceNumber: null,
          dueDate: '2025-05-30',
          paymentTerms: 'Net 30',
          taxApplicable: true,
          taxRate: 8.25,
          isActive: true
        },
        {
          contractId: 'CNT-002',
          scheduleId: 'BIL-003',
          billingDate: '2025-02-15',
          amount: 33333.33,
          currency: 'USD',
          description: 'February consulting services',
          status: 'Invoiced',
          invoiceNumber: 'INV-2025-015',
          dueDate: '2025-03-02',
          paymentTerms: 'Net 15',
          taxApplicable: true,
          taxRate: 8.25,
          isActive: true
        }
      ],
      clients: [
        {
          clientId: 'CLT-001',
          companyName: 'Tech Solutions Inc.',
          contactPerson: 'John Doe',
          email: 'john.doe@techsolutions.com',
          phone: '+1-555-0101',
          address: {
            street: '123 Technology Blvd',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          industry: 'Technology',
          contractCount: 5,
          totalContractValue: 1250000,
          paymentHistory: 'Excellent',
          creditRating: 'A',
          isActive: true
        },
        {
          clientId: 'CLT-002',
          companyName: 'Global Enterprises Ltd',
          contactPerson: 'Jane Smith',
          email: 'jane.smith@globalent.com',
          phone: '+1-555-0202',
          address: {
            street: '456 Business Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          industry: 'Manufacturing',
          contractCount: 3,
          totalContractValue: 650000,
          paymentHistory: 'Good',
          creditRating: 'B+',
          isActive: true
        }
      ]
    };

    // Seed test data
    await Contract.insertMany(testData.contracts);
    await ContractAmendment.insertMany(testData.contractAmendments);
    await Milestone.insertMany(testData.milestones);
    await BillingSchedule.insertMany(testData.billingSchedules);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean collections before each test
    await Contract.deleteMany({});
    await ContractAmendment.deleteMany({});
    await Milestone.deleteMany({});
    await BillingSchedule.deleteMany({});
  });

  describe('Contract Management', () => {
    describe('POST /api/contracts', () => {
      it('should create a new contract with valid data', async () => {
        const contractData = {
          contractId: 'CNT-NEW-001',
          contractNumber: 'CTR-2025-010',
          title: 'New Development Contract',
          clientId: 'CLT-NEW',
          clientName: 'New Client Corp',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-08-31',
          totalValue: 300000,
          currency: 'USD',
          paymentTerms: 'Net 30',
          terms: {
            scope: 'Custom software development',
            deliverables: ['Analysis', 'Design', 'Development', 'Testing'],
            acceptanceCriteria: 'Client approval',
            warranty: '6 months'
          },
          riskLevel: 'Medium',
          priority: 'High',
          assignedTo: 'Developer D',
          department: 'Development',
          isActive: true,
          autoRenew: false
        };

        const response = await request(app)
          .post('/api/contracts')
          .set('Authorization', authToken)
          .send(contractData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contractId).toBe(contractData.contractId);
        expect(response.body.data.contractNumber).toBe(contractData.contractNumber);
        expect(response.body.data.totalValue).toBe(contractData.totalValue);
      });

      it('should validate contract date ranges', async () => {
        const invalidContractData = {
          contractId: 'CNT-INVALID-001',
          contractNumber: 'CTR-2025-011',
          title: 'Invalid Date Contract',
          clientId: 'CLT-001',
          clientName: 'Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-06-01', // Start after end
          endDate: '2025-03-01',
          totalValue: 100000,
          currency: 'USD',
          isActive: true
        };

        const response = await request(app)
          .post('/api/contracts')
          .set('Authorization', authToken)
          .send(invalidContractData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('start date must be before end date');
      });

      it('should ensure unique contract numbers', async () => {
        const duplicateContractData = {
          contractId: 'CNT-DUPLICATE',
          contractNumber: 'CTR-2025-001', // Existing contract number
          title: 'Duplicate Contract',
          clientId: 'CLT-001',
          clientName: 'Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-12-31',
          totalValue: 200000,
          currency: 'USD',
          isActive: true
        };

        const response = await request(app)
          .post('/api/contracts')
          .set('Authorization', authToken)
          .send(duplicateContractData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should validate contract value against type', async () => {
        const invalidContractData = {
          contractId: 'CNT-VALUE-TEST',
          contractNumber: 'CTR-2025-012',
          title: 'Value Validation Test',
          clientId: 'CLT-001',
          clientName: 'Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-06-30',
          totalValue: -50000, // Negative value
          currency: 'USD',
          isActive: true
        };

        const response = await request(app)
          .post('/api/contracts')
          .set('Authorization', authToken)
          .send(invalidContractData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('total value must be positive');
      });

      it('should calculate contract duration automatically', async () => {
        const contractData = {
          contractId: 'CNT-DURATION-TEST',
          contractNumber: 'CTR-2025-013',
          title: 'Duration Calculation Test',
          clientId: 'CLT-001',
          clientName: 'Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-05-31',
          totalValue: 150000,
          currency: 'USD',
          isActive: true
        };

        const response = await request(app)
          .post('/api/contracts')
          .set('Authorization', authToken)
          .send(contractData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.duration).toBe(92); // March 1 to May 31
        expect(response.body.data.durationUnit).toBe('days');
      });
    });

    describe('GET /api/contracts', () => {
      beforeEach(async () => {
        // Create additional contracts for testing
        const additionalContracts = [
          {
            contractId: 'CNT-ADD-001',
            contractNumber: 'CTR-2025-100',
            title: 'Additional Contract 1',
            clientId: 'CLT-ADD-001',
            clientName: 'Additional Client A',
            contractType: 'Time & Materials',
            status: 'Completed',
            startDate: '2024-06-01',
            endDate: '2024-12-31',
            totalValue: 250000,
            currency: 'USD',
            isActive: false,
            assignedTo: 'Team Lead E',
            department: 'Development'
          },
          {
            contractId: 'CNT-ADD-002',
            contractNumber: 'CTR-2025-101',
            title: 'Additional Contract 2',
            clientId: 'CLT-ADD-002',
            clientName: 'Additional Client B',
            contractType: 'Recurring',
            status: 'Active',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            totalValue: 180000,
            currency: 'USD',
            isActive: true,
            assignedTo: 'Account Manager F',
            department: 'Support',
            autoRenew: true
          }
        ];
        await Contract.insertMany(additionalContracts);
      });

      it('should retrieve contracts by status', async () => {
        const response = await request(app)
          .get('/api/contracts?status=Active')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned contracts should be Active
        response.body.data.forEach(contract => {
          expect(contract.status).toBe('Active');
        });
      });

      it('should filter contracts by client', async () => {
        const response = await request(app)
          .get('/api/contracts?clientId=CLT-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned contracts should be for CLT-001
        response.body.data.forEach(contract => {
          expect(contract.clientId).toBe('CLT-001');
        });
      });

      it('should filter contracts by date range', async () => {
        const response = await request(app)
          .get('/api/contracts?startDate=2025-01-01&endDate=2025-06-30')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All contracts should have dates within range
        response.body.data.forEach(contract => {
          const startDate = new Date(contract.startDate);
          const endDate = new Date(contract.endDate);
          expect(startDate).toBeGreaterThanOrEqual(new Date('2025-01-01'));
          expect(endDate).toBeLessThanOrEqual(new Date('2025-06-30'));
        });
      });

      it('should provide contract summary statistics', async () => {
        const response = await request(app)
          .get('/api/contracts?includeSummary=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary).toHaveProperty('totalContracts');
        expect(response.body.summary).toHaveProperty('totalValue');
        expect(response.body.summary).toHaveProperty('statusBreakdown');
        expect(response.body.summary).toHaveProperty('typeBreakdown');
        expect(response.body.summary).toHaveProperty('upcomingRenewals');
      });

      it('should include contract performance metrics', async () => {
        const response = await request(app)
          .get('/api/contracts?includeMetrics=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each contract should have performance metrics
        response.body.data.forEach(contract => {
          expect(contract).toHaveProperty('performanceMetrics');
          expect(contract.performanceMetrics).toHaveProperty('completionPercentage');
          expect(contract.performanceMetrics).toHaveProperty('milestoneProgress');
          expect(contract.performanceMetrics).toHaveProperty('budgetUtilization');
        });
      });

      it('should search contracts by title or client name', async () => {
        const response = await request(app)
          .get('/api/contracts?search=Software')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned contracts should match search criteria
        response.body.data.forEach(contract => {
          const searchText = 'Software';
          const matchesTitle = contract.title.toLowerCase().includes(searchText.toLowerCase());
          const matchesClient = contract.clientName.toLowerCase().includes(searchText.toLowerCase());
          expect(matchesTitle || matchesClient).toBe(true);
        });
      });
    });

    describe('PUT /api/contracts/:id', () => {
      let createdContractId;

      beforeEach(async () => {
        const contract = new Contract({
          contractId: 'UPDATE-TEST',
          contractNumber: 'CTR-2025-UPDATE',
          title: 'Update Test Contract',
          clientId: 'CLT-UPDATE',
          clientName: 'Update Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-09-30',
          totalValue: 200000,
          currency: 'USD',
          isActive: true,
          assignedTo: 'Updater G',
          department: 'Testing'
        });
        const saved = await contract.save();
        createdContractId = saved._id;
      });

      it('should update contract properties', async () => {
        const updateData = {
          title: 'Updated Contract Title',
          totalValue: 250000,
          status: 'Active',
          assignedTo: 'Updated Manager H',
          priority: 'Critical'
        };

        const response = await request(app)
          .put(`/api/contracts/${createdContractId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updateData.title);
        expect(response.body.data.totalValue).toBe(updateData.totalValue);
        expect(response.body.data.status).toBe(updateData.status);
        expect(response.body.data.assignedTo).toBe(updateData.assignedTo);
      });

      it('should prevent changing contract ID after creation', async () => {
        const updateData = {
          contractId: 'NEW-CONTRACT-ID'
        };

        const response = await request(app)
          .put(`/api/contracts/${createdContractId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('contractId cannot be changed');
      });

      it('should validate status transitions', async () => {
        const updateData = {
          status: 'Terminated'
        };

        const response = await request(app)
          .put(`/api/contracts/${createdContractId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('invalid status transition');
      });

      it('should update contract terms and conditions', async () => {
        const updateData = {
          terms: {
            scope: 'Updated scope definition',
            deliverables: ['Updated deliverable 1', 'Updated deliverable 2'],
            acceptanceCriteria: 'Updated acceptance criteria',
            warranty: 'Updated warranty terms'
          }
        };

        const response = await request(app)
          .put(`/api/contracts/${createdContractId}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.terms.scope).toBe(updateData.terms.scope);
        expect(response.body.data.terms.deliverables).toHaveLength(2);
      });
    });

    describe('DELETE /api/contracts/:id', () => {
      let contractToDelete;

      beforeEach(async () => {
        const contract = new Contract({
          contractId: 'DELETE-TEST',
          contractNumber: 'CTR-2025-DELETE',
          title: 'Delete Test Contract',
          clientId: 'CLT-DELETE',
          clientName: 'Delete Test Client',
          contractType: 'Fixed Price',
          status: 'Draft',
          startDate: '2025-03-01',
          endDate: '2025-06-30',
          totalValue: 100000,
          currency: 'USD',
          isActive: true,
          assignedTo: 'Deleter I',
          department: 'Testing'
        });
        const saved = await contract.save();
        contractToDelete = saved._id;
      });

      it('should soft delete contract by default', async () => {
        const response = await request(app)
          .delete(`/api/contracts/${contractToDelete}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      });

      it('should hard delete when explicitly requested', async () => {
        const response = await request(app)
          .delete(`/api/contracts/${contractToDelete}?hardDelete=true`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        
        // Verify it's completely removed
        const deleted = await Contract.findById(contractToDelete);
        expect(deleted).toBeNull();
      });

      it('should prevent deletion if contract has active milestones', async () => {
        // Create a milestone for this contract
        const milestone = new Milestone({
          contractId: 'DELETE-TEST',
          milestoneId: 'MS-DELETE-TEST',
          title: 'Delete Test Milestone',
          targetDate: '2025-04-30',
          value: 50000,
          percentage: 50,
          status: 'In Progress',
          isActive: true
        });
        await milestone.save();

        const response = await request(app)
          .delete(`/api/contracts/${contractToDelete}`)
          .set('Authorization', authToken)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('active milestones');
      });
    });
  });

  describe('Contract Amendments', () => {
    describe('POST /api/contracts/:id/amendments', () => {
      it('should create contract amendment', async () => {
        const amendmentData = {
          amendmentNumber: 'AMD-003',
          amendmentDate: '2025-01-30',
          type: 'Timeline Extension',
          description: 'Extend project timeline due to scope changes',
          impactAnalysis: {
            valueChange: 25000,
            timelineChange: '1 month extension',
            resourceChange: '1 additional resource'
          },
          requestedBy: 'Project Manager',
          justification: 'Additional features requested by client'
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/amendments')
          .set('Authorization', authToken)
          .send(amendmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.amendmentNumber).toBe(amendmentData.amendmentNumber);
        expect(response.body.data.type).toBe(amendmentData.type);
        expect(response.body.data.status).toBe('Pending Approval');
      });

      it('should validate amendment date against contract period', async () => {
        const amendmentData = {
          amendmentNumber: 'AMD-INVALID',
          amendmentDate: '2024-12-01', // Before contract start
          type: 'Price Change',
          description: 'Invalid date test',
          impactAnalysis: {
            valueChange: 10000,
            timelineChange: 'No change',
            resourceChange: 'No change'
          }
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/amendments')
          .set('Authorization', authToken)
          .send(amendmentData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('amendment date must be within contract period');
      });

      it('should ensure unique amendment numbers', async () => {
        const amendmentData = {
          amendmentNumber: 'AMD-001', // Existing amendment number
          amendmentDate: '2025-01-30',
          type: 'Scope Change',
          description: 'Duplicate amendment test',
          impactAnalysis: {
            valueChange: 5000,
            timelineChange: 'No change',
            resourceChange: 'No change'
          }
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/amendments')
          .set('Authorization', authToken)
          .send(amendmentData)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should calculate impact on contract totals', async () => {
        const amendmentData = {
          amendmentNumber: 'AMD-CALCULATION',
          amendmentDate: '2025-01-30',
          type: 'Value Increase',
          description: 'Value increase amendment',
          impactAnalysis: {
            valueChange: 50000, // Increase by 50,000
            timelineChange: 'No change',
            resourceChange: 'No change'
          }
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/amendments')
          .set('Authorization', authToken)
          .send(amendmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.originalValue).toBe(500000); // Original contract value
        expect(response.body.data.newValue).toBe(550000); // Original + amendment
        expect(response.body.data.changePercentage).toBe(10); // (50000/500000)*100
      });
    });

    describe('GET /api/contracts/:id/amendments', () => {
      it('should retrieve all amendments for a contract', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/amendments')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All amendments should be for CNT-001
        response.body.data.forEach(amendment => {
          expect(amendment.contractId).toBe('CNT-001');
        });
      });

      it('should filter amendments by status', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/amendments?status=Pending')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned amendments should be Pending
        response.body.data.forEach(amendment => {
          expect(amendment.status).toBe('Pending');
        });
      });

      it('should include amendment timeline', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/amendments?includeTimeline=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each amendment should have timeline
        response.body.data.forEach(amendment => {
          expect(amendment).toHaveProperty('timeline');
          expect(amendment.timeline).toHaveProperty('requested');
          expect(amendment.timeline).toHaveProperty('approved');
          expect(amendment.timeline).toHaveProperty('implemented');
        });
      });
    });

    describe('PUT /api/contracts/:id/amendments/:amendmentId', () => {
      it('should approve/reject amendment', async () => {
        const statusUpdate = {
          status: 'Approved',
          approvedBy: 'Legal Manager',
          approvalDate: '2025-02-01',
          approvalComments: 'Approved with conditions',
          implementationDate: '2025-02-15'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/amendments/AMD-002')
          .set('Authorization', authToken)
          .send(statusUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(statusUpdate.status);
        expect(response.body.data.approvedBy).toBe(statusUpdate.approvedBy);
        expect(response.body.data.implementationDate).toBe(statusUpdate.implementationDate);
      });

      it('should prevent status changes for implemented amendments', async () => {
        // First implement an amendment
        await request(app)
          .put('/api/contracts/CNT-001/amendments/AMD-001')
          .set('Authorization', authToken)
          .send({
            status: 'Implemented',
            implementationDate: '2025-02-01'
          })
          .expect(200);

        // Try to change status of implemented amendment
        const statusUpdate = {
          status: 'Rejected'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/amendments/AMD-001')
          .set('Authorization', authToken)
          .send(statusUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot be modified after implementation');
      });
    });
  });

  describe('Milestone Management', () => {
    describe('POST /api/contracts/:id/milestones', () => {
      it('should create milestone for contract', async () => {
        const milestoneData = {
          milestoneId: 'MS-NEW-001',
          title: 'Phase 1 Complete',
          description: 'First development phase completion',
          targetDate: '2025-04-15',
          value: 75000,
          percentage: 15,
          deliverables: ['Code module 1', 'Documentation', 'Test cases'],
          acceptanceCriteria: 'Code review approval and testing completion',
          dependencies: [],
          isBillable: true,
          priority: 'High'
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/milestones')
          .set('Authorization', authToken)
          .send(milestoneData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.milestoneId).toBe(milestoneData.milestoneId);
        expect(response.body.data.value).toBe(milestoneData.value);
        expect(response.body.data.percentage).toBe(milestoneData.percentage);
        expect(response.body.data.contractId).toBe('CNT-001');
      });

      it('should validate milestone percentages sum correctly', async () => {
        const milestoneData = {
          milestoneId: 'MS-PERCENT-TEST',
          title: 'Percentage Test Milestone',
          targetDate: '2025-05-15',
          value: 50000,
          percentage: 25, // This would make total exceed 100%
          isBillable: true
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/milestones')
          .set('Authorization', authToken)
          .send(milestoneData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('total percentage cannot exceed 100%');
      });

      it('should validate milestone date against contract period', async () => {
        const milestoneData = {
          milestoneId: 'MS-DATE-TEST',
          title: 'Date Validation Test',
          targetDate: '2026-01-01', // After contract end date
          value: 25000,
          percentage: 5,
          isBillable: true
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/milestones')
          .set('Authorization', authToken)
          .send(milestoneData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('target date must be within contract period');
      });

      it('should validate milestone dependencies', async () => {
        const milestoneData = {
          milestoneId: 'MS-DEPENDENCY-TEST',
          title: 'Dependency Test Milestone',
          targetDate: '2025-06-15',
          value: 40000,
          percentage: 8,
          dependencies: ['NON-EXISTENT-MILESTONE'], // Invalid dependency
          isBillable: true
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/milestones')
          .set('Authorization', authToken)
          .send(milestoneData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('dependency does not exist');
      });
    });

    describe('GET /api/contracts/:id/milestones', () => {
      it('should retrieve milestones by status', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/milestones?status=In Progress')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned milestones should be In Progress
        response.body.data.forEach(milestone => {
          expect(milestone.status).toBe('In Progress');
        });
      });

      it('should provide milestone progress tracking', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/milestones?includeProgress=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each milestone should have progress information
        response.body.data.forEach(milestone => {
          expect(milestone).toHaveProperty('progress');
          expect(milestone.progress).toHaveProperty('percentageComplete');
          expect(milestone.progress).toHaveProperty('daysRemaining');
          expect(milestone.progress).toHaveProperty('isOnTrack');
        });
      });

      it('should include milestone risk assessment', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/milestones?includeRisk=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each milestone should have risk assessment
        response.body.data.forEach(milestone => {
          expect(milestone).toHaveProperty('riskAssessment');
          expect(milestone.riskAssessment).toHaveProperty('riskLevel');
          expect(milestone.riskAssessment).toHaveProperty('riskFactors');
          expect(milestone.riskAssessment).toHaveProperty('mitigationPlans');
        });
      });
    });

    describe('PUT /api/contracts/:id/milestones/:milestoneId', () => {
      it('should update milestone completion status', async () => {
        const updateData = {
          status: 'Completed',
          completionDate: '2025-02-25',
          actualValue: 48000,
          completionNotes: 'Completed ahead of schedule with minor deviations'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/milestones/MS-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(updateData.status);
        expect(response.body.data.completionDate).toBe(updateData.completionDate);
        expect(response.body.data.actualValue).toBe(updateData.actualValue);
      });

      it('should validate completion data', async () => {
        const updateData = {
          status: 'Completed',
          completionDate: '2025-03-01', // After target date
          actualValue: 100000 // Exceeds planned value
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/milestones/MS-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('completionWarnings');
        expect(response.body.data.completionWarnings).toContain('completed after target date');
        expect(response.body.data.completionWarnings).toContain('actual value exceeds planned value');
      });

      it('should trigger billing schedule generation on completion', async () => {
        const updateData = {
          status: 'Completed',
          completionDate: '2025-02-28',
          actualValue: 50000,
          triggerBilling: true
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/milestones/MS-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('billingTriggered');
        expect(response.body.data.billingTriggered).toBe(true);
        expect(response.body.data).toHaveProperty('billingScheduleId');
      });
    });
  });

  describe('Billing Schedule Management', () => {
    describe('POST /api/contracts/:id/billing-schedules', () => {
      it('should create billing schedule for contract', async () => {
        const billingScheduleData = {
          scheduleId: 'BIL-NEW-001',
          billingDate: '2025-03-15',
          amount: 75000,
          currency: 'USD',
          description: 'Phase 1 milestone billing',
          milestoneId: 'MS-001',
          paymentTerms: 'Net 30',
          taxApplicable: true,
          taxRate: 8.25,
          billingType: 'Milestone',
          priority: 'High'
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/billing-schedules')
          .set('Authorization', authToken)
          .send(billingScheduleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.scheduleId).toBe(billingScheduleData.scheduleId);
        expect(response.body.data.amount).toBe(billingScheduleData.amount);
        expect(response.body.data.billingDate).toBe(billingScheduleData.billingDate);
        expect(response.body.data.contractId).toBe('CNT-001');
      });

      it('should create recurring billing schedule', async () => {
        const billingScheduleData = {
          scheduleId: 'BIL-RECUR-001',
          billingType: 'Recurring',
          frequency: 'Monthly',
          startDate: '2025-03-01',
          endDate: '2025-12-31',
          amount: 10000,
          currency: 'USD',
          description: 'Monthly maintenance billing',
          paymentTerms: 'Net 15',
          taxApplicable: true,
          taxRate: 8.25
        };

        const response = await request(app)
          .post('/api/contracts/CNT-003/billing-schedules')
          .set('Authorization', authToken)
          .send(billingScheduleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.billingType).toBe('Recurring');
        expect(response.body.data.frequency).toBe('Monthly');
        expect(response.body.data).toHaveProperty('recurringSchedule');
      });

      it('should validate billing date against contract period', async () => {
        const billingScheduleData = {
          scheduleId: 'BIL-INVALID-DATE',
          billingDate: '2026-02-01', // After contract end
          amount: 25000,
          description: 'Invalid date test',
          isActive: true
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/billing-schedules')
          .set('Authorization', authToken)
          .send(billingScheduleData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('billing date must be within contract period');
      });

      it('should calculate tax automatically', async () => {
        const billingScheduleData = {
          scheduleId: 'BIL-TAX-CALC',
          billingDate: '2025-03-15',
          amount: 50000,
          currency: 'USD',
          description: 'Tax calculation test',
          taxApplicable: true,
          taxRate: 8.25,
          calculateTax: true
        };

        const response = await request(app)
          .post('/api/contracts/CNT-001/billing-schedules')
          .set('Authorization', authToken)
          .send(billingScheduleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.taxAmount).toBeCloseTo(4125, 2); // 50000 * 8.25%
        expect(response.body.data.totalAmount).toBeCloseTo(54125, 2); // 50000 + 4125
      });
    });

    describe('GET /api/contracts/:id/billing-schedules', () => {
      it('should filter billing schedules by status', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/billing-schedules?status=Pending')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned schedules should be Pending
        response.body.data.forEach(schedule => {
          expect(schedule.status).toBe('Pending');
        });
      });

      it('should provide upcoming billing reminders', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/billing-schedules?upcoming=true&days=30')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // All returned schedules should be within 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        response.body.data.forEach(schedule => {
          const billingDate = new Date(schedule.billingDate);
          expect(billingDate).toBeGreaterThanOrEqual(today);
          expect(billingDate).toBeLessThanOrEqual(thirtyDaysFromNow);
        });
      });

      it('should include payment tracking information', async () => {
        const response = await request(app)
          .get('/api/contracts/CNT-001/billing-schedules?includePaymentTracking=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        
        // Each schedule should have payment tracking
        response.body.data.forEach(schedule => {
          expect(schedule).toHaveProperty('paymentTracking');
          expect(schedule.paymentTracking).toHaveProperty('isOverdue');
          expect(schedule.paymentTracking).toHaveProperty('daysOverdue');
          expect(schedule.paymentTracking).toHaveProperty('paymentStatus');
        });
      });
    });

    describe('PUT /api/contracts/:id/billing-schedules/:scheduleId', () => {
      it('should update billing schedule status', async () => {
        const updateData = {
          status: 'Invoiced',
          invoiceNumber: 'INV-2025-020',
          invoiceDate: '2025-02-28',
          dueDate: '2025-03-30'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/billing-schedules/BIL-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(updateData.status);
        expect(response.body.data.invoiceNumber).toBe(updateData.invoiceNumber);
        expect(response.body.data.invoiceDate).toBe(updateData.invoiceDate);
      });

      it('should handle payment receipt updates', async () => {
        const updateData = {
          status: 'Paid',
          paymentDate: '2025-03-15',
          paymentAmount: 54125,
          paymentMethod: 'Bank Transfer',
          paymentReference: 'TRF-2025-001'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/billing-schedules/BIL-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe(updateData.status);
        expect(response.body.data.paymentDate).toBe(updateData.paymentDate);
        expect(response.body.data.paymentReference).toBe(updateData.paymentReference);
      });

      it('should prevent modification of paid schedules', async () => {
        // First mark as paid
        await request(app)
          .put('/api/contracts/CNT-001/billing-schedules/BIL-001')
          .set('Authorization', authToken)
          .send({
            status: 'Paid',
            paymentDate: '2025-03-15',
            paymentAmount: 54125
          })
          .expect(200);

        // Try to modify paid schedule
        const updateData = {
          amount: 60000,
          description: 'Modified after payment'
        };

        const response = await request(app)
          .put('/api/contracts/CNT-001/billing-schedules/BIL-001')
          .set('Authorization', authToken)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('cannot modify paid schedule');
      });
    });
  });

  describe('Contract Reporting and Analytics', () => {
    describe('GET /api/contracts/reports/performance', () => {
      it('should generate contract performance report', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/performance?period=2025-Q1')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('overallPerformance');
        expect(response.body.data).toHaveProperty('contractMetrics');
        expect(response.body.data).toHaveProperty('milestoneProgress');
        expect(response.body.data).toHaveProperty('financialPerformance');
        expect(response.body.data.overallPerformance).toHaveProperty('completionRate');
        expect(response.body.data.overallPerformance).toHaveProperty('onTimeDelivery');
        expect(response.body.data.overallPerformance).toHaveProperty('clientSatisfaction');
      });

      it('should provide contract profitability analysis', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/performance?analysis=profitability')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('profitabilityAnalysis');
        expect(response.body.data.profitabilityAnalysis).toHaveProperty('grossMargin');
        expect(response.body.data.profitabilityAnalysis).toHaveProperty('netMargin');
        expect(response.body.data.profitabilityAnalysis).toHaveProperty('costBreakdown');
        expect(response.body.data.profitabilityAnalysis).toHaveProperty('profitTrends');
      });

      it('should include risk assessment in performance report', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/performance?includeRisk=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('riskAssessment');
        expect(response.body.data.riskAssessment).toHaveProperty('highRiskContracts');
        expect(response.body.data.riskAssessment).toHaveProperty('riskFactors');
        expect(response.body.data.riskAssessment).toHaveProperty('mitigationStrategies');
      });
    });

    describe('GET /api/contracts/reports/financial', () => {
      it('should generate contract financial summary', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/financial?period=2025-01')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalContractValue');
        expect(response.body.data).toHaveProperty('recognizedRevenue');
        expect(response.body.data).toHaveProperty('pendingRevenue');
        expect(response.body.data).toHaveProperty('cashFlow');
        expect(response.body.data).toHaveProperty('accountsReceivable');
      });

      it('should provide revenue recognition analysis', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/financial?analysis=revenue-recognition')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('revenueRecognition');
        expect(response.body.data.revenueRecognition).toHaveProperty('earnedRevenue');
        expect(response.body.data.revenueRecognition).toHaveProperty('deferredRevenue');
        expect(response.body.data.revenueRecognition).toHaveProperty('recognitionMethod');
        expect(response.body.data.revenueRecognition).toHaveProperty('performanceObligations');
      });

      it('should include billing and collection metrics', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/financial?includeCollections=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('billingMetrics');
        expect(response.body.data).toHaveProperty('collectionMetrics');
        expect(response.body.data.billingMetrics).toHaveProperty('totalInvoiced');
        expect(response.body.data.billingMetrics).toHaveProperty('collectionRate');
        expect(response.body.data.collectionMetrics).toHaveProperty('averageCollectionPeriod');
      });
    });

    describe('GET /api/contracts/reports/client-analysis', () => {
      it('should analyze contract performance by client', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/client-analysis?clientId=CLT-001')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('clientMetrics');
        expect(response.body.data).toHaveProperty('contractHistory');
        expect(response.body.data).toHaveProperty('performanceTrends');
        expect(response.body.data.clientMetrics).toHaveProperty('totalContracts');
        expect(response.body.data.clientMetrics).toHaveProperty('totalValue');
        expect(response.body.data.clientMetrics).toHaveProperty('averageContractValue');
      });

      it('should identify client risk factors', async () => {
        const response = await request(app)
          .get('/api/contracts/reports/client-analysis?includeRisk=true')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('clientRiskAnalysis');
        expect(response.body.data.clientRiskAnalysis).toHaveProperty('riskScore');
        expect(response.body.data.clientRiskAnalysis).toHaveProperty('riskFactors');
        expect(response.body.data.clientRiskAnalysis).toHaveProperty('recommendations');
      });
    });
  });

  describe('Contract Workflow and Automation', () => {
    describe('Contract Lifecycle Automation', () => {
      it('should trigger contract activation workflow', async () => {
        const activationData = {
          trigger: 'contract_approval',
          contractId: 'CNT-003',
          activationDate: '2025-02-01',
          autoCreateMilestones: true,
          autoCreateBilling: true,
          notifyStakeholders: true
        };

        const response = await request(app)
          .post('/api/contracts/workflow/activate')
          .set('Authorization', authToken)
          .send(activationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('milestonesCreated');
        expect(response.body.data).toHaveProperty('billingSchedulesCreated');
        expect(response.body.data).toHaveProperty('notificationsSent');
        expect(response.body.data.workflowStatus).toBe('Completed');
      });

      it('should handle contract renewal automation', async () => {
        const renewalData = {
          contractId: 'CNT-002',
          renewalType: 'automatic',
          renewalTerms: {
            duration: '12 months',
            valueIncrease: '5%',
            termsModification: ['Updated SLA', 'New support hours']
          },
          notificationDays: 60,
          approvalRequired: false
        };

        const response = await request(app)
          .post('/api/contracts/workflow/renew')
          .set('Authorization', authToken)
          .send(renewalData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('renewalContract');
        expect(response.body.data).toHaveProperty('renewalDate');
        expect(response.body.data).toHaveProperty('valueIncrease');
      });

      it('should trigger escalation for at-risk contracts', async () => {
        const escalationData = {
          trigger: 'milestone_delay',
          contractId: 'CNT-001',
          delayDays: 15,
          escalationLevel: 'manager',
          includeMitigationPlan: true,
          notifyClient: true
        };

        const response = await request(app)
          .post('/api/contracts/workflow/escalate')
          .set('Authorization', authToken)
          .send(escalationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('escalationLevel');
        expect(response.body.data).toHaveProperty('mitigationPlan');
        expect(response.body.data).toHaveProperty('notificationStatus');
        expect(response.body.data.escalationStatus).toBe('Active');
      });
    });

    describe('Automated Billing Triggers', () => {
      it('should trigger billing on milestone completion', async () => {
        const billingTrigger = {
          trigger: 'milestone_completion',
          contractId: 'CNT-001',
          milestoneId: 'MS-001',
          billingType: 'milestone',
          autoGenerateInvoice: true,
          paymentTerms: 'Net 30',
          taxCalculation: true
        };

        const response = await request(app)
          .post('/api/contracts/workflow/trigger-billing')
          .set('Authorization', authToken)
          .send(billingTrigger)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('billingSchedule');
        expect(response.body.data).toHaveProperty('invoiceGenerated');
        expect(response.body.data).toHaveProperty('clientNotification');
      });

      it('should handle recurring billing automation', async () => {
        const recurringTrigger = {
          trigger: 'recurring_billing',
          contractId: 'CNT-003',
          billingDate: '2025-03-01',
          autoProcess: true,
          sendInvoice: true,
          followUpAction: 'payment_reminder'
        };

        const response = await request(app)
          .post('/api/contracts/workflow/recurring-billing')
          .set('Authorization', authToken)
          .send(recurringTrigger)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('billingProcessed');
        expect(response.body.data).toHaveProperty('invoiceSent');
        expect(response.body.data).toHaveProperty('nextBillingDate');
      });
    });

    describe('Alert and Notification System', () => {
      it('should generate alerts for upcoming contract deadlines', async () => {
        const alertRequest = {
          alertType: 'contract_expiry',
          daysAhead: 30,
          includeRenewalOptions: true,
          notificationMethods: ['email', 'dashboard']
        };

        const response = await request(app)
          .post('/api/contracts/alerts/generate')
          .set('Authorization', authToken)
          .send(alertRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('alerts');
        expect(response.body.data).toHaveProperty('summary');
        expect(response.body.data.alerts).toBeInstanceOf(Array);
        
        response.body.data.alerts.forEach(alert => {
          expect(alert).toHaveProperty('contractId');
          expect(alert).toHaveProperty('daysToExpiry');
          expect(alert).toHaveProperty('priority');
        });
      });

      it('should notify about milestone risks and delays', async () => {
        const alertRequest = {
          alertType: 'milestone_risk',
          riskThreshold: 5, // days
          includeRecommendations: true,
          escalationRules: {
            minor: 'team_lead',
            major: 'project_manager',
            critical: 'director'
          }
        };

        const response = await request(app)
          .post('/api/contracts/alerts/milestone-risks')
          .set('Authorization', authToken)
          .send(alertRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('riskAlerts');
        expect(response.body.data).toHaveProperty('recommendations');
        expect(response.body.data.riskAlerts).toBeInstanceOf(Array);
      });
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      // Create large dataset for performance testing
      const contracts = [];
      const milestones = [];
      const billingSchedules = [];

      for (let i = 0; i < 200; i++) {
        contracts.push({
          contractId: `PERF-CNT-${i.toString().padStart(3, '0')}`,
          contractNumber: `CTR-PERF-${i.toString().padStart(3, '0')}`,
          title: `Performance Contract ${i}`,
          clientId: `PERF-CLT-${i.toString().padStart(3, '0')}`,
          clientName: `Performance Client ${i}`,
          contractType: ['Fixed Price', 'Time & Materials', 'Recurring'][i % 3],
          status: ['Draft', 'Active', 'Completed'][i % 3],
          startDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
          endDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-28`,
          totalValue: 100000 + (i * 1000),
          currency: 'USD',
          assignedTo: `Manager ${i}`,
          department: ['Development', 'Consulting', 'Support'][i % 3],
          isActive: true,
          autoRenew: i % 4 === 0
        });

        // Create milestones for each contract
        for (let j = 0; j < 3; j++) {
          milestones.push({
            contractId: `PERF-CNT-${i.toString().padStart(3, '0')}`,
            milestoneId: `MS-PERF-${i.toString().padStart(3, '0')}-${j}`,
            title: `Milestone ${j + 1} for Contract ${i}`,
            targetDate: `2025-${String((j + 1) * 2).padStart(2, '0')}-15`,
            value: (100000 + (i * 1000)) * 0.3,
            percentage: 30,
            status: ['Not Started', 'In Progress', 'Completed'][j % 3],
            isBillable: true,
            isActive: true
          });

          // Create billing schedules
          billingSchedules.push({
            contractId: `PERF-CNT-${i.toString().padStart(3, '0')}`,
            scheduleId: `BIL-PERF-${i.toString().padStart(3, '0')}-${j}`,
            billingDate: `2025-${String((j + 1) * 2).padStart(2, '0')}-28`,
            amount: (100000 + (i * 1000)) * 0.3,
            currency: 'USD',
            description: `Billing ${j + 1} for contract ${i}`,
            status: ['Pending', 'Invoiced', 'Paid'][j % 3],
            dueDate: `2025-${String((j + 1) * 2).padStart(2, '0')}-28`,
            paymentTerms: 'Net 30',
            taxApplicable: true,
            isActive: true
          });
        }
      }

      await Contract.insertMany(contracts);
      await Milestone.insertMany(milestones);
      await BillingSchedule.insertMany(billingSchedules);
    });

    it('should handle large contract queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/contracts?limit=50&page=1&includeSummary=true')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(50);
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    });

    it('should efficiently process complex contract reports', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/contracts/reports/performance?period=2025-Q1&includeDetails=true&analysis=comprehensive')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(10000); // Complex reports should complete within 10 seconds
    });

    it('should maintain performance with bulk milestone updates', async () => {
      const startTime = Date.now();
      
      const bulkUpdateRequest = {
        updates: Array.from({length: 50}, (_, i) => ({
          contractId: `PERF-CNT-${i.toString().padStart(3, '0')}`,
          milestoneId: `MS-PERF-${i.toString().padStart(3, '0')}-0`,
          status: 'Completed',
          completionDate: '2025-02-15'
        })),
        batchSize: 10
      };

      const response = await request(app)
        .put('/api/contracts/milestones/bulk-update')
        .set('Authorization', authToken)
        .send(bulkUpdateRequest)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data.processed).toBe(50);
      expect(responseTime).toBeLessThan(15000); // Should handle bulk updates within 15 seconds
    });
  });

  describe('Security and Authorization', () => {
    it('should require authentication for contract operations', async () => {
      const contractData = {
        contractId: 'SEC-TEST',
        contractNumber: 'CTR-SEC-001',
        title: 'Security Test Contract',
        clientId: 'SEC-CLT',
        clientName: 'Security Test Client',
        contractType: 'Fixed Price',
        status: 'Draft',
        startDate: '2025-03-01',
        endDate: '2025-06-30',
        totalValue: 100000,
        currency: 'USD'
      };

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate user permissions for contract modifications', async () => {
      // Mock user with limited permissions
      jest.spyOn(require('../middleware/auth'), 'authenticate')
        .mockImplementation((req, res, next) => {
          req.user = { id: 'limited-user', role: 'viewer' };
          next();
        });

      const updateData = {
        title: 'Unauthorized Update',
        totalValue: 200000
      };

      const response = await request(app)
        .put('/api/contracts/CNT-001')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient permissions');
    });

    it('should sanitize contract data to prevent injection', async () => {
      const maliciousData = {
        contractId: 'MALICIOUS<script>alert("xss")</script>',
        contractNumber: 'CTR-MALICIOUS<script>alert("xss")</script>',
        title: 'Malicious Contract<script>alert("xss")</script>',
        clientName: 'Client<script>alert("xss")</script>',
        description: 'Description<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', authToken)
        .send(maliciousData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify data is sanitized
      expect(response.body.data.contractId).not.toContain('<script>');
      expect(response.body.data.contractNumber).not.toContain('<script>');
      expect(response.body.data.title).not.toContain('<script>');
      expect(response.body.data.clientName).not.toContain('<script>');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing contracts gracefully', async () => {
      const response = await request(app)
        .get('/api/contracts?clientId=NON-EXISTENT')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle invalid milestone dependencies', async () => {
      const milestoneData = {
        milestoneId: 'MS-CIRCULAR-TEST',
        title: 'Circular Dependency Test',
        targetDate: '2025-05-15',
        value: 30000,
        percentage: 6,
        dependencies: ['MS-001', 'MS-002'],
        isBillable: true
      };

      // First create MS-002 with dependency on MS-CIRCULAR-TEST to create circular reference
      const response = await request(app)
        .post('/api/contracts/CNT-001/milestones')
        .set('Authorization', authToken)
        .send(milestoneData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('circular dependency');
    });

    it('should validate billing schedule amounts', async () => {
      const billingScheduleData = {
        scheduleId: 'BIL-VALIDATION-TEST',
        billingDate: '2025-03-15',
        amount: 0, // Zero amount
        description: 'Zero amount test',
        isActive: true
      };

      const response = await request(app)
        .post('/api/contracts/CNT-001/billing-schedules')
        .set('Authorization', authToken)
        .send(billingScheduleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('amount must be greater than 0');
    });

    it('should handle contract amendment conflicts', async () => {
      const amendmentData = {
        amendmentNumber: 'AMD-CONFLICT-TEST',
        amendmentDate: '2025-01-30',
        type: 'Value Change',
        description: 'Value decrease conflicting with previous amendment',
        impactAnalysis: {
          valueChange: -100000, // Large decrease conflicting with previous increase
          timelineChange: 'No change',
          resourceChange: 'No change'
        }
      };

      const response = await request(app)
        .post('/api/contracts/CNT-001/amendments')
        .set('Authorization', authToken)
        .send(amendmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('conflicting amendment');
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain referential integrity for milestones', async () => {
      // Create milestone first
      const milestone = new Milestone({
        contractId: 'REF-TEST-CNT',
        milestoneId: 'REF-TEST-MS',
        title: 'Referential Integrity Test',
        targetDate: '2025-04-30',
        value: 25000,
        percentage: 25,
        status: 'Not Started',
        isActive: true
      });
      await milestone.save();

      // Try to delete the contract
      const response = await request(app)
        .delete('/api/contracts/REF-TEST-CNT?hardDelete=true')
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('referenced by milestones');
    });

    it('should validate milestone and billing schedule alignment', async () => {
      const milestoneData = {
        milestoneId: 'MS-ALIGN-TEST',
        title: 'Alignment Test Milestone',
        targetDate: '2025-04-30',
        value: 75000,
        percentage: 15,
        isBillable: true,
        createBilling: true
      };

      const response = await request(app)
        .post('/api/contracts/CNT-001/milestones')
        .set('Authorization', authToken)
        .send(milestoneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('billingScheduleCreated');
      expect(response.body.data.billingScheduleCreated).toHaveProperty('amount', 75000);
      expect(response.body.data.billingScheduleCreated).toHaveProperty('billingDate');
    });

    it('should maintain audit trail for all contract operations', async () => {
      const contractData = {
        contractId: 'AUDIT-TEST',
        contractNumber: 'CTR-AUDIT-001',
        title: 'Audit Trail Test Contract',
        clientId: 'AUDIT-CLT',
        clientName: 'Audit Test Client',
        contractType: 'Fixed Price',
        status: 'Draft',
        startDate: '2025-03-01',
        endDate: '2025-06-30',
        totalValue: 150000,
        currency: 'USD'
      };

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', authToken)
        .send(contractData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.auditTrail).toBeDefined();
      expect(response.body.data.auditTrail).toHaveLength(1);
      expect(response.body.data.auditTrail[0]).toHaveProperty('action', 'created');
      expect(response.body.data.auditTrail[0]).toHaveProperty('timestamp');
      expect(response.body.data.auditTrail[0]).toHaveProperty('userId');
    });

    it('should validate contract value consistency across amendments', async () => {
      const amendmentData = {
        amendmentNumber: 'AMD-CONSISTENCY',
        amendmentDate: '2025-01-30',
        type: 'Value Adjustment',
        description: 'Value consistency test',
        impactAnalysis: {
          valueChange: 25000,
          timelineChange: 'No change',
          resourceChange: 'No change'
        }
      };

      const response = await request(app)
        .post('/api/contracts/CNT-001/amendments')
        .set('Authorization', authToken)
        .send(amendmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.originalValue).toBe(500000);
      expect(response.body.data.newValue).toBe(525000);
      expect(response.body.data.valueChange).toBe(25000);
      expect(response.body.data.consistencyCheck).toBe('Passed');
    });
  });

  describe('Integration with External Systems', () => {
    it('should sync with CRM systems for client data', async () => {
      const syncData = {
        source: 'crm_system',
        syncType: 'client_data',
        includeContracts: true,
        updateExisting: true
      };

      const response = await request(app)
        .post('/api/contracts/sync/crm')
        .set('Authorization', authToken)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('syncedClients');
      expect(response.body.data).toHaveProperty('updatedContracts');
      expect(response.body.data).toHaveProperty('conflicts');
    });

    it('should integrate with project management tools', async () => {
      const integrationData = {
        system: 'project_management',
        integrationType: 'milestone_sync',
        data: [
          {
            contractId: 'CNT-001',
            milestoneId: 'MS-001',
            projectTaskId: 'TASK-2025-001',
            startDate: '2025-02-01',
            estimatedHours: 200,
            assignedResources: ['Developer A', 'Developer B']
          }
        ]
      };

      const response = await request(app)
        .post('/api/contracts/integrations/project-management')
        .set('Authorization', authToken)
        .send(integrationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrated).toBe(1);
      expect(response.body.data.syncStatus).toBe('Completed');
    });

    it('should export contract data for legal review', async () => {
      const exportRequest = {
        format: 'pdf',
        contractId: 'CNT-001',
        includeAmendments: true,
        includeMilestones: true,
        includeBilling: true,
        legalReview: true,
        watermark: 'LEGAL REVIEW COPY'
      };

      const response = await request(app)
        .post('/api/contracts/export/legal-review')
        .set('Authorization', authToken)
        .send(exportRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('fileName');
      expect(response.body.data).toHaveProperty('downloadUrl');
      expect(response.body.data).toHaveProperty('fileSize');
      expect(response.body.data).toHaveProperty('expiryDate');
    });

    it('should integrate with accounting systems for revenue recognition', async () => {
      const integrationData = {
        system: 'accounting_software',
        integrationType: 'revenue_recognition',
        contractId: 'CNT-001',
        recognitionMethod: 'percentage_of_completion',
        performanceObligations: [
          {
            obligation: 'Requirements Analysis',
            percentage: 10,
            recognizedAmount: 50000
          },
          {
            obligation: 'System Design',
            percentage: 20,
            recognizedAmount: 100000
          }
        ]
      };

      const response = await request(app)
        .post('/api/contracts/integrations/revenue-recognition')
        .set('Authorization', authToken)
        .send(integrationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenueEntries');
      expect(response.body.data).toHaveProperty('deferredRevenue');
      expect(response.body.data.revenueEntries).toHaveLength(2);
    });
  });
});